# @muditor/db - Database Package

Prisma TypeScript client and database utilities for Muditor.

## Overview

This package provides:

- Prisma TypeScript client (`prisma-client-js`)
- Database schema for PostgreSQL
- Game system seeding only (races, classes, spells, skills)
- ~~Import/parsing functionality~~ (REMOVED - moved to FieryLib)

## Quick Commands

```bash
# Generate Prisma client
bun run generate

# Push schema changes (dev)
bun run push

# Create migration (prod)
bun run migrate:dev

# Open Prisma Studio
bun run studio

# Seed game system data only (races, classes, spells, skills)
bun run seed
```

## Schema

**Location**: `prisma/schema.prisma`

**Important**: This schema should mirror the FieryLib schema, which is the source of truth.

See `SCHEMA_NOTE.md` for details on schema management.

## Seeding

⚠️ **Most seeding has moved to FieryLib**

### What Muditor Seeds (Game System Only)

```bash
bun run seed  # Seeds races, classes, spells, skills only
```

### What FieryLib Seeds (Everything Else)

Use FieryLib for world data and users:

```bash
cd ../../fierylib
poetry run fierylib import-legacy --with-users  # Import world + users
poetry run fierylib seed users                  # Seed users only
```

See [SEEDING_DEPRECATED.md](../../SEEDING_DEPRECATED.md) for migration guide.

## Usage in Apps

### Import Prisma Client

```typescript
import { PrismaClient } from '@muditor/db';

const prisma = new PrismaClient();

// Query users
const users = await prisma.user.findMany();

// Use in NestJS services
@Injectable()
export class UserService {
  constructor(private prisma: PrismaClient) {}

  async findAll() {
    return this.prisma.user.findMany();
  }
}
```

### Import Types

```typescript
import type { User, Zone, Room } from '@muditor/db';
```

## Database Connection

Set `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://muditor:password@localhost:5432/fierydev"
```

This should match the parent `.env` and FieryLib `.env`.

## Development

```bash
# Install dependencies
bun run install

# Generate client after schema changes
bun run generate

# Type check
bun run type-check

# Clean generated files
bun run clean
```

## Migration Workflow

### Development

```bash
# Push schema changes without migration
bun run push

# Generate client
bun run generate
```

### Production

```bash
# Create migration
bun run migrate:dev

# Deploy migration
bun run migrate:deploy
```

## Schema Sync

If schemas drift between FieryLib and Muditor:

```bash
# Pull current database schema
bunx prisma db pull

# This updates schema.prisma to match the actual database
```

Then commit the updated schema.

## Prisma Studio

Visual database browser:

```bash
bun run studio
# Opens http://localhost:5555
```

## See Also

- [SCHEMA_NOTE.md](./SCHEMA_NOTE.md) - Schema management details
- [../../SEEDING_DEPRECATED.md](../../SEEDING_DEPRECATED.md) - Seeding migration guide
- [../../SEEDING_MIGRATION.md](../../../SEEDING_MIGRATION.md) - Complete migration documentation
