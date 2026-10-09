import { BadRequestException, Injectable } from '@nestjs/common';
import { DialogueMatchType } from '@muditor/db';
import { DatabaseService } from '../database/database.service';
import {
  CreateDialogueNodeInput,
  CreateDialogueResponseInput,
  UpdateDialogueNodeInput,
  UpdateDialogueResponseInput,
  UpdateDialogueTreeInput,
} from './dialogue-tree.dto';

const TREE_INCLUDE = {
  nodes: {
    orderBy: [{ order: 'asc' as const }, { id: 'asc' as const }],
    include: {
      responses: {
        orderBy: [{ order: 'asc' as const }, { id: 'asc' as const }],
      },
    },
  },
};

/**
 * The game matches a player's reply against a response with
 * EXACT / CONTAINS / STARTS_WITH / ANY_OF / REGEX only. ANY_RESPONSE would
 * silently never match, so it is refused for tree responses.
 */
function assertUsableMatch(
  matchType: DialogueMatchType,
  matchKeywords: string[]
) {
  if (matchType === DialogueMatchType.ANY_RESPONSE) {
    throw new BadRequestException(
      'ANY_RESPONSE is not supported by the game for dialogue responses; use CONTAINS, EXACT, STARTS_WITH, ANY_OF or REGEX'
    );
  }
  if (matchKeywords.every(k => k.trim().length === 0)) {
    throw new BadRequestException(
      'A response needs at least one non-empty keyword'
    );
  }
}

function cleanKeywords(keywords: string[]): string[] {
  return keywords.map(k => k.trim()).filter(k => k.length > 0);
}

@Injectable()
export class DialogueTreeService {
  constructor(private readonly database: DatabaseService) {}

  // ==========================================================================
  // Trees
  // ==========================================================================

  /**
   * Trees have no zone of their own: visible to the public only when every
   * quest dialogue using them lives in a non-god zone (unused trees are
   * builder work-in-progress and stay hidden).
   */
  async isTreeInVisibleZone(id: number): Promise<boolean> {
    const links = await this.database.questDialogue.findMany({
      where: { dialogueTreeId: id },
      select: { questZoneId: true },
    });
    if (links.length === 0) return false;
    const godZones = await this.database.zones.count({
      where: {
        id: { in: [...new Set(links.map(l => l.questZoneId))] },
        isGodZone: true,
      },
    });
    return godZones === 0;
  }

  async findTree(id: number) {
    return this.database.dialogueTrees.findUnique({
      where: { id },
      include: TREE_INCLUDE,
    });
  }

  /**
   * Create a tree for a quest dialogue and link it. The tree starts with one
   * root node carrying the dialogue's own NPC message, so the conversation
   * keeps opening with the same line.
   */
  async createTreeForQuestDialogue(
    questDialogueId: number,
    name: string,
    createdBy?: string
  ) {
    const dialogue = await this.database.questDialogue.findUnique({
      where: { id: questDialogueId },
    });
    if (!dialogue) {
      throw new BadRequestException(
        `Quest dialogue ${questDialogueId} does not exist`
      );
    }
    if (dialogue.dialogueTreeId != null) {
      throw new BadRequestException('This dialogue already has a tree');
    }

    const treeId = await this.database.$transaction(async tx => {
      const tree = await tx.dialogueTrees.create({
        data: {
          name,
          createdBy: createdBy ?? null,
          nodes: {
            create: {
              npcMessage: dialogue.npcMessage,
              order: 0,
              isRoot: true,
              isTerminal: false,
            },
          },
        },
      });
      await tx.questDialogue.update({
        where: { id: questDialogueId },
        data: { dialogueTreeId: tree.id },
      });
      return tree.id;
    });
    return this.findTree(treeId);
  }

  async updateTree(id: number, data: UpdateDialogueTreeInput) {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    return this.database.dialogueTrees.update({
      where: { id },
      data: updateData,
      include: TREE_INCLUDE,
    });
  }

  /** Unlinks the tree from its quest dialogues, then deletes it. */
  async deleteTree(id: number) {
    const tree = await this.findTree(id);
    if (!tree) throw new BadRequestException(`Dialogue tree ${id} not found`);
    await this.database.$transaction(async tx => {
      await tx.questDialogue.updateMany({
        where: { dialogueTreeId: id },
        data: { dialogueTreeId: null },
      });
      await tx.dialogueTrees.delete({ where: { id } });
    });
    return tree;
  }

  // ==========================================================================
  // Nodes
  // ==========================================================================

  async createNode(treeId: number, data: CreateDialogueNodeInput) {
    const last = await this.database.dialogueNodes.findFirst({
      where: { dialogueTreeId: treeId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    const hasRoot =
      (await this.database.dialogueNodes.count({
        where: { dialogueTreeId: treeId, isRoot: true },
      })) > 0;
    return this.database.dialogueNodes.create({
      data: {
        dialogueTreeId: treeId,
        npcMessage: data.npcMessage,
        order: (last?.order ?? -1) + 1,
        isRoot: !hasRoot,
        isTerminal: data.isTerminal ?? false,
      },
      include: { responses: true },
    });
  }

  async updateNode(id: number, data: UpdateDialogueNodeInput) {
    const node = await this.database.dialogueNodes.findUnique({
      where: { id },
    });
    if (!node) throw new BadRequestException(`Dialogue node ${id} not found`);

    if (data.isRoot === false && node.isRoot) {
      throw new BadRequestException(
        'A tree needs a root node: make another node the root instead'
      );
    }

    const updateData: Record<string, unknown> = {};
    if (data.npcMessage !== undefined) updateData.npcMessage = data.npcMessage;
    if (data.isTerminal !== undefined) updateData.isTerminal = data.isTerminal;
    if (data.order !== undefined) updateData.order = data.order;

    if (data.isRoot === true && !node.isRoot) {
      return this.database.$transaction(async tx => {
        await tx.dialogueNodes.updateMany({
          where: { dialogueTreeId: node.dialogueTreeId, isRoot: true },
          data: { isRoot: false },
        });
        return tx.dialogueNodes.update({
          where: { id },
          data: { ...updateData, isRoot: true },
          include: { responses: true },
        });
      });
    }

    return this.database.dialogueNodes.update({
      where: { id },
      data: updateData,
      include: { responses: true },
    });
  }

  async deleteNode(id: number) {
    const node = await this.database.dialogueNodes.findUnique({
      where: { id },
    });
    if (!node) throw new BadRequestException(`Dialogue node ${id} not found`);
    if (node.isRoot) {
      throw new BadRequestException(
        'The root node cannot be deleted: make another node the root first'
      );
    }
    // Responses that led here lose their target (FK is ON DELETE SET NULL).
    return this.database.dialogueNodes.delete({
      where: { id },
      include: { responses: true },
    });
  }

  // ==========================================================================
  // Responses
  // ==========================================================================

  async createResponse(nodeId: number, data: CreateDialogueResponseInput) {
    const node = await this.database.dialogueNodes.findUnique({
      where: { id: nodeId },
    });
    if (!node)
      throw new BadRequestException(`Dialogue node ${nodeId} not found`);

    const matchType = data.matchType ?? DialogueMatchType.CONTAINS;
    const keywords = cleanKeywords(data.matchKeywords);
    assertUsableMatch(matchType, keywords);
    if (data.nextNodeId != null) {
      await this.assertSameTree(node.dialogueTreeId, data.nextNodeId);
    }

    const last = await this.database.dialogueResponses.findFirst({
      where: { nodeId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    return this.database.dialogueResponses.create({
      data: {
        nodeId,
        nextNodeId: data.nextNodeId ?? null,
        matchType,
        matchKeywords: keywords,
        displayHint: data.displayHint ?? null,
        order: (last?.order ?? -1) + 1,
      },
    });
  }

  async updateResponse(id: number, data: UpdateDialogueResponseInput) {
    const response = await this.database.dialogueResponses.findUnique({
      where: { id },
      include: { node: { select: { dialogueTreeId: true } } },
    });
    if (!response)
      throw new BadRequestException(`Dialogue response ${id} not found`);

    const matchType = data.matchType ?? response.matchType;
    const keywords =
      data.matchKeywords !== undefined
        ? cleanKeywords(data.matchKeywords)
        : response.matchKeywords;
    assertUsableMatch(matchType, keywords);
    if (data.nextNodeId != null) {
      await this.assertSameTree(response.node.dialogueTreeId, data.nextNodeId);
    }

    const updateData: Record<string, unknown> = {};
    if (data.matchType !== undefined) updateData.matchType = data.matchType;
    if (data.matchKeywords !== undefined) updateData.matchKeywords = keywords;
    if (data.nextNodeId !== undefined) updateData.nextNodeId = data.nextNodeId;
    if (data.displayHint !== undefined)
      updateData.displayHint = data.displayHint;
    if (data.order !== undefined) updateData.order = data.order;

    return this.database.dialogueResponses.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteResponse(id: number) {
    return this.database.dialogueResponses.delete({ where: { id } });
  }

  private async assertSameTree(treeId: number, nodeId: number) {
    const target = await this.database.dialogueNodes.findUnique({
      where: { id: nodeId },
      select: { dialogueTreeId: true },
    });
    if (!target || target.dialogueTreeId !== treeId) {
      throw new BadRequestException(
        'A response can only lead to a node of the same tree'
      );
    }
  }
}
