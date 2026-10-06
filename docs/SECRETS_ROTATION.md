# Secrets Rotation Runbook

## Rotation of 2026-10-05

The public repo `stridera/muditor` tracked `.env.development` and `.env.production`,
and the former carried the real `JWT_SECRET` and `FIERYMUD_ADMIN_TOKEN` used by the live
services. Those values were treated as compromised and rotated:

- `JWT_SECRET` (new random value, `openssl rand -base64 48`)
- `FIERYMUD_ADMIN_TOKEN` / game server `ADMIN_TOKEN` (new random value, `openssl rand -hex 32`)

Existing JWTs/sessions are invalidated; users must log in again.

## Where live secrets live (never committed)

- `/home/strider/Code/mud/.env` (mode 600) - the live file. `muditor/.env` and
  `muditor/apps/web/.env` are symlinks to it. Holds `JWT_SECRET`, `FIERYMUD_ADMIN_TOKEN`,
  DB password, Google OAuth secret.
- `muditor/.env.prod`, `muditor/.env.test` - gitignored local copies, rotated to the same values.
- `~/ecosystem.config.js` (mode 600) - `fierymud-rs` entry `env.ADMIN_TOKEN` must equal
  `FIERYMUD_ADMIN_TOKEN`. Backup of the pre-rotation file: `~/ecosystem.config.js.bak-2026-10-05`
  (contains no rotated secrets, delete when no longer needed).

`.env.development` and `.env.production` are now untracked (gitignored) and hold only
`change-me` placeholders. `.env.example` is the only tracked template.

## Operator steps after rotation

```bash
pm2 restart muditor-api muditor-web fierymud-rs --update-env
# if the ecosystem file changed process definitions (script path, args), reload it:
pm2 startOrReload ~/ecosystem.config.js --update-env
pm2 save
```

`fierymud-rs` now runs `target/release/mud-server`; build it first
(`cd ~/Code/mud/fierymud-rs && cargo build --release`).

To rotate again:

```bash
openssl rand -base64 48   # JWT_SECRET
openssl rand -hex 32      # FIERYMUD_ADMIN_TOKEN and ADMIN_TOKEN (must match)
```

Update `/home/strider/Code/mud/.env` and `~/ecosystem.config.js`, then restart as above.

## Git history

History still contains the old values. They are dead after rotation, so this is
only a hygiene issue. Do not rely on them being secret, and do not reuse them.
To purge them (optional, rewrites history, requires a force-push and every clone
to re-sync; run from a fresh clone):

```bash
git filter-repo --invert-paths --path .env.development --path .env.production
git push --force --all && git push --force --tags
```

Also consider GitHub secret-scanning alerts and cached forks/PRs, which a history
rewrite does not remove.
