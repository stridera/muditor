import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { ReservedNameDto } from './reserved-name.dto';
import { CreateReservedNameInput } from './reserved-name.input';
import { ReservedNamesService } from './reserved-names.service';

/**
 * Words refused as character names. Read and write are both HEAD_BUILDER+:
 * the list is a moderation table, like zone grants and report triage. The
 * game loads it at boot (restart or the admin reload applies changes).
 */
@Resolver(() => ReservedNameDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class ReservedNamesResolver {
  constructor(private readonly service: ReservedNamesService) {}

  @Query(() => [ReservedNameDto], {
    name: 'reservedNames',
    description: 'Get all reserved character names, alphabetically',
  })
  @MinimumRole(UserRole.HEAD_BUILDER)
  async findAll() {
    return this.service.findAll();
  }

  @Mutation(() => ReservedNameDto, { description: 'Reserve a character name' })
  @MinimumRole(UserRole.HEAD_BUILDER)
  async createReservedName(@Args('data') data: CreateReservedNameInput) {
    return this.service.create(data);
  }

  @Mutation(() => Boolean, { description: 'Remove a reserved character name' })
  @MinimumRole(UserRole.HEAD_BUILDER)
  async deleteReservedName(
    @Args('id', { type: () => ID }) id: string | number
  ) {
    await this.service.remove(Number(id));
    return true;
  }
}
