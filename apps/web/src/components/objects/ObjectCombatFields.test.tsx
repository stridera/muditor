import { fireEvent, render, screen } from '@testing-library/react';
import {
  EMPTY_COMBAT_COLUMNS,
  type CombatColumns,
} from '@/lib/objectTypeValues';
import { formatWeaponDice, ObjectCombatFields } from './ObjectCombatFields';

const cols = (over: Partial<CombatColumns> = {}): CombatColumns => ({
  ...EMPTY_COMBAT_COLUMNS,
  ...over,
});

describe('ObjectCombatFields', () => {
  it('shows dice, bonus and damage type for a weapon and writes each column', () => {
    const onChange = jest.fn();
    render(
      <ObjectCombatFields
        type='WEAPON'
        value={cols({
          weaponDiceNum: 2,
          weaponDiceSize: 6,
          weaponDiceBonus: 3,
        })}
        onChange={onChange}
      />
    );
    expect(screen.getByLabelText('Damage Dice Count')).toHaveValue(2);
    expect(screen.getByLabelText('Damage Dice Sides')).toHaveValue(6);
    expect(screen.getByLabelText('Damage Bonus')).toHaveValue(3);

    fireEvent.change(screen.getByLabelText('Damage Dice Count'), {
      target: { value: '4' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ weaponDiceNum: 4 });
    fireEvent.change(screen.getByLabelText('Damage Dice Sides'), {
      target: { value: '8' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ weaponDiceSize: 8 });
    fireEvent.change(screen.getByLabelText('Damage Bonus'), {
      target: { value: '-2' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ weaponDiceBonus: -2 });
    fireEvent.change(screen.getByLabelText('Damage Type'), {
      target: { value: 'PIERCE' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ weaponDamageType: 'PIERCE' });
    fireEvent.change(screen.getByLabelText('Element'), {
      target: { value: 'COLD' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ weaponElement: 'COLD' });
  });

  it('offers None plus every damage type, and clears back to none', () => {
    const onChange = jest.fn();
    render(
      <ObjectCombatFields
        type='WEAPON'
        value={cols({ weaponDamageType: 'SLASH' })}
        onChange={onChange}
      />
    );
    const select = screen.getByLabelText('Damage Type') as HTMLSelectElement;
    expect(select.value).toBe('SLASH');
    expect(select.options).toHaveLength(26);
    fireEvent.change(select, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith({ weaponDamageType: '' });
  });

  it('never goes below zero dice and treats junk as zero', () => {
    const onChange = jest.fn();
    render(
      <ObjectCombatFields type='WEAPON' value={cols()} onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText('Damage Dice Count'), {
      target: { value: '-5' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ weaponDiceNum: 0 });
    fireEvent.change(screen.getByLabelText('Damage Dice Sides'), {
      target: { value: '' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ weaponDiceSize: 0 });
  });

  it('summarises the damage a hit rolls', () => {
    const { rerender } = render(
      <ObjectCombatFields
        type='WEAPON'
        value={cols({
          weaponDiceNum: 2,
          weaponDiceSize: 6,
          weaponDiceBonus: 3,
          weaponDamageType: 'SLASH',
        })}
        onChange={jest.fn()}
      />
    );
    expect(screen.getByTestId('dice-summary')).toHaveTextContent(
      'Each hit rolls 2d6+3 SLASH damage.'
    );
    rerender(
      <ObjectCombatFields type='WEAPON' value={cols()} onChange={jest.fn()} />
    );
    expect(screen.getByTestId('dice-summary')).toHaveTextContent(
      'deals no weapon damage'
    );
  });

  it('formats dice with signed bonus', () => {
    expect(
      formatWeaponDice(cols({ weaponDiceNum: 1, weaponDiceSize: 4 }))
    ).toBe('1d4');
    expect(
      formatWeaponDice(
        cols({ weaponDiceNum: 3, weaponDiceSize: 10, weaponDiceBonus: -2 })
      )
    ).toBe('3d10-2');
    expect(
      formatWeaponDice(cols({ weaponDiceNum: 0, weaponDiceSize: 6 }))
    ).toBeNull();
  });

  it('armor shows the armor value only, and allows cursed (negative) armor', () => {
    const onChange = jest.fn();
    render(
      <ObjectCombatFields
        type='ARMOR'
        value={cols({ armorPct: 40 })}
        onChange={onChange}
      />
    );
    expect(screen.getByLabelText('Armor Value')).toHaveValue(40);
    expect(screen.queryByLabelText('Damage Dice Count')).toBeNull();
    fireEvent.change(screen.getByLabelText('Armor Value'), {
      target: { value: '-18' },
    });
    expect(onChange).toHaveBeenLastCalledWith({ armorPct: -18 });
  });

  it.each(['LIGHT', 'FOOD', 'CONTAINER', 'NOTHING'])(
    'renders nothing for %s',
    type => {
      const { container } = render(
        <ObjectCombatFields type={type} value={cols()} onChange={jest.fn()} />
      );
      expect(container).toBeEmptyDOMElement();
    }
  );
});
