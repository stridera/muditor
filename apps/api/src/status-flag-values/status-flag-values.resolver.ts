import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { StatusFlagValueDto } from './status-flag-value.dto';
import {
  CreateStatusFlagValueInput,
  UpdateStatusFlagValueInput,
} from './status-flag-value.input';
import { StatusFlagValuesService } from './status-flag-values.service';

@Resolver(() => StatusFlagValueDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class StatusFlagValuesResolver {
  constructor(private readonly service: StatusFlagValuesService) {}

  // Queries - IMMORTAL+ can view

  @Query(() => [StatusFlagValueDto], {
    name: 'statusFlagValues',
    description: 'Get all status flag AI values, ordered by flag',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findAll() {
    return this.service.findAll();
  }

  @Query(() => StatusFlagValueDto, {
    name: 'statusFlagValue',
    description: 'Get a single status flag AI value',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findOne(@Args('flag') flag: string) {
    return this.service.findOne(flag);
  }

  // Mutations - BUILDER+ (world-content catalog)

  @Mutation(() => StatusFlagValueDto, {
    description: 'Create a status flag AI value',
  })
  @MinimumRole(UserRole.BUILDER)
  async createStatusFlagValue(@Args('data') data: CreateStatusFlagValueInput) {
    return this.service.create(data);
  }

  @Mutation(() => StatusFlagValueDto, {
    description: 'Update a status flag AI value',
  })
  @MinimumRole(UserRole.BUILDER)
  async updateStatusFlagValue(
    @Args('flag') flag: string,
    @Args('data') data: UpdateStatusFlagValueInput
  ) {
    return this.service.update(flag, data);
  }

  @Mutation(() => Boolean, { description: 'Delete a status flag AI value' })
  @MinimumRole(UserRole.BUILDER)
  async deleteStatusFlagValue(@Args('flag') flag: string) {
    await this.service.remove(flag);
    return true;
  }
}
