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
    a = assignRolledValue(a, 'strength', 5);
    a = assignRolledValue(a, 'charisma', 5);
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
          values: [75, 60, 46, 82, 68, 90],
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

  it('states the 0-100 stat scale before and after rolling', async () => {
    mockRoll.mockResolvedValue({
      data: {
        rollCharacterStats: {
          token: 'tok',
          values: [75, 60, 46, 82, 68, 90],
          expiresAt: '2026-01-01T00:00:00Z',
        },
      },
    });
    render(<CharacterCreationForm onCharacterCreated={jest.fn()} />);
    expect(screen.getByTestId('stat-scale-note')).toHaveTextContent(
      /0-100 scale/
    );
    expect(screen.queryByText(/use the dropdowns to swap stats/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /roll stats/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/use the dropdowns to swap stats/i)
      ).toBeInTheDocument()
    );
    expect(screen.getByTestId('stat-scale-note')).toBeVisible();
    expect(screen.getByTestId('stat-scale-note')).not.toHaveTextContent(
      /3-18|converted/
    );
  });

  it('shows each racial cap, and says when a rolled value is lowered', async () => {
    mockRaces[0] = { ...mockRaces[0]!, maxIntelligence: 64 };
    mockRoll.mockResolvedValue({
      data: {
        rollCharacterStats: {
          token: 'tok',
          values: [75, 90, 46, 82, 68, 60],
          expiresAt: '2026-01-01T00:00:00Z',
        },
      },
    });
    render(<CharacterCreationForm onCharacterCreated={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /roll stats/i }));
    await waitFor(() =>
      expect(screen.getByTestId('cap-intelligence')).toBeInTheDocument()
    );
    // INT holds the rolled 90 by default, above the cap of 64.
    expect(screen.getByTestId('cap-intelligence')).toHaveTextContent(
      'Racial max 64: 90 becomes 64'
    );
    // STR holds the rolled 75, under the human cap of 76: shown, not lowered.
    expect(screen.getByTestId('cap-strength')).toHaveTextContent(
      'Racial max 76'
    );
    expect(screen.getByTestId('cap-strength')).not.toHaveTextContent('becomes');
    mockRaces[0] = { ...mockRaces[0]!, maxIntelligence: 76 };
  });
});

describe('statCap', () => {
  const human = mockRaces[0] as never;
  it('reports the race cap on the 0-100 scale', () => {
    expect(statCap(human, 'strength')).toBe(76);
    expect(statCap(undefined, 'strength')).toBeNull();
  });
  it('ignores a cap at the top of the scale', () => {
    expect(
      statCap({ ...(human as object), maxStrength: 100 } as never, 'strength')
    ).toBeNull();
  });
  it('reports lowered caps', () => {
    expect(
      statCap({ ...(human as object), maxStrength: 10 } as never, 'strength')
    ).toBe(10);
  });
});
