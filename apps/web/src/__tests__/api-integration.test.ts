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
    beforeAll(async () => {
      try {
        await fetch(API_URL);
      } catch (error) {
        console.warn('API not available, skipping integration tests');
        return;
      }
    });

    test('should fetch mob details without GraphQL errors', async () => {
      const query = `
        query GetMob($id: Int!) {
          mob(id: $id) {
            id
            keywords
            shortDesc
            longDesc
            desc
            level
            alignment
            hpDiceNum
            hpDiceSize
            hpDiceBonus
            damageDiceNum
            damageDiceSize
            damageDiceBonus
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

      const result = await makeGraphQLRequest(query, { id: 1 });
      
      // Should not have GraphQL errors
      if (result.errors) {
        const errorMessages = result.errors.map((e: any) => e.message).join('\n');
        throw new Error(`GraphQL errors in mob query:\n${errorMessages}`);
      }
      
      // If mob exists, should have expected structure
      if (result.data?.mob) {
        const mob = result.data.mob;
        expect(typeof mob.id).toBe('number');
        expect(typeof mob.shortDesc).toBe('string');
        expect(typeof mob.longDesc).toBe('string');
        expect(typeof mob.level).toBe('number');
        // desc should exist and be a string (this was the field causing the error)
        expect(typeof mob.desc).toBe('string');
      }
    });

    test('should handle non-existent mob gracefully', async () => {
      const query = `
        query GetMob($id: Int!) {
          mob(id: $id) {
            id
            shortDesc
            desc
          }
        }
      `;

      const result = await makeGraphQLRequest(query, { id: 999999 });
      
      // Should not have GraphQL schema errors
      if (result.errors) {
        const schemaErrors = result.errors.filter((e: any) => 
          e.message.includes('Cannot query field') || 
          e.message.includes('Unknown field')
        );
        
        if (schemaErrors.length > 0) {
          const errorMessages = schemaErrors.map((e: any) => e.message).join('\n');
          throw new Error(`GraphQL schema errors:\n${errorMessages}`);
        }
      }
      
      // Should return null for non-existent mob (this is expected)
      expect(result.data?.mob).toBeNull();
    });

    test('should validate all commonly used mob fields exist', async () => {
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
        throw new Error(`Schema introspection failed: ${result.errors[0].message}`);
      }

      const fields = result.data.__type.fields.map((f: any) => f.name);
      
      // Validate critical fields exist
      const requiredFields = [
        'id', 'keywords', 'shortDesc', 'longDesc', 'desc', 'level', 
        'alignment', 'hpDiceNum', 'hpDiceSize', 'hpDiceBonus',
        'damageDiceNum', 'damageDiceSize', 'damageDiceBonus',
        'zoneId', 'mobClass', 'armorClass'
      ];

      const missingFields = requiredFields.filter(field => !fields.includes(field));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields in MobDto: ${missingFields.join(', ')}`);
      }
    });
  });

  describe('Field Name Consistency', () => {
    test('should not have detailedDesc field (common mistake)', async () => {
      const badQuery = `
        query TestBadField($id: Int!) {
          mob(id: $id) {
            id
            detailedDesc
          }
        }
      `;

      const result = await makeGraphQLRequest(badQuery, { id: 1 });
      
      // Should have GraphQL error about unknown field
      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toMatch(/Cannot query field.*detailedDesc/);
    });

    test('should have desc field (correct name)', async () => {
      const goodQuery = `
        query TestGoodField($id: Int!) {
          mob(id: $id) {
            id
            desc
          }
        }
      `;

      const result = await makeGraphQLRequest(goodQuery, { id: 1 });
      
      // Should not have schema errors
      if (result.errors) {
        const schemaErrors = result.errors.filter((e: any) => 
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
  async validateQuery(query: string, variables: any = {}): Promise<{ 
    isValid: boolean; 
    errors: string[] 
  }> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      });
      
      const result = await response.json();
      
      const schemaErrors = (result.errors || [])
        .filter((e: any) => 
          e.message.includes('Cannot query field') || 
          e.message.includes('Unknown field') ||
          e.message.includes('Unknown argument')
        )
        .map((e: any) => e.message);
      
      return {
        isValid: schemaErrors.length === 0,
        errors: schemaErrors
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Network error: ${error.message}`]
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
        throw new Error(`Schema introspection failed: ${result.errors[0].message}`);
      }
      
      return result.data?.__type?.fields?.map((f: any) => f.name) || [];
    } catch (error) {
      throw new Error(`Failed to get fields for type ${typeName}: ${error.message}`);
    }
  }
}

export const apiValidator = new ApiSchemaValidator();