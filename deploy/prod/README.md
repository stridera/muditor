# Fiery Mud NEXT (Rust) deployment kit (doom.fierymud.org)

**This kit takes over the existing `/opt/NEXT` slot.** `/opt/NEXT` currently holds an old, crash-looping
C++ build (`fieryNT.service`, vendor unit `/usr/lib/systemd/system/fieryNT.service`, 475 restarts, DB/Redis on
mail.fierymud.org). `setup-root.sh prepare` stops and disables that service, moves the whole old directory to
`/opt/NEXT.cpp-backup-YYYY-MM-DD`, and moves the new tree into `/opt/NEXT`. The old `/opt/NEXT/.env` (with the
remote DB credentials) is preserved inside the backup; the backup is hidden from the new units
(`InaccessiblePaths`) and can be deleted later with sudo once you are happy. The new `fieryNT.service` is
installed to `/etc/systemd/system/` and overrides the vendor unit; the vendor file is left untouched.
Names: DB and role `fierynext`; units `fieryNT`, `muditorNT-api`, `muditorNT-web`; home symlinks
`/home/strider/fierynext` and (kept for now) `/home/strider/fierymudv3` both point to `/opt/NEXT`.

This kit lives in the Muditor repo at `deploy/prod/`. On the prod host `/opt/NEXT/deploy` is a symlink to
`/opt/NEXT/muditor/deploy/prod`, so `git pull` in `/opt/NEXT/muditor` updates the kit. Scripts locate their
sibling files (`units/`, `apache/`) relative to themselves, so the kit can run from any checkout. For a first
install, clone the repo and run the scripts from `deploy/prod/` (or stage it at `~/fierymudv3/deploy/`).
See `docs/PROD.md` for the short overview.
Nothing here touches the legacy prod MUD (ports 4000/9999) or its files.

## Runbook (in order)

0. **Prerequisites (outside this kit)**
   - GoDaddy DNS: add CNAMEs `muditor` and `muditor-api` -> `doom.fierymud.org`.
   - Google OAuth console (same OAuth app): add authorized redirect URI
     `https://muditor-api.fierymud.org/api/auth/google/callback` and origin `https://muditor.fierymud.org`.
   - Clones exist at `~/fierymudv3/{fierymud-rs,muditor,fierylib}`; `cargo build --release` in
     `fierymud-rs` has FINISHED (prepare moves the directory); poetry and bun are installed for strider.
   - Put the Google OAuth values in `~/fierymudv3/.secrets/google_client_id` and
     `google_client_secret` (mode 600) before phase 1 (or re-run phase 1 after adding them).
1. `deploy/prod/phase1-strider.sh` (strider): secrets, env files, self-signed cert, bun copy.
2. `sudo deploy/prod/setup-root.sh prepare`: stops/disables old `fieryNT`, backs up the old C++ `/opt/NEXT` to `/opt/NEXT.cpp-backup-<date>`, moves the tree to `/opt/NEXT` (symlinks left at the old
   path and at `~/fierynext`), perms, env symlinks, PostgreSQL role+db `fierynext`, Apache modules + `05-muditor` vhost,
   certbot if DNS resolves, installs + enables (does not start) the systemd units, opens ufw 4003/4443.
3. `/opt/NEXT/deploy/phase2-strider.sh [--reimport]` (strider; resumable: skips the fierylib import when `Zones` already has rows, always re-ensures the admin account, GameConfig rows and grants, then builds muditor; the build runs per step with a log and warns below 1500 MB free): fierylib reset + import from `/opt/PRODUCTION/lib`
   (log `/opt/NEXT/logs/import.log`; run WITHOUT `--with-users`, so no test accounts are seeded), GameConfig
   rows, one bootstrap web account (PLAYER until you link a level-100+ character; 104 = CODER, 105 = IMPLEMENTOR), muditor build (`build-muditor.log`), builder grants.
   **Web login:** email `stridera@gmail.com`, password in `/opt/NEXT/.secrets/admin_web_password`
   (generated on first run; rerunning phase2 re-applies it). Builder grants seed 0 rows initially because
   no BUILDER users exist yet; it only needs the IMPLEMENTOR row. Phase 2 uses `/opt/NEXT/.secrets/pgpass`
   so no DB password appears on command lines.
4. `sudo /opt/NEXT/deploy/setup-root.sh start`: starts the three services and smoke-tests them.
5. After DNS propagates: `sudo /opt/NEXT/deploy/setup-root.sh certs`. Certbot writes
   `/etc/apache2/sites-available/05-muditor-le-ssl.conf` and adds the http->https redirect.
   NOTE: `NEXT_PUBLIC_*` URLs are https and baked at build; the web app is only usable once certs exist.

Other `setup-root.sh` subcommands: `opt-perms` (adds only `g+x` to `/opt`, prints before/after) and `units` (reinstalls
`units/*.service` into `/etc/systemd/system/` with the `@BACKUP_PATHS@` substitution, `daemon-reload`, prints
`TimeoutStopUSec` of muditorNT-api).

`setup-root.sh game-cert` makes the game's TLS listener (4443) present the Let's Encrypt cert for fierymud.org
(falls back to the `doom.fierymud.org` lineage; if neither exists it prints the `certbot certonly --apache -d fierymud.org
-d doom.fierymud.org` command and exits 1). It prints the lineage and SANs, installs the certbot deploy hook
`/etc/letsencrypt/renewal-hooks/deploy/fierynext-game-cert.sh`, creates the flag file
`/opt/NEXT/run/game-cert-autorestart`, runs the hook once (copies fullchain/privkey to `/opt/NEXT/certs/server.{crt,key}`,
mode 0640 strider:fierymud, previous files kept as `*.bak`, aborts if key and cert do not match), restarts fieryNT and prints
the cert served on 127.0.0.1:4443. Renewals propagate via the deploy hook; rustls cannot reload live, so the hook restarts
fieryNT after each renewal. Remove the flag file to disable auto-restart (the files are still copied; restart fieryNT yourself).

**Flag location change (2026-10-06):** the flag moved from `/opt/NEXT/deploy/game-cert-autorestart` (now inside the git
checkout) to `/opt/NEXT/run/game-cert-autorestart`. The hook installed before the change still tests the old path. On the
prod host the old path is kept alive as an untracked symlink (`deploy/prod/game-cert-autorestart` -> `/opt/NEXT/run/...`,
listed in `muditor/.git/info/exclude`), so renewals keep working. Re-run `sudo /opt/NEXT/deploy/setup-root.sh game-cert`
once during a quiet window (it restarts fieryNT) to regenerate the hook with the new path, then delete the symlink.

## Migrating from the earlier layout

If an earlier run of this kit already moved the tree to `/opt/V3` (units `fieryV3`, `muditorV3-api`,
`muditorV3-web`, DB/role `fierymudv3`), `setup-root.sh prepare` migrates it in place and idempotently: it
disables and removes those units (so the live mud goes down until `start`), stops the old C++ `fieryNT` and backs
up `/opt/NEXT`, moves `/opt/V3` to `/opt/NEXT`, recreates the `~/fierymudv3` and `~/fierynext` symlinks owned by
strider, re-points in-tree symlinks, renames the role and database to `fierynext` (data is kept) and rewrites
`.secrets/pgpass`. The cargo `target/` dir embeds the old absolute path, so the next `cargo build` may rebuild
workspace crates; the existing binary keeps working. Run order stays: `sudo deploy/prod/setup-root.sh prepare`,
`/opt/NEXT/deploy/phase2-strider.sh`, `sudo /opt/NEXT/deploy/setup-root.sh start`, then `... certs`.

## Ports

| Port        | Bind      | Purpose                                |
| ----------- | --------- | -------------------------------------- |
| 4000 / 9999 | -         | LEGACY prod MUD (untouched)            |
| 4003        | 0.0.0.0   | NEXT telnet                            |
| 4443        | 0.0.0.0   | NEXT TLS telnet (self-signed cert)     |
| 8080        | 127.0.0.1 | NEXT admin HTTP (bearer `ADMIN_TOKEN`) |
| 3000        | 127.0.0.1 | Muditor web (Apache proxies it)        |
| 3001        | 127.0.0.1 | Muditor API / GraphQL (Apache proxies) |

## Layout

`/opt/NEXT/{fierymud-rs,muditor,fierylib,env,.secrets,certs,tools/bun,logs,run,backups,deploy}`
(`deploy` -> `muditor/deploy/prod`). Env files live in
`/opt/NEXT/env/` (640 strider:fierymud) and are symlinked to where each app expects `.env`.
Secrets in `/opt/NEXT/.secrets/` (700, never group-readable). Re-running phase1 is safe: it keeps existing
secrets/cert/bun and preserves file modes.

## Update procedure

`/opt/NEXT/deploy/update.sh [mud|muditor|all]` pulls (ff-only) and rebuilds, then prints the restart
lines to run yourself (the build rewrites `.next`/`dist` in place, so NEXT-web may blip until restarted): `sudo systemctl restart fieryNT` and/or `sudo systemctl restart muditorNT-api muditorNT-web`.

### Schema push and SQL seeds (muditor target)

`update.sh muditor` also rolls out DB changes, after `db:generate` and before the build: (1) `bunx prisma db push
--skip-generate` from `muditor/packages/db`, with `DATABASE_URL` from `/opt/NEXT/env/muditor.env` (sourced in a
subshell, never printed); no `--accept-data-loss`, so a destructive schema change aborts the update; (2) every
`deploy/prod/sql/*.sql` file in name order via `psql -v ON_ERROR_STOP=1` (auth: `PGPASSFILE=/opt/NEXT/.secrets/pgpass`,
user/db `fierynext` on 127.0.0.1). Any failure stops the script before the build. **Files in `sql/` run on every update
and must be idempotent** (`ON CONFLICT ... DO NOTHING` or `WHERE NOT EXISTS`) and must never overwrite builder edits.
Prod-only rows (e.g. `GameConfig security/website_url`) belong here, not in the dev seeds.

## Logs and status

- `journalctl -u fieryNT -f`, `journalctl -u muditorNT-api -f`, `journalctl -u muditorNT-web -f`
- `/opt/NEXT/logs/` (import.log, build-muditor.log, API LOG_DIR), Apache: `/var/log/apache2/muditor-*.log`
- `systemctl status fieryNT muditorNT-api muditorNT-web`

## Rollback

`sudo systemctl stop fieryNT muditorNT-api muditorNT-web` (add `disable` to prevent boot start). The old C++ build is at the backup path (its unit was disabled; re-enable by restoring the directory and removing `/etc/systemd/system/fieryNT.service`). Legacy
MUD is unaffected. To drop the Apache site: `sudo a2dissite 05-muditor 05-muditor-le-ssl && sudo systemctl reload apache2`.

## Needs sudo (everything else runs as strider)

Hardening: the units run as `fierymud` with `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`, and
`/opt/PRODUCTION`, `/opt/TEST`, `/opt/DEV` and the C++ backup hidden; writable only `/opt/NEXT/{logs,run}` plus mud `state/`,
web `.next/cache`, and api `src/` (NestJS rewrites `schema.gql` at boot).

Moving to `/opt/NEXT` and chown/chmod; creating the PostgreSQL role/database; `a2enmod`/`a2ensite`, Apache
reload; certbot; installing/enabling/starting systemd units; ufw rules. All of it is in `setup-root.sh`.

## One-time: let strider manage group ownership

`sudo usermod -aG fierymud strider` (then re-login). Without it, `update.sh` cannot `chgrp` build output; services still read it through the setgid directory and world-read bits, so this is cosmetic.
