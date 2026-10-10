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
  | 'flags';

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
      label: 'Container Key ID',
      kind: 'int',
      fallback: -1,
      help: '-1 = no key',
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
  SCROLL: SPELL_LIST,
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
 * game's keys. The same mapping is applied to stored data by
 * fierylib/data/sql/2026-10-10-object-values-camelcase-cleanup.sql.
 */
const LEGACY_ALIASES: Array<{
  alias: string;
  key: string;
  convert?: (v: unknown) => unknown;
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
    key: 'Spells',
    convert: v =>
      typeof v === 'string' && v.trim() ? [v.trim().toUpperCase()] : undefined,
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
export function normalizeObjectValues(values: unknown): Values {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return {};
  const out: Values = { ...(values as Values) };
  for (const { alias, key, convert } of LEGACY_ALIASES) {
    if (!(alias in out)) continue;
    const raw = out[alias];
    delete out[alias];
    if (key in out) continue;
    const converted = convert ? convert(raw) : raw;
    if (converted !== undefined && converted !== null) out[key] = converted;
  }
  return out;
}

export function getTypeValue<T>(values: Values, field: ValueField): T {
  const raw = values?.[field.key];
  return (raw ?? field.fallback) as T;
}
