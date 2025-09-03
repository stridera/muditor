# Muditor

**A modern, database-driven MUD editor and administration tool**

Muditor transforms legacy MUD world building from text-based file editing to a visual, collaborative web interface. Built with PostgreSQL, GraphQL, and React, it provides comprehensive tools for creating, editing, and managing MUD worlds with real-time collaboration and live server integration.

## Features

### 🎮 Dual-Mode Interface
- **Player Mode**: Character management, inventory, banking, and stats viewing
- **God Mode**: World building, server administration, and content management
- **Environment Management**: Seamless switching between Development, Test, and Production environments

### 🗺️ Visual World Editor
- **Zone Editor**: Interactive zone maps with drag-and-drop room creation using React Flow
- **Room Editor**: Comprehensive room editing with descriptions, exits, terrain, and object placement
- **Real-time Collaboration**: Multiple builders can work simultaneously with conflict resolution

### 🤖 Entity Management
- **Mob Editor**: Complete NPC creation with stats, equipment, AI behaviors, and spawn rules
- **Object Editor**: Item creation with type-specific properties, magical effects, and interactions
- **Shop Editor**: Merchant configuration with inventory, pricing, and trading rules

### 📝 Advanced Scripting
- **Lua Script Editor**: Monaco-powered editor with syntax highlighting and autocomplete
- **Sandbox Testing**: Safe script execution with resource limits and debugging tools
- **Trigger System**: Attach scripts to any entity for custom behaviors

### 🔄 Live Integration
- **MUD Bridge**: Secure API integration for real-time world updates
- **Server Management**: Remote server controls, monitoring, and emergency procedures
- **Version Control**: Track changes, publish updates, and rollback when needed

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, React Flow
- **Backend**: NestJS, GraphQL, Prisma ORM, PostgreSQL, Redis
- **Scripting**: Lua with sandboxed execution
- **Deployment**: Docker, CI/CD pipelines

## Project Structure

```
muditor/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # NestJS GraphQL API
├── packages/
│   ├── db/           # Prisma schema and database client
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared UI components
├── world/            # Legacy MUD world files (125+ zones)
├── docs/             # Documentation and specifications
├── task.md           # Comprehensive development roadmap
└── CLAUDE.md         # AI assistant guidance
```

## Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- Docker and Docker Compose
- pnpm or yarn

### Development Setup
```bash
# Clone repository
git clone <repository-url>
cd muditor

# Install dependencies
pnpm install

# Start database and services
docker compose up -d

# Initialize database and import world data
pnpm db:setup
pnpm db:seed

# Start development servers
pnpm dev
```

Visit `http://localhost:3000` to access the web interface and `http://localhost:4000/graphql` for the GraphQL playground.

## Documentation

- **[Development Plan](task.md)** - Comprehensive roadmap with milestones and timelines
- **[World Data Format](docs/WORLD_JSON_FORMAT.md)** - Legacy MUD file format specification
- **[Development Rules](rules.md)** - Safety guidelines and best practices
- **[AI Assistant Guide](CLAUDE.md)** - Context for AI-powered development

## Development Status

🚧 **In Development** - Currently implementing Phase 1 (Foundation & Data)

See [task.md](task.md) for detailed milestones and progress tracking.

## Key Features in Development

### Phase 1: Foundation (Weeks 1-3)
- [x] Project structure and infrastructure
- [ ] Database schema and Prisma setup
- [ ] World data import and seeding

### Phase 2: API Foundation (Weeks 4-6)
- [ ] NestJS GraphQL API
- [ ] Authentication and authorization
- [ ] CRUD operations for all entities

### Phase 3: Frontend Foundation (Weeks 7-9)
- [ ] Next.js application setup
- [ ] User interface and navigation
- [ ] Entity listing and management

## Contributing

This project is designed to be **AI-friendly** with:
- Comprehensive TypeScript typing throughout
- Prisma schema as single source of truth
- Consistent patterns and conventions
- Detailed documentation and planning

See [CLAUDE.md](CLAUDE.md) for AI assistant context and [plan.md](plan.md) for development priorities.

## Data Architecture

Muditor manages complex MUD world data including:
- **125+ Zones** with climate, reset rules, and spawning configuration
- **Thousands of Rooms** with descriptions, exits, and environmental details
- **NPCs (Mobs)** with stats, equipment, AI behaviors, and relationships
- **Objects** with type-specific properties, magical effects, and interactions
- **Shops** with inventory, pricing, and merchant behaviors
- **Scripts** with Lua code for custom game logic and triggers

All data is imported from legacy JSON files in the `world/` directory and transformed into a modern PostgreSQL schema with full referential integrity.

## Security & Safety

- **Sandboxed Script Execution**: Lua scripts run in controlled environments
- **Permission-Based Access**: Granular controls based on user roles
- **Audit Logging**: Complete change tracking with user attribution
- **Environment Isolation**: Separate development, test, and production data
- **Backup & Recovery**: Automated backups with point-in-time restoration

---

**Muditor** - Modernizing MUD development for the next generation of world builders.

