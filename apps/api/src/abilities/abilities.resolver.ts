import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import {
  Ability,
  AbilityMessages,
  AbilitySavingThrow,
  AbilitySchool,
  AbilityTargeting,
  Effect,
} from './abilities.dto';
import {
  CreateAbilityInput,
  CreateAbilityMessagesInput,
  CreateAbilitySavingThrowInput,
  CreateAbilityTargetingInput,
  UpdateAbilityInput,
  UpdateAbilityMessagesInput,
  UpdateAbilityTargetingInput,
} from './abilities.input';
import { AbilitiesService } from './abilities.service';

@Resolver(() => Ability)
@UseGuards(JwtAuthGuard)
export class AbilitiesResolver {
  constructor(private abilitiesService: AbilitiesService) {}

  // Helper to safely coerce GraphQL ID (which may arrive as a string) into a numeric id
  private coerceNumericId(raw: unknown, fieldName = 'id'): number {
    // Accept numbers or numeric strings; reject anything else explicitly
    if (typeof raw === 'number' && Number.isInteger(raw)) return raw;
    if (typeof raw === 'string' && raw.trim() !== '') {
      const n = Number(raw);
      if (Number.isInteger(n)) return n;
    }
    throw new BadRequestException(`Invalid ${fieldName}: ${raw}`);
  }

  @Query(() => [Ability], { name: 'abilities' })
  async getAbilities(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('abilityType', { type: () => String, nullable: true })
    abilityType?: string,
    @Args('search', { type: () => String, nullable: true })
    search?: string
  ) {
    return this.abilitiesService.findAll(skip, take, abilityType, search);
  }

  @Query(() => Int, { name: 'abilitiesCount' })
  async getAbilitiesCount(
    @Args('abilityType', { type: () => String, nullable: true })
    abilityType?: string,
    @Args('search', { type: () => String, nullable: true })
    search?: string
  ) {
    return this.abilitiesService.count(abilityType, search);
  }

  @Query(() => Ability, { name: 'ability' })
  async getAbility(@Args('id', { type: () => ID }) id: string | number) {
    return this.abilitiesService.findOne(this.coerceNumericId(id));
  }

  @Query(() => Ability, { name: 'abilityByGameId', nullable: true })
  async getAbilityByGameId(@Args('gameId') gameId: string) {
    return this.abilitiesService.findByGameId(gameId);
  }

  @Mutation(() => Ability)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole('CODER')
  async createAbility(@Args('data') data: CreateAbilityInput) {
    return this.abilitiesService.create(data);
  }

  @Mutation(() => Ability)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole('BUILDER')
  async updateAbility(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateAbilityInput
  ) {
    return this.abilitiesService.update(this.coerceNumericId(id), data);
  }

  @Mutation(() => Boolean)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole('BUILDER')
  async deleteAbility(@Args('id', { type: () => ID }) id: string | number) {
    return this.abilitiesService.delete(this.coerceNumericId(id));
  }

  // Targeting mutations
  @Mutation(() => AbilityTargeting)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole('BUILDER')
  async createAbilityTargeting(
    @Args('data') data: CreateAbilityTargetingInput
  ) {
    return this.abilitiesService.createTargeting(data);
  }

  @Mutation(() => AbilityTargeting)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole('BUILDER')
  async updateAbilityTargeting(
    @Args('abilityId', { type: () => Int }) abilityId: number,
    @Args('data') data: UpdateAbilityTargetingInput
  ) {
    return this.abilitiesService.updateTargeting(abilityId, data);
  }

  @Mutation(() => Boolean)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole('BUILDER')
  async deleteAbilityTargeting(
    @Args('abilityId', { type: () => Int }) abilityId: number
  ) {
    return this.abilitiesService.deleteTargeting(abilityId);
  }

  // Saving throw mutations
  @Mutation(() => AbilitySavingThrow)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole('BUILDER')
  async createAbilitySavingThrow(
    @Args('data') data: CreateAbilitySavingThrowInput
  ) {
    return this.abilitiesService.createSavingThrow(data);
  }

  @Mutation(() => Boolean)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole('BUILDER')
  async deleteAbilitySavingThrow(
    @Args('id', { type: () => ID }) id: string | number
  ) {
    return this.abilitiesService.deleteSavingThrow(this.coerceNumericId(id));
  }

  // Messages mutations
  @Mutation(() => AbilityMessages)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole('BUILDER')
  async createAbilityMessages(@Args('data') data: CreateAbilityMessagesInput) {
    return this.abilitiesService.createMessages(data);
  }

  @Mutation(() => AbilityMessages)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole('BUILDER')
  async updateAbilityMessages(
    @Args('abilityId', { type: () => Int }) abilityId: number,
    @Args('data') data: UpdateAbilityMessagesInput
  ) {
    return this.abilitiesService.updateMessages(abilityId, data);
  }

  @Mutation(() => Boolean)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole('BUILDER')
  async deleteAbilityMessages(
    @Args('abilityId', { type: () => Int }) abilityId: number
  ) {
    return this.abilitiesService.deleteMessages(abilityId);
  }

  // Schools queries
  @Query(() => [AbilitySchool], { name: 'abilitySchools' })
  async getAbilitySchools() {
    return this.abilitiesService.findAllSchools();
  }

  @Query(() => AbilitySchool, { name: 'abilitySchool' })
  async getAbilitySchool(@Args('id', { type: () => ID }) id: string | number) {
    return this.abilitiesService.findSchool(this.coerceNumericId(id));
  }

  // Effects queries
  @Query(() => [Effect], { name: 'effects' })
  async getEffects(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('search', { type: () => String, nullable: true }) search?: string
  ) {
    return this.abilitiesService.findAllEffects(skip, take, search);
  }

  @Query(() => Int, { name: 'effectsCount' })
  async getEffectsCount(
    @Args('search', { type: () => String, nullable: true }) search?: string
  ) {
    return this.abilitiesService.countEffects(search);
  }

  @Query(() => Effect, { name: 'effect' })
  async getEffect(@Args('id', { type: () => ID }) id: string | number) {
    return this.abilitiesService.findEffect(this.coerceNumericId(id));
  }
}
