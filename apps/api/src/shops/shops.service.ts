import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from '../database/database.service';

type ShopWithRelations = Prisma.ShopGetPayload<{
  include: {
    keeper: {
      select: {
        id: true;
        zoneId: true;
        shortDesc: true;
        keywords: true;
      };
    };
    items: {
      include: {
        object: {
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
    accepts: true;
    hours: true;
  };
}>;

@Injectable()
export class ShopsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.ShopWhereInput;
    orderBy?: Prisma.ShopOrderByWithRelationInput;
  }): Promise<ShopWithRelations[]> {
    return this.database.shop.findMany({
      skip: args?.skip,
      take: args?.take,
      where: args?.where,
      orderBy: args?.orderBy || { id: 'asc' },
      include: {
        keeper: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            keywords: true,
          },
        },
        items: {
          include: {
            object: {
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
        accepts: true,
        hours: true,
      },
    });
  }

  async findOne(
    zoneId: number,
    id: number
  ): Promise<ShopWithRelations | null> {
    return this.database.shop.findUnique({
      where: {
        zoneId_id: {
          zoneId,
          id,
        },
      },
      include: {
        keeper: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            keywords: true,
          },
        },
        items: {
          include: {
            object: {
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
        accepts: true,
        hours: true,
      },
    });
  }

  async findByZone(zoneId: number): Promise<ShopWithRelations[]> {
    return this.database.shop.findMany({
      where: {
        zoneId: zoneId,
      },
      include: {
        keeper: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            keywords: true,
          },
        },
        items: {
          include: {
            object: {
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
        accepts: true,
        hours: true,
      },
    });
  }

  async findByKeeper(
    keeperZoneId: number,
    keeperId: number
  ): Promise<ShopWithRelations | null> {
    return this.database.shop.findFirst({
      where: {
        keeperZoneId,
        keeperId,
      },
      include: {
        keeper: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            keywords: true,
          },
        },
        items: {
          include: {
            object: {
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
        accepts: true,
        hours: true,
      },
    });
  }

  async count(where?: Prisma.ShopWhereInput): Promise<number> {
    return this.database.shop.count({ where });
  }

  async create(data: Prisma.ShopCreateInput): Promise<ShopWithRelations> {
    return this.database.shop.create({
      data,
      include: {
        keeper: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            keywords: true,
          },
        },
        items: {
          include: {
            object: {
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
        accepts: true,
        hours: true,
      },
    });
  }

  async update(
    zoneId: number,
    id: number,
    data: Prisma.ShopUpdateInput
  ): Promise<ShopWithRelations> {
    return this.database.shop.update({
      where: {
        zoneId_id: {
          zoneId,
          id,
        },
      },
      data,
      include: {
        keeper: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            keywords: true,
          },
        },
        items: {
          include: {
            object: {
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
        accepts: true,
        hours: true,
      },
    });
  }

  async delete(zoneId: number, id: number): Promise<ShopWithRelations> {
    return this.database.shop.delete({
      where: {
        zoneId_id: {
          zoneId,
          id,
        },
      },
      include: {
        keeper: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            keywords: true,
          },
        },
        items: {
          include: {
            object: {
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
        accepts: true,
        hours: true,
      },
    });
  }
}
