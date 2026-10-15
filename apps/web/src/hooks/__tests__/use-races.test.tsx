/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useRaces } from '../use-races';

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    loading: false,
    error: undefined,
    data: {
      races: [
        {
          race: 'DRAGONBORN',
          name: '<b:dim:red>Dragonborn</>',
          plainName: 'Stale',
          playable: true,
          humanoid: true,
          magical: true,
          maxStrength: 1,
          maxIntelligence: 1,
          maxWisdom: 1,
          maxDexterity: 1,
          maxConstitution: 1,
          maxCharisma: 1,
        },
      ],
    },
  }),
}));

describe('useRaces', () => {
  it('uses markup-free plain text for dropdown labels', () => {
    const { result } = renderHook(() => useRaces());
    expect(result.current.races[0]?.displayName).toBe('Dragonborn');
    expect(result.current.races[0]?.name).toBe('<b:dim:red>Dragonborn</>');
  });
});
