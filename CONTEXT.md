# Muditor

TypeScript/Next.js web editor for world building. Owns the shared
Prisma schema at `packages/db/prisma/schema.prisma`. Glossary entries
here define the canonical vocabulary that fierymud-rs, fierylib, and
fierymud all conform to.

## Language

### Effects and their attachments

**Effect**:
A named gameplay primitive stored as a row in the `Effect` table. Each Effect has an `effectType` discriminator (`modify`, `status`, `damage`, `heal`, `room`, etc.) that determines how it's interpreted at runtime. Examples: `INVISIBLE` (status), `DROWNING` (status), the singleton `modify` row that backs all StatModifiers.
_Avoid_: "buff", "debuff", "spell affect", "affect"

**Effect attachment**:
A row in one of the junction tables — `ObjectEffects`, `MobDefaultEffects`, `RaceEffects`, `CharacterEffects`, `RoomEnvironmentalEffect` — binding one **Effect** to one carrier entity (object, mob, race, character, room). Every attachment carries `modifier_data` (JSON) for type-specific parameters: empty for plain status effects, `{target, amount}` for `modify`-type, etc.
_Avoid_: "object effect" / "mob effect" (ambiguous between the Effect and the attachment), "buff slot"

**StatModifier**:
The conceptual subcategory of **Effect attachment** where the linked Effect has `effectType="modify"` and `modifier_data` carries `{target, amount}` — e.g. `armor_pct +5`, `max_stamina +10`, `accuracy -3`. All current `ObjectEffects` rows are StatModifiers (4044/4044); the term is useful for distinguishing flat-stat-bump attachments from behavior-bearing ones in builder language and runtime code.
_Avoid_: "apply" (legacy CircleMUD term), "modifier delta", "stat bonus", "affect", "APPLY\_\*"

### Shop trade gating

**Trade restriction**:
A set of alignment / class / race lists on a `Shops` row that name the actors a shopkeeper refuses to do business with. Three independent lists: `restrictedAlignments`, `restrictedClassIds`, `restrictedRaces`. Empty list = no restriction on that axis.
_Avoid_: "trades-with flags", "SHOP_TRADES_WITH"

### Resting and Repose

**Repose**:
A sticky pool of accumulated bonus-XP credit, stored as `Characters.repose Int`. Spent only on XP gain — while `repose > 0`, XP gained is multiplied (formula owned by fierymud-rs). Filled passively only while the character is logged off and has a non-NONE [[RestSource]]. Never decays, never expires; persists across deaths, logouts, and inactivity. **Never** affects combat power, regen, or any other axis — strictly an XP-rate accelerator. The fill cap and per-hour rate are looked up from `restTier` via a runtime table (not stored as columns).
_Avoid_: "rested XP", "rested buff", "bonus pool", "buff"

**RestSource**:
The kind of rest the character has prepaid for their next sleep, stored as `Characters.restSource` enum: `NONE`, `QUIT`, `CAMP`, `INN`, `HOUSE`. The corresponding `Characters.restTier Int` (0-3) holds the quality level: 0 for NONE/QUIT, 1-3 for the others. Source is set when the player rents a room (`rent <tier name>` on an `isInn` Room), completes a `camp [<kit>]` action, or logs out from a room they own (HOUSE). The source survives logout and survives multiple login sessions; it is **consumed exactly once at the player's next XP gain**: server clears source and tier to (NONE, 0), spawns a [[Refreshed Effect]] on the character, and begins spending [[Repose]] on the triggering XP gain and subsequent gains. Time spent offline never costs the player anything — no nightly billing, no decay.
_Avoid_: "lodging", "rest type", "inn flag", "rented-from", "rental subscription", "rest expiry"

**Refreshed Effect**:
A row in the `Effect` table with `effectType="status"`, attached to characters via `CharacterEffects` at the moment of [[RestSource]] consumption (first XP gain after acquiring a source). Grants a short window of elevated HP and stamina regen with `strength` set from the consumed `restTier`. Spawned for any source EXCEPT `QUIT` / `NONE`. Independent of [[Repose]] — Refreshed gives flat regen, Repose multiplies XP. Both fire on the same wake event.
_Avoid_: "rested buff", "wake buff", "regen buff"

**Wake Effect attachment**:
A row in one of two junction tables — `RoomWakeEffects` (linked to a Room) or `ObjectWakeEffects` (linked to an Object) — that schedules an Effect to attach to a character at the moment of [[RestSource]] consumption. Resolution is source-kind keyed: `INN` source applies `RoomWakeEffects` on the rented room; `CAMP` source applies `ObjectWakeEffects` on the consumed kit; `HOUSE` source applies `ObjectWakeEffects` on the bed Object present in the room. Universal Refreshed always spawns alongside (except for `QUIT`/`NONE`). A Wake Effect attachment carries `effectId`, `modifierData Json`, `duration Int`, and an optional `minTier Int` (room-level only — restricts the attachment to higher tiers).
_Avoid_: "rested buff", "extra buff", "wake buff", "special bed buff"

## Relationships

- Every **Effect attachment** row has a `NOT NULL` `effect_id` pointing at an **Effect**. There are no rows-without-an-Effect.
- The shape of `modifier_data` is determined by the linked Effect's `effectType`:
  - `effectType="modify"` → `modifier_data` MUST carry `{target: string, amount: int}` (this is a **StatModifier**)
  - `effectType="status"` (etc.) → `modifier_data` may be empty or carry effect-specific overrides
- A **StatModifier**'s `target` string must match a known `apply_stat_modifier` arm in fierymud-rs. There is no schema-side guarantee of synchrony — keys are stringly-typed by design (kept flexible for future stats).
- Today each junction table is used narrowly: `ObjectEffects` holds only StatModifiers (no status grants on items yet); `RaceEffects` holds only status-type Effects; `MobDefaultEffects` and `CharacterEffects` are empty in the current dataset. The schema _supports_ any Effect type on any junction; the data is just sparse.

## Example dialogue

> **Dev:** "I want a Ring of Strength that gives +3 strength and makes the wearer invisible."
> **Domain expert:** "That's two **Effect attachments** on the same object — one **StatModifier** (links the `modify` Effect with `modifier_data={target: 'strength', amount: 3}`) and one status attachment (links the `INVISIBLE` Effect with no modifier_data). Same table, different effect linkages."
> **Dev:** "And if I want a 'Drow merchant won't sell to elves' shop?"
> **Domain expert:** "That's a **trade restriction** — `restrictedRaces=[ELF]` on the `Shops` row."

## Flagged ambiguities

- The `ObjectEffects` table name suggests it holds "effects on objects" generically, but today it holds only **StatModifier**s (4044 rows, all linked to the singleton `modify` Effect). Status-type Effects on items (e.g. Ring of Invisibility) are supported by the schema but not yet present in data.
- "Apply" was historically used in CircleMUD for what is now **StatModifier**. Resolved: drop "apply" from new vocabulary; old `APPLY_*` constants in fierylib's `_LEGACY_AFFECT_MAP` are import-time aliases only and don't surface to the runtime.

## Non-concepts

These exist in legacy CircleMUD / D&D vocabulary but **do not exist
in this MUD**. Reject them on sight in code, schema, or builder
authoring.

- **Mana / mana pool / `mp`**: Casting is gated by **spell circles** (`SpellSlotProgression` table + per-character `Cooldowns` JSON). There is no mana resource. Stale references to "mana cost", "mp", or `Mana` component are bugs.
- **THAC0 / AC (lower-is-better) / hit_roll / dam_roll**: Combat uses **accuracy**, **attack_power**, **armor_rating** (modern positive-is-better), and **evasion**. Legacy AD&D combat math is converted at fierylib import time and never reaches the runtime.
- **Legacy saves (`saving_para` / `_rod` / `_petri` / `_breath` / `_spell`)**: Replaced by modern saves — `REFLEX`, `FORTITUDE`, `WILL` (per the `SaveType` enum). Legacy authored content is remapped at import time by fierylib; runtime targets are the three modern axes only.
- **`hiddenness`**: Legacy CircleMUD spelling for stealth. Modern name is **`concealment`** — already a column on `Characters` and `Mobs`. Legacy authored content is remapped at import time.
- **`max_movement` / "move points"**: Legacy CircleMUD name for what's now **`max_stamina`** (Stamina component). One stat, modern naming only.
