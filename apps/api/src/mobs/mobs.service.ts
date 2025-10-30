import { Injectable } from '@nestjs/common';
import { Mob, Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MobsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.MobWhereInput;
    orderBy?: Prisma.MobOrderByWithRelationInput;
  }): Promise<Mob[]> {
    const mobs = await this.database.mob.findMany({
      skip: args?.skip,
      take: args?.take,
      where: args?.where,
      orderBy: args?.orderBy || { id: 'asc' },
      include: {},
    });
    return mobs;
  }

  async findOne(zoneId: number, id: number): Promise<Mob | null> {
    const mob = await this.database.mob.findUnique({
      where: {
        zoneId_id: {
          zoneId,
          id,
        },
      },
      include: {
        skills: { include: { skill: true } },
        spells: { include: { spell: true } },
        resets: {
          include: {
            room: { select: { id: true, zoneId: true, name: true } },
            zone: { select: { id: true, name: true } },
            equipment: true,
          },
        },
      },
    });
    return mob;
  }

  async findByZone(zoneId: number): Promise<Mob[]> {
    const mobs = await this.database.mob.findMany({
      where: { zoneId },
      include: {
        resets: {
          include: {
            room: { select: { id: true, name: true } },
          },
        },
      },
    });
    return mobs;
  }

  async count(where?: Prisma.MobWhereInput): Promise<number> {
    return this.database.mob.count({ where });
  }

  async create(data: Prisma.MobCreateInput): Promise<Mob> {
    const mob = await this.database.mob.create({
      data,
      include: {},
    });
    return mob;
  }

  async update(
    zoneId: number,
    id: number,
    data: Prisma.MobUpdateInput
  ): Promise<Mob> {
    const mob = await this.database.mob.update({
      where: { zoneId_id: { zoneId, id } },
      data,
      include: {},
    });
    return mob;
  }

  async delete(zoneId: number, id: number): Promise<Mob> {
    return this.database.mob.delete({
      where: { zoneId_id: { zoneId, id } },
    });
  }

  async deleteMany(ids: number[]): Promise<number> {
    const result = await this.database.mob.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }

  // Mapping moved to GraphQL field resolver.
}
