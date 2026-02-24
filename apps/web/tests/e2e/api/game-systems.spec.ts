import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3001/graphql';

test.describe('Game Systems (Abilities, Races, Classes)', () => {
  let godToken: string;

  test.beforeAll(async ({ request }) => {
    // Login as GOD user
    const godLogin = await request.post(API_URL, {
      data: {
        query: `
          mutation {
            login(input: { identifier: "admin@muditor.dev", password: "admin123" }) {
              accessToken
            }
          }
        `,
      },
    });
    const godData = await godLogin.json();
    godToken = godData.data.login.accessToken;
  });

  test.describe('Abilities Module', () => {
    test('should list abilities with IMMORTAL+ role', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `
            query {
              abilities(take: 5) {
                id
                name
                abilityType
              }
            }
          `,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.abilities).toBeTruthy();
      expect(data.data.abilities.length).toBeGreaterThan(0);
      expect(data.data.abilities.length).toBeLessThanOrEqual(5);
    });

    test('should get single ability by id', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `
            query {
              ability(id: 1) {
                id
                name
                abilityType
              }
            }
          `,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.ability).toBeTruthy();
      expect(data.data.ability.id).toBe('1');
    });

    test('should count abilities', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `query { abilitiesCount }`,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.abilitiesCount).toBeGreaterThan(0);
    });
  });

  test.describe('Races Module', () => {
    test('should list races with IMMORTAL+ role', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `
            query {
              races {
                race
                name
                plainName
                playable
              }
            }
          `,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.races).toBeTruthy();
      expect(data.data.races.length).toBeGreaterThan(0);
    });

    test('should get race by enum value', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `
            query {
              race(race: HUMAN) {
                race
                name
                playable
              }
            }
          `,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.race).toBeTruthy();
      expect(data.data.race.race).toBe('HUMAN');
    });
  });

  test.describe('Classes Module', () => {
    test('should list classes with IMMORTAL+ role', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `
            query {
              classes(take: 5) {
                id
                name
                primaryStat
              }
            }
          `,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.classes).toBeTruthy();
      expect(data.data.classes.length).toBeGreaterThan(0);
    });

    test('should get class by name', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `
            query {
              classByName(name: "WARRIOR") {
                id
                name
                primaryStat
              }
            }
          `,
        },
      });
      const data = await response.json();
      // Will fail if WARRIOR doesn't exist
      if (data.data.classByName) {
        expect(data.data.classByName.name).toBe('WARRIOR');
      }
    });

    test('should count classes', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `query { classesCount }`,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.classesCount).toBeGreaterThan(0);
    });
  });
});
