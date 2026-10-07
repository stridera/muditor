import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { DialogueTreeService } from './dialogue-tree.service';

describe('DialogueTreeService', () => {
  let service: DialogueTreeService;
  const tx = {
    dialogueTrees: { create: jest.fn(), delete: jest.fn() },
    dialogueNodes: { updateMany: jest.fn(), update: jest.fn() },
    questDialogue: { update: jest.fn(), updateMany: jest.fn() },
  };
  const db = {
    dialogueTrees: { findUnique: jest.fn() },
    dialogueNodes: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    dialogueResponses: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    questDialogue: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    db.$transaction.mockImplementation(async (fn: (t: typeof tx) => unknown) =>
      fn(tx)
    );
    const module = await Test.createTestingModule({
      providers: [
        DialogueTreeService,
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();
    service = module.get(DialogueTreeService);
  });

  describe('createTreeForQuestDialogue', () => {
    it('creates a tree with a root node carrying the dialogue message and links it', async () => {
      db.questDialogue.findUnique.mockResolvedValue({
        id: 3,
        npcMessage: 'Greetings, traveller.',
        dialogueTreeId: null,
      });
      tx.dialogueTrees.create.mockResolvedValue({ id: 11 });
      db.dialogueTrees.findUnique.mockResolvedValue({ id: 11, nodes: [] });

      await service.createTreeForQuestDialogue(3, 'Mayor talk');

      expect(tx.dialogueTrees.create.mock.calls[0][0].data).toMatchObject({
        name: 'Mayor talk',
        nodes: {
          create: { npcMessage: 'Greetings, traveller.', isRoot: true },
        },
      });
      expect(tx.questDialogue.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { dialogueTreeId: 11 },
      });
    });

    it('refuses a dialogue that already has a tree', async () => {
      db.questDialogue.findUnique.mockResolvedValue({
        id: 3,
        npcMessage: 'x',
        dialogueTreeId: 9,
      });
      await expect(
        service.createTreeForQuestDialogue(3, 'Again')
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('nodes', () => {
    it('makes the first node of an empty tree the root', async () => {
      db.dialogueNodes.findFirst.mockResolvedValue(null);
      db.dialogueNodes.count.mockResolvedValue(0);
      await service.createNode(1, { npcMessage: 'Hello' });
      expect(db.dialogueNodes.create.mock.calls[0][0].data).toMatchObject({
        isRoot: true,
        order: 0,
      });
    });

    it('does not steal the root when one exists', async () => {
      db.dialogueNodes.findFirst.mockResolvedValue({ order: 2 });
      db.dialogueNodes.count.mockResolvedValue(1);
      await service.createNode(1, { npcMessage: 'More' });
      expect(db.dialogueNodes.create.mock.calls[0][0].data).toMatchObject({
        isRoot: false,
        order: 3,
      });
    });

    it('demotes the old root when another node becomes root', async () => {
      db.dialogueNodes.findUnique.mockResolvedValue({
        id: 8,
        dialogueTreeId: 1,
        isRoot: false,
      });
      await service.updateNode(8, { isRoot: true });
      expect(tx.dialogueNodes.updateMany).toHaveBeenCalledWith({
        where: { dialogueTreeId: 1, isRoot: true },
        data: { isRoot: false },
      });
      expect(tx.dialogueNodes.update.mock.calls[0][0].data.isRoot).toBe(true);
    });

    it('refuses to un-root the root and to delete it', async () => {
      db.dialogueNodes.findUnique.mockResolvedValue({
        id: 8,
        dialogueTreeId: 1,
        isRoot: true,
      });
      await expect(
        service.updateNode(8, { isRoot: false })
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.deleteNode(8)).rejects.toBeInstanceOf(
        BadRequestException
      );
      expect(db.dialogueNodes.delete).not.toHaveBeenCalled();
    });
  });

  describe('responses', () => {
    it('trims keywords and appends after the last response', async () => {
      db.dialogueNodes.findUnique.mockResolvedValue({
        id: 8,
        dialogueTreeId: 1,
      });
      db.dialogueResponses.findFirst.mockResolvedValue({ order: 1 });
      await service.createResponse(8, {
        matchKeywords: [' yes ', '', 'sure'],
      });
      expect(db.dialogueResponses.create.mock.calls[0][0].data).toMatchObject({
        matchType: 'CONTAINS',
        matchKeywords: ['yes', 'sure'],
        order: 2,
      });
    });

    it('refuses ANY_RESPONSE (the game never matches it) and empty keywords', async () => {
      db.dialogueNodes.findUnique.mockResolvedValue({
        id: 8,
        dialogueTreeId: 1,
      });
      await expect(
        service.createResponse(8, {
          matchType: 'ANY_RESPONSE' as never,
          matchKeywords: ['x'],
        })
      ).rejects.toThrow(/ANY_RESPONSE/);
      await expect(
        service.createResponse(8, { matchKeywords: ['  '] })
      ).rejects.toThrow(/keyword/);
      expect(db.dialogueResponses.create).not.toHaveBeenCalled();
    });

    it('only allows a next node from the same tree', async () => {
      db.dialogueNodes.findUnique
        .mockResolvedValueOnce({ id: 8, dialogueTreeId: 1 })
        .mockResolvedValueOnce({ dialogueTreeId: 2 });
      await expect(
        service.createResponse(8, { matchKeywords: ['yes'], nextNodeId: 99 })
      ).rejects.toThrow(/same tree/);
      expect(db.dialogueResponses.create).not.toHaveBeenCalled();
    });

    it('validates an update against the existing match type', async () => {
      db.dialogueResponses.findUnique.mockResolvedValue({
        id: 4,
        matchType: 'CONTAINS',
        matchKeywords: ['yes'],
        node: { dialogueTreeId: 1 },
      });
      await expect(
        service.updateResponse(4, { matchKeywords: [] })
      ).rejects.toThrow(/keyword/);
    });
  });
});
