import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateShopInput,
  KeeperDto,
  ShopAcceptDto,
  ShopDto,
  ShopHourDto,
  ShopItemDto,
  UpdateShopHoursInput,
  UpdateShopInput,
  UpdateShopInventoryInput,
} from './shop.dto';
import { ShopsService } from './shops.service';

@Resolver(() => ShopDto)
export class ShopsResolver {
  constructor(private readonly shopsService: ShopsService) {}

  private mapShopToDto(shop: {
    id: number;
    buyProfit: number;
    sellProfit: number;
    temper: number;
    flags: import('@prisma/client').ShopFlag[];
    tradesWithFlags: import('@prisma/client').ShopTradesWith[];
    noSuchItemMessages: string[];
    doNotBuyMessages: string[];
    missingCashMessages: string[];
    buyMessages: string[];
    sellMessages: string[];
    keeperId?: number | null;
    zoneId: number;
    createdAt: Date;
    updatedAt: Date;
    mobs?: {
      id: number;
      zoneId: number;
      name: string;
      keywords: string[];
    } | null;
    shopItems?: Array<{
      id: number;
      amount: number;
      objectId: number;
      objectZoneId: number;
      objects?: {
        id: number;
        zoneId: number;
        name: string;
        type: string;
        cost?: number | null;
      } | null;
    }>;
    shopAccepts?: Array<{ id: number; type: string; keywords: string[] }>;
    shopHours?: Array<{ id: number; open: number; close: number }>;
  }): ShopDto {
    const keeper: KeeperDto | undefined = shop.mobs
      ? {
          id: shop.mobs.id,
          zoneId: shop.mobs.zoneId,
          name: shop.mobs.name,
          keywords: shop.mobs.keywords || [],
        }
      : undefined;
    const items: ShopItemDto[] = (shop.shopItems || []).map(i => {
      const base: ShopItemDto = {
        id: String(i.id),
        amount: i.amount,
        objectId: i.objectId,
        objectZoneId: i.objectZoneId,
      };
      if (i.objects) {
        (
          base as unknown as {
            object: {
              id: number;
              zoneId: number;
              name: string;
              keywords: string[];
              type: string;
              cost?: number | undefined;
            };
          }
        ).object = {
          id: i.objects.id,
          zoneId: i.objects.zoneId,
          name: i.objects.name,
          keywords: [],
          type: i.objects.type,
          cost: i.objects.cost ?? undefined,
        };
      }
      return base;
    });
    const accepts: ShopAcceptDto[] = (shop.shopAccepts || []).map(a => {
      const base: ShopAcceptDto = {
        id: String(a.id),
        type: a.type,
      } as ShopAcceptDto;
      if (a.keywords && a.keywords.length) {
        // Non-empty check above doesn't narrow array emptiness for TS with exactOptionalPropertyTypes; use non-null assertion
        (base as unknown as { keywords?: string }).keywords = a.keywords[0]!;
      }
      return base;
    });
    const hours: ShopHourDto[] = (shop.shopHours || []).map(h => ({
      id: String(h.id),
      open: h.open,
      close: h.close,
    }));
    // Build result without optional keeperId unless it exists; with exactOptionalPropertyTypes we must omit the property instead of setting undefined
    const result: Omit<ShopDto, 'keeperId' | 'keeper'> & {
      keeperId?: number;
      keeper?: KeeperDto;
    } = {
      id: shop.id,
      buyProfit: shop.buyProfit,
      sellProfit: shop.sellProfit,
      temper: shop.temper,
      flags: shop.flags || [],
      tradesWithFlags: shop.tradesWithFlags || [],
      noSuchItemMessages: shop.noSuchItemMessages || [],
      doNotBuyMessages: shop.doNotBuyMessages || [],
      missingCashMessages: shop.missingCashMessages || [],
      buyMessages: shop.buyMessages || [],
      sellMessages: shop.sellMessages || [],
      zoneId: shop.zoneId,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
      items,
      accepts,
      hours,
    };
    if (shop.keeperId != null) {
      (result as { keeperId?: number }).keeperId = shop.keeperId;
    }
    if (keeper) {
      (result as { keeper?: KeeperDto }).keeper = keeper;
    }
    return result as ShopDto;
  }

  @Query(() => [ShopDto], { name: 'shops' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<ShopDto[]> {
    const shops = await this.shopsService.findAll({
      ...(typeof skip === 'number' ? { skip } : {}),
      ...(typeof take === 'number' ? { take } : {}),
    });
    return shops.map(shop => this.mapShopToDto(shop));
  }

  @Query(() => ShopDto, { name: 'shop' })
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<ShopDto | null> {
    const shop = await this.shopsService.findOne(zoneId, id);
    return shop ? this.mapShopToDto(shop) : null;
  }

  @Query(() => [ShopDto], { name: 'shopsByZone' })
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number
  ): Promise<ShopDto[]> {
    const shops = await this.shopsService.findByZone(zoneId);
    return shops.map(shop => this.mapShopToDto(shop));
  }

  @Query(() => ShopDto, { name: 'shopByKeeper' })
  async findByKeeper(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<ShopDto | null> {
    const shop = await this.shopsService.findByKeeper(zoneId, id);
    return shop ? this.mapShopToDto(shop) : null;
  }

  @Query(() => Int, { name: 'shopsCount' })
  async count(): Promise<number> {
    return this.shopsService.count();
  }

  @Mutation(() => ShopDto)
  @UseGuards(JwtAuthGuard)
  async createShop(@Args('data') data: CreateShopInput): Promise<ShopDto> {
    const { zoneId, ...shopData } = data;
    const shop = await this.shopsService.create({
      ...shopData,
      zones: {
        connect: { id: zoneId },
      },
    });
    return this.mapShopToDto(shop);
  }

  @Mutation(() => ShopDto)
  @UseGuards(JwtAuthGuard)
  async updateShop(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateShopInput
  ): Promise<ShopDto> {
    const shop = await this.shopsService.update(zoneId, id, data);
    return this.mapShopToDto(shop);
  }

  @Mutation(() => ShopDto)
  @UseGuards(JwtAuthGuard)
  async deleteShop(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<ShopDto> {
    const shop = await this.shopsService.delete(zoneId, id);
    return this.mapShopToDto(shop);
  }

  @Mutation(() => ShopDto)
  @UseGuards(JwtAuthGuard)
  async updateShopInventory(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateShopInventoryInput
  ): Promise<ShopDto> {
    const shop = await this.shopsService.replaceInventory(
      zoneId,
      id,
      data.items
    );
    return this.mapShopToDto(shop);
  }

  @Mutation(() => ShopDto)
  @UseGuards(JwtAuthGuard)
  async updateShopHours(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateShopHoursInput
  ): Promise<ShopDto> {
    const shop = await this.shopsService.replaceHours(zoneId, id, data.hours);
    return this.mapShopToDto(shop);
  }
}
