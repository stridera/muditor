import { Injectable } from '@nestjs/common';
import { Objects, Prisma } from '@prisma/client';
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
    return this.database.objects.findMany({
      skip: args?.skip,
      take: args?.take,
      where: args?.where,
      orderBy: args?.orderBy || { id: 'asc' },
    });
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
        object_extra_descriptions: true,
        object_affects: true,
        triggers: true,
        shop_items: {
          include: {
            shops: {
              select: {
                id: true,
              },
            },
          },
        },
        mob_reset_equipment: {
          include: {
            mob_resets: {
              include: {
                mobs: {
                  select: {
                    id: true,
                    zoneId: true,
                    shortDesc: true,
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
                shortDesc: true,
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

  async findByType(type: string): Promise<Objects[]> {
    return this.database.objects.findMany({
      where: {
        type: type as any,
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

  async count(where?: Prisma.ObjectsWhereInput): Promise<number> {
    return this.database.objects.count({ where });
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
