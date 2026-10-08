import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@muditor/db';
import { DatabaseService } from '../database/database.service';
import type {
  CreateEffectAuraInput,
  UpdateEffectAuraInput,
} from './effect-aura.input';

/** Trim, drop blanks and de-duplicate keys; at least one must remain. */
function normalizeKeys(keys: string[]): string[] {
  const cleaned = [...new Set(keys.map(k => k.trim()).filter(k => k !== ''))];
  if (cleaned.length === 0) {
    throw new BadRequestException('At least one key is required');
  }
  return cleaned;
}

function assertAlignmentRange(
  min: number | null | undefined,
  max: number | null | undefined
) {
  if (min != null && max != null && min > max) {
    throw new BadRequestException(
      `minAlignment (${min}) must be <= maxAlignment (${max})`
    );
  }
}

@Injectable()
export class EffectAurasService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.effectAura.findMany({
      orderBy: [{ sortOrder: 'asc' }, { slug: 'asc' }],
    });
  }

  async findOne(id: number) {
    const aura = await this.db.effectAura.findUnique({ where: { id } });
    if (!aura) {
      throw new NotFoundException(`Effect aura with ID ${id} not found`);
    }
    return aura;
  }

  private async assertSlugFree(slug: string, exceptId?: number) {
    const existing = await this.db.effectAura.findUnique({ where: { slug } });
    if (existing && existing.id !== exceptId) {
      throw new BadRequestException(`Effect aura "${slug}" already exists`);
    }
  }

  async create(data: CreateEffectAuraInput) {
    const keys = normalizeKeys(data.keys);
    assertAlignmentRange(data.minAlignment, data.maxAlignment);
    await this.assertSlugFree(data.slug);

    try {
      return await this.db.effectAura.create({
        data: {
          slug: data.slug,
          keys,
          text: data.text,
          needsDetectMagic: data.needsDetectMagic,
          exclusiveGroup: data.exclusiveGroup?.trim() || null,
          minAlignment: data.minAlignment ?? null,
          maxAlignment: data.maxAlignment ?? null,
          sortOrder: data.sortOrder,
        },
      });
    } catch (e) {
      throw this.mapUniqueViolation(e, data.slug);
    }
  }

  async update(id: number, data: UpdateEffectAuraInput) {
    const current = await this.findOne(id);

    const patch: Prisma.EffectAuraUpdateInput = {};
    if (data.slug != null && data.slug !== current.slug) {
      await this.assertSlugFree(data.slug, id);
      patch.slug = data.slug;
    }
    if (data.keys != null) patch.keys = normalizeKeys(data.keys);
    if (data.text != null) patch.text = data.text;
    if (data.needsDetectMagic != null) {
      patch.needsDetectMagic = data.needsDetectMagic;
    }
    if (data.exclusiveGroup !== undefined) {
      patch.exclusiveGroup = data.exclusiveGroup?.trim() || null;
    }
    if (data.minAlignment !== undefined) patch.minAlignment = data.minAlignment;
    if (data.maxAlignment !== undefined) patch.maxAlignment = data.maxAlignment;
    if (data.sortOrder != null) patch.sortOrder = data.sortOrder;

    // Validate the resulting range, not just the fields supplied.
    assertAlignmentRange(
      data.minAlignment !== undefined
        ? data.minAlignment
        : current.minAlignment,
      data.maxAlignment !== undefined ? data.maxAlignment : current.maxAlignment
    );

    try {
      return await this.db.effectAura.update({ where: { id }, data: patch });
    } catch (e) {
      throw this.mapUniqueViolation(e, data.slug ?? current.slug);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.db.effectAura.delete({ where: { id } });
  }

  private mapUniqueViolation(e: unknown, slug: string): unknown {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return new BadRequestException(`Effect aura "${slug}" already exists`);
    }
    return e;
  }
}
