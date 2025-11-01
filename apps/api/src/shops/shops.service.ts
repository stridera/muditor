import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

type ShopWithRelations = Prisma.ShopsGetPayload<{
  include: {
    mobs: {
      select: {
        id: true;
        zoneId: true;
        shortDesc: true;
        keywords: true;
      };
    };
    shop_items: {
      include: {
        objects: {
          select: {
            id: true;
            zoneId: true;
            shortDesc: true;
            type: true;
            cost: true;
          };
        };
      };
    };
    shop_accepts: true;
    shop_hours: true;
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
    return this.database.shops.findMany({
      skip: args?.skip,
      take: args?.take,
      where: args?.where,
      orderBy: args?.orderBy || { id: 'asc' },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            keywords: true,
          },
        },
        shop_items: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shop_accepts: true,
        shop_hours: true,
      },
    });
  }

  async findOne(zoneId: number, id: number): Promise<ShopWithRelations | null> {
    return this.database.shops.findUnique({
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
            shortDesc: true,
            keywords: true,
          },
        },
        shop_items: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shop_accepts: true,
        shop_hours: true,
      },
    });
  }

  async findByZone(zoneId: number): Promise<ShopWithRelations[]> {
    return this.database.shops.findMany({
      where: {
        zoneId: zoneId,
      },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            keywords: true,
          },
        },
        shop_items: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shop_accepts: true,
        shop_hours: true,
      },
    });
  }

  async findByKeeper(
    keeperZoneId: number,
    keeperId: number
  ): Promise<ShopWithRelations | null> {
    return this.database.shops.findFirst({
      where: {
        keeperZoneId,
        keeperId,
      },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            keywords: true,
          },
        },
        shop_items: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shop_accepts: true,
        shop_hours: true,
      },
    });
  }

  async count(where?: Prisma.ShopsWhereInput): Promise<number> {
    return this.database.shops.count({ where });
  }

  async create(data: Prisma.ShopsCreateInput): Promise<ShopWithRelations> {
    return this.database.shops.create({
      data,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            keywords: true,
          },
        },
        shop_items: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shop_accepts: true,
        shop_hours: true,
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
            shortDesc: true,
            keywords: true,
          },
        },
        shop_items: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shop_accepts: true,
        shop_hours: true,
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
            shortDesc: true,
            keywords: true,
          },
        },
        shop_items: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        shop_accepts: true,
        shop_hours: true,
      },
    });
  }
}
