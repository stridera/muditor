import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { zoneLookups } from '../common/decorators/zone-lookups';
import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import {
  CreateDialogueNodeInput,
  CreateDialogueResponseInput,
  DialogueNodeDto,
  DialogueResponseDto,
  DialogueTreeDto,
  UpdateDialogueNodeInput,
  UpdateDialogueResponseInput,
  UpdateDialogueTreeInput,
} from './dialogue-tree.dto';
import { DialogueTreeService } from './dialogue-tree.service';

/**
 * Quest dialogue trees (NPC conversation graphs). Trees have no zone of their
 * own, so every mutation resolves its zone from the quest dialogue that uses
 * the tree (see zoneLookups.dialogueTree) and requires a WRITE grant there.
 */
@Resolver(() => DialogueTreeDto)
export class DialogueTreeResolver {
  constructor(private readonly trees: DialogueTreeService) {}

  @Query(() => DialogueTreeDto, { name: 'dialogueTree', nullable: true })
  async findDialogueTree(
    @Args('id', { type: () => Int }) id: number
  ): Promise<DialogueTreeDto | null> {
    return this.trees.findTree(id) as Promise<DialogueTreeDto | null>;
  }

  @Mutation(() => DialogueTreeDto, {
    description:
      'Create a tree (with a root node holding the dialogue message) and link it to a quest dialogue',
  })
  @RequireZoneWrite({ lookup: zoneLookups.questDialogue('questDialogueId') })
  async createQuestDialogueTree(
    @Args('questDialogueId', { type: () => Int }) questDialogueId: number,
    @Args('name') name: string
  ): Promise<DialogueTreeDto> {
    return this.trees.createTreeForQuestDialogue(
      questDialogueId,
      name
    ) as Promise<DialogueTreeDto>;
  }

  @Mutation(() => DialogueTreeDto)
  @RequireZoneWrite({ lookup: zoneLookups.dialogueTree('id') })
  async updateDialogueTree(
    @Args('id', { type: () => Int }) id: number,
    @Args('data', { type: () => UpdateDialogueTreeInput })
    data: UpdateDialogueTreeInput
  ): Promise<DialogueTreeDto> {
    return this.trees.updateTree(id, data) as Promise<DialogueTreeDto>;
  }

  @Mutation(() => DialogueTreeDto)
  @RequireZoneWrite({ lookup: zoneLookups.dialogueTree('id') })
  async deleteDialogueTree(
    @Args('id', { type: () => Int }) id: number
  ): Promise<DialogueTreeDto> {
    return this.trees.deleteTree(id) as Promise<DialogueTreeDto>;
  }

  @Mutation(() => DialogueNodeDto)
  @RequireZoneWrite({ lookup: zoneLookups.dialogueTree('treeId') })
  async createDialogueNode(
    @Args('treeId', { type: () => Int }) treeId: number,
    @Args('data', { type: () => CreateDialogueNodeInput })
    data: CreateDialogueNodeInput
  ): Promise<DialogueNodeDto> {
    return this.trees.createNode(treeId, data) as Promise<DialogueNodeDto>;
  }

  @Mutation(() => DialogueNodeDto)
  @RequireZoneWrite({ lookup: zoneLookups.dialogueNode('id') })
  async updateDialogueNode(
    @Args('id', { type: () => Int }) id: number,
    @Args('data', { type: () => UpdateDialogueNodeInput })
    data: UpdateDialogueNodeInput
  ): Promise<DialogueNodeDto> {
    return this.trees.updateNode(id, data) as Promise<DialogueNodeDto>;
  }

  @Mutation(() => DialogueNodeDto)
  @RequireZoneWrite({ lookup: zoneLookups.dialogueNode('id') })
  async deleteDialogueNode(
    @Args('id', { type: () => Int }) id: number
  ): Promise<DialogueNodeDto> {
    return this.trees.deleteNode(id) as Promise<DialogueNodeDto>;
  }

  @Mutation(() => DialogueResponseDto)
  @RequireZoneWrite({ lookup: zoneLookups.dialogueNode('nodeId') })
  async createDialogueResponse(
    @Args('nodeId', { type: () => Int }) nodeId: number,
    @Args('data', { type: () => CreateDialogueResponseInput })
    data: CreateDialogueResponseInput
  ): Promise<DialogueResponseDto> {
    return this.trees.createResponse(
      nodeId,
      data
    ) as Promise<DialogueResponseDto>;
  }

  @Mutation(() => DialogueResponseDto)
  @RequireZoneWrite({ lookup: zoneLookups.dialogueResponse('id') })
  async updateDialogueResponse(
    @Args('id', { type: () => Int }) id: number,
    @Args('data', { type: () => UpdateDialogueResponseInput })
    data: UpdateDialogueResponseInput
  ): Promise<DialogueResponseDto> {
    return this.trees.updateResponse(id, data) as Promise<DialogueResponseDto>;
  }

  @Mutation(() => DialogueResponseDto)
  @RequireZoneWrite({ lookup: zoneLookups.dialogueResponse('id') })
  async deleteDialogueResponse(
    @Args('id', { type: () => Int }) id: number
  ): Promise<DialogueResponseDto> {
    return this.trees.deleteResponse(id) as Promise<DialogueResponseDto>;
  }
}
