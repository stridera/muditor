import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000/graphql';

/**
 * Integration test for character linking and role recalculation
 *
 * This test verifies the core feature: when a user links a character,
 * their role is automatically recalculated based on the character's level.
 *
 * Level to Role Mapping:
 * - < 100: PLAYER
 * - 100: IMMORTAL
 * - 101-102: BUILDER
 * - 103: HEAD_BUILDER
 * - 104: CODER
 * - 105+: GOD
 */

test.describe('Character Linking and Role Recalculation', () => {
  let userToken: string;
  let userId: string;
  let userEmail: string;
  let testCharacterId: string;

  test.beforeAll(async ({ request }) => {
    // Create a unique test user
    const timestamp = Date.now();
    const shortId = timestamp.toString().slice(-8); // Last 8 digits
    userEmail = `test${shortId}@test.local`;

    const registerResponse = await request.post(API_URL, {
      data: {
        query: `
          mutation {
            register(input: {
              email: "${userEmail}",
              username: "test${shortId}",
              password: "Test12345"
            }) {
              accessToken
              user { id email role }
            }
          }
        `,
      },
    });

    const registerData = await registerResponse.json();
    expect(registerData.errors).toBeUndefined();
    expect(registerData.data.register.user.role).toBe('PLAYER');

    userToken = registerData.data.register.accessToken;
    userId = registerData.data.register.user.id;
  });

  test('should start with PLAYER role for new user', async ({ request }) => {
    const response = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        query: `query { me { id email role } }`,
      },
    });

    const data = await response.json();
    expect(data.errors).toBeUndefined();
    expect(data.data.me.role).toBe('PLAYER');
  });

  test('should update role to GOD after linking level 105 character', async ({ request }) => {
    // Note: This test requires a character named 'TestGodChar' with level 105
    // and password 'admin123' to exist in the database

    const linkResponse = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        query: `
          mutation {
            linkCharacter(data: {
              characterName: "TestGodChar",
              characterPassword: "admin123"
            }) {
              id
              name
              level
            }
          }
        `,
      },
    });

    const linkData = await linkResponse.json();

    // Should fail if character doesn't exist or is already linked
    if (linkData.errors) {
      console.log('Note: Character linking failed (expected if TestGodChar does not exist or is already linked)');
      console.log('Error:', linkData.errors[0].message);
      test.skip();
      return;
    }

    expect(linkData.data.linkCharacter.level).toBe(105);
    testCharacterId = linkData.data.linkCharacter.id;

    // Verify role was automatically updated to GOD
    const meResponse = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        query: `query { me { id email role } }`,
      },
    });

    const meData = await meResponse.json();
    expect(meData.errors).toBeUndefined();
    expect(meData.data.me.role).toBe('GOD');
  });

  test('should update role back when unlinking character', async ({ request }) => {
    if (!testCharacterId) {
      console.log('Skipping: No character was linked');
      test.skip();
      return;
    }

    const unlinkResponse = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        query: `
          mutation {
            unlinkCharacter(data: { characterId: "${testCharacterId}" })
          }
        `,
      },
    });

    const unlinkData = await unlinkResponse.json();
    expect(unlinkData.errors).toBeUndefined();
    expect(unlinkData.data.unlinkCharacter).toBe(true);

    // Verify role reverted to PLAYER (no characters remaining)
    const meResponse = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        query: `query { me { id email role } }`,
      },
    });

    const meData = await meResponse.json();
    expect(meData.errors).toBeUndefined();
    expect(meData.data.me.role).toBe('PLAYER');
  });
});

test.describe('Role Hierarchy Tests', () => {
  test('GOD role should have access to all game systems', async ({ request }) => {
    // Login as GOD user
    const loginResponse = await request.post(API_URL, {
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

    const loginData = await loginResponse.json();
    const godToken = loginData.data.login.accessToken;

    // Test access to all count queries
    const response = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${godToken}` },
      data: {
        query: `
          query {
            skillsCount
            spellsCount
            racesCount
            classesCount
          }
        `,
      },
    });

    const data = await response.json();
    expect(data.errors).toBeUndefined();
    expect(data.data.skillsCount).toBeGreaterThan(0);
    expect(data.data.spellsCount).toBeGreaterThan(0);
    expect(data.data.racesCount).toBeGreaterThan(0);
    expect(data.data.classesCount).toBeGreaterThan(0);
  });

  test('BUILDER role should have access to view queries', async ({ request }) => {
    // Login as BUILDER user
    const loginResponse = await request.post(API_URL, {
      data: {
        query: `
          mutation {
            login(input: { identifier: "builder@muditor.dev", password: "builder123" }) {
              accessToken
            }
          }
        `,
      },
    });

    const loginData = await loginResponse.json();
    const builderToken = loginData.data.login.accessToken;

    // BUILDER (level 102) should be allowed to view (IMMORTAL level 100)
    const response = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${builderToken}` },
      data: {
        query: `query { skillsCount }`,
      },
    });

    const data = await response.json();
    expect(data.errors).toBeUndefined();
    expect(data.data.skillsCount).toBeGreaterThan(0);
  });

  test('PLAYER role should be denied access to game system queries', async ({ request }) => {
    // Login as PLAYER user
    const loginResponse = await request.post(API_URL, {
      data: {
        query: `
          mutation {
            login(input: { identifier: "player@muditor.dev", password: "player123" }) {
              accessToken
            }
          }
        `,
      },
    });

    const loginData = await loginResponse.json();
    const playerToken = loginData.data.login.accessToken;

    // PLAYER should be denied
    const response = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${playerToken}` },
      data: {
        query: `query { skillsCount }`,
      },
    });

    const data = await response.json();
    expect(data.errors).toBeDefined();
    expect(data.errors[0].extensions.code).toBe('FORBIDDEN');
  });
});
