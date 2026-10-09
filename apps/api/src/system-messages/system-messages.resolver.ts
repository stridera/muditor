import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { SystemMessageDto } from './system-message.dto';
import {
  CreateSystemMessageInput,
  UpdateSystemMessageInput,
} from './system-message.input';
import { SystemMessagesService } from './system-messages.service';

@Resolver(() => SystemMessageDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class SystemMessagesResolver {
  constructor(private readonly service: SystemMessagesService) {}

  // Queries - IMMORTAL+ can view

  @Query(() => [SystemMessageDto], {
    name: 'systemMessages',
    description: 'Get all system messages, grouped by category',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findAll() {
    return this.service.findAll();
  }

  @Query(() => SystemMessageDto, {
    name: 'systemMessage',
    description: 'Get a single system message by ID',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findOne(@Args('id', { type: () => ID }) id: string | number) {
    return this.service.findOne(Number(id));
  }

  // Mutations - CODER+ (like the other game text/config editors)

  @Mutation(() => SystemMessageDto, { description: 'Create a system message' })
  @MinimumRole(UserRole.CODER)
  async createSystemMessage(@Args('data') data: CreateSystemMessageInput) {
    return this.service.create(data);
  }

  @Mutation(() => SystemMessageDto, { description: 'Update a system message' })
  @MinimumRole(UserRole.CODER)
  async updateSystemMessage(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateSystemMessageInput
  ) {
    return this.service.update(Number(id), data);
  }

  @Mutation(() => Boolean, { description: 'Delete a system message' })
  @MinimumRole(UserRole.CODER)
  async deleteSystemMessage(
    @Args('id', { type: () => ID }) id: string | number
  ) {
    await this.service.remove(Number(id));
    return true;
  }
}
