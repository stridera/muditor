import { ConflictException, Injectable } from '@nestjs/common';
import {
  type Objects,
  ObjectType,
  Prisma,
  ElementType,
  WearFlag,
} from '@muditor/db';
import { inVisibleZone } from '../common/god-zone-visibility';
import {
  assertNoPlayerItems,
  rethrowAsInUse,
} from '../common/proto-references';
import {
  intRange,
  numericIdToken,
  searchTokens,
  sortDirection,
} from '../common/list-filter';
import { DatabaseService } from '../database/database.service';
import {
  SPELL_ITEM_TYPES,
  SPELL_MIRROR_KEYS,
} from './object-abilities.service';

export interface ObjectListFilter {
  zoneId?: number | null | undefined;
  search?: string | null | undefined;
  types?: ObjectType[] | null | undefined;
  levelMin?: number | null | undefined;
  levelMax?: number | null | undefined;
  costMin?: number | null | undefined;
  weightMin?: number | null | undefined;
  weightMax?: number | null | undefined;
  /** Omit objects in god zones (public readers below IMMORTAL). */
  hideGodZones?: boolean | undefined;
}

/** Sortable list columns; anything else falls back to the default order. */
const OBJECT_SORT_FIELDS: Readonly<Record<string, string>> = {
  level: 'level',
  name: 'plainName',
  type: 'type',
  cost: 'cost',
  weight: 'weight',
  id: 'id',
  zoneId: 'zoneId',
};

/** Default is by id; a requested column always tie-breaks on (zoneId, id). */
function objectOrderBy(
  sortBy: string | null | undefined,
  sortDir: string | null | undefined
): Prisma.ObjectsOrderByWithRelationInput[] {
  const field = sortBy ? OBJECT_SORT_FIELDS[sortBy] : undefined;
  if (!field) return [{ id: 'asc' }, { zoneId: 'asc' }];
  const order: Prisma.ObjectsOrderByWithRelationInput[] = [
    { [field]: sortDirection(sortDir) },
  ];
  if (field !== 'zoneId') order.push({ zoneId: 'asc' });
  if (field !== 'id') order.push({ id: 'asc' });
  return order;
}

@Injectable()
export class ObjectsService {
  constructor(private readonly database: DatabaseService) {}

  /**
   * WHERE shared by the paged list and its count. Search terms are AND-ed; each
   * must hit the (colour-free) name or descriptions, a keyword, the type, or the id.
   */
  listWhere(filter: ObjectListFilter = {}): Prisma.ObjectsWhereInput {
    const and: Prisma.ObjectsWhereInput[] = searchTokens(filter.search).map(
      term => {
        const id = numericIdToken(term);
        const type = (Object.values(ObjectType) as string[]).includes(
          term.toUpperCase()
        )
          ? (term.toUpperCase() as ObjectType)
          : null;
        return {
          OR: [
            { plainName: { contains: term, mode: 'insensitive' } },
            { plainRoomDescription: { contains: term, mode: 'insensitive' } },
            {
              plainExamineDescription: { contains: term, mode: 'insensitive' },
            },
            { keywords: { has: term.toLowerCase() } },
            ...(id !== null ? [{ id }] : []),
            ...(type !== null ? [{ type }] : []),
          ],
        };
      }
    );
    const level = intRange(filter.levelMin, filter.levelMax);
    const cost = intRange(filter.costMin, undefined);
    const weight = intRange(filter.weightMin, filter.weightMax);
    return {
      ...(filter.zoneId != null && { zoneId: filter.zoneId }),
      ...(filter.types &&
        filter.types.length > 0 && { type: { in: filter.types } }),
      ...(level && { level }),
      ...(cost && { cost }),
      ...(weight && { weight }),
      ...inVisibleZone(!!filter.hideGodZones),
      ...(and.length > 0 && { AND: and }),
    };
  }

  async findAll(
    args?: ObjectListFilter & {
      skip?: number;
      take?: number;
      where?: Prisma.ObjectsWhereInput;
      sortBy?: string | null | undefined;
      sortDir?: string | null | undefined;
    }
  ): Promise<Objects[]> {
    const listWhere = this.listWhere(args);
    const findArgs: Prisma.ObjectsFindManyArgs = {
      where: args?.where ? { AND: [args.where, listWhere] } : listWhere,
      orderBy: objectOrderBy(args?.sortBy, args?.sortDir),
    };
    if (args?.skip !== undefined) findArgs.skip = args.skip;
    if (args?.take !== undefined) findArgs.take = args.take;
    return this.database.objects.findMany(findArgs);
  }

  async findOne(
    zoneId: number,
    id: number,
    hideGodZones = false
  ): Promise<Objects | null> {
    return this.database.objects.findFirst({
      where: { zoneId, id, ...inVisibleZone(hideGodZones) },
      include: {
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
        objectExtraDescriptions: true,
        objectTriggers: { include: { trigger: true } },
        grantedEffects: { include: { effect: true } },
        objectResistances: true,
        consumableEffects: { include: { effect: true } },
        shopItems: {
          include: {
            shops: {
              select: {
                id: true,
              },
            },
          },
        },
        mobResetEquipment: {
          include: {
            mob_resets: {
              include: {
                mobs: {
                  select: {
                    id: true,
                    zoneId: true,
                    name: true,
                  },
                },
                rooms: {
                  select: {
                    id: true,
                    zoneId: true,
                    name: true,
                  },
                },
              },
            },
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findByZone(zoneId: number, hideGodZones = false): Promise<Objects[]> {
    return this.database.objects.findMany({
      where: {
        zoneId: zoneId,
        ...inVisibleZone(hideGodZones),
      },
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

  async findByType(type: ObjectType, hideGodZones = false): Promise<Objects[]> {
    return this.database.objects.findMany({
      where: { type, ...inVisibleZone(hideGodZones) },
      include: {
        zones: { select: { id: true, name: true } },
      },
    });
  }

  async count(
    where?: Prisma.ObjectsWhereInput,
    hideGodZones = false
  ): Promise<number> {
    return this.database.objects.count({
      where: { ...(where || {}), ...inVisibleZone(hideGodZones) },
    });
  }

  /** Count for the filtered list (same WHERE as {@link findAll}). */
  async countFiltered(filter: ObjectListFilter = {}): Promise<number> {
    return this.database.objects.count({ where: this.listWhere(filter) });
  }

  async search(
    search: string,
    limit: number = 10,
    zoneId?: number,
    hideGodZones = false
  ): Promise<Objects[]> {
    const searchTerm = search.trim().toLowerCase();
    const searchNum = parseInt(searchTerm, 10);
    const isNumeric = !isNaN(searchNum);

    // Split search into words for multi-word AND logic
    const searchWords = searchTerm.split(/\s+/).filter(w => w.length > 0);

    // Build WHERE clause using plaintext fields
    const where: Prisma.ObjectsWhereInput = {
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
              {
                plainActionDescription: { contains: word, mode: 'insensitive' },
              },
            ],
          })),
        },
      ],
    };

    return this.database.objects.findMany({
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

  /** Next unused object id in a zone: highest id + 1, or 0 for an empty zone. */
  async nextFreeId(zoneId: number): Promise<number> {
    const { _max } = await this.database.objects.aggregate({
      where: { zoneId },
      _max: { id: true },
    });
    return _max.id === null || _max.id === undefined ? 0 : _max.id + 1;
  }

  /** Throws ConflictException when (zoneId, id) already exists. */
  async assertIdFree(zoneId: number, id: number): Promise<void> {
    const existing = await this.database.objects.findUnique({
      where: { zoneId_id: { zoneId, id } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        `Object ${id} already exists in zone ${zoneId}`
      );
    }
  }

  async create(data: Prisma.ObjectsCreateInput): Promise<Objects> {
    return this.database.objects.create({ data });
  }

  async update(
    zoneId: number,
    id: number,
    data: Prisma.ObjectsUpdateInput
  ): Promise<Objects> {
    const where = { zoneId_id: { zoneId, id } };
    const incoming = data.values;
    const isPlain =
      !!incoming &&
      typeof incoming === 'object' &&
      Object.getPrototypeOf(incoming) === Object.prototype;
    if (!isPlain) return this.database.objects.update({ where, data });

    // The spell list (ObjectAbilities) owns the mirror keys of potions,
    // scrolls, wands and staves. A form that loaded the object earlier may
    // carry a stale mirror, so a generic save keeps the stored one instead.
    const existing = await this.database.objects.findUnique({
      where,
      select: { type: true, values: true },
    });
    const nextType = typeof data.type === 'string' ? data.type : existing?.type;
    if (
      !existing ||
      !nextType ||
      !(SPELL_ITEM_TYPES as readonly string[]).includes(nextType)
    ) {
      return this.database.objects.update({ where, data });
    }
    const stored = (existing.values ?? {}) as Record<string, unknown>;
    const values = { ...(incoming as Record<string, Prisma.InputJsonValue>) };
    for (const key of SPELL_MIRROR_KEYS) {
      delete values[key];
      if (
        key in stored &&
        (SPELL_ITEM_TYPES as readonly string[]).includes(existing.type)
      ) {
        values[key] = stored[key] as Prisma.InputJsonValue;
      }
    }
    return this.database.objects.update({ where, data: { ...data, values } });
  }

  async delete(zoneId: number, id: number): Promise<Objects> {
    await assertNoPlayerItems(this.database, [{ zoneId, id }]);
    try {
      return await this.database.objects.delete({
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
    await assertNoPlayerItems(this.database, keys);
    try {
      const result = await this.database.objects.deleteMany({
        where: { OR: keys.map(({ zoneId, id }) => ({ zoneId, id })) },
      });
      return result.count;
    } catch (error) {
      rethrowAsInUse(error, keys);
    }
  }

  async updateObjectEffects(
    zoneId: number,
    id: number,
    effects: Array<{
      effectId: number;
      strength?: number;
      modifierData?: Prisma.JsonValue;
      wearLocation?: string;
    }>
  ) {
    await this.database.$transaction(async tx => {
      await tx.objectEffects.deleteMany({
        where: { objectZoneId: zoneId, objectId: id },
      });
      if (effects.length > 0) {
        await tx.objectEffects.createMany({
          data: effects.map(e => ({
            objectZoneId: zoneId,
            objectId: id,
            effectId: e.effectId,
            strength: e.strength ?? 1,
            modifierData: e.modifierData ?? {},
            ...(e.wearLocation && { wearLocation: e.wearLocation as WearFlag }),
          })),
        });
      }
    });
    return this.findOne(zoneId, id);
  }

  async updateObjectResistances(
    zoneId: number,
    id: number,
    resistances: Array<{
      element: string;
      value: number;
      allowAbsorption?: boolean;
    }>
  ) {
    await this.database.$transaction(async tx => {
      await tx.objectResistance.deleteMany({
        where: { objectZoneId: zoneId, objectId: id },
      });
      if (resistances.length > 0) {
        await tx.objectResistance.createMany({
          data: resistances.map(r => ({
            objectZoneId: zoneId,
            objectId: id,
            element: r.element as ElementType,
            value: r.value,
            allowAbsorption: r.allowAbsorption ?? false,
          })),
        });
      }
    });
    return this.findOne(zoneId, id);
  }

  async updateConsumableEffects(
    zoneId: number,
    id: number,
    effects: Array<{
      effectId: number;
      chance?: number;
      level?: number;
      duration?: number;
    }>
  ) {
    await this.database.$transaction(async tx => {
      await tx.consumableEffect.deleteMany({
        where: { objectZoneId: zoneId, objectId: id },
      });
      if (effects.length > 0) {
        await tx.consumableEffect.createMany({
          data: effects.map(e => ({
            objectZoneId: zoneId,
            objectId: id,
            effectId: e.effectId,
            chance: e.chance ?? 1.0,
            level: e.level ?? 1,
            ...(e.duration !== undefined && { duration: e.duration }),
          })),
        });
      }
    });
    return this.findOne(zoneId, id);
  }
}
