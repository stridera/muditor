#!/usr/bin/env bash
# Phase 2 (run as strider AFTER `sudo setup-root.sh prepare`): DB import, config rows,
# admin web account, muditor build, builder grants. Paths are under /opt/NEXT.
# Never prints secrets and never puts the database URL/password in a command line.
set -euo pipefail
umask 027

REIMPORT=0
case "${1:-}" in
  --reimport) REIMPORT=1 ;;
  "") ;;
  *) echo "usage: $0 [--reimport]" >&2; exit 2 ;;
esac

export PATH="/opt/NEXT/tools/bun/bin:$HOME/.local/bin:$HOME/.cargo/bin:$PATH"
NEXT=/opt/NEXT
V3=/opt/NEXT
LOGS=$NEXT/logs
SECRETS=$NEXT/.secrets
BUN=$NEXT/tools/bun/bin/bun
mkdir -p "$LOGS" 2>/dev/null || true

# --- connection settings: pgpass file + libpq env, so psql needs no URL argv ----
(umask 077; printf '127.0.0.1:5432:fierynext:fierynext:%s\n' "$(tr -d '\r\n' < "$SECRETS/pg_password")" > "$SECRETS/pgpass")
chmod 600 "$SECRETS/pgpass"
export PGPASSFILE="$SECRETS/pgpass" PGHOST=127.0.0.1 PGPORT=5432 PGDATABASE=fierynext PGUSER=fierynext

set -a
# shellcheck disable=SC1091
. "$NEXT/env/fierylib.env"
set +a
: "${DATABASE_URL:?missing from fierylib.env}"
export LEGACY_LIB_PATH="${LEGACY_LIB_PATH:-/opt/PRODUCTION/lib}"
export PRISMA_SCHEMA_PATH="${PRISMA_SCHEMA_PATH:-$NEXT/muditor/packages/db/prisma/schema.prisma}"

echo "== [1/7] verify database connectivity =="
psql -Atc 'select 1' >/dev/null
echo "database OK"
[[ -d "$LEGACY_LIB_PATH" ]] || { echo "ERROR: LEGACY_LIB_PATH $LEGACY_LIB_PATH not found" >&2; exit 1; }

echo "== [2/7] fierylib full reset + import (log: $LOGS/import.log) =="
ZONES="$(psql -Atc 'SELECT count(*) FROM "Zones"' 2>/dev/null || echo 0)"
if [[ "${ZONES:-0}" -gt 0 && $REIMPORT -eq 0 ]]; then
  echo "import already present ($ZONES zones) - skipping; pass --reimport to force"
else
  # Poetry's default venv lives in ~/.cache/pypoetry/virtualenvs keyed by the project path, which
  # changes when the tree is moved; keep the venv inside the project (fierylib/.venv) instead.
  echo "poetry: preparing in-project venv"
  (
    cd "$V3/fierylib"
    poetry config virtualenvs.in-project true --local
    poetry install --no-interaction
  ) >"$LOGS/poetry-install.log" 2>&1 || { echo "poetry install FAILED; tail of log:" >&2; tail -n 25 "$LOGS/poetry-install.log" >&2; exit 1; }
  ( cd "$V3/fierylib" && PRISMA_SCHEMA_PATH="$PRISMA_SCHEMA_PATH" poetry run prisma --version ) >"$LOGS/poetry-prisma-check.log" 2>&1 \
    || { echo "'poetry run prisma --version' FAILED; log tail:" >&2; tail -n 15 "$LOGS/poetry-prisma-check.log" >&2; exit 1; }
  echo "poetry + prisma OK"
  # full_reset_and_import.sh takes no URL argument: `bunx prisma db push` (cwd
  # muditor/packages/db) reads DATABASE_URL via prisma.config.ts, and the python
  # side reads DATABASE_URL / LEGACY_LIB_PATH from the environment (python-dotenv).
  # NOTE: deliberately NO --with-users (that seeds well-known test accounts/passwords).
  (
    cd "$V3/fierylib"
    bash scripts/full_reset_and_import.sh
  ) >"$LOGS/import.log" 2>&1 || { echo "import FAILED; tail of log:" >&2; tail -n 25 "$LOGS/import.log" >&2; exit 1; }
  echo "import complete"
fi

echo "== [3/7] GameConfig rows =="
echo "reference row:"
psql -c "SELECT category, key, value, value_type, description, min_value, max_value, is_secret, restart_req FROM \"GameConfig\" WHERE category='server' AND key='max_connections';"
psql -v ON_ERROR_STOP=1 <<'SQL'
-- Copy the shape of server.max_connections, overriding category/key/value/description.
INSERT INTO "GameConfig" (category, key, value, value_type, description, min_value, max_value, is_secret, restart_req, updated_at)
SELECT 'server', 'max_connections_per_ip', '20', value_type, 'Maximum concurrent connections per IP address', '1', '1000', is_secret, restart_req, now()
FROM "GameConfig" WHERE category='server' AND key='max_connections'
ON CONFLICT (category, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
INSERT INTO "GameConfig" (category, key, value, value_type, description, min_value, max_value, is_secret, restart_req, updated_at)
SELECT 'security', 'legacy_max_login_attempts', '10', value_type, 'Maximum failed login attempts before disconnect', '1', '100', is_secret, restart_req, now()
FROM "GameConfig" WHERE category='server' AND key='max_connections'
ON CONFLICT (category, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
SQL
echo "resulting rows:"
psql -c "SELECT category, key, value, value_type, restart_req FROM \"GameConfig\" WHERE (category,key) IN (('server','max_connections'),('server','max_connections_per_ip'),('security','legacy_max_login_attempts'));"

echo "== [4/7] bootstrap web account (stridera@gmail.com, PLAYER; link a god character to be promoted) =="
if [[ ! -s "$SECRETS/admin_web_password" ]]; then
  (umask 077; openssl rand -base64 18 > "$SECRETS/admin_web_password")
  chmod 600 "$SECRETS/admin_web_password"
  echo "generated $SECRETS/admin_web_password"
fi
# password goes to bun via the environment (not argv); hash goes to psql via stdin
HASH="$(ADMIN_PW="$(tr -d '\r\n' < "$SECRETS/admin_web_password")" "$BUN" -e 'console.log(await Bun.password.hash(process.env.ADMIN_PW, {algorithm:"bcrypt", cost:12}))')"
{
  printf "\\\\set hash '%s'\n" "$HASH"
  cat <<'SQL'
INSERT INTO "Users" (id, email, display_name, password_hash, role, updated_at)
VALUES (gen_random_uuid()::text, 'stridera@gmail.com', 'Strider', :'hash', 'PLAYER', now())
ON CONFLICT (email) DO UPDATE
  SET password_hash = EXCLUDED.password_hash,
      failed_login_attempts = 0, locked_until = NULL, updated_at = now();
SQL
} | psql -v ON_ERROR_STOP=1 -q
unset HASH
psql -c "SELECT email, display_name, role FROM \"Users\" WHERE email='stridera@gmail.com';"
echo "Web login: stridera@gmail.com, password in $SECRETS/admin_web_password"

echo "== [5/7] muditor install + build (log: $LOGS/build-muditor.log) =="
avail_mb="$(awk '/MemAvailable/ {print int($2/1024)}' /proc/meminfo)"
free -m | head -2
if [[ "${avail_mb:-0}" -lt 1500 ]]; then
  echo "WARNING: only ${avail_mb} MB available; the Next.js build may be OOM-killed."
  echo "         Consider a swapfile: sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile"
fi
: > "$LOGS/build-muditor.log"
build_step() { # name, dir, command...
  local name="$1" dir="$2"; shift 2
  echo "-- $name" | tee -a "$LOGS/build-muditor.log" >/dev/null
  echo "   $name ..."
  if ! ( set -o pipefail; cd "$dir" && "$@" ) >>"$LOGS/build-muditor.log" 2>&1; then
    echo "BUILD FAILED at step: $name; tail of log:" >&2
    tail -n 30 "$LOGS/build-muditor.log" >&2
    exit 1
  fi
}
set -a
# shellcheck disable=SC1091
. "$V3/.env"
set +a
export NODE_OPTIONS=--max-old-space-size=2048
build_step "bun install"         "$V3/muditor"          bun install --frozen-lockfile
build_step "db:generate"         "$V3/muditor"          bun run db:generate
build_step "packages build"      "$V3/muditor"          bun run --filter './packages/*' build
build_step "api build"           "$V3/muditor/apps/api" bun run build
build_step "web build"           "$V3/muditor/apps/web" bun run build
echo "build complete"

echo "== [6/7] builder grants (needs the IMPLEMENTOR row above; seeds 0 rows when no BUILDER users exist) =="
psql -f "$NEXT/muditor/apps/api/scripts/seed-builder-grants.sql"

echo "== [7/7] permissions =="
mkdir -p "$NEXT/muditor/apps/web/.next/cache" "$NEXT/run"
chgrp -R fierymud "$NEXT/muditor/apps/web/.next" "$NEXT/muditor/apps/api/dist"
chmod -R g+rwX "$NEXT/muditor/apps/web/.next" "$NEXT/muditor/apps/api/dist"
find "$NEXT/muditor/apps/web/.next" "$NEXT/muditor/apps/api/dist" -type d -exec chmod g+s {} +
# NestJS rewrites apps/api/src/schema.gql on startup (autoSchemaFile)
if [[ -f "$NEXT/muditor/apps/api/src/schema.gql" ]]; then
  chgrp fierymud "$NEXT/muditor/apps/api/src/schema.gql"; chmod g+rw "$NEXT/muditor/apps/api/src/schema.gql"
fi

echo
echo "now run: sudo /opt/NEXT/deploy/setup-root.sh start"
