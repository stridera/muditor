import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { TriggersService } from './triggers.service';
import {
  TriggerDto,
  CreateTriggerInput,
  UpdateTriggerInput,
  AttachTriggerInput,
} from './trigger.dto';
import { TriggerAttachType } from '@prisma/client';

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
  async findOne(@Args('id') id: string) {
    const trigger = await this.triggersService.findOne(id);
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Query(() => [TriggerDto], { name: 'triggersByAttachment' })
  async findByAttachment(
    @Args('attachType', { type: () => TriggerAttachType }) attachType: TriggerAttachType,
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
    @CurrentUser() user: User
  ) {
    const trigger = await this.triggersService.create(input, user.id);
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Mutation(() => TriggerDto)
  async updateTrigger(
    @Args('id') id: string,
    @Args('input') input: UpdateTriggerInput,
    @CurrentUser() user: User
  ) {
    const trigger = await this.triggersService.update(id, input, user.id);
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Mutation(() => TriggerDto)
  async deleteTrigger(@Args('id') id: string) {
    const trigger = await this.triggersService.delete(id);
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Mutation(() => TriggerDto)
  async attachTrigger(
    @Args('input') input: AttachTriggerInput,
    @CurrentUser() user: User
  ) {
    const trigger = await this.triggersService.attachToEntity(input, user.id);
    return {
      ...trigger,
      variables: '{}',
    };
  }

  @Mutation(() => TriggerDto)
  async detachTrigger(
    @Args('triggerId') triggerId: string,
    @CurrentUser() user: User
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
