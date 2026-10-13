import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type { Prisma } from '@muditor/db';
import { searchTokens } from '../common/list-filter';
import { DatabaseService } from '../database/database.service';
import { CreateSocialInput, UpdateSocialInput } from './social.input';

/** Every search term must appear in the social's name. */
function socialListWhere(search?: string): Prisma.SocialWhereInput {
  const and = searchTokens(search).map(
    (term): Prisma.SocialWhereInput => ({
      name: { contains: term, mode: 'insensitive' },
    })
  );
  return and.length > 0 ? { AND: and } : {};
}

@Injectable()
export class SocialsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Find all socials, ordered alphabetically by name
   */
  async findAll(args?: {
    search?: string | undefined;
    skip?: number | undefined;
    take?: number | undefined;
  }) {
    return this.db.social.findMany({
      where: socialListWhere(args?.search),
      orderBy: { name: 'asc' },
      ...(args?.skip !== undefined && { skip: args.skip }),
      ...(args?.take !== undefined && { take: args.take }),
    });
  }

  /**
   * Find a single social by ID
   */
  async findOne(id: number) {
    const social = await this.db.social.findUnique({
      where: { id },
    });

    if (!social) {
      throw new NotFoundException(`Social with ID ${id} not found`);
    }

    return social;
  }

  /**
   * Find a social by name
   */
  async findByName(name: string) {
    const social = await this.db.social.findUnique({
      where: { name },
    });

    if (!social) {
      throw new NotFoundException(`Social "${name}" not found`);
    }

    return social;
  }

  /**
   * Get total count of socials
   */
  async count(search?: string) {
    return this.db.social.count({ where: socialListWhere(search) });
  }

  /**
   * Search socials by name pattern
   */
  async search(query: string) {
    return this.db.social.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create a new social
   * Requires CODER role (enforced by resolver guard)
   */
  async create(data: CreateSocialInput) {
    // Check if social with this name already exists
    const existing = await this.db.social.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new BadRequestException(`Social "${data.name}" already exists`);
    }

    return this.db.social.create({
      data,
    });
  }

  /**
   * Update an existing social
   * Requires CODER role (enforced by resolver guard)
   */
  async update(id: number, data: UpdateSocialInput) {
    await this.findOne(id); // Ensure social exists

    return this.db.social.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a social
   * Requires CODER role (enforced by resolver guard)
   */
  async remove(id: number) {
    await this.findOne(id); // Ensure social exists

    return this.db.social.delete({
      where: { id },
    });
  }
}
