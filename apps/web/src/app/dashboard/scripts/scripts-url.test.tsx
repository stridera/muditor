/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { navigation } from '@/test-utils/mock-next-navigation';
import ScriptsPage from './page';

jest.mock(
  'next/navigation',
  () =>
    jest.requireActual('@/test-utils/mock-next-navigation').nextNavigationMock
);
jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({
    permissions: { role: 'HEAD_BUILDER' },
    loading: false,
    grantsLoading: false,
    isImmortal: true,
    isHeadBuilder: true,
    canEditAnyZone: true,
    canEditZone: () => true,
  }),
}));
jest.mock('@/hooks/use-list-state', () => ({
  useListState: () => ({ zone: null }),
}));
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));
jest.mock('@/components/MonacoEditor', () => ({
  __esModule: true,
  default: () => <div data-testid='monaco' />,
}));

let editorProps: {
  script?: { id: string; commands: string };
  onSave?: (
    script: Record<string, unknown>,
    options: { close: boolean }
  ) => Promise<void>;
} | null = null;
jest.mock('@/components/ScriptEditor', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    editorProps = props as typeof editorProps;
    return <div data-testid='script-editor' />;
  },
}));

const mockToast = { error: jest.fn(), success: jest.fn() };
jest.mock('sonner', () => ({
  toast: {
    error: (...a: unknown[]) => mockToast.error(...a),
    success: (...a: unknown[]) => mockToast.success(...a),
  },
}));

const mockUpdate = jest.fn().mockResolvedValue({ data: {} });
const mockRefetch = jest.fn();
const trigger = (id: number, name: string) => ({
  id,
  zoneId: 30,
  name,
  attachType: 'MOB',
  numArgs: 0,
  argList: [],
  lineCount: 3,
  flags: [],
  needsReview: false,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
});
const mockTriggers = [trigger(1, 'Alpha'), trigger(2, 'Beta')];
jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({
    query: jest
      .fn()
      .mockResolvedValue({ data: { trigger: { commands: '-- x' } } }),
  }),
  useMutation: (doc: unknown) =>
    JSON.stringify(doc).includes('updateTrigger') ? [mockUpdate] : [jest.fn()],
  useQuery: (doc: unknown, options?: { skip?: boolean }) => {
    if (options?.skip) return { data: undefined, loading: false };
    if (JSON.stringify(doc).includes('triggerAttachments')) {
      return {
        data: {
          triggerAttachments: [
            { kind: 'MOB', zoneId: 30, id: 7, name: 'a guard' },
            { kind: 'OBJECT', zoneId: 12, id: 3, name: 'a lamp' },
            { kind: 'ROOM', zoneId: 30, id: 0, name: 'A hall' },
          ],
        },
        loading: false,
        error: undefined,
      };
    }
    if (JSON.stringify(doc).includes('GetAllTriggerSources')) {
      return {
        data: {
          triggers: mockTriggers.map(t => ({ ...t, commands: '-- body' })),
        },
        loading: false,
      };
    }
    return {
      data: { triggers: mockTriggers },
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    };
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  editorProps = null;
  navigation.reset('/dashboard/scripts');
  mockRefetch.mockResolvedValue({ data: { triggers: mockTriggers } });
});

describe('Scripts page URL state', () => {
  it('opens a script into the URL, and Back returns to the list', async () => {
    render(<ScriptsPage />);
    fireEvent.click(screen.getAllByTitle('Edit')[0]!);
    await screen.findByTestId('script-editor');
    expect(navigation.url).toBe('/dashboard/scripts?trigger=30%3A1');

    act(() => navigation.back());
    await waitFor(() =>
      expect(screen.queryByTestId('script-editor')).toBeNull()
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();

    act(() => navigation.forward());
    await screen.findByTestId('script-editor');
  });

  it('a deep link opens that script directly', async () => {
    navigation.reset('/dashboard/scripts?trigger=30:2');
    render(<ScriptsPage />);
    await screen.findByTestId('script-editor');
    expect(editorProps!.script!.id).toBe('2');
    expect(editorProps!.script!.commands).toBe('-- x');
  });

  it('says so when a deep link names a script that does not exist', async () => {
    navigation.reset('/dashboard/scripts?trigger=30:999');
    render(<ScriptsPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Script 30:999 does not exist.'
    );
  });

  it('returns to the list when the sidebar Scripts link (bare path) is followed', async () => {
    navigation.reset('/dashboard/scripts?trigger=30:1');
    render(<ScriptsPage />);
    await screen.findByTestId('script-editor');
    act(() => navigation.push('/dashboard/scripts'));
    await waitFor(() =>
      expect(screen.queryByTestId('script-editor')).toBeNull()
    );
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('keeps the search text, sort and tab in the URL', async () => {
    render(<ScriptsPage />);

    fireEvent.click(screen.getByText('Name'));
    expect(navigation.url).toContain('sort=name');
    expect(navigation.entries).toHaveLength(2); // sorting is navigation: push

    fireEvent.change(screen.getByPlaceholderText(/Search by name/), {
      target: { value: 'alp' },
    });
    await waitFor(() => expect(navigation.url).toContain('q=alp'));
    expect(navigation.entries).toHaveLength(2); // typing replaces, no spam
    expect(screen.queryByText('Beta')).toBeNull();

    // Back/forward restores the typed filter into the input.
    navigation.reset('/dashboard/scripts?q=bet');
    await waitFor(() =>
      expect(screen.getByPlaceholderText(/Search by name/)).toHaveValue('bet')
    );
    expect(screen.queryByText('Alpha')).toBeNull();

    fireEvent.click(screen.getByRole('tab', { name: 'Libraries' }));
    expect(navigation.url).toBe('/dashboard/scripts?tab=libraries');
    act(() => navigation.back());
    await screen.findByRole('tab', { name: 'Triggers', selected: true });
  });

  it('lists what the open trigger is attached to, with links', async () => {
    navigation.reset('/dashboard/scripts?trigger=30:1');
    render(<ScriptsPage />);
    const panel = await screen.findByRole('region', { name: 'Attached to' });
    // The panel sits below the editor so the editor never moves with the count.
    expect(
      screen.getByTestId('script-editor').compareDocumentPosition(panel) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(panel).toHaveTextContent('(3)');
    expect(screen.getByRole('link', { name: /a guard/ })).toHaveAttribute(
      'href',
      '/dashboard/mobs/editor?zone=30&id=7'
    );
    expect(screen.getByRole('link', { name: /a lamp/ })).toHaveAttribute(
      'href',
      '/dashboard/objects/editor?zone=12&id=3'
    );
    expect(screen.getByRole('link', { name: /A hall/ })).toHaveAttribute(
      'href',
      '/dashboard/zones/editor?zone=30&room=0'
    );
  });

  it('Save keeps the editor open; Save & Close returns to the list', async () => {
    navigation.reset('/dashboard/scripts?trigger=30:1');
    render(<ScriptsPage />);
    await screen.findByTestId('script-editor');
    const draft = { name: 'Alpha', attachType: 'MOB', commands: '-- y' };

    await act(async () => {
      await editorProps!.onSave!(draft, { close: false });
    });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockToast.success).toHaveBeenCalled();
    expect(screen.getByTestId('script-editor')).toBeInTheDocument();
    expect(navigation.url).toBe('/dashboard/scripts?trigger=30:1');
    // The saved text is the editor's new baseline.
    expect(editorProps!.script!.commands).toBe('-- y');

    await act(async () => {
      await editorProps!.onSave!(draft, { close: true });
    });
    await waitFor(() =>
      expect(screen.queryByTestId('script-editor')).toBeNull()
    );
    expect(navigation.url).toBe('/dashboard/scripts');
  });

  it('shows an error toast and stays open when saving fails', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('nope'));
    navigation.reset('/dashboard/scripts?trigger=30:1');
    render(<ScriptsPage />);
    await screen.findByTestId('script-editor');
    await act(async () => {
      await editorProps!.onSave!(
        { name: 'Alpha', attachType: 'MOB', commands: '-- y' },
        { close: true }
      );
    });
    expect(mockToast.error).toHaveBeenCalledWith(
      expect.stringContaining('Could not save the script')
    );
    expect(screen.getByTestId('script-editor')).toBeInTheDocument();
  });
});
