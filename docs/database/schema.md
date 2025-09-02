# Database Schema Documentation

Complete reference for the Muditor PostgreSQL database schema using Prisma ORM.

## Schema Overview

The database is organized into several logical groups:

- **User Management**: Authentication and user roles
- **World Structure**: Zones, rooms, and geography
- **Game Entities**: Mobs, objects, and their properties
- **Commerce**: Shop system and trading
- **Scripting**: Trigger system for dynamic content
- **Game Logic**: Reset systems and spawn rules
- **Audit**: Change tracking and history

---

## User Management & Authentication

### User
Primary user account for system access.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `email` | String (unique) | User email address |
| `username` | String (unique) | Display username |
| `passwordHash` | String | Bcrypt hashed password |
| `role` | UserRole | Permission level |
| `godLevel` | Int | Admin privilege level (0-100) |
| `createdAt` | DateTime | Account creation |
| `updatedAt` | DateTime | Last modification |
| `lastLoginAt` | DateTime? | Last login timestamp |

**Relations:**
- `characters[]` - Player characters
- `auditLogs[]` - Change history

### Character
Player characters in the game world.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String (unique) | Character name |
| `level` | Int | Character level (default: 1) |
| `race` | Race | Character race |
| `class` | String | Character class |
| `alignment` | Int | Good/evil alignment (-1000 to 1000) |
| `strength` | Int | STR attribute (default: 13) |
| `intelligence` | Int | INT attribute (default: 13) |
| `wisdom` | Int | WIS attribute (default: 13) |
| `dexterity` | Int | DEX attribute (default: 13) |
| `constitution` | Int | CON attribute (default: 13) |
| `charisma` | Int | CHA attribute (default: 13) |
| `hitPoints` | Int | Current HP (default: 100) |
| `mana` | Int | Current mana (default: 100) |
| `movement` | Int | Current movement (default: 100) |
| `copper` | Int | Copper pieces |
| `silver` | Int | Silver pieces |
| `gold` | Int | Gold pieces |
| `platinum` | Int | Platinum pieces |
| `userId` | String | Owner reference |

---

## World Structure

### Zone
Top-level world organization unit.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Zone number (primary key) |
| `name` | String | Zone display name |
| `top` | Int | Highest room number in zone |
| `lifespan` | Int | Minutes between resets (default: 30) |
| `resetMode` | ResetMode | Reset behavior |
| `hemisphere` | Hemisphere | Weather system region |
| `climate` | Climate | Climate type |

**Relations:**
- `rooms[]` - All rooms in zone
- `mobs[]` - All mobs defined in zone
- `objects[]` - All objects defined in zone
- `shops[]` - All shops in zone
- `triggers[]` - All triggers in zone
- `mobResets[]` - Mob spawn configurations

### Room
Individual locations in the world.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Room number (primary key) |
| `name` | String | Room title |
| `description` | String (Text) | Room description |
| `sector` | Sector | Terrain type |
| `flags` | RoomFlag[] | Room properties |
| `zoneId` | Int | Parent zone |

**Relations:**
- `zone` - Parent zone
- `exits[]` - Available exits
- `extraDescs[]` - Additional descriptions
- `mobResets[]` - Mob spawns in this room

### RoomExit
Connections between rooms.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `direction` | Direction | Exit direction |
| `description` | String? | Exit description |
| `keyword` | String? | Door keyword |
| `key` | String? | Required key ID |
| `destination` | Int? | Target room ID |
| `roomId` | Int | Source room |

**Unique Constraint:** `(roomId, direction)`

### RoomExtraDescription
Additional examine descriptions for rooms.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `keyword` | String | Trigger keyword |
| `description` | String (Text) | Description text |
| `roomId` | Int | Parent room |

---

## Game Entities

### Mob (NPCs)
Non-player character definitions.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Mob number (primary key) |
| `keywords` | String | Targeting keywords |
| `mobClass` | String | Mob class |
| `shortDesc` | String | Name in room |
| `longDesc` | String (Text) | Room presence description |
| `desc` | String (Text) | Examine description |
| `mobFlags` | MobFlag[] | Behavior flags |
| `effectFlags` | EffectFlag[] | Active effects |
| `alignment` | Int | Good/evil alignment |
| `level` | Int | Character level |
| `armorClass` | Int | AC value |
| `hitRoll` | Int | Attack bonus |
| `move` | Int | Movement points |
| `hpDiceNum` | Int | HP dice count |
| `hpDiceSize` | Int | HP dice size |
| `hpDiceBonus` | Int | HP dice bonus |
| `damageDiceNum` | Int | Damage dice count |
| `damageDiceSize` | Int | Damage dice size |
| `damageDiceBonus` | Int | Damage dice bonus |
| `copper/silver/gold/platinum` | Int | Currency |
| `position` | Position | Current position |
| `defaultPosition` | Position | Default position |
| `gender` | Gender | Gender |
| `race` | Race | Mob race |
| `raceAlign` | Int | Racial alignment modifier |
| `size` | Size | Physical size |
| `strength/intelligence/wisdom/dexterity/constitution/charisma` | Int | Attributes |
| `perception` | Int | Perception skill |
| `concealment` | Int | Stealth skill |
| `lifeForce` | LifeForce | Nature of existence |
| `composition` | Composition | Physical makeup |
| `stance` | Stance | Combat readiness |
| `damageType` | DamageType | Attack type |
| `zoneId` | Int | Parent zone |

### Object (Items)
Item definitions with type-specific properties.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Object number (primary key) |
| `type` | ObjectType | Item category |
| `keywords` | String | Targeting keywords |
| `shortDesc` | String | Inventory name |
| `description` | String (Text) | Ground description |
| `actionDesc` | String? (Text) | Action description |
| `flags` | ObjectFlag[] | Item properties |
| `effectFlags` | EffectFlag[] | Magical effects |
| `wearFlags` | WearFlag[] | Equipment slots |
| `weight` | Float | Item weight |
| `cost` | Int | Base cost |
| `timer` | Int | Decay timer |
| `decomposeTimer` | Int | Decompose timer |
| `level` | Int | Item level |
| `concealment` | Int | Hidden value |
| `values` | Json | Type-specific properties |
| `zoneId` | Int | Parent zone |

**Relations:**
- `extraDescs[]` - Additional descriptions
- `affects[]` - Stat modifications
- `spells[]` - Magical effects
- `triggers[]` - Script attachments

### ObjectExtraDescription
Additional examine descriptions for objects.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `keyword` | String | Trigger keyword |
| `description` | String (Text) | Description text |
| `objectId` | Int | Parent object |

### ObjectAffect
Stat modifications provided by objects.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `location` | String | Affected attribute |
| `modifier` | Int | Modification value |
| `objectId` | Int | Parent object |

### ObjectSpell
Spells cast by objects.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `spell` | String | Spell name |
| `level` | Int | Spell level |
| `objectId` | Int | Parent object |

---

## Commerce System

### Shop
Commerce locations with NPCs.

| Field | Type | Description |
|-------|------|-------------|
| `id` | Int | Shop ID (primary key) |
| `buyProfit` | Float | Buy price modifier |
| `sellProfit` | Float | Sell price modifier |
| `temper1` | Int | Aggression level |
| `flags` | ShopFlag[] | Shop behaviors |
| `tradesWithFlags` | ShopTradesWith[] | Trading restrictions |
| `keeperId` | Int? | Shopkeeper mob ID |
| `zoneId` | Int | Parent zone |

**Messages:** `noSuchItem1/2`, `doNotBuy`, `missingCash1/2`, `messageBuy/Sell`

**Relations:**
- `keeper` - Shopkeeper mob
- `items[]` - Inventory
- `accepts[]` - Accepted item types
- `rooms[]` - Shop locations
- `hours[]` - Operating hours

### ShopItem
Items available for purchase.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `amount` | Int | Stock amount (0 = infinite) |
| `shopId` | Int | Parent shop |
| `objectId` | Int | Item reference |

**Unique Constraint:** `(shopId, objectId)`

### ShopAccept
Item types accepted by shop.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `type` | String | Object type accepted |
| `keywords` | String? | Specific keywords |
| `shopId` | Int | Parent shop |

### ShopRoom
Rooms where shop operates.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `roomId` | Int | Room reference |
| `shopId` | Int | Parent shop |

**Unique Constraint:** `(shopId, roomId)`

### ShopHour
Operating hours for shops.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `open` | Int | Opening hour (0-23) |
| `close` | Int | Closing hour (0-23) |
| `shopId` | Int | Parent shop |

---

## Game Logic

### MobReset
Mob spawning configuration.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `max` | Int | Maximum instances |
| `name` | String? | Human-readable name |
| `mobId` | Int | Mob to spawn |
| `roomId` | Int | Spawn location |
| `zoneId` | Int | Parent zone |

**Relations:**
- `carrying[]` - Inventory items
- `equipped[]` - Worn equipment

### MobCarrying
Items in mob's inventory when spawned.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `max` | Int | Maximum instances |
| `name` | String? | Item description |
| `resetId` | String | Parent reset |
| `objectId` | Int | Item reference |

### MobEquipped
Items worn by mob when spawned.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `max` | Int | Maximum instances |
| `location` | String | Equipment slot |
| `name` | String? | Item description |
| `resetId` | String | Parent reset |
| `objectId` | Int | Item reference |

---

## Scripting System

### Trigger
Lua script attachments for dynamic content.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `name` | String | Trigger name |
| `attachType` | ScriptType | Attachment target type |
| `flags` | TriggerFlag[] | Trigger conditions |
| `numArgs` | Int | Argument count |
| `argList` | String? | Argument specification |
| `commands` | String (Text) | Lua script code |
| `variables` | Json | Script variables |

**Polymorphic Relations:**
- `zoneId/zone` - Zone-level triggers
- `mobId/mob` - Mob-specific triggers  
- `objectId/object` - Object-specific triggers

---

## Audit System

### AuditLog
Complete change tracking for all modifications.

| Field | Type | Description |
|-------|------|-------------|
| `id` | String (CUID) | Primary key |
| `action` | String | Action type (CREATE/UPDATE/DELETE) |
| `entityType` | String | Entity type modified |
| `entityId` | String | Entity ID |
| `oldValues` | Json? | Previous values |
| `newValues` | Json? | New values |
| `userId` | String | User who made change |
| `createdAt` | DateTime | When change occurred |

---

## Indexes and Constraints

### Primary Keys
- All entities use appropriate primary keys (Int for game entities, CUID for relationships)

### Unique Constraints
- User email/username uniqueness
- Character name uniqueness
- Room exit direction uniqueness per room
- Shop item uniqueness per shop

### Foreign Key Constraints
- Cascade deletes for dependent entities
- Referential integrity maintained throughout
- SetNull for optional relationships (e.g., shop keepers)

### Performance Indexes
- Foreign key columns automatically indexed
- Zone-based lookups optimized
- User-character relationships indexed

For enum definitions and values, see [enums.md](./enums.md).
For import processes, see [world-import.md](./world-import.md).