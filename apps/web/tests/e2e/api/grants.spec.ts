import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:3001/graphql';

test.describe('Grants System', () => {
  let godToken: string;
  let builderToken: string;
  let builderUserId: string;

  test.beforeAll(async ({ request }) => {
    // Login as IMPLEMENTOR user
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
    // Clean up any existing zone 30 grant from previous test runs
    await request.post(API_URL, {
      headers: { Authorization: `Bearer ${godToken}` },
      data: {
        query: `
          mutation {
            revokeZoneAccess(userId: "${builderUserId}", zoneId: 30)
          }
        `,
      },
    });

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
            grants(userId: "${builderUserId}") {
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
    expect(data.data.grants).toBeTruthy();
    expect(Array.isArray(data.data.grants)).toBe(true);
  });

  test('should check zone permission via grants', async ({ request }) => {
    const response = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${godToken}` },
      data: {
        query: `
          query {
            userZoneGrants(userId: "${builderUserId}") {
              zoneId
              permissions
            }
          }
        `,
      },
    });
    const data = await response.json();
    expect(data.errors).toBeUndefined();

    const zoneGrants = data.data.userZoneGrants;
    const zone30Grant = zoneGrants.find(
      (g: { zoneId: string }) => g.zoneId === '30'
    );
    expect(zone30Grant).toBeTruthy();
    expect(zone30Grant.permissions).toContain('WRITE');
  });

  test('should revoke grant', async ({ request }) => {
    // First, get the grant ID
    const listResponse = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${godToken}` },
      data: {
        query: `
          query {
            grants(userId: "${builderUserId}") {
              id
              resourceType
              resourceId
            }
          }
        `,
      },
    });
    const listData = await listResponse.json();

    if (listData.data.grants.length === 0) {
      test.skip();
      return;
    }

    const grantId = listData.data.grants[0].id;

    // Now delete it (pass ID as integer, not string)
    const deleteResponse = await request.post(API_URL, {
      headers: { Authorization: `Bearer ${godToken}` },
      data: {
        query: `
          mutation {
            deleteGrant(id: ${grantId})
          }
        `,
      },
    });
    const deleteData = await deleteResponse.json();
    expect(deleteData.errors).toBeUndefined();
    expect(deleteData.data.deleteGrant).toBe(true);
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
