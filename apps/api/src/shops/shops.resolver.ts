import { UseGuards } from '@nestjs/common';
import type { Users } from '@muditor/db';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { hidesGodZones, inVisibleZone } from '../common/god-zone-visibility';
import {
  CreateShopInput,
  KeeperDto,
  ShopAcceptDto,
  ShopDto,
  ShopItemDto,
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
    flags: import('@muditor/db').ShopFlag[];
    tradesWithFlags: import('@muditor/db').ShopTradesWith[];
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
      };
      if (a.keywords && a.keywords.length) {
        // Non-empty check above doesn't narrow array emptiness for TS with exactOptionalPropertyTypes; use non-null assertion
        (base as unknown as { keywords?: string }).keywords = a.keywords[0]!;
      }
      return base;
    });
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
    };
    if (shop.keeperId != null) {
      (result as { keeperId?: number }).keeperId = shop.keeperId;
    }
    if (keeper) {
      (result as { keeper?: KeeperDto }).keeper = keeper;
    }
    return result as ShopDto;
  }

  // Shop reads are public; shops in god zones are hidden from anonymous
  // callers and mortal accounts (IMMORTAL+ still see them).
  @Query(() => [ShopDto], { name: 'shops' })
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @CurrentUser() user?: Users | null
  ): Promise<ShopDto[]> {
    const shops = await this.shopsService.findAll({
      where: { ...inVisibleZone(hidesGodZones(user ?? null)) },
      ...(typeof skip === 'number' ? { skip } : {}),
      ...(typeof take === 'number' ? { take } : {}),
    });
    return shops.map(shop => this.mapShopToDto(shop));
  }

  @Query(() => ShopDto, { name: 'shop' })
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user?: Users | null
  ): Promise<ShopDto | null> {
    const shop = await this.shopsService.findOne(
      zoneId,
      id,
      hidesGodZones(user ?? null)
    );
    return shop ? this.mapShopToDto(shop) : null;
  }

  @Query(() => [ShopDto], { name: 'shopsByZone' })
  @UseGuards(OptionalJwtAuthGuard)
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @CurrentUser() user?: Users | null
  ): Promise<ShopDto[]> {
    const shops = await this.shopsService.findByZone(
      zoneId,
      hidesGodZones(user ?? null)
    );
    return shops.map(shop => this.mapShopToDto(shop));
  }

  @Query(() => ShopDto, { name: 'shopByKeeper' })
  @UseGuards(OptionalJwtAuthGuard)
  async findByKeeper(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user?: Users | null
  ): Promise<ShopDto | null> {
    const shop = await this.shopsService.findByKeeper(
      zoneId,
      id,
      hidesGodZones(user ?? null)
    );
    return shop ? this.mapShopToDto(shop) : null;
  }

  @Query(() => Int, { name: 'shopsCount' })
  @UseGuards(OptionalJwtAuthGuard)
  async count(@CurrentUser() user?: Users | null): Promise<number> {
    return this.shopsService.count({
      ...inVisibleZone(hidesGodZones(user ?? null)),
    });
  }

  @Mutation(() => ShopDto)
  // The keeper mob's zone must be writable as well as the shop's zone.
  @RequireZoneWrite({ keys: ['zoneId', 'keeperZoneId'] })
  async createShop(@Args('data') data: CreateShopInput): Promise<ShopDto> {
    const shop = await this.shopsService.create({
      id: data.id,
      buyProfit: data.buyProfit ?? 1.0,
      sellProfit: data.sellProfit ?? 1.0,
      temper: data.temper ?? 0,
      flags: data.flags ?? [],
      tradesWithFlags: data.tradesWithFlags ?? [],
      noSuchItemMessages: data.noSuchItemMessages ?? [],
      doNotBuyMessages: data.doNotBuyMessages ?? [],
      missingCashMessages: data.missingCashMessages ?? [],
      buyMessages: data.buyMessages ?? [],
      sellMessages: data.sellMessages ?? [],
      zones: { connect: { id: data.zoneId } },
      mobs: {
        connect: {
          zoneId_id: { zoneId: data.keeperZoneId, id: data.keeperId },
        },
      },
    });
    return this.mapShopToDto(shop);
  }

  @Mutation(() => ShopDto)
  @RequireZoneWrite()
  async updateShop(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateShopInput
  ): Promise<ShopDto> {
    const shop = await this.shopsService.update(zoneId, id, data);
    return this.mapShopToDto(shop);
  }

  @Mutation(() => ShopDto)
  @RequireZoneWrite()
  async deleteShop(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<ShopDto> {
    const shop = await this.shopsService.delete(zoneId, id);
    return this.mapShopToDto(shop);
  }

  @Mutation(() => ShopDto)
  @RequireZoneWrite()
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
}
