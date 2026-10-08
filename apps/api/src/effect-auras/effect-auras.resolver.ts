import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { EffectAuraDto } from './effect-aura.dto';
import {
  CreateEffectAuraInput,
  UpdateEffectAuraInput,
} from './effect-aura.input';
import { EffectAurasService } from './effect-auras.service';

@Resolver(() => EffectAuraDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class EffectAurasResolver {
  constructor(private readonly effectAurasService: EffectAurasService) {}

  // Queries - IMMORTAL+ can view

  @Query(() => [EffectAuraDto], {
    name: 'effectAuras',
    description: 'Get all effect aura lines, in display order',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findAll() {
    return this.effectAurasService.findAll();
  }

  @Query(() => EffectAuraDto, {
    name: 'effectAura',
    description: 'Get a single effect aura by ID',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findOne(@Args('id', { type: () => ID }) id: string | number) {
    return this.effectAurasService.findOne(Number(id));
  }

  // Mutations - BUILDER+ (world-content catalog)

  @Mutation(() => EffectAuraDto, { description: 'Create an effect aura' })
  @MinimumRole(UserRole.BUILDER)
  async createEffectAura(@Args('data') data: CreateEffectAuraInput) {
    return this.effectAurasService.create(data);
  }

  @Mutation(() => EffectAuraDto, { description: 'Update an effect aura' })
  @MinimumRole(UserRole.BUILDER)
  async updateEffectAura(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateEffectAuraInput
  ) {
    return this.effectAurasService.update(Number(id), data);
  }

  @Mutation(() => Boolean, { description: 'Delete an effect aura' })
  @MinimumRole(UserRole.BUILDER)
  async deleteEffectAura(@Args('id', { type: () => ID }) id: string | number) {
    await this.effectAurasService.remove(Number(id));
    return true;
  }
}
