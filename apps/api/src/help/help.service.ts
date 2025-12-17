import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
   * Find all help entries with optional filtering
   */
  async findAll(filter?: HelpEntryFilterInput) {
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
      where,
      orderBy: { title: 'asc' },
    });
  }

  /**
   * Find a single help entry by ID
   */
  async findOne(id: number) {
    const entry = await this.db.helpEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new NotFoundException(`Help entry with ID ${id} not found`);
    }

    return entry;
  }

  /**
   * Find a help entry by keyword
   */
  async findByKeyword(keyword: string) {
    const entry = await this.db.helpEntry.findFirst({
      where: {
        keywords: {
          has: keyword.toLowerCase(),
        },
      },
    });

    if (!entry) {
      throw new NotFoundException(`Help entry for "${keyword}" not found`);
    }

    return entry;
  }

  /**
   * Get total count of help entries
   */
  async count(filter?: HelpEntryFilterInput) {
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

    return this.db.helpEntry.count({ where });
  }

  /**
   * Get distinct categories
   */
  async getCategories() {
    const result = await this.db.helpEntry.findMany({
      where: { category: { not: null } },
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
  async search(query: string, filter?: HelpEntryFilterInput) {
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
      where: {
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
    await this.findOne(id); // Ensure entry exists

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
   * Requires GOD role (enforced by resolver guard)
   */
  async remove(id: number) {
    await this.findOne(id); // Ensure entry exists

    return this.db.helpEntry.delete({
      where: { id },
    });
  }
}
