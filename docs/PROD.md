# Production (doom.fierymud.org)

The new Rust MUD (fierymud-rs) and Muditor run on the production host `doom.fierymud.org` (`ssh fierymud`, Ubuntu 24.04,
user `strider`, ~3.8 GiB RAM). The legacy CircleMUD (`fieryP` /opt/PRODUCTION port 4000, `fieryT` /opt/TEST port 9999,
/opt/DEV, user `fierymud`) shares the box and must never be touched.

Full runbook and first-install steps: [deploy/prod/README.md](../deploy/prod/README.md).

## How prod is laid out

Everything lives under `/opt/NEXT` (owner `strider:fierymud`, setgid):

| Path                                               | Purpose                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `fierymud-rs/`, `muditor/`, `fierylib/`            | git checkouts, built in place                                                 |
| `env/`                                             | `fierymud-rs.env`, `muditor.env`, `fierylib.env` (no values in git)           |
| `.secrets/`                                        | generated secrets (mode 700); never print or commit                           |
| `certs/`, `logs/`, `run/`, `backups/`, `tools/bun` | game TLS cert, logs, runtime state, daily `pg_dump` (cron 04:15), private bun |
| `deploy/`                                          | symlink to `/opt/NEXT/muditor/deploy/prod` (this repo's kit)                  |

| Unit            | What                                | Port                                       |
| --------------- | ----------------------------------- | ------------------------------------------ |
| `fieryNT`       | Rust MUD (telnet / TLS, admin HTTP) | 4003, 4443 (Let's Encrypt), 127.0.0.1:8080 |
| `muditorNT-api` | Muditor API (`bun dist/main.js`)    | 127.0.0.1:3001                             |
| `muditorNT-web` | Muditor web (`next start`)          | 127.0.0.1:3000                             |

Apache vhosts `05-muditor.conf` / `05-muditor-le-ssl.conf` front `muditor.fierymud.org` and
`muditor-api.fierymud.org`. Database: local PostgreSQL 16, db and role `fierynext`.

## How to update

```bash
ssh fierymud 'bash -lc "/opt/NEXT/deploy/update.sh all"'     # or: mud | muditor
```

`update.sh` does `git pull --ff-only`, rebuilds, and prints the restart lines; it never restarts anything itself.
Then restart what changed:

```bash
ssh fierymud 'sudo -n systemctl restart fieryNT'                        # mud
ssh fierymud 'sudo -n systemctl restart muditorNT-api muditorNT-web'    # muditor
```

- Check for online players before restarting `fieryNT`: `GET http://127.0.0.1:8080/api/admin/world/status` with the
  bearer token from `/opt/NEXT/.secrets/admin_token`. The server saves players on SIGTERM.
- `update.sh muditor` rebuilds in place, so the web app is briefly unavailable until restart. The `chgrp` step is non-fatal.
- Rust builds need `.sqlx/` offline data (gitignored): generate on a dev box with `cargo sqlx prepare --workspace` and
  rsync to `/opt/NEXT/fierymud-rs/.sqlx`, or provide a reachable `DATABASE_URL`. A release build takes ~8 min at 2 jobs.
- `env/fierymud-rs.env` must contain `MUD_ENV=production` (written by `phase1-strider.sh`). It is what makes the
  server refuse `MUD_DEV_MODE`, require `ADMIN_TOKEN` and hide dev-only commands. A host set up before this was added
  has no such line: re-run `phase1-strider.sh` (it keeps existing secrets and rewrites the env files, so the line is
  never duplicated) or append `MUD_ENV=production` once, then restart `fieryNT`.
- The web build bakes `NEXT_PUBLIC_*` from `/opt/NEXT/.env` at build time.
- python-prisma `disconnect()` hangs on this host; `/opt/NEXT/logs/watch*.sh` kill the idle query-engine.

## Sudo allowlist (strider)

Passwordless sudo is limited to: `systemctl restart fieryNT`, `systemctl restart muditorNT-api`,
`systemctl restart muditorNT-api muditorNT-web`, `systemctl daemon-reload`, `systemctl reload apache2`,
`apache2ctl configtest`, `psql` as `postgres`, and `/opt/NEXT/deploy/setup-root.sh` (subcommands
`prepare|certs|start|units|opt-perms|game-cert`).

## Security note

`setup-root.sh` is executed as root through sudo and is now version-controlled and reachable via the git checkout
(`/opt/NEXT/deploy` -> the repo). A malicious or mistaken commit to `main` that reaches the host with `git pull` therefore
means root on prod. Enable branch protection on `main` (required reviews, no force-push) and read any diff touching
`deploy/prod/` before pulling it on the host. `setup-root.sh` strips group/other write bits from the kit on every run, because the `fierymud` group (which also owns the legacy MUD's service account) must not be able to edit a root-executed script.

## Where errors go

Every error a user sees should also be in a server log:

- **Muditor API (GraphQL errors, including validation failures) and browser errors** both land in the API journal under
  greppable prefixes: `journalctl -u muditorNT-api -o cat | grep -E '\[(gql|client)-error\]'`.
  `[gql-error]` lines carry op, code, path, user, request id and the page route (variable names only, never values);
  client-class errors (validation, auth, not found) are WARN, everything else is ERROR with a stack. `[client-error]`
  lines come from `POST /api/client-errors` (window errors, unhandled rejections, React error boundary, Apollo errors).
- **API log files** (JSON lines, same entries as the journal): `$LOG_DIR` = `/opt/NEXT/logs/` (`error.log`, `warn.log`,
  `info.log`, `combined.log`; rotated at 10 MB, 10 files kept).
- **Game server (Rust)**: `journalctl -u fieryNT`.
- **Lua trigger errors**: the `ScriptErrorLog` model, i.e. table `script_error_log` (`psql ... -c 'SELECT * FROM script_error_log ORDER BY occurred_at DESC LIMIT 20;'`).

## Rollback

In `/opt/NEXT/<repo>`: `git checkout <sha>`, rebuild (`update.sh` pulls `--ff-only`, so build by hand or checkout the
branch again afterwards), then restart the unit. The old C++ build at `/opt/NEXT.cpp-backup-2026-10-06` is dead and only
kept as a backup.

## Secrets

Secrets live only in `/opt/NEXT/.secrets/` and `/opt/NEXT/env/*.env`. Rotation steps: [SECRETS_ROTATION.md](SECRETS_ROTATION.md).
