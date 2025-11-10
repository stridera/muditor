/**
 * API Integration Tests
 *
 * These tests validate that the frontend GraphQL queries work correctly
 * with the actual API schema by making real requests to a test API.
 *
 * This catches schema mismatches, type errors, and field name conflicts
 * before they reach production.
 */

describe('API Integration Tests', () => {
  const API_URL = process.env.TEST_API_URL || 'http://localhost:4000/graphql';

  // Helper function to make GraphQL requests
  const makeGraphQLRequest = async (query: string, variables: any = {}) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();
    return result;
  };

  describe('Mob GraphQL Queries', () => {
    // Skip tests if API is not available
    let apiAvailable = false;

    beforeAll(async () => {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ __typename }' }),
        });
        apiAvailable = response.ok;
      } catch (error) {
        console.warn('⚠️  API not available at', API_URL);
        console.warn(
          '   Skipping integration tests. Start the API with: pnpm --filter @muditor/api dev'
        );
        apiAvailable = false;
      }
    });

    test('should fetch mob details without GraphQL errors', async () => {
      if (!apiAvailable) {
        console.log('⏭️  Skipping: API not available');
        return;
      }
      const query = `
        query GetMob($id: Int!, $zoneId: Int!) {
          mob(id: $id, zoneId: $zoneId) {
            id
            keywords
            name
            roomDescription
            examineDescription
            level
            alignment
            hpDice
            damageDice
            mobClass
            armorClass
            strength
            intelligence
            wisdom
            dexterity
            constitution
            charisma
            zoneId
          }
        }
      `;

      const result = await makeGraphQLRequest(query, { id: 1, zoneId: 1 });

      // Should not have GraphQL errors
      if (result.errors) {
        const errorMessages = result.errors
          .map((e: any) => e.message)
          .join('\n');
        throw new Error(`GraphQL errors in mob query:\n${errorMessages}`);
      }

      // If mob exists, should have expected structure
      if (result.data?.mob) {
        const mob = result.data.mob;
        expect(typeof mob.id).toBe('number');
        expect(typeof mob.name).toBe('string');
        expect(typeof mob.roomDescription).toBe('string');
        expect(typeof mob.level).toBe('number');
        // examineDescription should exist and be a string
        expect(typeof mob.examineDescription).toBe('string');
      }
    });

    test('should handle non-existent mob gracefully', async () => {
      if (!apiAvailable) {
        console.log('⏭️  Skipping: API not available');
        return;
      }
      const query = `
        query GetMob($id: Int!, $zoneId: Int!) {
          mob(id: $id, zoneId: $zoneId) {
            id
            name
            examineDescription
          }
        }
      `;

      const result = await makeGraphQLRequest(query, {
        id: 999999,
        zoneId: 999,
      });

      // Should not have GraphQL schema errors
      if (result.errors) {
        const schemaErrors = result.errors.filter(
          (e: any) =>
            e.message.includes('Cannot query field') ||
            e.message.includes('Unknown field')
        );

        if (schemaErrors.length > 0) {
          const errorMessages = schemaErrors
            .map((e: any) => e.message)
            .join('\n');
          throw new Error(`GraphQL schema errors:\n${errorMessages}`);
        }
      }

      // Should return null for non-existent mob (this is expected)
      expect(result.data?.mob).toBeNull();
    });

    test('should validate all commonly used mob fields exist', async () => {
      if (!apiAvailable) {
        console.log('⏭️  Skipping: API not available');
        return;
      }
      // Test a query with all the fields commonly used in the frontend
      const query = `
        query TestMobFields {
          __type(name: "MobDto") {
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;

      const result = await makeGraphQLRequest(query);

      if (result.errors) {
        throw new Error(
          `Schema introspection failed: ${result.errors[0].message}`
        );
      }

      const fields = result.data.__type.fields.map((f: any) => f.name);

      // Validate critical fields exist
      const requiredFields = [
        'id',
        'keywords',
        'name',
        'roomDescription',
        'examineDescription',
        'level',
        'alignment',
        'hpDice',
        'damageDice',
        'zoneId',
        'mobClass',
        'armorClass',
      ];

      const missingFields = requiredFields.filter(
        field => !fields.includes(field)
      );

      if (missingFields.length > 0) {
        throw new Error(
          `Missing required fields in MobDto: ${missingFields.join(', ')}`
        );
      }
    });
  });

  describe('Field Name Consistency', () => {
    // Skip tests if API is not available
    let apiAvailable = false;

    beforeAll(async () => {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ __typename }' }),
        });
        apiAvailable = response.ok;
      } catch (error) {
        apiAvailable = false;
      }
    });

    test('should not have shortDesc field (old field name)', async () => {
      if (!apiAvailable) {
        console.log('⏭️  Skipping: API not available');
        return;
      }
      const badQuery = `
        # GRAPHQL-VALIDATION:SKIP
        query TestBadField($id: Int!, $zoneId: Int!) {
          mob(id: $id, zoneId: $zoneId) {
            id
            shortDesc
          }
        }
      `;

      const result = await makeGraphQLRequest(badQuery, { id: 1, zoneId: 1 });

      // Should have GraphQL error about unknown field
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toMatch(/Cannot query field.*shortDesc/);
    });

    test('should have name field (correct name)', async () => {
      if (!apiAvailable) {
        console.log('⏭️  Skipping: API not available');
        return;
      }
      const goodQuery = `
        query TestGoodField($id: Int!, $zoneId: Int!) {
          mob(id: $id, zoneId: $zoneId) {
            id
            name
          }
        }
      `;

      const result = await makeGraphQLRequest(goodQuery, { id: 1, zoneId: 1 });

      // Should not have schema errors
      if (result.errors) {
        const schemaErrors = result.errors.filter(
          (e: any) =>
            e.message.includes('Cannot query field') ||
            e.message.includes('Unknown field')
        );
        expect(schemaErrors.length).toBe(0);
      }
    });
  });
});

/**
 * Schema Field Validator
 *
 * Utility class to validate GraphQL queries against expected schema
 */
export class ApiSchemaValidator {
  private apiUrl: string;

  constructor(apiUrl = 'http://localhost:4000/graphql') {
    this.apiUrl = apiUrl;
  }

  /**
   * Validates that a GraphQL query doesn't have schema errors
   */
  async validateQuery(
    query: string,
    variables: any = {}
  ): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();

      const schemaErrors = (result.errors || [])
        .filter(
          (e: any) =>
            e.message.includes('Cannot query field') ||
            e.message.includes('Unknown field') ||
            e.message.includes('Unknown argument')
        )
        .map((e: any) => e.message);

      return {
        isValid: schemaErrors.length === 0,
        errors: schemaErrors,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Network error: ${error.message}`],
      };
    }
  }

  /**
   * Gets all available fields for a GraphQL type
   */
  async getTypeFields(typeName: string): Promise<string[]> {
    const query = `
      query GetTypeFields($typeName: String!) {
        __type(name: $typeName) {
          fields {
            name
          }
        }
      }
    `;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { typeName } }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(
          `Schema introspection failed: ${result.errors[0].message}`
        );
      }

      return result.data?.__type?.fields?.map((f: any) => f.name) || [];
    } catch (error) {
      throw new Error(
        `Failed to get fields for type ${typeName}: ${error.message}`
      );
    }
  }
}

export const apiValidator = new ApiSchemaValidator();
