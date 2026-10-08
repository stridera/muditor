import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@muditor/db';
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
        shortDescription: data.shortDescription ?? null,
        minLevel: data.minLevel ?? 1,
        maxLevel: data.maxLevel ?? 100,
        repeatable: data.repeatable ?? false,
        hidden: data.hidden ?? false,
        autoAccept: data.autoAccept ?? false,
        shareable: data.shareable ?? true,
        cooldownMinutes: data.cooldownMinutes ?? null,
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
    if (data.shortDescription !== undefined)
      updateData.shortDescription = data.shortDescription;
    if (data.minLevel !== undefined) updateData.minLevel = data.minLevel;
    if (data.maxLevel !== undefined) updateData.maxLevel = data.maxLevel;
    if (data.repeatable !== undefined) updateData.repeatable = data.repeatable;
    if (data.hidden !== undefined) updateData.hidden = data.hidden;
    if (data.autoAccept !== undefined) updateData.autoAccept = data.autoAccept;
    if (data.shareable !== undefined) updateData.shareable = data.shareable;
    if (data.cooldownMinutes !== undefined)
      updateData.cooldownMinutes = data.cooldownMinutes;
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

  /**
   * Persist a new phase order. `phaseIds` must list every phase of the quest
   * exactly once; each phase's `order` becomes its index in the list. All rows
   * are written in one transaction so a failure never leaves a half-reordered
   * quest.
   */
  async reorderPhases(
    questZoneId: number,
    questId: number,
    phaseIds: number[]
  ) {
    const existing = await this.database.questPhases.findMany({
      where: { questZoneId, questId },
      select: { id: true },
    });
    const existingIds = existing.map(p => p.id).sort((a, b) => a - b);
    const requested = [...phaseIds].sort((a, b) => a - b);
    if (
      existingIds.length !== requested.length ||
      existingIds.some((id, i) => id !== requested[i])
    ) {
      throw new BadRequestException(
        'phaseIds must list every phase of the quest exactly once'
      );
    }

    await this.database.$transaction(async tx => {
      for (const [index, id] of phaseIds.entries()) {
        await tx.questPhases.update({
          where: { questZoneId_questId_id: { questZoneId, questId, id } },
          data: { order: index },
        });
      }
    });

    return this.database.questPhases.findMany({
      where: { questZoneId, questId },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: { objectives: { orderBy: { id: 'asc' } }, rewards: true },
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
        scope: data.scope ?? 'SOLO',
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
    if (data.scope !== undefined) updateData.scope = data.scope;
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
    if (data.dialogueTreeId != null) {
      await this.assertTreeLinkable(data.dialogueTreeId, data.questZoneId);
    }
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
    const existing =
      data.dialogueTreeId !== undefined
        ? await this.database.questDialogue.findUnique({
            where: { id },
            select: { questZoneId: true, dialogueTreeId: true },
          })
        : null;
    if (data.dialogueTreeId != null && existing) {
      await this.assertTreeLinkable(
        data.dialogueTreeId,
        existing.questZoneId,
        id
      );
    }
    const updateData: Record<string, unknown> = {};
    if (data.npcMessage !== undefined) updateData.npcMessage = data.npcMessage;
    if (data.matchType !== undefined) updateData.matchType = data.matchType;
    if (data.matchKeywords !== undefined)
      updateData.matchKeywords = data.matchKeywords;
    if (data.dialogueTreeId !== undefined)
      updateData.dialogueTreeId = data.dialogueTreeId;

    const updated = await this.database.questDialogue.update({
      where: { id },
      data: updateData,
    });
    // Re-linking or clearing the tree can leave the old one with no dialogue
    // at all; trees carry no zone of their own, so nobody could ever reach
    // (or clean up) it again. Drop it.
    const previousTree = existing?.dialogueTreeId ?? null;
    if (
      previousTree != null &&
      previousTree !== (data.dialogueTreeId ?? null)
    ) {
      await this.deleteTreeIfUnused(previousTree);
    }
    return updated;
  }

  async deleteDialogue(id: number) {
    const deleted = await this.database.questDialogue.delete({ where: { id } });
    // A tree only exists to serve its dialogue rows; drop it with the last one.
    if (deleted.dialogueTreeId != null) {
      await this.deleteTreeIfUnused(deleted.dialogueTreeId);
    }
    return deleted;
  }

  /** Delete a dialogue tree once no quest dialogue links to it any more. */
  private async deleteTreeIfUnused(treeId: number) {
    const remaining = await this.database.questDialogue.count({
      where: { dialogueTreeId: treeId },
    });
    if (remaining === 0) {
      await this.database.dialogueTrees.deleteMany({ where: { id: treeId } });
    }
  }

  /**
   * Dialogue trees carry no zone of their own; write access to a tree is
   * derived from the quest dialogues that use it. Refuse links that would make
   * one tree span zones, otherwise a builder could edit another zone's tree.
   */
  private async assertTreeLinkable(
    treeId: number,
    questZoneId: number,
    exceptDialogueId?: number
  ) {
    const tree = await this.database.dialogueTrees.findUnique({
      where: { id: treeId },
      select: { id: true },
    });
    if (!tree) {
      throw new BadRequestException(`Dialogue tree ${treeId} does not exist`);
    }
    const links = await this.database.questDialogue.findMany({
      where: {
        dialogueTreeId: treeId,
        ...(exceptDialogueId !== undefined && {
          id: { not: exceptDialogueId },
        }),
      },
      select: { questZoneId: true },
    });
    if (links.some(l => l.questZoneId !== questZoneId)) {
      throw new BadRequestException(
        `Dialogue tree ${treeId} is used by a quest in another zone`
      );
    }
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
        quantity: data.quantity ?? 1,
        condition: data.condition ?? null,
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
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.condition !== undefined) updateData.condition = data.condition;

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
    if (
      data.questZoneId === data.prerequisiteQuestZoneId &&
      data.questId === data.prerequisiteQuestId
    ) {
      throw new BadRequestException('A quest cannot be its own prerequisite');
    }
    // The loop check and the insert must be one atomic decision: with two
    // concurrent requests (A needs B, B needs A) each could pass the check
    // before the other's row exists. Serializable isolation makes one of
    // them fail with a serialization error (P2034); retrying it re-runs the
    // check against the winner's row and rejects it as a loop.
    const attempts = 4;
    for (let attempt = 1; ; attempt++) {
      try {
        return await this.database.$transaction(
          async tx => {
            if (await this.prerequisiteWouldCycle(tx, data)) {
              throw new BadRequestException(
                'That prerequisite would create a loop: the other quest already requires this one'
              );
            }
            return tx.questPrerequisites.create({
              data: {
                questZoneId: data.questZoneId,
                questId: data.questId,
                prerequisiteQuestZoneId: data.prerequisiteQuestZoneId,
                prerequisiteQuestId: data.prerequisiteQuestId,
              },
              include: { prerequisiteQuest: true },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
        );
      } catch (error) {
        const serializationFailure =
          typeof error === 'object' &&
          error !== null &&
          (error as { code?: string }).code === 'P2034';
        if (!serializationFailure || attempt >= attempts) throw error;
      }
    }
  }

  /**
   * True when `prerequisiteQuest` (directly or through its own prerequisites)
   * already requires `quest`, i.e. adding the edge would make the chain
   * impossible to start.
   */
  private async prerequisiteWouldCycle(
    db: Pick<Prisma.TransactionClient, 'questPrerequisites'>,
    data: CreateQuestPrerequisiteInput
  ): Promise<boolean> {
    const target = `${data.questZoneId}:${data.questId}`;
    const seen = new Set<string>();
    let frontier = [
      { zoneId: data.prerequisiteQuestZoneId, id: data.prerequisiteQuestId },
    ];
    while (frontier.length > 0) {
      const next: { zoneId: number; id: number }[] = [];
      for (const q of frontier) {
        const key = `${q.zoneId}:${q.id}`;
        if (key === target) return true;
        if (seen.has(key)) continue;
        seen.add(key);
        const rows = await db.questPrerequisites.findMany({
          where: { questZoneId: q.zoneId, questId: q.id },
          select: {
            prerequisiteQuestZoneId: true,
            prerequisiteQuestId: true,
          },
        });
        for (const r of rows) {
          next.push({
            zoneId: r.prerequisiteQuestZoneId,
            id: r.prerequisiteQuestId,
          });
        }
      }
      frontier = next;
    }
    return false;
  }

  async deletePrerequisite(id: number) {
    return this.database.questPrerequisites.delete({ where: { id } });
  }

  // ============================================================================
  // Character Quest Progress
  // ============================================================================

  /** Owning user id of a character (null if unlinked); NotFound when the character is missing. */
  async findCharacterOwnerId(characterId: string): Promise<string | null> {
    const character = await this.database.characters.findUnique({
      where: { id: characterId },
      select: { userId: true },
    });
    if (!character) {
      throw new NotFoundException(`Character ${characterId} not found`);
    }
    return character.userId ?? null;
  }

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
