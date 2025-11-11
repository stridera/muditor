import { Injectable } from '@nestjs/common';
import { Mobs, Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MobsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    search?: string;
    where?: Prisma.MobsWhereInput;
    orderBy?: Prisma.MobsOrderByWithRelationInput;
  }): Promise<Mobs[]> {
    const whereClause: Prisma.MobsWhereInput = args?.where || {};

    // Add search filter if provided
    if (args?.search && args.search.trim()) {
      whereClause.OR = [
        { name: { contains: args.search, mode: 'insensitive' } },
        { keywords: { hasSome: [args.search.toLowerCase()] } },
        { roomDescription: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    const findArgs: Prisma.MobsFindManyArgs = {
      where: whereClause,
      orderBy: args?.orderBy || { id: 'asc' },
      include: {},
    };
    if (args?.skip !== undefined) findArgs.skip = args.skip;
    if (args?.take !== undefined) findArgs.take = args.take;
    const mobs = await this.database.mobs.findMany(findArgs);
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
        mobAbilities: { include: { ability: true } },
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

  async findByZone(zoneId: number, search?: string): Promise<Mobs[]> {
    const whereClause: Prisma.MobsWhereInput = { zoneId };

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

  async count(where?: Prisma.MobsWhereInput): Promise<number> {
    const countArgs: { where?: Prisma.MobsWhereInput } = {};
    if (where) countArgs.where = where;
    return this.database.mobs.count(countArgs);
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
