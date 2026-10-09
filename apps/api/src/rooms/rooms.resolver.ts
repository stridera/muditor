import { UseGuards } from '@nestjs/common';
import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { hidesGodZones } from '../common/god-zone-visibility';
import { zoneLookups } from '../common/decorators/zone-lookups';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Direction, ExitFlag, ExitState, type Users } from '@muditor/db';
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
import { RoomEnvironmentalEffectInput } from './room-effects.dto';
import { RoomsService } from './rooms.service';

// Narrow mapper input to the actual shape returned by RoomsService (RoomServiceResult) plus relation arrays.
// Use flexible mapper source type (optional relation arrays) matching `mapRoom` requirements.
import type { RoomMapperSource } from '../common/mappers/types';
import { MAX_BULK_PAGE_SIZE, clampSkip, clampTake } from '../common/pagination';
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

  // Room reads are public (the world map is). Rooms in god zones are hidden
  // from anonymous callers and mortal accounts; IMMORTAL+ still see them.
  @Query(() => [RoomDto], { name: 'rooms' })
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('zoneId', { type: () => Int, nullable: true }) zoneId?: number,
    @Args('lightweight', {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    lightweight?: boolean,
    @CurrentUser() user?: Users | null
  ): Promise<RoomDto[]> {
    const params: {
      skip?: number;
      take?: number;
      zoneId?: number;
      lightweight?: boolean;
      hideGodZones: boolean;
    } = { hideGodZones: hidesGodZones(user ?? null) };
    if (skip !== undefined) params.skip = clampSkip(skip);
    params.take = clampTake(take, MAX_BULK_PAGE_SIZE);
    if (zoneId !== undefined) params.zoneId = zoneId;
    if (lightweight !== undefined) params.lightweight = lightweight;
    const rooms = await this.roomsService.findAll(params);
    return rooms.map(r => mapRoom(r as unknown as RoomsMapperInput));
  }

  @Query(() => RoomDto, { name: 'room' })
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user?: Users | null
  ): Promise<RoomDto | null> {
    const room = await this.roomsService.findOne(
      zoneId,
      id,
      hidesGodZones(user ?? null)
    );
    return room ? mapRoom(room as unknown as RoomsMapperInput) : null;
  }

  @Query(() => [RoomDto], { name: 'roomsByZone' })
  @UseGuards(OptionalJwtAuthGuard)
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('lightweight', {
      type: () => Boolean,
      nullable: true,
      defaultValue: false,
    })
    lightweight?: boolean,
    @CurrentUser() user?: Users | null
  ): Promise<RoomDto[]> {
    const rooms = await this.roomsService.findByZone(
      zoneId,
      lightweight,
      hidesGodZones(user ?? null)
    );
    return rooms.map(r => mapRoom(r as unknown as RoomsMapperInput));
  }

  @Query(() => Int, { name: 'roomsCount' })
  @UseGuards(OptionalJwtAuthGuard)
  async count(
    @Args('zoneId', { type: () => Int, nullable: true }) zoneId?: number,
    @CurrentUser() user?: Users | null
  ): Promise<number> {
    return this.roomsService.count(zoneId, hidesGodZones(user ?? null));
  }

  @Mutation(() => RoomDto)
  @RequireZoneWrite()
  async createRoom(@Args('data') data: CreateRoomInput): Promise<RoomDto> {
    const created = await this.roomsService.create(data);
    return mapRoom(created as unknown as RoomsMapperInput);
  }

  @Mutation(() => RoomDto)
  @RequireZoneWrite()
  async updateRoom(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateRoomInput
  ): Promise<RoomDto> {
    const updated = await this.roomsService.update(zoneId, id, data);
    return mapRoom(updated as unknown as RoomsMapperInput);
  }

  @Mutation(() => RoomDto)
  @RequireZoneWrite()
  async deleteRoom(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<RoomDto> {
    const deleted = await this.roomsService.delete(zoneId, id);
    return mapRoom(deleted as unknown as RoomsMapperInput);
  }

  @Mutation(() => RoomExitDto)
  @RequireZoneWrite({ keys: ['roomZoneId'] })
  async createRoomExit(
    @Args('data') data: CreateRoomExitInput
  ): Promise<RoomExitDto> {
    const exit = await this.roomsService.createExit(data);
    const exitDto: RoomExitDto = {
      id: String(exit.id),
      direction: exit.direction as Direction,
      keywords: exit.keywords ?? [],
      flags: (exit.flags ?? []) as ExitFlag[],
      defaultState: exit.defaultState as ExitState,
      roomZoneId: exit.roomZoneId,
      roomId: exit.roomId,
      ...(exit.description != null ? { description: exit.description } : {}),
      ...(exit.keyZoneId != null ? { keyZoneId: exit.keyZoneId } : {}),
      ...(exit.keyId != null ? { keyId: exit.keyId } : {}),
      ...(exit.toZoneId != null ? { toZoneId: exit.toZoneId } : {}),
      ...(exit.toRoomId != null ? { toRoomId: exit.toRoomId } : {}),
      ...(exit.hitPoints != null ? { hitPoints: exit.hitPoints } : {}),
    };
    return exitDto;
  }

  @Mutation(() => RoomExitDto)
  @RequireZoneWrite({ lookup: zoneLookups.roomExit('exitId') })
  async deleteRoomExit(@Args('exitId') exitId: number): Promise<RoomExitDto> {
    const exit = await this.roomsService.deleteExit(exitId);
    const exitDto: RoomExitDto = {
      id: String(exit.id),
      direction: exit.direction as Direction,
      keywords: exit.keywords ?? [],
      flags: (exit.flags ?? []) as ExitFlag[],
      defaultState: exit.defaultState as ExitState,
      roomZoneId: exit.roomZoneId,
      roomId: exit.roomId,
      ...(exit.description != null ? { description: exit.description } : {}),
      ...(exit.keyZoneId != null ? { keyZoneId: exit.keyZoneId } : {}),
      ...(exit.keyId != null ? { keyId: exit.keyId } : {}),
      ...(exit.toZoneId != null ? { toZoneId: exit.toZoneId } : {}),
      ...(exit.toRoomId != null ? { toRoomId: exit.toRoomId } : {}),
      ...(exit.hitPoints != null ? { hitPoints: exit.hitPoints } : {}),
    };
    return exitDto;
  }

  @Mutation(() => RoomDto)
  @RequireZoneWrite()
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
  @RequireZoneWrite()
  async batchUpdateRoomPositions(
    @Args('input') input: BatchUpdateRoomPositionsInput
  ): Promise<BatchUpdateResult> {
    return this.roomsService.batchUpdatePositions(input.updates);
  }

  @Mutation(() => RoomDto)
  @RequireZoneWrite()
  async updateRoomEnvironmentalEffects(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('effects', { type: () => [RoomEnvironmentalEffectInput] })
    effects: RoomEnvironmentalEffectInput[]
  ): Promise<RoomDto> {
    const room = await this.roomsService.updateRoomEnvironmentalEffects(
      zoneId,
      id,
      effects
    );
    return mapRoom(room as unknown as RoomsMapperInput);
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
