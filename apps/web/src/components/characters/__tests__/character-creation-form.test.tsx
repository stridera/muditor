/**
 * Character creation is roll + assign: stats come from a server roll and the
 * player only chooses which rolled value goes to which attribute.
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  CharacterCreationForm,
  STAT_FIELDS,
  assignRolledValue,
  defaultAssignment,
} from '../character-creation-form';

const mockRoll = jest.fn();
const mockCreate = jest.fn();

jest.mock('@/hooks/use-races', () => ({
  useRaces: () => ({
    races: [{ race: 'HUMAN', displayName: 'Human', playable: true }],
    loading: false,
    error: undefined,
  }),
}));
jest.mock('@/hooks/use-classes', () => ({
  useClasses: () => ({
    classes: [{ id: '7', plainName: 'Warrior' }],
    loading: false,
    error: undefined,
  }),
}));
jest.mock('@apollo/client/react', () => ({
  // First useMutation in the component is create, second is roll.
  useMutation: (doc: { definitions: { name?: { value: string } }[] }) =>
    doc.definitions[0]?.name?.value === 'RollCharacterStats'
      ? [mockRoll, { loading: false }]
      : [mockCreate, { loading: false }],
}));

const sorted = (a: number[]) => [...a].sort((x, y) => x - y);

describe('assignRolledValue', () => {
  it('always keeps the assignment a permutation of the roll', () => {
    let a = defaultAssignment();
    a = assignRolledValue(a, 'strength', 6);
    a = assignRolledValue(a, 'luck', 6);
    a = assignRolledValue(a, 'wisdom', 0);
    expect(sorted(Object.values(a))).toEqual(
      sorted(STAT_FIELDS.map((_, i) => i))
    );
  });

  it('swaps with the attribute that held the chosen value', () => {
    const a = assignRolledValue(defaultAssignment(), 'strength', 3);
    expect(a.strength).toBe(3);
    expect(a.dexterity).toBe(0);
  });
});

describe('CharacterCreationForm', () => {
  beforeEach(() => {
    mockRoll.mockReset();
    mockCreate.mockReset();
  });

  it('has no free-form stat inputs and cannot submit before rolling', () => {
    render(<CharacterCreationForm onCharacterCreated={jest.fn()} />);
    expect(screen.queryByLabelText(/Strength/)).toBeNull();
    expect(screen.getByRole('button', { name: /roll stats/i })).toBeVisible();
    expect(
      screen.getByRole('button', { name: /create character/i })
    ).toBeDisabled();
  });

  it('shows the assignment pickers once the server roll arrives', async () => {
    mockRoll.mockResolvedValue({
      data: {
        rollCharacterStats: {
          token: 'tok',
          values: [15, 12, 9, 14, 11, 16, 8],
          expiresAt: '2026-01-01T00:00:00Z',
        },
      },
    });
    render(<CharacterCreationForm onCharacterCreated={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /roll stats/i }));
    await waitFor(() =>
      expect(screen.getByLabelText(/Strength/)).toBeInTheDocument()
    );
    expect(screen.getByRole('button', { name: /reroll/i })).toBeVisible();
    expect(
      screen.getByRole('button', { name: /create character/i })
    ).toBeEnabled();
  });
});
