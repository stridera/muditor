import { UseGuards } from '@nestjs/common';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MobDto } from '../mobs/mob.dto';
import { ObjectDto } from '../objects/object.dto';
import { ShopDto } from '../shops/shop.dto';
import { ShopsService } from '../shops/shops.service';
import {
  BatchUpdateResult,
  BatchUpdateRoomPositionsInput,
  CreateRoomExitInput,
  CreateRoomInput,
  RoomDto,
  RoomExitDto,
  UpdateRoomInput,
  UpdateRoomPositionInput,
} from './room.dto';
import { RoomsService } from './rooms.service';

@Resolver(() => RoomDto)
export class RoomsResolver {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly shopsService: ShopsService
  ) {}

  @Query(() => [RoomDto], { name: 'rooms' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('zoneId', { type: () => Int, nullable: true }) zoneId?: number,
    @Args('lightweight', {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    lightweight?: boolean
  ): Promise<RoomDto[]> {
    return this.roomsService.findAll({
      skip,
      take,
      zoneId,
      lightweight,
    }) as unknown as RoomDto[];
  }

  @Query(() => RoomDto, { name: 'room' })
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<RoomDto | null> {
    return this.roomsService.findOne(zoneId, id) as unknown as RoomDto | null;
  }

  @Query(() => [RoomDto], { name: 'roomsByZone' })
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('lightweight', {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    lightweight?: boolean
  ): Promise<RoomDto[]> {
    return this.roomsService.findByZone(
      zoneId,
      lightweight
    ) as unknown as RoomDto[];
  }

  @Query(() => Int, { name: 'roomsCount' })
  async count(
    @Args('zoneId', { type: () => Int, nullable: true }) zoneId?: number
  ): Promise<number> {
    return this.roomsService.count(zoneId);
  }

  @Mutation(() => RoomDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async createRoom(@Args('data') data: CreateRoomInput): Promise<RoomDto> {
    return this.roomsService.create(data) as unknown as RoomDto;
  }

  @Mutation(() => RoomDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async updateRoom(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateRoomInput
  ): Promise<RoomDto> {
    return this.roomsService.update(zoneId, id, data) as unknown as RoomDto;
  }

  @Mutation(() => RoomDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async deleteRoom(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<RoomDto> {
    return this.roomsService.delete(zoneId, id) as unknown as RoomDto;
  }

  @Mutation(() => RoomExitDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async createRoomExit(
    @Args('data') data: CreateRoomExitInput
  ): Promise<RoomExitDto> {
    return this.roomsService.createExit(data);
  }

  @Mutation(() => RoomExitDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async deleteRoomExit(@Args('exitId') exitId: number): Promise<RoomExitDto> {
    return this.roomsService.deleteExit(exitId);
  }

  @Mutation(() => RoomDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async updateRoomPosition(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('position') position: UpdateRoomPositionInput
  ): Promise<RoomDto> {
    return this.roomsService.updatePosition(
      zoneId,
      id,
      position
    ) as unknown as RoomDto;
  }

  @Mutation(() => BatchUpdateResult)
  @UseGuards(GraphQLJwtAuthGuard)
  async batchUpdateRoomPositions(
    @Args('input') input: BatchUpdateRoomPositionsInput
  ): Promise<BatchUpdateResult> {
    return this.roomsService.batchUpdatePositions(input.updates);
  }

  @ResolveField(() => [MobDto])
  mobs(@Parent() room: any): MobDto[] {
    // Support both snake_case (from raw SQL) and camelCase (from Prisma)
    const resets = room.mobResets || room.mob_resets;
    if (!resets || resets.length === 0) {
      return [];
    }

    // Deduplicate mobs by ID since multiple resets can reference the same mob
    const uniqueMobs = new Map<number, any>();
    resets.forEach((reset: any) => {
      if (reset.mobs) {
        uniqueMobs.set(reset.mobs.id, reset.mobs);
      }
    });

    return Array.from(uniqueMobs.values());
  }

  @ResolveField(() => [ObjectDto])
  objects(@Parent() room: any): ObjectDto[] {
    // Support both snake_case (from raw SQL) and camelCase (from Prisma)
    const resets = room.objectResets || room.object_resets;
    if (!resets || resets.length === 0) {
      return [];
    }

    // Deduplicate objects by ID since multiple resets can reference the same object
    const uniqueObjects = new Map<number, any>();
    resets.forEach((reset: any) => {
      if (reset.objects) {
        uniqueObjects.set(reset.objects.id, reset.objects);
      }
    });

    return Array.from(uniqueObjects.values());
  }

  @ResolveField(() => [ShopDto])
  async shops(@Parent() room: any): Promise<ShopDto[]> {
    // Support both snake_case (from raw SQL) and camelCase (from Prisma)
    const resets = room.mobResets || room.mob_resets;
    if (!resets || resets.length === 0) {
      return [];
    }

    // Get unique mobs from room (need both zoneId and id)
    const uniqueMobs = new Map<string, { zoneId: number; id: number }>();
    resets.forEach((reset: any) => {
      if (reset.mobs) {
        const key = `${reset.mobs.zoneId}-${reset.mobs.id}`;
        uniqueMobs.set(key, { zoneId: reset.mobs.zoneId, id: reset.mobs.id });
      }
    });

    // Find shops for each mob in the room
    const shops: ShopDto[] = [];
    for (const mob of uniqueMobs.values()) {
      const shop = await this.shopsService.findByKeeper(mob.zoneId, mob.id);
      if (shop) {
        shops.push({
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
          keeperId: shop.keeperId,
          keeper: shop.mobs
            ? {
                id: shop.mobs.id,
                zoneId: shop.mobs.zoneId,
                name: shop.mobs.name,
                keywords: shop.mobs.keywords || [],
              }
            : undefined,
          zoneId: shop.zoneId,
          createdAt: shop.createdAt,
          updatedAt: shop.updatedAt,
          items:
            shop.shopItems?.map((item: any) => ({
              id: item.id,
              amount: item.stockLimit,
              objectId: item.objectId,
              objectZoneId: item.objectZoneId,
              object: item.object,
            })) || [],
          accepts:
            shop.shopAccepts?.map((accept: any) => ({
              id: accept.id,
              type: accept.itemType,
              keywords: '',
            })) || [],
          hours:
            shop.shopHours?.map((hour: any) => ({
              id: hour.id,
              open: hour.openHour,
              close: hour.closeHour,
            })) || [],
        });
      }
    }

    return shops;
  }
}
