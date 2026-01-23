# Muditor CLAUDE.md

Database-driven MUD editor with web UI for world building.

## Commands

```bash
# Development
pnpm dev                # API (3001) + Web (3000)
pnpm dev:api            # NestJS GraphQL only
pnpm dev:web            # Next.js only

# Database
pnpm db:generate        # Generate Prisma client (after schema changes)
pnpm db:migrate         # Apply migrations
pnpm db:studio          # Prisma Studio GUI

# Quality
pnpm test:e2e           # Playwright tests
pnpm test:e2e:ui        # Interactive test runner
pnpm lint && pnpm format && pnpm type-check

# GraphQL
pnpm codegen            # Generate TypeScript types from schema
```

## Development Rules

**See `apps/web/DEVELOPMENT_RULES.md`** for detailed patterns including:

- GraphQL codegen (required - no manual gql tags)
- URL params: `zone`, `room`, `id` (not `zone_id`)
- Composite keys: always validate with `isValidRoomId()` (room=0 is valid)
- Custom hooks for repeated queries
- Context for state, hooks for data

## Architecture

```
apps/
├── api/              # NestJS GraphQL (port 3001)
│   └── src/
│       ├── auth/     # JWT authentication
│       ├── zones/    # Zone resolvers
│       ├── rooms/    # Room CRUD
│       └── ...
└── web/              # Next.js (port 3000)
    └── src/
        ├── app/      # App router
        ├── components/
        ├── generated/graphql.ts  # Codegen output
        └── hooks/

packages/
├── db/               # Prisma schema (source of truth)
├── types/            # Shared TypeScript types
└── ui/               # shadcn/ui components
```

## Key Points

- **Schema**: `packages/db/prisma/schema.prisma` is the source of truth for all projects
- **No importing here**: Use FieryLib for legacy data import
- **Composite keys**: All entities use `(zoneId, vnum)`
- **Tech stack**: Next.js 15, NestJS, GraphQL/Apollo, Prisma, PostgreSQL, Redis
- **Auth**: JWT with roles (PLAYER→IMMORTAL→BUILDER→CODER→GOD)
