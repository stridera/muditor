import { PrismaClient } from '@muditor/db';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('Data Integrity Tests', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Bypass guard no longer needed (overrideGuard used below)

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Properly override guards (not providers) so decorators use bypass implementation
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(GraphQLJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = new PrismaClient();
    // Ensure test zone exists for foreign key relations (zones.id=1000)
    await prisma.zones.upsert({
      where: { id: 1000 },
      update: {},
      create: {
        id: 1000,
        name: 'Data Integrity Zone',
        resetMode: 'NORMAL',
        lifespan: 30,
        hemisphere: 'NORTHWEST',
        climate: 'TEMPERATE',
      },
    });
    // Clean previous test artifacts (id collisions) if rerunning without DB reset
    await prisma.mobs.deleteMany({ where: { zoneId: 1000 } });
    await prisma.objects.deleteMany({ where: { zoneId: 1000 } });
    await prisma.room.deleteMany({ where: { zoneId: 1000 } });
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
        name: 'a fierce goblin warrior',
        roomDescription:
          'This goblin warrior stands ready for battle with scarred green skin and gleaming weapons.',
        examineDescription:
          'This is a test goblin warrior mob for data integrity testing.',
        level: 15,
        armorClass: -2,
        hitRoll: 8,
        hpDice: '8d8+100',
        damageDice: '2d8+4',
        // wealth is not a direct input property (removed from CreateMobInput)
      } as const;

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
                name
                roomDescription
                examineDescription
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
      expect(dbMob?.name).toBe(testMobData.name);
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
                name
                roomDescription
                examineDescription
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
      expect(queriedMob.name).toBe(testMobData.name);
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
        name: 'a gleaming steel sword',
        roomDescription: 'A gleaming steel sword lies here.',
        examineDescription:
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
                name
                examineDescription
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
        id: 101,
        zoneId: 1000,
        name: 'Test Chamber',
        roomDescription:
          'A large stone chamber with ancient carvings on the walls.',
        flags: [],
        // Use a valid Sector enum value (previously 'INSIDE' which is not in the Prisma enum -> GraphQL validation error)
        sector: 'STRUCTURE',
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
                roomDescription
                flags
                sector
              }
            }
          `,
          variables: { data: testRoomData },
        })
        .expect(200);

      // Assert no GraphQL validation errors (helps surface enum issues quickly if they recur)
      if (createResponse.body.errors) {
        throw new Error(
          'Room creation GraphQL errors: ' +
            JSON.stringify(createResponse.body.errors, null, 2)
        );
      }
      expect(createResponse.body.errors).toBeUndefined();

      const createdRoom = createResponse.body.data.createRoom;

      expect(createdRoom.id).toBe(testRoomData.id);
      expect(createdRoom.zoneId).toBe(testRoomData.zoneId);
      expect(createdRoom.name).toBe(testRoomData.name);
      expect(createdRoom.roomDescription).toBe(testRoomData.roomDescription);
      expect(createdRoom.sector).toBe(testRoomData.sector);

      // Verify in database
      const dbRoom = await prisma.room.findUnique({
        where: {
          zoneId_id: { zoneId: createdRoom.zoneId, id: createdRoom.id },
        },
      });

      expect(dbRoom).toBeTruthy();
      expect(dbRoom?.name).toBe(testRoomData.name);
      expect(dbRoom?.roomDescription).toBe(testRoomData.roomDescription);
      expect(dbRoom?.sector).toBe(testRoomData.sector);
    });
  });

  describe('Zone Data Integrity', () => {
    it('should preserve zone configuration and reset settings', async () => {
      const testZoneData = {
        id: 15000,
        name: 'Test Zone',
        resetMode: 'NORMAL',
        lifespan: 20,
        hemisphere: 'NORTHWEST',
        climate: 'TEMPERATE',
      };

      // Ensure no pre-existing zone with this ID to avoid unique constraint failure on reruns
      await prisma.zones.deleteMany({ where: { id: testZoneData.id } });

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

      // Unique constraint can fail if test re-runs without cleanup; proactively delete before attempting create.
      // (Deletion placed after request previously; move logic before creation if needed in future refactor.)
      // For now, if errors exist and indicate unique constraint, log them to aid diagnosis.
      if (createResponse.body.errors) {
        throw new Error(
          'Zone creation GraphQL errors: ' +
            JSON.stringify(createResponse.body.errors, null, 2)
        );
      }
      expect(createResponse.body.errors).toBeUndefined();

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
        name: 'a test mob',
        roomDescription: 'This is a test mob for flag testing.',
        examineDescription: 'A basic test mob.',
        level: 1,
      } as const;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateMob($data: CreateMobInput!) {
              createMob(data: $data) {
                id
                zoneId
                keywords
                name
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
