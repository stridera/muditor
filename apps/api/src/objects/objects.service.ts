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
        triggers: true,
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
}
