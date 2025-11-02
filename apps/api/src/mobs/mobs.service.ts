import { Injectable } from '@nestjs/common';
import { Mobs, Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MobsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.MobsWhereInput;
    orderBy?: Prisma.MobsOrderByWithRelationInput;
  }): Promise<Mobs[]> {
    const mobs = await this.database.mobs.findMany({
      skip: args?.skip,
      take: args?.take,
      where: args?.where,
      orderBy: args?.orderBy || { id: 'asc' },
      include: {},
    });
    return mobs;
  }

  async findOne(zoneId: number, id: number): Promise<Mobs | null> {
    const mob = await this.database.mobs.findUnique({
      where: {
        zoneId_id: {
          zoneId,
          id,
        },
      },
      include: {
        mobSkills: { include: { skills: true } },
        mobSpells: { include: { spells: true } },
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

  async findByZone(zoneId: number): Promise<Mobs[]> {
    const mobs = await this.database.mobs.findMany({
      where: { zoneId },
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

  async count(where?: Prisma.MobsWhereInput): Promise<number> {
    return this.database.mobs.count({ where });
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
    return this.database.mobs.delete({
      where: { zoneId_id: { zoneId, id } },
    });
  }

  async deleteMany(ids: number[]): Promise<number> {
    const result = await this.database.mobs.deleteMany({
      where: { id: { in: ids } },
    });
    return result.count;
  }

  // Mapping moved to GraphQL field resolver.
}
