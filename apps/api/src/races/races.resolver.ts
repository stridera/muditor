import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Race, UserRole } from '@prisma/client';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
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
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class RacesResolver {
  constructor(private readonly racesService: RacesService) {}

  // Race Queries - IMMORTAL+ can view
  @Query(() => [RaceDto], { name: 'races' })
  @MinimumRole(UserRole.IMMORTAL)
  async findAll() {
    return this.racesService.findAll();
  }

  @Query(() => RaceDto, { name: 'race' })
  @MinimumRole(UserRole.IMMORTAL)
  async findOne(@Args('race', { type: () => Race }) race: Race) {
    return this.racesService.findOne(race);
  }

  @Query(() => Int, { name: 'racesCount' })
  @MinimumRole(UserRole.IMMORTAL)
  async count() {
    return this.racesService.count();
  }

  // Race Mutations - CODER can create (requires FieryMUD code changes)
  @Mutation(() => RaceDto)
  @MinimumRole(UserRole.CODER)
  async createRace(@Args('data') data: CreateRaceInput) {
    return this.racesService.create(data);
  }

  // HEAD_BUILDER can edit existing
  @Mutation(() => RaceDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateRace(
    @Args('race', { type: () => Race }) race: Race,
    @Args('data') data: UpdateRaceInput
  ) {
    return this.racesService.update(race, data);
  }

  // HEAD_BUILDER can delete
  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async deleteRace(@Args('race', { type: () => Race }) race: Race) {
    await this.racesService.remove(race);
    return true;
  }

  // Race Skill Queries
  @Query(() => [RaceSkillDto], {
    name: 'raceSkills',
    description: 'Get all skills for a race',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async getRaceSkills(@Args('race', { type: () => Race }) race: Race) {
    return this.racesService.getRaceSkills(race);
  }

  // Race Skill Mutations - HEAD_BUILDER can manage associations
  @Mutation(() => RaceSkillDto, {
    description: 'Assign a skill to a race',
  })
  @MinimumRole(UserRole.HEAD_BUILDER)
  async assignSkillToRace(@Args('data') data: AssignSkillToRaceInput) {
    return this.racesService.assignSkillToRace(data);
  }

  @Mutation(() => RaceSkillDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateRaceSkill(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateRaceSkillInput
  ) {
    return this.racesService.updateRaceSkill(Number(id), data);
  }

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async removeRaceSkill(@Args('id', { type: () => ID }) id: string | number) {
    await this.racesService.removeRaceSkill(Number(id));
    return true;
  }
}
