import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateShopInput, ShopDto, UpdateShopInput } from './shop.dto';
import { ShopsService } from './shops.service';

@Resolver(() => ShopDto)
export class ShopsResolver {
  constructor(private readonly shopsService: ShopsService) { }

  private mapShopToDto(shop: any): ShopDto {
    const messages = (shop.messages || {}) as any;
    return {
      id: shop.id,
      buyProfit: shop.buyProfit,
      sellProfit: shop.sellProfit,
      temper1: shop.temper,
      flags: shop.flags || [],
      tradesWithFlags: shop.tradesWith || [],
      noSuchItem1: messages.noSuchItem1,
      noSuchItem2: messages.noSuchItem2,
      doNotBuy: messages.doNotBuy,
      missingCash1: messages.missingCash1,
      missingCash2: messages.missingCash2,
      messageBuy: messages.messageBuy,
      messageSell: messages.messageSell,
      keeperId: shop.keeperId,
      keeper: shop.keeper ? {
        id: shop.keeper.id,
        zoneId: shop.keeper.zoneId,
        shortDesc: shop.keeper.shortDesc,
        keywords: shop.keeper.keywords || [],
      } : undefined,
      zoneId: shop.zoneId,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
      items: shop.items?.map((item: any) => ({
        id: item.id,
        amount: item.stockLimit,
        objectId: item.objectId,
        object: item.object,
      })) || [],
      accepts: shop.accepts?.map((accept: any) => ({
        id: accept.id,
        type: accept.itemType,
        keywords: accept.keywords || [],
      })) || [],
      hours: shop.hours?.map((hour: any) => ({
        id: hour.id,
        open: hour.openHour,
        close: hour.closeHour,
      })) || [],
    };
  }

  @Query(() => [ShopDto], { name: 'shops' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<ShopDto[]> {
    const shops = await this.shopsService.findAll({ skip, take });
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
      zone: {
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
}
