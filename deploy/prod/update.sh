#!/usr/bin/env bash
# Update NEXT from git and rebuild. Usage: update.sh [mud|muditor|all]  (default: all)
# Run as strider. Does NOT restart services; prints the sudo lines to run.
# NOTE: `bun run build` rewrites apps/web/.next and apps/api/dist in place, so the
# running muditorNT-web (and -api) may error or be briefly unavailable until restarted.
set -euo pipefail

TARGET="${1:-all}"
case "$TARGET" in mud|muditor|all) ;; *) echo "usage: $0 mud|muditor|all" >&2; exit 2;; esac

export PATH="/opt/NEXT/tools/bun/bin:$HOME/.cargo/bin:$PATH"
restart=()

if [[ "$TARGET" == mud || "$TARGET" == all ]]; then
  echo "== fierymud-rs =="
  git -C /opt/NEXT/fierymud-rs pull --ff-only
  (cd /opt/NEXT/fierymud-rs && SQLX_OFFLINE=true cargo build --release --jobs 2)
  restart+=("sudo systemctl restart fieryNT")
fi

if [[ "$TARGET" == muditor || "$TARGET" == all ]]; then
  echo "== muditor =="
  git -C /opt/NEXT/muditor pull --ff-only
  (
    cd /opt/NEXT/muditor
    bun install --frozen-lockfile
    bun run db:generate
    # Push the Prisma schema (repo convention is `db push`, no migrations dir). Without
    # --accept-data-loss prisma aborts on destructive changes, which fails the update.
    echo "-- prisma db push"
    ( set -a; . /opt/NEXT/env/muditor.env; set +a; cd packages/db && bunx prisma db push --skip-generate )
    # Idempotent SQL seeds from sql/*.sql from the repo checkout, in name order. Auth via pgpass (no password in argv).
    for f in /opt/NEXT/muditor/deploy/prod/sql/*.sql; do
      [[ -e "$f" ]] || continue
      echo "-- seed $(basename "$f")"
      PGPASSFILE=/opt/NEXT/.secrets/pgpass psql -h 127.0.0.1 -p 5432 -U fierynext -d fierynext -v ON_ERROR_STOP=1 -q -f "$f"
    done
    set -a; . /opt/NEXT/.env; set +a
    NODE_OPTIONS=--max-old-space-size=2048 bun run build
  )
  mkdir -p /opt/NEXT/muditor/apps/web/.next/cache
  # Group ownership is normally inherited from the setgid tree; chgrp fails if strider is not in group fierymud (one-time fix: sudo usermod -aG fierymud strider). Non-fatal.
  chgrp -R fierymud /opt/NEXT/muditor/apps/web/.next /opt/NEXT/muditor/apps/api/dist 2>/dev/null || echo "[warn] chgrp skipped (strider not in group fierymud?) - services still read via setgid/other bits"
  chmod -R g+rwX /opt/NEXT/muditor/apps/web/.next /opt/NEXT/muditor/apps/api/dist 2>/dev/null || true
  find /opt/NEXT/muditor/apps/web/.next /opt/NEXT/muditor/apps/api/dist -type d -exec chmod g+s {} +
  restart+=("sudo systemctl restart muditorNT-api muditorNT-web")
fi

echo
echo "Build finished. Restart (not run automatically; expect a brief NEXT-web outage):"
for r in "${restart[@]}"; do echo "  $r"; done
