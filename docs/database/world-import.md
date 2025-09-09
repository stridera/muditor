# World Data Import Documentation

Comprehensive guide to importing legacy FieryMUD world data from JSON files into the modern database structure.

## Overview

The world data import system transforms all 130 legacy JSON zone files into normalized PostgreSQL database records. The import process handles data validation, enum conversion, relationship mapping, and error recovery.

## Architecture

```
JSON Files → WorldFileParser → Enum Mapping → Database Records
    ↓              ↓               ↓              ↓
130 files    Type conversion   Flag mapping   Relational data
```

## Import Process Flow

### 1. File Discovery

```typescript
// Scans world/ directory for JSON files
const worldFiles = fs
  .readdirSync(worldDir)
  .filter(file => file.endsWith('.json'))
  .sort((a, b) => parseInt(a) - parseInt(b)); // Numeric sort
```

### 2. Zone ID Mapping

Special handling for legacy Zone 0:

```typescript
// Zone 0 → Zone 1000 (database constraints require non-zero IDs)
const actualZoneId = zoneId === 0 ? 1000 : zoneId;
```

### 3. Data Parsing Order

Critical order to maintain referential integrity:

1. **Zone** - Parent container
2. **Mobs** - NPC definitions
3. **Objects** - Item definitions
4. **Rooms** - Location definitions
5. **Shops** - Commerce definitions
6. **Triggers** - Script definitions
7. **Mob Resets** - Spawn configurations

---

## Data Transformation

### Zone Data

```json
// Legacy JSON format
{
  "zone": {
    "id": "30",
    "name": "Mielikki",
    "top": 3499,
    "lifespan": 30,
    "reset_mode": "Normal",
    "hemisphere": "NORTHWEST",
    "climate": "OCEANIC"
  }
}
```

```typescript
// Database transformation
const zoneData: Prisma.ZoneCreateInput = {
  id: zoneId,
  name: zone.name || `Zone ${zoneId}`,
  top: zone.top || 0,
  lifespan: zone.lifespan || 30,
  resetMode: this.mapResetMode(zone.reset_mode),
  hemisphere: this.mapHemisphere(zone.hemisphere),
  climate: this.mapClimate(zone.climate),
};
```

### Mob Data

```json
// Legacy JSON format
{
  "mobs": [
    {
      "id": 3100,
      "name_list": "half-elven maid servant",
      "short_desc": "a half-elven maid",
      "mob_flags": ["SENTINEL", "ISNPC"],
      "effect_flags": ["DETECT_INVIS"],
      "race": 0,
      "gender": 2,
      "position": 3
    }
  ]
}
```

```typescript
// Database transformation with enum mapping
const mobData: Prisma.MobCreateInput = {
  id: mob.id,
  keywords: this.ensureString(mob.name_list),
  shortDesc: mob.short_desc,
  mobFlags: this.mapMobFlags(mob.mob_flags), // String[] → MobFlag[]
  effectFlags: this.mapEffectFlags(mob.effect_flags), // String[] → EffectFlag[]
  race: this.mapRace(mob.race), // Int → Race enum
  gender: this.mapGender(mob.gender), // Int → Gender enum
  position: this.mapPosition(mob.position), // Int → Position enum
  // ... other fields
};
```

### Object Data

```json
// Legacy JSON format
{
  "objects": [
    {
      "id": "3000",
      "type": "DRINKCON",
      "flags": ["FLOAT"],
      "effect_flags": [],
      "wear_flags": ["TAKE", "HOLD"],
      "values": {
        "Capacity": "512",
        "Remaining": "512",
        "Liquid": "BEER"
      }
    }
  ]
}
```

```typescript
// Database transformation
const objectData: Prisma.ObjectCreateInput = {
  id: parseInt(obj.id),
  type: this.mapObjectType(obj.type),
  flags: this.mapObjectFlags(obj.flags),
  effectFlags: this.mapEffectFlags(obj.effect_flags),
  wearFlags: this.mapWearFlags(obj.wear_flags),
  values: obj.values || {}, // JSON storage for type-specific data
  // ... other fields
};
```

### Room Data

```json
// Legacy JSON format
{
  "rooms": [
    {
      "id": "3001",
      "name": "The Forest Temple of Mielikki",
      "sector": "STRUCTURE",
      "flags": ["NOMOB", "INDOORS"],
      "exits": {
        "North": {
          "destination": "3002",
          "keyword": "",
          "key": "-1"
        }
      }
    }
  ]
}
```

```typescript
// Database transformation with relationship handling
const roomData: Prisma.RoomCreateInput = {
  id: parseInt(room.id),
  name: room.name,
  sector: this.mapSector(room.sector),
  flags: this.mapRoomFlags(room.flags),
  zone: { connect: { id: zoneId } },
};

// Separate exit creation
for (const [direction, exit] of Object.entries(room.exits)) {
  await this.prisma.roomExit.create({
    data: {
      direction: this.mapDirection(direction),
      destination: exit.destination ? parseInt(exit.destination) : null,
      roomId: createdRoom.id,
    },
  });
}
```

---

## Enum Mapping System

### Flag Array Processing

```typescript
private ensureArray(value: any): string[] {
  if (Array.isArray(value)) {
    return value.map(v => v.toString());
  }
  if (typeof value === 'string') {
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }
  return [];
}
```

### Mob Flags

```typescript
private mapMobFlags(flags: any): MobFlag[] {
  const flagArray = this.ensureArray(flags);
  return flagArray.map(flag => {
    const upperFlag = flag.toUpperCase();
    switch (upperFlag) {
      case 'SENTINEL': return MobFlag.SENTINEL;
      case 'ISNPC': return MobFlag.ISNPC;
      case 'AGGRESSIVE': return MobFlag.AGGRESSIVE;
      // ... 36+ more flags
      default: return MobFlag.ISNPC; // Safe fallback
    }
  }).filter(flag => flag !== undefined);
}
```

### Effect Flags

```typescript
private mapEffectFlags(flags: any): EffectFlag[] {
  return flagArray.map(flag => {
    const upperFlag = flag.toUpperCase();
    // Handle both prefixed and non-prefixed formats
    const normalizedFlag = upperFlag.startsWith('EFF_')
      ? upperFlag.substring(4)
      : upperFlag;
    switch (normalizedFlag) {
      case 'INVISIBLE': return EffectFlag.INVISIBLE;
      case 'DETECT_INVIS': return EffectFlag.DETECT_INVIS;
      // ... 40+ more effects
      default: return null; // Skip unknown
    }
  }).filter(flag => flag !== null) as EffectFlag[];
}
```

### Attribute Mapping

```typescript
private mapRace(race: any): Race {
  if (typeof race === 'number') {
    // Map legacy numeric IDs to enum values
    const raceNames = Object.values(Race);
    return raceNames[race] || Race.HUMAN;
  }
  const raceStr = race?.toString().toUpperCase();
  switch (raceStr) {
    case 'HUMAN': return Race.HUMAN;
    case 'ELF': return Race.ELF;
    // ... 35+ more races
    default: return Race.HUMAN;
  }
}
```

---

## Relationship Management

### Mob Reset System

```json
// Legacy format with inline equipment
{
  "resets": {
    "mob": [
      {
        "id": 3100,
        "max": 1,
        "room": 3052,
        "carrying": [{ "id": 3100, "max": 500, "name": "(a cup)" }],
        "equipped": [
          { "id": 3077, "max": 99, "location": "Head", "name": "(ribbon)" }
        ]
      }
    ]
  }
}
```

```typescript
// Database normalization
const mobReset = await this.prisma.mobReset.create({
  data: {
    max: reset.max,
    mob: { connect: { id: reset.id } },
    room: { connect: { id: reset.room } },
    zone: { connect: { id: zoneId } },
  },
});

// Separate carrying/equipment records
for (const item of reset.carrying) {
  await this.prisma.mobCarrying.create({
    data: {
      max: item.max,
      resetId: mobReset.id,
      objectId: item.id,
    },
  });
}
```

### Shop System

```json
// Legacy shop format
{
  "shops": [
    {
      "id": 3000,
      "keeper": 3000,
      "selling": { "3001": 0 },
      "trades_with": ["TRADES_WITH_ANYONE"],
      "flags": ["WILL_BUY_SAME_ITEM"]
    }
  ]
}
```

```typescript
// Normalized shop structure
const shop = await this.prisma.shop.create({
  data: {
    id: shop.id,
    keeper: shop.keeper ? { connect: { id: shop.keeper } } : undefined,
    flags: this.mapShopFlags(shop.flags),
    tradesWithFlags: this.mapShopTradesWithFlags(shop.trades_with),
  },
});

// Separate inventory items
for (const [objectId, amount] of Object.entries(shop.selling)) {
  await this.prisma.shopItem.create({
    data: {
      shopId: shop.id,
      objectId: parseInt(objectId),
      amount: amount as number,
    },
  });
}
```

---

## Error Handling

### Graceful Degradation

```typescript
try {
  const worldData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const result = await parser.parseWorldFile(worldData, actualZoneId);

  processedZones += result.zonesCreated;
  processedRooms += result.roomsCreated;
  // ... track all entity counts
} catch (error) {
  console.error(`❌ Error processing ${file}:`, error);
  // Continue with other files - don't fail entire import
}
```

### Data Validation

```typescript
private ensureString(value: any): string {
  if (Array.isArray(value)) {
    return value.join(' '); // Convert arrays to space-separated strings
  }
  if (typeof value === 'string') {
    return value;
  }
  return value?.toString() || '';
}
```

### Foreign Key Recovery

```typescript
// Handle missing mob references
if (shop.keeper) {
  shopData.keeper = {
    connect: { id: shop.keeper },
  };
}
// If keeper doesn't exist, shop is created without one (SetNull constraint)
```

---

## Performance Optimization

### Upsert Strategy

```typescript
await this.prisma.mob.upsert({
  where: { id: mob.id },
  update: mobData,
  create: mobData,
});
```

### Batch Processing

```typescript
// Process all files in sequence to maintain referential integrity
for (const file of worldFiles) {
  // Individual file processing allows recovery from single file failures
}
```

### Connection Management

```typescript
// Single persistent connection throughout import
const parser = new WorldFileParser(prisma);
```

---

## Data Statistics

After successful import, the system reports:

- **Zones**: 130 world areas (100% complete)
- **Rooms**: 9,963 locations
- **Mobs**: 2,070 NPCs
- **Objects**: 3,472 items
- **Shops**: 41 commerce locations
- **Triggers**: 2,653 scripts

---

## Troubleshooting

### Common Issues

**Foreign Key Violations**:

```
No 'Mob' record(s) found for a nested connect on 'Shop' record(s)
```

- **Cause**: Shop references non-existent keeper
- **Solution**: Import mobs before shops, use conditional connections

**Type Validation Errors**:

```
Invalid value provided. Expected Race, provided String.
```

- **Cause**: Enum mapping not applied
- **Solution**: Ensure all parsers use enum mapping functions

**Data Format Issues**:

```
Argument `location`: Invalid value provided. Expected String, provided Int.
```

- **Cause**: Legacy numeric values for string fields
- **Solution**: Add type conversion in mapping functions

### Debugging Tools

**Enable detailed logging**:

```typescript
console.log(`🔄 Processing ${entity.name} (${entity.id})...`);
```

**Validate enum mappings**:

```typescript
const mappedFlags = this.mapMobFlags(mob.mob_flags);
console.log(`Mapped ${mob.mob_flags} to ${mappedFlags}`);
```

**Check foreign key existence**:

```typescript
const existingMob = await this.prisma.mob.findUnique({
  where: { id: shop.keeper },
});
if (!existingMob) {
  console.warn(`Keeper ${shop.keeper} not found for shop ${shop.id}`);
}
```

---

## Future Enhancements

### Incremental Updates

- Delta import for changed files only
- Timestamp-based change detection
- Selective entity updates

### Validation Improvements

- Pre-import validation phase
- Dependency graph analysis
- Automatic reference resolution

### Performance Optimization

- Parallel processing where safe
- Bulk insert operations
- Connection pooling

For schema details, see [schema.md](./schema.md).
For enum definitions, see [enums.md](./enums.md).
