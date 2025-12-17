# Database Enums Reference

Complete reference for all enum types used in the Muditor database schema.

## Overview

The database uses comprehensive enum systems for type safety and data integrity. All enums are defined in the Prisma schema and enforced at both the database and application levels.

---

## User & Authentication Enums

### UserRole

System permission levels.

| Value      | Description                              |
| ---------- | ---------------------------------------- |
| `PLAYER`   | Regular game player                      |
| `IMMORTAL` | Trusted player with limited admin rights |
| `BUILDER`  | World builder with creation permissions  |
| `CODER`    | Developer with building permissions      |
| `GOD`      | Full administrator access                |

---

## World Geography Enums

### ResetMode

Zone reset behavior patterns.

| Value    | Description                      |
| -------- | -------------------------------- |
| `NEVER`  | Zone never resets                |
| `EMPTY`  | Reset only when empty of players |
| `NORMAL` | Regular timed resets             |

### Hemisphere

Weather system regions affecting climate patterns.

| Value       | Description                   |
| ----------- | ----------------------------- |
| `NORTHWEST` | Northwestern weather patterns |
| `NORTHEAST` | Northeastern weather patterns |
| `SOUTHWEST` | Southwestern weather patterns |
| `SOUTHEAST` | Southeastern weather patterns |

### Climate

Environmental climate types.

| Value         | Description                     |
| ------------- | ------------------------------- |
| `NONE`        | No specific climate             |
| `SEMIARID`    | Semi-arid regions               |
| `ARID`        | Desert and dry regions          |
| `OCEANIC`     | Ocean-influenced climate        |
| `TEMPERATE`   | Moderate seasonal climate       |
| `SUBTROPICAL` | Warm humid climate              |
| `TROPICAL`    | Hot humid climate               |
| `SUBARCTIC`   | Cold climate with short summers |
| `ARCTIC`      | Extremely cold climate          |
| `ALPINE`      | High altitude climate           |

### Sector

Room terrain and environment types.

| Value           | Description                     |
| --------------- | ------------------------------- |
| `STRUCTURE`     | Buildings and constructed areas |
| `CITY`          | Urban environments              |
| `FIELD`         | Open grasslands and fields      |
| `FOREST`        | Wooded areas                    |
| `HILLS`         | Rolling hills and highlands     |
| `MOUNTAIN`      | Mountainous terrain             |
| `SHALLOWS`      | Shallow water                   |
| `WATER`         | Deep water                      |
| `UNDERWATER`    | Submerged areas                 |
| `AIR`           | Flying/aerial locations         |
| `ROAD`          | Traveled paths and roads        |
| `GRASSLANDS`    | Prairie and savanna             |
| `CAVE`          | Underground caverns             |
| `RUINS`         | Ancient or destroyed structures |
| `SWAMP`         | Wetlands and marshes            |
| `BEACH`         | Coastal areas                   |
| `UNDERDARK`     | Deep underground realms         |
| `ASTRALPLANE`   | Astral plane of existence       |
| `AIRPLANE`      | Elemental plane of air          |
| `FIREPLANE`     | Elemental plane of fire         |
| `EARTHPLANE`    | Elemental plane of earth        |
| `ETHEREALPLANE` | Ethereal plane                  |
| `AVERNUS`       | Infernal realms                 |

### Direction

Standard compass directions for room exits.

| Value   | Description        |
| ------- | ------------------ |
| `NORTH` | North direction    |
| `EAST`  | East direction     |
| `SOUTH` | South direction    |
| `WEST`  | West direction     |
| `UP`    | Upward direction   |
| `DOWN`  | Downward direction |

---

## Character Attribute Enums

### Gender

Character gender options.

| Value        | Description       |
| ------------ | ----------------- |
| `NEUTRAL`    | Gender neutral    |
| `MALE`       | Male gender       |
| `FEMALE`     | Female gender     |
| `NON_BINARY` | Non-binary gender |

### Race

Character and mob races.

| Value                  | Description             |
| ---------------------- | ----------------------- |
| `HUMAN`                | Human race              |
| `ELF`                  | Elven race              |
| `GNOME`                | Gnome race              |
| `DWARF`                | Dwarven race            |
| `TROLL`                | Troll race              |
| `DROW`                 | Dark elf race           |
| `DUERGAR`              | Gray dwarf race         |
| `OGRE`                 | Ogre race               |
| `ORC`                  | Orc race                |
| `HALF_ELF`             | Half-elf race           |
| `BARBARIAN`            | Barbarian human variant |
| `HALFLING`             | Halfling race           |
| `PLANT`                | Plant-based creatures   |
| `HUMANOID`             | Generic humanoid        |
| `ANIMAL`               | Animal creatures        |
| `DRAGON_GENERAL`       | General dragon type     |
| `GIANT`                | Giant humanoids         |
| `OTHER`                | Other/unknown race      |
| `GOBLIN`               | Goblin race             |
| `DEMON`                | Demonic beings          |
| `BROWNIE`              | Brownie fey             |
| `DRAGON_FIRE`          | Fire dragon             |
| `DRAGON_FROST`         | Frost dragon            |
| `DRAGON_ACID`          | Acid dragon             |
| `DRAGON_LIGHTNING`     | Lightning dragon        |
| `DRAGON_GAS`           | Gas dragon              |
| `DRAGONBORN_FIRE`      | Fire dragonborn         |
| `DRAGONBORN_FROST`     | Frost dragonborn        |
| `DRAGONBORN_ACID`      | Acid dragonborn         |
| `DRAGONBORN_LIGHTNING` | Lightning dragonborn    |
| `DRAGONBORN_GAS`       | Gas dragonborn          |
| `SVERFNEBLIN`          | Deep gnome              |
| `FAERIE_SEELIE`        | Seelie court fey        |
| `FAERIE_UNSEELIE`      | Unseelie court fey      |
| `NYMPH`                | Nature spirit           |
| `ARBOREAN`             | Tree-like beings        |

### Position

Physical position and posture.

| Value      | Description      |
| ---------- | ---------------- |
| `PRONE`    | Lying down       |
| `SITTING`  | Seated position  |
| `KNEELING` | On knees         |
| `STANDING` | Standing upright |
| `FLYING`   | Airborne/flying  |

### Size

Physical size categories.

| Value         | Description          |
| ------------- | -------------------- |
| `TINY`        | Very small creatures |
| `SMALL`       | Small creatures      |
| `MEDIUM`      | Human-sized          |
| `LARGE`       | Large creatures      |
| `HUGE`        | Very large creatures |
| `GIANT`       | Giant-sized          |
| `GARGANTUAN`  | Enormous             |
| `COLOSSAL`    | Massive              |
| `TITANIC`     | Extremely large      |
| `MOUNTAINOUS` | Mountain-sized       |

---

## Entity Nature Enums

### LifeForce

The fundamental nature of a being's existence.

| Value       | Description        |
| ----------- | ------------------ |
| `LIFE`      | Living creature    |
| `UNDEAD`    | Undead being       |
| `MAGIC`     | Magical construct  |
| `CELESTIAL` | Heavenly being     |
| `DEMONIC`   | Infernal being     |
| `ELEMENTAL` | Elemental creature |

### Composition

Physical makeup of creatures.

| Value   | Description        |
| ------- | ------------------ |
| `FLESH` | Flesh and blood    |
| `EARTH` | Earth-based        |
| `AIR`   | Air-based          |
| `FIRE`  | Fire-based         |
| `WATER` | Water-based        |
| `ICE`   | Ice-based          |
| `MIST`  | Mist/vapor form    |
| `ETHER` | Ethereal substance |
| `METAL` | Metal composition  |
| `STONE` | Stone/rock         |
| `BONE`  | Bone structure     |
| `LAVA`  | Molten rock        |
| `PLANT` | Plant matter       |

### Stance

Combat readiness and alertness level.

| Value           | Description      |
| --------------- | ---------------- |
| `DEAD`          | Dead             |
| `MORT`          | Mortally wounded |
| `INCAPACITATED` | Unconscious      |
| `STUNNED`       | Stunned          |
| `SLEEPING`      | Asleep           |
| `RESTING`       | Resting          |
| `ALERT`         | Alert and ready  |
| `FIGHTING`      | In combat        |

### DamageType

Types of physical attacks.

| Value      | Description            |
| ---------- | ---------------------- |
| `HIT`      | Basic physical hit     |
| `STING`    | Stinging attack        |
| `WHIP`     | Whipping motion        |
| `SLASH`    | Slashing cut           |
| `BITE`     | Biting attack          |
| `BLUDGEON` | Bludgeoning blow       |
| `CRUSH`    | Crushing force         |
| `POUND`    | Pounding strike        |
| `CLAW`     | Claw attack            |
| `MAUL`     | Mauling attack         |
| `THRASH`   | Thrashing motion       |
| `PIERCE`   | Piercing attack        |
| `BLAST`    | Explosive force        |
| `PUNCH`    | Punching strike        |
| `STAB`     | Stabbing thrust        |
| `FIRE`     | Fire damage            |
| `COLD`     | Cold damage            |
| `ACID`     | Acid damage            |
| `SHOCK`    | Electrical damage      |
| `POISON`   | Poison damage          |
| `ALIGN`    | Alignment-based damage |

---

## Behavior Flag Enums

### MobFlag

NPC behavior and characteristics.

| Value           | Description             |
| --------------- | ----------------------- |
| `SPEC`          | Has special procedure   |
| `SENTINEL`      | Doesn't move from room  |
| `SCAVENGER`     | Picks up items          |
| `ISNPC`         | Is an NPC               |
| `AWARE`         | Sees invisible players  |
| `AGGRESSIVE`    | Attacks players         |
| `STAY_ZONE`     | Won't leave zone        |
| `WIMPY`         | Flees when damaged      |
| `AGGRO_EVIL`    | Attacks evil players    |
| `AGGRO_GOOD`    | Attacks good players    |
| `AGGRO_NEUTRAL` | Attacks neutral players |
| `MEMORY`        | Remembers attackers     |
| `HELPER`        | Helps other mobs        |
| `NO_CHARM`      | Cannot be charmed       |
| `NO_SUMMOM`     | Cannot be summoned      |
| `NO_SLEEP`      | Cannot be slept         |
| `NO_BASH`       | Cannot be bashed        |
| `NO_BLIND`      | Cannot be blinded       |
| `MOUNT`         | Can be mounted          |
| `STAY_SECT`     | Stays in sector type    |
| `HATES_SUN`     | Avoids sunlight         |
| `NO_KILL`       | Cannot be killed        |
| `TRACK`         | Can track players       |
| `ILLUSION`      | Is an illusion          |
| `POISON_BITE`   | Bite is poisonous       |
| `THIEF`         | Thief class             |
| `WARRIOR`       | Warrior class           |
| `SORCERER`      | Sorcerer class          |
| `CLERIC`        | Cleric class            |
| `PALADIN`       | Paladin class           |
| `ANTI_PALADIN`  | Anti-paladin class      |
| `RANGER`        | Ranger class            |
| `DRUID`         | Druid class             |
| `SHAMAN`        | Shaman class            |
| `ASSASSIN`      | Assassin class          |
| `MERCENARY`     | Mercenary class         |
| `NECROMANCER`   | Necromancer class       |
| `CONJURER`      | Conjurer class          |
| `MONK`          | Monk class              |
| `BERSERKER`     | Berserker class         |
| `DIABOLIST`     | Diabolist class         |
| `HASTE`         | Hasted                  |
| `BLUR`          | Blurred                 |

### RoomFlag

Room properties and restrictions.

| Value          | Description            |
| -------------- | ---------------------- |
| `DARK`         | Always dark            |
| `DEATH`        | Death room             |
| `NOMOB`        | Mobs can't enter       |
| `INDOORS`      | Indoor location        |
| `PEACEFUL`     | No fighting allowed    |
| `SOUNDPROOF`   | No sound travels       |
| `NOTRACK`      | Cannot be tracked to   |
| `NOMAGIC`      | Magic doesn't work     |
| `TUNNEL`       | Only one person fits   |
| `PRIVATE`      | Private room           |
| `GODROOM`      | God-only access        |
| `HOUSE`        | Player house           |
| `HOUSECRASH`   | House crash protection |
| `ATRIUM`       | House atrium           |
| `OLC`          | Online creation room   |
| `BFS_MARK`     | Pathfinding marker     |
| `WORLDMAP`     | World map location     |
| `FERRY_DEST`   | Ferry destination      |
| `ISOLATED`     | Isolated room          |
| `ARENA`        | Arena combat room      |
| `LARGE`        | Large room             |
| `MEDIUM_LARGE` | Medium-large room      |
| `MEDIUM`       | Medium room            |
| `MEDIUM_SMALL` | Medium-small room      |
| `SMALL`        | Small room             |
| `VERY_SMALL`   | Very small room        |
| `ONE_PERSON`   | Single occupancy       |
| `EFFECTS_NEXT` | Special effects        |

### TriggerFlag

Script trigger conditions.

| Value      | Description            |
| ---------- | ---------------------- |
| `Global`   | Global trigger         |
| `Random`   | Random activation      |
| `Command`  | Command trigger        |
| `Speech`   | Speech trigger         |
| `Act`      | Action trigger         |
| `Death`    | Death trigger          |
| `Greet`    | Greeting trigger       |
| `GreetAll` | Greet all trigger      |
| `Entry`    | Entry trigger          |
| `Receive`  | Receive trigger        |
| `Fight`    | Combat trigger         |
| `HitPrcnt` | Hit percentage trigger |
| `Bribe`    | Bribe trigger          |
| `Load`     | Load trigger           |
| `Memory`   | Memory trigger         |
| `Cast`     | Spell cast trigger     |
| `Leave`    | Leave trigger          |
| `Door`     | Door trigger           |
| `Time`     | Time trigger           |
| `Auto`     | Auto trigger           |

---

## Magic & Effects Enums

### EffectFlag

Magical effects and enchantments.

| Value               | Description              |
| ------------------- | ------------------------ |
| `BLIND`             | Blindness                |
| `INVISIBLE`         | Invisibility             |
| `DETECT_ALIGN`      | Detect alignment         |
| `DETECT_INVIS`      | Detect invisibility      |
| `DETECT_MAGIC`      | Detect magic             |
| `SENSE_LIFE`        | Sense life               |
| `WATERWALK`         | Walk on water            |
| `SANCTUARY`         | Sanctuary protection     |
| `GROUP`             | Group member             |
| `CURSE`             | Cursed                   |
| `INFRAVISION`       | Infravision              |
| `POISON`            | Poisoned                 |
| `PROTECT_EVIL`      | Protection from evil     |
| `PROTECT_GOOD`      | Protection from good     |
| `SLEEP`             | Magical sleep            |
| `NO_TRACK`          | Cannot be tracked        |
| `SNEAK`             | Sneaking                 |
| `HIDE`              | Hidden                   |
| `CHARM`             | Charmed                  |
| `FLYING`            | Flying                   |
| `WATERBREATH`       | Breathe underwater       |
| `ANGELIC_AURA`      | Angelic aura             |
| `ETHEREAL`          | Ethereal form            |
| `MAGICONLY`         | Only magical weapons hit |
| `NEXTPARTIAL`       | Next attack partial      |
| `NEXTNOATTACK`      | Next attack misses       |
| `SPELL_TURNING`     | Spell turning            |
| `COMPREHEND_LANG`   | Comprehend languages     |
| `FIRESHIELD`        | Fire shield              |
| `DEATH_FIELD`       | Death field              |
| `MAJOR_PARALYSIS`   | Major paralysis          |
| `MINOR_PARALYSIS`   | Minor paralysis          |
| `DRAGON_RIDE`       | Dragon riding            |
| `COSMIC_TRAVEL`     | Cosmic travel            |
| `MENTAL_BARRIER`    | Mental barrier           |
| `VITALITY`          | Enhanced vitality        |
| `HASTE`             | Hasted                   |
| `SLOW`              | Slowed                   |
| `CONFUSION`         | Confused                 |
| `MIST_WALK`         | Mist walk                |
| `BURNING_HANDS`     | Burning hands            |
| `FAERIE_FIRE`       | Faerie fire              |
| `DARKNESS`          | Darkness                 |
| `INVISIBLE_STALKER` | Invisible stalker        |
| `FEBLEMIND`         | Feeblemind               |
| `FLUORESCENCE`      | Fluorescent              |
| `RESTLESS`          | Restless                 |
| `ASH_EYES`          | Ash eyes                 |
| `DILATE_PUPILS`     | Dilated pupils           |
| `FLAME_SHROUD`      | Flame shroud             |
| `BARKSKIN`          | Barkskin                 |
| `ULTRA_DAMAGE`      | Ultra damage             |
| `SHILLELAGH`        | Shillelagh               |
| `SUN_RAY`           | Sun ray                  |
| `WITHER_LIMB`       | Withered limb            |
| `PETRIFY`           | Petrified                |
| `DISEASE`           | Diseased                 |
| `PLAGUE`            | Plagued                  |
| `SCOURGE`           | Scourge                  |
| `VAMPIRIC_DRAIN`    | Vampiric drain           |
| `MOON_BEAM`         | Moon beam                |
| `TORNADO`           | Tornado                  |
| `EARTHMAW`          | Earth maw                |
| `CYCLONE`           | Cyclone                  |
| `FLOOD`             | Flood                    |
| `METEOR`            | Meteor                   |
| `FIRESTORM`         | Firestorm                |
| `SILENCE`           | Silenced                 |
| `CALM`              | Calmed                   |
| `ENTANGLE`          | Entangled                |
| `ANIMAL_KIN`        | Animal kinship           |

---

## Item System Enums

### ObjectType

Item categories with type-specific properties.

| Value            | Description        |
| ---------------- | ------------------ |
| `NOTHING`        | No specific type   |
| `LIGHT`          | Light source       |
| `SCROLL`         | Magical scroll     |
| `WAND`           | Magic wand         |
| `STAFF`          | Magic staff        |
| `WEAPON`         | Weapon             |
| `FIREWEAPON`     | Fire weapon        |
| `MISSILE`        | Projectile weapon  |
| `TREASURE`       | Valuable treasure  |
| `ARMOR`          | Armor              |
| `POTION`         | Magic potion       |
| `WORN`           | Wearable item      |
| `OTHER`          | Other item         |
| `TRASH`          | Trash item         |
| `TRAP`           | Trap               |
| `CONTAINER`      | Container          |
| `NOTE`           | Written note       |
| `DRINKCONTAINER` | Drink container    |
| `KEY`            | Key                |
| `FOOD`           | Food               |
| `MONEY`          | Currency           |
| `PEN`            | Writing instrument |
| `BOAT`           | Boat               |
| `FOUNTAIN`       | Fountain           |
| `PORTAL`         | Portal             |
| `ROPE`           | Rope               |
| `SPELLBOOK`      | Spell book         |
| `WALL`           | Wall               |
| `TOUCHSTONE`     | Touchstone         |
| `BOARD`          | Message board      |
| `INSTRUMENT`     | Musical instrument |

### ObjectFlag

Item properties and restrictions.

| Value               | Description                      |
| ------------------- | -------------------------------- |
| `GLOW`              | Glows with light                 |
| `HUM`               | Hums with magic                  |
| `NO_RENT`           | Cannot be rented                 |
| `ANTI_BERSERKER`    | Berserkers cannot use            |
| `NO_INVISIBLE`      | Visible to invisibility          |
| `INVISIBLE`         | Invisible item                   |
| `MAGIC`             | Magical item                     |
| `NO_DROP`           | Cannot be dropped                |
| `PERMANENT`         | Permanent item                   |
| `ANTI_GOOD`         | Good characters cannot use       |
| `ANTI_EVIL`         | Evil characters cannot use       |
| `ANTI_NEUTRAL`      | Neutral characters cannot use    |
| `ANTI_SORCERER`     | Sorcerers cannot use             |
| `ANTI_CLERIC`       | Clerics cannot use               |
| `ANTI_ROGUE`        | Rogues cannot use                |
| `ANTI_WARRIOR`      | Warriors cannot use              |
| `NO_SELL`           | Cannot be sold                   |
| `ANTI_PALADIN`      | Paladins cannot use              |
| `ANTI_ANTI_PALADIN` | Anti-paladins cannot use         |
| `ANTI_RANGER`       | Rangers cannot use               |
| `ANTI_DRUID`        | Druids cannot use                |
| `ANTI_SHAMAN`       | Shamans cannot use               |
| `ANTI_ASSASSIN`     | Assassins cannot use             |
| `ANTI_MERCENARY`    | Mercenaries cannot use           |
| `ANTI_NECROMANCER`  | Necromancers cannot use          |
| `ANTI_CONJURER`     | Conjurers cannot use             |
| `NO_BURN`           | Cannot burn                      |
| `NO_LOCATE`         | Cannot be located                |
| `DECOMPOSING`       | Decomposing                      |
| `FLOAT`             | Floats on water                  |
| `NO_FALL`           | Cannot fall                      |
| `WAS_DISARMED`      | Was disarmed                     |
| `ANTI_MONK`         | Monks cannot use                 |
| `ANTI_BARD`         | Bards cannot use                 |
| `ELVEN`             | Elven crafted                    |
| `DWARVEN`           | Dwarven crafted                  |
| `ANTI_THIEF`        | Thieves cannot use               |
| `ANTI_PYROMANCER`   | Pyromancers cannot use           |
| `ANTI_CRYOMANCER`   | Cryomancers cannot use           |
| `ANTI_ILLUSIONIST`  | Illusionists cannot use          |
| `ANTI_PRIEST`       | Priests cannot use               |
| `ANTI_DIABOLIST`    | Diabolists cannot use            |
| `ANTI_TINY`         | Tiny creatures cannot use        |
| `ANTI_SMALL`        | Small creatures cannot use       |
| `ANTI_MEDIUM`       | Medium creatures cannot use      |
| `ANTI_LARGE`        | Large creatures cannot use       |
| `ANTI_HUGE`         | Huge creatures cannot use        |
| `ANTI_GIANT`        | Giant creatures cannot use       |
| `ANTI_GARGANTUAN`   | Gargantuan creatures cannot use  |
| `ANTI_COLOSSAL`     | Colossal creatures cannot use    |
| `ANTI_TITANIC`      | Titanic creatures cannot use     |
| `ANTI_MOUNTAINOUS`  | Mountainous creatures cannot use |
| `ANTI_ARBOREAN`     | Arboreans cannot use             |

### WearFlag

Equipment slots and usage permissions.

| Value            | Description          |
| ---------------- | -------------------- |
| `TAKE`           | Can be picked up     |
| `FINGER`         | Worn on finger       |
| `NECK`           | Worn around neck     |
| `BODY`           | Worn on body         |
| `HEAD`           | Worn on head         |
| `LEGS`           | Worn on legs         |
| `FEET`           | Worn on feet         |
| `HANDS`          | Worn on hands        |
| `ARMS`           | Worn on arms         |
| `SHIELD`         | Used as shield       |
| `ABOUT`          | Worn about body      |
| `WAIST`          | Worn around waist    |
| `WRIST`          | Worn on wrist        |
| `WIELD`          | Can be wielded       |
| `HOLD`           | Can be held          |
| `TWO_HAND_WIELD` | Requires two hands   |
| `EYES`           | Worn over eyes       |
| `FACE`           | Worn on face         |
| `EAR`            | Worn on ear          |
| `BADGE`          | Worn as badge        |
| `BELT`           | Worn as belt         |
| `HOVER`          | Hovers around wearer |

---

## Commerce Enums

### ShopFlag

Shop behavior modifiers.

| Value        | Description           |
| ------------ | --------------------- |
| `WILL_FIGHT` | Shopkeeper will fight |
| `USES_BANK`  | Uses banking system   |

### ShopTradesWith

Trading restriction types.

| Value       | Description               |
| ----------- | ------------------------- |
| `ALIGNMENT` | Trades based on alignment |
| `RACE`      | Trades based on race      |
| `CLASS`     | Trades based on class     |

---

## Script System Enums

### ScriptType

Script attachment targets.

| Value    | Description        |
| -------- | ------------------ |
| `MOB`    | Attached to mob    |
| `OBJECT` | Attached to object |
| `WORLD`  | World-level script |

---

## Magic & Spell System Enums

### TargetScope

Spell targeting scope patterns.

| Value    | Description           |
| -------- | --------------------- |
| `SINGLE` | Single target         |
| `ROOM`   | All targets in room   |
| `GROUP`  | All group members     |
| `AREA`   | Area effect           |
| `CHAIN`  | Chain lightning style |
| `CONE`   | Cone-shaped area      |
| `LINE`   | Line-shaped area      |

### SpellRange

Spell casting range.

| Value           | Description       |
| --------------- | ----------------- |
| `SELF`          | Caster only       |
| `TOUCH`         | Touch range       |
| `ROOM`          | Same room         |
| `ADJACENT_ROOM` | Adjacent rooms    |
| `WORLD`         | Anywhere in world |

### SaveType

Saving throw types.

| Value       | Description         |
| ----------- | ------------------- |
| `SPELL`     | Spell resistance    |
| `POISON`    | Poison resistance   |
| `BREATH`    | Breath weapon       |
| `PARALYSIS` | Paralysis effects   |
| `WAND`      | Wand/device effects |

### SaveResult

Saving throw results.

| Value      | Description              |
| ---------- | ------------------------ |
| `NONE`     | No effect on save        |
| `HALF`     | Half damage/effect       |
| `NEGATE`   | Completely negated       |
| `REDUCE25` | 25% damage/effect        |
| `CUSTOM`   | Custom handling required |

### EffectType

Consolidated spell effect types (18 effects). Params vary by type.

| Value       | Description                                              |
| ----------- | -------------------------------------------------------- |
| `damage`    | Causes damage (instant, DoT, chain, or lifesteal)        |
| `heal`      | Restores resources (hp, mana, move)                      |
| `modify`    | Modifies any numeric value (stats, saves, size, etc.)    |
| `status`    | Applies status flags (simple, CC, stealth, detect, etc.) |
| `cleanse`   | Removes conditions (poison, curse, etc.)                 |
| `dispel`    | Removes magical effects                                  |
| `reveal`    | One-time show hidden targets                             |
| `teleport`  | Move characters (self, target, group)                    |
| `extract`   | Remove mob/object from game (banishment)                 |
| `move`      | Forced movement (knockback, pull, swap)                  |
| `interrupt` | Stop casting/channeling                                  |
| `transform` | Shapechange (references form templates)                  |
| `resurrect` | Bring back dead players                                  |
| `create`    | Create objects (food, water, items)                      |
| `summon`    | Summon creatures                                         |
| `enchant`   | Apply effects to objects (duration/charges)              |
| `globe`     | Spell immunity by circle                                 |
| `room`      | Room-wide effects and barriers                           |

### EffectTrigger

When spell effects trigger.

| Value     | Description                |
| --------- | -------------------------- |
| `ON_CAST` | When spell is cast         |
| `ON_HIT`  | When attack hits           |
| `ON_KILL` | When target dies           |
| `ON_SAVE` | When saving throw succeeds |
| `ON_FAIL` | When saving throw fails    |

### StackingRule

How multiple spell effects stack.

| Value      | Description               |
| ---------- | ------------------------- |
| `REFRESH`  | Refresh duration          |
| `STACK`    | Stack effects             |
| `IGNORE`   | Ignore new applications   |
| `MAX_ONLY` | Use strongest effect only |

---

## Skill System Enums

### SkillType

Skill classification types.

| Value       | Description            |
| ----------- | ---------------------- |
| `WEAPON`    | Weapon skills          |
| `COMBAT`    | Combat abilities       |
| `MAGIC`     | Magical abilities      |
| `STEALTH`   | Stealth and subterfuge |
| `SOCIAL`    | Social interactions    |
| `CRAFTING`  | Item creation          |
| `SURVIVAL`  | Survival skills        |
| `KNOWLEDGE` | Lore and information   |
| `UTILITY`   | General utilities      |

### SkillCategory

Skill availability categories.

| Value        | Description              |
| ------------ | ------------------------ |
| `PRIMARY`    | Primary class skills     |
| `SECONDARY`  | Secondary skills         |
| `RESTRICTED` | Restricted access skills |
| `FORBIDDEN`  | Forbidden to class/race  |

---

## Character System Enums

### Gender

Character gender options.

| Value        | Description     |
| ------------ | --------------- |
| `NEUTRAL`    | Neutral/it      |
| `MALE`       | Male/he         |
| `FEMALE`     | Female/she      |
| `NON_BINARY` | Non-binary/they |

### Position

Character positioning states.

| Value      | Description       |
| ---------- | ----------------- |
| `PRONE`    | Lying down        |
| `SITTING`  | Sitting position  |
| `KNEELING` | Kneeling position |
| `STANDING` | Standing upright  |
| `FLYING`   | Flying/hovering   |

### LifeForce

Nature of creature's existence.

| Value       | Description       |
| ----------- | ----------------- |
| `LIFE`      | Living creature   |
| `UNDEAD`    | Undead creature   |
| `MAGIC`     | Magical construct |
| `CELESTIAL` | Celestial being   |
| `DEMONIC`   | Demonic entity    |
| `ELEMENTAL` | Elemental being   |

### Composition

Physical makeup of creatures.

| Value   | Description          |
| ------- | -------------------- |
| `FLESH` | Flesh and blood      |
| `EARTH` | Earth elemental      |
| `AIR`   | Air elemental        |
| `FIRE`  | Fire elemental       |
| `WATER` | Water elemental      |
| `ICE`   | Ice composition      |
| `MIST`  | Mist/vapor form      |
| `ETHER` | Ethereal composition |
| `METAL` | Metal construction   |
| `STONE` | Stone construction   |
| `BONE`  | Bone composition     |
| `LAVA`  | Lava elemental       |
| `PLANT` | Plant matter         |

### Stance

Combat readiness and state.

| Value           | Description       |
| --------------- | ----------------- |
| `DEAD`          | Dead              |
| `MORT`          | Mortally wounded  |
| `INCAPACITATED` | Unconscious       |
| `STUNNED`       | Stunned/dazed     |
| `SLEEPING`      | Sleeping          |
| `RESTING`       | Resting           |
| `ALERT`         | Alert and ready   |
| `FIGHTING`      | Actively fighting |

### DamageType

Types of damage attacks can inflict.

| Value      | Description        |
| ---------- | ------------------ |
| `HIT`      | Physical hit       |
| `STING`    | Stinging attack    |
| `WHIP`     | Whipping attack    |
| `SLASH`    | Slashing damage    |
| `BITE`     | Bite attack        |
| `BLUDGEON` | Bludgeoning damage |
| `CRUSH`    | Crushing attack    |
| `POUND`    | Pounding attack    |
| `CLAW`     | Claw attack        |
| `MAUL`     | Mauling attack     |
| `THRASH`   | Thrashing attack   |
| `PIERCE`   | Piercing damage    |
| `BLAST`    | Blast/explosion    |
| `PUNCH`    | Punching attack    |
| `STAB`     | Stabbing attack    |
| `FIRE`     | Fire damage        |
| `COLD`     | Cold damage        |
| `ACID`     | Acid damage        |
| `SHOCK`    | Lightning damage   |
| `POISON`   | Poison damage      |
| `ALIGN`    | Alignment damage   |

### Size

Physical size categories.

| Value         | Description      |
| ------------- | ---------------- |
| `TINY`        | Tiny size        |
| `SMALL`       | Small size       |
| `MEDIUM`      | Medium size      |
| `LARGE`       | Large size       |
| `HUGE`        | Huge size        |
| `GIANT`       | Giant size       |
| `GARGANTUAN`  | Gargantuan size  |
| `COLOSSAL`    | Colossal size    |
| `TITANIC`     | Titanic size     |
| `MOUNTAINOUS` | Mountainous size |

---

## Usage Notes

### Type Safety

All enums provide compile-time type checking and IDE autocomplete support.

### Database Constraints

Enum values are enforced at the database level, preventing invalid data.

### Import Compatibility

The world data import system handles legacy string values and maps them to appropriate enum values.

### Extensibility

New enum values can be added without breaking existing data, but require database migration.

For implementation details, see [schema.md](./schema.md).
For import processes, see [world-import.md](./world-import.md).
