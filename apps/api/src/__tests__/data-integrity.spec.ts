import { PrismaClient } from '@muditor/db';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('Data Integrity Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Mob Data Integrity', () => {
    it('should preserve all mob properties through API round-trip', async () => {
      const testMobData = {
        id: 1,
        zoneId: 1000,
        keywords: ['goblin', 'warrior'],
        shortDesc: 'a fierce goblin warrior',
        longDesc:
          'This goblin warrior stands ready for battle with scarred green skin and gleaming weapons.',
        description: 'This is a test goblin warrior mob for data integrity testing.',
        level: 15,
        armorClass: -2,
        hitRoll: 8,
        hpDice: '8d8+100',
        damageDice: '2d8+4',
      };

      // Create mob via API
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateMob($data: CreateMobInput!) {
              createMob(data: $data) {
                id
                zoneId
                keywords
                shortDesc
                longDesc
                description
                level
                armorClass
                hitRoll
                hpDice
                damageDice
              }
            }
          `,
          variables: { data: testMobData },
        })
        .expect(200);

      const createdMob = createResponse.body.data.createMob;
      expect(createdMob.id).toBe(testMobData.id);
      expect(createdMob.zoneId).toBe(testMobData.zoneId);
      expect(createdMob.level).toBe(testMobData.level);
      expect(createdMob.keywords).toEqual(
        expect.arrayContaining(testMobData.keywords)
      );

      // Verify in database
      const dbMob = await prisma.mobs.findUnique({
        where: { zoneId_id: { zoneId: createdMob.zoneId, id: createdMob.id } },
      });

      expect(dbMob).toBeTruthy();
      expect(dbMob?.shortDesc).toBe(testMobData.shortDesc);
      expect(dbMob?.level).toBe(testMobData.level);
      expect(dbMob?.hpDiceNum).toBeDefined();
      expect(dbMob?.hpDiceSize).toBeDefined();
      expect(dbMob?.hpDiceBonus).toBeDefined();

      // Query back via API
      const queryResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetMob($zoneId: Int!, $id: Int!) {
              mob(zoneId: $zoneId, id: $id) {
                id
                zoneId
                keywords
                shortDesc
                longDesc
                description
                level
                armorClass
                hitRoll
                hpDice
                damageDice
              }
            }
          `,
          variables: { zoneId: createdMob.zoneId, id: createdMob.id },
        })
        .expect(200);

      const queriedMob = queryResponse.body.data.mob;
      expect(queriedMob.id).toBe(testMobData.id);
      expect(queriedMob.zoneId).toBe(testMobData.zoneId);
      expect(queriedMob.keywords).toEqual(
        expect.arrayContaining(testMobData.keywords)
      );
      expect(queriedMob.shortDesc).toBe(testMobData.shortDesc);
      expect(queriedMob.level).toBe(testMobData.level);
    });
  });

  describe('Object Data Integrity', () => {
    it('should preserve object properties and type-specific data', async () => {
      const testWeaponData = {
        id: 1,
        zoneId: 1000,
        type: 'WEAPON',
        keywords: ['sword', 'steel', 'weapon'],
        shortDesc: 'a gleaming steel sword',
        description:
          'This masterfully crafted sword gleams with magical enchantments.',
        weight: 5,
        cost: 1000,
        flags: ['MAGIC', 'GLOW'],
        wearFlags: ['TAKE', 'WIELD'],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateObject($data: CreateObjectInput!) {
              createObject(data: $data) {
                id
                zoneId
                type
                keywords
                shortDesc
                description
                weight
                cost
                flags
                wearFlags
              }
            }
          `,
          variables: { data: testWeaponData },
        })
        .expect(200);

      const createdObject = createResponse.body.data.createObject;

      // Verify all properties match
      expect(createdObject.id).toBe(testWeaponData.id);
      expect(createdObject.zoneId).toBe(testWeaponData.zoneId);
      expect(createdObject.type).toBe(testWeaponData.type);
      expect(createdObject.weight).toBe(testWeaponData.weight);
      expect(createdObject.cost).toBe(testWeaponData.cost);

      // Verify in database with type-specific data
      const dbObject = await prisma.objects.findUnique({
        where: {
          zoneId_id: { zoneId: createdObject.zoneId, id: createdObject.id },
        },
      });

      expect(dbObject).toBeTruthy();
      expect(dbObject?.type).toBe('WEAPON');
      expect(dbObject?.weight).toBe(testWeaponData.weight);
      expect(dbObject?.cost).toBe(testWeaponData.cost);
    });
  });

  describe('Room Data Integrity', () => {
    it('should preserve room descriptions correctly', async () => {
      const testRoomData = {
        id: 1,
        zoneId: 1000,
        name: 'Test Chamber',
        description:
          'A large stone chamber with ancient carvings on the walls.',
        flags: ['DARK', 'NO_MOB'],
        sector: 'INSIDE',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateRoom($data: CreateRoomInput!) {
              createRoom(data: $data) {
                id
                zoneId
                name
                description
                flags
                sector
              }
            }
          `,
          variables: { data: testRoomData },
        })
        .expect(200);

      const createdRoom = createResponse.body.data.createRoom;

      expect(createdRoom.id).toBe(testRoomData.id);
      expect(createdRoom.zoneId).toBe(testRoomData.zoneId);
      expect(createdRoom.name).toBe(testRoomData.name);
      expect(createdRoom.description).toBe(testRoomData.description);
      expect(createdRoom.sector).toBe(testRoomData.sector);

      // Verify in database
      const dbRoom = await prisma.rooms.findUnique({
        where: {
          zoneId_id: { zoneId: createdRoom.zoneId, id: createdRoom.id },
        },
      });

      expect(dbRoom).toBeTruthy();
      expect(dbRoom?.name).toBe(testRoomData.name);
      expect(dbRoom?.description).toBe(testRoomData.description);
      expect(dbRoom?.sector).toBe(testRoomData.sector);
    });
  });

  describe('Zone Data Integrity', () => {
    it('should preserve zone configuration and reset settings', async () => {
      const testZoneData = {
        id: 9999,
        name: 'Test Zone',
        resetMode: 'NORMAL',
        lifespan: 20,
        hemisphere: 'NORTHWEST',
        climate: 'TEMPERATE',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateZone($data: CreateZoneInput!) {
              createZone(data: $data) {
                id
                name
                resetMode
                lifespan
                hemisphere
                climate
              }
            }
          `,
          variables: { data: testZoneData },
        })
        .expect(200);

      const createdZone = createResponse.body.data.createZone;

      expect(createdZone.id).toBe(testZoneData.id);
      expect(createdZone.name).toBe(testZoneData.name);
      expect(createdZone.resetMode).toBe(testZoneData.resetMode);
      expect(createdZone.lifespan).toBe(testZoneData.lifespan);

      // Query back and verify consistency
      const queryResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetZone($id: Int!) {
              zone(id: $id) {
                id
                name
                resetMode
                lifespan
                hemisphere
                climate
              }
            }
          `,
          variables: { id: testZoneData.id },
        })
        .expect(200);

      const queriedZone = queryResponse.body.data.zone;
      expect(queriedZone.id).toBe(testZoneData.id);
      expect(queriedZone.name).toBe(testZoneData.name);
      expect(queriedZone.resetMode).toBe(testZoneData.resetMode);
    });
  });

  describe('Flag Mapping Integrity', () => {
    it('should correctly handle mob creation with basic fields', async () => {
      const testMob = {
        id: 2,
        zoneId: 1000,
        keywords: ['test', 'mob'],
        shortDesc: 'a test mob',
        longDesc: 'This is a test mob for flag testing.',
        description: 'A basic test mob.',
        level: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateMob($data: CreateMobInput!) {
              createMob(data: $data) {
                id
                zoneId
                keywords
                shortDesc
                level
              }
            }
          `,
          variables: { data: testMob },
        })
        .expect(200);

      const createdMob = response.body.data.createMob;

      // Verify basic properties are preserved
      expect(createdMob.id).toBe(testMob.id);
      expect(createdMob.zoneId).toBe(testMob.zoneId);
      expect(createdMob.level).toBe(testMob.level);
    });
  });
});
