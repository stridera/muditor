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

echo
if ((fails)); then echo "$fails FAILED"; exit 1; fi
echo "all passed"
