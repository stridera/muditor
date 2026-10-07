#!/usr/bin/env bash
# Self-test for error-digest.sh helpers (redact / normalise / aggregate / ANSI strip).
# Run: deploy/prod/error-digest.sh --self-test   (or bash this file directly)
set -euo pipefail
HERE="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")"
# shellcheck source=../error-digest.sh
source "$HERE/../error-digest.sh"

fails=0
ok() { echo "ok   - $1"; }
bad() { echo "FAIL - $1"; shift; printf '       %s\n' "$@"; fails=$((fails + 1)); }
eq() { # name expected actual
  if [[ "$2" == "$3" ]]; then ok "$1"; else bad "$1" "expected: $2" "actual:   $3"; fi
}
has() { # name needle haystack
  if [[ "$3" == *"$2"* ]]; then ok "$1"; else bad "$1" "missing: $2" "in: $3"; fi
}
lacks() {
  if [[ "$3" != *"$2"* ]]; then ok "$1"; else bad "$1" "leaked: $2" "in: $3"; fi
}
sig() { printf '%s\n' "$1" | strip_ansi | redact | normalise; }

# --- ANSI stripping (tracing's default formatter on journald, pre-with_ansi fix)
esc=$'\x1b'
ansi="${esc}[2m2026-10-06T22:58:32.849777Z${esc}[0m ${esc}[31mERROR${esc}[0m ${esc}[2mmud_server${esc}[0m${esc}[2m:${esc}[0m db timeout ${esc}[3mconn_id${esc}[0m${esc}[2m=${esc}[0m1099511627922"
eq "ansi stripped" "2026-10-06T22:58:32.849777Z ERROR mud_server: db timeout conn_id=1099511627922" "$(printf '%s\n' "$ansi" | strip_ansi)"
eq "ansi line normalises" "{ts} ERROR mud_server: db timeout conn_id={n}" "$(sig "$ansi")"

# --- grouping: variable parts collapse to the same signature
a=$(sig '2026-10-06T22:48:37.751836Z ERROR tick: mud_server::login: save failed character_id=23f6b56b-23c8-4536-9fd6-aba7008889ca hp=1277 peer=50.125.254.152:56449')
b=$(sig '2026-10-07T01:02:03.000001Z ERROR tick: mud_server::login: save failed character_id=0964003e-8cf5-4ec9-8e6f-1b42f7450766 hp=1277 peer=10.0.0.7:1234')
eq "uuid/ip/numbers>2 digits group together" "$a" "$b"
has "placeholders present" "character_id={uuid}" "$a"
has "2-digit numbers kept" "hp={n}" "$a"
eq "short numbers kept" "retry #{n} in {n}ms" "$(sig 'retry #97 in 30000ms')"
eq "retry counters group" "$(sig 'Redis connection retry #97, next attempt in 30000ms')" "$(sig 'Redis connection retry #100, next attempt in 30000ms')"
eq "nest prefix groups" "$(sig '[Nest] 132735  - 10/06/2026, 6:55:29 PM   WARN [BridgeService] x')" "$(sig '[Nest] 99  - 11/07/2026, 11:05:01 AM   WARN [BridgeService] x')"
eq "hex ids" "obj {hex} at {hex}" "$(sig 'obj deadbeef12 at 0x7ffd1234')"
eq "short numbers untouched" "zone 30 room 54" "$(sig 'zone 30 room 54')"
eq "long quoted string collapsed" 'bad input "{str}" end' "$(sig 'bad input "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" end')"
eq "short quoted string kept" 'bad input "abc" end' "$(sig 'bad input "abc" end')"
eq "apostrophes in prose not eaten" "it can't be done and it won't be done, sorry about that really" \
  "$(sig "it can't be done and it won't be done, sorry about that really")"

# --- redaction
for line in \
  'login failed password=hunter2 user=x' \
  'login failed Password: hunter2 user=x' \
  '{"password":"hunter2","user":"x"}' \
  'auth header authorization: Bearer abc.def.ghi' \
  'Authorization=Basic hunter2' \
  'refresh_token=hunter2&x=1' \
  'secret "hunter2"' \
  'got jwt eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijk end'; do
  out=$(printf '%s\n' "$line" | redact)
  lacks "redacted: ${line:0:40}" "hunter2" "$out"
  lacks "redacted (bearer/jwt): ${line:0:40}" "abc.def.ghi" "$out"
  lacks "redacted (jwt): ${line:0:40}" "eyJhbGci" "$out"
done
out=$(printf 'msg="Variable \\"$i\\" got invalid value { email: \\"a@b.c\\", pw: \\"zzz\\" }; at x"\n' | redact)
lacks "gql variable values dropped" "a@b.c" "$out"
has "gql variable message prefix kept" "got invalid value {redacted}" "$out"
has "bearer token placeholder" "Bearer {redacted}" "$(printf 'Bearer sekret123\n' | redact)"
eq "non-secret text untouched" "user alice logged in" "$(printf 'user alice logged in\n' | redact)"

# --- aggregate: counts, first/last, example truncation, redaction in examples, markdown escaping
WORK=$(mktemp -d); trap 'rm -rf "$WORK"' EXIT
long=$(printf 'x%.0s' $(seq 1 400))
table=$(
  {
    printf '2026-10-06T10:00:00\t\tWARN [A] failed id=11111 token=abc123 | pipe\n'
    printf '2026-10-06T12:00:00\t\tWARN [A] failed id=22222 token=zzz999 | pipe\n'
    printf '2026-10-06T11:00:00\t\tWARN [A] failed id=33333 token=qqq777 | pipe\n'
    printf '2026-10-06T09:00:00\t\tERROR [B] %s\n' "$long"
    printf '2026-10-06T08:00:00\t30:123\tboom\n'
    printf '2026-10-06T08:30:00\t30:124\tboom\n'
  } | aggregate t 0 test
)
has "3 repeats grouped, count 3" "| 3 | 2026-10-06 10:00:00 | 2026-10-06 12:00:00 |" "$table"
has "separate prefix keys stay separate (30:123)" "30:123 boom" "$table"
has "separate prefix keys stay separate (30:124)" "30:124 boom" "$table"
lacks "token value not in table" "abc123" "$table"
lacks "token value not in table (2)" "zzz999" "$table"
has "pipe escaped for markdown" '\|' "$table"
lacks "example truncated to 300" "$(printf 'x%.0s' $(seq 1 301))" "$table"
eq "stats distinct/total" $'4\t6' "$(cat "$WORK/agg.t.stats")"
has "cands written" "test" "$(cat "$WORK/agg.t.cands")"
# empty prefix must not shift columns (regression: read with tab IFS ate the empty field)
row=$(printf '2026-10-06T10:00:00\t\tERROR [Svc] oops id=12345\n' | aggregate r 0 test | tail -1)
eq "empty-prefix row layout" '| 1 | 2026-10-06 10:00:00 | 2026-10-06 10:00:00 | '"$(printf '%s' 'ERROR [Svc] oops id={n}' | sha1sum | cut -c1-8)"' | `ERROR [Svc] oops id={n}` | `ERROR [Svc] oops id=12345` |' "$row"
eq "empty input" "_No events in window._" "$(: | aggregate e 0 empty)"

# --- reports: rendering + top-5 candidates (no DB needed)
REPORTS_TOP_N=2
rep_tsv=$(printf '%s\n' \
  $'6\t1\t215\tBUG\tOPEN\t0\t1\tfrank\t32:3\t3600\tcrash on rest | token=abc123' \
  $'1\t2\t140\tBUG\tOPEN\t-1\t2\talice\t30:1\t7200\tdoor stuck' \
  $'4\t3\t55\tTYPO\tOPEN\t2\t0\tdave\t31:2\t259200\tteh sword' \
  $'5\t4\t20\tIDEA\tOPEN\t-1\t0\terin\t-\t2592000\tadd fishing')
rep_md=$(printf '%s\n' "$rep_tsv" | render_reports)
has "reports table header" "| Rank | Score | Type |" "$rep_md"
has "reports row: rank 1 with P0 and room" "| 1 | 215 | BUG | 6 | OPEN | P0 | 1 | 1h | frank | 32:3 |" "$rep_md"
has "reports age in hours" "| 2h |" "$rep_md"
lacks "reports table limited to top N" "teh sword" "$rep_md"
lacks "reports message redacted" "abc123" "$rep_md"
rep_c=$(printf '%s\n' "$rep_tsv" | reports_cands)
has "BUG >= 60 is a top candidate" $'1\t215\treport\t#6\t' "$rep_c"
has "second BUG candidate" $'1\t140\treport\t#1\tdoor stuck' "$rep_c"
lacks "TYPO is not a top candidate" "teh sword" "$rep_c"
lacks "candidate message redacted" "abc123" "$rep_c"

# --- reports: SQL rank mirrors apps/api/src/reports/report-ranking.ts (needs a reachable Postgres)
pick_psql() {
  if [[ -r $PGPASSFILE_DEFAULT ]] && PGPASSFILE=$PGPASSFILE_DEFAULT psql -h 127.0.0.1 -U fierynext -d fierynext -X -Atc 'select 1' >/dev/null 2>&1; then
    export PGPASSFILE=$PGPASSFILE_DEFAULT; echo "-h 127.0.0.1 -U fierynext -d fierynext"; return
  fi
  local d
  for d in ${DIGEST_TEST_DB:-} fierydev postgres; do
    [[ -n $d ]] && psql -X -d "$d" -Atc 'select 1' >/dev/null 2>&1 && { echo "-d $d"; return; }
  done
  return 1
}
if ! command -v psql >/dev/null 2>&1 || ! psql_args=$(pick_psql); then
  echo "skip - reports SQL fixture (no reachable Postgres)"
else
  # A TEMP table named "reports" shadows the real one for this session only; text columns
  # stand in for the enums (the SQL casts with ::text). Rows == "matches the SQL mirror fixture"
  # in report-ranking.spec.ts; now_ts = 2026-10-07T12:00:00Z.
  # shellcheck disable=SC2086
  sql_out=$(psql -X -q $psql_args -v ON_ERROR_STOP=1 -v now_ts='2026-10-07 12:00:00+00' -At -F $'\t' <<SQL
CREATE TEMP TABLE reports (id int, report_type text, status text, reporter_name text, room_zone_id int, room_id int,
  message text, priority int, duplicate_of_id int, created_at timestamp);
INSERT INTO reports VALUES
 (1,'BUG','OPEN','alice',30,1,'door stuck in the tavern',NULL,NULL,'2026-10-07 10:00:00'),
 (2,'BUG','OPEN','bob',30,1,'Door stuck in the tavern!',NULL,NULL,'2026-10-07 09:00:00'),
 (3,'BUG','IN_PROGRESS','carol',30,1,'door stuck in the tavern',NULL,NULL,'2026-10-05 10:00:00'),
 (4,'TYPO','OPEN','dave',31,2,'teh sword',2,NULL,'2026-10-04 12:00:00'),
 (5,'IDEA','OPEN','erin',NULL,NULL,'add fishing',NULL,NULL,'2026-09-07 12:00:00'),
 (6,'BUG','OPEN','frank',32,3,'crash on rest',0,NULL,'2026-10-07 11:00:00'),
 (7,'BUG','DUPLICATE','gina',32,4,'a duplicate of crash',NULL,6,'2026-10-07 11:00:00'),
 (8,'BUG','RESOLVED','hank',30,1,'resolved long ago',NULL,NULL,'2026-10-07 11:00:00');
\i $HERE/../reports-rank.sql
SQL
  )
  got=$(printf '%s\n' "$sql_out" | awk -F'\t' '{ printf "%s%s:%s/%s", (NR>1 ? " " : ""), $1, $3, $7 }')
  eq "SQL rank mirrors API formula (id:score/duplicates, ranked order)" "6:215/1 1:140/2 2:140/2 3:130/2 4:55/0 5:20/0" "$got"
fi

echo
if ((fails)); then echo "$fails FAILED"; exit 1; fi
echo "all passed"
