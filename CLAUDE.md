# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Muditor is a database-driven MUD (Multi-User Dungeon) interface and editor tool designed to modernize world building and administration with a PostgreSQL backend and web-based UI. The project aims to transition from legacy text-based world files to a modern visual editor with GraphQL API integration.

## Architecture and Structure

### Planned Monorepo Structure
The project is designed as a monorepo with the following planned structure:
- `/apps/web` - Next.js web application (dashboard, editor interface)
- `/apps/api` - NestJS GraphQL API server
- `/packages/db` - Prisma schema and database client
- `/packages/types` - Shared TypeScript types and GraphQL DTOs
- `/packages/ui` - Shared UI components library

### Current Data Structure
- `/world/` - Contains legacy MUD world files in JSON format (zones 0-625)
- `/docs/WORLD_JSON_FORMAT.md` - Detailed documentation of the JSON schema
- `rules.md` - Development safety guidelines and best practices

## World Data Format

The project works with FieryMUD world files containing:
- **Zones**: Area definitions with reset timers, climate, and spawning rules
- **Rooms**: Connected areas with descriptions, exits, and terrain types
- **Mobs**: NPCs with stats, equipment, AI behaviors, and spawn configurations
- **Objects**: Items with type-specific properties, magical effects, and interactions
- **Shops**: Trading posts with inventory, pricing, and merchant behaviors
- **Triggers**: Lua script attachments for interactive behaviors

### Key Data Relationships
- Zones contain rooms (by ID ranges) and define mob/object spawn rules
- Rooms connect via directional exits and contain environmental details
- Mobs can carry/wear objects and have complex stat systems
- Scripts (triggers) can attach to any entity for custom behaviors
- Shops link to specific keeper mobs and operate in designated rooms

## Development Context

### Technology Stack (Planned)
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, GraphQL with subscriptions, Prisma ORM
- **Database**: PostgreSQL with migrations
- **Visualization**: React Flow for room/zone graphs
- **Scripting**: Monaco Editor with Lua syntax support
- **Infrastructure**: Docker Compose for development, Redis for real-time features

### Development Commands (When Implemented)
Based on the planned architecture, these commands would be available:
```bash
# Setup
pnpm install                    # Install dependencies
docker compose up -d           # Start PostgreSQL & Redis
pnpm prisma migrate dev        # Apply database migrations

# Development
pnpm dev:api                   # Start NestJS API server
pnpm dev:web                   # Start Next.js web application

# Database
pnpm prisma generate           # Generate Prisma client
pnpm prisma studio            # Open database GUI
pnpm prisma migrate reset     # Reset database with fresh migrations

# Import
pnpm import:world             # Import world JSON files to database
```

## Key Development Considerations

### Data Migration Strategy
- Import existing world JSON files into PostgreSQL via Prisma
- Maintain referential integrity during import process
- Handle ID mapping between legacy (zone-based) and modern (global) systems
- Zone 0 special case: converts to zone ID 1000 in modern system

### Editor Features Implementation
- **Zone Editor**: Visual graph with React Flow showing rooms as nodes, exits as edges
- **Room Editor**: Side panels for editing descriptions, terrain, mobs, objects
- **Script Editor**: Monaco editor with Lua syntax highlighting and sandboxed testing
- **Mob/Object Editors**: CRUD interfaces with type-specific field validation

### Safety and Validation
- Validate zone integrity (check for orphaned rooms, one-way exits)
- Sandbox Lua script execution for testing
- Version control for world content with rollback capabilities
- Environment separation (Prod/Test/Dev) with promotion workflows

### Integration Points
- **MUD Bridge**: Secure API to reload zones on live server
- **Real-time Updates**: GraphQL subscriptions for collaborative editing
- **Permission System**: God-level access controls for different environments
- **Backup/Restore**: Automated backups before major changes

## Important Notes

- This is currently a planning repository - the actual web application has not been implemented yet
- The `world/` directory contains the source data that will be imported into the database
- Zone files are numbered (0.json, 1.json, etc.) and contain complete zone definitions
- The project follows safety rules defined in `rules.md` for development practices
- LLM-friendly architecture with TypeScript everywhere and consistent patterns

## Development Workflow (Planned)

1. Set up development environment with Docker containers
2. Initialize database and run migrations
3. Import world data from JSON files
4. Develop visual editors for zones, rooms, mobs, objects
5. Implement script editor with Lua support
6. Add real-time collaboration features
7. Create deployment pipeline with environment promotion