import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GraphQL API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('zones', () => {
    it('should return all zones', () => {
      const query = `
        query {
          zones {
            id
            name
            top
            lifespan
            resetMode
            hemisphere
            climate
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.zones).toBeInstanceOf(Array);
          expect(response.body.data.zones.length).toBeGreaterThan(0);
          
          const zone = response.body.data.zones[0];
          expect(zone).toHaveProperty('id');
          expect(zone).toHaveProperty('name');
          expect(zone).toHaveProperty('top');
          expect(zone).toHaveProperty('lifespan');
          expect(zone).toHaveProperty('resetMode');
          expect(zone).toHaveProperty('hemisphere');
          expect(zone).toHaveProperty('climate');
          
          console.log(`✅ Found ${response.body.data.zones.length} zones`);
          response.body.data.zones.forEach(zone => {
            console.log(`   - Zone ${zone.id}: ${zone.name}`);
          });
        });
    });

    it('should return a specific zone by ID', () => {
      const query = `
        query {
          zone(id: 365) {
            id
            name
            top
            lifespan
            resetMode
            hemisphere
            climate
            rooms {
              id
              name
            }
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.zone).toBeDefined();
          
          const zone = response.body.data.zone;
          expect(zone.id).toBe(365);
          expect(zone.name).toBeDefined();
          expect(zone.rooms).toBeInstanceOf(Array);
          
          console.log(`✅ Zone ${zone.id}: ${zone.name} with ${zone.rooms.length} rooms`);
        });
    });
  });

  describe('rooms', () => {
    it('should return rooms by zone ID', () => {
      const query = `
        query {
          roomsByZone(zoneId: 365) {
            id
            name
            description
            sector
            flags
            zone {
              id
              name
            }
            exits {
              direction
              destination
              description
            }
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.roomsByZone).toBeInstanceOf(Array);
          
          if (response.body.data.roomsByZone.length > 0) {
            const room = response.body.data.roomsByZone[0];
            expect(room).toHaveProperty('id');
            expect(room).toHaveProperty('name');
            expect(room).toHaveProperty('description');
            expect(room).toHaveProperty('sector');
            expect(room).toHaveProperty('flags');
            expect(room).toHaveProperty('zone');
            expect(room).toHaveProperty('exits');
            
            expect(room.zone.id).toBe(365);
            expect(room.exits).toBeInstanceOf(Array);
            
            console.log(`✅ Found ${response.body.data.roomsByZone.length} rooms in zone 365`);
            response.body.data.roomsByZone.slice(0, 3).forEach(room => {
              console.log(`   - Room ${room.id}: ${room.name} (${room.exits.length} exits)`);
            });
          }
        });
    });

    it('should return a specific room by ID', () => {
      const query = `
        query {
          room(id: 51100) {
            id
            name
            description
            sector
            flags
            zone {
              id
              name
            }
            exits {
              direction
              destination
              description
              keyword
            }
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.room).toBeDefined();
          
          const room = response.body.data.room;
          expect(room.id).toBe(51100);
          expect(room.name).toBeDefined();
          expect(room.zone).toBeDefined();
          expect(room.exits).toBeInstanceOf(Array);
          
          console.log(`✅ Room ${room.id}: ${room.name} in zone ${room.zone.name}`);
          console.log(`   Exits: ${room.exits.map(e => `${e.direction} → ${e.destination}`).join(', ')}`);
        });
    });
  });

  describe('mobs', () => {
    it('should return all mobs', () => {
      const query = `
        query {
          mobs {
            id
            keywords
            shortDesc
            longDesc
            mobClass
            level
            mobFlags
            effectFlags
            alignment
            zone {
              id
              name
            }
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.mobs).toBeInstanceOf(Array);
          
          if (response.body.data.mobs.length > 0) {
            const mob = response.body.data.mobs[0];
            expect(mob).toHaveProperty('id');
            expect(mob).toHaveProperty('keywords');
            expect(mob).toHaveProperty('shortDesc');
            expect(mob).toHaveProperty('mobClass');
            expect(mob).toHaveProperty('level');
            expect(mob).toHaveProperty('mobFlags');
            expect(mob).toHaveProperty('zone');
            
            console.log(`✅ Found ${response.body.data.mobs.length} mobs`);
            response.body.data.mobs.forEach(mob => {
              console.log(`   - Mob ${mob.id}: ${mob.shortDesc} (Level ${mob.level} ${mob.mobClass})`);
            });
          }
        });
    });
  });

  describe('objects', () => {
    it('should return all objects', () => {
      const query = `
        query {
          objects {
            id
            type
            keywords
            shortDesc
            description
            level
            flags
            effectFlags
            wearFlags
            weight
            cost
            zone {
              id
              name
            }
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.objects).toBeInstanceOf(Array);
          
          if (response.body.data.objects.length > 0) {
            const object = response.body.data.objects[0];
            expect(object).toHaveProperty('id');
            expect(object).toHaveProperty('type');
            expect(object).toHaveProperty('keywords');
            expect(object).toHaveProperty('shortDesc');
            expect(object).toHaveProperty('level');
            expect(object).toHaveProperty('zone');
            
            console.log(`✅ Found ${response.body.data.objects.length} objects`);
            response.body.data.objects.forEach(object => {
              console.log(`   - Object ${object.id}: ${object.shortDesc} (${object.type})`);
            });
          }
        });
    });
  });

  describe('shops', () => {
    it('should return all shops', () => {
      const query = `
        query {
          shops {
            id
            buyProfit
            sellProfit
            flags
            zone {
              id
              name
            }
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.shops).toBeInstanceOf(Array);
          
          console.log(`✅ Found ${response.body.data.shops.length} shops`);
          
          if (response.body.data.shops.length > 0) {
            response.body.data.shops.forEach(shop => {
              console.log(`   - Shop ${shop.id}: Buy ${shop.buyProfit}x, Sell ${shop.sellProfit}x`);
            });
          }
        });
    });
  });

  describe('mutations', () => {
    it('should be able to update a room', () => {
      const mutation = `
        mutation {
          updateRoom(id: 51100, input: {
            name: "The Northern Swamps (Updated by Test)"
            description: "You are standing in the Northern Swamps, knee-deep in muck. This room was updated by an automated test."
          }) {
            id
            name
            description
            updatedAt
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.updateRoom).toBeDefined();
          
          const updatedRoom = response.body.data.updateRoom;
          expect(updatedRoom.id).toBe(51100);
          expect(updatedRoom.name).toBe("The Northern Swamps (Updated by Test)");
          expect(updatedRoom.description).toContain("automated test");
          expect(updatedRoom.updatedAt).toBeDefined();
          
          console.log(`✅ Successfully updated room ${updatedRoom.id}: ${updatedRoom.name}`);
        });
    });

    it('should revert the room update', () => {
      const mutation = `
        mutation {
          updateRoom(id: 51100, input: {
            name: "The Northern Swamps"
            description: "You are standing in the Northern Swamps, knee-deep in muck. "
          }) {
            id
            name
            description
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query: mutation })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.updateRoom).toBeDefined();
          
          const revertedRoom = response.body.data.updateRoom;
          expect(revertedRoom.name).toBe("The Northern Swamps");
          
          console.log(`✅ Successfully reverted room ${revertedRoom.id} to original state`);
        });
    });
  });

  describe('error handling', () => {
    it('should handle non-existent zone gracefully', () => {
      const query = `
        query {
          zone(id: 99999) {
            id
            name
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.zone).toBeNull();
          
          console.log(`✅ Non-existent zone query handled gracefully`);
        });
    });

    it('should handle non-existent room gracefully', () => {
      const query = `
        query {
          room(id: 99999) {
            id
            name
          }
        }
      `;

      return request(app.getHttpServer())
        .post('/graphql')
        .send({ query })
        .expect(200)
        .then(response => {
          expect(response.body.data).toBeDefined();
          expect(response.body.data.room).toBeNull();
          
          console.log(`✅ Non-existent room query handled gracefully`);
        });
    });
  });
});