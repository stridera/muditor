import { Injectable } from '@nestjs/common';
import { Prisma } from '@muditor/db';
import { inVisibleZone } from '../common/god-zone-visibility';
import { numericIdToken, searchTokens } from '../common/list-filter';
import { DatabaseService } from '../database/database.service';

const SHOP_INCLUDE = {
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
} as const;

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

/** Filters of the paged shops list (also applied to its count). */
export interface ShopListFilter {
  zoneId?: number | null | undefined;
  /** Terms are AND-ed; numbers match shop id / keeper id / zone, text the keeper's name. */
  search?: string | null | undefined;
  /** Both buy and sell profit at least 0.8. */
  highProfit?: boolean | null | undefined;
  /** true: has an assigned keeper; false: none. */
  hasKeeper?: boolean | null | undefined;
}

export const HIGH_PROFIT_MIN = 0.8;

export function shopListWhere(filter: ShopListFilter): Prisma.ShopsWhereInput {
  const and: Prisma.ShopsWhereInput[] = searchTokens(filter.search).map(
    term => {
      const n = numericIdToken(term);
      return {
        OR: [
          ...(n !== null ? [{ id: n }, { keeperId: n }, { zoneId: n }] : []),
          { mobs: { plainName: { contains: term, mode: 'insensitive' } } },
        ],
      };
    }
  );
  return {
    ...(filter.zoneId != null && { zoneId: filter.zoneId }),
    ...(filter.highProfit && {
      buyProfit: { gte: HIGH_PROFIT_MIN },
      sellProfit: { gte: HIGH_PROFIT_MIN },
    }),
    ...(filter.hasKeeper === true && { keeperId: { gt: 0 } }),
    ...(filter.hasKeeper === false && { keeperId: { lte: 0 } }),
    ...(and.length > 0 && { AND: and }),
  };
}

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
      orderBy: args?.orderBy
        ? { ...args.orderBy }
        : [{ id: 'asc' }, { zoneId: 'asc' }],
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

  /**
   * One query for many keepers. Returns the first shop per `"zone-id"` key
   * (same pick as {@link findByKeeper}); keepers without a shop are absent.
   */
  async findByKeepers(
    keepers: ReadonlyArray<{ zoneId: number; id: number }>,
    hideGodZones = false
  ): Promise<Map<string, ShopWithRelations>> {
    const result = new Map<string, ShopWithRelations>();
    if (keepers.length === 0) return result;
    const wanted = new Set(keepers.map(k => `${k.zoneId}-${k.id}`));
    const shops = (await this.database.shops.findMany({
      where: {
        keeperZoneId: { in: [...new Set(keepers.map(k => k.zoneId))] },
        keeperId: { in: [...new Set(keepers.map(k => k.id))] },
        ...inVisibleZone(hideGodZones),
      },
      orderBy: { id: 'asc' },
      include: SHOP_INCLUDE,
    })) as unknown as ShopWithRelations[];
    for (const shop of shops) {
      const key = `${shop.keeperZoneId}-${shop.keeperId}`;
      if (wanted.has(key) && !result.has(key)) result.set(key, shop);
    }
    return result;
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
    // The same object listed twice would create duplicate rows; the last
    // occurrence wins.
    const unique = new Map<string, (typeof items)[number]>();
    for (const item of items) {
      unique.set(`${item.objectZoneId}:${item.objectId}`, item);
    }

    // Delete + recreate must be atomic: a failure between the two steps would
    // otherwise leave the shop with no stock.
    await this.database.$transaction(async tx => {
      // The editor only knows amount/object; carry over per-item price and
      // spawn/visibility settings for objects that stay in the shop.
      const existing = await tx.shopItems.findMany({
        where: { shopZoneId: zoneId, shopId: id },
      });
      const previous = new Map(
        existing.map(e => [`${e.objectZoneId}:${e.objectId}`, e])
      );
      await tx.shopItems.deleteMany({
        where: { shopZoneId: zoneId, shopId: id },
      });
      if (unique.size) {
        await tx.shopItems.createMany({
          data: [...unique.entries()].map(([key, i]) => {
            const prev = previous.get(key);
            return {
              shopZoneId: zoneId,
              shopId: id,
              amount: i.amount,
              objectZoneId: i.objectZoneId,
              objectId: i.objectId,
              ...(prev && {
                price: prev.price,
                spawnChance: prev.spawnChance,
                visibilityRequirement: prev.visibilityRequirement,
                purchaseRequirement: prev.purchaseRequirement,
              }),
            };
          }),
        });
      }
    });
    return this.findOne(zoneId, id) as Promise<ShopWithRelations>;
  }
}
