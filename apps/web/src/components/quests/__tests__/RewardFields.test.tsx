import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { REWARD_TYPES } from '../quest-constants';
import { RewardFields } from '../RewardFields';
import type { RewardFormData } from '../quest-form';

jest.mock('@/components/help/HelpButton', () => ({
  HelpButton: ({ anchor }: { anchor?: string }) => (
    <span data-testid='help' data-anchor={anchor} />
  ),
}));
jest.mock('../EntityAutocomplete', () => ({
  EntityAutocomplete: () => <div data-testid='entity-object' />,
}));
jest.mock('../AbilityPicker', () => ({
  AbilityPicker: () => <div data-testid='ability-picker' />,
}));

const base: RewardFormData = {
  id: 1,
  phaseId: 1,
  rewardType: 'EXPERIENCE',
  amount: 100,
  objectZoneId: null,
  objectId: null,
  abilityId: null,
  choiceGroup: null,
  quantity: 1,
  condition: '',
};

function renderReward(
  overrides: Partial<RewardFormData>,
  onChange = jest.fn()
) {
  render(
    <RewardFields reward={{ ...base, ...overrides }} onChange={onChange} />
  );
  return onChange;
}

describe('RewardFields', () => {
  it('offers every reward type the game grants plus Housing', () => {
    renderReward({});
    const options = Array.from(
      (screen.getByLabelText('Reward type') as HTMLSelectElement).options
    ).map(o => o.value);
    expect(options).toEqual(REWARD_TYPES.map(t => t.value));
    expect(options).toEqual(
      expect.arrayContaining([
        'EXPERIENCE',
        'GOLD',
        'ITEM',
        'ABILITY',
        'SKILL_POINTS',
        'HOUSING',
      ])
    );
  });

  it.each(['EXPERIENCE', 'GOLD', 'SKILL_POINTS'] as const)(
    '%s shows an amount only',
    type => {
      renderReward({ rewardType: type });
      expect(screen.getByLabelText('Amount')).toBeInTheDocument();
      expect(screen.queryByLabelText('Quantity')).not.toBeInTheDocument();
      expect(screen.queryByTestId('entity-object')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ability-picker')).not.toBeInTheDocument();
    }
  );

  it('Item shows the item picker and a quantity', () => {
    const onChange = renderReward({ rewardType: 'ITEM', quantity: 2 });
    expect(screen.getByTestId('entity-object')).toBeInTheDocument();
    expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '5' },
    });
    expect(onChange).toHaveBeenCalledWith({ quantity: 5 });
  });

  it('Ability shows the ability picker', () => {
    renderReward({ rewardType: 'ABILITY' });
    expect(screen.getByTestId('ability-picker')).toBeInTheDocument();
    expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument();
  });

  it('Housing has no value fields and no warning', () => {
    renderReward({ rewardType: 'HOUSING' });
    expect(screen.queryByLabelText('Amount')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Quantity')).not.toBeInTheDocument();
    expect(screen.queryByText(/Not yet granted/)).not.toBeInTheDocument();
  });

  it('edits the condition and links to the Lua help section', () => {
    const onChange = renderReward({ rewardType: 'GOLD' });
    fireEvent.change(screen.getByLabelText('Reward condition'), {
      target: { value: "actor.class == 'paladin'" },
    });
    expect(onChange).toHaveBeenCalledWith({
      condition: "actor.class == 'paladin'",
    });
    expect(
      screen
        .getAllByTestId('help')
        .some(
          el => el.getAttribute('data-anchor') === 'availability-requirement'
        )
    ).toBe(true);
  });
});
