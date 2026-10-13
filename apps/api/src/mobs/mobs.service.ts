import { ConflictException, Injectable } from '@nestjs/common';
import { type Mobs, Prisma } from '@muditor/db';
import { inVisibleZone } from '../common/god-zone-visibility';
import { assertNoPlayerPets, rethrowAsInUse } from '../common/proto-references';
import {
  intRange,
  numericIdToken,
  searchTokens,
  sortDirection,
} from '../common/list-filter';
import { DatabaseService } from '../database/database.service';

export interface MobListFilter {
  zoneId?: number | null | undefined;
  search?: string | null | undefined;
  levelMin?: number | null | undefined;
  levelMax?: number | null | undefined;
  /**
   * true = mobs that attack on sight (a non-empty aggression formula other than
   * `false`, which is how the game decides); false = the rest; null = either.
   */
  aggressive?: boolean | null | undefined;
  /** Omit mobs in god zones (public readers below IMMORTAL). */
  hideGodZones?: boolean | undefined;
}

/** Sortable list columns; anything else falls back to the default order. */
const MOB_SORT_FIELDS: Readonly<Record<string, string>> = {
  level: 'level',
  name: 'plainName',
  id: 'id',
  zoneId: 'zoneId',
};

/** Default is by id; a requested column always tie-breaks on (zoneId, id). */
function mobOrderBy(
  sortBy: string | null | undefined,
  sortDir: string | null | undefined
): Prisma.MobsOrderByWithRelationInput[] {
  const field = sortBy ? MOB_SORT_FIELDS[sortBy] : undefined;
  if (!field) return [{ id: 'asc' }, { zoneId: 'asc' }];
  const order: Prisma.MobsOrderByWithRelationInput[] = [
    { [field]: sortDirection(sortDir) },
  ];
  if (field !== 'zoneId') order.push({ zoneId: 'asc' });
  if (field !== 'id') order.push({ id: 'asc' });
  return order;
}

/** Formulas the game treats as "never aggressive" (see aggression.rs). */
const NON_AGGRESSIVE_FORMULAS = ['', 'false'];

/**
 * Aggressive = the mob has an aggression_formula that is not blank/`false`.
 * (There is no AGGRESSIVE behavior flag in the schema; the formula is the only source.)
 */
export function aggressiveWhere(aggressive: boolean): Prisma.MobsWhereInput {
  return aggressive
    ? {
        aggressionFormula: { not: null },
        NOT: { aggressionFormula: { in: NON_AGGRESSIVE_FORMULAS } },
      }
    : {
        OR: [
          { aggressionFormula: null },
          { aggressionFormula: { in: NON_AGGRESSIVE_FORMULAS } },
        ],
      };
}

@Injectable()
export class MobsService {
  constructor(private readonly database: DatabaseService) {}

  /**
   * WHERE shared by the paged list and its count. Search terms are AND-ed; each
   * must hit the (colour-free) name or descriptions, a keyword, or the id.
   */
  listWhere(filter: MobListFilter = {}): Prisma.MobsWhereInput {
    const and: Prisma.MobsWhereInput[] = searchTokens(filter.search).map(
      term => {
        const id = numericIdToken(term);
        return {
          OR: [
            { plainName: { contains: term, mode: 'insensitive' } },
            { plainRoomDescription: { contains: term, mode: 'insensitive' } },
            {
              plainExamineDescription: { contains: term, mode: 'insensitive' },
            },
            { keywords: { has: term.toLowerCase() } },
            ...(id !== null ? [{ id }] : []),
          ],
        };
      }
    );
    if (filter.aggressive != null) and.push(aggressiveWhere(filter.aggressive));
    const level = intRange(filter.levelMin, filter.levelMax);
    return {
      ...(filter.zoneId != null && { zoneId: filter.zoneId }),
      ...(level && { level }),
      ...inVisibleZone(!!filter.hideGodZones),
      ...(and.length > 0 && { AND: and }),
    };
  }

  async findAll(
    args?: MobListFilter & {
      skip?: number;
      take?: number;
      where?: Prisma.MobsWhereInput;
      sortBy?: string | null | undefined;
      sortDir?: string | null | undefined;
    }
  ): Promise<Mobs[]> {
    const listWhere = this.listWhere(args);
    const findArgs: Prisma.MobsFindManyArgs = {
      where: args?.where ? { AND: [args.where, listWhere] } : listWhere,
      orderBy: mobOrderBy(args?.sortBy, args?.sortDir),
    };
    if (args?.skip !== undefined) findArgs.skip = args.skip;
    if (args?.take !== undefined) findArgs.take = args.take;
    return this.database.mobs.findMany(findArgs);
  }

  async findOne(
    zoneId: number,
    id: number,
    hideGodZones = false
  ): Promise<Mobs | null> {
    const mob = await this.database.mobs.findFirst({
      where: { zoneId, id, ...inVisibleZone(hideGodZones) },
      include: {
        mobAbilities: { include: { ability: true } },
        defaultEffects: { include: { effect: true } },
        mobResets: {
          include: {
            rooms: { select: { id: true, zoneId: true, name: true } },
            zones: { select: { id: true, name: true } },
            mobResetEquipment: true,
          },
        },
      },
    });
    return mob;
  }

  async findByZone(
    zoneId: number,
    search?: string,
    hideGodZones = false
  ): Promise<Mobs[]> {
    const whereClause: Prisma.MobsWhereInput = {
      zoneId,
      ...inVisibleZone(hideGodZones),
    };

    // Add search filter if provided
    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { keywords: { hasSome: [search.toLowerCase()] } },
        { roomDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    const mobs = await this.database.mobs.findMany({
      where: whereClause,
      include: {
        mobResets: {
          include: {
            rooms: { select: { id: true, name: true } },
          },
        },
      },
    });
    return mobs;
  }

  async count(
    where?: Prisma.MobsWhereInput,
    hideGodZones = false
  ): Promise<number> {
    return this.database.mobs.count({
      where: { ...(where || {}), ...inVisibleZone(hideGodZones) },
    });
  }

  /** Count for the filtered list (same WHERE as {@link findAll}). */
  async countFiltered(filter: MobListFilter = {}): Promise<number> {
    return this.database.mobs.count({ where: this.listWhere(filter) });
  }

  async search(
    search: string,
    limit: number = 10,
    zoneId?: number,
    hideGodZones = false
  ): Promise<Mobs[]> {
    const searchTerm = search.trim().toLowerCase();
    const searchNum = parseInt(searchTerm, 10);
    const isNumeric = !isNaN(searchNum);

    // Split search into words for multi-word AND logic
    const searchWords = searchTerm.split(/\s+/).filter(w => w.length > 0);

    // Build WHERE clause using plaintext fields
    const where: Prisma.MobsWhereInput = {
      ...(zoneId != null && { zoneId }),
      ...inVisibleZone(hideGodZones),
      OR: [
        // Check ID if numeric
        ...(isNumeric ? [{ id: searchNum }] : []),
        // Check keywords
        { keywords: { hasSome: searchWords } },
        // Search plaintext fields (all words must match - AND logic)
        {
          AND: searchWords.map(word => ({
            OR: [
              { plainName: { contains: word, mode: 'insensitive' } },
              { plainRoomDescription: { contains: word, mode: 'insensitive' } },
              {
                plainExamineDescription: {
                  contains: word,
                  mode: 'insensitive',
                },
              },
            ],
          })),
        },
      ],
    };

    return this.database.mobs.findMany({
      where,
      take: limit,
      orderBy: [{ zoneId: 'asc' }, { id: 'asc' }],
      include: {
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /** Next unused mob id in a zone: highest id + 1, or 0 for an empty zone. */
  async nextFreeId(zoneId: number): Promise<number> {
    const { _max } = await this.database.mobs.aggregate({
      where: { zoneId },
      _max: { id: true },
    });
    return _max.id === null || _max.id === undefined ? 0 : _max.id + 1;
  }

  /** Throws ConflictException when (zoneId, id) already exists. */
  async assertIdFree(zoneId: number, id: number): Promise<void> {
    const existing = await this.database.mobs.findUnique({
      where: { zoneId_id: { zoneId, id } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(`Mob ${id} already exists in zone ${zoneId}`);
    }
  }

  async create(data: Prisma.MobsCreateInput): Promise<Mobs> {
    const mob = await this.database.mobs.create({
      data,
      include: {},
    });
    return mob;
  }

  async update(
    zoneId: number,
    id: number,
    data: Prisma.MobsUpdateInput
  ): Promise<Mobs> {
    const mob = await this.database.mobs.update({
      where: { zoneId_id: { zoneId, id } },
      data,
      include: {},
    });
    return mob;
  }

  async delete(zoneId: number, id: number): Promise<Mobs> {
    await assertNoPlayerPets(this.database, [{ zoneId, id }]);
    try {
      return await this.database.mobs.delete({
        where: { zoneId_id: { zoneId, id } },
      });
    } catch (error) {
      rethrowAsInUse(error, [{ zoneId, id }]);
    }
  }

  /**
   * Delete by composite key (zoneId, id). Matching on id alone would delete
   * same-numbered entities in other zones.
   */
  async deleteMany(
    keys: Array<{ zoneId: number; id: number }>
  ): Promise<number> {
    if (keys.length === 0) return 0;
    await assertNoPlayerPets(this.database, keys);
    try {
      const result = await this.database.mobs.deleteMany({
        where: { OR: keys.map(({ zoneId, id }) => ({ zoneId, id })) },
      });
      return result.count;
    } catch (error) {
      rethrowAsInUse(error, keys);
    }
  }

  /**
   * Find a CharacterClass by ID to get its name for combat formula calculations.
   */
  async findClassById(
    classId: number
  ): Promise<{ id: number; plainName: string } | null> {
    return this.database.characterClass.findUnique({
      where: { id: classId },
      select: { id: true, plainName: true },
    });
  }

  async updateMobDefaultEffects(
    zoneId: number,
    id: number,
    effects: Array<{
      effectId: number;
      strength?: number;
      modifierData?: Prisma.JsonValue;
    }>
  ) {
    await this.database.$transaction(async tx => {
      await tx.mobDefaultEffects.deleteMany({
        where: { mobZoneId: zoneId, mobId: id },
      });
      if (effects.length > 0) {
        await tx.mobDefaultEffects.createMany({
          data: effects.map(e => ({
            mobZoneId: zoneId,
            mobId: id,
            effectId: e.effectId,
            strength: e.strength ?? 1,
            modifierData: e.modifierData ?? {},
          })),
        });
      }
    });
    return this.findOne(zoneId, id);
  }
}
