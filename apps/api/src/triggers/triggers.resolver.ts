import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Users } from '@muditor/db';
import { ScriptType } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
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

  @Query(() => [TriggerDto], { name: 'triggers' })
  async findAll() {
    const triggers = await this.triggersService.findAll();
    return triggers;
  }

  @Query(() => [TriggerDto], { name: 'triggersByZone' })
  async findByZone(@Args('zoneId', { type: () => Int }) zoneId: number) {
    const triggers = await this.triggersService.findByZone(zoneId);
    return triggers;
  }

  @Query(() => [TriggerDto], { name: 'triggersNeedingReview' })
  async findNeedingReview() {
    const triggers = await this.triggersService.findNeedingReview();
    return triggers;
  }

  @Query(() => Int, { name: 'triggersNeedingReviewCount' })
  async countNeedingReview() {
    return this.triggersService.countNeedingReview();
  }

  @Query(() => TriggerDto, { name: 'trigger' })
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ) {
    const trigger = await this.triggersService.findOne(zoneId, id);
    return trigger;
  }

  @Query(() => [TriggerDto], { name: 'triggersByAttachment' })
  async findByAttachment(
    @Args('attachType', { type: () => ScriptType }) attachType: ScriptType,
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('entityId', { type: () => Int }) entityId: number
  ) {
    const triggers = await this.triggersService.findByAttachment(
      attachType,
      zoneId,
      entityId
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
