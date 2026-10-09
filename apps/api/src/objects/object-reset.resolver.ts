import { UseGuards } from '@nestjs/common';
import type { Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { hidesGodZones } from '../common/god-zone-visibility';
import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { zoneLookups } from '../common/decorators/zone-lookups';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  CreateObjectResetInput,
  ObjectResetDto,
  UpdateObjectResetInput,
} from '../object-resets/object-reset.dto';
import { ObjectResetService } from './object-reset.service';

@Resolver(() => ObjectResetDto)
export class ObjectResetResolver {
  constructor(private readonly objectResetService: ObjectResetService) {}

  // Reset reads are public; resets touching god zones are hidden from
  // anonymous callers and mortal accounts (IMMORTAL+ still see them).
  @Query(() => [ObjectResetDto], { name: 'objectResetsByRoom' })
  @UseGuards(OptionalJwtAuthGuard)
  async findByRoom(
    @Args('roomZoneId', { type: () => Int }) roomZoneId: number,
    @Args('roomId', { type: () => Int }) roomId: number,
    @CurrentUser() user?: Users | null
  ): Promise<ObjectResetDto[]> {
    return this.objectResetService.findByRoom(
      roomZoneId,
      roomId,
      hidesGodZones(user ?? null)
    );
  }

  @Query(() => [ObjectResetDto], { name: 'objectResetsByZone' })
  @UseGuards(OptionalJwtAuthGuard)
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @CurrentUser() user?: Users | null
  ): Promise<ObjectResetDto[]> {
    return this.objectResetService.findByZone(
      zoneId,
      hidesGodZones(user ?? null)
    );
  }

  @Query(() => ObjectResetDto, { name: 'objectReset', nullable: true })
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Args('id', { type: () => ID }) id: number,
    @CurrentUser() user?: Users | null
  ): Promise<ObjectResetDto | null> {
    return this.objectResetService.findOne(id, hidesGodZones(user ?? null));
  }

  @Mutation(() => ObjectResetDto)
  @RequireZoneWrite()
  async createObjectReset(
    @Args('data') data: CreateObjectResetInput
  ): Promise<ObjectResetDto> {
    return this.objectResetService.create(data);
  }

  @Mutation(() => ObjectResetDto)
  @RequireZoneWrite({ lookup: zoneLookups.objectReset('id') })
  async updateObjectReset(
    @Args('id', { type: () => ID }) id: number,
    @Args('data') data: UpdateObjectResetInput
  ): Promise<ObjectResetDto> {
    return this.objectResetService.update(id, data);
  }

  @Mutation(() => Boolean)
  @RequireZoneWrite({ lookup: zoneLookups.objectReset('id') })
  async deleteObjectReset(
    @Args('id', { type: () => ID }) id: number
  ): Promise<boolean> {
    return this.objectResetService.delete(id);
  }
}
