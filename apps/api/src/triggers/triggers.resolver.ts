import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Users } from '@muditor/db';
import { ScriptType } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { hidesGodZones } from '../common/god-zone-visibility';
import {
  AttachTriggerInput,
  CreateTriggerInput,
  TriggerDto,
  UpdateTriggerInput,
} from './trigger.dto';
import { TriggersService } from './triggers.service';

@Resolver(() => TriggerDto)
export class TriggersResolver {
  constructor(private readonly triggersService: TriggersService) {}

  // Trigger reads are public; triggers in god zones are hidden from anonymous
  // callers and mortal accounts (IMMORTAL+ still see them).
  @Query(() => [TriggerDto], { name: 'triggers' })
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@CurrentUser() user?: Users | null) {
    const triggers = await this.triggersService.findAll(
      hidesGodZones(user ?? null)
    );
    return triggers;
  }

  @Query(() => [TriggerDto], { name: 'triggersByZone' })
  @UseGuards(OptionalJwtAuthGuard)
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @CurrentUser() user?: Users | null
  ) {
    const triggers = await this.triggersService.findByZone(
      zoneId,
      hidesGodZones(user ?? null)
    );
    return triggers;
  }

  @Query(() => [TriggerDto], { name: 'triggersNeedingReview' })
  @UseGuards(OptionalJwtAuthGuard)
  async findNeedingReview(@CurrentUser() user?: Users | null) {
    const triggers = await this.triggersService.findNeedingReview(
      hidesGodZones(user ?? null)
    );
    return triggers;
  }

  @Query(() => Int, { name: 'triggersNeedingReviewCount' })
  @UseGuards(OptionalJwtAuthGuard)
  async countNeedingReview(@CurrentUser() user?: Users | null) {
    return this.triggersService.countNeedingReview(hidesGodZones(user ?? null));
  }

  @Query(() => TriggerDto, { name: 'trigger' })
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user?: Users | null
  ) {
    const trigger = await this.triggersService.findOne(
      zoneId,
      id,
      hidesGodZones(user ?? null)
    );
    return trigger;
  }

  @Query(() => [TriggerDto], { name: 'triggersByAttachment' })
  @UseGuards(OptionalJwtAuthGuard)
  async findByAttachment(
    @Args('attachType', { type: () => ScriptType }) attachType: ScriptType,
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('entityId', { type: () => Int }) entityId: number,
    @CurrentUser() user?: Users | null
  ) {
    const triggers = await this.triggersService.findByAttachment(
      attachType,
      zoneId,
      entityId,
      hidesGodZones(user ?? null)
    );
    return triggers;
  }

  @Mutation(() => TriggerDto)
  @RequireZoneWrite()
  async createTrigger(
    @Args('input') input: CreateTriggerInput,
    @CurrentUser() user: Users
  ) {
    const trigger = await this.triggersService.create(input, user.id);
    return trigger;
  }

  @Mutation(() => TriggerDto)
  @RequireZoneWrite()
  async updateTrigger(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateTriggerInput,
    @CurrentUser() user: Users
  ) {
    const trigger = await this.triggersService.update(
      zoneId,
      id,
      input,
      user.id
    );
    return trigger;
  }

  @Mutation(() => TriggerDto)
  @RequireZoneWrite()
  async deleteTrigger(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ) {
    const trigger = await this.triggersService.delete(zoneId, id);
    return trigger;
  }

  @Mutation(() => TriggerDto)
  // The trigger's own zone must be writable too, not only the target entity's.
  @RequireZoneWrite({ keys: ['triggerZoneId', 'mobZoneId', 'objectZoneId'] })
  async attachTrigger(
    @Args('input') input: AttachTriggerInput,
    @CurrentUser() user: Users
  ) {
    const trigger = await this.triggersService.attachToEntity(input, user.id);
    return trigger;
  }

  @Mutation(() => TriggerDto, {
    description:
      'Detach a trigger from ONE mob (mobZoneId+mobId) or ONE object (objectZoneId+objectId)',
  })
  @RequireZoneWrite({ keys: ['zoneId', 'mobZoneId', 'objectZoneId'] })
  async detachTrigger(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('mobZoneId', { type: () => Int, nullable: true })
    mobZoneId: number | undefined,
    @Args('mobId', { type: () => Int, nullable: true })
    mobId: number | undefined,
    @Args('objectZoneId', { type: () => Int, nullable: true })
    objectZoneId: number | undefined,
    @Args('objectId', { type: () => Int, nullable: true })
    objectId: number | undefined,
    @CurrentUser() user: Users
  ) {
    const trigger = await this.triggersService.detachFromEntity(
      zoneId,
      id,
      { mobZoneId, mobId, objectZoneId, objectId },
      user.id
    );
    return trigger;
  }

  @Mutation(() => TriggerDto)
  @RequireZoneWrite()
  async markTriggerReviewed(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: Users
  ) {
    const trigger = await this.triggersService.clearNeedsReview(
      zoneId,
      id,
      user.id
    );
    return trigger;
  }
}
