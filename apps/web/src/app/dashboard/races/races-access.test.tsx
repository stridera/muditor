/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import RacesPage from './page';

let mockPerms: Record<string, unknown> = {};

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockPerms,
}));
jest.mock('@apollo/client/react', () => ({
  useMutation: () => [jest.fn(), { loading: false }],
  useQuery: () => ({
    loading: false,
    error: undefined,
    refetch: jest.fn(),
    data: {
      races: [
        {
          race: 'HUMAN',
          name: 'Human',
          plainName: 'Human',
          playable: true,
          humanoid: true,
          magical: false,
          defaultSize: 'MEDIUM',
          defaultComposition: 'FLESH',
          maxStrength: 76,
          maxDexterity: 76,
          maxIntelligence: 76,
          maxWisdom: 76,
          maxConstitution: 76,
          maxCharisma: 76,
          expFactor: 100,
          hpFactor: 100,
        },
      ],
      raceSkills: [],
    },
  }),
}));

describe('Races page edit controls match the API (HEAD_BUILDER)', () => {
  it('is read-only for a builder (101-102)', () => {
    mockPerms = { isBuilder: true, isHeadBuilder: false, isCoder: false };
    render(<RacesPage />);
    expect(screen.getByText('Human')).toBeInTheDocument();
    expect(screen.queryByText('Actions')).toBeNull();
  });

  it('shows edit controls to a head builder (103)', () => {
    mockPerms = { isBuilder: true, isHeadBuilder: true, isCoder: false };
    render(<RacesPage />);
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
