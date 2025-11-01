import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ScriptType, Users } from '@prisma/client';
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

  @Query(() => TriggerDto, { name: 'trigger' })
  async findOne(@Args('id') id: number) {
    const trigger = await this.triggersService.findOne(id);
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Query(() => [TriggerDto], { name: 'triggersByAttachment' })
  async findByAttachment(
    @Args('attachType', { type: () => ScriptType }) attachType: ScriptType,
    @Args('entityId', { type: () => Int }) entityId: number
  ) {
    const triggers = await this.triggersService.findByAttachment(
      attachType,
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
    @Args('id') id: number,
    @Args('input') input: UpdateTriggerInput,
    @CurrentUser() user: Users
  ) {
    const trigger = await this.triggersService.update(id, input, user.id);
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Mutation(() => TriggerDto)
  async deleteTrigger(@Args('id') id: number) {
    const trigger = await this.triggersService.delete(id);
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
    @Args('triggerId') triggerId: number,
    @CurrentUser() user: Users
  ) {
    const trigger = await this.triggersService.detachFromEntity(
      triggerId,
      user.id
    );
    return {
      ...trigger,
      variables: '{}',
    };
  }
}
