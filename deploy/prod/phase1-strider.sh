#!/usr/bin/env bash
# Phase 1 (run as strider, no sudo): generate secrets, env files, self-signed
# cert and a private copy of bun under ~/fierymudv3. Idempotent. Never prints secrets.
set -euo pipefail
umask 077

BASE="${HOME}/fierymudv3"
SECRETS="${BASE}/.secrets"
ENVDIR="${BASE}/env"
CERTS="${BASE}/certs"
TOOLS="${BASE}/tools/bun"
DOMAIN_MUD="doom.fierymud.org"

say() { printf '%s\n' "$*"; }
status=()
note() { status+=("$*"); }

mkdir -p "$BASE" "$SECRETS" "$ENVDIR" "$CERTS" "$BASE/tools"
chmod 700 "$SECRETS"

# --- secrets -----------------------------------------------------------
gen_secret() { # name, command...
  local name="$1"; shift
  if [[ -s "$SECRETS/$name" ]]; then
    note "secret $name: present (kept)"
  else
    "$@" > "$SECRETS/$name"
    chmod 600 "$SECRETS/$name"
    note "secret $name: generated"
  fi
}
gen_secret pg_password openssl rand -hex 24
gen_secret jwt_secret  openssl rand -base64 48
gen_secret admin_token openssl rand -hex 32

# Google OAuth values are supplied out-of-band (never part of the kit):
#   ~/fierymudv3/.secrets/google_client_id and google_client_secret
GOOGLE_ID=""; GOOGLE_SECRET=""
if [[ -s "$SECRETS/google_client_id" && -s "$SECRETS/google_client_secret" ]]; then
  GOOGLE_ID="$(tr -d '\r\n' < "$SECRETS/google_client_id")"
  GOOGLE_SECRET="$(tr -d '\r\n' < "$SECRETS/google_client_secret")"
  note "google oauth: present"
else
  note "google oauth: MISSING (create .secrets/google_client_id and google_client_secret, then re-run)"
fi

PG_PASSWORD="$(tr -d '\r\n' < "$SECRETS/pg_password")"
JWT_SECRET="$(tr -d '\r\n' < "$SECRETS/jwt_secret")"
ADMIN_TOKEN="$(tr -d '\r\n' < "$SECRETS/admin_token")"
DB_URL="postgresql://fierynext:${PG_PASSWORD}@127.0.0.1:5432/fierynext"

# --- env files ---------------------------------------------------------
# Plain `>` redirection keeps the mode of an existing file, so re-running after
# `setup-root.sh prepare` (which sets 640 + group fierymud) does not undo it.
# New files are created 600 by the umask above.
cat > "$ENVDIR/fierymud-rs.env" <<ENVEOF
# Fiery Mud NEXT server (Rust). Loaded by fieryNT.service and by mud-server via .env.
DATABASE_URL=${DB_URL}
MUD_LISTEN_ADDR=0.0.0.0:4003
MUD_TLS_LISTEN_ADDR=0.0.0.0:4443
TLS_CERT_PATH=/opt/NEXT/certs/server.crt
TLS_KEY_PATH=/opt/NEXT/certs/server.key
ADMIN_LISTEN_ADDR=127.0.0.1:8080
ADMIN_TOKEN=${ADMIN_TOKEN}
RUST_LOG=info
ENVEOF
note "env/fierymud-rs.env: written"

# Redis is optional. The API only talks to Redis when REDIS_URL is set (it
# enables the game-event/Discord bridge and cross-process rate limits).
if systemctl is-active --quiet redis-server; then
  REDIS_LINE="REDIS_URL=redis://127.0.0.1:6379"
else
  REDIS_LINE="# REDIS_URL unset: redis-server not active when this file was generated (sudo apt install redis-server)."
fi

cat > "$ENVDIR/muditor.env" <<ENVEOF
# Muditor NEXT (api + web). /opt/NEXT/.env -> this file; muditor/.env -> /opt/NEXT/.env
DATABASE_URL=${DB_URL}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
FIERYMUD_ADMIN_URL=http://127.0.0.1:8080
FIERYMUD_ADMIN_TOKEN=${ADMIN_TOKEN}
GOOGLE_CLIENT_ID=${GOOGLE_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_SECRET}
GOOGLE_CALLBACK_URL=https://muditor-api.fierymud.org/api/auth/google/callback
FRONTEND_URL=https://muditor.fierymud.org
${REDIS_LINE}
LOG_DIR=/opt/NEXT/logs
CORS_ORIGINS=https://muditor.fierymud.org
API_HOST=127.0.0.1
API_PORT=3001
# NEXT_PUBLIC_* are baked into the web bundle at build time (phase2 / update.sh).
NEXT_PUBLIC_API_URL=https://muditor-api.fierymud.org
NEXT_PUBLIC_GRAPHQL_URL=https://muditor-api.fierymud.org/graphql
ENVEOF
note "env/muditor.env: written"

cat > "$ENVDIR/fierylib.env" <<ENVEOF
# fierylib import tool (sourced by phase2-strider.sh)
DATABASE_URL=${DB_URL}
LEGACY_LIB_PATH=/opt/PRODUCTION/lib
PRISMA_SCHEMA_PATH=/opt/NEXT/muditor/packages/db/prisma/schema.prisma
ENVEOF
note "env/fierylib.env: written"

# --- self-signed TLS cert ---------------------------------------------
if [[ -s "$CERTS/server.crt" && -s "$CERTS/server.key" ]]; then
  note "certs/server.{crt,key}: present (kept)"
else
  openssl req -x509 -newkey rsa:2048 -nodes -days 825 \
    -subj "/CN=${DOMAIN_MUD}" -addext "subjectAltName=DNS:${DOMAIN_MUD}" \
    -keyout "$CERTS/server.key" -out "$CERTS/server.crt" >/dev/null 2>&1
  chmod 600 "$CERTS/server.key"; chmod 644 "$CERTS/server.crt"
  note "certs/server.{crt,key}: generated (self-signed, 825d, CN ${DOMAIN_MUD})"
fi

# --- bun copy (the fierymud user cannot traverse strider's home) --------
if [[ -x "$TOOLS/bin/bun" ]]; then
  note "tools/bun/bin/bun: present (kept)"
else
  [[ -x "$HOME/.bun/bin/bun" ]] || { echo "ERROR: ~/.bun/bin/bun not found" >&2; exit 1; }
  mkdir -p "$TOOLS/bin"
  cp -L "$HOME/.bun/bin/bun" "$TOOLS/bin/bun"
  ln -sfn bun "$TOOLS/bin/bunx"
  chmod 755 "$TOOLS/bin/bun"
  note "tools/bun/bin/bun: copied from ~/.bun"
fi

say "=== phase1 checklist (no secrets shown) ==="
for s in "${status[@]}"; do say "  [ok] $s"; done
say "bun version: $("$TOOLS/bin/bun" --version)"
say "Next: sudo ${BASE}/deploy/setup-root.sh prepare   (then phase2-strider.sh)"
