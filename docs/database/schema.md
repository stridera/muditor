# Database Schema Documentation

Complete reference for the Muditor PostgreSQL database schema using Prisma ORM.

## Schema Overview

The database is organized into several logical groups:

- **User Management**: Authentication, user roles, and security
- **Character System**: Player characters, stats, items, effects
- **World Structure**: Zones, rooms, and geography with 3D layout support
- **Game Entities**: Mobs, objects, and their properties
- **Commerce**: Shop system and trading
- **Game Logic**: Classes, spells, skills, and character progression
- **Reset Systems**: Mob spawning and equipment
- **Scripting**: Trigger system for dynamic content
- **Audit & Security**: Change tracking, ban system, and history

---

## User Management & Authentication

### User

Primary user account for system access with enhanced security features.

| Field                   | Type            | Description                  |
| ----------------------- | --------------- | ---------------------------- |
| `id`                    | String (CUID)   | Primary key                  |
| `email`                 | String (unique) | User email address           |
| `username`              | String (unique) | Display username             |
| `passwordHash`          | String          | Bcrypt hashed password       |
| `role`                  | UserRole        | Permission level             |
| `createdAt`             | DateTime        | Account creation             |
| `updatedAt`             | DateTime        | Last modification            |
| `lastLoginAt`           | DateTime?       | Last login timestamp         |
| `resetToken`            | String?         | Password reset token         |
| `resetTokenExpiry`      | DateTime?       | Reset token expiration       |
| `failedLoginAttempts`   | Int             | Failed login count           |
| `lockedUntil`           | DateTime?       | Account lockout expiration   |
| `lastFailedLogin`       | DateTime?       | Last failed login attempt    |

**Relations:**

- `characters[]` - Player characters
- `auditLogs[]` - Change history
- `changeLogs[]` - Detailed change tracking
- `issuedBans[]` - Bans issued by this admin
- `banRecords[]` - Bans received by this user

### Character

Player characters in the game world with comprehensive stats and progression system.

| Field               | Type            | Description                         |
| ------------------- | --------------- | ----------------------------------- |
| `id`                | String (CUID)   | Primary key                         |
| `name`              | String (unique) | Character name                      |
| `level`             | Int             | Character level (default: 1)        |
| `race`              | Race            | Character race                      |
| `raceType`          | String          | Race type string                    |
| `playerClass`       | String?         | Character class name                |
| `classId`           | Int?            | Class reference                     |
| `alignment`         | Int             | Good/evil alignment (-1000 to 1000) |
| `strength`          | Int             | STR attribute (default: 13)         |
| `intelligence`      | Int             | INT attribute (default: 13)         |
| `wisdom`            | Int             | WIS attribute (default: 13)         |
| `dexterity`         | Int             | DEX attribute (default: 13)         |
| `constitution`      | Int             | CON attribute (default: 13)         |
| `charisma`          | Int             | CHA attribute (default: 13)         |
| `luck`              | Int             | LUCK attribute (default: 13)        |
| `hitPoints`         | Int             | Current HP (default: 100)           |
| `hitPointsMax`      | Int             | Maximum HP (default: 100)           |
| `movement`          | Int             | Current movement (default: 100)     |
| `movementMax`       | Int             | Maximum movement (default: 100)     |
| `experience`        | Int             | Total experience points             |
| `skillPoints`       | Int             | Available skill points              |
| `copper`            | Int             | Copper pieces                       |
| `silver`            | Int             | Silver pieces                       |
| `gold`              | Int             | Gold pieces                         |
| `platinum`          | Int             | Platinum pieces                     |
| `bankCopper`        | Int             | Banked copper pieces                |
| `bankSilver`        | Int             | Banked silver pieces                |
| `bankGold`          | Int             | Banked gold pieces                  |
| `bankPlatinum`      | Int             | Banked platinum pieces              |
| `totalWealth`       | Int             | Calculated total wealth             |
| `averageStats`      | Int             | Average attribute value             |
| `passwordHash`      | String?         | Character password hash             |
| `gender`            | String          | Character gender                    |
| `height`            | Int?            | Character height                    |
| `weight`            | Int?            | Character weight                    |
| `baseSize`          | Int             | Base size category                  |
| `currentSize`       | Int             | Current size (with modifiers)       |
| `hitRoll`           | Int             | Attack bonus                        |
| `damageRoll`        | Int             | Damage bonus                        |
| `armorClass`        | Int             | Armor class value                   |
| `currentRoom`       | Int?            | Current location                    |
| `saveRoom`          | Int?            | Saved/recall location               |
| `homeRoom`          | Int?            | Home location                       |
| `lastLogin`         | DateTime?       | Last login time                     |
| `timePlayed`        | Int             | Total time played (seconds)         |
| `isOnline`          | Boolean         | Currently online status             |
| `hunger`            | Int             | Hunger level                        |
| `thirst`            | Int             | Thirst level                        |
| `description`       | String?         | Character description               |
| `title`             | String?         | Character title                     |
| `prompt`            | String          | Command prompt format               |
| `pageLength`        | Int             | Paging size                         |
| `playerFlags`       | String[]        | Player behavior flags               |
| `effectFlags`       | String[]        | Active magical effects              |
| `privilegeFlags`    | String[]        | Special privileges                  |
| `olcZones`          | Int[]           | Online creation zones               |
| `invisLevel`        | Int             | Invisibility level                  |
| `birthTime`         | DateTime        | Character creation time             |
| `userId`            | String          | Owner reference                     |

**Relations:**

- `user` - Account owner
- `class` - Character class details
- `effects[]` - Active character effects
- `items[]` - Character inventory
- `skills[]` - Character skills
- `spells[]` - Character spells

---

## World Structure

### Zone

Top-level world organization unit with reset configuration.

| Field        | Type       | Description                          |
| ------------ | ---------- | ------------------------------------ |
| `id`         | Int        | Zone number (primary key)            |
| `name`       | String     | Zone display name                    |
| `top`        | Int        | Highest room number in zone          |
| `lifespan`   | Int        | Minutes between resets (default: 30) |
| `resetMode`  | ResetMode  | Reset behavior pattern               |
| `hemisphere` | Hemisphere | Weather system region                |
| `climate`    | Climate    | Climate type                         |
| `createdAt`  | DateTime   | Creation timestamp                   |
| `updatedAt`  | DateTime   | Last modification                    |
| `deletedAt`  | DateTime?  | Soft delete timestamp                |
| `createdBy`  | String?    | Creator user ID                      |
| `updatedBy`  | String?    | Last modifier user ID                |

**Relations:**

- `rooms[]` - All rooms in zone
- `mobs[]` - All mobs defined in zone
- `objects[]` - All objects defined in zone
- `shops[]` - All shops in zone
- `triggers[]` - All triggers in zone
- `mobResets[]` - Mob spawn configurations

**Zone Reset System:**

Zones automatically reset based on their `resetMode` and `lifespan` configuration:

- **ResetMode.NEVER**: Zone never resets, mobs/objects persist
- **ResetMode.EMPTY**: Reset only when no players are present
- **ResetMode.NORMAL**: Reset every `lifespan` minutes regardless of players

When a zone resets:
1. All existing mob instances are removed
2. Each MobReset entry spawns new mobs up to its `max` limit
3. Spawned mobs receive their configured carrying/equipped items
4. Zone timer is reset to `lifespan` minutes

### Room

Individual locations in the world with 3D layout support.

| Field         | Type          | Description               |
| ------------- | ------------- | ------------------------- |
| `id`          | Int           | Room number (primary key) |
| `id`        | Int           | Zone-relative room number |
| `name`        | String        | Room title                |
| `description` | String (Text) | Room description          |
| `sector`      | Sector        | Terrain type              |
| `flags`       | RoomFlag[]    | Room properties           |
| `layoutX`     | Int?          | Grid X coordinate         |
| `layoutY`     | Int?          | Grid Y coordinate         |
| `layoutZ`     | Int?          | Grid Z level (default: 0) |
| `zoneId`      | Int           | Parent zone               |
| `createdAt`   | DateTime      | Creation timestamp        |
| `updatedAt`   | DateTime      | Last modification         |
| `deletedAt`   | DateTime?     | Soft delete timestamp     |
| `createdBy`   | String?       | Creator user ID           |
| `updatedBy`   | String?       | Last modifier user ID     |

**Relations:**

- `zone` - Parent zone
- `exits[]` - Available exits
- `extraDescs[]` - Additional descriptions
- `mobResets[]` - Mob spawns in this room

**Unique Constraints:**
- `(zoneId, id)` - Zone-relative room numbers must be unique

### RoomExit

Connections between rooms.

| Field         | Type          | Description      |
| ------------- | ------------- | ---------------- |
| `id`          | String (CUID) | Primary key      |
| `direction`   | Direction     | Exit direction   |
| `description` | String?       | Exit description |
| `keyword`     | String?       | Door keyword     |
| `key`         | String?       | Required key ID  |
| `destination` | Int?          | Target room ID   |
| `roomId`      | Int           | Source room      |

**Unique Constraint:** `(roomId, direction)`

### RoomExtraDescription

Additional examine descriptions for rooms.

| Field         | Type          | Description      |
| ------------- | ------------- | ---------------- |
| `id`          | String (CUID) | Primary key      |
| `keyword`     | String        | Trigger keyword  |
| `description` | String (Text) | Description text |
| `roomId`      | Int           | Parent room      |

---

## Game Entities

### Mob (NPCs)

Non-player character definitions.

| Field                                                          | Type          | Description               |
| -------------------------------------------------------------- | ------------- | ------------------------- |
| `id`                                                           | Int           | Mob number (primary key)  |
| `keywords`                                                     | String        | Targeting keywords        |
| `mobClass`                                                     | String        | Mob class                 |
| `shortDesc`                                                    | String        | Name in room              |
| `longDesc`                                                     | String (Text) | Room presence description |
| `desc`                                                         | String (Text) | Examine description       |
| `mobFlags`                                                     | MobFlag[]     | Behavior flags            |
| `effectFlags`                                                  | EffectFlag[]  | Active effects            |
| `alignment`                                                    | Int           | Good/evil alignment       |
| `level`                                                        | Int           | Character level           |
| `armorClass`                                                   | Int           | AC value                  |
| `hitRoll`                                                      | Int           | Attack bonus              |
| `move`                                                         | Int           | Movement points           |
| `hpDiceNum`                                                    | Int           | HP dice count             |
| `hpDiceSize`                                                   | Int           | HP dice size              |
| `hpDiceBonus`                                                  | Int           | HP dice bonus             |
| `damageDiceNum`                                                | Int           | Damage dice count         |
| `damageDiceSize`                                               | Int           | Damage dice size          |
| `damageDiceBonus`                                              | Int           | Damage dice bonus         |
| `copper/silver/gold/platinum`                                  | Int           | Currency                  |
| `position`                                                     | Position      | Current position          |
| `defaultPosition`                                              | Position      | Default position          |
| `gender`                                                       | Gender        | Gender                    |
| `race`                                                         | Race          | Mob race                  |
| `raceAlign`                                                    | Int           | Racial alignment modifier |
| `size`                                                         | Size          | Physical size             |
| `strength/intelligence/wisdom/dexterity/constitution/charisma` | Int           | Attributes                |
| `perception`                                                   | Int           | Perception skill          |
| `concealment`                                                  | Int           | Stealth skill             |
| `lifeForce`                                                    | LifeForce     | Nature of existence       |
| `composition`                                                  | Composition   | Physical makeup           |
| `stance`                                                       | Stance        | Combat readiness          |
| `damageType`                                                   | DamageType    | Attack type               |
| `zoneId`                                                       | Int           | Parent zone               |

### Object (Items)

Item definitions with type-specific properties.

| Field            | Type           | Description                 |
| ---------------- | -------------- | --------------------------- |
| `id`             | Int            | Object number (primary key) |
| `type`           | ObjectType     | Item category               |
| `keywords`       | String         | Targeting keywords          |
| `shortDesc`      | String         | Inventory name              |
| `description`    | String (Text)  | Ground description          |
| `actionDesc`     | String? (Text) | Action description          |
| `flags`          | ObjectFlag[]   | Item properties             |
| `effectFlags`    | EffectFlag[]   | Magical effects             |
| `wearFlags`      | WearFlag[]     | Equipment slots             |
| `weight`         | Float          | Item weight                 |
| `cost`           | Int            | Base cost                   |
| `timer`          | Int            | Decay timer                 |
| `decomposeTimer` | Int            | Decompose timer             |
| `level`          | Int            | Item level                  |
| `concealment`    | Int            | Hidden value                |
| `values`         | Json           | Type-specific properties    |
| `zoneId`         | Int            | Parent zone                 |

**Relations:**

- `extraDescs[]` - Additional descriptions
- `affects[]` - Stat modifications
- `spells[]` - Magical effects
- `triggers[]` - Script attachments

### ObjectExtraDescription

Additional examine descriptions for objects.

| Field         | Type          | Description      |
| ------------- | ------------- | ---------------- |
| `id`          | String (CUID) | Primary key      |
| `keyword`     | String        | Trigger keyword  |
| `description` | String (Text) | Description text |
| `objectId`    | Int           | Parent object    |

### ObjectAffect

Stat modifications provided by objects.

| Field      | Type          | Description        |
| ---------- | ------------- | ------------------ |
| `id`       | String (CUID) | Primary key        |
| `location` | String        | Affected attribute |
| `modifier` | Int           | Modification value |
| `objectId` | Int           | Parent object      |

### ObjectSpell

Spells cast by objects.

| Field      | Type          | Description   |
| ---------- | ------------- | ------------- |
| `id`       | String (CUID) | Primary key   |
| `spell`    | String        | Spell name    |
| `level`    | Int           | Spell level   |
| `objectId` | Int           | Parent object |

---

## Commerce System

### Shop

Commerce locations with NPCs.

| Field             | Type             | Description           |
| ----------------- | ---------------- | --------------------- |
| `id`              | Int              | Shop ID (primary key) |
| `buyProfit`       | Float            | Buy price modifier    |
| `sellProfit`      | Float            | Sell price modifier   |
| `temper1`         | Int              | Aggression level      |
| `flags`           | ShopFlag[]       | Shop behaviors        |
| `tradesWithFlags` | ShopTradesWith[] | Trading restrictions  |
| `keeperId`        | Int?             | Shopkeeper mob ID     |
| `zoneId`          | Int              | Parent zone           |

**Messages:** `noSuchItem1/2`, `doNotBuy`, `missingCash1/2`, `messageBuy/Sell`

**Relations:**

- `keeper` - Shopkeeper mob
- `items[]` - Inventory
- `accepts[]` - Accepted item types
- `rooms[]` - Shop locations
- `hours[]` - Operating hours

### ShopItem

Items available for purchase.

| Field      | Type          | Description                 |
| ---------- | ------------- | --------------------------- |
| `id`       | String (CUID) | Primary key                 |
| `amount`   | Int           | Stock amount (0 = infinite) |
| `shopId`   | Int           | Parent shop                 |
| `objectId` | Int           | Item reference              |

**Unique Constraint:** `(shopId, objectId)`

### ShopAccept

Item types accepted by shop.

| Field      | Type          | Description          |
| ---------- | ------------- | -------------------- |
| `id`       | String (CUID) | Primary key          |
| `type`     | String        | Object type accepted |
| `keywords` | String?       | Specific keywords    |
| `shopId`   | Int           | Parent shop          |

### ShopRoom

Rooms where shop operates.

| Field    | Type          | Description    |
| -------- | ------------- | -------------- |
| `id`     | String (CUID) | Primary key    |
| `roomId` | Int           | Room reference |
| `shopId` | Int           | Parent shop    |

**Unique Constraint:** `(shopId, roomId)`

### ShopHour

Operating hours for shops.

| Field    | Type          | Description         |
| -------- | ------------- | ------------------- |
| `id`     | String (CUID) | Primary key         |
| `open`   | Int           | Opening hour (0-23) |
| `close`  | Int           | Closing hour (0-23) |
| `shopId` | Int           | Parent shop         |

---

## Reset Systems

Zone reset systems control how and when mobs and objects respawn in the world. The modern system uses equipment sets for better organization and object resets for room items.

### MobReset

Mob spawning configuration that defines where and how many mobs spawn in rooms.

| Field           | Type          | Description                    |
| --------------- | ------------- | ------------------------------ |
| `id`            | String (CUID) | Primary key                    |
| `max`           | Int           | Maximum mob instances (default: 1) |
| `name`          | String?       | Human-readable reset description |
| `mobId`         | Int           | Mob prototype to spawn         |
| `roomId`        | Int           | Room where mob spawns          |
| `zoneId`        | Int           | Parent zone                    |
| `probability`   | Float         | Spawn probability (0.0-1.0, default: 1.0) |

**Relations:**

- `mob` - Mob prototype definition
- `room` - Spawn location room
- `zone` - Parent zone
- `equipmentSets[]` - Equipment sets assigned to this reset
- `conditions[]` - Conditional spawn logic

**Zone Reset Logic:**
- When a zone resets, it checks each MobReset
- Applies probability calculation to determine if spawn occurs
- Evaluates spawn conditions if present
- If current mob count < `max`, spawns new mobs
- Each spawned mob gets equipment from assigned equipment sets

### EquipmentSet

Reusable collections of equipment for consistent mob outfitting.

| Field         | Type          | Description                    |
| ------------- | ------------- | ------------------------------ |
| `id`          | String (CUID) | Primary key                    |
| `name`        | String        | Equipment set name             |
| `description` | String?       | Set description                |
| `createdAt`   | DateTime      | Creation timestamp             |
| `updatedAt`   | DateTime      | Last modified timestamp        |

**Relations:**

- `items[]` - Individual equipment pieces in the set
- `mobResets[]` - Mob resets using this equipment set

**Usage Benefits:**
- Consistent equipment across multiple mob types
- Easy maintenance of common equipment combinations
- Support for thematic equipment groupings (e.g., "Guard Captain Set", "Mage Robes")

### EquipmentSetItem

Individual equipment pieces within an equipment set.

| Field             | Type          | Description                      |
| ----------------- | ------------- | -------------------------------- |
| `id`              | String (CUID) | Primary key                      |
| `equipmentSetId`  | String        | Parent equipment set             |
| `objectId`        | Int           | Object prototype to create       |
| `slot`            | String        | Equipment slot name              |
| `probability`     | Float         | Item spawn probability (default: 1.0) |

**Relations:**

- `equipmentSet` - Parent equipment set
- `object` - Object prototype definition

**Equipment Slots:**
Standard slots include: `Light`, `FingerRight`, `FingerLeft`, `Neck1`, `Neck2`, `Body`, `Head`, `Legs`, `Feet`, `Hands`, `Arms`, `Shield`, `About`, `Waist`, `WristRight`, `WristLeft`, `Wield`, `Hold`, `Float`, `Eyes`, `Face`, `Ear`, `Belt`

**Unique Constraint:** `(equipmentSetId, slot)` - One item per slot per set

### MobEquipmentSet

Links mob resets to equipment sets with spawn probabilities.

| Field             | Type          | Description                      |
| ----------------- | ------------- | -------------------------------- |
| `id`              | String (CUID) | Primary key                      |
| `mobResetId`      | String        | Parent mob reset                 |
| `equipmentSetId`  | String        | Equipment set to apply           |
| `probability`     | Float         | Set application probability (default: 1.0) |

**Relations:**

- `mobReset` - Parent mob reset configuration
- `equipmentSet` - Equipment set definition

**Reset Behavior:**
- When mob spawns, applies probability to determine if set is used
- If applied, creates all items from the equipment set
- Items are automatically equipped to their designated slots
- Multiple equipment sets can be assigned to one mob reset

**Unique Constraint:** `(mobResetId, equipmentSetId)` - No duplicate set assignments

### ObjectReset

Object spawning configuration for items that appear in rooms.

| Field         | Type          | Description                    |
| ------------- | ------------- | ------------------------------ |
| `id`          | String (CUID) | Primary key                    |
| `max`         | Int           | Maximum object instances (default: 1) |
| `name`        | String?       | Human-readable reset description |
| `objectId`    | Int           | Object prototype to spawn      |
| `roomId`      | Int           | Room where object spawns       |
| `zoneId`      | Int           | Parent zone                    |
| `probability` | Float         | Spawn probability (0.0-1.0, default: 1.0) |

**Relations:**

- `object` - Object prototype definition
- `room` - Spawn location room
- `zone` - Parent zone
- `conditions[]` - Conditional spawn logic

**Reset Behavior:**
- When a zone resets, it checks each ObjectReset
- Applies probability calculation to determine if spawn occurs
- Evaluates spawn conditions if present
- If current object count < `max`, spawns new objects
- Objects appear on the ground in the specified room

### SpawnCondition

Conditional logic for advanced spawn behavior.

| Field           | Type          | Description                    |
| --------------- | ------------- | ------------------------------ |
| `id`            | String (CUID) | Primary key                    |
| `type`          | String        | Condition type identifier      |
| `parameters`    | Json          | Condition-specific parameters  |
| `mobResetId`    | String?       | Parent mob reset (optional)    |
| `objectResetId` | String?       | Parent object reset (optional) |

**Relations:**

- `mobReset` - Parent mob reset (if applicable)
- `objectReset` - Parent object reset (if applicable)

**Condition Types:**
- `time_of_day` - Spawn only during specific game hours
- `weather` - Spawn based on weather conditions
- `player_count` - Spawn based on active player count
- `season` - Spawn based on game calendar
- `quest_state` - Spawn based on global quest flags
- `custom` - Custom Lua evaluation logic

**Example Parameters:**
```json
{
  "type": "time_of_day",
  "parameters": {
    "start_hour": 6,
    "end_hour": 18,
    "description": "Daylight hours only"
  }
}
```

---

## Scripting System

### Trigger

Lua script attachments for dynamic content.

| Field        | Type          | Description            |
| ------------ | ------------- | ---------------------- |
| `id`         | String (CUID) | Primary key            |
| `name`       | String        | Trigger name           |
| `attachType` | ScriptType    | Attachment target type |
| `flags`      | TriggerFlag[] | Trigger conditions     |
| `numArgs`    | Int           | Argument count         |
| `argList`    | String?       | Argument specification |
| `commands`   | String (Text) | Lua script code        |
| `variables`  | Json          | Script variables       |

**Polymorphic Relations:**

- `zoneId/zone` - Zone-level triggers
- `mobId/mob` - Mob-specific triggers
- `objectId/object` - Object-specific triggers

---

## Audit System

### AuditLog

Complete change tracking for all modifications.

| Field        | Type          | Description                        |
| ------------ | ------------- | ---------------------------------- |
| `id`         | String (CUID) | Primary key                        |
| `action`     | String        | Action type (CREATE/UPDATE/DELETE) |
| `entityType` | String        | Entity type modified               |
| `entityId`   | String        | Entity ID                          |
| `oldValues`  | Json?         | Previous values                    |
| `newValues`  | Json?         | New values                         |
| `userId`     | String        | User who made change               |
| `createdAt`  | DateTime      | When change occurred               |

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

---

## Character System Extensions

### CharacterItem

Items in character inventory with instance-specific properties.

| Field                | Type          | Description                    |
| -------------------- | ------------- | ------------------------------ |
| `id`                 | String (CUID) | Primary key                    |
| `characterId`        | String        | Owner character                |
| `objectPrototypeId`  | Int           | Base object reference          |
| `containerId`        | String?       | Container item reference       |
| `equippedLocation`   | String?       | Equipment slot                 |
| `condition`          | Int           | Item condition (0-100)         |
| `charges`            | Int           | Remaining charges (-1 = N/A)   |
| `instanceFlags`      | String[]      | Instance-specific flags        |
| `customShortDesc`    | String?       | Custom short description       |
| `customLongDesc`     | String?       | Custom long description        |
| `customValues`       | Json          | Custom property overrides      |
| `createdAt`          | DateTime      | Creation timestamp             |
| `updatedAt`          | DateTime      | Last modification              |

**Relations:**

- `character` - Owner character
- `objectPrototype` - Base item definition
- `container` - Container (for nested items)
- `containedItems[]` - Items inside this container

### CharacterEffect

Temporary and permanent effects on characters.

| Field          | Type          | Description            |
| -------------- | ------------- | ---------------------- |
| `id`           | String (CUID) | Primary key            |
| `characterId`  | String        | Affected character     |
| `effectName`   | String        | Effect identifier      |
| `effectType`   | String?       | Effect category        |
| `duration`     | Int?          | Duration in seconds    |
| `strength`     | Int           | Effect strength        |
| `modifierData` | Json          | Effect-specific data   |
| `sourceType`   | String?       | Source type (spell/item/etc) |
| `sourceId`     | Int?          | Source entity ID       |
| `appliedAt`    | DateTime      | When effect was applied |
| `expiresAt`    | DateTime?     | When effect expires    |

**Relations:**

- `character` - Affected character

---

## Game Logic System

### Class

Character classes with progression rules.

| Field         | Type         | Description                |
| ------------- | ------------ | -------------------------- |
| `id`          | Int          | Primary key (auto)         |
| `name`        | String       | Class name (unique)        |
| `description` | String?      | Class description          |
| `hitDice`     | String       | HP progression dice        |
| `primaryStat` | String?      | Primary attribute          |
| `createdAt`   | DateTime     | Creation timestamp         |
| `updatedAt`   | DateTime     | Last modification          |

**Relations:**

- `characters[]` - Characters of this class
- `mobs[]` - Mobs of this class
- `skillAccess[]` - Available skills
- `spellCircles[]` - Spell access by circle

### Spell

Magic spell definitions with comprehensive targeting and effects.

| Field            | Type         | Description                    |
| ---------------- | ------------ | ------------------------------ |
| `id`             | Int          | Primary key (auto)             |
| `name`           | String       | Spell name (unique)            |
| `schoolId`       | Int?         | Magic school reference         |
| `minPosition`    | Position     | Minimum casting position       |
| `violent`        | Boolean      | Causes combat flag             |
| `castTimeRounds` | Int          | Casting time in rounds         |
| `cooldownMs`     | Int          | Cooldown in milliseconds       |
| `inCombatOnly`   | Boolean      | Combat-only restriction        |
| `isArea`         | Boolean      | Area effect spell              |
| `notes`          | String?      | Designer notes                 |
| `createdAt`      | DateTime     | Creation timestamp             |
| `updatedAt`      | DateTime     | Last modification              |

**Relations:**

- `school` - Magic school
- `characterSpells[]` - Character spell knowledge
- `mobSpells[]` - Mob spell knowledge
- `classCircles[]` - Class access levels
- `components[]` - Required components
- `effects[]` - Spell effects
- `messages` - Spell messages
- `restrictions` - Casting restrictions
- `savingThrows[]` - Saving throw rules
- `targeting` - Targeting rules

### SpellSchool

Magic schools for spell organization.

| Field         | Type     | Description            |
| ------------- | -------- | ---------------------- |
| `id`          | Int      | Primary key (auto)     |
| `name`        | String   | School name (unique)   |
| `description` | String?  | School description     |

**Relations:**

- `spells[]` - Spells in this school

### Skill

Character abilities and skills.

| Field         | Type          | Description               |
| ------------- | ------------- | ------------------------- |
| `id`          | Int           | Primary key (auto)        |
| `name`        | String        | Skill name (unique)       |
| `description` | String?       | Skill description         |
| `type`        | SkillType     | Skill category            |
| `category`    | SkillCategory | Availability level        |
| `maxLevel`    | Int           | Maximum skill level       |
| `createdAt`   | DateTime      | Creation timestamp        |
| `updatedAt`   | DateTime      | Last modification         |

**Relations:**

- `characterSkills[]` - Character skill levels
- `classSkills[]` - Class skill access
- `mobSkills[]` - Mob skill levels
- `raceSkills[]` - Racial skill bonuses

### CharacterSkill

Character skill progression tracking.

| Field         | Type          | Description          |
| ------------- | ------------- | -------------------- |
| `id`          | String (CUID) | Primary key          |
| `characterId` | String        | Character reference  |
| `skillId`     | Int           | Skill reference      |
| `level`       | Int           | Current skill level  |
| `experience`  | Int           | Skill experience     |
| `lastUsed`    | DateTime?     | Last usage timestamp |

**Relations:**

- `character` - Character owner
- `skill` - Skill definition

**Unique Constraint:** `(characterId, skillId)`

### CharacterSpell

Character spell knowledge and proficiency.

| Field         | Type          | Description             |
| ------------- | ------------- | ----------------------- |
| `id`          | String (CUID) | Primary key             |
| `characterId` | String        | Character reference     |
| `spellId`     | Int           | Spell reference         |
| `known`       | Boolean       | Spell is known          |
| `proficiency` | Int           | Casting proficiency     |
| `lastCast`    | DateTime?     | Last cast timestamp     |

**Relations:**

- `character` - Character owner
- `spell` - Spell definition

**Unique Constraint:** `(characterId, spellId)`

---

## Security & Audit System

### ChangeLog

Comprehensive change tracking for all modifications.

| Field         | Type          | Description                      |
| ------------- | ------------- | -------------------------------- |
| `id`          | String (CUID) | Primary key                      |
| `entityType`  | String        | Type of entity modified          |
| `entityId`    | String        | Entity identifier                |
| `action`      | String        | Action performed                 |
| `changes`     | Json          | Detailed change data             |
| `userId`      | String        | User who made change             |
| `timestamp`   | DateTime      | When change occurred             |
| `description` | String?       | Human-readable description       |

**Relations:**

- `user` - User who made the change

**Indexes:**
- `(entityType, entityId)` - Entity lookups
- `(userId, timestamp)` - User activity
- `timestamp` - Chronological sorting

### BanRecord

User ban management system.

| Field         | Type          | Description               |
| ------------- | ------------- | ------------------------- |
| `id`          | String (CUID) | Primary key               |
| `userId`      | String        | Banned user               |
| `bannedBy`    | String        | Admin who issued ban      |
| `reason`      | String        | Ban reason                |
| `bannedAt`    | DateTime      | Ban timestamp             |
| `expiresAt`   | DateTime?     | Expiration (null = permanent) |
| `unbannedAt`  | DateTime?     | Unban timestamp           |
| `unbannedBy`  | String?       | Admin who lifted ban      |
| `active`      | Boolean       | Currently active          |

**Relations:**

- `user` - Banned user
- `admin` - Banning administrator

**Indexes:**
- `userId` - User ban lookups
- `bannedBy` - Admin activity
- `active` - Active ban queries
- `bannedAt` - Chronological sorting

---

For enum definitions and values, see [enums.md](./enums.md).
For import processes, see [world-import.md](./world-import.md).
