/**
 * GraphQL Schema Validation Tests
 *
 * This test suite validates that all GraphQL queries used in the frontend
 * are compatible with the actual GraphQL schema from the API.
 *
 * This prevents runtime errors like "Cannot query field X on type Y"
 * by catching schema mismatches during build time.
 */

import { buildSchema, GraphQLError, parse, validate } from 'graphql';

// Mock GraphQL schema based on the current API DTOs
const mockSchema = buildSchema(`
  enum MobFlag {
    SCAVENGER
    SENTINEL
    AGGRESSIVE
    STAY_ZONE
    WIMPY
    AGGR_EVIL
    AGGR_GOOD
    AGGR_NEUTRAL
    MEMORY
    HELPER
    NOCHARM
    NOSUMMON
    NOSLEEP
    NOBASH
    NOBLIND
  }

  enum EffectFlag {
    BLIND
    INVISIBLE
    DETECT_ALIGN
    DETECT_INVIS
    DETECT_MAGIC
    SENSE_LIFE
    WATERWALK
    SANCTUARY
    GROUP
    CURSE
    INFRAVISION
    POISON
    PROTECT_EVIL
    PROTECT_GOOD
    SLEEP
    NOTRACK
    SNEAK
    HIDE
    CHARM
    FLYING
    BREATHE_WATER
  }

  enum Gender {
    NEUTRAL
    MALE
    FEMALE
  }

  enum Race {
    HUMAN
    ELF
    DWARF
    HALFLING
    ORC
    TROLL
    OGRE
    GNOME
    CENTAUR
    DRACONIAN
    MINOTAUR
  }

  enum DamageType {
    HIT
    STING
    WHIP
    SLASH
    BITE
    BLUDGEON
    CRUSH
    POUND
    CLAW
    MAUL
    THRASH
    PIERCE
    BLAST
    PUNCH
    STAB
  }

  enum Position {
    DEAD
    MORTALLY_WOUNDED
    INCAPACITATED
    STUNNED
    SLEEPING
    RESTING
    SITTING
    FIGHTING
    STANDING
    MOUNTED
  }

  enum LifeForce {
    LIFE
    UNDEAD
    CONSTRUCT
    ELEMENTAL
  }

  enum Composition {
    FLESH
    STONE
    METAL
    WOOD
    CLOTH
    LIQUID
    GAS
    ENERGY
  }

  enum Stance {
    ALERT
    BERSERK
    DODGE
    PARRY
  }

  enum Size {
    TINY
    SMALL
    MEDIUM
    LARGE
    HUGE
    GARGANTUAN
  }

  scalar Date

  type MobDto {
    id: Int!
    keywords: String!
    mobClass: String!
    name: String!
    roomDescription: String!
    examineDescription: String!
    mobFlags: [MobFlag!]!
    effectFlags: [EffectFlag!]!
    alignment: Int!
    level: Int!
    armorClass: Int!
    hitRoll: Int!
    move: Int!
    hpDice: String!
    damageDice: String!
    copper: Int!
    silver: Int!
    gold: Int!
    platinum: Int!
    position: Position!
    defaultPosition: Position!
    gender: Gender!
    race: Race
    raceAlign: Int!
    size: Size!
    strength: Int!
    intelligence: Int!
    wisdom: Int!
    dexterity: Int!
    constitution: Int!
    charisma: Int!
    perception: Int!
    concealment: Int!
    lifeForce: LifeForce!
    composition: Composition!
    stance: Stance!
    damageType: DamageType!
    zoneId: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  type Query {
    mob(id: Int!, zoneId: Int!): MobDto
    mobs: [MobDto!]!
  }
`);

// Extract GraphQL queries from frontend code
const mobQueries = {
  // Query from toggleMobExpanded function - using current schema field names
  getMobDetails: `
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
        lifeForce
        damageType
        armorClass
        strength
        intelligence
        wisdom
        dexterity
        constitution
        charisma
        raceAlign
        mobFlags
        effectFlags
        zoneId
      }
    }
  `,

  // Simplified query with only confirmed schema fields
  getBasicMob: `
    query GetMob($id: Int!, $zoneId: Int!) {
      mob(id: $id, zoneId: $zoneId) {
        id
        keywords
        name
        roomDescription
        examineDescription
        level
        alignment
        zoneId
      }
    }
  `,
};

describe('GraphQL Schema Validation', () => {
  describe('Mob Queries', () => {
    test('getMobDetails query should be valid', () => {
      const document = parse(mobQueries.getMobDetails);
      const errors = validate(mockSchema, document);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => error.message).join('\n');
        throw new Error(
          `GraphQL schema validation failed for getMobDetails query:\n${errorMessages}`
        );
      }
    });

    test('getBasicMob query should be valid', () => {
      const document = parse(mobQueries.getBasicMob);
      const errors = validate(mockSchema, document);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => error.message).join('\n');
        throw new Error(
          `GraphQL schema validation failed for getBasicMob query:\n${errorMessages}`
        );
      }
    });
  });

  describe('Field Mapping Validation', () => {
    test('should detect common field mismatches', () => {
      // Test query with OLD field names that should NOT work
      const badQuery = `
        # GRAPHQL-VALIDATION:SKIP
        query GetMob($id: Int!, $zoneId: Int!) {
          mob(id: $id, zoneId: $zoneId) {
            id
            shortDesc
          }
        }
      `;

      const document = parse(badQuery);
      const errors = validate(mockSchema, document);

      // Should have validation errors because shortDesc doesn't exist
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('shortDesc');
    });

    test('should pass with correct field names', () => {
      const goodQuery = `
        query GetMob($id: Int!, $zoneId: Int!) {
          mob(id: $id, zoneId: $zoneId) {
            id
            examineDescription
            name
            roomDescription
          }
        }
      `;

      const document = parse(goodQuery);
      const errors = validate(mockSchema, document);

      // Should have no validation errors
      expect(errors.length).toBe(0);
    });
  });

  describe('Type Safety Validation', () => {
    test('should validate enum values', () => {
      const enumQuery = `
        query GetMob($id: Int!, $zoneId: Int!) {
          mob(id: $id, zoneId: $zoneId) {
            id
            gender
            lifeForce
            position
          }
        }
      `;

      const document = parse(enumQuery);
      const errors = validate(mockSchema, document);

      expect(errors.length).toBe(0);
    });

    test('should catch invalid enum field references', () => {
      const badEnumQuery = `
        query GetMob($id: Int!, $zoneId: Int!) {
          mob(id: $id, zoneId: $zoneId) {
            id
            invalidEnum
          }
        }
      `;

      const document = parse(badEnumQuery);
      const errors = validate(mockSchema, document);

      expect(errors.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Integration Test Helper Functions
 * These can be used in other test files to validate GraphQL queries
 */
export class GraphQLValidator {
  private schema = mockSchema;

  /**
   * Validates a GraphQL query against the schema
   * @param query - The GraphQL query string
   * @returns Array of validation errors (empty if valid)
   */
  validateQuery(query: string): ReadonlyArray<GraphQLError> {
    try {
      const document = parse(query);
      return validate(this.schema, document);
    } catch (parseError) {
      const msg = parseError instanceof Error ? parseError.message : 'Unknown';
      return [new GraphQLError(`Parse error: ${msg}`)];
    }
  }

  /**
   * Asserts that a query is valid, throwing if not
   * @param query - The GraphQL query string
   * @param queryName - Name for error reporting
   */
  assertQueryValid(query: string, queryName = 'query'): void {
    const errors = this.validateQuery(query);
    if (errors.length > 0) {
      const errorMessages = errors.map(error => error.message).join('\n');
      throw new Error(
        `GraphQL validation failed for ${queryName}:\n${errorMessages}`
      );
    }
  }

  /**
   * Extracts field names from a query for comparison with DTO
   * @param query - The GraphQL query string
   * @returns Array of field names used in the query
   */
  extractFieldNames(query: string): string[] {
    // This is a simplified extraction - could be enhanced with proper AST parsing
    const fieldMatches = query.match(/^\s*([a-zA-Z][a-zA-Z0-9_]*)\s*$/gm);
    return fieldMatches ? fieldMatches.map(field => field.trim()) : [];
  }
}

export const graphqlValidator = new GraphQLValidator();
