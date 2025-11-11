import { Injectable } from '@nestjs/common';
import { Prisma, Zones } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ZonesService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.ZonesWhereInput;
    orderBy?: Prisma.ZonesOrderByWithRelationInput;
  }): Promise<Zones[]> {
    const findArgs: Prisma.ZonesFindManyArgs = {
      orderBy: args?.orderBy || { id: 'asc' },
    };
    if (args?.where) findArgs.where = args.where;
    if (args?.skip !== undefined) findArgs.skip = args.skip;
    if (args?.take !== undefined) findArgs.take = args.take;
    return this.database.zones.findMany(findArgs);
  }

  async findOne(id: number): Promise<Zones | null> {
    return this.database.zones.findUnique({
      where: { id },
      include: {
        rooms: {
          select: {
            id: true,
            zoneId: true,
            name: true,
            roomDescription: true,
            sector: true,
          },
          orderBy: { id: 'asc' },
        },
        _count: {
          select: {
            rooms: true,
            mobs: true,
            objects: true,
            shops: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.ZonesWhereInput): Promise<number> {
    const countArgs: { where?: Prisma.ZonesWhereInput } = {};
    if (where) countArgs.where = where;
    return this.database.zones.count(countArgs);
  }

  async create(data: Prisma.ZonesCreateInput): Promise<Zones> {
    return this.database.zones.create({ data });
  }

  async update(id: number, data: Prisma.ZonesUpdateInput): Promise<Zones> {
    return this.database.zones.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Zones> {
    return this.database.zones.delete({
      where: { id },
    });
  }
}
