import { BadRequestException } from '@nestjs/common';

/**
 * Container keys are stored as the composite id `{"zone": N, "id": M}` (the
 * legacy vnum integer is gone; fierylib converts it on import). Integers <= 0
 * mean "no key" and stay valid. A positive integer is a legacy vnum and is
 * rejected so an old editor or script cannot write it back.
 */
export function assertValidObjectValues(values: unknown): void {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return;
  assertValidTypedValues(values as Record<string, unknown>);
  assertValidKey((values as Record<string, unknown>)['Key']);
}

const CONTAINER_FLAG_NAMES = ['closeable', 'pickproof', 'closed', 'locked'];

/** A JSON number, or a numeric string (the game parses both). */
function asNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(+v.trim())) {
    return +v.trim();
  }
  return null;
}

function isBoolish(v: unknown): boolean {
  return (
    typeof v === 'boolean' ||
    (typeof v === 'string' && ['true', 'false'].includes(v.toLowerCase()))
  );
}

/** [key, minimum, maximum, whole number only] for numeric `values` keys the game reads. */
const NUMERIC_KEYS: ReadonlyArray<[string, number, number, boolean]> = [
  ['Capacity', -1, 2_000_000_000, false], // -1 = permanent light
  ['Remaining', -1, 2_147_483_647, true],
  ['Filling', 0, 1_000_000, true],
  ['Level', 0, 1000, true],
  ['Max_Charges', 0, 10_000, true],
  ['Charges_Left', 0, 10_000, true],
  ['Platinum', 0, 2_000_000_000, true],
  ['Gold', 0, 2_000_000_000, true],
  ['Silver', 0, 2_000_000_000, true],
  ['Copper', 0, 2_000_000_000, true],
  ['Destination', 0, 2_000_000_000, true],
  ['Pages', 0, 2_000_000_000, true],
  ['HitRoll', -1000, 1000, true],
  ['Weight Reduction', 0, 100, false],
];

const BOOL_KEYS = ['Poisoned', 'IsCorpse'];

function bad(message: string): never {
  throw new BadRequestException(message);
}

function assertRoomRef(ref: unknown, where: string): void {
  const r = ref as Record<string, unknown> | null;
  const ok = (n: unknown) =>
    typeof n === 'number' && Number.isInteger(n) && n >= 0;
  if (!r || typeof r !== 'object' || !ok(r['zone']) || !ok(r['id'])) {
    bad(`${where} must be {"zone": N, "id": M} with whole numbers >= 0`);
  }
}

/**
 * Shapes of the type-specific `values` JSON keys the game reads (fierymud-rs
 * mud-world loader.rs / mud-script api_extra.rs). Keys the game does not read
 * are left alone; known keys must have a shape the loader can parse. Numbers
 * and booleans may also be strings because the loader accepts both and older
 * rows hold them that way.
 */
function assertValidTypedValues(values: Record<string, unknown>): void {
  for (const [key, min, max, whole] of NUMERIC_KEYS) {
    const raw = values[key];
    if (raw === undefined || raw === null) continue;
    const n = asNumber(raw);
    if (n === null || n < min || n > max || (whole && !Number.isInteger(n))) {
      bad(
        `values.${key} must be a ${whole ? 'whole ' : ''}number from ${min} to ${max} (got ${JSON.stringify(raw)})`
      );
    }
  }

  for (const key of BOOL_KEYS) {
    const raw = values[key];
    if (raw === undefined || raw === null) continue;
    if (!isBoolish(raw) && asNumber(raw) === null) {
      bad(`values.${key} must be true or false (got ${JSON.stringify(raw)})`);
    }
  }

  const flags = values['Flags'];
  if (flags !== undefined && flags !== null) {
    if (
      !Array.isArray(flags) ||
      !flags.every(
        f =>
          typeof f === 'string' &&
          CONTAINER_FLAG_NAMES.includes(f.trim().toLowerCase())
      )
    ) {
      bad(
        'values.Flags must be a list of Closeable, PickProof, Closed, Locked'
      );
    }
  }

  const liquid = values['Liquid'];
  if (liquid !== undefined && liquid !== null) {
    if (typeof liquid !== 'string' || !liquid.trim()) {
      bad('values.Liquid must be a liquid name such as "WATER"');
    }
  }

  const spell = values['Spell'];
  // Old rows hold a number here (0 = no spell), so numbers stay legal
  if (
    spell !== undefined &&
    spell !== null &&
    typeof spell !== 'string' &&
    asNumber(spell) === null
  ) {
    bad('values.Spell must be a spell name');
  }

  const spells = values['Spells'];
  if (spells !== undefined && spells !== null) {
    if (!Array.isArray(spells) || !spells.every(s => typeof s === 'string')) {
      bad('values.Spells must be a list of spell names');
    }
  }

  const recall = values['Recall Rooms'];
  if (recall !== undefined && recall !== null) {
    if (typeof recall !== 'object' || Array.isArray(recall)) {
      bad(
        'values["Recall Rooms"] must be {"default": {...}, "classes": {...}}'
      );
    }
    const {
      default: def,
      classes,
      ...extra
    } = recall as Record<string, unknown>;
    if (Object.keys(extra).length > 0) {
      bad(
        `values["Recall Rooms"] only takes "default" and "classes" (got ${Object.keys(extra).join(', ')})`
      );
    }
    if (def !== undefined && def !== null) {
      assertRoomRef(def, 'values["Recall Rooms"].default');
    }
    if (classes !== undefined && classes !== null) {
      if (typeof classes !== 'object' || Array.isArray(classes)) {
        bad('values["Recall Rooms"].classes must map class name to a room');
      }
      for (const [cls, ref] of Object.entries(
        classes as Record<string, unknown>
      )) {
        assertRoomRef(ref, `values["Recall Rooms"].classes.${cls}`);
      }
    }
  }
}

/** Typed combat columns: weapon dice and armor value, validated on write. */
export function assertValidCombatColumns(data: {
  weaponDiceNum?: number | null | undefined;
  weaponDiceSize?: number | null | undefined;
  weaponDiceBonus?: number | null | undefined;
  armorPct?: number | null | undefined;
}): void {
  const whole = (v: unknown, name: string, min: number, max: number) => {
    if (v === undefined || v === null) return;
    if (!Number.isInteger(v) || (v as number) < min || (v as number) > max) {
      bad(`${name} must be a whole number from ${min} to ${max}`);
    }
  };
  whole(data.weaponDiceNum, 'weaponDiceNum', 0, 1000);
  whole(data.weaponDiceSize, 'weaponDiceSize', 0, 1000);
  whole(data.weaponDiceBonus, 'weaponDiceBonus', -10_000, 10_000);
  whole(data.armorPct, 'armorPct', -1000, 1000); // negative = cursed armor
  if (
    (data.weaponDiceNum ?? 0) > 0 &&
    data.weaponDiceSize !== undefined &&
    data.weaponDiceSize !== null &&
    data.weaponDiceSize < 1
  ) {
    bad('weaponDiceSize must be at least 1 when weaponDiceNum is above 0');
  }
}

function assertValidKey(key: unknown): void {
  if (key === undefined || key === null) return;

  if (typeof key === 'number') {
    if (Number.isInteger(key) && key <= 0) return;
    throw new BadRequestException(
      `values.Key must be a composite {"zone": N, "id": M}, not the legacy vnum ${key}`
    );
  }

  if (typeof key === 'object' && !Array.isArray(key)) {
    const { zone, id, ...extra } = key as Record<string, unknown>;
    const ok = (n: unknown) =>
      typeof n === 'number' && Number.isInteger(n) && n >= 0;
    if (ok(zone) && ok(id) && Object.keys(extra).length === 0) return;
  }

  throw new BadRequestException(
    `values.Key must be a composite {"zone": N, "id": M} with whole numbers >= 0 (got ${JSON.stringify(key)})`
  );
}

/**
 * Ground text for a new object. Builders may leave it blank; fall back to
 * "<name> lies here." so the object is never invisible in a room.
 */
export function defaultRoomDescription(
  roomDescription: string | null | undefined,
  name: string
): string {
  const trimmed = roomDescription?.trim();
  if (trimmed) return roomDescription as string;
  const base = name.trim();
  if (!base) return 'Something lies here.';
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} lies here.`;
}
