import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { zoneLookups } from '../common/decorators/zone-lookups';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import type { Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { isStaff } from '../auth/role.util';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { hidesGodZones, inVisibleZone } from '../common/god-zone-visibility';
import {
  QuestDto,
  QuestPhaseDto,
  QuestObjectiveDto,
  QuestDialogueDto,
  QuestRewardDto,
  QuestPrerequisiteDto,
  CharacterQuestDto,
  CreateQuestInput,
  UpdateQuestInput,
  CreateQuestPhaseInput,
  UpdateQuestPhaseInput,
  CreateQuestObjectiveInput,
  UpdateQuestObjectiveInput,
  CreateQuestDialogueInput,
  UpdateQuestDialogueInput,
  CreateQuestRewardInput,
  UpdateQuestRewardInput,
  CreateQuestPrerequisiteInput,
  QuestFilterInput,
} from './quest.dto';
import { QuestsService } from './quests.service';
import { clampSkip, clampTake } from '../common/pagination';

@Resolver(() => QuestDto)
export class QuestsResolver {
  constructor(private readonly questsService: QuestsService) {}

  /** Throws unless the caller is IMMORTAL+ or owns the character. */
  private async assertOwnerOrStaff(
    user: Users,
    characterId: string
  ): Promise<void> {
    if (isStaff(user.role)) return;
    const ownerId = await this.questsService.findCharacterOwnerId(characterId);
    if (ownerId !== user.id) {
      throw new ForbiddenException('You do not have access to this character');
    }
  }

  // ============================================================================
  // Quest Queries
  // ============================================================================

  // Quest reads are public; quests in god zones are hidden from anonymous
  // callers and mortal accounts (IMMORTAL+ still see them).
  @Query(() => [QuestDto], { name: 'quests' })
  @UseGuards(OptionalJwtAuthGuard)
  async findAllQuests(
    @Args('filter', { nullable: true }) filter?: QuestFilterInput,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @CurrentUser() user?: Users | null
  ): Promise<QuestDto[]> {
    const where: Record<string, unknown> = {
      ...inVisibleZone(hidesGodZones(user ?? null)),
    };
    if (filter?.zoneId !== undefined) where.zoneId = filter.zoneId;
    if (filter?.hidden !== undefined) where.hidden = filter.hidden;
    if (filter?.minLevel !== undefined)
      where.minLevel = { gte: filter.minLevel };
    if (filter?.maxLevel !== undefined)
      where.maxLevel = { lte: filter.maxLevel };
    if (filter?.triggerType !== undefined)
      where.triggerType = filter.triggerType;

    const args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
    } = {};
    if (Object.keys(where).length > 0) args.where = where;
    if (skip !== undefined) args.skip = clampSkip(skip);
    args.take = clampTake(take);

    return this.questsService.findAllQuests(args) as Promise<QuestDto[]>;
  }

  @Query(() => [QuestDto], { name: 'questsByZone' })
  @UseGuards(OptionalJwtAuthGuard)
  async findQuestsByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @CurrentUser() user?: Users | null
  ): Promise<QuestDto[]> {
    return this.questsService.findQuestsByZone(
      zoneId,
      hidesGodZones(user ?? null)
    ) as Promise<QuestDto[]>;
  }

  @Query(() => QuestDto, { name: 'quest', nullable: true })
  @UseGuards(OptionalJwtAuthGuard)
  async findOneQuest(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user?: Users | null
  ): Promise<QuestDto | null> {
    return this.questsService.findOneQuest(
      zoneId,
      id,
      hidesGodZones(user ?? null)
    ) as Promise<QuestDto | null>;
  }

  @Query(() => Int, { name: 'questsCount' })
  @UseGuards(OptionalJwtAuthGuard)
  async countQuests(
    @Args('zoneId', { type: () => Int, nullable: true }) zoneId?: number,
    @CurrentUser() user?: Users | null
  ): Promise<number> {
    return this.questsService.countQuests({
      ...(zoneId ? { zoneId } : {}),
      ...inVisibleZone(hidesGodZones(user ?? null)),
    });
  }

  // ============================================================================
  // Quest Mutations
  // ============================================================================

  @Mutation(() => QuestDto)
  @RequireZoneWrite()
  async createQuest(@Args('data') data: CreateQuestInput): Promise<QuestDto> {
    return this.questsService.createQuest(data) as Promise<QuestDto>;
  }

  @Mutation(() => QuestDto)
  @RequireZoneWrite()
  async updateQuest(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateQuestInput
  ): Promise<QuestDto> {
    return this.questsService.updateQuest(
      zoneId,
      id,
      data
    ) as Promise<QuestDto>;
  }

  @Mutation(() => QuestDto)
  @RequireZoneWrite()
  async deleteQuest(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<QuestDto> {
    return this.questsService.deleteQuest(zoneId, id) as Promise<QuestDto>;
  }

  // ============================================================================
  // Phase Mutations
  // ============================================================================

  @Mutation(() => QuestPhaseDto)
  @RequireZoneWrite({ keys: ['questZoneId'] })
  async createQuestPhase(
    @Args('data') data: CreateQuestPhaseInput
  ): Promise<QuestPhaseDto> {
    return this.questsService.createPhase(data) as Promise<QuestPhaseDto>;
  }

  @Mutation(() => QuestPhaseDto)
  @RequireZoneWrite({ keys: ['questZoneId'] })
  async updateQuestPhase(
    @Args('questZoneId', { type: () => Int }) questZoneId: number,
    @Args('questId', { type: () => Int }) questId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateQuestPhaseInput
  ): Promise<QuestPhaseDto> {
    return this.questsService.updatePhase(
      questZoneId,
      questId,
      id,
      data
    ) as Promise<QuestPhaseDto>;
  }

  @Mutation(() => QuestPhaseDto)
  @RequireZoneWrite({ keys: ['questZoneId'] })
  async deleteQuestPhase(
    @Args('questZoneId', { type: () => Int }) questZoneId: number,
    @Args('questId', { type: () => Int }) questId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<QuestPhaseDto> {
    return this.questsService.deletePhase(
      questZoneId,
      questId,
      id
    ) as Promise<QuestPhaseDto>;
  }

  @Mutation(() => [QuestPhaseDto], {
    description:
      'Set the phase order: phaseIds lists every phase of the quest once, in the new order',
  })
  @RequireZoneWrite({ keys: ['questZoneId'] })
  async reorderQuestPhases(
    @Args('questZoneId', { type: () => Int }) questZoneId: number,
    @Args('questId', { type: () => Int }) questId: number,
    @Args('phaseIds', { type: () => [Int] }) phaseIds: number[]
  ): Promise<QuestPhaseDto[]> {
    return this.questsService.reorderPhases(
      questZoneId,
      questId,
      phaseIds
    ) as Promise<QuestPhaseDto[]>;
  }

  // ============================================================================
  // Objective Mutations
  // ============================================================================

  @Mutation(() => QuestObjectiveDto)
  @RequireZoneWrite({ keys: ['questZoneId'] })
  async createQuestObjective(
    @Args('data') data: CreateQuestObjectiveInput
  ): Promise<QuestObjectiveDto> {
    return this.questsService.createObjective(
      data
    ) as Promise<QuestObjectiveDto>;
  }

  @Mutation(() => QuestObjectiveDto)
  @RequireZoneWrite({ keys: ['questZoneId'] })
  async updateQuestObjective(
    @Args('questZoneId', { type: () => Int }) questZoneId: number,
    @Args('questId', { type: () => Int }) questId: number,
    @Args('phaseId', { type: () => Int }) phaseId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateQuestObjectiveInput
  ): Promise<QuestObjectiveDto> {
    return this.questsService.updateObjective(
      questZoneId,
      questId,
      phaseId,
      id,
      data
    ) as Promise<QuestObjectiveDto>;
  }

  @Mutation(() => QuestObjectiveDto)
  @RequireZoneWrite({ keys: ['questZoneId'] })
  async deleteQuestObjective(
    @Args('questZoneId', { type: () => Int }) questZoneId: number,
    @Args('questId', { type: () => Int }) questId: number,
    @Args('phaseId', { type: () => Int }) phaseId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<QuestObjectiveDto> {
    return this.questsService.deleteObjective(
      questZoneId,
      questId,
      phaseId,
      id
    ) as Promise<QuestObjectiveDto>;
  }

  // ============================================================================
  // Dialogue Mutations
  // ============================================================================

  @Mutation(() => QuestDialogueDto)
  @RequireZoneWrite({ keys: ['questZoneId'] })
  async createQuestDialogue(
    @Args('data') data: CreateQuestDialogueInput
  ): Promise<QuestDialogueDto> {
    return this.questsService.createDialogue(data) as Promise<QuestDialogueDto>;
  }

  @Mutation(() => QuestDialogueDto)
  @RequireZoneWrite({ lookup: zoneLookups.questDialogue('id') })
  async updateQuestDialogue(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateQuestDialogueInput
  ): Promise<QuestDialogueDto> {
    return this.questsService.updateDialogue(
      id,
      data
    ) as Promise<QuestDialogueDto>;
  }

  @Mutation(() => QuestDialogueDto)
  @RequireZoneWrite({ lookup: zoneLookups.questDialogue('id') })
  async deleteQuestDialogue(
    @Args('id', { type: () => Int }) id: number
  ): Promise<QuestDialogueDto> {
    return this.questsService.deleteDialogue(id) as Promise<QuestDialogueDto>;
  }

  // ============================================================================
  // Reward Mutations
  // ============================================================================

  @Mutation(() => QuestRewardDto)
  @RequireZoneWrite({ keys: ['questZoneId'] })
  async createQuestReward(
    @Args('data') data: CreateQuestRewardInput
  ): Promise<QuestRewardDto> {
    return this.questsService.createReward(data) as Promise<QuestRewardDto>;
  }

  @Mutation(() => QuestRewardDto)
  @RequireZoneWrite({ lookup: zoneLookups.questReward('id') })
  async updateQuestReward(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateQuestRewardInput
  ): Promise<QuestRewardDto> {
    return this.questsService.updateReward(id, data) as Promise<QuestRewardDto>;
  }

  @Mutation(() => QuestRewardDto)
  @RequireZoneWrite({ lookup: zoneLookups.questReward('id') })
  async deleteQuestReward(
    @Args('id', { type: () => Int }) id: number
  ): Promise<QuestRewardDto> {
    return this.questsService.deleteReward(id) as Promise<QuestRewardDto>;
  }

  // ============================================================================
  // Prerequisite Mutations
  // ============================================================================

  @Mutation(() => QuestPrerequisiteDto)
  @RequireZoneWrite({ keys: ['questZoneId'] })
  async createQuestPrerequisite(
    @Args('data') data: CreateQuestPrerequisiteInput
  ): Promise<QuestPrerequisiteDto> {
    return this.questsService.createPrerequisite(
      data
    ) as Promise<QuestPrerequisiteDto>;
  }

  @Mutation(() => QuestPrerequisiteDto)
  @RequireZoneWrite({ lookup: zoneLookups.questPrerequisite('id') })
  async deleteQuestPrerequisite(
    @Args('id', { type: () => Int }) id: number
  ): Promise<QuestPrerequisiteDto> {
    return this.questsService.deletePrerequisite(
      id
    ) as Promise<QuestPrerequisiteDto>;
  }

  // ============================================================================
  // Character Quest Queries
  // ============================================================================

  @Query(() => [CharacterQuestDto], { name: 'characterQuests' })
  @UseGuards(JwtAuthGuard)
  async findCharacterQuests(
    @Args('characterId') characterId: string,
    @CurrentUser() user: Users
  ): Promise<CharacterQuestDto[]> {
    await this.assertOwnerOrStaff(user, characterId);
    return this.questsService.findCharacterQuests(characterId) as Promise<
      CharacterQuestDto[]
    >;
  }

  @Query(() => [QuestDto], { name: 'availableQuests' })
  @UseGuards(JwtAuthGuard)
  async getAvailableQuests(
    @Args('characterId') characterId: string,
    @Args('level', { type: () => Int }) level: number,
    @CurrentUser() user: Users
  ): Promise<QuestDto[]> {
    await this.assertOwnerOrStaff(user, characterId);
    return this.questsService.getAvailableQuests(characterId, level) as Promise<
      QuestDto[]
    >;
  }
}
