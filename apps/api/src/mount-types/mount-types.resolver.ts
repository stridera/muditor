import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { MountTypeDto } from './mount-type.dto';
import { UpdateMountTypeInput } from './mount-type.input';
import { MountTypesService } from './mount-types.service';

@Resolver(() => MountTypeDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class MountTypesResolver {
  constructor(private readonly service: MountTypesService) {}

  // Queries - IMMORTAL+ can view
  @Query(() => [MountTypeDto], {
    name: 'mountTypes',
    description:
      'Summon-mount tiers (level and alignment gates, mount mob, bonuses)',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findAll() {
    return this.service.findAll();
  }

  // Mutations - CODER+ (alters ability mechanics, like editing an ability's formulas)
  @Mutation(() => MountTypeDto, {
    description: 'Edit the gates, mount mob or bonuses of a summon-mount tier',
  })
  @MinimumRole(UserRole.CODER)
  async updateMountType(
    @Args('data', { type: () => UpdateMountTypeInput })
    data: UpdateMountTypeInput
  ) {
    return this.service.update(data);
  }
}
