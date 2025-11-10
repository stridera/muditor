# Ability System Restoration

## Models to Add to schema.prisma

### 1. RaceSkills (Racial Ability Bonuses)

Add this model after the `Races` model (around line 642):

```prisma
model RaceAbilities {
  id       Int           @id @default(autoincrement())
  race     Race
  abilityId Int         @map("ability_id")
  category SkillCategory @default(SECONDARY)
  bonus    Int           @default(0)           // Proficiency bonus for this race
  raceData Races         @relation(fields: [race], references: [race], onDelete: Cascade)
  ability  Ability       @relation(fields: [abilityId], references: [id], onDelete: Cascade)

  @@unique([race, abilityId])
}
```

**Purpose**: Defines racial bonuses to abilities
- Elves: +15 bonus to Archery, +10 to Stealth
- Dwarves: +20 bonus to Mining, +15 to Smithing
- Halflings: +15 bonus to Hiding, +10 to Pickpocketing

**Fields**:
- `race`: Which race gets the bonus
- `abilityId`: Which ability gets the bonus
- `category`: PRIMARY (core racial skill), SECONDARY (common), RESTRICTED (limited), FORBIDDEN (cannot learn)
- `bonus`: Starting proficiency bonus (0-100)

### 2. ObjectAbilities (Magical Items)

Add this model after the `AbilityComponent` model (around line 138):

```prisma
model ObjectAbilities {
  id           Int     @id @default(autoincrement())
  abilityId    Int     @map("ability_id")
  level        Int     @default(1)           // Caster level for effect calculations
  objectZoneId Int     @map("object_zone_id")
  objectId     Int     @map("object_id")
  charges      Int?                          // Override object.charges if specified
  objects      Objects @relation(fields: [objectZoneId, objectId], references: [zoneId, id], onDelete: Cascade)
  ability      Ability @relation(fields: [abilityId], references: [id], onDelete: Cascade)

  @@unique([objectZoneId, objectId, abilityId])
}
```

**Purpose**: Allows objects to cast abilities (scrolls, wands, potions, magical weapons)

**Examples**:
- Scroll of Fireball: `{ abilityId: "fireball", level: 10, charges: 1 }`
- Wand of Magic Missile: `{ abilityId: "magic_missile", level: 5, charges: 20 }`
- Potion of Healing: `{ abilityId: "cure_light", level: 7, charges: 1 }`
- Flaming Sword: `{ abilityId: "flame_weapon", level: 12, charges: -1 }` (infinite)

**Fields**:
- `abilityId`: Which ability the object can cast
- `level`: Caster level (affects damage, duration, DC calculations)
- `charges`: Overrides object.charges if needed, -1 = infinite

## Required Relationship Updates

### Update Ability model (add these to relationships section around line 37-48):

```prisma
model Ability {
  // ... existing fields ...

  // --- Relationships ---
  effects              AbilityEffect[]
  school               AbilitySchool?       @relation(fields: [schoolId], references: [id])
  characterAbilities   CharacterAbilities[]
  mobAbilities         MobAbilities[]
  classAbilities       ClassAbilities[]
  classSkills          ClassSkills[]
  components           AbilityComponent[]
  messages             AbilityMessages?
  restrictions         AbilityRestrictions?
  savingThrows         AbilitySavingThrow[]
  targeting            AbilityTargeting?
  raceAbilities        RaceAbilities[]      // NEW
  objectAbilities      ObjectAbilities[]    // NEW

  // ... existing timestamps ...
}
```

### Update Races model (add relationship around line 641):

```prisma
model Races {
  // ... existing fields ...
  permanentEffects    EffectFlag[] @map("permanent_effects")
  createdAt           DateTime @map("created_at") @default(now())
  updatedAt           DateTime @map("updated_at") @updatedAt
  raceAbilities       RaceAbilities[]      // NEW
}
```

### Update Objects model (add relationship around line 594):

```prisma
model Objects {
  // ... existing fields ...
  objectAffects            ObjectAffects[]
  objectExtraDescriptions  ObjectExtraDescriptions[]
  objectResets             ObjectResets[]
  zones                    Zones                       @relation(fields: [zoneId], references: [id], onDelete: Cascade)
  shopItems                ShopItems[]
  triggers                 Triggers[]
  objectAbilities          ObjectAbilities[]    // NEW

  @@id([zoneId, id])
}
```

## Migration Strategy

1. **Add the models** to `packages/db/prisma/schema.prisma`
2. **Generate migration**: `cd packages/db && pnpm db:migrate`
3. **Generate Prisma clients**: `pnpm db:generate`
4. **Seed data examples**:

```typescript
// Racial ability bonuses
await prisma.raceAbilities.createMany({
  data: [
    // Elves
    { race: 'ELF', abilityId: archeryId, category: 'PRIMARY', bonus: 15 },
    { race: 'ELF', abilityId: stealthId, category: 'SECONDARY', bonus: 10 },

    // Dwarves
    { race: 'DWARF', abilityId: miningId, category: 'PRIMARY', bonus: 20 },
    { race: 'DWARF', abilityId: smithingId, category: 'PRIMARY', bonus: 15 },

    // Halflings
    { race: 'HALFLING', abilityId: hidingId, category: 'PRIMARY', bonus: 15 },
    { race: 'HALFLING', abilityId: pickpocketId, category: 'SECONDARY', bonus: 10 },
  ]
});

// Magical items
await prisma.objectAbilities.createMany({
  data: [
    // Scroll of Fireball (zone 30, object 101)
    { objectZoneId: 30, objectId: 101, abilityId: fireballId, level: 10, charges: 1 },

    // Wand of Magic Missile (zone 30, object 102)
    { objectZoneId: 30, objectId: 102, abilityId: magicMissileId, level: 5, charges: 20 },

    // Potion of Healing (zone 30, object 103)
    { objectZoneId: 30, objectId: 103, abilityId: cureLightId, level: 7, charges: 1 },

    // Flaming Longsword (zone 30, object 104)
    { objectZoneId: 30, objectId: 104, abilityId: flameWeaponId, level: 12, charges: -1 },
  ]
});
```

## Game Logic Integration

### Racial Ability System
```typescript
// When character is created, apply racial bonuses
async function applyRacialBonuses(characterId: string, race: Race) {
  const racialBonuses = await prisma.raceAbilities.findMany({
    where: { race },
    include: { ability: true }
  });

  for (const bonus of racialBonuses) {
    await prisma.characterAbilities.create({
      data: {
        characterId,
        abilityId: bonus.abilityId,
        known: bonus.category !== 'FORBIDDEN',
        proficiency: bonus.bonus, // Start with racial bonus
      }
    });
  }
}
```

### Object Ability System
```typescript
// When object is used (read scroll, zap wand, quaff potion)
async function useObjectAbility(characterId: string, objectZoneId: number, objectId: number) {
  const objectAbilities = await prisma.objectAbilities.findMany({
    where: { objectZoneId, objectId },
    include: { ability: true }
  });

  if (objectAbilities.length === 0) {
    return { success: false, message: "Nothing happens." };
  }

  // Cast the ability at the specified level
  for (const oa of objectAbilities) {
    await castAbility(characterId, oa.ability, { casterLevel: oa.level });
  }

  // Consume charges (handled by object.charges or objectAbilities.charges)
  // ...

  return { success: true };
}
```

## Benefits of This Design

1. **RaceAbilities**:
   - Clean separation of racial bonuses from base ability definitions
   - Category system allows fine control (PRIMARY/SECONDARY/RESTRICTED/FORBIDDEN)
   - Bonus system gives races starting proficiency advantages
   - Easy to balance: adjust bonuses without touching ability definitions

2. **ObjectAbilities**:
   - Flexible: objects can cast multiple abilities (combo items)
   - Level control: item power scales with caster level
   - Charge system: scrolls (1 charge), wands (20 charges), artifacts (infinite)
   - Reusable: same ability definition used by players, mobs, and objects

3. **Unified System**:
   - Everything uses Ability → no duplicate code for "spells" vs "skills" on objects
   - Effect composition: Fireball object uses same effects as Fireball spell
   - Consistent mechanics: saving throws, targeting, messages all work the same
