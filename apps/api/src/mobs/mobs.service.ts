import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Mob, Prisma } from '@prisma/client';

@Injectable()
export class MobsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.MobWhereInput;
    orderBy?: Prisma.MobOrderByWithRelationInput;
  }): Promise<Mob[]> {
    return this.database.mob.findMany({
      skip: args?.skip,
      take: args?.take,
      where: args?.where,
      orderBy: args?.orderBy || { id: 'asc' },
    });
  }

  async findOne(id: number): Promise<Mob | null> {
    return this.database.mob.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        spells: {
          include: {
            spell: true,
          },
        },
        resets: {
          include: {
            room: {
              select: {
                id: true,
                name: true,
              },
            },
            zone: {
              select: {
                id: true,
                name: true,
              },
            },
            carrying: {
              include: {
                object: {
                  select: {
                    id: true,
                    shortDesc: true,
                    type: true,
                  },
                },
              },
            },
            equipped: {
              include: {
                object: {
                  select: {
                    id: true,
                    shortDesc: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findByZone(zoneId: number): Promise<Mob[]> {
    return this.database.mob.findMany({
      where: {
        resets: {
          some: {
            zoneId: zoneId,
          },
        },
      },
      include: {
        resets: {
          where: {
            zoneId: zoneId,
          },
          include: {
            room: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async count(where?: Prisma.MobWhereInput): Promise<number> {
    return this.database.mob.count({ where });
  }

  async create(data: Prisma.MobCreateInput): Promise<Mob> {
    return this.database.mob.create({ data });
  }

  async update(id: number, data: Prisma.MobUpdateInput): Promise<Mob> {
    return this.database.mob.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Mob> {
    return this.database.mob.delete({
      where: { id },
    });
  }

  async deleteMany(ids: number[]): Promise<number> {
    const result = await this.database.mob.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }
}
