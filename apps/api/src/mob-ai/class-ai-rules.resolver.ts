import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import {
  ClassAiRuleDto,
  CreateClassAiRuleInput,
  UpdateClassAiRuleInput,
} from './mob-ai.dto';
import { MobAiService } from './mob-ai.service';

/**
 * Class-wide mob AI rules. Not zone content, so there is no zone scope:
 * IMMORTAL+ may read, HEAD_BUILDER+ may write (like class editing).
 */
@Resolver(() => ClassAiRuleDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class ClassAiRulesResolver {
  constructor(private readonly mobAi: MobAiService) {}

  @Query(() => [ClassAiRuleDto], {
    name: 'classAiRules',
    description: 'AI rules of a class in priority order',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async classAiRules(
    @Args('classId', { type: () => Int }) classId: number
  ): Promise<ClassAiRuleDto[]> {
    return this.mobAi.listClassRules(classId);
  }

  @Mutation(() => ClassAiRuleDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async createClassAiRule(
    @Args('data') data: CreateClassAiRuleInput
  ): Promise<ClassAiRuleDto> {
    return this.mobAi.createClassRule(data);
  }

  @Mutation(() => ClassAiRuleDto)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async updateClassAiRule(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateClassAiRuleInput
  ): Promise<ClassAiRuleDto> {
    return this.mobAi.updateClassRule(id, data);
  }

  @Mutation(() => Boolean)
  @MinimumRole(UserRole.HEAD_BUILDER)
  async deleteClassAiRule(
    @Args('id', { type: () => Int }) id: number
  ): Promise<boolean> {
    await this.mobAi.deleteClassRule(id);
    return true;
  }

  @Mutation(() => [ClassAiRuleDto], {
    description:
      'Renumber the class rules to follow ruleIds, which must list every rule of the class once',
  })
  @MinimumRole(UserRole.HEAD_BUILDER)
  async reorderClassAiRules(
    @Args('classId', { type: () => Int }) classId: number,
    @Args('ruleIds', { type: () => [Int] }) ruleIds: number[]
  ): Promise<ClassAiRuleDto[]> {
    return this.mobAi.reorderClassRules(classId, ruleIds);
  }
}
