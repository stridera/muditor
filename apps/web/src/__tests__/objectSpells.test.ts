import { spellSavePlan, stripSpellMirrorKeys } from '@/lib/objectSpells';

describe('stripSpellMirrorKeys', () => {
  it('removes the keys the spell list owns and keeps the rest', () => {
    const values = {
      Spells: ['A'],
      Spell: 'A',
      Level: 9,
      Max_Charges: 2,
      Charges_Left: 1,
      Capacity: 5,
    };
    expect(stripSpellMirrorKeys(values)).toEqual({ Capacity: 5 });
    expect(values.Level).toBe(9); // input untouched
  });
});

describe('spellSavePlan', () => {
  const base = {
    isNew: false,
    loadedType: 'POTION',
    type: 'POTION',
    dirty: false,
    rowCount: 2,
    loadedRowCount: 2,
  };

  it('does nothing for an untouched spell item', () => {
    expect(spellSavePlan(base)).toBe('none');
  });

  it('writes when the list was edited or a new item has spells', () => {
    expect(spellSavePlan({ ...base, dirty: true })).toBe('write');
    expect(spellSavePlan({ ...base, isNew: true })).toBe('write');
    expect(spellSavePlan({ ...base, isNew: true, rowCount: 0 })).toBe('none');
  });

  it('rewrites when the type moves between spell types', () => {
    expect(spellSavePlan({ ...base, type: 'WAND' })).toBe('write');
  });

  it('clears the rows when the type leaves the spell types', () => {
    expect(spellSavePlan({ ...base, type: 'ARMOR' })).toBe('clear');
    expect(spellSavePlan({ ...base, type: 'ARMOR', loadedRowCount: 0 })).toBe(
      'none'
    );
    expect(spellSavePlan({ ...base, isNew: true, type: 'ARMOR' })).toBe('none');
  });
});
