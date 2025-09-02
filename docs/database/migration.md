# Database Migration Guide

Comprehensive guide for migrating the Muditor database schema and handling data transformations.

## Overview

This guide covers database schema migrations, data transformations, and upgrade procedures for the Muditor PostgreSQL database using Prisma ORM.

## Migration Strategy

### Development vs Production

**Development Environment:**
- Use `prisma db push` for rapid prototyping
- Force reset allowed: `prisma db push --force-reset`
- Schema changes applied immediately

**Production Environment:**
- Use `prisma migrate deploy` for controlled deployments
- All migrations reviewed and tested
- Rollback procedures documented

### Migration Workflow

```mermaid
graph LR
    A[Schema Change] --> B[Generate Migration]
    B --> C[Review Migration]
    C --> D[Test Migration]
    D --> E[Apply Migration]
    E --> F[Verify Results]
```

---

## Schema Evolution History

### v1.0.0 - Initial Schema
- Basic user management
- Simple world structure
- String-based flag systems

### v2.0.0 - Enum Conversion (Current)
- **Breaking Change**: Flag fields converted to enums
- **Benefits**: Type safety, data validation, performance
- **Impact**: All flag-based data requires transformation

#### Major Changes:
```sql
-- Before: String arrays
"mobFlags" TEXT[]
"effectFlags" TEXT[]

-- After: Enum arrays  
"mobFlags" "MobFlag"[]
"effectFlags" "EffectFlag"[]
```

---

## Current Migration Requirements

### Enum Conversion Migration

**Affected Tables:**
- `mobs` - mobFlags, effectFlags, position, gender, race, size, lifeForce, composition, stance, damageType
- `objects` - flags, effectFlags, wearFlags
- `rooms` - flags
- `shops` - flags, tradesWithFlags
- `triggers` - flags
- `characters` - race

**Migration Process:**

1. **Generate Migration:**
```bash
pnpm prisma migrate dev --name "convert-flags-to-enums"
```

2. **Review Generated SQL:**
```sql
-- Drop and recreate columns (data loss warning)
ALTER TABLE "mobs" DROP COLUMN "mobFlags";
ALTER TABLE "mobs" ADD COLUMN "mobFlags" "MobFlag"[];

-- Create enum types
CREATE TYPE "MobFlag" AS ENUM ('SPEC', 'SENTINEL', 'ISNPC', ...);
```

3. **Data Preservation Strategy:**
Since this is a breaking change that drops/recreates columns, we use:
- **Development**: `prisma db push --force-reset` + re-seed
- **Production**: Custom migration with data transformation

---

## Custom Data Migration

### Production-Safe Migration

For production environments, create custom migration files:

```sql
-- migration.sql
BEGIN;

-- Create temporary columns
ALTER TABLE "mobs" ADD COLUMN "mobFlags_new" "MobFlag"[];
ALTER TABLE "mobs" ADD COLUMN "effectFlags_new" "EffectFlag"[];

-- Transform data
UPDATE "mobs" SET 
  "mobFlags_new" = CASE 
    WHEN 'SENTINEL' = ANY("mobFlags") THEN ARRAY['SENTINEL'::"MobFlag"]
    ELSE ARRAY[]::"MobFlag"[]
  END,
  "effectFlags_new" = CASE
    WHEN 'INVISIBLE' = ANY("effectFlags") THEN ARRAY['INVISIBLE'::"EffectFlag"]
    ELSE ARRAY[]::"EffectFlag"[]
  END;

-- Drop old columns and rename new ones
ALTER TABLE "mobs" DROP COLUMN "mobFlags";
ALTER TABLE "mobs" DROP COLUMN "effectFlags";
ALTER TABLE "mobs" RENAME COLUMN "mobFlags_new" TO "mobFlags";
ALTER TABLE "mobs" RENAME COLUMN "effectFlags_new" TO "effectFlags";

COMMIT;
```

### Data Transformation Functions

```typescript
// Migration helper functions
export class MigrationHelper {
  static convertMobFlags(legacyFlags: string[]): MobFlag[] {
    return legacyFlags.map(flag => {
      switch (flag.toUpperCase()) {
        case 'SENTINEL': return MobFlag.SENTINEL;
        case 'ISNPC': return MobFlag.ISNPC;
        case 'AGGRESSIVE': return MobFlag.AGGRESSIVE;
        // ... all other mappings
        default: return MobFlag.ISNPC; // Safe fallback
      }
    }).filter(Boolean);
  }

  static convertRace(legacyRace: number | string): Race {
    if (typeof legacyRace === 'number') {
      // Legacy numeric mapping
      const raceMap = [Race.HUMAN, Race.ELF, Race.GNOME, /* ... */];
      return raceMap[legacyRace] || Race.HUMAN;
    }
    // String-based mapping
    return Race[legacyRace.toUpperCase() as keyof typeof Race] || Race.HUMAN;
  }
}
```

---

## Migration Procedures

### Pre-Migration Checklist

- [ ] **Backup Production Database**
  ```bash
  pg_dump muditor_prod > backup_$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] **Test Migration on Copy**
  ```bash
  # Create test database from backup
  createdb muditor_test
  psql muditor_test < backup_latest.sql
  ```

- [ ] **Verify Data Mapping**
  ```sql
  -- Check flag distributions before migration
  SELECT unnest("mobFlags") as flag, count(*) 
  FROM mobs 
  GROUP BY flag 
  ORDER BY count DESC;
  ```

- [ ] **Estimate Migration Time**
  ```sql
  -- Count affected records
  SELECT 
    (SELECT count(*) FROM mobs) as mobs,
    (SELECT count(*) FROM objects) as objects,
    (SELECT count(*) FROM rooms) as rooms;
  ```

### Migration Execution

1. **Put Application in Maintenance Mode**
   ```bash
   # Stop application servers
   systemctl stop muditor-api
   systemctl stop muditor-web
   ```

2. **Run Migration**
   ```bash
   # Apply migration
   cd packages/db
   pnpm prisma migrate deploy
   ```

3. **Verify Migration**
   ```sql
   -- Check schema changes
   \d+ mobs
   
   -- Verify data integrity
   SELECT count(*) FROM mobs WHERE "mobFlags" IS NOT NULL;
   ```

4. **Restart Application**
   ```bash
   systemctl start muditor-api
   systemctl start muditor-web
   ```

### Post-Migration Validation

```typescript
// Validation script
export async function validateMigration(prisma: PrismaClient) {
  // Check enum constraints
  const mobsWithInvalidFlags = await prisma.mob.findMany({
    where: { mobFlags: { isEmpty: false } }
  });

  // Verify relationships
  const shopsWithKeepers = await prisma.shop.count({
    where: { keeperId: { not: null } }
  });

  // Check data completeness
  const totalMobs = await prisma.mob.count();
  const mobsWithFlags = await prisma.mob.count({
    where: { mobFlags: { isEmpty: false } }
  });

  console.log(`Migration validation:
    - Total mobs: ${totalMobs}
    - Mobs with flags: ${mobsWithFlags}
    - Shops with keepers: ${shopsWithKeepers}
  `);
}
```

---

## Rollback Procedures

### Automatic Rollback
Prisma doesn't support automatic rollbacks. Manual procedures required.

### Manual Rollback Steps

1. **Restore from Backup**
   ```bash
   # Stop application
   systemctl stop muditor-api muditor-web
   
   # Drop current database
   dropdb muditor_prod
   
   # Restore from backup
   createdb muditor_prod
   psql muditor_prod < backup_pre_migration.sql
   
   # Restart with old version
   git checkout previous-version
   systemctl start muditor-api muditor-web
   ```

2. **Partial Rollback (Column-Specific)**
   ```sql
   -- If only specific changes need rollback
   BEGIN;
   
   -- Recreate old columns
   ALTER TABLE "mobs" ADD COLUMN "mobFlags_old" TEXT[];
   
   -- Transform data back
   UPDATE "mobs" SET "mobFlags_old" = 
     array(SELECT unnest("mobFlags")::text);
   
   -- Replace columns
   ALTER TABLE "mobs" DROP COLUMN "mobFlags";
   ALTER TABLE "mobs" RENAME COLUMN "mobFlags_old" TO "mobFlags";
   
   COMMIT;
   ```

---

## Development Migrations

### Rapid Prototyping
```bash
# Quick schema sync (development only)
pnpm prisma db push

# Reset and re-seed
pnpm prisma db push --force-reset
pnpm seed
```

### Schema Drift Detection
```bash
# Check for uncommitted schema changes
pnpm prisma migrate diff \
  --from-schema-datasource prisma/schema.prisma \
  --to-schema-datamodel prisma/schema.prisma
```

### Migration Generation
```bash
# Create new migration
pnpm prisma migrate dev --name "add-new-feature"

# Create empty migration for custom SQL
pnpm prisma migrate dev --create-only --name "custom-data-transform"
```

---

## Performance Considerations

### Index Management

**Automatic Indexes:**
- Primary keys automatically indexed
- Foreign keys automatically indexed
- Unique constraints automatically indexed

**Custom Indexes:**
```sql
-- Add indexes for common queries
CREATE INDEX idx_mobs_zone_id ON mobs(zoneId);
CREATE INDEX idx_rooms_sector ON rooms(sector);
CREATE INDEX idx_objects_type ON objects(type);

-- Partial indexes for enum arrays
CREATE INDEX idx_mobs_aggressive ON mobs USING GIN (mobFlags)
WHERE 'AGGRESSIVE' = ANY(mobFlags);
```

### Migration Performance

**Large Table Strategies:**
```sql
-- Batch updates for large tables
DO $$
DECLARE
    batch_size INTEGER := 1000;
    total_rows INTEGER;
    processed INTEGER := 0;
BEGIN
    SELECT count(*) INTO total_rows FROM large_table;
    
    WHILE processed < total_rows LOOP
        UPDATE large_table 
        SET new_column = transform_function(old_column)
        WHERE id IN (
            SELECT id FROM large_table 
            WHERE new_column IS NULL 
            LIMIT batch_size
        );
        
        processed := processed + batch_size;
        
        -- Progress logging
        RAISE NOTICE 'Processed %/% rows (%.1f%%)', 
            processed, total_rows, 
            (processed::float / total_rows * 100);
        
        -- Small delay to prevent lock contention
        PERFORM pg_sleep(0.1);
    END LOOP;
END $$;
```

---

## Monitoring and Alerts

### Migration Monitoring
```sql
-- Check migration progress
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE tablename IN ('mobs', 'objects', 'rooms')
ORDER BY n_tup_upd DESC;
```

### Health Checks
```typescript
export async function databaseHealthCheck(prisma: PrismaClient) {
  const checks = {
    connection: false,
    enumIntegrity: false,
    referentialIntegrity: false,
    dataConsistency: false
  };

  try {
    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    checks.connection = true;

    // Test enum values
    await prisma.mob.findFirst({
      where: { mobFlags: { has: MobFlag.ISNPC } }
    });
    checks.enumIntegrity = true;

    // Test foreign keys
    const orphanedShops = await prisma.shop.count({
      where: { 
        keeperId: { not: null },
        keeper: null 
      }
    });
    checks.referentialIntegrity = orphanedShops === 0;

    // Test data consistency
    const totalMobs = await prisma.mob.count();
    const validMobs = await prisma.mob.count({
      where: { mobFlags: { isEmpty: false } }
    });
    checks.dataConsistency = validMobs > 0;

  } catch (error) {
    console.error('Health check failed:', error);
  }

  return checks;
}
```

---

## Troubleshooting

### Common Migration Issues

**"Column does not exist" Error:**
```sql
-- Check if column exists before dropping
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'mobs' AND column_name = 'mobFlags') THEN
        ALTER TABLE mobs DROP COLUMN mobFlags;
    END IF;
END $$;
```

**Enum Value Conflicts:**
```sql
-- Handle unknown enum values
UPDATE mobs SET mobFlags = array_remove(mobFlags, 'UNKNOWN_FLAG');
```

**Foreign Key Violations:**
```sql
-- Find orphaned records
SELECT s.id, s.keeperId 
FROM shops s 
LEFT JOIN mobs m ON s.keeperId = m.id 
WHERE s.keeperId IS NOT NULL AND m.id IS NULL;

-- Clean up orphaned records
UPDATE shops SET keeperId = NULL WHERE keeperId NOT IN (SELECT id FROM mobs);
```

### Recovery Procedures

**Corrupted Migration:**
1. Stop application
2. Restore from backup
3. Review and fix migration SQL
4. Re-run migration
5. Validate results

**Performance Issues:**
1. Add missing indexes
2. Analyze query patterns
3. Consider batch processing
4. Monitor resource usage

For detailed schema information, see [schema.md](./schema.md).
For current enum definitions, see [enums.md](./enums.md).