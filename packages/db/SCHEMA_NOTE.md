# Schema Note

## Two Prisma Schemas, One Database

This project uses **two Prisma schemas** that point to the **same PostgreSQL database**:

### 1. Muditor Schema (TypeScript - **SOURCE OF TRUTH**)

**Location**: `/home/strider/Code/mud/muditor/packages/db/prisma/schema.prisma`

- **Generator**: `prisma-client-js` (TypeScript)
- **Purpose**: GraphQL API, web editor, ongoing development
- **Files**: Single `schema.prisma` file (1,511 lines)

**✨ This is the source of truth** - schema changes should be made here first.

### 2. FieryLib Schema (Python - Synced Copy)

**Location**: `/home/strider/Code/mud/fierylib/prisma/schema/`

- **Generator**: `prisma-client-py` (Python)
- **Purpose**: One-time legacy data import, seed users
- **Files**: `models.prisma` (synced from Muditor)

**This is synced (symlink) from Muditor** - FieryLib is a one-time import tool and becomes obsolete after initial database setup.

## Why Two Schemas?

Prisma clients are language-specific:

- **TypeScript** (Muditor): Uses `prisma-client-js` for API/web app - **ongoing use**
- **Python** (FieryLib): Uses `prisma-client-py` for one-time import - **becomes obsolete after seed**

Both connect to the same database, just with different client libraries.

## Making Schema Changes

### ✨ Important: Muditor is Source of Truth

**Muditor** is the ongoing editor/API, so its schema is the source of truth.
**FieryLib** is a one-time import tool and becomes obsolete after initial database setup.

1. **Make changes in Muditor schema** (source of truth)

   ```bash
   cd /home/strider/Code/mud/muditor
   # Edit packages/db/prisma/schema.prisma
   bun run db:push         # Apply to database
   bun run db:generate     # Regenerate TypeScript client
   ```

2. **Sync changes to FieryLib** (only if you need to re-import)

   ```bash
   cd /home/strider/Code/mud
   ./scripts/sync-schema-to-fierylib.sh
   cd fierylib
   poetry run prisma generate
   ```

3. **Verify**
   ```bash
   cd muditor
   bun run type-check      # Check TypeScript
   bun run dev             # Test API
   ```

**Note:** You rarely need to sync to FieryLib - it's only used for initial import. Once your database is seeded, use Muditor for all ongoing work.

## Schema Sync

The schemas should always be in sync. If they drift:

```bash
# Pull current database schema
cd muditor/packages/db
npx prisma db pull

# This will update schema.prisma to match the actual database
```

## Seeding

⚠️ **All seeding has moved to FieryLib** - see `SEEDING_DEPRECATED.md`

The seed files in this package are deprecated:

- `src/seed/users.ts` - ❌ Use FieryLib instead
- `src/seed/world-data.ts` - ❌ Use FieryLib instead
- `src/seed/game-system.ts` - ✅ Still works (races, classes, etc.)
- `src/seed/characters.ts` - ✅ Still works (test characters)

## Database Commands

```bash
# Generate TypeScript client
bun run db:generate

# Push schema changes (development only)
bun run db:push

# Create migration (production)
bun run db:migrate

# Open Prisma Studio
bun run db:studio
```

## See Also

- [/home/strider/Code/mud/SEEDING_MIGRATION.md](../../../SEEDING_MIGRATION.md) - Seeding consolidation
- [/home/strider/Code/mud/fierylib/README.md](../../../fierylib/README.md) - FieryLib documentation
- [SEEDING_DEPRECATED.md](../../SEEDING_DEPRECATED.md) - Muditor seeding deprecation
