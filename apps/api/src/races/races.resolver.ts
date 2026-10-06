import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Race, UserRole, type Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { RaceDto, RaceSkillDto } from './races.dto';
import {
  CreateRaceInput,
  UpdateRaceInput,
  AssignSkillToRaceInput,
  UpdateRaceSkillInput,
} from './races.input';
import { RacesService } from './races.service';

@Resolver(() => RaceDto)
export class RacesResolver {
  constructor(private readonly racesService: RacesService) {}

  // Race Queries - public. Anonymous callers only see playable races;
  // authenticated callers see all (needed by the character-creation form).
  @Query(() => [RaceDto], { name: 'races' })
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(@CurrentUser() user?: Users | null) {
    return this.racesService.findAll(user ?? null);
  }

  @Query(() => RaceDto, { name: 'race' })
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Args('race', { type: () => Race }) race: Race,
    @CurrentUser() user?: Users | null
  ) {
    return this.racesService.findOne(race, user ?? null);
  }

  @Query(() => Int, { name: 'racesCount' })
  @UseGuards(OptionalJwtAuthGuard)
  async count(@CurrentUser() user?: Users | null) {
    return this.racesService.count(user ?? null);
  }

  // Race Mutations - CODER can create (requires FieryMUD code changes)
  @Mutation(() => RaceDto)
  @MinimumRole(UserRole.CODER)
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  async createRace(@Args('data') data: CreateRaceInput) {
    return this.racesService.create(data);
  }

  // HEAD_BUILDER can edit existing
  @Mutation(() => RaceDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  async updateRace(
    @Args('race', { type: () => Race }) race: Race,
    @Args('data') data: UpdateRaceInput
  ) {
    return this.racesService.update(race, data);
  }

  // HEAD_BUILDER can delete
  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  async deleteRace(@Args('race', { type: () => Race }) race: Race) {
    await this.racesService.remove(race);
    return true;
  }

  // Race Skill Queries
  @Query(() => [RaceSkillDto], {
    name: 'raceSkills',
    description: 'Get all skills for a race',
  })
  @UseGuards(OptionalJwtAuthGuard)
  async getRaceSkills(
    @Args('race', { type: () => Race }) race: Race,
    @CurrentUser() user?: Users | null
  ) {
    return this.racesService.getRaceSkills(race, user ?? null);
  }

  // Race Skill Mutations - HEAD_BUILDER can manage associations
  @Mutation(() => RaceSkillDto, {
    description: 'Assign a skill to a race',
  })
  @MinimumRole(UserRole.HEAD_BUILDER)
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  async assignSkillToRace(@Args('data') data: AssignSkillToRaceInput) {
    return this.racesService.assignSkillToRace(data);
  }

  @Mutation(() => RaceSkillDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  async updateRaceSkill(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateRaceSkillInput
  ) {
    return this.racesService.updateRaceSkill(Number(id), data);
  }

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  async removeRaceSkill(@Args('id', { type: () => ID }) id: string | number) {
    await this.racesService.removeRaceSkill(Number(id));
    return true;
  }
}
