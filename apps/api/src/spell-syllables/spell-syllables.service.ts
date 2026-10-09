import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@muditor/db';
import { DatabaseService } from '../database/database.service';
import type {
  CreateSpellSyllableInput,
  UpdateSpellSyllableInput,
} from './spell-syllable.input';

@Injectable()
export class SpellSyllablesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.spellSyllable.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: number) {
    const row = await this.db.spellSyllable.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Spell syllable with ID ${id} not found`);
    }
    return row;
  }

  private async assertSyllableFree(syllable: string, exceptId?: number) {
    const existing = await this.db.spellSyllable.findUnique({
      where: { syllable },
    });
    if (existing && existing.id !== exceptId) {
      throw new BadRequestException(
        `Spell syllable "${syllable}" already exists`
      );
    }
  }

  async create(data: CreateSpellSyllableInput) {
    await this.assertSyllableFree(data.syllable);
    try {
      return await this.db.spellSyllable.create({
        data: {
          sortOrder: data.sortOrder,
          syllable: data.syllable,
          replacement: data.replacement,
        },
      });
    } catch (e) {
      throw this.mapUniqueViolation(e, data.syllable);
    }
  }

  async update(id: number, data: UpdateSpellSyllableInput) {
    const current = await this.findOne(id);

    const patch: Prisma.SpellSyllableUpdateInput = {};
    if (data.syllable != null && data.syllable !== current.syllable) {
      await this.assertSyllableFree(data.syllable, id);
      patch.syllable = data.syllable;
    }
    if (data.replacement != null) patch.replacement = data.replacement;
    if (data.sortOrder != null) patch.sortOrder = data.sortOrder;

    try {
      return await this.db.spellSyllable.update({ where: { id }, data: patch });
    } catch (e) {
      throw this.mapUniqueViolation(e, data.syllable ?? current.syllable);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.db.spellSyllable.delete({ where: { id } });
  }

  private mapUniqueViolation(e: unknown, syllable: string): unknown {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return new BadRequestException(
        `Spell syllable "${syllable}" already exists`
      );
    }
    return e;
  }
}
