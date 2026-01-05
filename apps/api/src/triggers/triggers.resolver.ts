import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Users } from '@prisma/client';
import { ScriptType } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AttachTriggerInput,
  CreateTriggerInput,
  TriggerDto,
  UpdateTriggerInput,
} from './trigger.dto';
import { TriggersService } from './triggers.service';

@Resolver(() => TriggerDto)
@UseGuards(JwtAuthGuard)
export class TriggersResolver {
  constructor(private readonly triggersService: TriggersService) {}

  @Query(() => [TriggerDto], { name: 'triggers' })
  async findAll() {
    const triggers = await this.triggersService.findAll();
    return triggers.map(trigger => ({
      ...trigger,
      variables: '{}',
    }));
  }

  @Query(() => [TriggerDto], { name: 'triggersByZone' })
  async findByZone(@Args('zoneId', { type: () => Int }) zoneId: number) {
    const triggers = await this.triggersService.findByZone(zoneId);
    return triggers.map(trigger => ({
      ...trigger,
      variables: '{}',
    }));
  }

  @Query(() => [TriggerDto], { name: 'triggersNeedingReview' })
  async findNeedingReview() {
    const triggers = await this.triggersService.findNeedingReview();
    return triggers.map(trigger => ({
      ...trigger,
      variables: '{}',
    }));
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
    return {
      ...trigger,
      variables: '{}',
    };
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
    return triggers.map(trigger => ({
      ...trigger,
      variables: '{}',
    }));
  }

  @Mutation(() => TriggerDto)
  async createTrigger(
    @Args('input') input: CreateTriggerInput,
    @CurrentUser() user: Users
  ) {
    const trigger = await this.triggersService.create(input, user.id);
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Mutation(() => TriggerDto)
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
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Mutation(() => TriggerDto)
  async deleteTrigger(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ) {
    const trigger = await this.triggersService.delete(zoneId, id);
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Mutation(() => TriggerDto)
  async attachTrigger(
    @Args('input') input: AttachTriggerInput,
    @CurrentUser() user: Users
  ) {
    const trigger = await this.triggersService.attachToEntity(input, user.id);
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Mutation(() => TriggerDto)
  async detachTrigger(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: Users
  ) {
    const trigger = await this.triggersService.detachFromEntity(
      zoneId,
      id,
      user.id
    );
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Mutation(() => TriggerDto)
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
    return {
      ...trigger,
      variables: '{}',
    };
  }
}
