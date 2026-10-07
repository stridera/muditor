import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ReportStatus, type Report } from '@muditor/db';
import { DatabaseService } from '../database/database.service';
import { ReportSort } from './reports.input';
import type { ReportFilterInput, UpdateReportInput } from './reports.input';
import { rankReports, type RankableReport } from './report-ranking';

/** Ranking is computed in memory; this bounds how many matching rows we load. */
const MAX_RANKED_ROWS = 2000;
/** Bound on the open/duplicate pool used to find similar reports. */
const MAX_POOL_ROWS = 5000;
const OPEN_STATUSES: ReportStatus[] = [
  ReportStatus.OPEN,
  ReportStatus.IN_PROGRESS,
];
const TERMINAL_STATUSES: ReportStatus[] = [
  ReportStatus.RESOLVED,
  ReportStatus.WONT_FIX,
  ReportStatus.DUPLICATE,
];

export type RankedReport = Report & {
  score: number;
  rank: number;
  similarCount: number;
};

@Injectable()
export class ReportsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(
    filter: ReportFilterInput | undefined,
    sort: ReportSort,
    take: number,
    skip: number
  ): Promise<{ items: RankedReport[]; total: number }> {
    const where: Prisma.ReportWhereInput = {};
    if (filter?.status?.length) where.status = { in: filter.status };
    if (filter?.type) where.reportType = filter.type;
    if (filter?.zoneId != null) where.roomZoneId = filter.zoneId;
    if (filter?.search?.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { message: { contains: q, mode: 'insensitive' } },
        { reporterName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const rows = await this.db.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: MAX_RANKED_ROWS,
    });
    const pool = await this.loadPool();
    const ranked = this.rank(rows, pool);
    return {
      items: this.page(ranked, sort, take, skip),
      total: ranked.length,
    };
  }

  async findOne(id: number): Promise<RankedReport> {
    const row = await this.ensureExists(id);
    const pool = await this.loadPool();
    // A single report's rank is its position among all open reports plus itself.
    const open = pool.filter(r => OPEN_STATUSES.includes(r.status));
    const universe = open.some(r => r.id === row.id) ? open : [...open, row];
    const ranked = this.rank(universe, pool);
    return (
      ranked.find(r => r.id === id) ?? {
        ...row,
        score: 0,
        rank: 0,
        similarCount: 0,
      }
    );
  }

  openCount(): Promise<number> {
    return this.db.report.count({ where: { status: { in: OPEN_STATUSES } } });
  }

  async update(
    id: number,
    data: UpdateReportInput,
    resolverName: string
  ): Promise<RankedReport> {
    const existing = await this.ensureExists(id);
    const patch: Prisma.ReportUncheckedUpdateInput = {};

    if (data.priority !== undefined) {
      patch.priority = data.priority < 0 ? null : data.priority;
    }
    if (data.assignedTo !== undefined) {
      patch.assignedTo =
        data.assignedTo.trim() === '' ? null : data.assignedTo.trim();
    }
    if (data.tags !== undefined) {
      patch.tags = [...new Set(data.tags.map(t => t.trim()).filter(Boolean))];
    }
    if (data.resolution !== undefined) {
      patch.resolution = data.resolution.trim() === '' ? null : data.resolution;
    }
    if (data.status !== undefined && data.status !== existing.status) {
      patch.status = data.status;
      if (TERMINAL_STATUSES.includes(data.status)) {
        patch.resolvedBy = resolverName;
        patch.resolvedAt = new Date();
      } else {
        // Reopened: no longer resolved.
        patch.resolvedBy = null;
        patch.resolvedAt = null;
      }
      if (
        data.status !== ReportStatus.DUPLICATE &&
        existing.duplicateOfId != null
      ) {
        patch.duplicateOfId = null;
      }
    }

    await this.db.report.update({ where: { id }, data: patch });
    return this.findOne(id);
  }

  async markDuplicate(
    id: number,
    ofId: number,
    resolverName: string
  ): Promise<RankedReport> {
    if (id === ofId) {
      throw new BadRequestException('A report cannot be a duplicate of itself');
    }
    await this.ensureExists(id);
    // Point at the root of the chain so duplicates always aggregate on one report.
    let target = await this.ensureExists(ofId);
    const seen = new Set<number>([id]);
    while (target.duplicateOfId != null) {
      if (seen.has(target.id)) break;
      seen.add(target.id);
      const next = await this.db.report.findUnique({
        where: { id: target.duplicateOfId },
      });
      if (!next) break;
      target = next;
    }
    if (target.id === id) {
      throw new BadRequestException('That would create a duplicate cycle');
    }
    // Anything already marked as a duplicate of this report moves to the new root.
    await this.db.report.updateMany({
      where: { duplicateOfId: id },
      data: { duplicateOfId: target.id },
    });
    await this.db.report.update({
      where: { id },
      data: {
        status: ReportStatus.DUPLICATE,
        duplicateOfId: target.id,
        resolvedBy: resolverName,
        resolvedAt: new Date(),
      },
    });
    return this.findOne(id);
  }

  // ---------------------------------------------------------------------------

  private async ensureExists(id: number): Promise<Report> {
    const row = await this.db.report.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Report ${id} not found`);
    return row;
  }

  private loadPool(): Promise<Report[]> {
    return this.db.report.findMany({
      where: {
        OR: [
          { status: { in: OPEN_STATUSES } },
          { duplicateOfId: { not: null } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: MAX_POOL_ROWS,
    });
  }

  /** Score rows and assign 1-based ranks by score (ties: newest first). */
  private rank(rows: Report[], pool: Report[]): RankedReport[] {
    const now = new Date();
    const results = rankReports(
      rows as RankableReport[],
      pool as RankableReport[],
      now
    );
    const scored = rows.map(r => ({
      ...r,
      score: results.get(r.id)?.score ?? 0,
      similarCount: results.get(r.id)?.similarCount ?? 0,
      rank: 0,
    }));
    scored.sort(byScore);
    scored.forEach((r, i) => (r.rank = i + 1));
    return scored;
  }

  private page(
    ranked: RankedReport[],
    sort: ReportSort,
    take: number,
    skip: number
  ): RankedReport[] {
    const ordered =
      sort === ReportSort.NEWEST
        ? [...ranked].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
          )
        : ranked;
    return ordered.slice(skip, skip + take);
  }
}

function byScore(a: RankedReport, b: RankedReport): number {
  return b.score - a.score || b.createdAt.getTime() - a.createdAt.getTime();
}
