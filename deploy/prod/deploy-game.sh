#!/usr/bin/env bash
# Deploy the fierymud-rs game server to prod: build LOCALLY (never on the 4-core / 3.9 GB prod host),
# upload a versioned release, verify it runs there, back up the DB, switch the `current` symlink,
# restart fieryNT, watch it for 2 minutes, and roll back automatically if it does not stay healthy.
#
# Run on minastirith (the build host), NOT on prod. Needs: ssh alias `fierymud`, rsync, jq, zig +
# cargo-zigbuild (~/.local/bin), the worktree below, and the local dev DB (compile-time sqlx checks).
#
# Usage:
#   deploy-game.sh <sha|ref> [options]
#   deploy-game.sh --rollback [release]        repoint `current` to `previous` (or the named release) + restart
#   deploy-game.sh --status                    show releases, unit ExecStart, players (no changes)
#   deploy-game.sh --health [secs]             run the post-restart health checks against the live server (read-only)
#   deploy-game.sh --backup                    take + verify a DB backup now (pre-game-manual-*.dump)
#
# Options:
#   --stage-only        build, upload and verify the binary on the host; do NOT switch or restart
#   --skip-tests        skip `cargo test` (fmt + clippy still run)
#   --force             restart even if players other than Strider/Chinok are online
#   --sql FILE...       apply SQL files (as postgres) after the backup and before the switch; each is re-run
#                       and the second run's change counts are printed (non-zero is informational)
#   --install-units     one-time: git pull --ff-only the kit on the host and run `sudo setup-root.sh units`
#                       so fieryNT's ExecStart points at /opt/NEXT/releases/current/mud-server
#   --ignore-schema     do not fail when the prod DB schema lacks something the dev DB (compile-time check) has
#   --allow-unpushed    allow a SHA that is not on origin/main
#   --no-backup         skip the pre-deploy pg_dump (not recommended)
#
# Build method: `cargo zigbuild --release --target x86_64-unknown-linux-gnu.2.39` (links against glibc 2.39 =
# prod's Ubuntu 24.04) in CARGO_TARGET_DIR slot-4. Dependencies are rustls (no openssl); mlua's Lua is vendored.
# sqlx: macros are checked online against the local dev DB (DATABASE_URL from fierymud-rs/.env, read-only);
# afterwards the dev and prod `information_schema.columns` are compared, so a binary built against a schema
# that prod does not have yet is refused (run `update.sh muditor` / --sql first). Override: --ignore-schema.
#
# Host layout (see docs/PROD.md):  /opt/NEXT/releases/<sha12>/mud-server, `current` and `previous` symlinks.
set -Eeuo pipefail

# ---- config (env overrides) -------------------------------------------------------------------------
HOST="${DEPLOY_HOST:-fierymud}"
WT="${DEPLOY_WORKTREE:-/home/strider/Code/mud/.worktrees/deploy-43e9086}"
TARGET_DIR="${DEPLOY_CARGO_TARGET_DIR:-/home/strider/Code/mud/.cargo-target/slot-4}"
ENV_FILE="${DEPLOY_ENV_FILE:-/home/strider/Code/mud/fierymud-rs/.env}"
ZIG_TARGET="x86_64-unknown-linux-gnu.2.39"
GLIBC_MAX="2.39"
REL=/opt/NEXT/releases
KEEP_RELEASES=3
KEEP_BACKUPS=10
HEALTH_SECS="${DEPLOY_HEALTH_SECS:-120}"
OK_PLAYERS_RE='^(strider|chinok)$'

# ---- args -------------------------------------------------------------------------------------------
HEALTH_ONLY_SECS=10
REF="" MODE=deploy ROLLBACK_TO="" STAGE_ONLY=0 SKIP_TESTS=0 FORCE=0 INSTALL_UNITS=0 IGNORE_SCHEMA=0
ALLOW_UNPUSHED=0 NO_BACKUP=0
SQL_FILES=()
usage() { sed -n '2,/^set -Eeuo/p' "$0" | sed '$d' | sed 's/^# \{0,1\}//'; }
while (($#)); do
  case "$1" in
    --stage-only) STAGE_ONLY=1 ;;
    --skip-tests) SKIP_TESTS=1 ;;
    --force) FORCE=1 ;;
    --install-units) INSTALL_UNITS=1 ;;
    --ignore-schema) IGNORE_SCHEMA=1 ;;
    --allow-unpushed) ALLOW_UNPUSHED=1 ;;
    --no-backup) NO_BACKUP=1 ;;
    --status) MODE=status ;;
    --health) MODE=health; if [[ ${2:-} =~ ^[0-9]+$ ]]; then HEALTH_ONLY_SECS="$2"; shift; fi ;;
    --backup) MODE=backup ;;
    --rollback) MODE=rollback; if [[ ${2:-} && $2 != -* ]]; then ROLLBACK_TO="$2"; shift; fi ;;
    --sql) shift; while (($#)) && [[ $1 != -* ]]; do SQL_FILES+=("$1"); shift; done; continue ;;
    -h|--help) usage; exit 0 ;;
    -*) echo "unknown option: $1" >&2; usage >&2; exit 2 ;;
    *) [[ -z $REF ]] || { echo "only one sha/ref allowed" >&2; exit 2; }; REF="$1" ;;
  esac
  shift
done
if [[ $MODE == deploy && -z $REF ]]; then usage >&2; exit 2; fi
for f in "${SQL_FILES[@]}"; do [[ -f $f ]] || { echo "SQL file not found: $f" >&2; exit 2; }; done
if [[ ${#SQL_FILES[@]} -gt 0 && $STAGE_ONLY -eq 1 ]]; then echo "--sql and --stage-only are mutually exclusive" >&2; exit 2; fi

# ---- helpers ----------------------------------------------------------------------------------------
T_START=$(date +%s)
say()  { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
step() { printf '\n== %s ==\n' "$*"; }
die()  { printf 'ERROR: %s\n' "$*" >&2; exit 1; }

exec 9>/tmp/deploy-game.lock
flock -n 9 || die "another deploy-game.sh is running (lock /tmp/deploy-game.lock)"

CTL="$(mktemp -d /tmp/dg-ssh.XXXXXX)"
SSH_OPTS=(-o BatchMode=yes -o ControlMaster=auto -o "ControlPath=$CTL/%C" -o ControlPersist=600
          -o ServerAliveInterval=15 -o ServerAliveCountMax=4 -o ConnectTimeout=20)
cleanup() { ssh "${SSH_OPTS[@]}" -O exit "$HOST" >/dev/null 2>&1 || true; rm -rf "$CTL"; }
trap cleanup EXIT

# One remote command, bounded. RT = seconds (default 180). Never leaves a background ssh behind.
rssh() { timeout "${RT:-180}" ssh "${SSH_OPTS[@]}" "$HOST" "$@"; }
# Remote bash script on stdin with positional args.
rbash() { local a; a="$(printf ' %q' "$@")"; RT="${RT:-180}" rssh "bash -s --$a"; }

# Admin API token stays inside the remote shell (never echoed). Prefix; append the curl args.
ADMIN_PRE='TOK=$(tr -d "\r\n" < /opt/NEXT/.secrets/admin_token); printf "header = \"Authorization: Bearer %s\"\n" "$TOK" | curl -s -m 10 -K - '
admin_get() { RT=30 rssh "$ADMIN_PRE http://127.0.0.1:8080$1"; }

CURRENT_SHA="" PREVIOUS_SHA="" BASE_PID="" BASE_NR=""
SUMMARY=()

load_release_state() {
  CURRENT_SHA="$(rssh "readlink $REL/current 2>/dev/null || true")"
  PREVIOUS_SHA="$(rssh "readlink $REL/previous 2>/dev/null || true")"
}

# ---- remote bits ------------------------------------------------------------------------------------
ensure_layout() {
  rbash <<'EOF'
set -euo pipefail
umask 027
REL=/opt/NEXT/releases
[ -d "$REL" ] || { mkdir "$REL"; chmod 2750 "$REL"; echo "created $REL"; }
# Seed: the first run adopts the binary built in place, so `current` always exists before the unit
# is switched to /opt/NEXT/releases/current/mud-server (a crash-restart mid-switch must still find a binary).
OLD=/opt/NEXT/fierymud-rs/target/release/mud-server
if [ ! -e "$REL/current" ] && [ -x "$OLD" ]; then
  seed="legacy-$(date -r "$OLD" +%Y%m%d-%H%M)"
  mkdir -p "$REL/$seed"
  cp -p "$OLD" "$REL/$seed/mud-server"
  chmod 750 "$REL/$seed" "$REL/$seed/mud-server"
  ln -sfn "$seed" "$REL/current.new" && mv -T "$REL/current.new" "$REL/current"
  echo "seeded $seed (copy of the in-place build) and pointed current at it"
fi
EOF
}

unit_execstart_ok() {
  local es
  es="$(rssh 'systemctl show -p ExecStart --value fieryNT; systemctl show -p NeedDaemonReload --value fieryNT' | tr '\n' ' ')"
  [[ $es == *"path=$REL/current/mud-server"* && $es != *" yes "* ]]
}

install_units() {
  step "install units on the host (one-time switch of ExecStart to $REL/current/mud-server)"
  rssh 'git -C /opt/NEXT/muditor pull --ff-only 2>&1 | tail -3'
  rssh 'grep -c "^ExecStart=/opt/NEXT/releases/current/mud-server$" /opt/NEXT/deploy/units/fieryNT.service' >/dev/null \
    || die "host kit's units/fieryNT.service does not use $REL/current/mud-server (push the kit first)"
  rssh 'sudo -n /opt/NEXT/deploy/setup-root.sh units 2>&1 | tail -8'
  unit_execstart_ok || die "unit still does not point at $REL/current/mud-server after setup-root.sh units"
  say "unit now runs $REL/current/mud-server (takes effect at the next restart)"
}

players_check() {
  step "players check"
  local json names others
  json="$(admin_get /api/admin/players)" || die "players endpoint unreachable"
  jq -e '.players' >/dev/null 2>&1 <<<"$json" || die "unexpected players response (admin API down or token rejected?)"
  names="$(jq -r '[.players[].name] | join(", ")' <<<"$json")"
  others="$(jq -r --arg re "$OK_PLAYERS_RE" '[.players[].name | select((ascii_downcase | test($re)) | not)] | join(", ")' <<<"$json")"
  say "online: ${names:-nobody}"
  if [[ -n $others ]]; then
    if ((FORCE)); then say "WARNING: players online ($others); continuing because of --force"
    else die "players other than Strider/Chinok are online ($others). Wait, ask the user, or pass --force."; fi
  fi
}

backup_db() {
  step "database backup"
  local name="pre-game-$SHORT-$(date +%Y%m%d-%H%M%S).dump"
  rbash "$name" "$KEEP_BACKUPS" <<'EOF'
set -euo pipefail
umask 077
name="$1"; keep="$2"; dir=/opt/NEXT/backups
PGPASSFILE=/opt/NEXT/.secrets/pgpass pg_dump -h 127.0.0.1 -U fierynext -Fc fierynext > "$dir/$name.part"
n=$(/usr/lib/postgresql/18/bin/pg_restore -l "$dir/$name.part" | grep -c . || true)
[ "$n" -gt 50 ] || { echo "backup looks wrong (pg_restore -l lists $n lines)"; rm -f "$dir/$name.part"; exit 1; }
mv "$dir/$name.part" "$dir/$name"
echo "backup $dir/$name ($(stat -c %s "$dir/$name") bytes, pg_restore -l: $n entries)"
# prune only our own pre-game-* dumps
ls -1t "$dir"/pre-game-*.dump 2>/dev/null | tail -n +$((keep + 1)) | while read -r f; do rm -f -- "$f"; echo "pruned $f"; done
EOF
  BACKUP_NAME="$name"
}

apply_sql() {
  step "SQL patches (${#SQL_FILES[@]})"
  local f out1 out2 n
  for f in "${SQL_FILES[@]}"; do
    say "applying $(basename "$f")"
    out1="$(RT=300 rssh 'sudo -n -u postgres psql -d fierynext -v ON_ERROR_STOP=1 -f -' < "$f" 2>&1)" \
      || { printf '%s\n' "$out1" | tail -20; die "SQL failed: $f (DB unchanged beyond what psql committed; backup: ${BACKUP_NAME:-none})"; }
    printf '%s\n' "$out1" | tail -8
    out2="$(RT=300 rssh 'sudo -n -u postgres psql -d fierynext -v ON_ERROR_STOP=1 -f -' < "$f" 2>&1)" \
      || die "SQL re-run failed: $f"
    n="$(grep -cE '^(INSERT 0 [1-9]|UPDATE [1-9]|DELETE [1-9])' <<<"$out2" || true)"
    if [[ $n -eq 0 ]]; then say "re-run of $(basename "$f"): 0 changes (idempotent)"
    else
      say "re-run of $(basename "$f"): $n statement(s) still changed rows (informational; DO blocks can legitimately do this):"
      grep -E '^(INSERT 0 [1-9]|UPDATE [1-9]|DELETE [1-9])' <<<"$out2" | head -10
    fi
    SUMMARY+=("sql: $(basename "$f") applied, re-run changes=$n")
  done
  say "reminder: objects created as postgres must be owned by fierynext (ALTER ... OWNER TO fierynext) or Prisma gets permission denied"
}

schema_check() {
  step "schema check (dev DB the binary was compiled against vs prod)"
  local q dev prod missing
  export LC_ALL=C
  q="SELECT table_name || '.' || column_name || ' ' || udt_name || ' ' || is_nullable FROM information_schema.columns WHERE table_schema = 'public' ORDER BY 1"
  dev="$(mktemp)"; prod="$(mktemp)"
  ( set -a; . "$ENV_FILE"; set +a; psql "$DATABASE_URL" -Atc "$q" ) | sort > "$dev"
  RT=60 rssh "PGPASSFILE=/opt/NEXT/.secrets/pgpass psql -h 127.0.0.1 -U fierynext -d fierynext -Atc \"$q\"" | sort > "$prod"
  [[ -s $dev && -s $prod ]] || { rm -f "$dev" "$prod"; die "could not read one of the schemas"; }
  missing="$(comm -23 "$dev" "$prod")"
  local n; n="$(grep -c . <<<"$missing" || true)"
  if [[ $n -eq 0 ]]; then
    say "prod has every dev column with the same type/nullability ($(wc -l < "$dev") columns)"
    SCHEMA_NOTE="schema: ok"
  else
    say "$n dev column(s) missing or different on prod:"
    head -30 <<<"$missing" | sed 's/^/    /'
    SCHEMA_NOTE="schema: $n dev columns missing/different on prod"
    if ((IGNORE_SCHEMA)) || ((STAGE_ONLY)); then say "continuing ($([[ $STAGE_ONLY -eq 1 ]] && echo stage-only || echo --ignore-schema))"
    else rm -f "$dev" "$prod"; die "refusing: prod schema is behind the schema this binary was built against. Run 'update.sh muditor' (prisma db push) or --sql first, or pass --ignore-schema."; fi
  fi
  rm -f "$dev" "$prod"
}

# Atomic symlink flip. Args: new release name. Records the old one as `previous`.
switch_to() {
  rbash "$1" <<'EOF'
set -euo pipefail
REL=/opt/NEXT/releases; new="$1"
[ -x "$REL/$new/mud-server" ] || { echo "release $new has no mud-server"; exit 1; }
old="$(readlink "$REL/current" 2>/dev/null || true)"
touch "$REL/$new"
if [ -n "$old" ] && [ "$old" != "$new" ]; then ln -sfn "$old" "$REL/previous.new" && mv -T "$REL/previous.new" "$REL/previous"; fi
ln -sfn "$new" "$REL/current.new" && mv -T "$REL/current.new" "$REL/current"
echo "current -> $new (previous -> ${old:-none})"
EOF
}

prune_releases() {
  rbash "$KEEP_RELEASES" <<'EOF'
set -euo pipefail
REL=/opt/NEXT/releases; keep="$1"
cur="$(readlink "$REL/current" || true)"; prev="$(readlink "$REL/previous" 2>/dev/null || true)"
find "$REL" -mindepth 1 -maxdepth 1 -type d ! -name '.*' -printf '%T@ %f\n' | sort -rn | cut -d' ' -f2 \
  | tail -n +$((keep + 1)) | while read -r d; do
    [ "$d" = "$cur" ] && continue
    [ "$d" = "$prev" ] && continue
    rm -rf -- "${REL:?}/$d"; echo "pruned release $d"
  done
EOF
}

# Restart fieryNT; sets RESTART_TS (host-local time, for journalctl --since).
restart_game() {
  RESTART_TS=""; BASE_PID=""; BASE_NR=""
  RESTART_TS="$(rssh "date '+%Y-%m-%d %H:%M:%S'")"
  RT=90 rssh 'sudo -n systemctl restart fieryNT' || return 1
  # Baseline taken right after the restart so a crash in the first seconds is not mistaken for the "normal" process.
  local base
  base="$(rssh 'systemctl show -p MainPID --value fieryNT; systemctl show -p NRestarts --value fieryNT' 2>/dev/null || true)"
  BASE_PID="$(sed -n 1p <<<"$base")"; BASE_NR="$(sed -n 2p <<<"$base")"
  say "restarted fieryNT (host time $RESTART_TS, MainPID ${BASE_PID:-?})"
}

# Health window. Returns 0 healthy, 1 not. Reasons to stderr/stdout.
health_check() {
  local want_secs="$1" t0 now line active pid nr st pid0="${BASE_PID:-}" nr0="${BASE_NR:-}" ok_status=0 fail="" sshfail=0
  t0=$(date +%s)
  step "health checks (${want_secs}s)"
  while :; do
    now=$(date +%s)
    line="$(RT=40 rssh 'TOK=$(tr -d "\r\n" < /opt/NEXT/.secrets/admin_token); st=$(printf "header = \"Authorization: Bearer %s\"\n" "$TOK" | curl -s -m 5 -o /dev/null -w "%{http_code}" -K - http://127.0.0.1:8080/api/admin/world/status); echo "active=$(systemctl is-active fieryNT) pid=$(systemctl show -p MainPID --value fieryNT) nr=$(systemctl show -p NRestarts --value fieryNT) status=$st"' 2>/dev/null || echo "active=ssh-failed pid=0 nr=0 status=000")"
    active="${line#active=}"; active="${active%% *}"
    pid="${line#*pid=}"; pid="${pid%% *}"
    nr="${line#*nr=}"; nr="${nr%% *}"
    st="${line##*status=}"
    if [[ $active == ssh-failed ]]; then
      sshfail=$((sshfail + 1))
      if ((sshfail >= 3)); then fail="lost ssh to the host 3 times in a row"; break; fi
      sleep 5; continue
    fi
    sshfail=0
    if [[ $active != active ]]; then
      # `activating` right after a restart is fine for a few seconds; anything else (failed, auto-restart) is not.
      if [[ $active == activating && $((now - t0)) -lt 20 ]]; then :
      else fail="unit is '$active' at +$((now - t0))s"; break; fi
    else
      if [[ -z $pid0 || $pid0 == 0 ]]; then pid0="$pid"; nr0="$nr"; fi
      if [[ $pid != "$pid0" ]]; then fail="crash loop: MainPID changed $pid0 -> $pid at +$((now - t0))s"; break; fi
      if [[ $nr != "$nr0" ]]; then fail="crash loop: NRestarts $nr0 -> $nr at +$((now - t0))s"; break; fi
      if [[ $st == 200 ]]; then
        if ((ok_status == 0)); then say "world/status OK at +$((now - t0))s"; fi
        ok_status=1
      elif ((ok_status == 1)); then fail="world/status returned $st after having been OK (+$((now - t0))s)"; break
      fi
    fi
    if ((now - t0 >= want_secs)); then break; fi
    sleep 5
  done
  if [[ -z $fail && $ok_status -eq 0 ]]; then fail="world/status never returned 200 within ${want_secs}s"; fi
  if [[ -z $fail ]]; then
    st="$(RT=30 rssh 'curl -s -m 5 -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/api/admin/world/status' || true)"
    [[ $st == 401 ]] && say "admin API without token: 401 (good)" || fail="admin API without token returned '$st', expected 401"
  fi
  if [[ -z $fail ]]; then
    local bad
    bad="$(rbash "$RESTART_TS" <<'EOF' || true
since="$1"
timeout 20 journalctl -u fieryNT --since "$since" --no-pager -n 500 -o cat 2>&1 \
  | sed -E 's/\x1b\[[0-9;]*m//g' | grep -E '(^|[ ])ERROR[ ]|panicked at' | head -15
EOF
)"
    if [[ -n $bad ]]; then fail="ERROR/panic lines in the journal since $RESTART_TS:"$'\n'"$bad"; else say "journal: no ERROR/panic since $RESTART_TS"; fi
  fi
  if [[ -z $fail ]]; then say "healthy for ${want_secs}s"; return 0; fi
  printf 'HEALTH FAILED: %s\n' "$fail"
  return 1
}

auto_rollback() {
  local to="$1"
  step "ROLLBACK to ${to:-<none>}"
  [[ -n $to ]] || { echo "no previous release recorded; cannot roll back automatically. Investigate NOW."; return 1; }
  switch_to "$to"
  restart_game
  # shorter window: the previous release was known good; make sure it came up.
  if health_check 45; then say "rolled back to $to and healthy"; return 0; fi
  echo "ROLLBACK ALSO UNHEALTHY. Intervene manually: ssh $HOST; systemctl status fieryNT --no-pager -l"; return 1
}

# ---- status / rollback modes --------------------------------------------------------------------------
if [[ $MODE == status ]]; then
  rssh "ls -lt $REL 2>/dev/null | head -12; echo; systemctl show -p ExecStart --value fieryNT | cut -c1-120; systemctl is-active fieryNT; uptime"
  admin_get /api/admin/players | jq -c '{count, names: [.players[].name]}'
  exit 0
fi

if [[ $MODE == health ]]; then
  RESTART_TS="$(rssh "date -d '15 minutes ago' '+%Y-%m-%d %H:%M:%S'")"; BASE_PID=""; BASE_NR=""
  health_check "$HEALTH_ONLY_SECS"
  exit $?
fi

if [[ $MODE == backup ]]; then
  SHORT=manual; backup_db; exit 0
fi

if [[ $MODE == rollback ]]; then
  load_release_state
  target="${ROLLBACK_TO:-$PREVIOUS_SHA}"
  [[ -n $target ]] || die "no previous release to roll back to"
  rssh "test -x $REL/$target/mud-server" || die "release $target not found on the host"
  unit_execstart_ok || die "fieryNT unit does not use $REL/current yet (run deploy-game.sh <sha> --install-units first)"
  say "current=$CURRENT_SHA -> rolling back to $target"
  players_check
  switch_to "$target"
  restart_game
  health_check "$HEALTH_SECS" || die "rolled-back release is unhealthy; investigate"
  say "rollback done: $target"
  exit 0
fi

# ---- deploy mode ----------------------------------------------------------------------------------------
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
for c in cargo cargo-zigbuild zig rsync jq objdump psql; do command -v "$c" >/dev/null || die "missing tool: $c"; done
case "$TARGET_DIR" in /home/strider/Code/mud/.cargo-target/slot-[1-4]) ;; *) die "CARGO_TARGET_DIR must be one of the shared slots, got $TARGET_DIR";; esac
[[ -d $WT/.git || -f $WT/.git ]] || die "worktree $WT not found"
[[ $WT != /home/strider/Code/mud/fierymud-rs ]] || die "refusing to build in the main checkout"

step "resolve + checkout $REF"
git -C "$WT" fetch -q origin
[[ -z "$(git -C "$WT" status --porcelain)" ]] || die "worktree $WT is not clean"
FULL="$(git -C "$WT" rev-parse --verify "$REF^{commit}")" || die "cannot resolve $REF"
SHORT="${FULL:0:12}"
if ! git -C "$WT" merge-base --is-ancestor "$FULL" origin/main; then
  ((ALLOW_UNPUSHED)) || die "$SHORT is not on origin/main (push it, or --allow-unpushed)"
fi
git -C "$WT" checkout -q --detach "$FULL"
[[ -z "$(git -C "$WT" status --porcelain)" ]] || die "tree not clean at $SHORT"
say "building $SHORT: $(git -C "$WT" log -1 --format=%s "$FULL" | cut -c1-90)"

# compile-time sqlx checks run against the dev DB (online); never the stale gitignored .sqlx
CARGO_ENV=(env "CARGO_TARGET_DIR=$TARGET_DIR" SQLX_OFFLINE=false "FIERYMUD_GIT_SHA=$SHORT")
[[ -r $ENV_FILE ]] || die "cannot read $ENV_FILE (needs DATABASE_URL of the dev DB)"
cargo_run() { ( cd "$WT"; set -a; . "$ENV_FILE"; set +a; "${CARGO_ENV[@]}" "$@" ); }

step "preflight: fmt, clippy, tests"
cargo_run cargo fmt --all --check || die "cargo fmt --check failed"
say "fmt ok"
cargo_run cargo clippy --workspace --all-targets --locked -- -D warnings 2>&1 | tail -5 || die "clippy failed"
say "clippy ok"
if ((SKIP_TESTS)); then say "tests skipped (--skip-tests)"; SUMMARY+=("tests: skipped")
else
  cargo_run cargo test --workspace --locked 2>&1 \
    | awk '/^test result:/ { p += $4; f += $6 } /^(error|failures:|FAILED)|^test .* FAILED/ { print } END { printf "tests: %d passed, %d failed\n", p, f }' \
    || die "tests failed"
  say "tests ok"; SUMMARY+=("tests: ok")
fi

step "build (zigbuild glibc 2.39, release)"
T_B=$(date +%s)
cargo_run cargo zigbuild --release --locked -p mud-server --target "$ZIG_TARGET" 2>&1 | tail -3 || die "zigbuild failed"
BIN="$TARGET_DIR/x86_64-unknown-linux-gnu/release/mud-server"
[[ -x $BIN ]] || die "binary missing: $BIN"
GL="$(objdump -T "$BIN" | grep -o 'GLIBC_[0-9.]*' | sed 's/GLIBC_//' | sort -uV | tail -1)"
[[ $(printf '%s\n%s\n' "$GL" "$GLIBC_MAX" | sort -V | tail -1) == "$GLIBC_MAX" ]] || die "binary needs glibc $GL > $GLIBC_MAX"
say "built in $(($(date +%s) - T_B))s: $(du -h "$BIN" | cut -f1), needs glibc <= $GL"
SUMMARY+=("build: zigbuild glibc<=$GL, $(du -h "$BIN" | cut -f1)")

step "connect + host sanity"
rssh 'uptime; free -m | sed -n 2p' || die "cannot ssh to $HOST"
ensure_layout
load_release_state
say "current=${CURRENT_SHA:-none} previous=${PREVIOUS_SHA:-none}"

step "upload + binary check on the host"
LOCAL_SUM="$(sha256sum "$BIN" | cut -d' ' -f1)"
RSYNC_SSH="ssh ${SSH_OPTS[*]}"
if rssh "test -x $REL/$SHORT/mud-server && [ \"\$(sha256sum $REL/$SHORT/mud-server | cut -d' ' -f1)\" = $LOCAL_SUM ]"; then
  say "release $SHORT already on the host with the same checksum; reusing"
else
  [[ $CURRENT_SHA != "$SHORT" ]] || die "$SHORT is the running release but its binary differs from this build; refuse to overwrite it (rebuild is not byte-identical?). Deploy a new commit."
  rssh "rm -rf $REL/.incoming-$SHORT; mkdir -p $REL/.incoming-$SHORT"
  timeout 300 rsync -z -q -e "$RSYNC_SSH" "$BIN" "$HOST:$REL/.incoming-$SHORT/mud-server"
  rbash "$SHORT" "$LOCAL_SUM" <<'EOF'
set -euo pipefail
umask 027
REL=/opt/NEXT/releases; sha="$1"; sum="$2"; tmp="$REL/.incoming-$sha"
[ "$(sha256sum "$tmp/mud-server" | cut -d' ' -f1)" = "$sum" ] || { echo "checksum mismatch after upload"; rm -rf "$tmp"; exit 1; }
chmod 750 "$tmp" "$tmp/mud-server"
out="$(timeout 20 "$tmp/mud-server" --version 2>&1)" || { echo "binary check FAILED: $out"; rm -rf "$tmp"; exit 1; }
case "$out" in *"(git $sha)"*) ;; *) echo "binary check FAILED: unexpected version output: $out"; rm -rf "$tmp"; exit 1;; esac
echo "binary check OK on host: $out"
rm -rf "${REL:?}/$sha"
mv -T "$tmp" "$REL/$sha"
EOF
fi
SUMMARY+=("upload: $REL/$SHORT/mud-server checked on host")
BIN_CHECK="$(rssh "timeout 20 $REL/$SHORT/mud-server --version")"
say "host says: $BIN_CHECK"

schema_check

if ((STAGE_ONLY)); then
  step "stage-only: done"
  say "staged $REL/$SHORT (not switched, nothing restarted)"
  printf '\nSUMMARY (%ss)\n  sha: %s\n' "$(($(date +%s) - T_START))" "$FULL"
  printf '  %s\n' "${SUMMARY[@]}" "$SCHEMA_NOTE" "stage-only: current stays ${CURRENT_SHA:-none}"
  exit 0
fi

# -- switch path --
if ! unit_execstart_ok; then
  if ((INSTALL_UNITS)); then install_units
  else die "fieryNT's unit does not use $REL/current/mud-server yet. One-time: re-run with --install-units (host kit pull + 'sudo setup-root.sh units')."; fi
fi
players_check
BACKUP_NAME=""
if ((NO_BACKUP)); then say "backup skipped (--no-backup)"; SUMMARY+=("backup: skipped")
else backup_db; SUMMARY+=("backup: $BACKUP_NAME"); fi
((${#SQL_FILES[@]} == 0)) || apply_sql

step "switch + restart"
PREV_FOR_ROLLBACK="$CURRENT_SHA"
switch_to "$SHORT"
if restart_game && health_check "$HEALTH_SECS"; then
  prune_releases
  RESULT="healthy"
  RC=0
else
  auto_rollback "$PREV_FOR_ROLLBACK" || true
  RESULT="FAILED, rolled back to ${PREV_FOR_ROLLBACK:-nothing}"
  RC=1
fi

printf '\nSUMMARY (%ss)\n  sha: %s\n  result: %s\n  previous release: %s\n' "$(($(date +%s) - T_START))" "$FULL" "$RESULT" "${PREV_FOR_ROLLBACK:-none}"
printf '  %s\n' "${SUMMARY[@]}" "$SCHEMA_NOTE"
printf '  rollback later: deploy-game.sh --rollback\n'
exit $RC
