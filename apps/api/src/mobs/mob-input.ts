import { BadRequestException } from '@nestjs/common';

export interface ParsedDice {
  num: number;
  size: number;
  bonus: number;
}

/** Parse a dice string such as "2d8+3" into its numeric parts. */
export function parseDice(diceStr: string): ParsedDice | null {
  const match = /^\s*(\d+)d(\d+)([+-]\d+)?\s*$/.exec(diceStr);
  if (!match) return null;
  return {
    num: parseInt(match[1]!, 10),
    size: parseInt(match[2]!, 10),
    bonus: match[3] ? parseInt(match[3], 10) : 0,
  };
}

/** Like parseDice, but rejects malformed input instead of ignoring it. */
export function parseDiceOrThrow(field: string, diceStr: string): ParsedDice {
  const parsed = parseDice(diceStr);
  if (!parsed) {
    throw new BadRequestException(
      `${field} must look like "2d8+3" (got "${diceStr}")`
    );
  }
  return parsed;
}

/**
 * The editor's five fixed resistance inputs. They are not columns: they live
 * in the Mobs.resistances JSON under the upper-case damage-type key.
 */
const RESISTANCE_FIELDS = [
  ['resistanceFire', 'FIRE'],
  ['resistanceCold', 'COLD'],
  ['resistanceLightning', 'LIGHTNING'],
  ['resistanceAcid', 'ACID'],
  ['resistancePoison', 'POISON'],
] as const;

export type ResistanceInput = Partial<
  Record<(typeof RESISTANCE_FIELDS)[number][0], number | null | undefined>
>;

/**
 * Fold the five editor resistance fields into the stored resistances JSON.
 * Keys the editor does not render (charm, sleep, ...) are preserved.
 *
 * In the stored scale 0 means normal damage (100 is immune, negative is
 * vulnerable) and an absent key also means normal damage. The editor shows an
 * absent key as 0, so a 0 for a key that is not stored is treated as
 * "untouched" instead of writing a redundant entry.
 *
 * Returns undefined when nothing needs to be written.
 */
export function mergeResistances(
  stored: unknown,
  input: ResistanceInput
): Record<string, number> | undefined {
  const touched = RESISTANCE_FIELDS.some(([f]) => input[f] != null);
  if (!touched) return undefined;

  const merged: Record<string, number> =
    stored && typeof stored === 'object' && !Array.isArray(stored)
      ? { ...(stored as Record<string, number>) }
      : {};
  for (const [field, key] of RESISTANCE_FIELDS) {
    const value = input[field];
    if (value == null) continue;
    if (value === 0 && !(key in merged)) continue;
    merged[key] = value;
  }
  return merged;
}
