/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ScriptsPage from './page';

let mockPerms: Record<string, unknown> = {};

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockPerms,
}));
jest.mock('@/hooks/use-list-state', () => ({
  useListState: () => ({ zone: null }),
}));
jest.mock('@/components/ScriptEditor', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ query: jest.fn() }),
  useMutation: () => [jest.fn()],
  useQuery: () => ({
    data: {
      triggers: [
        {
          id: 1,
          zoneId: 30,
          name: 'Mine',
          attachType: 'MOB',
          numArgs: 0,
          argList: [],
          lineCount: 3,
          commands: '',
          flags: [],
          needsReview: false,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
        {
          id: 2,
          zoneId: 77,
          name: 'Someone elses',
          attachType: 'MOB',
          numArgs: 0,
          argList: [],
          lineCount: 3,
          commands: '',
          flags: [],
          needsReview: false,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
        },
      ],
    },
    loading: false,
    error: undefined,
    refetch: jest.fn(),
  }),
}));

const base = {
  permissions: { role: 'BUILDER' },
  loading: false,
  grantsLoading: false,
  canEditAnyZone: false,
  canEditZone: () => false,
};

describe('Scripts page access', () => {
  it('explains the requirement to a builder without a zone grant', () => {
    mockPerms = base;
    render(<ScriptsPage />);
    expect(
      screen.getByText('Scripts are not available to you')
    ).toBeInTheDocument();
    expect(screen.queryByText('Mine')).toBeNull();
  });

  it('shows a grant holder only the scripts of the zones they can write', () => {
    mockPerms = {
      ...base,
      canEditAnyZone: true,
      canEditZone: (z?: number) => z === 30,
    };
    render(<ScriptsPage />);
    expect(screen.getByText('Mine')).toBeInTheDocument();
    expect(screen.queryByText('Someone elses')).toBeNull();
  });

  it('shows a head builder (103) every script', () => {
    mockPerms = {
      ...base,
      permissions: { role: 'HEAD_BUILDER' },
      canEditAnyZone: true,
      canEditZone: () => true,
    };
    render(<ScriptsPage />);
    expect(screen.getByText('Mine')).toBeInTheDocument();
    expect(screen.getByText('Someone elses')).toBeInTheDocument();
  });
});
