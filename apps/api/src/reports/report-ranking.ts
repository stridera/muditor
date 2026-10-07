import type { ReportStatus, ReportType } from '@muditor/db';

/**
 * Player report ranking. ONE formula, used by the Reports page/API.
 *
 * deploy/prod/reports-rank.sql (the daily error digest) MIRRORS this function in SQL.
 * If you change a weight here, change it there too; the shared fixture in
 * report-ranking.spec.ts and deploy/prod/tests/error-digest.test.sh keeps them honest.
 *
 *   score = typeWeight
 *         + DUPLICATE_WEIGHT * log2(1 + duplicates)
 *         + REPORTER_WEIGHT  * min(distinctReporters, REPORTER_CAP)
 *         + recency
 *         + priorityBonus
 *
 * Tuning notes:
 *  - typeWeight: a BUG outranks a TYPO outranks an IDEA, all else equal.
 *  - duplicates (log scale): the 1st duplicate is worth +25, the 3rd +50, the 7th +75, so
 *    "many people hit this" climbs but cannot drown out a manual P0.
 *  - distinctReporters counts the report's own author plus the authors of its duplicates,
 *    capped so one noisy group cannot dominate. A lone report scores REPORTER_WEIGHT.
 *  - recency: fresh reports surface for review; the bonus is gone after a week.
 *  - priority is a staff override (0=P0 critical ... 3=P3 low) and is deliberately the
 *    biggest knob: P0 always floats to the top.
 *
 * "Duplicates" = reports explicitly marked duplicateOf this one, plus OPEN/IN_PROGRESS reports
 * of the same type in the same (non-null) room whose normalised message has token-Jaccard
 * similarity >= SIMILARITY_THRESHOLD (see normaliseMessage / jaccard).
 */
export const RANK_WEIGHTS = {
  type: { BUG: 50, TYPO: 15, IDEA: 10 } as Record<ReportType, number>,
  duplicate: 25,
  reporter: 10,
  reporterCap: 5,
  recentDay: 20,
  recentWeek: 10,
  priority: [100, 60, 20, 0] as readonly number[],
} as const;

export const SIMILARITY_THRESHOLD = 0.8;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ScoreInput {
  type: ReportType;
  createdAt: Date;
  priority: number | null;
  /** Number of duplicate reports (explicit + similar). */
  duplicates: number;
  /** Distinct reporter names across this report and its duplicates (own author included). */
  distinctReporters: number;
}

/** The ranking formula. Returns a whole number so API and SQL agree exactly. */
export function computeReportScore(input: ScoreInput, now: Date): number {
  const w = RANK_WEIGHTS;
  const age = now.getTime() - input.createdAt.getTime();
  const recency =
    age < DAY_MS ? w.recentDay : age < 7 * DAY_MS ? w.recentWeek : 0;
  const priorityBonus =
    input.priority != null &&
    input.priority >= 0 &&
    input.priority < w.priority.length
      ? w.priority[input.priority]!
      : 0;
  const score =
    w.type[input.type] +
    w.duplicate * Math.log2(1 + Math.max(0, input.duplicates)) +
    w.reporter * Math.min(Math.max(0, input.distinctReporters), w.reporterCap) +
    recency +
    priorityBonus;
  return Math.round(score);
}

/** Lowercase, collapse everything that is not [a-z0-9] to spaces, unique tokens. */
export function normaliseMessage(message: string): Set<string> {
  return new Set(
    message
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .split(' ')
      .filter(Boolean)
  );
}

/** Token Jaccard similarity of two messages, 0..1 (0 when either has no tokens). */
export function jaccard(a: string, b: string): number {
  const ta = normaliseMessage(a);
  const tb = normaliseMessage(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

export interface RankableReport {
  id: number;
  reportType: ReportType;
  status: ReportStatus;
  reporterName: string;
  roomZoneId: number | null;
  roomId: number | null;
  message: string;
  priority: number | null;
  duplicateOfId: number | null;
  createdAt: Date;
}

export interface RankResult {
  score: number;
  similarCount: number;
}

const isOpen = (r: { status: ReportStatus }) =>
  r.status === 'OPEN' || r.status === 'IN_PROGRESS';

/**
 * Score every report in `targets` against `pool` (all open reports plus every report that
 * has duplicateOfId set). Returns a map keyed by report id.
 */
export function rankReports(
  targets: readonly RankableReport[],
  pool: readonly RankableReport[],
  now: Date
): Map<number, RankResult> {
  const out = new Map<number, RankResult>();
  const open = pool.filter(isOpen);
  for (const t of targets) {
    const dupes = new Map<number, RankableReport>();
    for (const p of pool) {
      if (p.id !== t.id && p.duplicateOfId === t.id) dupes.set(p.id, p);
    }
    if (isOpen(t) && t.roomZoneId != null && t.roomId != null) {
      for (const p of open) {
        if (
          p.id !== t.id &&
          p.reportType === t.reportType &&
          p.roomZoneId === t.roomZoneId &&
          p.roomId === t.roomId &&
          jaccard(p.message, t.message) >= SIMILARITY_THRESHOLD
        ) {
          dupes.set(p.id, p);
        }
      }
    }
    const reporters = new Set<string>([t.reporterName]);
    for (const d of dupes.values()) reporters.add(d.reporterName);
    out.set(t.id, {
      similarCount: dupes.size,
      score: computeReportScore(
        {
          type: t.reportType,
          createdAt: t.createdAt,
          priority: t.priority,
          duplicates: dupes.size,
          distinctReporters: reporters.size,
        },
        now
      ),
    });
  }
  return out;
}
