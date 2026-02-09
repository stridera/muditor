import { Injectable } from '@nestjs/common';
import { Objects, ObjectType, Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ObjectsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.ObjectsWhereInput;
    orderBy?: Prisma.ObjectsOrderByWithRelationInput;
  }): Promise<Objects[]> {
    const findArgs: Prisma.ObjectsFindManyArgs = {
      orderBy: args?.orderBy || { id: 'asc' },
    };
    if (args?.where) findArgs.where = args.where;
    if (args?.skip !== undefined) findArgs.skip = args.skip;
    if (args?.take !== undefined) findArgs.take = args.take;
    return this.database.objects.findMany(findArgs);
  }

  async findOne(zoneId: number, id: number): Promise<Objects | null> {
    return this.database.objects.findUnique({
      where: {
        zoneId_id: {
          zoneId,
          id,
        },
      },
      include: {
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
        objectExtraDescriptions: true,
        objectAffects: true,
        Triggers: true,
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

  async findByZone(zoneId: number): Promise<Objects[]> {
    return this.database.objects.findMany({
      where: {
        zoneId: zoneId,
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

  async findByType(type: ObjectType): Promise<Objects[]> {
    return this.database.objects.findMany({
      where: { type },
      include: {
        zones: { select: { id: true, name: true } },
      },
    });
  }

  async count(where?: Prisma.ObjectsWhereInput): Promise<number> {
    const countArgs: { where?: Prisma.ObjectsWhereInput } = {};
    if (where) countArgs.where = where;
    return this.database.objects.count(countArgs);
  }

  async search(
    search: string,
    limit: number = 10,
    zoneId?: number
  ): Promise<Objects[]> {
    const searchTerm = search.trim().toLowerCase();
    const searchNum = parseInt(searchTerm, 10);
    const isNumeric = !isNaN(searchNum);

    // Split search into words for multi-word AND logic
    const searchWords = searchTerm.split(/\s+/).filter(w => w.length > 0);

    // Build WHERE clause using plaintext fields
    const where: Prisma.ObjectsWhereInput = {
      ...(zoneId && { zoneId }),
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

  async deleteMany(ids: number[]): Promise<number> {
    const result = await this.database.objects.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }

  async updateObjectEffects(
    zoneId: number,
    id: number,
    effects: Array<{
      effectId: number;
      strength?: number;
      modifierData?: any;
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
            ...(e.wearLocation && { wearLocation: e.wearLocation as any }),
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
            element: r.element as any,
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
