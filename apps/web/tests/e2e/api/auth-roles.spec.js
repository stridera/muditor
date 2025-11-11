import { test, expect } from '@playwright/test';
const API_URL = 'http://localhost:4000/graphql';
test.describe('Authentication and Role System', () => {
    let adminToken;
    let builderToken;
    let playerToken;
    test.beforeAll(async ({ request }) => {
        // Login as admin (GOD role)
        const adminLogin = await request.post(API_URL, {
            data: {
                query: `
          mutation {
            login(input: { identifier: "admin@muditor.dev", password: "admin123" }) {
              accessToken
              user { id email role }
            }
          }
        `,
            },
        });
        const adminData = await adminLogin.json();
        expect(adminData.data.login.user.role).toBe('GOD');
        adminToken = adminData.data.login.accessToken;
        // Login as builder (BUILDER role)
        const builderLogin = await request.post(API_URL, {
            data: {
                query: `
          mutation {
            login(input: { identifier: "builder@muditor.dev", password: "builder123" }) {
              accessToken
              user { id email role }
            }
          }
        `,
            },
        });
        const builderData = await builderLogin.json();
        expect(builderData.data.login.user.role).toBe('BUILDER');
        builderToken = builderData.data.login.accessToken;
        // Login as player (PLAYER role)
        const playerLogin = await request.post(API_URL, {
            data: {
                query: `
          mutation {
            login(input: { identifier: "player@muditor.dev", password: "player123" }) {
              accessToken
              user { id email role }
            }
          }
        `,
            },
        });
        const playerData = await playerLogin.json();
        expect(playerData.data.login.user.role).toBe('PLAYER');
        playerToken = playerData.data.login.accessToken;
    });
    test('should authenticate and return correct roles', async () => {
        expect(adminToken).toBeTruthy();
        expect(builderToken).toBeTruthy();
        expect(playerToken).toBeTruthy();
    });
    test('GOD role should access all queries', async ({ request }) => {
        const response = await request.post(API_URL, {
            headers: { Authorization: `Bearer ${adminToken}` },
            data: {
                query: `
          query {
            skills(take: 3) { id name }
            spells(take: 3) { id name }
            races { race name }
            classes(take: 3) { id name }
          }
        `,
            },
        });
        const data = await response.json();
        expect(data.errors).toBeUndefined();
        expect(data.data.skills).toHaveLength(3);
        expect(data.data.spells).toHaveLength(3);
        expect(data.data.races.length).toBeGreaterThan(0);
        expect(data.data.classes).toHaveLength(3);
    });
    test('BUILDER role should be allowed (level 102 ≥ IMMORTAL 100)', async ({ request }) => {
        // BUILDER (level 101-102) is above IMMORTAL (level 100) in the hierarchy
        const response = await request.post(API_URL, {
            headers: { Authorization: `Bearer ${builderToken}` },
            data: {
                query: `query { skills(take: 3) { id name } }`,
            },
        });
        const data = await response.json();
        // BUILDER should be allowed to view since BUILDER > IMMORTAL in hierarchy
        expect(data.errors).toBeUndefined();
        expect(data.data.skills).toBeTruthy();
    });
    test('PLAYER role should be denied access', async ({ request }) => {
        const response = await request.post(API_URL, {
            headers: { Authorization: `Bearer ${playerToken}` },
            data: {
                query: `query { skills(take: 3) { id name } }`,
            },
        });
        const data = await response.json();
        expect(data.errors).toBeDefined();
        expect(data.errors[0].extensions.code).toBe('FORBIDDEN');
    });
    test('unauthenticated requests should be rejected', async ({ request }) => {
        const response = await request.post(API_URL, {
            data: {
                query: `query { skills(take: 3) { id name } }`,
            },
        });
        const data = await response.json();
        expect(data.errors).toBeDefined();
        expect(data.errors[0].message).toContain('No token provided');
    });
});
//# sourceMappingURL=auth-roles.spec.js.map