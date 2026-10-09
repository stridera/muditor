import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@muditor/db';
import { DatabaseService } from '../database/database.service';
import type {
  CreateCreationRecipeInput,
  UpdateCreationRecipeInput,
} from './creation-recipe.input';

const INCLUDE = {
  ability: { select: { id: true, name: true } },
  characterClass: { select: { id: true, name: true, plainName: true } },
} satisfies Prisma.CreationRecipeInclude;

/** Trim; blank means "no keyword". The keyword is matched case-insensitively. */
function normalizeKeyword(keyword: string | null | undefined): string | null {
  const t = keyword?.trim().toLowerCase();
  return t ? t : null;
}

@Injectable()
export class CreationRecipesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll() {
    return this.db.creationRecipe.findMany({
      include: INCLUDE,
      orderBy: [{ abilityId: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: number) {
    const row = await this.db.creationRecipe.findUnique({
      where: { id },
      include: INCLUDE,
    });
    if (!row) {
      throw new NotFoundException(`Creation recipe with ID ${id} not found`);
    }
    return row;
  }

  private async assertReferencesExist(
    abilityId: number,
    classId: number | null
  ) {
    const ability = await this.db.ability.findUnique({
      where: { id: abilityId },
      select: { id: true },
    });
    if (!ability) {
      throw new BadRequestException(`Ability ${abilityId} does not exist`);
    }
    if (classId != null) {
      const cls = await this.db.characterClass.findUnique({
        where: { id: classId },
        select: { id: true },
      });
      if (!cls) {
        throw new BadRequestException(`Class ${classId} does not exist`);
      }
    }
  }

  /**
   * (ability, keyword, class) must be unique. Postgres treats NULLs in the
   * unique index as distinct, so the database alone would let duplicates in.
   */
  private async assertTripleFree(
    abilityId: number,
    keyword: string | null,
    classId: number | null,
    exceptId?: number
  ) {
    const existing = await this.db.creationRecipe.findFirst({
      where: {
        abilityId,
        keyword,
        classId,
        ...(exceptId !== undefined ? { NOT: { id: exceptId } } : {}),
      },
      select: { id: true },
    });
    if (existing) {
      throw new BadRequestException(
        'A recipe with this ability, keyword and class already exists'
      );
    }
  }

  async create(data: CreateCreationRecipeInput) {
    const keyword = normalizeKeyword(data.keyword);
    const classId = data.classId ?? null;
    await this.assertReferencesExist(data.abilityId, classId);
    await this.assertTripleFree(data.abilityId, keyword, classId);

    try {
      return await this.db.creationRecipe.create({
        data: {
          abilityId: data.abilityId,
          keyword,
          classId,
          objectZoneId: data.objectZoneId,
          objectId: data.objectId ?? null,
        },
        include: INCLUDE,
      });
    } catch (e) {
      throw this.mapUniqueViolation(e);
    }
  }

  async update(id: number, data: UpdateCreationRecipeInput) {
    const current = await this.findOne(id);

    const abilityId = data.abilityId ?? current.abilityId;
    const keyword =
      data.keyword !== undefined
        ? normalizeKeyword(data.keyword)
        : current.keyword;
    const classId = data.classId !== undefined ? data.classId : current.classId;

    await this.assertReferencesExist(abilityId, classId);
    await this.assertTripleFree(abilityId, keyword, classId, id);

    const patch: Prisma.CreationRecipeUncheckedUpdateInput = {
      abilityId,
      keyword,
      classId,
    };
    if (data.objectZoneId != null) patch.objectZoneId = data.objectZoneId;
    if (data.objectId !== undefined) patch.objectId = data.objectId;

    try {
      return await this.db.creationRecipe.update({
        where: { id },
        data: patch,
        include: INCLUDE,
      });
    } catch (e) {
      throw this.mapUniqueViolation(e);
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.db.creationRecipe.delete({ where: { id } });
  }

  private mapUniqueViolation(e: unknown): unknown {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return new BadRequestException(
        'A recipe with this ability, keyword and class already exists'
      );
    }
    return e;
  }
}
