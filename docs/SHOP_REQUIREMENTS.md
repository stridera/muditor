# Shop Requirements System

The shop requirements system allows world builders to control when items and mobs appear in shops, who can see them, and who can purchase them. This enables seasonal content, class-specific items, rare spawns, and secret inventory.

## Overview

Shop items and mobs have three control fields:

| Field                   | Type    | Default | Purpose                                   |
| ----------------------- | ------- | ------- | ----------------------------------------- |
| `spawnChance`           | Float   | 1.0     | Probability item exists in shop (0.0-1.0) |
| `visibilityRequirement` | String? | null    | Lua expression: when item shows in list   |
| `purchaseRequirement`   | String? | null    | Lua expression: when item can be bought   |

## Spawn Chance

Controls the probability that an item appears in the shop's inventory at all. Evaluated at zone reset or shop refresh.

```
spawnChance: 1.0    -- Always present (default)
spawnChance: 0.5    -- 50% chance
spawnChance: 0.01   -- 1% chance (rare item)
spawnChance: 0.001  -- 0.1% chance (ultra-rare)
```

## Visibility Requirement

A Lua expression that determines whether the item appears in the shop's list when a player browses inventory. If the expression evaluates to `false`, the item is hidden from the list.

**Use cases:**

- Seasonal items only visible during events
- High-level items only visible to experienced players
- Secret items that must be asked for by name

```lua
-- Always visible (default when null)
visibilityRequirement: null

-- Never visible (secret item - must ask by name)
visibilityRequirement: "false"

-- Only during Christmas event
visibilityRequirement: "event.active('christmas')"

-- Only visible to level 20+ players
visibilityRequirement: "actor.level >= 20"

-- Visible to warriors and paladins
visibilityRequirement: "actor.class == 'warrior' or actor.class == 'paladin'"
```

## Purchase Requirement

A Lua expression that determines whether the player can actually buy the item. If the expression evaluates to `false`, the purchase is denied with an appropriate message.

**Use cases:**

- Class-restricted items
- Alignment-restricted items
- Level requirements
- Quest completion requirements

```lua
-- Anyone can buy (default when null)
purchaseRequirement: null

-- Warriors only
purchaseRequirement: "actor.class == 'warrior'"

-- Good alignment only
purchaseRequirement: "actor.alignment > 500"

-- Must be level 10+
purchaseRequirement: "actor.level >= 10"

-- Must have completed a quest
purchaseRequirement: "actor.has_completed_quest('dragon_slayer')"
```

## Common Scenarios

### Seasonal Item (Christmas)

Item only appears during Christmas event:

```
spawnChance: 1.0
visibilityRequirement: "event.active('christmas')"
purchaseRequirement: null
```

### Rare Spawn

Item has 1% chance to appear:

```
spawnChance: 0.01
visibilityRequirement: null
purchaseRequirement: null
```

### Class-Restricted Item

Only warriors can buy:

```
spawnChance: 1.0
visibilityRequirement: null
purchaseRequirement: "actor.class == 'warrior'"
```

### Secret Item

Hidden from list, but can be purchased if player knows the name:

```
spawnChance: 1.0
visibilityRequirement: "false"
purchaseRequirement: null
```

### High-Level Exclusive

Only level 30+ can see AND buy:

```
spawnChance: 1.0
visibilityRequirement: "actor.level >= 30"
purchaseRequirement: "actor.level >= 30"
```

### Teaser Item

Everyone can see it, but only high-level can buy:

```
spawnChance: 1.0
visibilityRequirement: null
purchaseRequirement: "actor.level >= 20"
```

### Rare Halloween Special

1% spawn chance, only during Halloween:

```
spawnChance: 0.01
visibilityRequirement: "event.active('halloween')"
purchaseRequirement: null
```

---

# Events System

Events are global flags that can be used in requirement expressions. They support both scheduled (date-based) and manual activation.

## Events Table Schema

| Column        | Type      | Description                                 |
| ------------- | --------- | ------------------------------------------- |
| `id`          | Int       | Auto-increment primary key                  |
| `name`        | String    | Unique identifier: "christmas", "halloween" |
| `displayName` | String    | Human-readable: "Christmas Event"           |
| `description` | String?   | Optional description                        |
| `startDate`   | DateTime? | Scheduled start (null = manual only)        |
| `endDate`     | DateTime? | Scheduled end                               |
| `recurring`   | Boolean   | Repeats yearly? (ignores year in dates)     |
| `active`      | Boolean   | Manual on/off toggle                        |

## Event Activation Logic

An event is considered **active** when ANY of these conditions is true:

1. `active = true` (manual override)
2. `startDate <= now <= endDate` (scheduled window)
3. For recurring events: dates are compared ignoring year

## Example Events

| name            | displayName       | startDate | endDate | recurring | active |
| --------------- | ----------------- | --------- | ------- | --------- | ------ |
| christmas       | Christmas Event   | Dec 15    | Jan 6   | true      | false  |
| halloween       | Halloween         | Oct 20    | Nov 2   | true      | false  |
| summer_festival | Summer Festival   | null      | null    | false     | false  |
| double_xp       | Double XP Weekend | null      | null    | false     | false  |

### Scheduled Recurring Event (Christmas)

```sql
INSERT INTO "Events" (name, display_name, start_date, end_date, recurring)
VALUES ('christmas', 'Christmas Event', '2024-12-15', '2025-01-06', true);
```

This event activates automatically every year from Dec 15 to Jan 6.

### Manual Event (Double XP)

```sql
INSERT INTO "Events" (name, display_name, active)
VALUES ('double_xp', 'Double XP Weekend', false);

-- Activate manually:
UPDATE "Events" SET active = true WHERE name = 'double_xp';
```

---

# Lua Bindings Reference

## Actor Properties (`actor.*`)

| Property          | Type    | Description                                   |
| ----------------- | ------- | --------------------------------------------- |
| `actor.level`     | Int     | Character level                               |
| `actor.class`     | String  | Class name (lowercase): "warrior", "sorcerer" |
| `actor.alignment` | Int     | -1000 (evil) to +1000 (good)                  |
| `actor.gold`      | Int     | Gold on hand                                  |
| `actor.hp`        | Int     | Current hit points                            |
| `actor.max_hp`    | Int     | Maximum hit points                            |
| `actor.is_npc`    | Boolean | Is this an NPC?                               |

### Actor Methods

| Method                            | Returns | Description             |
| --------------------------------- | ------- | ----------------------- |
| `actor.has_completed_quest(name)` | Boolean | Quest completion check  |
| `actor.has_item(zone, id)`        | Boolean | Has object in inventory |
| `actor.reputation(faction)`       | Int     | Faction standing        |

## Event Properties (`event.*`)

| Method                       | Returns | Description                            |
| ---------------------------- | ------- | -------------------------------------- |
| `event.active(name)`         | Boolean | Is event currently active?             |
| `event.days_until(name)`     | Int     | Days until event starts (-1 if passed) |
| `event.days_remaining(name)` | Int     | Days remaining in active event         |

## Real-Time Properties (`real.*`)

For real-world time-based conditions:

| Property       | Type | Description    |
| -------------- | ---- | -------------- |
| `real.hour`    | Int  | 0-23           |
| `real.day`     | Int  | 1-31           |
| `real.month`   | Int  | 1-12           |
| `real.year`    | Int  | e.g., 2025     |
| `real.weekday` | Int  | 0-6 (Sunday=0) |

### Real-Time Methods

| Method                          | Returns | Description                            |
| ------------------------------- | ------- | -------------------------------------- |
| `real.is_weekend()`             | Boolean | Saturday or Sunday                     |
| `real.date_between(start, end)` | Boolean | Date in range (e.g., "Dec 1", "Jan 6") |

## World/Game Time (`world.*`)

For in-game time (FieryMUD calendar):

| Property            | Type   | Description                            |
| ------------------- | ------ | -------------------------------------- |
| `world.time.hour`   | Int    | Game hour 0-23                         |
| `world.time.month`  | Int    | Game month 0-15                        |
| `world.time.season` | String | "Winter", "Spring", "Summer", "Autumn" |

---

# Expression Examples

## Date-Based

```lua
-- Real-world Christmas season
real.date_between("Dec 1", "Jan 6")

-- Weekends only
real.is_weekend()

-- December only
real.month == 12

-- After 6 PM
real.hour >= 18
```

## Event-Based

```lua
-- During Christmas event
event.active('christmas')

-- During any holiday
event.active('christmas') or event.active('halloween') or event.active('easter')

-- Not during maintenance
not event.active('maintenance')
```

## Actor-Based

```lua
-- High level
actor.level >= 30

-- Specific class
actor.class == 'warrior'

-- Good alignment
actor.alignment > 500

-- Evil alignment
actor.alignment < -500

-- Rich player
actor.gold >= 10000

-- Multiple conditions
actor.level >= 20 and actor.class == 'sorcerer'

-- Class group
actor.class == 'warrior' or actor.class == 'paladin' or actor.class == 'ranger'
```

## Combined

```lua
-- Christmas item for warriors only
event.active('christmas') and actor.class == 'warrior'

-- Rare weekend special for high-level
real.is_weekend() and actor.level >= 25

-- Secret item requiring quest completion
actor.has_completed_quest('ancient_tomb')
```

---

# Database Schema Reference

## ShopItems Table

```sql
CREATE TABLE "ShopItems" (
    id SERIAL PRIMARY KEY,
    amount INTEGER DEFAULT 0,
    shop_zone_id INTEGER NOT NULL,
    shop_id INTEGER NOT NULL,
    object_zone_id INTEGER NOT NULL,
    object_id INTEGER NOT NULL,
    spawn_chance FLOAT DEFAULT 1.0,
    visibility_requirement TEXT,
    purchase_requirement TEXT,
    UNIQUE(shop_zone_id, shop_id, object_zone_id, object_id)
);
```

## ShopMobs Table

```sql
CREATE TABLE "ShopMobs" (
    id SERIAL PRIMARY KEY,
    amount INTEGER DEFAULT -1,  -- -1 = unlimited
    shop_zone_id INTEGER NOT NULL,
    shop_id INTEGER NOT NULL,
    mob_zone_id INTEGER NOT NULL,
    mob_id INTEGER NOT NULL,
    spawn_chance FLOAT DEFAULT 1.0,
    visibility_requirement TEXT,
    purchase_requirement TEXT,
    UNIQUE(shop_zone_id, shop_id, mob_zone_id, mob_id)
);
```

## Events Table

```sql
CREATE TABLE "Events" (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    recurring BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by TEXT,
    updated_by TEXT
);
```
