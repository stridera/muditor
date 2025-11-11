import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Users } from '@prisma/client';
import { GrantResourceType, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
// UserRole re-imported above with runtime import to preserve decorator metadata
import { UserGrantDto, ZoneGrantDto } from './grants.dto';
import {
  CreateGrantInput,
  GrantZoneAccessInput,
  UpdateGrantInput,
} from './grants.input';
import { GrantsService } from './grants.service';

@Resolver(() => UserGrantDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class GrantsResolver {
  constructor(private readonly grantsService: GrantsService) {}

  // Query all grants (HEAD_BUILDER+ can view all, BUILDER can view their own)
  @Query(() => [UserGrantDto], { name: 'grants' })
  @MinimumRole(UserRole.BUILDER)
  async findAllGrants(
    @Args('userId', { type: () => String, nullable: true }) userId?: string,
    @Args('resourceType', { type: () => GrantResourceType, nullable: true })
    resourceType?: GrantResourceType,
    @CurrentUser() user?: Users
  ) {
    // BUILDER can only see their own grants
    if (user && user.role === UserRole.BUILDER) {
      return this.grantsService.findAll(user.id, resourceType);
    }

    // HEAD_BUILDER+ can see all grants or filter by userId
    return this.grantsService.findAll(userId, resourceType);
  }

  // Query single grant by ID
  @Query(() => UserGrantDto, { name: 'grant' })
  @MinimumRole(UserRole.HEAD_BUILDER)
  async findOneGrant(@Args('id', { type: () => ID }) id: number) {
    return this.grantsService.findOne(id);
  }

  // Query user's zone grants
  @Query(() => [ZoneGrantDto], { name: 'myZoneGrants' })
  @MinimumRole(UserRole.BUILDER)
  async getMyZoneGrants(@CurrentUser() user: Users) {
    return this.grantsService.getUserZoneGrants(user.id);
  }

  // Query another user's zone grants (HEAD_BUILDER+)
  @Query(() => [ZoneGrantDto], { name: 'userZoneGrants' })
  @MinimumRole(UserRole.HEAD_BUILDER)
  async getUserZoneGrants(@Args('userId') userId: string) {
    return this.grantsService.getUserZoneGrants(userId);
  }

  // Create a new grant (HEAD_BUILDER+)
  @Mutation(() => UserGrantDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async createGrant(
    @Args('data') data: CreateGrantInput,
    @CurrentUser() user: Users
  ) {
    return this.grantsService.create(data, user.id);
  }

  // Update a grant (HEAD_BUILDER+)
  @Mutation(() => UserGrantDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateGrant(
    @Args('id', { type: () => ID }) id: number,
    @Args('data') data: UpdateGrantInput
  ) {
    return this.grantsService.update(id, data);
  }

  // Delete a grant (HEAD_BUILDER+)
  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async deleteGrant(@Args('id', { type: () => ID }) id: number) {
    await this.grantsService.remove(id);
    return true;
  }

  // Convenience mutation for granting zone access (HEAD_BUILDER+)
  @Mutation(() => UserGrantDto, {
    description: 'Grant zone access to a user',
  })
  @MinimumRole(UserRole.HEAD_BUILDER)
  async grantZoneAccess(
    @Args('data') data: GrantZoneAccessInput,
    @CurrentUser() user: Users
  ) {
    return this.grantsService.grantZoneAccess(data, user.id);
  }

  // Convenience mutation for revoking zone access (HEAD_BUILDER+)
  @Mutation(() => Boolean, {
    description: 'Revoke zone access from a user',
  })
  @MinimumRole(UserRole.HEAD_BUILDER)
  async revokeZoneAccess(
    @Args('userId') userId: string,
    @Args('zoneId') zoneId: number
  ) {
    await this.grantsService.revokeZoneAccess(userId, zoneId);
    return true;
  }
}
