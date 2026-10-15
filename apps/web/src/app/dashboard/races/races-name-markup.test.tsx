/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import RacesPage from './page';

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({ isHeadBuilder: true }),
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
          race: 'DRAGONBORN',
          name: '<b:red>Dragonborn</>',
          plainName: 'Dragonborn',
          playable: true,
          humanoid: true,
          magical: true,
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

describe('Races page renders game colour markup in race names', () => {
  it('shows the coloured name in the list without raw tags', () => {
    const { container } = render(<RacesPage />);
    expect(screen.getByText('Dragonborn')).toBeInTheDocument();
    expect(container.textContent).not.toContain('<b:red>');
  });

  it('shows the coloured name in the details dialog without raw tags', () => {
    render(<RacesPage />);
    fireEvent.click(screen.getByText('Dragonborn'));
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('Dragonborn');
    expect(dialog.textContent).not.toContain('<b:red>');
  });
});
