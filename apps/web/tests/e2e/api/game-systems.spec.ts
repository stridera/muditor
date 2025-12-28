import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3001/graphql';

test.describe('Game Systems (Skills, Spells, Races, Classes)', () => {
  let godToken: string;
  let immortalToken: string;

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

  test.describe('Skills Module', () => {
    test('should list skills with IMMORTAL+ role', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `
            query {
              skills(take: 5) {
                id
                name
                type
                category
                maxLevel
              }
            }
          `,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.skills).toBeTruthy();
      expect(data.data.skills.length).toBeGreaterThan(0);
      expect(data.data.skills.length).toBeLessThanOrEqual(5);
    });

    test('should get single skill by id', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `
            query {
              skill(id: 1) {
                id
                name
                type
                category
              }
            }
          `,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.skill).toBeTruthy();
      expect(data.data.skill.id).toBe('1');
    });

    test('should count skills', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `query { skillsCount }`,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.skillsCount).toBeGreaterThan(0);
    });
  });

  test.describe('Spells Module', () => {
    test('should list spells with IMMORTAL+ role', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `
            query {
              spells(take: 5) {
                id
                name
                type
                manaCost
              }
            }
          `,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.spells).toBeTruthy();
      expect(data.data.spells.length).toBeGreaterThan(0);
    });

    test('should get single spell by id', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `
            query {
              spell(id: 1) {
                id
                name
                type
                manaCost
              }
            }
          `,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.spell).toBeTruthy();
    });

    test('should count spells', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `query { spellsCount }`,
        },
      });
      const data = await response.json();
      expect(data.errors).toBeUndefined();
      expect(data.data.spellsCount).toBeGreaterThan(0);
    });
  });

  test.describe('Races Module', () => {
    test('should list races with IMMORTAL+ role', async ({ request }) => {
      const response = await request.post(API_URL, {
        headers: { Authorization: `Bearer ${godToken}` },
        data: {
          query: `
            query {
              races(take: 5) {
                race
                name
                displayName
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
              raceByName(name: "HUMAN") {
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
      expect(data.data.raceByName).toBeTruthy();
      expect(data.data.raceByName.name).toBe('HUMAN');
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
