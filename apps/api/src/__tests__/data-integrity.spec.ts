import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaClient } from '@muditor/db';
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
        name: 'Test Goblin Warrior',
        shortDescription: 'a fierce goblin warrior',
        longDescription: 'This goblin warrior stands ready for battle with scarred green skin and gleaming weapons.',
        race: 'GOBLIN',
        level: 15,
        hitPointsMax: 450,
        hitPoints: 450,
        manaMax: 100,
        mana: 100,
        movePointsMax: 200,
        movePoints: 200,
        armorClass: -2,
        hitRoll: 8,
        damageRoll: '2d8+4',
        experiencePoints: 2500,
        gold: 150,
        mobFlags: ['AGGRESSIVE', 'AWARE', 'ISNPC'],
        affectedBy: ['DETECT_INVISIBLE'],
        zoneId: 1000,
        roomId: 0
      };

      // Create mob via API
      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateMob($data: CreateMobInput!) {
              createMob(data: $data) {
                id
                name
                shortDescription
                longDescription
                race
                level
                hitPointsMax
                hitPoints
                manaMax
                mana
                movePointsMax
                movePoints
                armorClass
                hitRoll
                damageRoll
                experiencePoints
                gold
                mobFlags
                affectedBy
                zoneId
                roomId
              }
            }
          `,
          variables: { data: testMobData }
        })
        .expect(200);

      const createdMob = createResponse.body.data.createMob;
      expect(createdMob.name).toBe(testMobData.name);
      expect(createdMob.race).toBe(testMobData.race);
      expect(createdMob.level).toBe(testMobData.level);
      expect(createdMob.mobFlags).toEqual(expect.arrayContaining(testMobData.mobFlags));

      // Verify in database
      const dbMob = await prisma.mob.findUnique({
        where: { zoneId_id: { zoneId: createdMob.zoneId, id: createdMob.id } }
      });

      expect(dbMob).toBeTruthy();
      expect(dbMob?.shortDesc).toBe(testMobData.shortDescription);
      expect(dbMob?.race).toBe(testMobData.race);
      expect(dbMob?.level).toBe(testMobData.level);
      expect(dbMob?.hpDice).toBeDefined();

      // Query back via API
      const queryResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query GetMob($id: String!) {
              mob(id: $id) {
                name
                shortDescription
                longDescription
                race
                level
                hitPointsMax
                mobFlags
                affectedBy
              }
            }
          `,
          variables: { id: createdMob.id }
        })
        .expect(200);

      const queriedMob = queryResponse.body.data.mob;
      expect(queriedMob.name).toBe(testMobData.name);
      expect(queriedMob.race).toBe(testMobData.race);
      expect(queriedMob.mobFlags).toEqual(expect.arrayContaining(testMobData.mobFlags));
    });
  });

  describe('Object Data Integrity', () => {
    it('should preserve object properties and type-specific data', async () => {
      const testWeaponData = {
        name: 'Enchanted Steel Sword',
        shortDescription: 'a gleaming steel sword',
        longDescription: 'This masterfully crafted sword gleams with magical enchantments.',
        itemType: 'WEAPON',
        weight: 5,
        cost: 1000,
        extraFlags: ['MAGIC', 'GLOW'],
        wearFlags: ['TAKE', 'WIELD'],
        weaponType: 'SWORD',
        numDamageDice: 2,
        sizeDamageDice: 6,
        damageType: 'SLASH',
        zoneId: 1000,
        roomId: 0
      };

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateObject($data: CreateObjectInput!) {
              createObject(data: $data) {
                id
                name
                shortDescription
                longDescription
                itemType
                weight
                cost
                extraFlags
                wearFlags
                weaponType
                numDamageDice
                sizeDamageDice
                damageType
              }
            }
          `,
          variables: { data: testWeaponData }
        })
        .expect(200);

      const createdObject = createResponse.body.data.createObject;

      // Verify all properties match
      Object.keys(testWeaponData).forEach(key => {
        if (key !== 'zoneId' && key !== 'roomId') {
          expect(createdObject[key]).toEqual(testWeaponData[key]);
        }
      });

      // Verify in database with type-specific data
      const dbObject = await prisma.object.findUnique({
        where: { zoneId_id: { zoneId: createdObject.zoneId, id: createdObject.id } }
      });

      expect(dbObject?.type).toBe('WEAPON');
      expect(dbObject?.values).toBeDefined();
      expect(dbObject?.weight).toBe(testWeaponData.weight);
    });
  });

  describe('Room Data Integrity', () => {
    it('should preserve room descriptions and exits correctly', async () => {
      const testRoomData = {
        id: 12345,
        name: 'Test Chamber',
        description: 'A large stone chamber with ancient carvings on the walls.',
        roomFlags: ['DARK', 'NO_MOB'],
        sectorType: 'INSIDE',
        zoneId: 1000,
        exits: [
          {
            direction: 'NORTH',
            toRoom: 12346,
            description: 'A dark corridor leads north.',
            keywords: ['corridor', 'north'],
            exitFlags: ['DOOR', 'CLOSED']
          }
        ]
      };

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateRoom($data: CreateRoomInput!) {
              createRoom(data: $data) {
                id
                id
                name
                description
                roomFlags
                sectorType
                exits {
                  direction
                  toRoom
                  description
                  keywords
                  exitFlags
                }
              }
            }
          `,
          variables: { data: testRoomData }
        })
        .expect(200);

      const createdRoom = createResponse.body.data.createRoom;

      expect(createdRoom.id).toBe(testRoomData.id);
      expect(createdRoom.name).toBe(testRoomData.name);
      expect(createdRoom.description).toBe(testRoomData.description);
      expect(createdRoom.roomFlags).toEqual(expect.arrayContaining(testRoomData.roomFlags));
      expect(createdRoom.exits).toHaveLength(1);
      expect(createdRoom.exits[0].direction).toBe('NORTH');
      expect(createdRoom.exits[0].exitFlags).toEqual(expect.arrayContaining(['DOOR', 'CLOSED']));

      // Verify exit data in database
      const dbRoom = await prisma.room.findUnique({
        where: { zoneId_id: { zoneId: createdRoom.zoneId, id: createdRoom.id } },
        include: { exits: true }
      });

      expect(dbRoom?.exits).toHaveLength(1);
      expect(dbRoom?.exits[0].direction).toBe('NORTH');
      expect(dbRoom?.exits[0].toRoomId).toBe(testRoomData.exits[0].toRoom);
    });
  });

  describe('Zone Data Integrity', () => {
    it('should preserve zone configuration and reset settings', async () => {
      const testZoneData = {
        id: 9999,
        name: 'Test Zone',
        topRoom: 999900,
        resetMode: 0,
        lifespan: 20,
        resetMessage: 'You hear distant sounds of activity.',
        owners: ['admin', 'builder1'],
        levelRestrictions: 'NONE',
        zoneFlags: ['NO_ATTACK', 'GRID']
      };

      const createResponse = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateZone($data: CreateZoneInput!) {
              createZone(data: $data) {
                id
                name
                topRoom
                resetMode
                lifespan
                resetMessage
                owners
                levelRestrictions
                zoneFlags
              }
            }
          `,
          variables: { data: testZoneData }
        })
        .expect(200);

      const createdZone = createResponse.body.data.createZone;

      expect(createdZone.id).toBe(testZoneData.id);
      expect(createdZone.name).toBe(testZoneData.name);
      expect(createdZone.resetMode).toBe(testZoneData.resetMode);
      expect(createdZone.owners).toEqual(expect.arrayContaining(testZoneData.owners));
      expect(createdZone.zoneFlags).toEqual(expect.arrayContaining(testZoneData.zoneFlags));

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
                owners
                zoneFlags
              }
            }
          `,
          variables: { id: testZoneData.id }
        })
        .expect(200);

      const queriedZone = queryResponse.body.data.zone;
      expect(queriedZone.id).toBe(testZoneData.id);
      expect(queriedZone.owners).toEqual(expect.arrayContaining(testZoneData.owners));
    });
  });

  describe('Flag Mapping Integrity', () => {
    it('should correctly handle all mob flags without data loss', async () => {
      const allMobFlags = [
        'SPEC', 'SENTINEL', 'SCAVENGER', 'ISNPC', 'AWARE', 'AGGRESSIVE',
        'STAY_ZONE', 'WIMPY', 'PET', 'PROTECTED', 'MEMORY', 'HELPER',
        'NO_CHARM', 'NO_SUMMMON', 'NO_SLEEP', 'NO_BASH', 'NO_BLIND',
        'MOUNTABLE', 'CLONE', 'AGGRESSIVE_EVIL', 'AGGRESSIVE_GOOD',
        'AGGRESSIVE_NEUTRAL', 'NOPOISON', 'NOSILENCE', 'NOVICIOUS',
        'NO_CLASS_AI', 'FAST_TRACK', 'AQUATIC'
      ];

      const testMob = {
        name: 'Flag Test Mob',
        race: 'HUMAN',
        level: 1,
        mobFlags: allMobFlags,
        zoneId: 1000,
        roomId: 0
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation CreateMob($data: CreateMobInput!) {
              createMob(data: $data) {
                mobFlags
              }
            }
          `,
          variables: { data: testMob }
        })
        .expect(200);

      const createdMob = response.body.data.createMob;

      // Verify all flags are preserved
      expect(createdMob.mobFlags).toHaveLength(allMobFlags.length);
      allMobFlags.forEach(flag => {
        expect(createdMob.mobFlags).toContain(flag);
      });
    });
  });
});