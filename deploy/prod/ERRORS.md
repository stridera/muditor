# Error review on prod (doom.fierymud.org)

Goal: reviewing errors should be one file read, not a log-archaeology session.
A daily digest groups every error source into "top 25 distinct signatures" tables.

## Where each source logs

| Source | Where | How to read it directly |
|---|---|---|
| `fieryNT` (Rust game) | `tracing` text to stdout -> journald. Line shape: `<ts>Z LEVEL [span:] target: message key=value ...`. Older lines carry ANSI colour codes (the digest strips them; new builds emit plain text when not on a TTY). Panics are logged at ERROR with target `panic` (message, `location=`, `thread=`, `backtrace=`), then std's default stderr report follows. | `journalctl -u fieryNT --since "2 hours ago" -o cat \| sed -E 's/\x1b\[[0-9;]*m//g' \| grep -E ' (ERROR\|WARN) '` |
| `muditorNT-api` (NestJS) | journald: Nest console lines (`ERROR [Context] msg`), `[gql-error]` (every GraphQL error), `[client-error]` (browser-reported, WARN). Files: `LOG_DIR` = `/opt/NEXT/logs` (`combined.log`, `error.log`, JSON lines from LoggingService). | `journalctl -u muditorNT-api --since "2 hours ago" -o cat \| grep -E 'gql-error\|client-error\|ERROR'`; `tail /opt/NEXT/logs/error.log` |
| `muditorNT-web` (Next.js) | `next start` stdout -> journald | `journalctl -u muditorNT-web --since "2 hours ago" -o cat` |
| Lua triggers | DB table `script_error_log` (db `fierynext`): `trigger_zone_id, trigger_id, error_type, error_message, script_line, context_info, occurred_at` | `PGPASSFILE=/opt/NEXT/.secrets/pgpass psql -h 127.0.0.1 -U fierynext -d fierynext -c "SELECT * FROM script_error_log ORDER BY occurred_at DESC LIMIT 20"` |
| systemd | `systemctl show -p NRestarts,ActiveState <unit>`; start/exit events in each unit's journal | `systemctl status fieryNT muditorNT-api muditorNT-web` |

strider is in groups `systemd-journal` and `fierymud`, so none of this needs sudo.

## The digest

- Script: `/opt/NEXT/deploy/error-digest.sh` (versioned at `deploy/prod/error-digest.sh`). Runs as strider, read-only, idempotent.
- Output: `/opt/NEXT/logs/digest/YYYY-MM-DD.md`, with `latest.md` pointing at the newest. Digests older than 90 days are deleted. `cron.log` in the same directory holds cron output.
- Schedule: strider's crontab, daily 05:10 (host time):
  `10 5 * * * /opt/NEXT/deploy/error-digest.sh >> /opt/NEXT/logs/digest/cron.log 2>&1`
- Window: last 24 hours by default. A run takes about a minute (reads the journal).
- On demand (does not touch the daily files when `--out` is elsewhere):
  `/opt/NEXT/deploy/error-digest.sh --since "2 hours ago" --out /tmp && less /tmp/latest.md`
- Self-test (no host access needed): `deploy/prod/error-digest.sh --self-test`.

What is in it: a header with counts per source and any ALERT (unit not active, Lua table unreachable), a "Top 5 to look at" list
(server errors before client-reported ones, highest count first), the last 5 lines of `REVIEWS.md`, then one table per source with
count, first/last seen (UTC), a short id, the normalised signature and one example line (max 300 chars).

Signatures are normalised so repeats group: timestamps, pids, UUIDs, hex ids, IPs, numbers over 2 digits and quoted strings over 40
chars become placeholders (`{ts} {pid} {uuid} {hex} {ip} {n} {str}`). Anything resembling `password|token|secret|authorization ...`, `Bearer ...`,
`Basic ...` or a JWT is redacted before grouping and truncation. For the API's multi-line `GlobalExceptionFilter` JSON only the `type`
and `message` lines are kept (never context, bodies or variables). Lua errors group by `trigger zone:id [error_type]` plus normalised message.

Caveats: `[gql-error]`/`[client-error]` tables are empty until the API build that emits them is deployed. Journald must retain the window
(check `journalctl --disk-usage`; no `SystemMaxUse`/`MaxRetentionSec` is set at the time of writing, so it keeps months).

## Review procedure

1. `less /opt/NEXT/logs/digest/latest.md`: read the header, then "Top 5 to look at".
2. Pick the top items. Skip anything already listed under "Recent reviews" with a fix SHA that is deployed.
3. Reproduce: pull the raw lines around the example (`journalctl -u <unit> --since ... | grep <fragment>`), or for Lua open the trigger in Muditor.
4. Fix in the repo (fierymud-rs / muditor / fierylib trigger data), commit, deploy via `update.sh` + restart (see `docs/PROD.md`).
5. Record it in the review log (below).

### Reviewed section convention

Reviewers append one line per handled signature to `/opt/NEXT/logs/digest/REVIEWS.md`:

```
- YYYY-MM-DD reviewed by X: fixed <sig> in <sha>
```

Use the digest's 8-char id or a short signature for `<sig>`; use `won't fix: <reason>` or `not a bug: <reason>` in place of `fixed ... in <sha>`
when that is the outcome. `REVIEWS.md` is never rotated by the digest script.
