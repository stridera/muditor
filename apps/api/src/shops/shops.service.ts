import { Injectable } from '@nestjs/common';
import { Prisma } from '@muditor/db';
import { inVisibleZone } from '../common/god-zone-visibility';
import { DatabaseService } from '../database/database.service';

type ShopWithRelations = Prisma.ShopsGetPayload<{
  include: {
    mobs: {
      select: {
        id: true;
        zoneId: true;
        name: true;
        keywords: true;
      };
    };
    shopItems: {
      include: {
        objects: {
          select: {
            id: true;
            zoneId: true;
            name: true;
            type: true;
            cost: true;
          };
        };
      };
    };
    shopAccepts: true;
  };
}>;

@Injectable()
export class ShopsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.ShopsWhereInput;
    orderBy?: Prisma.ShopsOrderByWithRelationInput;
  }): Promise<ShopWithRelations[]> {
    const query: Prisma.ShopsFindManyArgs = {
      include: {
        mobs: {
          select: { id: true, zoneId: true, name: true, keywords: true },
        },
        shopItems: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shopAccepts: true,
      },
      orderBy: args?.orderBy ? { ...args.orderBy } : { id: 'asc' },
    };
    if (typeof args?.skip === 'number') query.skip = args.skip;
    if (typeof args?.take === 'number') query.take = args.take;
    if (args?.where) query.where = { ...args.where };
    // Prisma's type inference under exactOptionalPropertyTypes is losing the include typing; force cast.
    return this.database.shops.findMany(
      query
    ) as unknown as ShopWithRelations[];
  }

  async findOne(
    zoneId: number,
    id: number,
    hideGodZones = false
  ): Promise<ShopWithRelations | null> {
    return this.database.shops.findUnique({
      where: {
        zoneId_id: {
          zoneId,
          id,
        },
        ...inVisibleZone(hideGodZones),
      },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
            keywords: true,
          },
        },
        shopItems: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shopAccepts: true,
      },
    });
  }

  async findByZone(
    zoneId: number,
    hideGodZones = false
  ): Promise<ShopWithRelations[]> {
    return this.database.shops.findMany({
      where: {
        zoneId: zoneId,
        ...inVisibleZone(hideGodZones),
      },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
            keywords: true,
          },
        },
        shopItems: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shopAccepts: true,
      },
    });
  }

  async findByKeeper(
    keeperZoneId: number,
    keeperId: number,
    hideGodZones = false
  ): Promise<ShopWithRelations | null> {
    return this.database.shops.findFirst({
      where: {
        keeperZoneId,
        keeperId,
        ...inVisibleZone(hideGodZones),
      },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
            keywords: true,
          },
        },
        shopItems: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shopAccepts: true,
      },
    });
  }

  async count(where?: Prisma.ShopsWhereInput): Promise<number> {
    const args: Prisma.ShopsCountArgs = {};
    if (where) args.where = { ...where };
    return this.database.shops.count(args);
  }

  async create(data: Prisma.ShopsCreateInput): Promise<ShopWithRelations> {
    return this.database.shops.create({
      data,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
            keywords: true,
          },
        },
        shopItems: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shopAccepts: true,
      },
    });
  }

  async update(
    zoneId: number,
    id: number,
    data: Prisma.ShopsUpdateInput
  ): Promise<ShopWithRelations> {
    return this.database.shops.update({
      where: {
        zoneId_id: {
          zoneId,
          id,
        },
      },
      data,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
            keywords: true,
          },
        },
        shopItems: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shopAccepts: true,
      },
    });
  }

  async delete(zoneId: number, id: number): Promise<ShopWithRelations> {
    return this.database.shops.delete({
      where: {
        zoneId_id: {
          zoneId,
          id,
        },
      },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
            keywords: true,
          },
        },
        shopItems: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shopAccepts: true,
      },
    });
  }

  async replaceInventory(
    zoneId: number,
    id: number,
    items: Array<{ amount: number; objectZoneId: number; objectId: number }>
  ): Promise<ShopWithRelations> {
    // Strategy: delete existing items then recreate
    await this.database.shopItems.deleteMany({
      where: { shopZoneId: zoneId, shopId: id },
    });
    if (items.length) {
      await this.database.shopItems.createMany({
        data: items.map(i => ({
          shopZoneId: zoneId,
          shopId: id,
          amount: i.amount,
          objectZoneId: i.objectZoneId,
          objectId: i.objectId,
        })),
      });
    }
    return this.findOne(zoneId, id) as Promise<ShopWithRelations>;
  }
}
