/**
 * Spell slots of potions, scrolls, wands and staves live in `ObjectAbilities`
 * (what the game reads). The importer's mirror keys in `Objects.values` are
 * rewritten by the API when the list is saved, so the type-values tab hides
 * them for these types.
 */
export const SPELL_ITEM_TYPES = ['POTION', 'SCROLL', 'WAND', 'STAFF'] as const;
export const CHARGED_ITEM_TYPES = ['WAND', 'STAFF'] as const;
export const MAX_ITEM_SPELLS = 20;

/** `Objects.values` keys the API keeps in sync with the spell list. */
export const SPELL_MIRROR_KEYS: readonly string[] = [
  'Level',
  'Spells',
  'Spell',
  'Max_Charges',
  'Charges_Left',
];

export const isSpellItemType = (type: string | undefined): boolean =>
  !!type && (SPELL_ITEM_TYPES as readonly string[]).includes(type);

export const isChargedItemType = (type: string | undefined): boolean =>
  !!type && (CHARGED_ITEM_TYPES as readonly string[]).includes(type);

/** One editable slot; `key` only identifies the row while editing. */
export interface SpellRow {
  key: string;
  abilityId: number;
  name: string;
  level: number;
  charges: number | null;
}

let rowCounter = 0;
export const newRowKey = (): string => `spell-${++rowCounter}`;

export function rowsFromAbilities(
  abilities: ReadonlyArray<{
    abilityId: number;
    abilityName: string;
    level: number;
    charges?: number | null | undefined;
  }>
): SpellRow[] {
  return abilities.map(a => ({
    key: newRowKey(),
    abilityId: a.abilityId,
    name: a.abilityName,
    level: a.level,
    charges: a.charges ?? null,
  }));
}

/** Rows as the `setObjectAbilities` input (charges only for wands and staves). */
export function abilitiesInput(
  rows: readonly SpellRow[],
  type: string | undefined
): Array<{ abilityId: number; level: number; charges?: number }> {
  const charged = isChargedItemType(type);
  return rows.map(r => ({
    abilityId: r.abilityId,
    level: r.level,
    ...(charged && r.charges !== null && { charges: r.charges }),
  }));
}

export function moveRow<T>(rows: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= rows.length || from === to) return [...rows];
  const next = [...rows];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row as T);
  return next;
}
