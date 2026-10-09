import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { SpellSyllableDto } from './spell-syllable.dto';
import {
  CreateSpellSyllableInput,
  UpdateSpellSyllableInput,
} from './spell-syllable.input';
import { SpellSyllablesService } from './spell-syllables.service';

@Resolver(() => SpellSyllableDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class SpellSyllablesResolver {
  constructor(private readonly service: SpellSyllablesService) {}

  // Queries - IMMORTAL+ can view

  @Query(() => [SpellSyllableDto], {
    name: 'spellSyllables',
    description: 'Get all spell syllables, in match order',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findAll() {
    return this.service.findAll();
  }

  @Query(() => SpellSyllableDto, {
    name: 'spellSyllable',
    description: 'Get a single spell syllable by ID',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findOne(@Args('id', { type: () => ID }) id: string | number) {
    return this.service.findOne(Number(id));
  }

  // Mutations - BUILDER+ (world-content catalog)

  @Mutation(() => SpellSyllableDto, { description: 'Create a spell syllable' })
  @MinimumRole(UserRole.BUILDER)
  async createSpellSyllable(@Args('data') data: CreateSpellSyllableInput) {
    return this.service.create(data);
  }

  @Mutation(() => SpellSyllableDto, { description: 'Update a spell syllable' })
  @MinimumRole(UserRole.BUILDER)
  async updateSpellSyllable(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateSpellSyllableInput
  ) {
    return this.service.update(Number(id), data);
  }

  @Mutation(() => Boolean, { description: 'Delete a spell syllable' })
  @MinimumRole(UserRole.BUILDER)
  async deleteSpellSyllable(
    @Args('id', { type: () => ID }) id: string | number
  ) {
    await this.service.remove(Number(id));
    return true;
  }
}
