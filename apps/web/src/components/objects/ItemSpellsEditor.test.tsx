import '@testing-library/jest-dom';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  abilitiesInput,
  moveRow,
  rowsFromAbilities,
  type SpellRow,
} from '@/lib/objectSpells';
import { ItemSpellsEditor } from './ItemSpellsEditor';

jest.mock('@/components/ColoredTextViewer', () => ({
  ColoredTextInline: ({ markup }: { markup: string }) => <span>{markup}</span>,
}));
// The real picker searches over GraphQL; stand in a button that picks "Bless".
jest.mock('@/components/mob-ai/AbilityPicker', () => ({
  AbilityPicker: ({
    onChange,
  }: {
    onChange: (a: { id: number; name: string; abilityType: string }) => void;
  }) => (
    <button
      onClick={() => onChange({ id: 7, name: 'Bless', abilityType: 'SPELL' })}
    >
      pick Bless
    </button>
  ),
}));

const row = (key: string, abilityId: number, name: string): SpellRow => ({
  key,
  abilityId,
  name,
  level: 10,
  charges: null,
});

describe('ItemSpellsEditor', () => {
  it('adds a slot per pick, so the same spell can repeat', () => {
    const onChange = jest.fn();
    render(
      <ItemSpellsEditor
        type='POTION'
        rows={[row('a', 7, 'Bless')]}
        onChange={onChange}
        defaultLevel={25}
      />
    );
    fireEvent.click(screen.getByText('pick Bless'));
    const next = onChange.mock.calls[0]![0] as SpellRow[];
    expect(next.map(r => [r.abilityId, r.level])).toEqual([
      [7, 10],
      [7, 25],
    ]);
    expect(next[0]!.key).not.toBe(next[1]!.key);
  });

  it('reorders, edits levels and removes slots', () => {
    const onChange = jest.fn();
    const rows = [row('a', 1, 'Armor'), row('b', 2, 'Bless')];
    render(
      <ItemSpellsEditor
        type='SCROLL'
        rows={rows}
        onChange={onChange}
        defaultLevel={1}
      />
    );
    fireEvent.click(screen.getByLabelText('Move spell 2 up'));
    expect((onChange.mock.calls[0]![0] as SpellRow[]).map(r => r.key)).toEqual([
      'b',
      'a',
    ]);
    fireEvent.change(screen.getByLabelText('Level of spell 1'), {
      target: { value: '30' },
    });
    expect((onChange.mock.calls[1]![0] as SpellRow[])[0]!.level).toBe(30);
    fireEvent.click(screen.getByLabelText('Remove spell 1'));
    expect((onChange.mock.calls[2]![0] as SpellRow[]).map(r => r.key)).toEqual([
      'b',
    ]);
    expect(screen.queryByLabelText('Charges of spell 1')).toBeNull();
  });

  it('shows charges only for wands and staves', () => {
    const onChange = jest.fn();
    render(
      <ItemSpellsEditor
        type='WAND'
        rows={[row('a', 1, 'Armor')]}
        onChange={onChange}
        defaultLevel={1}
      />
    );
    fireEvent.change(screen.getByLabelText('Charges of spell 1'), {
      target: { value: '5' },
    });
    expect((onChange.mock.calls[0]![0] as SpellRow[])[0]!.charges).toBe(5);
    cleanup();
    render(
      <ItemSpellsEditor
        type='WAND'
        rows={[{ ...row('a', 1, 'Armor'), charges: 5 }]}
        onChange={onChange}
        defaultLevel={1}
      />
    );
    fireEvent.change(screen.getByLabelText('Charges of spell 1'), {
      target: { value: '' },
    });
    expect((onChange.mock.calls[1]![0] as SpellRow[])[0]!.charges).toBeNull();
  });
});

describe('objectSpells helpers', () => {
  it('builds the mutation input in row order, charges only for wands/staves', () => {
    const rows = rowsFromAbilities([
      { abilityId: 3, abilityName: 'Cure', level: 5, charges: 4 },
      { abilityId: 3, abilityName: 'Cure', level: 5, charges: null },
    ]);
    expect(abilitiesInput(rows, 'WAND')).toEqual([
      { abilityId: 3, level: 5, charges: 4 },
      { abilityId: 3, level: 5 },
    ]);
    expect(abilitiesInput(rows, 'POTION')).toEqual([
      { abilityId: 3, level: 5 },
      { abilityId: 3, level: 5 },
    ]);
  });

  it('moveRow ignores out-of-range moves', () => {
    expect(moveRow([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
    expect(moveRow([1, 2, 3], 0, 2)).toEqual([2, 3, 1]);
  });
});
