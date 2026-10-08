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
  statCap,
} from '../character-creation-form';

const mockRoll = jest.fn();
const mockCreate = jest.fn();

const mockRaces = [
  {
    race: 'HUMAN',
    displayName: 'Human',
    playable: true,
    maxStrength: 76,
    maxIntelligence: 76,
    maxWisdom: 76,
    maxDexterity: 76,
    maxConstitution: 76,
    maxCharisma: 76,
  },
];

jest.mock('@/hooks/use-races', () => ({
  useRaces: () => ({
    races: mockRaces,
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

  it('shows a racial cap next to a capped attribute only', async () => {
    mockRaces[0] = { ...mockRaces[0]!, maxIntelligence: 12 };
    mockRoll.mockResolvedValue({
      data: {
        rollCharacterStats: {
          token: 'tok',
          values: [15, 16, 9, 14, 11, 12, 8],
          expiresAt: '2026-01-01T00:00:00Z',
        },
      },
    });
    render(<CharacterCreationForm onCharacterCreated={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /roll stats/i }));
    await waitFor(() =>
      expect(screen.getByTestId('cap-intelligence')).toBeInTheDocument()
    );
    // INT holds the rolled 16 by default, above the cap of 12.
    expect(screen.getByTestId('cap-intelligence')).toHaveTextContent(
      'Racial max 12: 16 becomes 12'
    );
    expect(screen.queryByTestId('cap-strength')).toBeNull();
    mockRaces[0] = { ...mockRaces[0]!, maxIntelligence: 76 };
  });
});

describe('statCap', () => {
  const human = mockRaces[0] as never;
  it('ignores default caps and luck', () => {
    expect(statCap(human, 'strength')).toBeNull();
    expect(statCap(human, 'luck')).toBeNull();
    expect(statCap(undefined, 'strength')).toBeNull();
  });
  it('reports lowered caps', () => {
    expect(
      statCap({ ...(human as object), maxStrength: 10 } as never, 'strength')
    ).toBe(10);
  });
});
