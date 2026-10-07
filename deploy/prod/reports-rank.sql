-- Open player reports with computed rank, for error-digest.sh.
--
-- THIS FILE MIRRORS apps/api/src/reports/report-ranking.ts (the API/Reports page formula).
-- If you change a weight or the duplicate rule there, change it here too. The shared fixture in
-- tests/error-digest.test.sh (same rows as report-ranking.spec.ts "matches the SQL mirror
-- fixture") fails if the two drift.
--
--   score = typeWeight (BUG 50, TYPO 15, IDEA 10)
--         + 25 * log2(1 + duplicates)
--         + 10 * min(distinctReporters, 5)      -- own author + authors of duplicates
--         + recency (20 if < 24h old, 10 if < 7d)
--         + priority override (P0 +100, P1 +60, P2 +20, P3 0)
--   duplicates = reports with duplicate_of_id = this one
--                + OPEN/IN_PROGRESS reports of the same type in the same non-null room whose
--                  message has token-Jaccard similarity >= 0.8 (tokens = unique runs of [a-z0-9]
--                  after lowercasing).
--
-- Usage: psql -v now_ts='2026-10-07 12:00:00+00' -At -F $'\t' -f reports-rank.sql
-- Output (tab separated, open reports only, best first):
--   id, rank, score, type, status, priority(-1 = none), duplicates, reporter, room(z:r or -),
--   age_seconds, message (single line, max 200 chars)
WITH
params AS (SELECT :'now_ts'::timestamptz AS now_ts),
r AS (
  SELECT id,
         report_type::text AS rtype,
         status::text AS st,
         reporter_name,
         room_zone_id,
         room_id,
         message,
         priority,
         duplicate_of_id,
         created_at AT TIME ZONE 'UTC' AS created_utc,
         (SELECT COALESCE(array_agg(DISTINCT tok), '{}'::text[])
            FROM regexp_split_to_table(regexp_replace(lower(message), '[^a-z0-9]+', ' ', 'g'), ' ') AS tok
           WHERE tok <> '') AS toks
    FROM reports
),
open_r AS (SELECT * FROM r WHERE st IN ('OPEN', 'IN_PROGRESS')),
pairs AS (
  SELECT duplicate_of_id AS a, id AS b FROM r WHERE duplicate_of_id IS NOT NULL AND duplicate_of_id <> id
  UNION
  SELECT a.id, b.id
    FROM open_r a
    JOIN open_r b
      ON a.id <> b.id
     AND a.rtype = b.rtype
     AND a.room_zone_id = b.room_zone_id
     AND a.room_id = b.room_id
    CROSS JOIN LATERAL (SELECT count(*)::numeric AS inter FROM unnest(a.toks) AS t WHERE t = ANY (b.toks)) AS i
   WHERE cardinality(a.toks) > 0
     AND cardinality(b.toks) > 0
     AND i.inter / (cardinality(a.toks) + cardinality(b.toks) - i.inter) >= 0.8
),
scored AS (
  SELECT o.*,
         (SELECT count(*) FROM pairs p WHERE p.a = o.id) AS dups,
         (SELECT count(DISTINCT n)
            FROM (SELECT o.reporter_name AS n
                  UNION ALL
                  SELECT d.reporter_name FROM pairs p JOIN r d ON d.id = p.b WHERE p.a = o.id) AS x) AS reporters
    FROM open_r o
),
final AS (
  SELECT s.*,
         round(
           CASE s.rtype WHEN 'BUG' THEN 50 WHEN 'TYPO' THEN 15 ELSE 10 END
           + 25 * log(2::numeric, (1 + s.dups)::numeric)
           + 10 * least(s.reporters, 5)
           + CASE WHEN p.now_ts - s.created_utc < interval '24 hours' THEN 20
                  WHEN p.now_ts - s.created_utc < interval '7 days' THEN 10
                  ELSE 0 END
           + CASE s.priority WHEN 0 THEN 100 WHEN 1 THEN 60 WHEN 2 THEN 20 ELSE 0 END
         )::int AS score,
         extract(epoch FROM p.now_ts - s.created_utc)::bigint AS age_s
    FROM scored s CROSS JOIN params p
)
SELECT id,
       row_number() OVER (ORDER BY score DESC, created_utc DESC, id DESC),
       score,
       rtype,
       st,
       COALESCE(priority, -1),
       dups,
       regexp_replace(reporter_name, '[[:space:]]+', ' ', 'g'),
       CASE WHEN room_zone_id IS NULL OR room_id IS NULL THEN '-' ELSE room_zone_id || ':' || room_id END,
       age_s,
       left(regexp_replace(message, '[[:space:]]+', ' ', 'g'), 200)
  FROM final
 ORDER BY 2;
