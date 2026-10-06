#!/usr/bin/env bash
# Daily error digest for the NEXT prod host. Runs as strider, no sudo, read-only
# against logs/DB; writes DIR/YYYY-MM-DD.md and repoints DIR/latest.md.
#
#   error-digest.sh [--since "24 hours ago"] [--out /opt/NEXT/logs/digest]
#   error-digest.sh --self-test
#
# Sources: fieryNT (journald, tracing text), muditorNT-api (journald + LOG_DIR
# error*.log), muditorNT-web (journald), Lua errors (table script_error_log),
# systemd unit state. See ERRORS.md. When *sourced* only the helper functions are
# defined (used by tests/error-digest.test.sh).
set -euo pipefail
export LC_ALL=C.UTF-8

TOP_N=25
EX_MAX=300
SIG_MAX=160
UNITS=(fieryNT muditorNT-api muditorNT-web)
PGPASSFILE_DEFAULT=/opt/NEXT/.secrets/pgpass
LOG_DIR="${LOG_DIR:-/opt/NEXT/logs}"

# ---------------------------------------------------------------- helpers

strip_ansi() { sed -E 's/\x1b\[[0-9;]*[A-Za-z]//g'; }

# Redact secrets. Runs BEFORE normalising/truncating so nothing is cut mid-secret.
redact() {
  sed -E \
    -e 's/Bearer +[^[:space:]]+/Bearer {redacted}/gI' \
    -e 's/(got invalid value ).*/\1{redacted}/' \
    -e 's/(Basic|Digest) +[^[:space:]]+/\1 {redacted}/g' \
    -e 's/eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]+\.?[A-Za-z0-9_-]*/{jwt}/g' \
    -e "s/(password|passwd|token|secret|authorization)(\"?[ ]*[=:][ ]*|[ ]+)(\"[^\"]*\"|'[^']*'|[^[:space:]\",}]+)/\\1={redacted}/gI"
}

# Collapse variable parts so repeats group. Input should already be redacted.
normalise() {
  sed -E \
    -e "s/(^|[^[:alnum:]])\"[^\"]{41,}\"/\\1\"{str}\"/g" \
    -e "s/(^|[^[:alnum:]])'[^']{41,}'/\\1'{str}'/g" \
    -e 's/[0-9]{4}-[0-9]{2}-[0-9]{2}[T ][0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?(Z|[+-][0-9]{2}:?[0-9]{2})?/{ts}/g' \
    -e 's/[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}, [0-9]{1,2}:[0-9]{2}:[0-9]{2} [AP]M/{ts}/g' \
    -e 's/[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?/{ts}/g' \
    -e 's/\[Nest\] +[0-9]+/[Nest] {pid}/g' \
    -e 's/(pid|PID)([ =:]+)[0-9]+/\1\2{pid}/g' \
    -e 's/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/{uuid}/g' \
    -e 's/\b[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}(:[0-9]+)?\b/{ip}/g' \
    -e 's/\b0x[0-9a-fA-F]+\b/{hex}/g' \
    -e 's/\b[0-9]{3,}\b/{n}/g' \
    -e 's/\b[0-9a-fA-F]{8,}\b/{hex}/g' \
    -e 's/#[0-9]+/#{n}/g' \
    -e 's/[0-9]{3,}/{n}/g' \
    -e 's/[[:space:]]+/ /g' \
    -e 's/^ //; s/ $//'
}

# Escape a value for use inside a markdown table code span.
md_cell() { printf '%s' "$1" | tr '\n\t`' '  '"'" | sed 's/|/\\|/g'; }

# Aggregate stdin TSV (ts<TAB>prefix<TAB>text) into a markdown table on stdout.
# ts must be YYYY-MM-DDTHH:MM:SS (UTC). prefix is an optional literal key that is
# NOT normalised (e.g. Lua trigger id). Needs $WORK. Side files:
#   $WORK/agg.<tag>.stats  "distinct<TAB>total"
#   $WORK/agg.<tag>.cands  "group<TAB>count<TAB>label<TAB>id<TAB>sig" (all rows)
aggregate() {
  local tag=$1 grp=$2 label=$3 in="$WORK/agg.$1.in"
  cat > "$in"
  if [[ ! -s $in ]]; then
    echo "_No events in window._"
    printf '0\t0\n' > "$WORK/agg.$tag.stats"; : > "$WORK/agg.$tag.cands"
    return 0
  fi
  cut -f1 "$in" > "$in.ts"
  cut -f2 "$in" > "$in.prefix"
  cut -f3- "$in" | redact > "$in.red"
  normalise < "$in.red" > "$in.sig"
  paste "$in.ts" "$in.prefix" "$in.sig" "$in.red" |
    awk -F'\t' '
      { k = $2 SUBSEP $3; n[k]++
        if (!(k in first) || $1 < first[k]) first[k] = $1
        if (!(k in last)  || $1 > last[k])  last[k]  = $1
        if (!(k in ex)) { ex[k] = $4; pre[k] = $2; sg[k] = $3 } }
      END { OFS = "\037"; for (k in n) print n[k], first[k], last[k], pre[k], sg[k], ex[k] }' |
    sort -t$'\037' -k1,1nr -k3,3r > "$in.rows"
  local distinct total
  distinct=$(wc -l < "$in.rows")
  total=$(awk -F'\037' '{s += $1} END {print s+0}' "$in.rows")
  printf '%s\t%s\n' "$distinct" "$total" > "$WORK/agg.$tag.stats"
  : > "$WORK/agg.$tag.cands"
  echo "| Count | First seen (UTC) | Last seen (UTC) | Id | Signature | Example |"
  echo "|---:|---|---|---|---|---|"
  local cnt first last pre sg ex id full i=0
  # \037 (unit separator) is a non-whitespace IFS so empty fields survive `read`.
  while IFS=$'\037' read -r cnt first last pre sg ex; do
    full=$sg; [[ -n $pre ]] && full="$pre $sg"
    id=$(printf '%s' "$full" | sha1sum | cut -c1-8)
    printf '%s\t%s\t%s\t%s\t%s\n' "$grp" "$cnt" "$label" "$id" "${full:0:$SIG_MAX}" >> "$WORK/agg.$tag.cands"
    i=$((i + 1))
    if ((i <= TOP_N)); then
      local ex2=$ex; [[ -n $pre ]] && ex2="$pre $ex"
      printf '| %s | %s | %s | %s | `%s` | `%s` |\n' "$cnt" "${first/T/ }" "${last/T/ }" "$id" \
        "$(md_cell "${full:0:$SIG_MAX}")" "$(md_cell "${ex2:0:$EX_MAX}")"
    fi
  done < "$in.rows"
  if ((distinct > TOP_N)); then echo; echo "_Showing top $TOP_N of $distinct distinct signatures._"; fi
}

# journalctl -> TSV "ts<TAB>ident<TAB>text" (UTC, ANSI stripped, systemd lines kept
# so callers can tell them apart by ident).
journal_tsv() {
  local cache="$WORK/j.$1.tsv"
  if [[ ! -e $cache ]]; then journal_fetch "$1" > "$cache"; fi
  cat "$cache"
}
journal_fetch() {
  journalctl -u "$1" --since "@$SINCE_EPOCH" --no-pager --all -o short-iso --utc 2>/dev/null |
    sed -nE 's/^([0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2})[+-][0-9:]+ [^ ]+ ([^ :[]+)(\[[0-9]+\])?: (.*)$/\1\t\2\t\4/p' |
    strip_ansi | tr -d '\r' || true
}

# ---------------------------------------------------------------- sources

src_fiery() {
  journal_tsv fieryNT | awk -F'\t' -v OFS='\t' '$2 !~ /^systemd$/ { print $1, "", $3 }' > "$WORK/fiery.tsv"
  local lvl='^[0-9T:.Z-]+ +(ERROR|WARN) |"level" *: *"(ERROR|WARN|error|warn)"'
  local pan='(ERROR|FATAL) +panic: |panicked at'
  { grep -E "$pan" "$WORK/fiery.tsv" || true; } > "$WORK/fiery.panic"
  { grep -E "$lvl" "$WORK/fiery.tsv" | grep -vE "$pan" || true; } > "$WORK/fiery.err"
}

src_api() {
  journal_tsv muditorNT-api | awk -F'\t' -v OFS='\t' '$2 !~ /^systemd$/ { print $1, "", $3 }' |
    sed -E 's/\t\[Nest\] +[0-9]+ +- +[0-9]+\/[0-9]+\/[0-9]+, [0-9:]+ [AP]M +/\t/' |
    # Nest prints "ERROR [Ctx] msg:" with the detail on the next journal entry, and
    # GlobalExceptionFilter pretty-prints JSON over many entries. Merge the detail
    # line; for JSON keep only the "type"/"message" lines (never context/body/variables).
    awk -F'\t' -v OFS='\t' '
      function flush() { if (cur != "") print cts, "", cur; cur = ""; n = 0 }
      { lvl = ($3 ~ /^(LOG|WARN|ERROR|DEBUG|VERBOSE|FATAL) /) }
      lvl { flush()
            if ($3 ~ /^(ERROR|FATAL) / && ($3 ~ /:$/ || $3 ~ /\{$/)) { cur = $3; cts = $1; mode = ($3 ~ /\{$/) ? "json" : "detail" }
            else print $1, "", $3
            next }
      cur != "" { if (mode == "detail") { if (n == 0) cur = cur " " $3; n++ }
                  else if ($3 ~ /^ *"(type|message)":/) { t = $3; sub(/^ +/, "", t); cur = cur " " t }
                  next }
      { print $1, "", $3 }
      END { flush() }' > "$WORK/api.tsv"
  { grep -F '[gql-error]' "$WORK/api.tsv" || true; } > "$WORK/api.gql"
  { grep -F '[client-error]' "$WORK/api.tsv" || true; } > "$WORK/api.client"
  {
    grep -vF -e '[gql-error]' -e '[client-error]' "$WORK/api.tsv" |
      grep -E $'\t(ERROR|FATAL) |[Uu]ncaught|[Uu]nhandled|UnhandledPromiseRejection' || true
    # LoggingService JSON files (message + context only; never the data payload)
    local since_iso f
    since_iso=$(date -u -d "@$SINCE_EPOCH" +%Y-%m-%dT%H:%M:%S)
    for f in "$LOG_DIR"/error*.log; do
      [[ -r $f ]] || continue
      jq -R -r --arg s "$since_iso" 'fromjson? | select((.level == "error" or .level == "warn") and (.timestamp[0:19] >= $s))
        | [.timestamp[0:19], "[error.log]", ((.level | ascii_upcase) + " [" + (.context // "-") + "] " + (.message // ""))] | @tsv' "$f" 2>/dev/null || true
    done
  } > "$WORK/api.err"
}

src_web() {
  journal_tsv muditorNT-web | awk -F'\t' -v OFS='\t' '$2 !~ /^systemd$/ { print $1, "", $3 }' |
    { grep -E 'Error|⨯|[Uu]nhandled' || true; } > "$WORK/web.err"
}

src_lua() {
  local since_ts
  since_ts=$(date -u -d "@$SINCE_EPOCH" '+%Y-%m-%d %H:%M:%S')
  export PGPASSFILE="${PGPASSFILE:-$PGPASSFILE_DEFAULT}"
  if ! psql -h 127.0.0.1 -U fierynext -d fierynext -At -F $'\t' -c "
      SELECT to_char(occurred_at, 'YYYY-MM-DD\"T\"HH24:MI:SS'),
             'trigger ' || trigger_zone_id || ':' || trigger_id || ' [' || error_type || ']',
             regexp_replace(error_message, '[\\t\\r\\n]+', ' ', 'g')
        FROM script_error_log WHERE occurred_at >= '$since_ts' ORDER BY occurred_at" \
      > "$WORK/lua.tsv" 2> "$WORK/lua.stderr"; then
    : > "$WORK/lua.tsv"; echo "psql failed: $(head -c 200 "$WORK/lua.stderr" | tr '\n' ' ')" > "$WORK/lua.unavailable"
  fi
}

src_units() {
  local u state restarts active_since
  {
    echo "| Unit | State | NRestarts | Active since |"
    echo "|---|---|---:|---|"
    for u in "${UNITS[@]}"; do
      state=$(systemctl show -p ActiveState --value "$u" 2>/dev/null || echo unknown)
      restarts=$(systemctl show -p NRestarts --value "$u" 2>/dev/null || echo '?')
      active_since=$(systemctl show -p ActiveEnterTimestamp --value "$u" 2>/dev/null || echo '?')
      [[ $state == active ]] || echo "$u: ActiveState=$state" >> "$WORK/alerts"
      printf '| %s | %s | %s | %s |\n' "$u" "$state" "$restarts" "$active_since"
    done
  } > "$WORK/units.md"
  : > "$WORK/units.events"
  for u in "${UNITS[@]}"; do
    journal_tsv "$u" | awk -F'\t' -v u="$u" -v OFS='\t' \
      '$2 == "systemd" && $3 ~ /^Started |Main process exited|code=killed|Failed with result|Scheduled restart job/ { print $1, u, $3 }' >> "$WORK/units.events"
  done
}

# ---------------------------------------------------------------- main

main() {
  local SINCE="24 hours ago" OUT="/opt/NEXT/logs/digest"
  while (($#)); do
    case "$1" in
      --since) SINCE="${2:?--since needs a value}"; shift 2 ;;
      --out) OUT="${2:?--out needs a value}"; shift 2 ;;
      --self-test) exec bash "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")/tests/error-digest.test.sh" ;;
      -h|--help) sed -n '2,9p' "${BASH_SOURCE[0]}"; exit 0 ;;
      *) echo "usage: $0 [--since \"24 hours ago\"] [--out DIR] | --self-test" >&2; exit 2 ;;
    esac
  done
  SINCE_EPOCH=$(date -d "$SINCE" +%s) || { echo "bad --since: $SINCE" >&2; exit 2; }
  NOW_EPOCH=$(date +%s)
  umask 027
  mkdir -p "$OUT"
  WORK=$(mktemp -d); trap 'rm -rf "$WORK"' EXIT
  : > "$WORK/alerts"

  src_fiery; src_api; src_web; src_lua; src_units

  local today; today=$(date +%F)
  local body="$WORK/body.md"
  {
    echo "## fieryNT (Rust game)"; echo
    echo "### ERROR/WARN log lines"; echo
    aggregate fiery.err 0 "fieryNT" < "$WORK/fiery.err"; echo
    echo "### Panics"; echo
    aggregate fiery.panic 0 "fieryNT panic" < "$WORK/fiery.panic"; echo
    echo "## muditorNT-api"; echo
    echo "### Server errors: GraphQL (\`[gql-error]\`)"; echo
    aggregate api.gql 0 "api gql-error" < "$WORK/api.gql"; echo
    echo "### Server errors: Nest ERROR, uncaught/unhandled, LOG_DIR error*.log"; echo
    aggregate api.err 0 "api nest/uncaught" < "$WORK/api.err"; echo
    echo "### Client-reported errors (\`[client-error]\`)"; echo
    aggregate api.client 1 "api client-error" < "$WORK/api.client"; echo
    echo "## muditorNT-web (Next.js)"; echo
    aggregate web.err 0 "web" < "$WORK/web.err"; echo
    echo "## Lua trigger errors (script_error_log)"; echo
    if [[ -s $WORK/lua.unavailable ]]; then
      echo "_Unavailable: $(cat "$WORK/lua.unavailable")_"; echo "unavailable" >> "$WORK/alerts"
      printf '0\t0\n' > "$WORK/agg.lua.stats"; : > "$WORK/agg.lua.cands"
    else
      awk -F'\t' -v OFS='\t' '{ print $1, $2, $3 }' "$WORK/lua.tsv" | aggregate lua 0 "lua"
    fi
    echo
    echo "## systemd"; echo
    cat "$WORK/units.md"; echo
    echo "### Unit start/exit events in window"; echo
    aggregate units 9 "units" < "$WORK/units.events"; echo
  } > "$body"

  local reviews="$OUT/REVIEWS.md"
  local md="$WORK/digest.md"
  {
    echo "# Error digest $today"; echo
    echo "- Window: since $(date -u -d "@$SINCE_EPOCH" '+%Y-%m-%d %H:%M:%S') UTC (\`$SINCE\`) until $(date -u -d "@$NOW_EPOCH" '+%Y-%m-%d %H:%M:%S') UTC"
    echo "- Generated: $(date -u '+%Y-%m-%d %H:%M:%S') UTC on $(hostname)"
    if [[ -s $WORK/alerts ]]; then echo "- **ALERT**: $(paste -sd';' "$WORK/alerts" | sed 's/;/; /g')"; fi
    echo
    echo "| Source | Distinct signatures | Total events |"
    echo "|---|---:|---:|"
    local t d n
    for t in "fiery.err:fieryNT ERROR/WARN" "fiery.panic:fieryNT panics" "api.gql:api [gql-error]" \
             "api.err:api Nest ERROR/uncaught" "api.client:api [client-error]" "web.err:web" "lua:Lua script errors"; do
      read -r d n < "$WORK/agg.${t%%:*}.stats"
      printf '| %s | %s | %s |\n' "${t#*:}" "$d" "$n"
    done
    echo
    echo "## Top 5 to look at"; echo
    echo "_Server errors before client-reported ones, then by count._"; echo
    local c=0 grp cnt label id sig
    while IFS=$'\t' read -r grp cnt label id sig; do
      c=$((c + 1))
      printf '%s. **%s** x%s `%s` `%s`\n' "$c" "$label" "$cnt" "$id" "$(md_cell "$sig")"
    done < <(cat "$WORK"/agg.*.cands | awk -F'\t' '$1 < 9' | sort -t$'\t' -k1,1n -k2,2nr | awk 'NR<=5')
    ((c > 0)) || echo "_Nothing to report._"
    echo
    if [[ -r $reviews ]]; then
      echo "## Recent reviews (last 5 from REVIEWS.md)"; echo
      tail -n 5 "$reviews"; echo
    fi
    cat "$body"
  } > "$md"

  mv "$md" "$OUT/$today.md"
  ln -sfn "$today.md" "$OUT/latest.md"
  find "$OUT" -maxdepth 1 -type f -name '????-??-??.md' -mtime +90 -delete
  echo "wrote $OUT/$today.md"
}

# Sourced (tests): helpers only.
if [[ "${BASH_SOURCE[0]}" != "$0" ]]; then return 0; fi
main "$@"
