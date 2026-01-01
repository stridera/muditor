import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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

@Resolver(() => QuestDto)
export class QuestsResolver {
  constructor(private readonly questsService: QuestsService) {}

  // ============================================================================
  // Quest Queries
  // ============================================================================

  @Query(() => [QuestDto], { name: 'quests' })
  async findAllQuests(
    @Args('filter', { nullable: true }) filter?: QuestFilterInput,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<QuestDto[]> {
    const where: Record<string, unknown> = {};
    if (filter?.zoneId !== undefined) where.zoneId = filter.zoneId;
    if (filter?.hidden !== undefined) where.hidden = filter.hidden;
    if (filter?.minLevel !== undefined)
      where.minLevel = { gte: filter.minLevel };
    if (filter?.maxLevel !== undefined)
      where.maxLevel = { lte: filter.maxLevel };

    const args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
    } = {};
    if (Object.keys(where).length > 0) args.where = where;
    if (skip !== undefined) args.skip = skip;
    if (take !== undefined) args.take = take;

    return this.questsService.findAllQuests(args) as Promise<QuestDto[]>;
  }

  @Query(() => [QuestDto], { name: 'questsByZone' })
  async findQuestsByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number
  ): Promise<QuestDto[]> {
    return this.questsService.findQuestsByZone(zoneId) as Promise<QuestDto[]>;
  }

  @Query(() => QuestDto, { name: 'quest', nullable: true })
  async findOneQuest(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<QuestDto | null> {
    return this.questsService.findOneQuest(
      zoneId,
      id
    ) as Promise<QuestDto | null>;
  }

  @Query(() => Int, { name: 'questsCount' })
  async countQuests(
    @Args('zoneId', { type: () => Int, nullable: true }) zoneId?: number
  ): Promise<number> {
    return this.questsService.countQuests(zoneId ? { zoneId } : undefined);
  }

  // ============================================================================
  // Quest Mutations
  // ============================================================================

  @Mutation(() => QuestDto)
  @UseGuards(JwtAuthGuard)
  async createQuest(@Args('data') data: CreateQuestInput): Promise<QuestDto> {
    return this.questsService.createQuest(data) as Promise<QuestDto>;
  }

  @Mutation(() => QuestDto)
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async createQuestPhase(
    @Args('data') data: CreateQuestPhaseInput
  ): Promise<QuestPhaseDto> {
    return this.questsService.createPhase(data) as Promise<QuestPhaseDto>;
  }

  @Mutation(() => QuestPhaseDto)
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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

  // ============================================================================
  // Objective Mutations
  // ============================================================================

  @Mutation(() => QuestObjectiveDto)
  @UseGuards(JwtAuthGuard)
  async createQuestObjective(
    @Args('data') data: CreateQuestObjectiveInput
  ): Promise<QuestObjectiveDto> {
    return this.questsService.createObjective(
      data
    ) as Promise<QuestObjectiveDto>;
  }

  @Mutation(() => QuestObjectiveDto)
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async createQuestDialogue(
    @Args('data') data: CreateQuestDialogueInput
  ): Promise<QuestDialogueDto> {
    return this.questsService.createDialogue(data) as Promise<QuestDialogueDto>;
  }

  @Mutation(() => QuestDialogueDto)
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async deleteQuestDialogue(
    @Args('id', { type: () => Int }) id: number
  ): Promise<QuestDialogueDto> {
    return this.questsService.deleteDialogue(id) as Promise<QuestDialogueDto>;
  }

  // ============================================================================
  // Reward Mutations
  // ============================================================================

  @Mutation(() => QuestRewardDto)
  @UseGuards(JwtAuthGuard)
  async createQuestReward(
    @Args('data') data: CreateQuestRewardInput
  ): Promise<QuestRewardDto> {
    return this.questsService.createReward(data) as Promise<QuestRewardDto>;
  }

  @Mutation(() => QuestRewardDto)
  @UseGuards(JwtAuthGuard)
  async updateQuestReward(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateQuestRewardInput
  ): Promise<QuestRewardDto> {
    return this.questsService.updateReward(id, data) as Promise<QuestRewardDto>;
  }

  @Mutation(() => QuestRewardDto)
  @UseGuards(JwtAuthGuard)
  async deleteQuestReward(
    @Args('id', { type: () => Int }) id: number
  ): Promise<QuestRewardDto> {
    return this.questsService.deleteReward(id) as Promise<QuestRewardDto>;
  }

  // ============================================================================
  // Prerequisite Mutations
  // ============================================================================

  @Mutation(() => QuestPrerequisiteDto)
  @UseGuards(JwtAuthGuard)
  async createQuestPrerequisite(
    @Args('data') data: CreateQuestPrerequisiteInput
  ): Promise<QuestPrerequisiteDto> {
    return this.questsService.createPrerequisite(
      data
    ) as Promise<QuestPrerequisiteDto>;
  }

  @Mutation(() => QuestPrerequisiteDto)
  @UseGuards(JwtAuthGuard)
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
    @Args('characterId') characterId: string
  ): Promise<CharacterQuestDto[]> {
    return this.questsService.findCharacterQuests(characterId) as Promise<
      CharacterQuestDto[]
    >;
  }

  @Query(() => [QuestDto], { name: 'availableQuests' })
  @UseGuards(JwtAuthGuard)
  async getAvailableQuests(
    @Args('characterId') characterId: string,
    @Args('level', { type: () => Int }) level: number
  ): Promise<QuestDto[]> {
    return this.questsService.getAvailableQuests(characterId, level) as Promise<
      QuestDto[]
    >;
  }
}
