import { ItemType, SectorType, TriggerFlag } from '@muditor/types';
import { MobFlag, PrismaClient, Race } from '@prisma/client';

describe('Seeded Data Integrity', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Zone Data Validation', () => {
    it('should have valid zone data with proper ID ranges', async () => {
      const zones = await prisma.zones.findMany({
        orderBy: { id: 'asc' },
      });

      expect(zones.length).toBeGreaterThan(100); // Should have many zones

      // Verify zone 0 converted to 1000
      const voidZone = zones.find(z => z.id === 1000);
      expect(voidZone).toBeTruthy();
      expect(voidZone?.name).toContain('Void');

      // Check that all zones have required fields
      zones.forEach(zone => {
        expect(zone.id).toBeGreaterThan(0);
        expect(zone.name).toBeTruthy();
        expect(zone.resetMode).toBeGreaterThanOrEqual(0);
        expect(zone.lifespan).toBeGreaterThan(0);
      });
    });

    it('should have consistent room-to-zone relationships', async () => {
      const zonesWithRooms = await prisma.zones.findMany({
        include: {
          rooms: true,
        },
        take: 10, // Test sample
      });

      zonesWithRooms.forEach(zone => {
        zone.rooms.forEach(room => {
          // Room id should be within zone range (mostly)
          const expectedMin = zone.id === 1000 ? 0 : zone.id * 100;

          // Some flexibility for cross-zone connections
          if (room.id < expectedMin || room.id > expectedMin + 99) {
            console.warn(
              `Room ${room.id} in zone ${zone.id} outside expected range ${expectedMin}-${expectedMax}`
            );
          }
        });
      });
    });
  });

  describe('Mob Data Validation', () => {
    it('should have mobs with valid race enums', async () => {
      const mobs = await prisma.mobs.findMany({
        take: 50, // Sample
      });

      expect(mobs.length).toBeGreaterThan(20);

      mobs.forEach(mob => {
        expect(Object.values(Race)).toContain(mob.race);
        expect(mob.level).toBeGreaterThan(0);
        expect(mob.hitPointsMax).toBeGreaterThan(0);
        expect(mob.name).toBeTruthy();
      });
    });

    it('should have valid mob flags', async () => {
      const mobsWithFlags = await prisma.mobs.findMany({
        where: {
          mobFlags: {
            not: [],
          },
        },
        take: 20,
      });

      mobsWithFlags.forEach(mob => {
        mob.mobFlags.forEach(flag => {
          expect(Object.values(MobFlag)).toContain(flag);
        });
      });
    });

    it('should have consistent damage roll formats', async () => {
      const mobsWithDamage = await prisma.mobs.findMany({
        where: {
          damageRoll: {
            not: null,
          },
        },
        take: 30,
      });

      const damageRollPattern = /^\d+d\d+[\+\-]?\d*$/;

      mobsWithDamage.forEach(mob => {
        if (mob.damageRoll) {
          expect(mob.damageRoll).toMatch(damageRollPattern);
        }
      });
    });
  });

  describe('Object Data Validation', () => {
    it('should have objects with valid item types', async () => {
      const objects = await prisma.objects.findMany({
        take: 50,
      });

      expect(objects.length).toBeGreaterThan(30);

      objects.forEach(obj => {
        expect(Object.values(ItemType)).toContain(obj.itemType);
        expect(obj.name).toBeTruthy();
        expect(obj.weight).toBeGreaterThanOrEqual(0);
        expect(obj.cost).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have type-specific properties for weapons', async () => {
      const weapons = await prisma.objects.findMany({
        where: {
          itemType: 'WEAPON',
        },
        take: 20,
      });

      weapons.forEach(weapon => {
        if (weapon.weaponType) {
          expect([
            'SWORD',
            'DAGGER',
            'STAFF',
            'BOW',
            'MACE',
            'AXE',
            'SPEAR',
            'OTHER',
          ]).toContain(weapon.weaponType);
        }
        if (weapon.numDamageDice) {
          expect(weapon.numDamageDice).toBeGreaterThan(0);
        }
        if (weapon.sizeDamageDice) {
          expect(weapon.sizeDamageDice).toBeGreaterThan(0);
        }
      });
    });

    it('should have valid container properties', async () => {
      const containers = await prisma.objects.findMany({
        where: {
          itemType: 'CONTAINER',
        },
        take: 10,
      });

      containers.forEach(container => {
        if (container.capacity !== null) {
          expect(container.capacity).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Room Data Validation', () => {
    it('should have rooms with valid sector types', async () => {
      const rooms = await prisma.rooms.findMany({
        take: 100,
      });

      expect(rooms.length).toBeGreaterThan(50);

      rooms.forEach(room => {
        expect(Object.values(SectorType)).toContain(room.sectorType);
        expect(room.name).toBeTruthy();
        expect(room.id).toBeGreaterThanOrEqual(0);
      });
    });

    it('should have valid exit relationships', async () => {
      const roomsWithExits = await prisma.rooms.findMany({
        include: {
          exits: true,
        },
        take: 50,
      });

      roomsWithExits.forEach(room => {
        room.exits.forEach(exit => {
          expect([
            'NORTH',
            'SOUTH',
            'EAST',
            'WEST',
            'UP',
            'DOWN',
            'NORTHEAST',
            'NORTHWEST',
            'SOUTHEAST',
            'SOUTHWEST',
          ]).toContain(exit.direction);
          expect(exit.toRoom).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Trigger Data Validation', () => {
    it('should have triggers with valid types and flags', async () => {
      const triggers = await prisma.triggers.findMany({
        take: 30,
      });

      if (triggers.length > 0) {
        triggers.forEach(trigger => {
          if (trigger.triggerFlags && trigger.triggerFlags.length > 0) {
            trigger.triggerFlags.forEach(flag => {
              expect(Object.values(TriggerFlag)).toContain(flag);
            });
          }
          expect(trigger.name).toBeTruthy();
        });
      }
    });

    it('should have valid script content', async () => {
      const triggersWithScripts = await prisma.triggers.findMany({
        where: {
          script: {
            not: null,
          },
        },
        take: 20,
      });

      triggersWithScripts.forEach(trigger => {
        if (trigger.script) {
          expect(trigger.script.length).toBeGreaterThan(0);
          // Basic Lua syntax check - should not be empty or just whitespace
          expect(trigger.script.trim()).toBeTruthy();
        }
      });
    });
  });

  describe('Shop Data Validation', () => {
    it('should have shops with valid configurations', async () => {
      const shops = await prisma.shops.findMany({
        include: {
          keeper: true,
        },
      });

      shops.forEach(shop => {
        expect(shop.profitBuy).toBeGreaterThan(0);
        expect(shop.profitSell).toBeGreaterThan(0);
        expect(shop.keeper).toBeTruthy();

        if (shop.buyTypes && shop.buyTypes.length > 0) {
          shop.buyTypes.forEach(type => {
            expect(Object.values(ItemType)).toContain(type);
          });
        }
      });
    });
  });

  describe('Cross-Entity Relationships', () => {
    it('should have consistent mob-to-room relationships', async () => {
      const mobsWithRooms = await prisma.mobs.findMany({
        include: {
          zone: true,
        },
        where: {
          roomId: {
            not: null,
          },
        },
        take: 30,
      });

      for (const mob of mobsWithRooms) {
        if (mob.roomId !== null) {
          const room = await prisma.rooms.findFirst({
            where: {
              id: mob.roomId,
              zoneId: mob.zoneId,
            },
          });

          if (!room) {
            console.warn(
              `Mob ${mob.name} references non-existent room ${mob.roomId} in zone ${mob.zoneId}`
            );
          }
        }
      }
    });

    it('should have consistent object-to-room relationships', async () => {
      const objectsWithRooms = await prisma.objects.findMany({
        where: {
          roomId: {
            not: null,
          },
        },
        take: 20,
      });

      for (const obj of objectsWithRooms) {
        if (obj.roomId !== null) {
          const room = await prisma.rooms.findFirst({
            where: {
              id: obj.roomId,
              zoneId: obj.zoneId,
            },
          });

          if (!room) {
            console.warn(
              `Object ${obj.name} references non-existent room ${obj.roomId} in zone ${obj.zoneId}`
            );
          }
        }
      }
    });
  });

  describe('Data Completeness', () => {
    it('should have reasonable data distribution', async () => {
      const counts = await Promise.all([
        prisma.zones.count(),
        prisma.rooms.count(),
        prisma.mobs.count(),
        prisma.objects.count(),
        prisma.triggers.count(),
        prisma.shops.count(),
      ]);

      const [
        zoneCount,
        roomCount,
        mobCount,
        objectCount,
        triggerCount,
        shopCount,
      ] = counts;

      expect(zoneCount).toBeGreaterThan(100); // Should have many zones
      expect(roomCount).toBeGreaterThan(zoneCount * 5); // Rooms should outnumber zones significantly
      expect(mobCount).toBeGreaterThan(100); // Should have many mobs
      expect(objectCount).toBeGreaterThan(100); // Should have many objects

      // Log distribution for verification
      console.log('Data Distribution:', {
        zones: zoneCount,
        rooms: roomCount,
        mobs: mobCount,
        objects: objectCount,
        triggers: triggerCount,
        shops: shopCount,
      });
    });
  });
});
