import { test, expect } from '@playwright/test';
const API_URL = 'http://localhost:4000/graphql';
test.describe('Grants System', () => {
    let godToken;
    let godUserId;
    let builderToken;
    let builderUserId;
    test.beforeAll(async ({ request }) => {
        // Login as GOD user
        const godLogin = await request.post(API_URL, {
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
        const godData = await godLogin.json();
        godToken = godData.data.login.accessToken;
        godUserId = godData.data.login.user.id;
        // Login as BUILDER user
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
        builderToken = builderData.data.login.accessToken;
        builderUserId = builderData.data.login.user.id;
    });
    test('HEAD_BUILDER+ should grant zone access', async ({ request }) => {
        const response = await request.post(API_URL, {
            headers: { Authorization: `Bearer ${godToken}` },
            data: {
                query: `
          mutation {
            grantZoneAccess(data: {
              userId: "${builderUserId}",
              zoneId: 30,
              permissions: [WRITE, READ]
            }) {
              id
              userId
              resourceType
              resourceId
              permissions
            }
          }
        `,
            },
        });
        const data = await response.json();
        expect(data.errors).toBeUndefined();
        expect(data.data.grantZoneAccess).toBeTruthy();
        expect(data.data.grantZoneAccess.resourceType).toBe('ZONE');
        expect(data.data.grantZoneAccess.resourceId).toBe('30');
        expect(data.data.grantZoneAccess.permissions).toContain('WRITE');
    });
    test('should list grants for user', async ({ request }) => {
        const response = await request.post(API_URL, {
            headers: { Authorization: `Bearer ${godToken}` },
            data: {
                query: `
          query {
            userGrants(userId: "${builderUserId}") {
              id
              resourceType
              resourceId
              permissions
            }
          }
        `,
            },
        });
        const data = await response.json();
        expect(data.errors).toBeUndefined();
        expect(data.data.userGrants).toBeTruthy();
        expect(Array.isArray(data.data.userGrants)).toBe(true);
    });
    test('should check zone permission', async ({ request }) => {
        const response = await request.post(API_URL, {
            headers: { Authorization: `Bearer ${godToken}` },
            data: {
                query: `
          query {
            checkZonePermission(
              userId: "${builderUserId}",
              zoneId: 30,
              permission: WRITE
            )
          }
        `,
            },
        });
        const data = await response.json();
        expect(data.errors).toBeUndefined();
        expect(data.data.checkZonePermission).toBe(true);
    });
    test('should revoke grant', async ({ request }) => {
        // First, get the grant ID
        const listResponse = await request.post(API_URL, {
            headers: { Authorization: `Bearer ${godToken}` },
            data: {
                query: `
          query {
            userGrants(userId: "${builderUserId}") {
              id
              resourceType
              resourceId
            }
          }
        `,
            },
        });
        const listData = await listResponse.json();
        if (listData.data.userGrants.length === 0) {
            test.skip();
            return;
        }
        const grantId = listData.data.userGrants[0].id;
        // Now revoke it
        const revokeResponse = await request.post(API_URL, {
            headers: { Authorization: `Bearer ${godToken}` },
            data: {
                query: `
          mutation {
            revokeGrant(id: ${grantId})
          }
        `,
            },
        });
        const revokeData = await revokeResponse.json();
        expect(revokeData.errors).toBeUndefined();
        expect(revokeData.data.revokeGrant).toBe(true);
    });
    test('BUILDER should not grant zone access', async ({ request }) => {
        const response = await request.post(API_URL, {
            headers: { Authorization: `Bearer ${builderToken}` },
            data: {
                query: `
          mutation {
            grantZoneAccess(data: {
              userId: "${builderUserId}",
              zoneId: 40,
              permissions: [WRITE]
            }) {
              id
            }
          }
        `,
            },
        });
        const data = await response.json();
        expect(data.errors).toBeDefined();
        expect(data.errors[0].extensions.code).toBe('FORBIDDEN');
    });
});
//# sourceMappingURL=grants.spec.js.map