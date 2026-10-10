import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { MobAiRuleDto, SaveMobAiRuleInput } from './mob-ai.dto';
import { MobAiService } from './mob-ai.service';

/**
 * Per-mob AI rules (MobAbilities rows, used when Mobs.aiMode = CUSTOM).
 * Reads IMMORTAL+; writes need BUILDER+ and WRITE on the mob's zone.
 */
@Resolver(() => MobAiRuleDto)
export class MobAiRulesResolver {
  constructor(private readonly mobAi: MobAiService) {}

  @Query(() => [MobAiRuleDto], {
    name: 'mobAiRules',
    description: "A mob's own AI rules in priority order",
  })
  @UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
  @MinimumRole(UserRole.IMMORTAL)
  async mobAiRules(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('mobId', { type: () => Int }) mobId: number
  ): Promise<MobAiRuleDto[]> {
    return this.mobAi.listMobRules(zoneId, mobId);
  }

  @Mutation(() => MobAiRuleDto, {
    description:
      'Create or update the rule for one ability on a mob; omitted fields are left alone',
  })
  @RequireZoneWrite()
  async saveMobAiRule(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('mobId', { type: () => Int }) mobId: number,
    @Args('data') data: SaveMobAiRuleInput
  ): Promise<MobAiRuleDto> {
    return this.mobAi.saveMobRule(zoneId, mobId, data);
  }

  @Mutation(() => Boolean)
  @RequireZoneWrite()
  async deleteMobAiRule(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('mobId', { type: () => Int }) mobId: number,
    @Args('abilityId', { type: () => Int }) abilityId: number
  ): Promise<boolean> {
    await this.mobAi.deleteMobRule(zoneId, mobId, abilityId);
    return true;
  }

  @Mutation(() => [MobAiRuleDto], {
    description:
      'Renumber the mob rules to follow abilityIds, which must list every rule of the mob once',
  })
  @RequireZoneWrite()
  async reorderMobAiRules(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('mobId', { type: () => Int }) mobId: number,
    @Args('abilityIds', { type: () => [Int] }) abilityIds: number[]
  ): Promise<MobAiRuleDto[]> {
    return this.mobAi.reorderMobRules(zoneId, mobId, abilityIds);
  }
}
