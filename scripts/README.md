# Admin Scripts

This directory contains administrative scripts for managing the Muditor system.

## User Management Scripts

### `set-god.ts`

Sets a user to GOD role with maximum god level (100).

**Usage:**

```bash
npx tsx scripts/set-god.ts <username>
```

**Example:**

```bash
npx tsx scripts/set-god.ts Strider
```

### `list-users.ts`

Lists all users in the database with their roles and god levels.

**Usage:**

```bash
npx tsx scripts/list-users.ts
```

## System Management Scripts

### `start-system.sh`

Starts the development system with Docker containers.

### `stop-system.sh`

Stops the development system and Docker containers.

### `check-system.sh`

Checks system health and dependencies.

## Requirements

- Node.js and pnpm
- tsx (TypeScript executor) - automatically installed as dev dependency
- Access to the PostgreSQL database

## Notes

- All TypeScript scripts require the database to be running
- God level 100 provides full administrative privileges
- User roles: PLAYER (0), IMMORTAL (25-75), CODER (75-99), GOD (100)
