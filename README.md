# Muditor

**A modern, database-driven MUD editor and administration tool**

Muditor transforms legacy MUD world building from text-based file editing to a visual, collaborative web interface. Built with PostgreSQL, GraphQL, and React, it provides comprehensive tools for creating, editing, and managing MUD worlds with real-time collaboration and live server integration.

## Features

### 🎮 Dual-Mode Interface

- **Player Mode**: Character management, inventory, banking, and stats viewing
- **God Mode**: World building, server administration, and content management
- **Role-Based Access**: PLAYER → IMMORTAL → BUILDER → CODER → GOD hierarchy

### 🗺️ Visual World Editor

- **Zone Editor**: Interactive zone maps with drag-and-drop room creation using React Flow
- **Room Editor**: Comprehensive room editing with descriptions, exits, terrain, and object placement
- **Real-time Updates**: Live GraphQL mutations with immediate UI feedback

### 🤖 Entity Management

- **Mob Editor**: Complete NPC creation with stats, equipment, AI behaviors, and spawn rules
- **Object Editor**: Item creation with type-specific properties, magical effects, and interactions
- **Shop Editor**: Merchant configuration with inventory, pricing, and trading rules

### 📝 Advanced Scripting

- **Lua Script Editor**: Monaco-powered editor with syntax highlighting and autocomplete
- **Sandbox Testing**: Safe script execution with resource limits and debugging tools
- **Trigger System**: Attach scripts to any entity for custom behaviors

### 🔒 Authentication & Security

- **Role-Based Access Control**: Comprehensive permission system with five role levels
- **JWT Authentication**: Secure token-based authentication with refresh capabilities
- **User Management**: Registration, password reset, ban system, and admin controls
- **Audit Logging**: Complete change tracking with user attribution

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, React Flow
- **Backend**: NestJS, GraphQL, Prisma ORM, PostgreSQL, Redis
- **Authentication**: JWT with role-based permissions
- **Scripting**: Lua with sandboxed execution
- **Testing**: Playwright for E2E testing
- **Deployment**: Docker, Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- Docker and Docker Compose
- pnpm (recommended) or npm/yarn

### Development Setup

**Option 1: Automated Setup (Recommended)**

```bash
# Clone repository
git clone <repository-url>
cd muditor

# Install dependencies
pnpm install

# Start entire system with automated scripts
./scripts/start-system.sh
```

**Option 2: Manual Setup**

```bash
# Start database and services
docker compose up -d

# Start GraphQL API server
pnpm dev:api &

# Start Next.js web application
pnpm dev:web
```

### Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Apply database migrations
pnpm prisma migrate dev

# Import sample world data (optional)
pnpm seed
```

### System Management Scripts

```bash
./scripts/start-system.sh   # Start all services with health checks
./scripts/stop-system.sh    # Stop all services cleanly
./scripts/check-system.sh   # Verify system health
```

## Usage

### Access Points

Once running, access these URLs:

- **Main Dashboard**: http://localhost:3002/dashboard
- **Login**: http://localhost:3002/login
- **GraphQL Playground**: http://localhost:4000/graphql
- **Database Admin**: http://localhost:8080 (Adminer)

### Entity Management

- **Zones**: http://localhost:3002/dashboard/zones
- **Rooms**: http://localhost:3002/dashboard/rooms
- **Mobs**: http://localhost:3002/dashboard/mobs
- **Objects**: http://localhost:3002/dashboard/objects
- **Shops**: http://localhost:3002/dashboard/shops
- **Scripts**: http://localhost:3002/dashboard/scripts

### System Verification

```bash
# Check Docker containers
docker compose ps

# Test API connectivity
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ zones { id name } }"}'

# Verify web application
curl -I http://localhost:3002
```

## Development

### Project Structure

```
muditor/
├── apps/
│   ├── web/          # Next.js frontend application
│   └── api/          # NestJS GraphQL API
├── packages/
│   ├── db/           # Prisma schema and database client
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared UI components
├── world/            # Legacy MUD world files (130+ zones)
├── docs/             # Documentation and specifications
├── scripts/          # System management scripts
└── tests/            # E2E and integration tests
```

### Common Tasks

```bash
# Database operations
pnpm prisma studio          # Open database GUI
pnpm prisma migrate reset   # Reset database
pnpm prisma generate        # Regenerate client

# Development
pnpm dev:api                # Start API server only
pnpm dev:web                # Start web app only
pnpm build                  # Build all applications
pnpm type-check             # Check TypeScript

# Testing
pnpm test:e2e               # Run E2E tests
pnpm test:e2e:ui           # Interactive test runner
pnpm test:e2e:debug        # Debug tests
```

### Role Hierarchy

1. **PLAYER**: Basic user access, character management
2. **IMMORTAL**: Enhanced player features, basic admin tools
3. **BUILDER**: World building permissions, zone editing
4. **CODER**: Advanced admin features, script management
5. **GOD**: Full system access, user management

## API Reference

### Authentication

```bash
# Register new user
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { register(input: { username: \"user\", email: \"user@example.com\", password: \"password\" }) { accessToken user { id username role } } }"}'

# Login
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { login(input: { identifier: \"user\", password: \"password\" }) { accessToken user { id username role } } }"}'
```

### Entity Queries

```bash
# Get zones
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ zones { id name description } }"}'

# Get mobs with filters
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ mobs(zoneId: 511) { id shortDesc level } }"}'
```

## Data Architecture

Muditor manages complex MUD world data including:

- **Zones**: Areas with climate, reset rules, and spawning configuration
- **Rooms**: Connected spaces with descriptions, exits, and environmental details
- **Mobs**: NPCs with stats, equipment, AI behaviors, and spawn rules
- **Objects**: Items with type-specific properties, magical effects, and interactions
- **Shops**: Merchants with inventory, pricing, and trading behaviors
- **Scripts**: Lua code for custom game logic and interactive triggers

## Testing

### E2E Testing with Playwright

```bash
# Run all tests
pnpm test:e2e

# Run specific test suite
pnpm test:e2e tests/dashboard.spec.ts

# Interactive test runner
pnpm test:e2e:ui

# Generate test report
pnpm test:e2e:report
```

### Test Coverage

- Authentication flows and role-based access
- Entity CRUD operations
- Visual editors and form validation
- API connectivity and error handling
- Cross-browser compatibility

## Deployment

### Docker Production Build

```bash
# Build production images
docker build -f apps/api/Dockerfile -t muditor-api .
docker build -f apps/web/Dockerfile -t muditor-web .

# Run production stack
docker compose -f docker-compose.prod.yml up -d
```

### Environment Configuration

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/muditor"

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Email (optional)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="username"
SMTP_PASS="password"
```

## Contributing

This project follows modern development practices:

- **TypeScript**: Full type safety throughout the stack
- **Code Quality**: ESLint, Prettier, and strict TypeScript configuration
- **Testing**: Comprehensive E2E and unit test coverage
- **Documentation**: Inline code documentation and architectural decisions
- **Git Workflow**: Feature branches, pull requests, and automated CI/CD

See [plan.md](plan.md) for development priorities and roadmap.

## License

[Add your license here]

---

**Muditor** - Modernizing MUD development for the next generation of world builders.
