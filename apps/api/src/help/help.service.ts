import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { UserRole } from '@muditor/db';
import { isStaff } from '../auth/role.util';
import { DatabaseService } from '../database/database.service';
import {
  CreateHelpEntryInput,
  UpdateHelpEntryInput,
  HelpEntryFilterInput,
} from './help.input';

@Injectable()
export class HelpService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Entries at or above this minLevel are immortal-only help and are hidden
   * from anonymous callers and PLAYER accounts.
   */
  private static readonly IMMORTAL_MIN_LEVEL = 100;

  /** Max rows returned to anonymous callers (cheap abuse guard). */
  private static readonly ANONYMOUS_MAX_ROWS = 200;

  private takeFor(
    viewer?: { role?: UserRole | null } | null
  ): { take: number } | Record<string, never> {
    return viewer ? {} : { take: HelpService.ANONYMOUS_MAX_ROWS };
  }

  /**
   * Extra visibility restriction for the caller: staff (IMMORTAL+) see
   * everything, anonymous/PLAYER callers only see minLevel < 100.
   */
  private visibilityWhere(
    viewer?: { role?: UserRole | null } | null
  ): Record<string, unknown> {
    if (isStaff(viewer?.role)) {
      return {};
    }
    return { minLevel: { lt: HelpService.IMMORTAL_MIN_LEVEL } };
  }

  /**
   * Combine the caller-supplied filter clause with the visibility clause.
   */
  private withVisibility(
    where: Record<string, unknown>,
    viewer?: { role?: UserRole | null } | null
  ): Record<string, unknown> {
    const visibility = this.visibilityWhere(viewer);
    if (Object.keys(visibility).length === 0) {
      return where;
    }
    return { AND: [where, visibility] };
  }

  /**
   * Find all help entries with optional filtering
   */
  async findAll(
    filter?: HelpEntryFilterInput,
    viewer?: { role?: UserRole | null } | null
  ) {
    const where: Record<string, unknown> = {};

    if (filter?.category) {
      where.category = filter.category;
    }
    if (filter?.sphere) {
      where.sphere = filter.sphere;
    }
    if (filter?.maxMinLevel !== undefined) {
      where.minLevel = { lte: filter.maxMinLevel };
    }

    return this.db.helpEntry.findMany({
      where: this.withVisibility(where, viewer),
      ...this.takeFor(viewer),
      orderBy: { title: 'asc' },
    });
  }

  /**
   * Find a single help entry by ID
   */
  async findOne(id: number, viewer?: { role?: UserRole | null } | null) {
    const entry = await this.db.helpEntry.findFirst({
      where: this.withVisibility({ id }, viewer),
    });

    if (!entry) {
      throw new NotFoundException(`Help entry with ID ${id} not found`);
    }

    return entry;
  }

  /**
   * Existence check for staff mutations (ignores caller visibility rules)
   */
  private async ensureExists(id: number) {
    const entry = await this.db.helpEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException(`Help entry with ID ${id} not found`);
    }
    return entry;
  }

  /**
   * Find a help entry by keyword
   */
  async findByKeyword(
    keyword: string,
    viewer?: { role?: UserRole | null } | null
  ) {
    const entry = await this.db.helpEntry.findFirst({
      where: this.withVisibility(
        { keywords: { has: keyword.toLowerCase() } },
        viewer
      ),
    });

    if (!entry) {
      throw new NotFoundException(`Help entry for "${keyword}" not found`);
    }

    return entry;
  }

  /**
   * Get total count of help entries
   */
  async count(
    filter?: HelpEntryFilterInput,
    viewer?: { role?: UserRole | null } | null
  ) {
    const where: Record<string, unknown> = {};

    if (filter?.category) {
      where.category = filter.category;
    }
    if (filter?.sphere) {
      where.sphere = filter.sphere;
    }
    if (filter?.maxMinLevel !== undefined) {
      where.minLevel = { lte: filter.maxMinLevel };
    }

    return this.db.helpEntry.count({
      where: this.withVisibility(where, viewer),
    });
  }

  /**
   * Get distinct categories
   */
  async getCategories(viewer?: { role?: UserRole | null } | null) {
    const result = await this.db.helpEntry.findMany({
      where: this.withVisibility({ category: { not: null } }, viewer),
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return result
      .map((r: { category: string | null }) => r.category)
      .filter(Boolean) as string[];
  }

  /**
   * Search help entries by keyword or content
   */
  async search(
    query: string,
    filter?: HelpEntryFilterInput,
    viewer?: { role?: UserRole | null } | null
  ) {
    const baseWhere: Record<string, unknown> = {};

    if (filter?.category) {
      baseWhere.category = filter.category;
    }
    if (filter?.sphere) {
      baseWhere.sphere = filter.sphere;
    }
    if (filter?.maxMinLevel !== undefined) {
      baseWhere.minLevel = { lte: filter.maxMinLevel };
    }

    const queryLower = query.toLowerCase();

    return this.db.helpEntry.findMany({
      where: this.withVisibility(
        {
          ...baseWhere,
          OR: [
            // Search in keywords array
            { keywords: { has: queryLower } },
            // Search in title
            { title: { contains: query, mode: 'insensitive' } },
            // Search in content
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        viewer
      ),
      ...this.takeFor(viewer),
      orderBy: { title: 'asc' },
    });
  }

  /**
   * Create a new help entry
   * Requires BUILDER role (enforced by resolver guard)
   */
  async create(data: CreateHelpEntryInput) {
    // Normalize keywords to lowercase
    const normalizedKeywords = data.keywords.map(k => k.toLowerCase().trim());

    // Check if any keyword already exists
    const existing = await this.db.helpEntry.findFirst({
      where: {
        keywords: {
          hasSome: normalizedKeywords,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        `A help entry with one of these keywords already exists: ${existing.title}`
      );
    }

    return this.db.helpEntry.create({
      data: {
        ...data,
        keywords: normalizedKeywords,
      },
    });
  }

  /**
   * Update an existing help entry
   * Requires BUILDER role (enforced by resolver guard)
   */
  async update(id: number, data: UpdateHelpEntryInput) {
    await this.ensureExists(id);

    const updateData: Record<string, unknown> = { ...data };

    // Normalize keywords if provided
    if (data.keywords) {
      updateData.keywords = data.keywords.map(k => k.toLowerCase().trim());
    }

    return this.db.helpEntry.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a help entry
   * Requires CODER role (enforced by resolver guard)
   */
  async remove(id: number) {
    await this.ensureExists(id);

    return this.db.helpEntry.delete({
      where: { id },
    });
  }
}
