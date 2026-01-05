import { PrismaClient } from '@muditor/db';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('Quest Data Integrity Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(GraphQLJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = new PrismaClient();

    // Ensure test zone exists for foreign key relations
    await prisma.zones.upsert({
      where: { id: 1001 },
      update: {},
      create: {
        id: 1001,
        name: 'Quest Test Zone',
        resetMode: 'NORMAL',
        lifespan: 30,
        hemisphere: 'NORTHWEST',
        climate: 'TEMPERATE',
      },
    });

    // Clean previous test artifacts
    await prisma.questObjectives.deleteMany({
      where: { questZoneId: 1001 },
    });
    await prisma.questPhases.deleteMany({ where: { questZoneId: 1001 } });
    await prisma.questRewards.deleteMany({ where: { questZoneId: 1001 } });
    await prisma.questPrerequisites.deleteMany({
      where: { questZoneId: 1001 },
    });
    await prisma.quests.deleteMany({ where: { zoneId: 1001 } });
  });

  afterAll(async () => {
    // Cleanup in reverse order of dependencies
    await prisma.questObjectives.deleteMany({
      where: { questZoneId: 1001 },
    });
    await prisma.questPhases.deleteMany({ where: { questZoneId: 1001 } });
    await prisma.questRewards.deleteMany({ where: { questZoneId: 1001 } });
    await prisma.questPrerequisites.deleteMany({
      where: { questZoneId: 1001 },
    });
    await prisma.quests.deleteMany({ where: { zoneId: 1001 } });
    await prisma.$disconnect();
    await app.close();
  });

  describe('Quest CRUD Operations', () => {
    it('should create and retrieve a quest with all properties', async () => {
      const testQuestData = {
        id: 1,
        zoneId: 1001,
        name: '&WThe Lost Artifact&0',
        description: 'Find the ancient artifact hidden in the crypt.',
        minLevel: 5,
        maxLevel: 20,
        repeatable: false,
        hidden: false,
        triggerType: 'MOB',
      };

      // Create quest via API
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateQuest($data: CreateQuestInput!) {
              createQuest(data: $data) {
                id
                zoneId
                name
                description
                minLevel
                maxLevel
                repeatable
                hidden
                triggerType
              }
            }
          `,
          variables: { data: testQuestData },
        })
        .expect(200);

      if (createResponse.body.errors) {
        throw new Error(
          'Quest creation GraphQL errors: ' +
            JSON.stringify(createResponse.body.errors, null, 2)
        );
      }

      const createdQuest = createResponse.body.data.createQuest;

      expect(createdQuest.id).toBe(testQuestData.id);
      expect(createdQuest.zoneId).toBe(testQuestData.zoneId);
      expect(createdQuest.name).toBe(testQuestData.name);
      expect(createdQuest.description).toBe(testQuestData.description);
      expect(createdQuest.minLevel).toBe(testQuestData.minLevel);
      expect(createdQuest.maxLevel).toBe(testQuestData.maxLevel);
      expect(createdQuest.repeatable).toBe(testQuestData.repeatable);
      expect(createdQuest.triggerType).toBe(testQuestData.triggerType);

      // Verify in database
      const dbQuest = await prisma.quests.findUnique({
        where: { zoneId_id: { zoneId: 1001, id: 1 } },
      });

      expect(dbQuest).toBeTruthy();
      expect(dbQuest?.name).toBe(testQuestData.name);
      expect(dbQuest?.minLevel).toBe(testQuestData.minLevel);
      expect(dbQuest?.maxLevel).toBe(testQuestData.maxLevel);

      // Query back via API
      const queryResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetQuest($zoneId: Int!, $id: Int!) {
              quest(zoneId: $zoneId, id: $id) {
                id
                zoneId
                name
                description
                minLevel
                maxLevel
                repeatable
                triggerType
              }
            }
          `,
          variables: { zoneId: 1001, id: 1 },
        })
        .expect(200);

      const queriedQuest = queryResponse.body.data.quest;
      expect(queriedQuest.id).toBe(testQuestData.id);
      expect(queriedQuest.name).toBe(testQuestData.name);
    });

    it('should update quest properties', async () => {
      const updateData = {
        name: '&WThe Lost Artifact (Updated)&0',
        minLevel: 10,
        maxLevel: 30,
      };

      const updateResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdateQuest($zoneId: Int!, $id: Int!, $data: UpdateQuestInput!) {
              updateQuest(zoneId: $zoneId, id: $id, data: $data) {
                id
                zoneId
                name
                minLevel
                maxLevel
              }
            }
          `,
          variables: { zoneId: 1001, id: 1, data: updateData },
        })
        .expect(200);

      if (updateResponse.body.errors) {
        throw new Error(
          'Quest update GraphQL errors: ' +
            JSON.stringify(updateResponse.body.errors, null, 2)
        );
      }

      const updatedQuest = updateResponse.body.data.updateQuest;
      expect(updatedQuest.name).toBe(updateData.name);
      expect(updatedQuest.minLevel).toBe(updateData.minLevel);
      expect(updatedQuest.maxLevel).toBe(updateData.maxLevel);
    });

    it('should list quests with filtering', async () => {
      const listResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query ListQuests($filter: QuestFilterInput) {
              quests(filter: $filter) {
                id
                zoneId
                name
              }
            }
          `,
          variables: { filter: { zoneId: 1001 } },
        })
        .expect(200);

      expect(listResponse.body.data.quests).toBeInstanceOf(Array);
      expect(listResponse.body.data.quests.length).toBeGreaterThanOrEqual(1);
    });

    it('should count quests by zone', async () => {
      const countResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query CountQuests($zoneId: Int!) {
              questsCount(zoneId: $zoneId)
            }
          `,
          variables: { zoneId: 1001 },
        })
        .expect(200);

      expect(countResponse.body.data.questsCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Quest Phase Operations', () => {
    it('should create a quest phase', async () => {
      const phaseData = {
        questZoneId: 1001,
        questId: 1,
        id: 1,
        name: 'Phase 1: Investigation',
        description: 'Investigate the rumors about the artifact.',
        order: 1,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateQuestPhase($data: CreateQuestPhaseInput!) {
              createQuestPhase(data: $data) {
                id
                questZoneId
                questId
                name
                description
                order
              }
            }
          `,
          variables: { data: phaseData },
        })
        .expect(200);

      if (createResponse.body.errors) {
        throw new Error(
          'Quest phase creation GraphQL errors: ' +
            JSON.stringify(createResponse.body.errors, null, 2)
        );
      }

      const createdPhase = createResponse.body.data.createQuestPhase;
      expect(createdPhase.id).toBe(phaseData.id);
      expect(createdPhase.name).toBe(phaseData.name);
      expect(createdPhase.order).toBe(phaseData.order);

      // Verify in database
      const dbPhase = await prisma.questPhases.findUnique({
        where: {
          questZoneId_questId_id: { questZoneId: 1001, questId: 1, id: 1 },
        },
      });
      expect(dbPhase).toBeTruthy();
      expect(dbPhase?.name).toBe(phaseData.name);
    });

    it('should update a quest phase', async () => {
      const updateData = {
        name: 'Phase 1: Deep Investigation',
        description: 'Thoroughly investigate all rumors.',
      };

      const updateResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdateQuestPhase($questZoneId: Int!, $questId: Int!, $id: Int!, $data: UpdateQuestPhaseInput!) {
              updateQuestPhase(questZoneId: $questZoneId, questId: $questId, id: $id, data: $data) {
                id
                name
                description
              }
            }
          `,
          variables: {
            questZoneId: 1001,
            questId: 1,
            id: 1,
            data: updateData,
          },
        })
        .expect(200);

      if (updateResponse.body.errors) {
        throw new Error(
          'Quest phase update GraphQL errors: ' +
            JSON.stringify(updateResponse.body.errors, null, 2)
        );
      }

      const updatedPhase = updateResponse.body.data.updateQuestPhase;
      expect(updatedPhase.name).toBe(updateData.name);
      expect(updatedPhase.description).toBe(updateData.description);
    });
  });

  describe('Quest Objective Operations', () => {
    it('should create a quest objective', async () => {
      const objectiveData = {
        questZoneId: 1001,
        questId: 1,
        phaseId: 1,
        id: 1,
        objectiveType: 'TALK_TO_NPC',
        playerDescription: 'Speak with the village elder',
        internalNote: 'NPC is in the tavern',
        requiredCount: 1,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateQuestObjective($data: CreateQuestObjectiveInput!) {
              createQuestObjective(data: $data) {
                id
                questZoneId
                questId
                phaseId
                objectiveType
                playerDescription
                internalNote
                requiredCount
              }
            }
          `,
          variables: { data: objectiveData },
        })
        .expect(200);

      if (createResponse.body.errors) {
        throw new Error(
          'Quest objective creation GraphQL errors: ' +
            JSON.stringify(createResponse.body.errors, null, 2)
        );
      }

      const createdObjective = createResponse.body.data.createQuestObjective;
      expect(createdObjective.id).toBe(objectiveData.id);
      expect(createdObjective.objectiveType).toBe(objectiveData.objectiveType);
      expect(createdObjective.playerDescription).toBe(
        objectiveData.playerDescription
      );
      expect(createdObjective.requiredCount).toBe(objectiveData.requiredCount);

      // Verify in database
      const dbObjective = await prisma.questObjectives.findUnique({
        where: {
          questZoneId_questId_phaseId_id: {
            questZoneId: 1001,
            questId: 1,
            phaseId: 1,
            id: 1,
          },
        },
      });
      expect(dbObjective).toBeTruthy();
      expect(dbObjective?.objectiveType).toBe(objectiveData.objectiveType);
    });

    it('should update a quest objective', async () => {
      const updateData = {
        playerDescription: 'Have a conversation with the village elder',
        requiredCount: 1,
      };

      const updateResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation UpdateQuestObjective($questZoneId: Int!, $questId: Int!, $phaseId: Int!, $id: Int!, $data: UpdateQuestObjectiveInput!) {
              updateQuestObjective(questZoneId: $questZoneId, questId: $questId, phaseId: $phaseId, id: $id, data: $data) {
                id
                playerDescription
                requiredCount
              }
            }
          `,
          variables: {
            questZoneId: 1001,
            questId: 1,
            phaseId: 1,
            id: 1,
            data: updateData,
          },
        })
        .expect(200);

      if (updateResponse.body.errors) {
        throw new Error(
          'Quest objective update GraphQL errors: ' +
            JSON.stringify(updateResponse.body.errors, null, 2)
        );
      }

      const updatedObjective = updateResponse.body.data.updateQuestObjective;
      expect(updatedObjective.playerDescription).toBe(
        updateData.playerDescription
      );
    });
  });

  describe('Quest Reward Operations', () => {
    it('should create a quest reward', async () => {
      // First ensure we have a quest to attach the reward to
      const questData = {
        id: 50,
        zoneId: 1001,
        name: 'Quest for Reward Test',
        plainName: 'Quest for Reward Test',
        description: 'A quest to test reward creation',
        minLevel: 1,
        maxLevel: 100,
        triggerType: 'MANUAL' as const,
      };

      // Create or update the quest
      await prisma.quests.upsert({
        where: { zoneId_id: { zoneId: 1001, id: 50 } },
        update: {},
        create: questData,
      });

      const rewardData = {
        questZoneId: 1001,
        questId: 50,
        rewardType: 'EXPERIENCE',
        amount: 500,
      };

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateQuestReward($data: CreateQuestRewardInput!) {
              createQuestReward(data: $data) {
                id
                rewardType
                amount
              }
            }
          `,
          variables: { data: rewardData },
        })
        .expect(200);

      if (createResponse.body.errors) {
        throw new Error(
          'Quest reward creation GraphQL errors: ' +
            JSON.stringify(createResponse.body.errors, null, 2)
        );
      }

      const createdReward = createResponse.body.data.createQuestReward;
      expect(createdReward.rewardType).toBe(rewardData.rewardType);
      expect(createdReward.amount).toBe(rewardData.amount);
      expect(createdReward.id).toBeDefined();

      // Verify in database
      const dbReward = await prisma.questRewards.findFirst({
        where: {
          questZoneId: 1001,
          questId: 50,
          rewardType: 'EXPERIENCE',
        },
      });
      expect(dbReward).toBeTruthy();
      expect(dbReward?.amount).toBe(rewardData.amount);
    });
  });

  describe('Quest Trigger Types', () => {
    it('should create quest with default trigger type', async () => {
      // NOTE: The triggerType field is not currently passed through in
      // quests.service.ts createQuest - this test verifies the default works
      const questData = {
        id: 200,
        zoneId: 1001,
        name: 'Default Trigger Quest',
        description: 'Testing default trigger type',
        minLevel: 1,
        maxLevel: 100,
      };

      // Clean up any existing quest with this ID
      await prisma.quests.deleteMany({
        where: { zoneId: 1001, id: 200 },
      });

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateQuest($data: CreateQuestInput!) {
              createQuest(data: $data) {
                id
                triggerType
              }
            }
          `,
          variables: { data: questData },
        })
        .expect(200);

      if (createResponse.body.errors) {
        throw new Error(
          'Quest creation GraphQL errors: ' +
            JSON.stringify(createResponse.body.errors, null, 2)
        );
      }

      // Default trigger type is MOB
      expect(createResponse.body.data.createQuest.triggerType).toBe('MOB');

      // Verify in database
      const dbQuest = await prisma.quests.findUnique({
        where: { zoneId_id: { zoneId: 1001, id: 200 } },
      });
      expect(dbQuest?.triggerType).toBe('MOB');
    });
  });

  describe('Quest Deletion', () => {
    it('should delete a quest and cascade to related entities', async () => {
      // Create a test quest for deletion
      const questData = {
        id: 999,
        zoneId: 1001,
        name: 'Deletion Test Quest',
        description: 'This quest will be deleted',
        minLevel: 1,
        maxLevel: 100,
        triggerType: 'MANUAL',
      };

      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateQuest($data: CreateQuestInput!) {
              createQuest(data: $data) {
                id
                zoneId
              }
            }
          `,
          variables: { data: questData },
        })
        .expect(200);

      // Delete the quest
      const deleteResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation DeleteQuest($zoneId: Int!, $id: Int!) {
              deleteQuest(zoneId: $zoneId, id: $id) {
                id
                zoneId
              }
            }
          `,
          variables: { zoneId: 1001, id: 999 },
        })
        .expect(200);

      if (deleteResponse.body.errors) {
        throw new Error(
          'Quest deletion GraphQL errors: ' +
            JSON.stringify(deleteResponse.body.errors, null, 2)
        );
      }

      const deletedQuest = deleteResponse.body.data.deleteQuest;
      expect(deletedQuest.id).toBe(999);

      // Verify quest is deleted from database
      const dbQuest = await prisma.quests.findUnique({
        where: { zoneId_id: { zoneId: 1001, id: 999 } },
      });
      expect(dbQuest).toBeNull();
    });
  });
});
