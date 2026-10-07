import { Injectable } from '@nestjs/common';
import { Prisma, type Zones } from '@muditor/db';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ZonesService {
  constructor(private readonly database: DatabaseService) {}

  /**
   * `hideGodZones` omits god zones (Zones.isGodZone). Public readers pass it
   * for anonymous/mortal viewers; internal callers leave it unset.
   */
  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.ZonesWhereInput;
    orderBy?: Prisma.ZonesOrderByWithRelationInput;
    hideGodZones?: boolean;
  }): Promise<Zones[]> {
    const findArgs: Prisma.ZonesFindManyArgs = {
      orderBy: args?.orderBy || { id: 'asc' },
    };
    const where = this.visibleWhere(args?.where, args?.hideGodZones);
    if (where) findArgs.where = where;
    if (args?.skip !== undefined) findArgs.skip = args.skip;
    if (args?.take !== undefined) findArgs.take = args.take;
    return this.database.zones.findMany(findArgs);
  }

  private visibleWhere(
    where: Prisma.ZonesWhereInput | undefined,
    hideGodZones: boolean | undefined
  ): Prisma.ZonesWhereInput | undefined {
    if (!hideGodZones) return where;
    return where
      ? { AND: [where, { isGodZone: false }] }
      : { isGodZone: false };
  }

  async findOne(id: number, hideGodZones = false): Promise<Zones | null> {
    return this.database.zones.findFirst({
      where: { id, ...(hideGodZones && { isGodZone: false }) },
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

  async count(
    where?: Prisma.ZonesWhereInput,
    hideGodZones = false
  ): Promise<number> {
    const countArgs: { where?: Prisma.ZonesWhereInput } = {};
    const visible = this.visibleWhere(where, hideGodZones);
    if (visible) countArgs.where = visible;
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
