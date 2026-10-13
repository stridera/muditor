import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import {
  GetCommandHelpDocument,
  UpdateCommandFlagsDocument,
  UpdateCommandHelpDocument,
} from '@/generated/graphql';
import CommandsPage from '../page';
import {
  SUMMARY_MAX,
  TEXT_MAX,
  toMutationVars,
  validateHelpForm,
} from '../command-help';

const mockUpdate = jest.fn();
const mockUpdateFlags = jest.fn();
const mockRefetch = jest.fn();
const mockQueryVars: Array<Record<string, unknown>> = [];
let mockIsCoder = false;

const commands = [
  {
    name: 'look',
    aliases: ['l'],
    category: 'INFORMATION',
    helpSummary: 'Look around.',
    helpText: null,
    allowedWhileCasting: true,
    allowedWhileParalyzed: true,
    keepsHidden: true,
    heldByCastLag: false,
    updatedAt: '2026-10-12T00:00:00Z',
  },
  {
    name: 'goto',
    aliases: ['teleport'],
    category: 'IMMORTAL',
    helpSummary: null,
    helpText: null,
    allowedWhileCasting: false,
    allowedWhileParalyzed: false,
    keepsHidden: false,
    heldByCastLag: false,
    updatedAt: '2026-10-12T00:00:00Z',
  },
];

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({ isBuilder: true, isCoder: mockIsCoder }),
}));
jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: unknown, opts?: { variables?: Record<string, unknown> }) => {
    if (doc !== GetCommandHelpDocument) return { loading: false };
    mockQueryVars.push(opts?.variables ?? {});
    return {
      loading: false,
      data: { commands, commandsCount: 120 },
      refetch: mockRefetch,
    };
  },
  useMutation: (doc: unknown) =>
    doc === UpdateCommandHelpDocument
      ? [mockUpdate, { loading: false }]
      : doc === UpdateCommandFlagsDocument
        ? [mockUpdateFlags, { loading: false }]
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
});

describe('Commands page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCoder = false;
    mockUpdate.mockResolvedValue({});
    mockUpdateFlags.mockResolvedValue({ data: {} });
  });

  it('lists the server page and reports the server-side total', () => {
    render(<CommandsPage />);
    expect(screen.getByText('Look around.')).toBeInTheDocument();
    expect(screen.getByText('built-in default')).toBeInTheDocument();
    expect(screen.getByTestId('list-pager-range')).toHaveTextContent(
      'Showing 1-2 of 120 commands'
    );
    expect(mockQueryVars.at(-1)).toEqual({ search: null, skip: 0, take: 50 });
  });

  it('asks the server for the next page', () => {
    render(<CommandsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(mockQueryVars.at(-1)).toEqual({ search: null, skip: 50, take: 50 });
  });

  it('sends the search to the server (debounced) instead of filtering locally', async () => {
    render(<CommandsPage />);
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: ' goto ' },
    });
    await waitFor(() =>
      expect(mockQueryVars.at(-1)).toEqual({
        search: 'goto',
        skip: 0,
        take: 50,
      })
    );
    // Rows come from the server; nothing is hidden client-side.
    expect(screen.getByText('Look around.')).toBeInTheDocument();
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

  it('shows the flags read-only to a builder and never sends them', async () => {
    render(<CommandsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit look' }));
    const box = screen.getByRole('checkbox', { name: /Keeps you hidden/ });
    expect(box).toBeDisabled();
    expect(box).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    expect(mockUpdateFlags).not.toHaveBeenCalled();
  });

  it('lets a coder change flags through updateCommandFlags', async () => {
    mockIsCoder = true;
    render(<CommandsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit look' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Held by cast lag/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() =>
      expect(mockUpdateFlags).toHaveBeenCalledWith({
        variables: {
          name: 'look',
          allowedWhileCasting: true,
          allowedWhileParalyzed: true,
          keepsHidden: true,
          heldByCastLag: true,
        },
      })
    );
    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
  });

  it('does not call updateCommandFlags when a coder left them alone', async () => {
    mockIsCoder = true;
    render(<CommandsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit look' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
    expect(mockUpdateFlags).not.toHaveBeenCalled();
  });
});
