# Production (doom.fierymud.org)

The new Rust MUD (fierymud-rs) and Muditor run on the production host `doom.fierymud.org` (`ssh fierymud`, Ubuntu 24.04,
user `strider`, ~3.8 GiB RAM). The legacy CircleMUD (`fieryP` /opt/PRODUCTION port 4000, `fieryT` /opt/TEST port 9999,
/opt/DEV, user `fierymud`) shares the box and must never be touched.

Full runbook and first-install steps: [deploy/prod/README.md](../deploy/prod/README.md).

## How prod is laid out

Everything lives under `/opt/NEXT` (owner `strider:fierymud`, setgid):

| Path                                                 | Purpose                                                                            |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `fierymud-rs/`                                       | git checkout, NOT built here any more; only its `state/` dir is used at runtime    |
| `releases/<sha12>/mud-server`, `current`, `previous` | game binaries built on the dev box (last 3 kept); `current` is what `fieryNT` runs |
| `muditor/`, `fierylib/`                              | git checkouts (muditor is built in place)                                          |
| `env/`                                               | `fierymud-rs.env`, `muditor.env`, `fierylib.env` (no values in git)                |
| `.secrets/`                                          | generated secrets (mode 700); never print or commit                                |
| `certs/`, `logs/`, `run/`, `backups/`, `tools/bun`   | game TLS cert, logs, runtime state, daily `pg_dump` (cron 04:15), private bun      |
| `deploy/`                                            | symlink to `/opt/NEXT/muditor/deploy/prod` (this repo's kit)                       |

| Unit            | What                                | Port                                       |
| --------------- | ----------------------------------- | ------------------------------------------ |
| `fieryNT`       | Rust MUD (telnet / TLS, admin HTTP) | 4003, 4443 (Let's Encrypt), 127.0.0.1:8080 |
| `muditorNT-api` | Muditor API (`bun dist/main.js`)    | 127.0.0.1:3001                             |
| `muditorNT-web` | Muditor web (`next start`)          | 127.0.0.1:3000                             |

Apache vhosts `05-muditor.conf` / `05-muditor-le-ssl.conf` front `muditor.fierymud.org` and
`muditor-api.fierymud.org`. Database: local PostgreSQL 16, db and role `fierynext`.

## How to update

### Game server (fierymud-rs): `deploy-game.sh`, run on the dev box (minastirith)

**Never build Rust on the prod host** (3.9 GB RAM, 4 cores: release builds took 15-40 min, drove load to 73, and a
reboot followed). `update.sh mud` is retired and exits with an error.

```bash
cd ~/Code/mud/muditor/deploy/prod
./deploy-game.sh <sha>                      # full deploy of a commit that is on fierymud-rs origin/main
./deploy-game.sh <sha> --stage-only         # build + upload + `mud-server --version` on the host; no switch, no restart
./deploy-game.sh <sha> --sql a.sql b.sql    # apply SQL (as postgres) after the backup, before the switch
./deploy-game.sh --rollback                 # repoint current -> previous and restart (or: --rollback <release>)
./deploy-game.sh --status                   # releases, unit ExecStart, who is online
./deploy-game.sh --health [secs]            # read-only: the post-restart health checks against the live server
./deploy-game.sh --backup                   # take + verify a DB backup now
```

Other flags: `--skip-tests`, `--force` (restart although players other than Strider/Chinok are online),
`--install-units` (one-time, below), `--ignore-schema`, `--allow-unpushed`, `--no-backup`.

What it does, in order: preflight (clean worktree `.worktrees/deploy-43e9086` checked out at the SHA; `cargo fmt --check`,
`clippy -D warnings`, `cargo test`) -> `cargo zigbuild --release --target x86_64-unknown-linux-gnu.2.39` in
`CARGO_TARGET_DIR=.cargo-target/slot-4` (links against prod's glibc 2.39; no openssl, rustls only; Lua is vendored) ->
upload to `/opt/NEXT/releases/<sha12>/` and run `mud-server --version` there (must print the SHA) -> schema check ->
players check (`/api/admin/players`; refuses unless only Strider/Chinok, or `--force`) -> `pg_dump` into
`/opt/NEXT/backups/pre-game-<sha>-<ts>.dump`, verified with `/usr/lib/postgresql/18/bin/pg_restore -l`, newest 10 kept ->
optional `--sql` (each file re-run once, change counts printed) -> atomic `current` symlink flip + `sudo systemctl restart fieryNT` ->
2 minutes of health checks (unit `active` and same PID/no restarts, `world/status` 200, admin API 401 without a token, no
`ERROR`/panic lines in a bounded `journalctl --since <restart> -n 500`) -> prune to the last 3 releases. If any check fails
it **rolls back automatically** (symlink to the previous release, restart, 45 s health check) and exits non-zero. One ssh
ControlMaster connection serves the whole run; remote `journalctl`/`curl` calls are all bounded.

sqlx: queries are checked at compile time against the local dev DB (`DATABASE_URL` from `fierymud-rs/.env`, read only,
`SQLX_OFFLINE=false`; the gitignored `.sqlx` is not used). Because the binary is built against the dev schema, the script
then compares `information_schema.columns` (table, column, type, nullability) of dev and prod and refuses to switch if
prod lacks something dev has (run `update.sh muditor`, which does `prisma db push`, or `--sql` first; override with
`--ignore-schema`). `--stage-only` only reports it.

Rollback: `./deploy-game.sh --rollback` (previous release) or by hand on the host:
`cd /opt/NEXT/releases && ln -sfn <old-sha> current.new && mv -T current.new current`, then
`sudo -n systemctl restart fieryNT`. A rollback does not undo SQL; restore from `/opt/NEXT/backups/pre-game-*.dump`
(use the pg_restore 18 binary) only if a data change must be reverted.

One-time switch of the unit: `fieryNT.service` used to run `/opt/NEXT/fierymud-rs/target/release/mud-server`. The kit's
unit now runs `/opt/NEXT/releases/current/mud-server`. The first full deploy needs `--install-units`, which does
`git -C /opt/NEXT/muditor pull --ff-only` on the host and `sudo -n /opt/NEXT/deploy/setup-root.sh units` (both allowed);
the deploy script has already seeded `releases/legacy-<date>` from the in-place build and pointed `current` at it, so the
unit never points at a missing file. It takes effect at the restart that the same deploy performs.

### Muditor: `update.sh muditor` (runs on the host)

```bash
ssh fierymud 'bash -lc "/opt/NEXT/deploy/update.sh muditor"'   # or: all (= muditor now)
ssh fierymud 'sudo -n systemctl restart muditorNT-api muditorNT-web'
```

`update.sh` does `git pull --ff-only`, `prisma db push`, the idempotent `sql/*.sql` seeds and `bun run build` (under
`nice -n 10 ionice -c3`), then prints the restart lines; it never restarts anything itself. It refuses to start if a
`cargo`/`rustc` process is running or the 1-minute load is above 4. Always pass the target explicitly.

- Check for online players before restarting `fieryNT`: the deploy script does it for you
  (`GET http://127.0.0.1:8080/api/admin/players` with the bearer token from `/opt/NEXT/.secrets/admin_token`; the token
  never leaves the host shell). The server saves players on SIGTERM.
- `update.sh muditor` rebuilds in place, so the web app is briefly unavailable until restart. The `chgrp` step is non-fatal.
- `env/fierymud-rs.env` must contain `MUD_ENV=production` (written by `phase1-strider.sh`). It is what makes the
  server refuse `MUD_DEV_MODE`, require `ADMIN_TOKEN` and hide dev-only commands. A host set up before this was added
  has no such line: re-run `phase1-strider.sh` (it keeps existing secrets and rewrites the env files, so the line is
  never duplicated) or append `MUD_ENV=production` once, then restart `fieryNT`.
- The web build bakes `NEXT_PUBLIC_*` from `/opt/NEXT/.env` at build time.
- python-prisma `disconnect()` hangs on this host; `/opt/NEXT/logs/watch*.sh` kill the idle query-engine.

### Host hygiene (read before running anything on prod)

- Logs: every `journalctl` is `timeout 20 journalctl -u <unit> --since "<when>" --no-pager -n <N>`; never `-f`, never unbounded.
- Never `pgrep -f` (it matches its own ssh/bash command line); use `pgrep -x <name>` or poll pid/log files.
- Never leave background ssh jobs behind. Long work on the host: `nohup ... < /dev/null`, pid file, poll the log.
- After any session, `ps -u strider -o pid,etime,pcpu,args --sort=-pcpu | head` should show nothing of ours.

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
  greppable prefixes: `timeout 20 journalctl -u muditorNT-api --since '2 hours ago' --no-pager -n 2000 -o cat | grep -E '\[(gql|client)-error\]'`.
  `[gql-error]` lines carry op, code, path, user, request id and the page route (variable names only, never values);
  client-class errors (validation, auth, not found) are WARN, everything else is ERROR with a stack. `[client-error]`
  lines come from `POST /api/client-errors` (window errors, unhandled rejections, React error boundary, Apollo errors).
- **API log files** (JSON lines, same entries as the journal): `$LOG_DIR` = `/opt/NEXT/logs/` (`error.log`, `warn.log`,
  `info.log`, `combined.log`; rotated at 10 MB, 10 files kept).
- **Game server (Rust)**: `timeout 20 journalctl -u fieryNT --since '1 hour ago' --no-pager -n 500` (always bounded, never `-f`).
- **Lua trigger errors**: the `ScriptErrorLog` model, i.e. table `script_error_log` (`psql ... -c 'SELECT * FROM script_error_log ORDER BY occurred_at DESC LIMIT 20;'`).

## Rollback

Game: `deploy-game.sh --rollback` (see above). Muditor: in `/opt/NEXT/muditor`, `git checkout <sha>`, rebuild by hand
(`update.sh` pulls `--ff-only`; return to `main` afterwards), then restart the two units. The old C++ build at `/opt/NEXT.cpp-backup-2026-10-06` is dead and only
kept as a backup.

## Secrets

Secrets live only in `/opt/NEXT/.secrets/` and `/opt/NEXT/env/*.env`. Rotation steps: [SECRETS_ROTATION.md](SECRETS_ROTATION.md).
