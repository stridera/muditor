# Database API Reference

Comprehensive guide for database operations, best practices, and API patterns in the Muditor system.

## Overview

The database API layer provides type-safe, efficient access to the PostgreSQL database through Prisma ORM. This document covers common operations, performance patterns, and best practices.

## Architecture

```
GraphQL/REST API → Service Layer → Repository Layer → Prisma Client → PostgreSQL
        ↓              ↓              ↓               ↓           ↓
   Type Safety    Business Logic   Data Access    ORM Layer   Database
```

## Core Patterns

### Repository Pattern
```typescript
// Base repository interface
interface IRepository<T, CreateInput, UpdateInput> {
  findById(id: string | number): Promise<T | null>;
  findMany(filter?: object): Promise<T[]>;
  create(data: CreateInput): Promise<T>;
  update(id: string | number, data: UpdateInput): Promise<T>;
  delete(id: string | number): Promise<T>;
}

// Example implementation
export class MobRepository implements IRepository<Mob, MobCreateInput, MobUpdateInput> {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<Mob | null> {
    return this.prisma.mob.findUnique({
      where: { id },
      include: {
        zone: true,
        resets: {
          include: {
            room: true,
            carrying: { include: { object: true } },
            equipped: { include: { object: true } }
          }
        }
      }
    });
  }

  async findByZone(zoneId: number): Promise<Mob[]> {
    return this.prisma.mob.findMany({
      where: { zoneId },
      orderBy: { id: 'asc' }
    });
  }

  async create(data: MobCreateInput): Promise<Mob> {
    return this.prisma.mob.create({ data });
  }

  async updateFlags(id: number, flags: MobFlag[]): Promise<Mob> {
    return this.prisma.mob.update({
      where: { id },
      data: { mobFlags: flags }
    });
  }
}
```

### Service Layer
```typescript
export class WorldService {
  constructor(
    private mobRepository: MobRepository,
    private roomRepository: RoomRepository,
    private auditService: AuditService
  ) {}

  async getMobsInRoom(roomId: number): Promise<MobWithEquipment[]> {
    // Business logic: get mobs spawned in specific room
    const resets = await this.prisma.mobReset.findMany({
      where: { roomId },
      include: {
        mob: {
          include: {
            zone: true
          }
        },
        carrying: {
          include: { object: true }
        },
        equipped: {
          include: { object: true }
        }
      }
    });

    return resets.map(reset => ({
      ...reset.mob,
      inventory: reset.carrying.map(c => c.object),
      equipment: reset.equipped.map(e => ({ 
        object: e.object, 
        location: e.location 
      }))
    }));
  }

  async updateMobWithAudit(
    userId: string, 
    mobId: number, 
    updates: Partial<MobUpdateInput>
  ): Promise<Mob> {
    // Get current state for audit
    const currentMob = await this.mobRepository.findById(mobId);
    if (!currentMob) {
      throw new Error(`Mob ${mobId} not found`);
    }

    // Apply updates
    const updatedMob = await this.mobRepository.update(mobId, updates);

    // Log audit trail
    await this.auditService.logUpdate({
      userId,
      entityType: 'Mob',
      entityId: mobId.toString(),
      oldValues: currentMob,
      newValues: updatedMob
    });

    return updatedMob;
  }
}
```

---

## Common Operations

### Query Patterns

#### Basic Queries
```typescript
// Find single entity
const mob = await prisma.mob.findUnique({
  where: { id: 1234 }
});

// Find with relations
const mobWithZone = await prisma.mob.findUnique({
  where: { id: 1234 },
  include: {
    zone: true,
    resets: true
  }
});

// Find many with filtering
const aggressiveMobs = await prisma.mob.findMany({
  where: {
    mobFlags: {
      has: MobFlag.AGGRESSIVE
    }
  },
  orderBy: { level: 'desc' }
});

// Complex filtering with enums
const powerfulMobs = await prisma.mob.findMany({
  where: {
    AND: [
      { level: { gte: 50 } },
      { mobFlags: { has: MobFlag.AGGRESSIVE } },
      { size: { in: [Size.LARGE, Size.HUGE, Size.GIANT] } }
    ]
  }
});
```

#### Relationship Queries
```typescript
// Room with all contents
const roomWithContents = await prisma.room.findUnique({
  where: { id: 1234 },
  include: {
    zone: true,
    exits: true,
    extraDescs: true,
    mobResets: {
      include: {
        mob: true,
        carrying: { include: { object: true } },
        equipped: { include: { object: true } }
      }
    }
  }
});

// Zone with statistics
const zoneStats = await prisma.zone.findUnique({
  where: { id: 30 },
  include: {
    _count: {
      select: {
        rooms: true,
        mobs: true,
        objects: true,
        shops: true
      }
    }
  }
});
```

#### Enum Array Queries
```typescript
// Mobs with specific flag combinations
const sentinelGuards = await prisma.mob.findMany({
  where: {
    mobFlags: {
      hasEvery: [MobFlag.SENTINEL, MobFlag.AGGRESSIVE]
    }
  }
});

// Objects wearable on body
const armor = await prisma.object.findMany({
  where: {
    wearFlags: {
      has: WearFlag.BODY
    },
    type: ObjectType.ARMOR
  }
});

// Rooms with no special flags
const normalRooms = await prisma.room.findMany({
  where: {
    flags: {
      isEmpty: true
    }
  }
});
```

### Mutation Patterns

#### Creating Entities
```typescript
// Create mob with relationships
const newMob = await prisma.mob.create({
  data: {
    id: 5000,
    keywords: 'dragon red ancient',
    shortDesc: 'an ancient red dragon',
    longDesc: 'An enormous ancient red dragon coils here.',
    desc: 'This massive dragon has scales like molten metal...',
    mobFlags: [MobFlag.AGGRESSIVE, MobFlag.SENTINEL, MobFlag.AWARE],
    effectFlags: [EffectFlag.FLYING, EffectFlag.DETECT_INVIS],
    level: 80,
    race: Race.DRAGON_FIRE,
    size: Size.GARGANTUAN,
    position: Position.STANDING,
    defaultPosition: Position.STANDING,
    gender: Gender.NEUTRAL,
    lifeForce: LifeForce.LIFE,
    composition: Composition.FLESH,
    stance: Stance.ALERT,
    damageType: DamageType.CLAW,
    // Stats...
    zone: {
      connect: { id: 30 }
    }
  }
});
```

#### Updating with Enums
```typescript
// Add flags to existing mob
await prisma.mob.update({
  where: { id: 1234 },
  data: {
    mobFlags: {
      push: MobFlag.MEMORY // Add to existing array
    }
  }
});

// Replace all flags
await prisma.mob.update({
  where: { id: 1234 },
  data: {
    mobFlags: [MobFlag.AGGRESSIVE, MobFlag.AWARE, MobFlag.MEMORY]
  }
});

// Remove specific flag
const currentMob = await prisma.mob.findUnique({ 
  where: { id: 1234 }, 
  select: { mobFlags: true } 
});

await prisma.mob.update({
  where: { id: 1234 },
  data: {
    mobFlags: currentMob.mobFlags.filter(flag => flag !== MobFlag.AGGRESSIVE)
  }
});
```

#### Complex Transactions
```typescript
// Create mob with spawn configuration
const result = await prisma.$transaction(async (tx) => {
  // Create the mob
  const mob = await tx.mob.create({
    data: mobData
  });

  // Create spawn reset
  const mobReset = await tx.mobReset.create({
    data: {
      max: 1,
      mobId: mob.id,
      roomId: 1234,
      zoneId: 30
    }
  });

  // Add starting equipment
  const equipment = await tx.mobEquipped.createMany({
    data: [
      { resetId: mobReset.id, objectId: 5001, location: 'Body', max: 1 },
      { resetId: mobReset.id, objectId: 5002, location: 'Wield', max: 1 }
    ]
  });

  return { mob, mobReset, equipment };
});
```

---

## Advanced Patterns

### Aggregation and Analytics
```typescript
// Zone statistics
const zoneStats = await prisma.mob.groupBy({
  by: ['zoneId'],
  _count: {
    id: true
  },
  _avg: {
    level: true
  },
  _max: {
    level: true
  },
  where: {
    mobFlags: {
      has: MobFlag.AGGRESSIVE
    }
  }
});

// Flag distribution analysis
const flagStats = await prisma.$queryRaw<{flag: string, count: number}[]>`
  SELECT 
    unnest("mobFlags") as flag,
    count(*) as count
  FROM mobs 
  GROUP BY flag 
  ORDER BY count DESC
`;
```

### Full-Text Search
```typescript
// Search mobs by description
const searchResults = await prisma.mob.findMany({
  where: {
    OR: [
      { keywords: { contains: searchTerm, mode: 'insensitive' } },
      { shortDesc: { contains: searchTerm, mode: 'insensitive' } },
      { longDesc: { contains: searchTerm, mode: 'insensitive' } }
    ]
  },
  take: 20
});

// Advanced text search with PostgreSQL
const advancedSearch = await prisma.$queryRaw<Mob[]>`
  SELECT * FROM mobs 
  WHERE to_tsvector('english', keywords || ' ' || "shortDesc" || ' ' || "longDesc")
        @@ plainto_tsquery('english', ${searchTerm})
  ORDER BY ts_rank(
    to_tsvector('english', keywords || ' ' || "shortDesc" || ' ' || "longDesc"),
    plainto_tsquery('english', ${searchTerm})
  ) DESC
  LIMIT 20
`;
```

### Pagination
```typescript
// Cursor-based pagination
async function getMobsPaginated(
  cursor?: number,
  limit: number = 20,
  zoneId?: number
) {
  const mobs = await prisma.mob.findMany({
    take: limit + 1, // +1 to check if there's more
    cursor: cursor ? { id: cursor } : undefined,
    where: zoneId ? { zoneId } : undefined,
    orderBy: { id: 'asc' }
  });

  const hasMore = mobs.length > limit;
  const results = hasMore ? mobs.slice(0, -1) : mobs;
  const nextCursor = hasMore ? mobs[limit - 1].id : null;

  return {
    data: results,
    nextCursor,
    hasMore
  };
}

// Offset-based pagination
async function getMobsWithCount(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  
  const [mobs, total] = await Promise.all([
    prisma.mob.findMany({
      skip,
      take: limit,
      orderBy: { id: 'asc' }
    }),
    prisma.mob.count()
  ]);

  return {
    data: mobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}
```

### Performance Optimization
```typescript
// Efficient bulk operations
async function bulkUpdateMobFlags(updates: {id: number, flags: MobFlag[]}[]) {
  // Use transaction for consistency
  return prisma.$transaction(
    updates.map(update => 
      prisma.mob.update({
        where: { id: update.id },
        data: { mobFlags: update.flags }
      })
    )
  );
}

// Optimized queries with select
const lightweightMobs = await prisma.mob.findMany({
  select: {
    id: true,
    keywords: true,
    shortDesc: true,
    level: true,
    mobFlags: true
  },
  where: { zoneId: 30 }
});

// Efficient counting
const mobCount = await prisma.mob.count({
  where: {
    mobFlags: {
      has: MobFlag.AGGRESSIVE
    }
  }
});
```

---

## Error Handling

### Common Error Patterns
```typescript
class DatabaseService {
  async findMobById(id: number): Promise<Mob> {
    try {
      const mob = await this.prisma.mob.findUnique({
        where: { id }
      });

      if (!mob) {
        throw new NotFoundError(`Mob with ID ${id} not found`);
      }

      return mob;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
          case 'P2025': // Record not found
            throw new NotFoundError(`Mob with ID ${id} not found`);
          case 'P2002': // Unique constraint violation
            throw new ConflictError('Mob with this ID already exists');
          case 'P2003': // Foreign key constraint violation
            throw new ValidationError('Invalid zone reference');
          default:
            throw new DatabaseError(`Database error: ${error.message}`);
        }
      }
      throw error;
    }
  }
}

// Custom error types
class DatabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

class NotFoundError extends DatabaseError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
```

### Validation
```typescript
// Input validation with Zod
import { z } from 'zod';

const MobCreateSchema = z.object({
  id: z.number().int().positive(),
  keywords: z.string().min(1).max(100),
  shortDesc: z.string().min(1).max(200),
  longDesc: z.string().min(1).max(1000),
  mobFlags: z.array(z.nativeEnum(MobFlag)),
  level: z.number().int().min(1).max(100),
  race: z.nativeEnum(Race),
  zoneId: z.number().int().positive()
});

type ValidatedMobCreate = z.infer<typeof MobCreateSchema>;

async function createMobWithValidation(input: unknown): Promise<Mob> {
  // Validate input
  const validatedData = MobCreateSchema.parse(input);
  
  // Additional business validation
  const zone = await prisma.zone.findUnique({
    where: { id: validatedData.zoneId }
  });
  
  if (!zone) {
    throw new ValidationError(`Zone ${validatedData.zoneId} does not exist`);
  }

  // Create mob
  return prisma.mob.create({
    data: validatedData
  });
}
```

---

## Testing Patterns

### Unit Testing
```typescript
// Mock Prisma client
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('MobRepository', () => {
  let mockPrisma: DeepMockProxy<PrismaClient>;
  let mobRepository: MobRepository;

  beforeEach(() => {
    mockPrisma = mockDeep<PrismaClient>();
    mobRepository = new MobRepository(mockPrisma);
  });

  test('should find mob by id', async () => {
    const mockMob = {
      id: 1234,
      keywords: 'test mob',
      shortDesc: 'a test mob',
      mobFlags: [MobFlag.ISNPC]
    };

    mockPrisma.mob.findUnique.mockResolvedValue(mockMob as Mob);

    const result = await mobRepository.findById(1234);

    expect(mockPrisma.mob.findUnique).toHaveBeenCalledWith({
      where: { id: 1234 },
      include: expect.any(Object)
    });
    expect(result).toEqual(mockMob);
  });
});
```

### Integration Testing
```typescript
// Test with actual database
describe('Database Integration', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.TEST_DATABASE_URL }
      }
    });
  });

  beforeEach(async () => {
    // Clean database
    await prisma.mobReset.deleteMany();
    await prisma.mob.deleteMany();
    await prisma.zone.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('should create mob with enums', async () => {
    // Create zone first
    const zone = await prisma.zone.create({
      data: {
        id: 100,
        name: 'Test Zone',
        top: 199,
        lifespan: 30,
        resetMode: ResetMode.NORMAL,
        hemisphere: Hemisphere.NORTHWEST,
        climate: Climate.TEMPERATE
      }
    });

    // Create mob
    const mob = await prisma.mob.create({
      data: {
        id: 1001,
        keywords: 'test guard',
        shortDesc: 'a test guard',
        longDesc: 'A test guard stands here.',
        desc: 'This is a test guard.',
        mobFlags: [MobFlag.ISNPC, MobFlag.SENTINEL],
        effectFlags: [EffectFlag.DETECT_INVIS],
        level: 10,
        race: Race.HUMAN,
        gender: Gender.MALE,
        position: Position.STANDING,
        defaultPosition: Position.STANDING,
        size: Size.MEDIUM,
        lifeForce: LifeForce.LIFE,
        composition: Composition.FLESH,
        stance: Stance.ALERT,
        damageType: DamageType.HIT,
        zoneId: zone.id
      }
    });

    expect(mob.mobFlags).toEqual([MobFlag.ISNPC, MobFlag.SENTINEL]);
    expect(mob.race).toBe(Race.HUMAN);
  });
});
```

---

## Performance Best Practices

### Query Optimization
1. **Use appropriate indexes** for filtered fields
2. **Select only needed fields** to reduce payload
3. **Use joins instead of multiple queries** when possible
4. **Implement pagination** for large result sets
5. **Use database-level filtering** instead of application filtering

### Connection Management
```typescript
// Singleton pattern for Prisma client
class DatabaseManager {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error']
      });
    }
    return DatabaseManager.instance;
  }

  static async disconnect(): Promise<void> {
    if (DatabaseManager.instance) {
      await DatabaseManager.instance.$disconnect();
    }
  }
}
```

### Monitoring and Metrics
```typescript
// Query performance monitoring
class QueryMonitor {
  static async executeWithMetrics<T>(
    operation: string,
    query: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await query();
      const duration = Date.now() - startTime;
      
      console.log(`Query ${operation} completed in ${duration}ms`);
      
      // Send to monitoring service
      if (duration > 1000) {
        console.warn(`Slow query detected: ${operation} (${duration}ms)`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Query ${operation} failed after ${duration}ms:`, error);
      throw error;
    }
  }
}

// Usage
const mobs = await QueryMonitor.executeWithMetrics(
  'findMobsByZone',
  () => prisma.mob.findMany({ where: { zoneId: 30 } })
);
```

For schema details, see [schema.md](./schema.md).
For enum definitions, see [enums.md](./enums.md).
For import processes, see [world-import.md](./world-import.md).