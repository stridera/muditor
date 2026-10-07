import {
  computeReportScore,
  jaccard,
  rankReports,
  type RankableReport,
} from './report-ranking';

const NOW = new Date('2026-10-07T12:00:00Z');
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3600_000);

function report(
  over: Partial<RankableReport> & { id: number }
): RankableReport {
  return {
    reportType: 'BUG',
    status: 'OPEN',
    reporterName: `p${over.id}`,
    roomZoneId: 30,
    roomId: 1,
    message: 'the door is stuck',
    priority: null,
    duplicateOfId: null,
    createdAt: hoursAgo(1),
    ...over,
  };
}

describe('computeReportScore', () => {
  const base = {
    type: 'BUG' as const,
    createdAt: hoursAgo(1),
    priority: null,
    duplicates: 0,
    distinctReporters: 1,
  };

  it('weights type, recency and a lone reporter', () => {
    expect(computeReportScore(base, NOW)).toBe(50 + 10 + 20);
    expect(computeReportScore({ ...base, type: 'TYPO' }, NOW)).toBe(
      15 + 10 + 20
    );
    expect(computeReportScore({ ...base, type: 'IDEA' }, NOW)).toBe(
      10 + 10 + 20
    );
  });

  it('decays recency at 24h and 7d', () => {
    expect(computeReportScore({ ...base, createdAt: hoursAgo(48) }, NOW)).toBe(
      70
    );
    expect(
      computeReportScore({ ...base, createdAt: hoursAgo(24 * 8) }, NOW)
    ).toBe(60);
  });

  it('grows with duplicates on a log scale', () => {
    expect(computeReportScore({ ...base, duplicates: 1 }, NOW)).toBe(80 + 25);
    expect(computeReportScore({ ...base, duplicates: 3 }, NOW)).toBe(80 + 50);
    expect(computeReportScore({ ...base, duplicates: 2 }, NOW)).toBe(80 + 40); // 39.6 rounds
  });

  it('caps distinct reporters at 5', () => {
    expect(computeReportScore({ ...base, distinctReporters: 5 }, NOW)).toBe(
      50 + 50 + 20
    );
    expect(computeReportScore({ ...base, distinctReporters: 50 }, NOW)).toBe(
      50 + 50 + 20
    );
  });

  it('adds the priority override', () => {
    expect(computeReportScore({ ...base, priority: 0 }, NOW)).toBe(80 + 100);
    expect(computeReportScore({ ...base, priority: 1 }, NOW)).toBe(80 + 60);
    expect(computeReportScore({ ...base, priority: 2 }, NOW)).toBe(80 + 20);
    expect(computeReportScore({ ...base, priority: 3 }, NOW)).toBe(80);
  });
});

describe('jaccard', () => {
  it('ignores case and punctuation', () => {
    expect(jaccard('The DOOR is stuck!', 'the door, is stuck')).toBe(1);
  });
  it('is 0 for disjoint or empty messages', () => {
    expect(jaccard('abc', 'def')).toBe(0);
    expect(jaccard('!!!', 'abc')).toBe(0);
  });
  it('is 0.8 for 4 shared of 5 total tokens', () => {
    expect(jaccard('a b c d', 'a b c d e')).toBeCloseTo(0.8);
  });
});

describe('rankReports', () => {
  it('counts explicit duplicates and similar open reports in the same room', () => {
    const a = report({ id: 1 });
    const explicit = report({
      id: 2,
      status: 'DUPLICATE',
      duplicateOfId: 1,
      message: 'something else entirely',
    });
    const similar = report({ id: 3, message: 'The door is stuck!' });
    const otherRoom = report({ id: 4, roomId: 2 });
    const otherType = report({ id: 5, reportType: 'TYPO' });
    const dissimilar = report({ id: 6, message: 'a wholly different report' });
    const pool = [a, explicit, similar, otherRoom, otherType, dissimilar];
    const res = rankReports([a], pool, NOW).get(1)!;
    expect(res.similarCount).toBe(2);
    // 50 + 25*log2(3)=39.6 + 10*3 reporters + 20 recency = 139.6 -> 140
    expect(res.score).toBe(140);
  });

  it('does not match reports without a room', () => {
    const a = report({ id: 1, roomZoneId: null, roomId: null });
    const b = report({ id: 2, roomZoneId: null, roomId: null });
    expect(rankReports([a], [a, b], NOW).get(1)!.similarCount).toBe(0);
  });

  it('does not count the same reporter twice', () => {
    const a = report({ id: 1, reporterName: 'Bob' });
    const b = report({ id: 2, reporterName: 'Bob' });
    const res = rankReports([a], [a, b], NOW).get(1)!;
    expect(res.similarCount).toBe(1);
    expect(res.score).toBe(Math.round(50 + 25 + 10 + 20));
  });

  // Shared fixture: deploy/prod/tests/error-digest.test.sh expects these exact scores
  // from reports-rank.sql (same rows, now = 2026-10-07T12:00:00Z).
  it('matches the SQL mirror fixture', () => {
    const fx = [
      report({
        id: 1,
        reportType: 'BUG',
        reporterName: 'alice',
        message: 'door stuck in the tavern',
        roomZoneId: 30,
        roomId: 1,
        createdAt: hoursAgo(2),
      }),
      report({
        id: 2,
        reportType: 'BUG',
        reporterName: 'bob',
        message: 'Door stuck in the tavern!',
        roomZoneId: 30,
        roomId: 1,
        createdAt: hoursAgo(3),
      }),
      report({
        id: 3,
        reportType: 'BUG',
        reporterName: 'carol',
        message: 'door stuck in the tavern',
        roomZoneId: 30,
        roomId: 1,
        createdAt: hoursAgo(50),
        status: 'IN_PROGRESS',
      }),
      report({
        id: 4,
        reportType: 'TYPO',
        reporterName: 'dave',
        message: 'teh sword',
        roomZoneId: 31,
        roomId: 2,
        createdAt: hoursAgo(24 * 3),
        priority: 2,
      }),
      report({
        id: 5,
        reportType: 'IDEA',
        reporterName: 'erin',
        message: 'add fishing',
        roomZoneId: null,
        roomId: null,
        createdAt: hoursAgo(24 * 30),
      }),
      report({
        id: 6,
        reportType: 'BUG',
        reporterName: 'frank',
        message: 'crash on rest',
        roomZoneId: 32,
        roomId: 3,
        createdAt: hoursAgo(1),
        priority: 0,
      }),
      report({
        id: 7,
        reportType: 'BUG',
        reporterName: 'gina',
        message: 'a duplicate of crash',
        roomZoneId: 32,
        roomId: 4,
        createdAt: hoursAgo(1),
        status: 'DUPLICATE',
        duplicateOfId: 6,
      }),
      report({
        id: 8,
        reportType: 'BUG',
        reporterName: 'hank',
        message: 'resolved long ago',
        createdAt: hoursAgo(1),
        status: 'RESOLVED',
        roomZoneId: 30,
        roomId: 1,
      }),
    ];
    const res = rankReports(
      fx.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS'),
      fx,
      NOW
    );
    const scores = Object.fromEntries(
      [...res].map(([id, r]) => [id, [r.score, r.similarCount]])
    );
    expect(scores).toEqual({
      1: [140, 2], // 50 + 25*log2(3) + 3 reporters*10 + 20
      2: [140, 2],
      3: [130, 2], // in-progress, 50h old: 50 + 39.6 + 30 + 10 = 129.6 -> 130
      4: [55, 0], // 15 + 10 + 10 (3d) + 20 (P2)
      5: [20, 0], // 10 + 10, 30d old
      6: [215, 1], // 50 + 25 + 2*10 + 20 + 100 (P0); #7 is its explicit duplicate
    });
  });
});
