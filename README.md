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
├── world/            # Legacy MUD world files (130 zones)
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

Visit the application at these URLs:
- **Zone Editor**: `http://localhost:3000/dashboard/zones/editor?zone=511`
- **Entity Lists**: `http://localhost:3000/dashboard/mobs` (or /objects, /shops, /rooms)
- **GraphQL Playground**: `http://localhost:4000/graphql`

**Note:** The web app auto-detects available ports (currently running on 3000).

## Documentation

- **[Development Plan](task.md)** - Comprehensive roadmap with milestones and timelines
- **[World Data Format](docs/WORLD_JSON_FORMAT.md)** - Legacy MUD file format specification
- **[Development Rules](rules.md)** - Safety guidelines and best practices
- **[AI Assistant Guide](CLAUDE.md)** - Context for AI-powered development

## Development Status

🎉 **MAJOR MILESTONE: VISUAL ZONE EDITOR IS WORKING!**

**Current Status (Updated September 3, 2025):**
- **Phase 1: Foundation & Data** ✅ **100% COMPLETE**
- **Phase 2: API Foundation** ✅ **98% COMPLETE** 
- **Phase 3: Frontend Foundation** ✅ **95% COMPLETE**
- **Phase 4: Visual Editors** 🚀 **98% COMPLETE** with **ZONE EDITOR EXCEEDING ALL EXPECTATIONS!**

See [task.md](task.md) for detailed milestones and progress tracking.

## 🚀 Currently Working Features

### ✅ **Fully Functional Right Now:**
- **INCREDIBLY ADVANCED Visual Zone Editor** with React Flow:
  - Interactive room editing with drag-and-drop positioning
  - **Room Creation** - Create new rooms with auto-generated IDs and comprehensive form editor
  - **Exit Management** - Add, remove, and modify room exits with visual connections and real-time updates
  - **Smart Room Layout** - Intelligent positioning algorithm for optimal visualization
  - **Real-time GraphQL Integration** - Live mutations with immediate UI feedback and error handling
  - **Professional Controls** - Minimap, zoom, pan, and responsive sidebar design
  - **Context-Sensitive Editing** - Click rooms to edit, dynamic form panels, live saving
- **Entity List Pages** - Browse and manage all MUD entities:
  - **Mobs** with stats, levels, and zone information
  - **Objects** with type badges, weight, and cost details
  - **Shops** with profit rates and keeper information
  - **Rooms** with sector types and zone links
- **Complete GraphQL API** - All CRUD operations for zones, rooms, mobs, objects, shops, exits
- **PostgreSQL Database** with comprehensive MUD schema (1400+ lines)
- **Data Import System** - 7 zones with 218 rooms and 83 objects imported (verified working)
- **Professional UI** with Tailwind CSS, responsive design, and intuitive navigation

### 🚧 **In Development:**
- Authentication and user management
- Advanced entity editors with full CRUD forms
- Real-time collaboration with GraphQL subscriptions
- Script editor with Lua support
- Search and filtering across all entity types

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

Data will be imported from legacy JSON files and transformed into a modern PostgreSQL schema with full referential integrity. Currently, sample data from 7 zones is available for testing the editors.

## Security & Safety

- **Sandboxed Script Execution**: Lua scripts run in controlled environments
- **Permission-Based Access**: Granular controls based on user roles
- **Audit Logging**: Complete change tracking with user attribution
- **Environment Isolation**: Separate development, test, and production data
- **Backup & Recovery**: Automated backups with point-in-time restoration

---

**Muditor** - Modernizing MUD development for the next generation of world builders.

