import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Object, Prisma } from '@prisma/client';

@Injectable()
export class ObjectsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.ObjectWhereInput;
    orderBy?: Prisma.ObjectOrderByWithRelationInput;
  }): Promise<Object[]> {
    return this.database.object.findMany({
      skip: args?.skip,
      take: args?.take,
      where: args?.where,
      orderBy: args?.orderBy || { id: 'asc' },
    });
  }

  async findOne(id: number): Promise<Object | null> {
    return this.database.object.findUnique({
      where: { id },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
        extraDescs: true,
        affects: true,
        spells: true,
        triggers: true,
        shopItems: {
          include: {
            shop: {
              select: {
                id: true,
              },
            },
          },
        },
        mobCarrying: {
          include: {
            reset: {
              include: {
                mob: {
                  select: {
                    id: true,
                    shortDesc: true,
                  },
                },
              },
            },
          },
        },
        mobEquipped: {
          include: {
            reset: {
              include: {
                mob: {
                  select: {
                    id: true,
                    shortDesc: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByZone(zoneId: number): Promise<Object[]> {
    return this.database.object.findMany({
      where: {
        zoneId: zoneId,
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByType(type: string): Promise<Object[]> {
    return this.database.object.findMany({
      where: {
        type: type as any,
      },
      include: {
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.ObjectWhereInput): Promise<number> {
    return this.database.object.count({ where });
  }

  async create(data: Prisma.ObjectCreateInput): Promise<Object> {
    return this.database.object.create({ data });
  }

  async update(id: number, data: Prisma.ObjectUpdateInput): Promise<Object> {
    return this.database.object.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Object> {
    return this.database.object.delete({
      where: { id },
    });
  }

  async deleteMany(ids: number[]): Promise<number> {
    const result = await this.database.object.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }
}
