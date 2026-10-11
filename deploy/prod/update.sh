#!/usr/bin/env bash
# Update NEXT from git and rebuild. Usage: update.sh [muditor|all]  (default: all)
# Run as strider. Does NOT restart services; prints the sudo lines to run.
# The Rust game server is NOT built here any more (3.9 GB RAM / 4 cores: builds took 15-40 min and thrashed the
# host to load 73). Deploy it from the dev box: muditor/deploy/prod/deploy-game.sh <sha>  (local build + releases).
# NOTE: `bun run build` rewrites apps/web/.next and apps/api/dist in place, so the
# running muditorNT-web (and -api) may error or be briefly unavailable until restarted.
set -euo pipefail

TARGET="${1:-all}"
case "$TARGET" in
  mud) echo "update.sh mud is retired: never build Rust on this host. From the dev box run: muditor/deploy/prod/deploy-game.sh <sha>" >&2; exit 2;;
  muditor|all) ;;
  *) echo "usage: $0 muditor|all   (game server: deploy-game.sh on the dev box)" >&2; exit 2;;
esac

# Guard: the Next.js build is heavy on 4 cores / 3.9 GB. Refuse to start while the host is busy.
# (pgrep -x matches the exact process name; never use pgrep -f, it matches its own ssh/bash command line.)
if pgrep -x 'cargo|rustc' >/dev/null; then
  echo "refusing to build: a cargo/rustc process is running on this host (see: ps -u $USER -o pid,etime,pcpu,args)" >&2; exit 3
fi
load1="$(cut -d' ' -f1 /proc/loadavg)"
if awk -v l="$load1" 'BEGIN { exit !(l > 4) }'; then
  echo "refusing to build: load average $load1 is above 4; wait for the host to settle" >&2; exit 3
fi
# Low priority for everything that follows (build steps included): keep the game and Apache responsive.
LOWPRIO=(nice -n 10 ionice -c3)

export PATH="/opt/NEXT/tools/bun/bin:$HOME/.cargo/bin:$PATH"
restart=()

if [[ "$TARGET" == muditor || "$TARGET" == all ]]; then
  echo "== muditor =="
  git -C /opt/NEXT/muditor pull --ff-only
  (
    cd /opt/NEXT/muditor
    "${LOWPRIO[@]}" bun install --frozen-lockfile
    "${LOWPRIO[@]}" bun run db:generate
    # Push the Prisma schema (repo convention is `db push`, no migrations dir). Without
    # --accept-data-loss prisma aborts on destructive changes, which fails the update.
    echo "-- prisma db push"
    ( set -a; . /opt/NEXT/env/muditor.env; set +a; cd packages/db && "${LOWPRIO[@]}" bunx prisma db push )
    # Idempotent SQL seeds from sql/*.sql from the repo checkout, in name order. Auth via pgpass (no password in argv).
    for f in /opt/NEXT/muditor/deploy/prod/sql/*.sql; do
      [[ -e "$f" ]] || continue
      echo "-- seed $(basename "$f")"
      PGPASSFILE=/opt/NEXT/.secrets/pgpass psql -h 127.0.0.1 -p 5432 -U fierynext -d fierynext -v ON_ERROR_STOP=1 -q -f "$f"
    done
    set -a; . /opt/NEXT/.env; set +a
    NODE_OPTIONS=--max-old-space-size=2048 "${LOWPRIO[@]}" bun run build
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
