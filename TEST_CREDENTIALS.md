# Test User Credentials

## Seeding Users

⚠️ **User seeding has moved to FieryLib!**

To create test users:

```bash
cd /home/strider/Code/mud/fierylib
poetry run fierylib seed users
```

Or during initial import:

```bash
poetry run fierylib import-legacy --with-users
```

## Login Credentials

After seeding:

### Admin (GOD Level)
- **Username:** `admin`
- **Email:** `admin@muditor.dev`
- **Password:** `admin123`
- **Role:** GOD (full access)

### Builder
- **Username:** `builder`
- **Email:** `builder@muditor.dev`
- **Password:** `builder123`
- **Role:** BUILDER (can edit zones)

### Test Player
- **Username:** `testplayer`
- **Email:** `player@muditor.dev`
- **Password:** `player123`
- **Role:** PLAYER (basic access)

## Database Status

```
✅ 3 users in database
✅ 9,963 rooms with layout coordinates
✅ 130 zones
```

## Starting Muditor

```bash
cd /home/strider/Code/mud/muditor
pnpm dev
```

Then navigate to:
- **Web UI:** http://localhost:3002
- **GraphQL API:** http://localhost:4000/graphql

## Re-seeding Users (Optional)

If you ever need to reset the user passwords:

```bash
cd /home/strider/Code/mud/fierylib
poetry run fierylib seed users --reset
```

This will:
- Reset passwords for existing users
- NOT delete existing world data
- Use the passwords shown above

## User Roles

- **GOD**: Full system access
- **BUILDER**: Can edit zones, rooms, mobs, objects
- **PLAYER**: Read-only access for testing

All users can:
- View the world map
- Browse zones and rooms
- See mob and object data

Builders and above can:
- Create and edit zones
- Modify rooms and exits
- Design mobs and objects
- Write Lua scripts

GOD users can:
- Manage user accounts
- Access system settings
- View audit logs
- Control all zones
