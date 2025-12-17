import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateSocialInput, UpdateSocialInput } from './social.input';

@Injectable()
export class SocialsService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Find all socials, ordered alphabetically by name
   */
  async findAll() {
    return this.db.social.findMany({
      orderBy: { name: 'asc' },
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
  async count() {
    return this.db.social.count();
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
   * Requires GOD role (enforced by resolver guard)
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
   * Requires GOD role (enforced by resolver guard)
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
   * Requires GOD role (enforced by resolver guard)
   */
  async remove(id: number) {
    await this.findOne(id); // Ensure social exists

    return this.db.social.delete({
      where: { id },
    });
  }
}
