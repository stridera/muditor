/**
 * Race/class pickers on the character edit form are staff-only (IMMORTAL+).
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { CharacterDto } from '@/generated/graphql';
import { CharacterEditForm } from '../character-edit-form';

let mockRole: 'PLAYER' | 'IMMORTAL' = 'PLAYER';
const mockUpdate = jest.fn();

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ user: { id: 'u1', role: mockRole } }),
}));
jest.mock('@/hooks/use-races', () => ({
  useRaces: () => ({
    races: [
      { race: 'HUMAN', displayName: 'Human', playable: true },
      { race: 'DRAGON_FIRE', displayName: 'Fire Dragon', playable: false },
    ],
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
  useMutation: () => [mockUpdate, { loading: false }],
}));

const character = {
  id: 'c1',
  name: 'Newbie',
  level: 1,
  race: 'HUMAN',
  classId: 7,
  strength: 13,
  intelligence: 13,
  wisdom: 13,
  dexterity: 13,
  constitution: 13,
  charisma: 13,
  luck: 13,
  hitPoints: 50,
  hitPointsMax: 50,
  movement: 100,
  movementMax: 100,
  alignment: 0,
} as unknown as CharacterDto;

describe('CharacterEditForm race/class pickers', () => {
  it('hides race and class selects for the owner', () => {
    mockRole = 'PLAYER';
    render(
      <CharacterEditForm character={character} onCharacterUpdated={jest.fn()} />
    );
    expect(screen.queryByLabelText('Race')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Class')).not.toBeInTheDocument();
  });

  it('shows race and class selects for IMMORTAL+', () => {
    mockRole = 'IMMORTAL';
    render(
      <CharacterEditForm character={character} onCharacterUpdated={jest.fn()} />
    );
    expect(screen.getByLabelText('Race')).toBeInTheDocument();
    expect(screen.getByLabelText('Class')).toBeInTheDocument();
  });

  it('owner payload contains only self-editable fields', async () => {
    mockRole = 'PLAYER';
    mockUpdate.mockResolvedValue({ data: null });
    render(
      <CharacterEditForm character={character} onCharacterUpdated={jest.fn()} />
    );
    expect(screen.queryByLabelText('Level')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Alignment')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    const { data } = mockUpdate.mock.calls[0][0].variables;
    const allowed = [
      'name',
      'gender',
      'description',
      'title',
      'prompt',
      'height',
      'weight',
    ];
    expect(Object.keys(data).filter(k => !allowed.includes(k))).toEqual([]);
  });

  it('staff payload includes level, stats and race/class', async () => {
    mockRole = 'IMMORTAL';
    mockUpdate.mockResolvedValue({ data: null });
    mockUpdate.mockClear();
    render(
      <CharacterEditForm character={character} onCharacterUpdated={jest.fn()} />
    );
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    const { data } = mockUpdate.mock.calls[0][0].variables;
    expect(data).toMatchObject({
      level: 1,
      strength: 13,
      race: 'HUMAN',
      classId: 7,
    });
  });
});
