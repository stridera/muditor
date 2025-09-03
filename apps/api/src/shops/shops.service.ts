import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Shop, Prisma } from '@prisma/client';

@Injectable()
export class ShopsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    where?: Prisma.ShopWhereInput;
    orderBy?: Prisma.ShopOrderByWithRelationInput;
  }): Promise<Shop[]> {
    return this.database.shop.findMany({
      skip: args?.skip,
      take: args?.take,
      where: args?.where,
      orderBy: args?.orderBy || { id: 'asc' },
    });
  }

  async findOne(id: number): Promise<Shop | null> {
    return this.database.shop.findUnique({
      where: { id },
      include: {
        keeper: {
          select: {
            id: true,
            shortDesc: true,
            keywords: true,
          },
        },
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            object: {
              select: {
                id: true,
                shortDesc: true,
                type: true,
                cost: true,
              },
            },
          },
        },
        accepts: true,
        rooms: true,
        hours: true,
      },
    });
  }

  async findByZone(zoneId: number): Promise<Shop[]> {
    return this.database.shop.findMany({
      where: {
        zoneId: zoneId,
      },
      include: {
        keeper: {
          select: {
            id: true,
            shortDesc: true,
            keywords: true,
          },
        },
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            object: {
              select: {
                id: true,
                shortDesc: true,
                type: true,
                cost: true,
              },
            },
          },
        },
      },
    });
  }

  async findByKeeper(keeperId: number): Promise<Shop | null> {
    return this.database.shop.findFirst({
      where: {
        keeperId: keeperId,
      },
      include: {
        keeper: {
          select: {
            id: true,
            shortDesc: true,
            keywords: true,
          },
        },
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            object: {
              select: {
                id: true,
                shortDesc: true,
                type: true,
                cost: true,
              },
            },
          },
        },
      },
    });
  }

  async count(where?: Prisma.ShopWhereInput): Promise<number> {
    return this.database.shop.count({ where });
  }

  async create(data: Prisma.ShopCreateInput): Promise<Shop> {
    return this.database.shop.create({ data });
  }

  async update(id: number, data: Prisma.ShopUpdateInput): Promise<Shop> {
    return this.database.shop.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Shop> {
    return this.database.shop.delete({
      where: { id },
    });
  }
}