import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { QuestsService } from './quests.service';

describe('QuestsService', () => {
  let service: QuestsService;
  const db = {
    quests: { create: jest.fn(), update: jest.fn() },
    questPhases: { findMany: jest.fn() },
    questObjectives: { create: jest.fn(), update: jest.fn() },
    questRewards: { create: jest.fn(), update: jest.fn() },
    questPrerequisites: { findMany: jest.fn(), create: jest.fn() },
    questDialogue: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    dialogueTrees: { findUnique: jest.fn(), deleteMany: jest.fn() },
    $transaction: jest.fn(),
  };
  const tx = {
    questPhases: { update: jest.fn() },
    questPrerequisites: db.questPrerequisites,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    db.$transaction.mockImplementation(async (fn: (t: typeof tx) => unknown) =>
      fn(tx)
    );
    const module = await Test.createTestingModule({
      providers: [QuestsService, { provide: DatabaseService, useValue: db }],
    }).compile();
    service = module.get(QuestsService);
  });

  describe('quest fields', () => {
    it('creates a quest with the new quest-level fields', async () => {
      await service.createQuest({
        zoneId: 30,
        id: 5,
        name: 'Rats',
        shortDescription: 'Kill rats',
        autoAccept: true,
        shareable: false,
        cooldownMinutes: 60,
      });
      expect(db.quests.create.mock.calls[0][0].data).toMatchObject({
        shortDescription: 'Kill rats',
        autoAccept: true,
        shareable: false,
        cooldownMinutes: 60,
      });
    });

    it('defaults autoAccept off, shareable on, no cooldown', async () => {
      await service.createQuest({ zoneId: 30, id: 5, name: 'Rats' });
      expect(db.quests.create.mock.calls[0][0].data).toMatchObject({
        shortDescription: null,
        autoAccept: false,
        shareable: true,
        cooldownMinutes: null,
      });
    });

    it('updates only the fields that were sent, and can clear the cooldown', async () => {
      await service.updateQuest(30, 5, { cooldownMinutes: null as never });
      expect(db.quests.update.mock.calls[0][0].data).toEqual({
        cooldownMinutes: null,
      });
    });

    it('stores objective scope and reward quantity/condition', async () => {
      await service.createObjective({
        questZoneId: 30,
        questId: 5,
        phaseId: 1,
        id: 1,
        objectiveType: 'KILL_MOB',
        scope: 'PARTY',
        playerDescription: 'Kill',
      } as never);
      expect(db.questObjectives.create.mock.calls[0][0].data.scope).toBe(
        'PARTY'
      );

      await service.createReward({
        questZoneId: 30,
        questId: 5,
        phaseId: 1,
        rewardType: 'ITEM',
        objectZoneId: 30,
        objectId: 2,
        quantity: 3,
        condition: "actor.class == 'paladin'",
      } as never);
      expect(db.questRewards.create.mock.calls[0][0].data).toMatchObject({
        quantity: 3,
        condition: "actor.class == 'paladin'",
      });

      await service.updateReward(9, { quantity: 2, condition: '' });
      expect(db.questRewards.update.mock.calls[0][0].data).toEqual({
        quantity: 2,
        condition: '',
      });
    });
  });

  describe('reorderPhases', () => {
    it('writes each phase order as its index inside one transaction', async () => {
      db.questPhases.findMany.mockResolvedValueOnce([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);
      db.questPhases.findMany.mockResolvedValueOnce([]);
      await service.reorderPhases(30, 5, [3, 1, 2]);

      expect(db.$transaction).toHaveBeenCalledTimes(1);
      expect(tx.questPhases.update.mock.calls.map(c => c[0])).toEqual([
        {
          where: {
            questZoneId_questId_id: { questZoneId: 30, questId: 5, id: 3 },
          },
          data: { order: 0 },
        },
        {
          where: {
            questZoneId_questId_id: { questZoneId: 30, questId: 5, id: 1 },
          },
          data: { order: 1 },
        },
        {
          where: {
            questZoneId_questId_id: { questZoneId: 30, questId: 5, id: 2 },
          },
          data: { order: 2 },
        },
      ]);
    });

    it.each([
      ['a missing phase', [1, 2]],
      ['an unknown phase', [1, 2, 9]],
      ['a duplicate', [1, 1, 2]],
    ])('rejects %s', async (_label, ids) => {
      db.questPhases.findMany.mockResolvedValueOnce([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);
      await expect(service.reorderPhases(30, 5, ids)).rejects.toBeInstanceOf(
        BadRequestException
      );
      expect(db.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('prerequisites', () => {
    const base = { questZoneId: 30, questId: 5 };

    it('refuses a quest as its own prerequisite', async () => {
      await expect(
        service.createPrerequisite({
          ...base,
          prerequisiteQuestZoneId: 30,
          prerequisiteQuestId: 5,
        })
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(db.questPrerequisites.create).not.toHaveBeenCalled();
    });

    it('refuses a prerequisite that already depends on this quest (loop)', async () => {
      // 30:6 requires 30:7, which requires 30:5.
      db.questPrerequisites.findMany.mockImplementation(
        async ({ where }: { where: { questId: number } }) => {
          if (where.questId === 6)
            return [{ prerequisiteQuestZoneId: 30, prerequisiteQuestId: 7 }];
          if (where.questId === 7)
            return [{ prerequisiteQuestZoneId: 30, prerequisiteQuestId: 5 }];
          return [];
        }
      );
      await expect(
        service.createPrerequisite({
          ...base,
          prerequisiteQuestZoneId: 30,
          prerequisiteQuestId: 6,
        })
      ).rejects.toThrow(/loop/);
      expect(db.questPrerequisites.create).not.toHaveBeenCalled();
    });

    it('decides loop-or-insert in one SERIALIZABLE transaction', async () => {
      db.questPrerequisites.findMany.mockResolvedValue([]);
      await service.createPrerequisite({
        ...base,
        prerequisiteQuestZoneId: 31,
        prerequisiteQuestId: 1,
      });
      expect(db.$transaction).toHaveBeenCalledTimes(1);
      expect(db.$transaction.mock.calls[0][1]).toEqual({
        isolationLevel: 'Serializable',
      });
    });

    it('re-checks after a serialization failure, so concurrent A->B / B->A cannot both win', async () => {
      // Request A: 30:5 requires 30:6. Concurrently B (30:6 requires 30:5)
      // committed first. Postgres aborts A with P2034; the retry now sees
      // B's row and refuses the loop.
      let committed = false;
      db.$transaction
        .mockImplementationOnce(async () => {
          committed = true;
          throw Object.assign(new Error('could not serialize access'), {
            code: 'P2034',
          });
        })
        .mockImplementation(async (fn: (t: typeof tx) => unknown) => fn(tx));
      db.questPrerequisites.findMany.mockImplementation(
        async ({ where }: { where: { questId: number } }) =>
          committed && where.questId === 6
            ? [{ prerequisiteQuestZoneId: 30, prerequisiteQuestId: 5 }]
            : []
      );
      await expect(
        service.createPrerequisite({
          ...base,
          prerequisiteQuestZoneId: 30,
          prerequisiteQuestId: 6,
        })
      ).rejects.toThrow(/loop/);
      expect(db.$transaction).toHaveBeenCalledTimes(2);
      expect(db.questPrerequisites.create).not.toHaveBeenCalled();
    });

    it('gives up on a serialization failure that keeps happening', async () => {
      db.$transaction.mockImplementation(async () => {
        throw Object.assign(new Error('could not serialize access'), {
          code: 'P2034',
        });
      });
      await expect(
        service.createPrerequisite({
          ...base,
          prerequisiteQuestZoneId: 31,
          prerequisiteQuestId: 1,
        })
      ).rejects.toThrow(/serialize/);
      expect(db.$transaction).toHaveBeenCalledTimes(4);
    });

    it('creates an acyclic prerequisite', async () => {
      db.questPrerequisites.findMany.mockResolvedValue([]);
      await service.createPrerequisite({
        ...base,
        prerequisiteQuestZoneId: 31,
        prerequisiteQuestId: 1,
      });
      expect(db.questPrerequisites.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('dialogue tree links', () => {
    it('refuses to link a tree that another zone already uses', async () => {
      db.dialogueTrees.findUnique.mockResolvedValue({ id: 4 });
      db.questDialogue.findMany.mockResolvedValue([{ questZoneId: 31 }]);
      await expect(
        service.createDialogue({
          questZoneId: 30,
          questId: 5,
          phaseId: 1,
          objectiveId: 1,
          npcMessage: 'Hi',
          dialogueTreeId: 4,
        })
      ).rejects.toThrow(/another zone/);
      expect(db.questDialogue.create).not.toHaveBeenCalled();
    });

    it('refuses to link a tree that does not exist', async () => {
      db.dialogueTrees.findUnique.mockResolvedValue(null);
      await expect(
        service.createDialogue({
          questZoneId: 30,
          questId: 5,
          phaseId: 1,
          objectiveId: 1,
          npcMessage: 'Hi',
          dialogueTreeId: 4,
        })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('deletes the tree together with its last dialogue', async () => {
      db.questDialogue.delete.mockResolvedValue({ id: 1, dialogueTreeId: 4 });
      db.questDialogue.count.mockResolvedValue(0);
      await service.deleteDialogue(1);
      expect(db.dialogueTrees.deleteMany).toHaveBeenCalledWith({
        where: { id: 4 },
      });
    });

    it('drops the old tree when a dialogue is re-linked and nothing else uses it', async () => {
      db.questDialogue.findUnique.mockResolvedValue({
        questZoneId: 30,
        dialogueTreeId: 4,
      });
      db.dialogueTrees.findUnique.mockResolvedValue({ id: 9 });
      db.questDialogue.findMany.mockResolvedValue([]);
      db.questDialogue.update.mockResolvedValue({ id: 1, dialogueTreeId: 9 });
      db.questDialogue.count.mockResolvedValue(0);
      await service.updateDialogue(1, { dialogueTreeId: 9 });
      expect(db.questDialogue.count).toHaveBeenCalledWith({
        where: { dialogueTreeId: 4 },
      });
      expect(db.dialogueTrees.deleteMany).toHaveBeenCalledWith({
        where: { id: 4 },
      });
    });

    it('drops the old tree when the link is cleared', async () => {
      db.questDialogue.findUnique.mockResolvedValue({
        questZoneId: 30,
        dialogueTreeId: 4,
      });
      db.questDialogue.update.mockResolvedValue({
        id: 1,
        dialogueTreeId: null,
      });
      db.questDialogue.count.mockResolvedValue(0);
      await service.updateDialogue(1, { dialogueTreeId: null as never });
      expect(db.dialogueTrees.deleteMany).toHaveBeenCalledWith({
        where: { id: 4 },
      });
    });

    it('keeps the old tree when another dialogue still uses it', async () => {
      db.questDialogue.findUnique.mockResolvedValue({
        questZoneId: 30,
        dialogueTreeId: 4,
      });
      db.questDialogue.update.mockResolvedValue({
        id: 1,
        dialogueTreeId: null,
      });
      db.questDialogue.count.mockResolvedValue(1);
      await service.updateDialogue(1, { dialogueTreeId: null as never });
      expect(db.dialogueTrees.deleteMany).not.toHaveBeenCalled();
    });

    it('leaves the tree alone when the link is unchanged or not touched', async () => {
      db.questDialogue.findUnique.mockResolvedValue({
        questZoneId: 30,
        dialogueTreeId: 4,
      });
      db.dialogueTrees.findUnique.mockResolvedValue({ id: 4 });
      db.questDialogue.findMany.mockResolvedValue([]);
      db.questDialogue.update.mockResolvedValue({ id: 1, dialogueTreeId: 4 });
      await service.updateDialogue(1, { dialogueTreeId: 4 });
      await service.updateDialogue(1, { npcMessage: 'Hello' });
      expect(db.questDialogue.count).not.toHaveBeenCalled();
      expect(db.dialogueTrees.deleteMany).not.toHaveBeenCalled();
    });

    it('keeps a tree that other dialogues still use', async () => {
      db.questDialogue.delete.mockResolvedValue({ id: 1, dialogueTreeId: 4 });
      db.questDialogue.count.mockResolvedValue(1);
      await service.deleteDialogue(1);
      expect(db.dialogueTrees.deleteMany).not.toHaveBeenCalled();
    });
  });
});
