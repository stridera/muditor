# Database Documentation

This directory contains comprehensive documentation for the Muditor database schema, data formats, and import processes.

## Table of Contents

- [Database Schema](./schema.md) - Complete database schema documentation
- [Enum Reference](./enums.md) - All enum types and their values
- [World Data Import](./world-import.md) - JSON to database import process
- [Data Migration](./migration.md) - Legacy data migration guide
- [API Reference](./api.md) - Database operations and best practices

## Quick Overview

Muditor uses PostgreSQL with Prisma ORM to store MUD world data in a normalized relational structure. The database supports:

- **Multi-user System**: User management with enhanced security, roles, and ban system
- **Character System**: Comprehensive character progression with skills, spells, and items
- **World Structure**: Zones, Rooms, Exits with 3D layout coordinates and full relationship mapping
- **NPCs (Mobs)**: Complete mob definitions with stats, flags, equipment, and AI classes
- **Objects**: Items with type-specific properties, effects, and instance customization
- **Commerce**: Shop system with keepers, inventory, trading rules, and hours
- **Game Logic**: Class system, spell system, skill progression, and character advancement
- **Scripting**: Lua trigger system for dynamic content and interactive behaviors
- **Security & Audit**: Complete change tracking, ban management, and security features

## Database Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Users       │    │     World       │    │   Game Logic    │    │   Character     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ • User          │    │ • Zone          │    │ • Class         │    │ • Character     │
│ • BanRecord     │    │ • Room (3D)     │    │ • Spell         │    │ • CharacterItem │
│ • AuditLog      │    │ • RoomExit      │    │ • SpellSchool   │    │ • CharacterSkill│
│ • ChangeLog     │    │ • Mob           │    │ • Skill         │    │ • CharacterSpell│
└─────────────────┘    │ • Object        │    │ • MobReset      │    │ • CharacterEffect│
                       │ • Trigger       │    │ • Shop          │    └─────────────────┘
                       └─────────────────┘    └─────────────────┘
```

## Key Features

### Type Safety
- Comprehensive enum system for all flag types
- Strict validation of flag combinations
- Type-safe database operations throughout

### Data Integrity
- Foreign key constraints maintain referential integrity
- Cascade deletes prevent orphaned records
- Comprehensive validation rules

### Legacy Compatibility
- Import system handles legacy JSON world files
- Graceful migration from string-based to enum-based flags
- Backward-compatible data transformations

### Performance Optimized
- Indexed relationships for fast queries
- Efficient enum storage
- Optimized for read-heavy MUD operations

## Getting Started

1. **Setup**: Database is automatically configured via Docker Compose
2. **Migration**: Use `pnpm prisma db push` to sync schema
3. **Seeding**: Run `pnpm seed` to populate with world data
4. **Exploration**: Use Prisma Studio with `pnpm prisma studio`

For detailed information, see the specific documentation files in this directory.