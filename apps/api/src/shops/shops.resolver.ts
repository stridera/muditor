import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopDto, CreateShopInput, UpdateShopInput } from './shop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => ShopDto)
export class ShopsResolver {
  constructor(private readonly shopsService: ShopsService) {}

  @Query(() => [ShopDto], { name: 'shops' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<ShopDto[]> {
    return this.shopsService.findAll({ skip, take });
  }

  @Query(() => ShopDto, { name: 'shop' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<ShopDto | null> {
    return this.shopsService.findOne(id);
  }

  @Query(() => [ShopDto], { name: 'shopsByZone' })
  async findByZone(@Args('zoneId', { type: () => Int }) zoneId: number): Promise<ShopDto[]> {
    return this.shopsService.findByZone(zoneId);
  }

  @Query(() => ShopDto, { name: 'shopByKeeper' })
  async findByKeeper(@Args('keeperId', { type: () => Int }) keeperId: number): Promise<ShopDto | null> {
    return this.shopsService.findByKeeper(keeperId);
  }

  @Query(() => Int, { name: 'shopsCount' })
  async count(): Promise<number> {
    return this.shopsService.count();
  }

  @Mutation(() => ShopDto)
  @UseGuards(JwtAuthGuard)
  async createShop(@Args('data') data: CreateShopInput): Promise<ShopDto> {
    const { zoneId, ...shopData } = data;
    return this.shopsService.create({
      ...shopData,
      zone: {
        connect: { id: zoneId }
      }
    });
  }

  @Mutation(() => ShopDto)
  @UseGuards(JwtAuthGuard)
  async updateShop(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateShopInput,
  ): Promise<ShopDto> {
    return this.shopsService.update(id, data);
  }

  @Mutation(() => ShopDto)
  @UseGuards(JwtAuthGuard)
  async deleteShop(@Args('id', { type: () => Int }) id: number): Promise<ShopDto> {
    return this.shopsService.delete(id);
  }
}