import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Zone, Prisma } from '@muditor/db';

@Injectable()
export class ZonesService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.ZoneWhereInput;
    orderBy?: Prisma.ZoneOrderByWithRelationInput;
  }): Promise<Zone[]> {
    return this.database.zone.findMany({
      skip: args?.skip,
      take: args?.take,
      where: args?.where,
      orderBy: args?.orderBy || { id: 'asc' },
    });
  }

  async findOne(id: number): Promise<Zone | null> {
    return this.database.zone.findUnique({
      where: { id },
      include: {
        rooms: {
          select: {
            id: true,
            name: true,
            description: true,
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

  async count(where?: Prisma.ZoneWhereInput): Promise<number> {
    return this.database.zone.count({ where });
  }

  async create(data: Prisma.ZoneCreateInput): Promise<Zone> {
    return this.database.zone.create({ data });
  }

  async update(id: number, data: Prisma.ZoneUpdateInput): Promise<Zone> {
    return this.database.zone.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Zone> {
    return this.database.zone.delete({
      where: { id },
    });
  }
}