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
// Import from barrel to ensure mapper files are included in program graph for tooling
import { mapRoom } from '../common/mappers';
import { ObjectSummaryDto } from '../mobs/mob-reset.dto';
import { MobDto } from '../mobs/mob.dto';
import { ObjectDto } from '../objects/object.dto';
import { ShopDto, ShopItemDto } from '../shops/shop.dto';
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

// Narrow mapper input to the actual shape returned by RoomsService (RoomServiceResult) plus relation arrays.
// Use flexible mapper source type (optional relation arrays) matching `mapRoom` requirements.
import { RoomMapperSource } from '../common/mappers/types';
type RoomsMapperInput = RoomMapperSource;

// Internal lightweight types used for field resolution to avoid `any`
interface MobSummary {
  id: number;
  zoneId: number;
  name: string;
  keywords?: string[];
}
interface ObjectSummary {
  id: number;
  zoneId: number;
  name: string;
  keywords?: string[];
}
interface MobReset {
  mobs?: MobSummary;
}
interface ObjectReset {
  objects?: ObjectSummary;
}
interface RawShopItem {
  id: number;
  amount: number;
  shopZoneId: number;
  shopId: number;
  objectZoneId: number;
  objectId: number;
  objects?: {
    id: number;
    zoneId: number;
    name: string;
    type: string;
    cost?: number;
  };
}
interface RawShopAccept {
  id: number;
  type: string;
  keywords: string[];
  shopZoneId: number;
  shopId: number;
}
interface RawShopHour {
  id: number;
  shopZoneId: number;
  shopId: number;
  open: number;
  close: number;
}
interface RoomWithResets {
  mobResets?: MobReset[];
  mob_resets?: MobReset[];
  objectResets?: ObjectReset[];
  object_resets?: ObjectReset[];
}

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
    const params: {
      skip?: number;
      take?: number;
      zoneId?: number;
      lightweight?: boolean;
    } = {};
    if (skip !== undefined) params.skip = skip;
    if (take !== undefined) params.take = take;
    if (zoneId !== undefined) params.zoneId = zoneId;
    if (lightweight !== undefined) params.lightweight = lightweight;
    const rooms = await this.roomsService.findAll(params);
    return rooms.map(r => mapRoom(r as unknown as RoomsMapperInput));
  }

  @Query(() => RoomDto, { name: 'room' })
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<RoomDto | null> {
    const room = await this.roomsService.findOne(zoneId, id);
    return room ? mapRoom(room as unknown as RoomsMapperInput) : null;
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
    const rooms = await this.roomsService.findByZone(zoneId, lightweight);
    return rooms.map(r => mapRoom(r as unknown as RoomsMapperInput));
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
    const created = await this.roomsService.create(data);
    return mapRoom(created as unknown as RoomsMapperInput);
  }

  @Mutation(() => RoomDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async updateRoom(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateRoomInput
  ): Promise<RoomDto> {
    const updated = await this.roomsService.update(zoneId, id, data);
    return mapRoom(updated as unknown as RoomsMapperInput);
  }

  @Mutation(() => RoomDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async deleteRoom(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<RoomDto> {
    const deleted = await this.roomsService.delete(zoneId, id);
    return mapRoom(deleted as unknown as RoomsMapperInput);
  }

  @Mutation(() => RoomExitDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async createRoomExit(
    @Args('data') data: CreateRoomExitInput
  ): Promise<RoomExitDto> {
    const exit = await this.roomsService.createExit(data);
    const mapped: RoomExitDto = {
      ...exit,
      id: String(exit.id),
      description: exit.description ?? undefined,
      key: exit.key ?? undefined,
      toZoneId: exit.toZoneId ?? undefined,
      toRoomId: exit.toRoomId ?? undefined,
    } as RoomExitDto;
    return mapped;
  }

  @Mutation(() => RoomExitDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async deleteRoomExit(@Args('exitId') exitId: number): Promise<RoomExitDto> {
    const exit = await this.roomsService.deleteExit(exitId);
    const mapped: RoomExitDto = {
      ...exit,
      id: String(exit.id),
      description: exit.description ?? undefined,
      key: exit.key ?? undefined,
      toZoneId: exit.toZoneId ?? undefined,
      toRoomId: exit.toRoomId ?? undefined,
    } as RoomExitDto;
    return mapped;
  }

  @Mutation(() => RoomDto)
  @UseGuards(GraphQLJwtAuthGuard)
  async updateRoomPosition(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('position') position: UpdateRoomPositionInput
  ): Promise<RoomDto> {
    const updated = await this.roomsService.updatePosition(
      zoneId,
      id,
      position
    );
    return mapRoom(updated as unknown as RoomsMapperInput);
  }

  @Mutation(() => BatchUpdateResult)
  @UseGuards(GraphQLJwtAuthGuard)
  async batchUpdateRoomPositions(
    @Args('input') input: BatchUpdateRoomPositionsInput
  ): Promise<BatchUpdateResult> {
    return this.roomsService.batchUpdatePositions(input.updates);
  }

  @ResolveField(() => [MobDto])
  mobs(@Parent() room: RoomWithResets): MobDto[] {
    // Support both snake_case (from raw SQL) and camelCase (from Prisma)
    const resets = room.mobResets || room.mob_resets;
    if (!resets || resets.length === 0) {
      return [];
    }

    // Deduplicate mobs by ID since multiple resets can reference the same mob
    const uniqueMobs = new Map<number, MobSummary>();
    resets.forEach((reset: MobReset) => {
      if (reset.mobs) {
        uniqueMobs.set(reset.mobs.id, reset.mobs);
      }
    });

    // Cast since we only need basic mob fields for GraphQL; additional fields resolved elsewhere
    return Array.from(uniqueMobs.values()) as unknown as MobDto[];
  }

  @ResolveField(() => [ObjectDto])
  objects(@Parent() room: RoomWithResets): ObjectDto[] {
    // Support both snake_case (from raw SQL) and camelCase (from Prisma)
    const resets = room.objectResets || room.object_resets;
    if (!resets || resets.length === 0) {
      return [];
    }

    // Deduplicate objects by ID since multiple resets can reference the same object
    const uniqueObjects = new Map<number, ObjectSummary>();
    resets.forEach((reset: ObjectReset) => {
      if (reset.objects) {
        uniqueObjects.set(reset.objects.id, reset.objects);
      }
    });

    return Array.from(uniqueObjects.values()) as unknown as ObjectDto[];
  }

  @ResolveField(() => [ShopDto])
  async shops(@Parent() room: RoomWithResets): Promise<ShopDto[]> {
    // Support both snake_case (from raw SQL) and camelCase (from Prisma)
    const resets = room.mobResets || room.mob_resets;
    if (!resets || resets.length === 0) {
      return [];
    }

    // Get unique mobs from room (need both zoneId and id)
    const uniqueMobs = new Map<string, { zoneId: number; id: number }>();
    resets.forEach((reset: MobReset) => {
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
        const mapped: ShopDto = {
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
          items:
            shop.shopItems?.map((item: RawShopItem) => {
              const base: Partial<ShopItemDto> = {
                id: String(item.id),
                amount: item.amount,
                objectId: item.objectId,
                objectZoneId: item.objectZoneId,
              };
              if (item.objects) {
                const obj: Partial<ObjectSummaryDto> = {
                  id: item.objects.id,
                  zoneId: item.objects.zoneId,
                  name: item.objects.name,
                  type: String(item.objects.type),
                };
                if (
                  item.objects.cost !== null &&
                  item.objects.cost !== undefined
                ) {
                  obj.cost = item.objects.cost;
                }
                base.object = obj as ObjectSummaryDto;
              }
              return base as ShopItemDto;
            }) || [],
          accepts:
            shop.shopAccepts?.map((accept: RawShopAccept) => ({
              id: String(accept.id),
              type: accept.type,
              keywords: accept.keywords?.join(' ') ?? '',
            })) || [],
          hours:
            shop.shopHours?.map((hour: RawShopHour) => ({
              id: String(hour.id),
              open: hour.open,
              close: hour.close,
            })) || [],
        };
        if (shop.mobs) {
          mapped.keeper = {
            id: shop.mobs.id,
            zoneId: shop.mobs.zoneId,
            name: shop.mobs.name,
            keywords: shop.mobs.keywords || [],
          };
        }
        if (shop.keeperId !== null && shop.keeperId !== undefined) {
          mapped.keeperId = shop.keeperId;
        }
        shops.push(mapped);
      }
    }

    return shops;
  }
}
