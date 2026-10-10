import { keywordsToInput, parseKeywords } from '../lib/keywords';
import {
  normalizeObjectValues,
  TYPE_VALUE_FIELDS,
} from '../lib/objectTypeValues';

describe('parseKeywords', () => {
  it('splits the TagInput string on commas and spaces', () => {
    expect(parseKeywords('sword, iron')).toEqual(['sword', 'iron']);
    expect(parseKeywords('sword iron,long')).toEqual(['sword', 'iron', 'long']);
  });
  it('drops empties and duplicates', () => {
    expect(parseKeywords(' a,, a ,b ')).toEqual(['a', 'b']);
    expect(parseKeywords('')).toEqual([]);
  });
  it('re-splits an array that holds comma-joined elements', () => {
    expect(parseKeywords(['sword, iron', 'long'])).toEqual([
      'sword',
      'iron',
      'long',
    ]);
  });
  it('round-trips the stored array into the TagInput string', () => {
    expect(keywordsToInput(['sword', 'iron'])).toBe('sword, iron');
    expect(keywordsToInput(undefined)).toBe('');
  });
});

describe('normalizeObjectValues', () => {
  it('maps camelCase keys to the game keys and drops them', () => {
    expect(
      normalizeObjectValues({
        capacity: 20,
        keyId: 5,
        lightHours: 100,
        foodHours: 6,
        poisoned: true,
        spellLevel: 12,
      })
    ).toEqual({
      Capacity: 20,
      Key: 5,
      Remaining: 100,
      Filling: 6,
      Poisoned: true,
      Level: 12,
    });
  });

  it('never overrides an existing game key and never keeps both spellings', () => {
    const out = normalizeObjectValues({ Capacity: 50, capacity: 20 });
    expect(out).toEqual({ Capacity: 50 });
  });

  it('converts liquid, flags and spell name to the game shapes', () => {
    expect(
      normalizeObjectValues({
        liquidType: 'salt water',
        containerFlags: ['CLOSEABLE', 'PICKPROOF', 'BOGUS'],
        spellName: 'bless',
      })
    ).toEqual({
      Liquid: 'SALTWATER',
      Flags: ['Closeable', 'PickProof'],
      Spells: ['BLESS'],
    });
  });

  it('preserves keys the form does not render', () => {
    const input = { 'Is_Lit:': false, IsCorpse: false, Extra: [1, 2] };
    expect(normalizeObjectValues(input)).toEqual(input);
  });

  it('is idempotent', () => {
    const once = normalizeObjectValues({ capacity: 3, Remaining: 1 });
    expect(normalizeObjectValues(once)).toEqual(once);
  });

  it('tolerates junk input', () => {
    expect(normalizeObjectValues(null)).toEqual({});
    expect(normalizeObjectValues([1])).toEqual({});
  });
});

describe('TYPE_VALUE_FIELDS', () => {
  const keys = (t: string) => TYPE_VALUE_FIELDS[t]!.map(f => f.key);
  it('uses the exact game keys', () => {
    expect(keys('CONTAINER')).toEqual([
      'Capacity',
      'Key',
      'Weight Reduction',
      'Flags',
    ]);
    expect(keys('LIGHT')).toEqual(['Capacity', 'Remaining']);
    expect(keys('FOOD')).toEqual(['Filling', 'Poisoned']);
    expect(keys('DRINKCONTAINER')).toEqual([
      'Liquid',
      'Capacity',
      'Remaining',
      'Poisoned',
    ]);
    expect(keys('POTION')).toEqual(['Level', 'Spells']);
  });
  it('has no camelCase keys', () => {
    for (const fields of Object.values(TYPE_VALUE_FIELDS)) {
      for (const f of fields) expect(f.key).toMatch(/^[A-Z]/);
    }
  });
});
