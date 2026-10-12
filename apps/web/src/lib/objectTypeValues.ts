// Type-specific `Objects.values` JSON: the keys the game loader and the fierylib
// importer use (see fierymud-rs mud-world loader.rs parse_liquid /
// parse_light_fuel / parse_weight_reduction and fierylib's object importer).
// The editor must read and write exactly these keys; any other key already in
// the JSON is left untouched.

export type ValueFieldKind =
  | 'int'
  | 'number'
  | 'bool'
  | 'text'
  | 'list'
  | 'select'
  | 'flags'
  | 'objectRef'
  | 'recallRooms';

export interface ValueField {
  /** Exact JSON key used by the game */
  key: string;
  label: string;
  kind: ValueFieldKind;
  /** Shown when the key is absent (never written until the builder edits it) */
  fallback: unknown;
  options?: readonly string[];
  min?: number;
  max?: number;
  help?: string;
}

export const LIQUIDS = [
  'WATER',
  'ALE',
  'BEER',
  'WINE',
  'WHISKY',
  'MILK',
  'TEA',
  'COFFEE',
  'BLOOD',
  'SALTWATER',
  'ABSINTHE',
  'APPLEJUICE',
  'BRANDY',
  'CAPPUCCINO',
  'CHAI',
  'CHAMOMILE',
  'CHAMPAGNE',
  'CIDER',
  'COCOA',
  'DARKALE',
  'ESPRESSO',
  'FIREBRT',
  'GIN',
  'GREENTEA',
  'LEMONADE',
  'LOCALSPC',
  'MEAD',
  'NECTAR',
  'PNAPLJUICE',
  'ROSEWATER',
  'RUM',
  'SAKE',
  'SLIME',
  'TEQUILA',
  'VODKA',
] as const;

/** Damage types a weapon hit can deal (Prisma DamageType enum). */
export const DAMAGE_TYPES = [
  'HIT',
  'STING',
  'WHIP',
  'SLASH',
  'BITE',
  'BLUDGEON',
  'CRUSH',
  'POUND',
  'CLAW',
  'MAUL',
  'THRASH',
  'PIERCE',
  'BLAST',
  'PUNCH',
  'STAB',
  'FIRE',
  'COLD',
  'ACID',
  'SHOCK',
  'POISON',
  'ALIGN',
  'MENTAL',
  'ROT',
  'ENERGY',
  'WATER',
] as const;

/**
 * Typed `Objects` columns the game reads for combat (not part of `values`):
 * weapon damage is `weaponDiceNum`d`weaponDiceSize` + `weaponDiceBonus` of
 * `weaponDamageType`; armor is `armorPct`.
 */
export interface CombatColumns {
  weaponDiceNum: number;
  weaponDiceSize: number;
  weaponDiceBonus: number;
  /** '' = none */
  weaponDamageType: string;
  armorPct: number;
}

export const EMPTY_COMBAT_COLUMNS: CombatColumns = {
  weaponDiceNum: 0,
  weaponDiceSize: 0,
  weaponDiceBonus: 0,
  weaponDamageType: '',
  armorPct: 0,
};

/** Object types whose editor shows the weapon dice / damage type columns. */
export const WEAPON_TYPES: readonly string[] = ['WEAPON'];
/** Object types whose editor shows the armor value column. */
export const ARMOR_TYPES: readonly string[] = ['ARMOR'];

/**
 * Recall scroll destinations, `Objects.values["Recall Rooms"]` (loader.rs
 * parse_recall_rooms): a default room plus optional per-class rooms keyed by
 * class name (matched case-insensitively by the game).
 */
export interface RecallRooms {
  default?: ObjectRef;
  classes?: Record<string, ObjectRef>;
}

export const CONTAINER_FLAGS = [
  'Closeable',
  'PickProof',
  'Closed',
  'Locked',
] as const;

const SPELL_CHARGES: ValueField[] = [
  { key: 'Level', label: 'Spell Level', kind: 'int', fallback: 1, min: 1 },
  {
    key: 'Spell',
    label: 'Spell',
    kind: 'text',
    fallback: '',
    help: 'Spell name, e.g. BLESS',
  },
  {
    key: 'Max_Charges',
    label: 'Max Charges',
    kind: 'int',
    fallback: 1,
    min: 0,
  },
  {
    key: 'Charges_Left',
    label: 'Charges Left',
    kind: 'int',
    fallback: 1,
    min: 0,
  },
];

const SPELL_LIST: ValueField[] = [
  { key: 'Level', label: 'Spell Level', kind: 'int', fallback: 1, min: 1 },
  {
    key: 'Spells',
    label: 'Spells',
    kind: 'list',
    fallback: [],
    help: 'Comma-separated spell names, e.g. BLESS, ARMOR',
  },
];

const LIQUID_FIELDS: ValueField[] = [
  {
    key: 'Liquid',
    label: 'Liquid',
    kind: 'select',
    fallback: 'WATER',
    options: LIQUIDS,
  },
  { key: 'Capacity', label: 'Capacity', kind: 'int', fallback: 10, min: 0 },
  { key: 'Remaining', label: 'Remaining', kind: 'int', fallback: 10, min: 0 },
  { key: 'Poisoned', label: 'Poisoned?', kind: 'bool', fallback: false },
];

export const TYPE_VALUE_FIELDS: Record<string, ValueField[]> = {
  CONTAINER: [
    {
      key: 'Capacity',
      label: 'Max Weight Capacity',
      kind: 'number',
      fallback: 0,
      min: 0,
    },
    {
      key: 'Key',
      label: 'Container Key',
      kind: 'objectRef',
      fallback: null,
      help: 'zone + id of the key object; leave both empty for no key',
    },
    {
      key: 'Weight Reduction',
      label: 'Weight Reduction (%)',
      kind: 'number',
      fallback: 0,
      min: 0,
      max: 100,
    },
    {
      key: 'Flags',
      label: 'Container Flags',
      kind: 'flags',
      fallback: [],
      options: CONTAINER_FLAGS,
    },
    {
      key: 'IsCorpse',
      label: 'Is a corpse?',
      kind: 'bool',
      fallback: false,
    },
  ],
  WEAPON: [
    {
      key: 'HitRoll',
      label: 'Hit Roll',
      kind: 'int',
      fallback: 0,
      min: -1000,
      max: 1000,
      help: 'bonus to hit; dice and damage type are on the columns above',
    },
  ],
  PORTAL: [
    {
      key: 'Destination',
      label: 'Destination Room',
      kind: 'int',
      fallback: 0,
      min: 0,
      help: 'legacy room number (zone x 100 + room id); 0 = none',
    },
  ],
  BOARD: [
    {
      key: 'Pages',
      label: 'Board ID',
      kind: 'int',
      fallback: 0,
      min: 0,
      help: 'which message board this reads; 0 = none',
    },
  ],
  LIGHT: [
    {
      key: 'Capacity',
      label: 'Light Hours Capacity',
      kind: 'int',
      fallback: 0,
    },
    {
      key: 'Remaining',
      label: 'Light Hours Remaining',
      kind: 'int',
      fallback: 0,
      help: '-1 = permanent light, 0 = spent',
    },
  ],
  FOOD: [
    {
      key: 'Filling',
      label: 'Hours of Nourishment',
      kind: 'int',
      fallback: 4,
      min: 0,
    },
    { key: 'Poisoned', label: 'Poisoned?', kind: 'bool', fallback: false },
  ],
  DRINKCONTAINER: LIQUID_FIELDS,
  FOUNTAIN: LIQUID_FIELDS,
  POTION: SPELL_LIST,
  SCROLL: [
    ...SPELL_LIST,
    {
      key: 'Recall Rooms',
      label: 'Recall Rooms',
      kind: 'recallRooms',
      fallback: null,
      help: 'where a recall scroll takes the reader; per-class overrides optional',
    },
  ],
  WAND: SPELL_CHARGES,
  STAFF: SPELL_CHARGES,
  INSTRUMENT: SPELL_CHARGES,
  MONEY: [
    { key: 'Platinum', label: 'Platinum', kind: 'int', fallback: 0, min: 0 },
    { key: 'Gold', label: 'Gold', kind: 'int', fallback: 0, min: 0 },
    { key: 'Silver', label: 'Silver', kind: 'int', fallback: 0, min: 0 },
    { key: 'Copper', label: 'Copper', kind: 'int', fallback: 0, min: 0 },
  ],
};

type Values = Record<string, unknown>;

/**
 * camelCase keys earlier editor versions wrote next to (or instead of) the
 * game's keys (`type` picks Spell vs Spells for spellName). The same mapping is applied to stored data by
 * fierylib/data/sql/2026-10-10-object-values-camelcase-cleanup.sql.
 */
/** Object types whose single spell lives in `Spell` (the rest use `Spells`). */
const SINGLE_SPELL_TYPES = ['WAND', 'STAFF', 'INSTRUMENT'];

const LEGACY_ALIASES: Array<{
  alias: string;
  /** Game key; may depend on the object type */
  key: string | ((type: string | undefined) => string);
  convert?: (v: unknown, type: string | undefined) => unknown;
}> = [
  { alias: 'capacity', key: 'Capacity' },
  { alias: 'liquidCapacity', key: 'Capacity' },
  { alias: 'keyId', key: 'Key' },
  { alias: 'lightHours', key: 'Remaining' },
  { alias: 'foodHours', key: 'Filling' },
  { alias: 'poisoned', key: 'Poisoned' },
  { alias: 'spellLevel', key: 'Level' },
  {
    alias: 'spellName',
    // WAND/STAFF/INSTRUMENT: "Spell" (string); POTION/SCROLL: "Spells" (array)
    key: type =>
      type && SINGLE_SPELL_TYPES.includes(type) ? 'Spell' : 'Spells',
    convert: (v, type) => {
      if (typeof v !== 'string' || !v.trim()) return undefined;
      const name = v.trim().toUpperCase();
      return type && SINGLE_SPELL_TYPES.includes(type) ? name : [name];
    },
  },
  {
    alias: 'liquidType',
    key: 'Liquid',
    convert: v =>
      typeof v === 'string' && v.trim()
        ? v.replace(/\s+/g, '').toUpperCase()
        : undefined,
  },
  {
    alias: 'containerFlags',
    key: 'Flags',
    convert: v =>
      Array.isArray(v)
        ? v
            .map(f =>
              CONTAINER_FLAGS.find(
                c => c.toUpperCase() === String(f).toUpperCase()
              )
            )
            .filter((f): f is (typeof CONTAINER_FLAGS)[number] => !!f)
        : undefined,
  },
];

/**
 * Fold legacy camelCase keys into the game's keys and drop them, so the editor
 * never persists both spellings. An existing game key always wins. Keys that
 * are not aliases are returned untouched.
 */
export function normalizeObjectValues(values: unknown, type?: string): Values {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return {};
  const out: Values = { ...(values as Values) };
  for (const { alias, key: keyOrFn, convert } of LEGACY_ALIASES) {
    if (!(alias in out)) continue;
    const raw = out[alias];
    delete out[alias];
    const key = typeof keyOrFn === 'function' ? keyOrFn(type) : keyOrFn;
    if (key in out) continue;
    const converted = convert ? convert(raw, type) : raw;
    if (converted !== undefined && converted !== null) out[key] = converted;
  }
  return out;
}

/** A (zoneId, id) reference to another world entity, as stored in `values`. */
export interface ObjectRef {
  zone: number;
  id: number;
}

/** What `Key` holds when the container has no key (the importer leaves keys <= 0 alone). */
export const NO_KEY = -1;

const isWholeNumber = (n: unknown): n is number =>
  typeof n === 'number' && Number.isInteger(n);

/**
 * Read a stored reference for display. Accepts the composite `{zone, id}`
 * form and the legacy vnum integer (`{ legacy }`, never converted: a vnum
 * cannot be mapped to (zone, id) without the zone ranges). Anything else,
 * and integers <= 0, mean "no reference".
 */
export function readObjectRef(
  raw: unknown
): { ref: ObjectRef } | { legacy: number } | null {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const { zone, id } = raw as Record<string, unknown>;
    if (isWholeNumber(zone) && isWholeNumber(id) && zone >= 0 && id >= 0) {
      return { ref: { zone, id } };
    }
    return null;
  }
  if (isWholeNumber(raw) && raw > 0) return { legacy: raw };
  return null;
}

export function getTypeValue<T>(values: Values, field: ValueField): T {
  const raw = values?.[field.key];
  return (raw ?? field.fallback) as T;
}
