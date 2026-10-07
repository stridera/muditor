import { Injectable } from '@nestjs/common';
import {
  type Objects,
  ObjectType,
  Prisma,
  ElementType,
  WearFlag,
} from '@muditor/db';
import { inVisibleZone } from '../common/god-zone-visibility';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ObjectsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.ObjectsWhereInput;
    orderBy?: Prisma.ObjectsOrderByWithRelationInput;
    /** Omit objects in god zones (public readers below IMMORTAL). */
    hideGodZones?: boolean;
  }): Promise<Objects[]> {
    const findArgs: Prisma.ObjectsFindManyArgs = {
      orderBy: args?.orderBy || { id: 'asc' },
    };
    if (args?.where || args?.hideGodZones) {
      findArgs.where = {
        ...(args.where || {}),
        ...inVisibleZone(!!args.hideGodZones),
      };
    }
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
      ...(zoneId && { zoneId }),
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

  async create(data: Prisma.ObjectsCreateInput): Promise<Objects> {
    return this.database.objects.create({ data });
  }

  async update(
    zoneId: number,
    id: number,
    data: Prisma.ObjectsUpdateInput
  ): Promise<Objects> {
    return this.database.objects.update({
      where: { zoneId_id: { zoneId, id } },
      data,
    });
  }

  async delete(zoneId: number, id: number): Promise<Objects> {
    return this.database.objects.delete({
      where: { zoneId_id: { zoneId, id } },
    });
  }

  /**
   * Delete by composite key (zoneId, id). Matching on id alone would delete
   * same-numbered entities in other zones.
   */
  async deleteMany(
    keys: Array<{ zoneId: number; id: number }>
  ): Promise<number> {
    if (keys.length === 0) return 0;
    const result = await this.database.objects.deleteMany({
      where: { OR: keys.map(({ zoneId, id }) => ({ zoneId, id })) },
    });
    return result.count;
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
