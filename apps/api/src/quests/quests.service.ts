import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
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
} from './quest.dto';

@Injectable()
export class QuestsService {
  constructor(private readonly database: DatabaseService) {}

  // ============================================================================
  // Quest CRUD
  // ============================================================================

  async findAllQuests(args?: {
    skip?: number;
    take?: number;
    where?: Record<string, unknown>;
  }) {
    return this.database.quests.findMany({
      orderBy: [{ zoneId: 'asc' }, { id: 'asc' }],
      ...(args?.where && { where: args.where }),
      ...(args?.skip !== undefined && { skip: args.skip }),
      ...(args?.take !== undefined && { take: args.take }),
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            objectives: {
              orderBy: { id: 'asc' },
              include: { dialogue: true },
            },
            rewards: true,
          },
        },
        prerequisites: true,
      },
    });
  }

  async findQuestsByZone(zoneId: number) {
    return this.findAllQuests({ where: { zoneId } });
  }

  async findOneQuest(zoneId: number, id: number) {
    return this.database.quests.findUnique({
      where: { zoneId_id: { zoneId, id } },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            objectives: {
              orderBy: { id: 'asc' },
              include: { dialogue: true },
            },
            rewards: true,
          },
        },
        prerequisites: true,
        triggerMob: true,
      },
    });
  }

  async countQuests(where?: Record<string, unknown>) {
    return this.database.quests.count(where ? { where } : {});
  }

  async createQuest(data: CreateQuestInput) {
    // plainName is auto-populated by database middleware from name
    return this.database.quests.create({
      data: {
        zoneId: data.zoneId,
        id: data.id,
        name: data.name,
        plainName: data.name, // Will be overwritten by middleware with markup stripped
        description: data.description ?? null,
        minLevel: data.minLevel ?? 1,
        maxLevel: data.maxLevel ?? 100,
        repeatable: data.repeatable ?? false,
        hidden: data.hidden ?? false,
        // Branching paths
        exclusiveGroup: data.exclusiveGroup ?? null,
        // Trigger configuration
        triggerType: data.triggerType ?? 'MOB',
        triggerMobZoneId: data.triggerMobZoneId ?? null,
        triggerMobId: data.triggerMobId ?? null,
        triggerLevel: data.triggerLevel ?? null,
        triggerItemZoneId: data.triggerItemZoneId ?? null,
        triggerItemId: data.triggerItemId ?? null,
        triggerRoomZoneId: data.triggerRoomZoneId ?? null,
        triggerRoomId: data.triggerRoomId ?? null,
        triggerAbilityId: data.triggerAbilityId ?? null,
        triggerEventId: data.triggerEventId ?? null,
        timeLimitMinutes: data.timeLimitMinutes ?? null,
        // Availability requirement
        availabilityRequirement: data.availabilityRequirement ?? null,
      },
      include: {
        phases: {
          include: { rewards: true },
        },
        prerequisites: true,
      },
    });
  }

  async updateQuest(zoneId: number, id: number, data: UpdateQuestInput) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.minLevel !== undefined) updateData.minLevel = data.minLevel;
    if (data.maxLevel !== undefined) updateData.maxLevel = data.maxLevel;
    if (data.repeatable !== undefined) updateData.repeatable = data.repeatable;
    if (data.hidden !== undefined) updateData.hidden = data.hidden;
    // Branching paths
    if (data.exclusiveGroup !== undefined)
      updateData.exclusiveGroup = data.exclusiveGroup;
    // Trigger configuration
    if (data.triggerType !== undefined)
      updateData.triggerType = data.triggerType;
    if (data.triggerMobZoneId !== undefined)
      updateData.triggerMobZoneId = data.triggerMobZoneId;
    if (data.triggerMobId !== undefined)
      updateData.triggerMobId = data.triggerMobId;
    if (data.triggerLevel !== undefined)
      updateData.triggerLevel = data.triggerLevel;
    if (data.triggerItemZoneId !== undefined)
      updateData.triggerItemZoneId = data.triggerItemZoneId;
    if (data.triggerItemId !== undefined)
      updateData.triggerItemId = data.triggerItemId;
    if (data.triggerRoomZoneId !== undefined)
      updateData.triggerRoomZoneId = data.triggerRoomZoneId;
    if (data.triggerRoomId !== undefined)
      updateData.triggerRoomId = data.triggerRoomId;
    if (data.triggerAbilityId !== undefined)
      updateData.triggerAbilityId = data.triggerAbilityId;
    if (data.triggerEventId !== undefined)
      updateData.triggerEventId = data.triggerEventId;
    if (data.timeLimitMinutes !== undefined)
      updateData.timeLimitMinutes = data.timeLimitMinutes;
    // Availability requirement
    if (data.availabilityRequirement !== undefined)
      updateData.availabilityRequirement = data.availabilityRequirement;

    return this.database.quests.update({
      where: { zoneId_id: { zoneId, id } },
      data: updateData,
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            objectives: {
              orderBy: { id: 'asc' },
              include: { dialogue: true },
            },
            rewards: true,
          },
        },
        prerequisites: true,
      },
    });
  }

  async deleteQuest(zoneId: number, id: number) {
    return this.database.quests.delete({
      where: { zoneId_id: { zoneId, id } },
    });
  }

  // ============================================================================
  // Phase CRUD
  // ============================================================================

  async findPhase(questZoneId: number, questId: number, id: number) {
    return this.database.questPhases.findUnique({
      where: { questZoneId_questId_id: { questZoneId, questId, id } },
      include: {
        objectives: {
          orderBy: { id: 'asc' },
          include: { dialogue: true },
        },
        rewards: true,
      },
    });
  }

  async createPhase(data: CreateQuestPhaseInput) {
    return this.database.questPhases.create({
      data: {
        questZoneId: data.questZoneId,
        questId: data.questId,
        id: data.id,
        name: data.name,
        description: data.description ?? null,
        order: data.order,
      },
      include: { objectives: true, rewards: true },
    });
  }

  async updatePhase(
    questZoneId: number,
    questId: number,
    id: number,
    data: UpdateQuestPhaseInput
  ) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.order !== undefined) updateData.order = data.order;

    return this.database.questPhases.update({
      where: { questZoneId_questId_id: { questZoneId, questId, id } },
      data: updateData,
      include: { objectives: true, rewards: true },
    });
  }

  async deletePhase(questZoneId: number, questId: number, id: number) {
    return this.database.questPhases.delete({
      where: { questZoneId_questId_id: { questZoneId, questId, id } },
    });
  }

  // ============================================================================
  // Objective CRUD
  // ============================================================================

  async findObjective(
    questZoneId: number,
    questId: number,
    phaseId: number,
    id: number
  ) {
    return this.database.questObjectives.findUnique({
      where: {
        questZoneId_questId_phaseId_id: { questZoneId, questId, phaseId, id },
      },
      include: { dialogue: true },
    });
  }

  async createObjective(data: CreateQuestObjectiveInput) {
    return this.database.questObjectives.create({
      data: {
        questZoneId: data.questZoneId,
        questId: data.questId,
        phaseId: data.phaseId,
        id: data.id,
        objectiveType: data.objectiveType,
        playerDescription: data.playerDescription,
        internalNote: data.internalNote ?? null,
        showProgress: data.showProgress ?? true,
        requiredCount: data.requiredCount ?? 1,
        targetMobZoneId: data.targetMobZoneId ?? null,
        targetMobId: data.targetMobId ?? null,
        targetObjectZoneId: data.targetObjectZoneId ?? null,
        targetObjectId: data.targetObjectId ?? null,
        targetRoomZoneId: data.targetRoomZoneId ?? null,
        targetRoomId: data.targetRoomId ?? null,
        targetAbilityId: data.targetAbilityId ?? null,
        deliverToMobZoneId: data.deliverToMobZoneId ?? null,
        deliverToMobId: data.deliverToMobId ?? null,
        luaExpression: data.luaExpression ?? null,
      },
      include: { dialogue: true },
    });
  }

  async updateObjective(
    questZoneId: number,
    questId: number,
    phaseId: number,
    id: number,
    data: UpdateQuestObjectiveInput
  ) {
    const updateData: Record<string, unknown> = {};
    if (data.objectiveType !== undefined)
      updateData.objectiveType = data.objectiveType;
    if (data.playerDescription !== undefined)
      updateData.playerDescription = data.playerDescription;
    if (data.internalNote !== undefined)
      updateData.internalNote = data.internalNote;
    if (data.showProgress !== undefined)
      updateData.showProgress = data.showProgress;
    if (data.requiredCount !== undefined)
      updateData.requiredCount = data.requiredCount;
    if (data.targetMobZoneId !== undefined)
      updateData.targetMobZoneId = data.targetMobZoneId;
    if (data.targetMobId !== undefined)
      updateData.targetMobId = data.targetMobId;
    if (data.targetObjectZoneId !== undefined)
      updateData.targetObjectZoneId = data.targetObjectZoneId;
    if (data.targetObjectId !== undefined)
      updateData.targetObjectId = data.targetObjectId;
    if (data.targetRoomZoneId !== undefined)
      updateData.targetRoomZoneId = data.targetRoomZoneId;
    if (data.targetRoomId !== undefined)
      updateData.targetRoomId = data.targetRoomId;
    if (data.targetAbilityId !== undefined)
      updateData.targetAbilityId = data.targetAbilityId;
    if (data.deliverToMobZoneId !== undefined)
      updateData.deliverToMobZoneId = data.deliverToMobZoneId;
    if (data.deliverToMobId !== undefined)
      updateData.deliverToMobId = data.deliverToMobId;
    if (data.luaExpression !== undefined)
      updateData.luaExpression = data.luaExpression;

    return this.database.questObjectives.update({
      where: {
        questZoneId_questId_phaseId_id: { questZoneId, questId, phaseId, id },
      },
      data: updateData,
      include: { dialogue: true },
    });
  }

  async deleteObjective(
    questZoneId: number,
    questId: number,
    phaseId: number,
    id: number
  ) {
    return this.database.questObjectives.delete({
      where: {
        questZoneId_questId_phaseId_id: { questZoneId, questId, phaseId, id },
      },
    });
  }

  // ============================================================================
  // Dialogue CRUD
  // ============================================================================

  async createDialogue(data: CreateQuestDialogueInput) {
    return this.database.questDialogue.create({
      data: {
        questZoneId: data.questZoneId,
        questId: data.questId,
        phaseId: data.phaseId,
        objectiveId: data.objectiveId,
        npcMessage: data.npcMessage,
        matchType: data.matchType ?? 'ANY_RESPONSE',
        matchKeywords: data.matchKeywords ?? [],
        dialogueTreeId: data.dialogueTreeId ?? null,
      },
    });
  }

  async updateDialogue(id: number, data: UpdateQuestDialogueInput) {
    const updateData: Record<string, unknown> = {};
    if (data.npcMessage !== undefined) updateData.npcMessage = data.npcMessage;
    if (data.matchType !== undefined) updateData.matchType = data.matchType;
    if (data.matchKeywords !== undefined)
      updateData.matchKeywords = data.matchKeywords;
    if (data.dialogueTreeId !== undefined)
      updateData.dialogueTreeId = data.dialogueTreeId;

    return this.database.questDialogue.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteDialogue(id: number) {
    return this.database.questDialogue.delete({ where: { id } });
  }

  // ============================================================================
  // Reward CRUD
  // ============================================================================

  async findRewardsByPhase(
    questZoneId: number,
    questId: number,
    phaseId: number
  ) {
    return this.database.questRewards.findMany({
      where: { questZoneId, questId, phaseId },
    });
  }

  async createReward(data: CreateQuestRewardInput) {
    return this.database.questRewards.create({
      data: {
        questZoneId: data.questZoneId,
        questId: data.questId,
        phaseId: data.phaseId,
        rewardType: data.rewardType,
        amount: data.amount ?? null,
        objectZoneId: data.objectZoneId ?? null,
        objectId: data.objectId ?? null,
        abilityId: data.abilityId ?? null,
        choiceGroup: data.choiceGroup ?? null,
      },
    });
  }

  async updateReward(id: number, data: UpdateQuestRewardInput) {
    const updateData: Record<string, unknown> = {};
    if (data.rewardType !== undefined) updateData.rewardType = data.rewardType;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.objectZoneId !== undefined)
      updateData.objectZoneId = data.objectZoneId;
    if (data.objectId !== undefined) updateData.objectId = data.objectId;
    if (data.abilityId !== undefined) updateData.abilityId = data.abilityId;
    if (data.choiceGroup !== undefined)
      updateData.choiceGroup = data.choiceGroup;

    return this.database.questRewards.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteReward(id: number) {
    return this.database.questRewards.delete({ where: { id } });
  }

  // ============================================================================
  // Prerequisite CRUD
  // ============================================================================

  async findPrerequisitesByQuest(questZoneId: number, questId: number) {
    return this.database.questPrerequisites.findMany({
      where: { questZoneId, questId },
      include: {
        prerequisiteQuest: true,
      },
    });
  }

  async createPrerequisite(data: CreateQuestPrerequisiteInput) {
    return this.database.questPrerequisites.create({
      data: {
        questZoneId: data.questZoneId,
        questId: data.questId,
        prerequisiteQuestZoneId: data.prerequisiteQuestZoneId,
        prerequisiteQuestId: data.prerequisiteQuestId,
      },
      include: { prerequisiteQuest: true },
    });
  }

  async deletePrerequisite(id: number) {
    return this.database.questPrerequisites.delete({ where: { id } });
  }

  // ============================================================================
  // Character Quest Progress
  // ============================================================================

  async findCharacterQuests(characterId: string) {
    return this.database.characterQuests.findMany({
      where: { characterId },
      include: {
        quest: {
          include: {
            phases: {
              orderBy: { order: 'asc' },
              include: {
                objectives: {
                  orderBy: { id: 'asc' },
                },
              },
            },
          },
        },
        objectiveProgress: true,
      },
    });
  }

  async findCharacterQuest(
    characterId: string,
    questZoneId: number,
    questId: number
  ) {
    return this.database.characterQuests.findFirst({
      where: { characterId, questZoneId, questId },
      include: {
        quest: {
          include: {
            phases: {
              orderBy: { order: 'asc' },
              include: {
                objectives: {
                  orderBy: { id: 'asc' },
                },
                rewards: true,
              },
            },
          },
        },
        objectiveProgress: true,
      },
    });
  }

  async getAvailableQuests(characterId: string, level: number) {
    // Find quests that:
    // 1. Are not hidden
    // 2. Character hasn't completed (or is repeatable)
    // 3. Character meets level requirements
    // 4. All prerequisites are met

    const completedQuests = await this.database.characterQuests.findMany({
      where: {
        characterId,
        status: 'COMPLETED',
      },
      select: { questZoneId: true, questId: true },
    });

    const completedSet = new Set(
      completedQuests.map(q => `${q.questZoneId}:${q.questId}`)
    );

    const allQuests = await this.database.quests.findMany({
      where: {
        hidden: false,
        minLevel: { lte: level },
        maxLevel: { gte: level },
      },
      include: {
        prerequisites: true,
      },
    });

    // Filter based on prerequisites and completion status
    return allQuests.filter(quest => {
      const key = `${quest.zoneId}:${quest.id}`;

      // Check if already completed and not repeatable
      if (completedSet.has(key) && !quest.repeatable) {
        return false;
      }

      // Check prerequisites
      if (quest.prerequisites.length > 0) {
        const allPrereqsMet = quest.prerequisites.every(prereq =>
          completedSet.has(
            `${prereq.prerequisiteQuestZoneId}:${prereq.prerequisiteQuestId}`
          )
        );
        if (!allPrereqsMet) return false;
      }

      return true;
    });
  }
}
