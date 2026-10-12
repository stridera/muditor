import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  GetCommandHelpDocument,
  UpdateCommandHelpDocument,
} from '@/generated/graphql';
import CommandsPage from '../page';
import {
  SUMMARY_MAX,
  TEXT_MAX,
  matchesQuery,
  toMutationVars,
  validateHelpForm,
} from '../command-help';

const mockUpdate = jest.fn();
const mockRefetch = jest.fn();

const commands = [
  {
    name: 'look',
    aliases: ['l'],
    category: 'INFORMATION',
    helpSummary: 'Look around.',
    helpText: null,
    updatedAt: '2026-10-12T00:00:00Z',
  },
  {
    name: 'goto',
    aliases: ['teleport'],
    category: 'IMMORTAL',
    helpSummary: null,
    helpText: null,
    updatedAt: '2026-10-12T00:00:00Z',
  },
];

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({ isBuilder: true }),
}));
jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown) =>
    doc === GetCommandHelpDocument
      ? { loading: false, data: { commands }, refetch: mockRefetch }
      : { loading: false, data: undefined },
  useMutation: (doc: unknown) =>
    doc === UpdateCommandHelpDocument
      ? [mockUpdate, { loading: false }]
      : [jest.fn(), { loading: false }],
}));

describe('command help form helpers', () => {
  it('sends empty values as null and trims the rest', () => {
    expect(toMutationVars({ helpSummary: '  ', helpText: ' hi \n' })).toEqual({
      helpSummary: null,
      helpText: 'hi',
    });
  });

  it('validates summary and text', () => {
    expect(validateHelpForm({ helpSummary: 'a\nb', helpText: '' })).toMatch(
      /single line/
    );
    expect(
      validateHelpForm({
        helpSummary: 'x'.repeat(SUMMARY_MAX + 1),
        helpText: '',
      })
    ).toMatch(/at most/);
    expect(
      validateHelpForm({ helpSummary: '', helpText: 'x'.repeat(TEXT_MAX + 1) })
    ).toMatch(/at most/);
    expect(
      validateHelpForm({ helpSummary: 'ok', helpText: 'a\nb' })
    ).toBeNull();
  });

  it('matches name, alias and summary', () => {
    const c = commands[0]!;
    expect(matchesQuery(c, 'LOO')).toBe(true);
    expect(matchesQuery(c, 'around')).toBe(true);
    expect(matchesQuery(commands[1]!, 'tele')).toBe(true);
    expect(matchesQuery(c, 'zzz')).toBe(false);
  });
});

describe('Commands page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockResolvedValue({});
  });

  it('lists commands and filters by search', () => {
    render(<CommandsPage />);
    expect(screen.getByText('Look around.')).toBeInTheDocument();
    expect(screen.getByText('built-in default')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'goto' },
    });
    expect(screen.queryByText('Look around.')).not.toBeInTheDocument();
  });

  it('saves the edited help through the mutation', async () => {
    render(<CommandsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit look' }));
    fireEvent.change(screen.getByLabelText('Summary'), {
      target: { value: '  Look at things. ' },
    });
    fireEvent.change(screen.getByLabelText('Help text'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(mockUpdate).toHaveBeenCalledWith({
        variables: {
          name: 'look',
          helpSummary: 'Look at things.',
          helpText: null,
        },
      })
    );
  });
});
