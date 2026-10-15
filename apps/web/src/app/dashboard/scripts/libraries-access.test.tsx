/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ScriptsPage from './page';

let mockPerms: Record<string, unknown> = {};

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockPerms,
}));
jest.mock('@/hooks/use-list-state', () => ({
  useListState: () => ({ zone: null }),
}));
jest.mock('next-themes', () => ({
  useTheme: () => ({ resolvedTheme: 'dark' }),
}));
jest.mock('@/components/ScriptEditor', () => ({
  __esModule: true,
  default: () => <div data-testid='script-editor' />,
}));
let monacoProps: Record<string, unknown> | null = null;
jest.mock('@/components/MonacoEditor', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    monacoProps = props;
    return <div data-testid='monaco' />;
  },
}));

const createLibrary = jest.fn().mockResolvedValue({});
const updateLibrary = jest.fn().mockResolvedValue({});
const deleteLibrary = jest.fn().mockResolvedValue({});
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));
jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ query: jest.fn() }),
  useMutation: (doc: {
    definitions?: Array<{ name?: { value?: string } }>;
  }) => {
    const name = JSON.stringify(doc).toLowerCase();
    if (name.includes('createscriptlibrary')) return [createLibrary];
    if (name.includes('updatescriptlibrary')) return [updateLibrary];
    if (name.includes('deletescriptlibrary')) return [deleteLibrary];
    return [jest.fn()];
  },
  useQuery: (doc: unknown) => {
    if (JSON.stringify(doc).includes('scriptLibraries')) {
      return {
        data: {
          scriptLibraries: [
            {
              id: 1,
              name: 'mine-lib',
              zoneId: 30,
              description: 'in my zone',
              code: 'return {}',
              lineCount: 1,
              createdAt: '2026-01-01',
              updatedAt: '2026-01-01',
            },
            {
              id: 2,
              name: 'other-lib',
              zoneId: 77,
              description: null,
              code: 'return 2',
              lineCount: 1,
              createdAt: '2026-01-01',
              updatedAt: '2026-01-01',
            },
            {
              id: 3,
              name: 'global-lib',
              zoneId: null,
              description: null,
              code: 'return 3',
              lineCount: 1,
              createdAt: '2026-01-01',
              updatedAt: '2026-01-01',
            },
          ],
        },
        loading: false,
        error: undefined,
        refetch: jest.fn(),
      };
    }
    return {
      data: { triggers: [] },
      loading: false,
      error: undefined,
      refetch: jest.fn(),
    };
  },
}));

const staff = {
  permissions: { role: 'IMMORTAL' },
  loading: false,
  grantsLoading: false,
  isImmortal: true,
  isHeadBuilder: false,
  canEditAnyZone: false,
  canEditZone: () => false,
};

function openLibraries() {
  render(<ScriptsPage />);
  fireEvent.click(screen.getByRole('tab', { name: 'Libraries' }));
}

describe('Script libraries tab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    monacoProps = null;
  });

  it('links to the scripting guide', () => {
    mockPerms = staff;
    render(<ScriptsPage />);
    expect(
      screen.getByRole('link', { name: /scripting guide/i })
    ).toHaveAttribute('href', expect.stringContaining('SCRIPTING.md'));
  });

  it('is read-only for an immortal: lists everything, no write controls', async () => {
    mockPerms = staff;
    openLibraries();
    expect(screen.getByText('mine-lib')).toBeInTheDocument();
    expect(screen.getByText('other-lib')).toBeInTheDocument();
    expect(screen.getByText('global-lib')).toBeInTheDocument();
    expect(screen.queryByText('New Library')).toBeNull();
    expect(screen.queryByTitle('Edit')).toBeNull();
    expect(screen.queryByTitle('Delete')).toBeNull();

    fireEvent.click(screen.getAllByTitle('View')[0]!);
    await waitFor(() => expect(monacoProps).not.toBeNull());
    expect((monacoProps!.options as { readOnly: boolean }).readOnly).toBe(true);
    expect(screen.getByText('View Library')).toBeInTheDocument();
    expect(screen.queryByText('Save')).toBeNull();
  });

  it('gives a grant holder edit controls only on their zone, never on global', () => {
    mockPerms = {
      ...staff,
      permissions: { role: 'BUILDER' },
      canEditAnyZone: true,
      canEditZone: (z?: number) => z === 30,
    };
    openLibraries();
    expect(screen.getByText('New Library')).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit')).toHaveLength(1);
    expect(screen.getAllByTitle('Delete')).toHaveLength(1);
    expect(screen.getAllByTitle('View')).toHaveLength(2);
  });

  it('gives a head builder edit controls on every library, global included', () => {
    mockPerms = {
      ...staff,
      permissions: { role: 'HEAD_BUILDER' },
      isHeadBuilder: true,
      canEditAnyZone: true,
      canEditZone: () => true,
    };
    openLibraries();
    expect(screen.getAllByTitle('Edit')).toHaveLength(3);
    expect(screen.queryByTitle('View')).toBeNull();
  });

  it('creates a library after validating the name', async () => {
    mockPerms = {
      ...staff,
      permissions: { role: 'HEAD_BUILDER' },
      isHeadBuilder: true,
      canEditAnyZone: true,
      canEditZone: () => true,
    };
    openLibraries();
    fireEvent.click(screen.getByText('New Library'));

    fireEvent.change(screen.getByLabelText('Library name'), {
      target: { value: 'Bad Name' },
    });
    fireEvent.click(screen.getByText('Save'));
    expect(createLibrary).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Library name'), {
      target: { value: 'wand-quest' },
    });
    fireEvent.change(screen.getByLabelText('Library zone'), {
      target: { value: '30' },
    });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(createLibrary).toHaveBeenCalled());
    expect(createLibrary.mock.calls[0]![0].variables.input).toMatchObject({
      name: 'wand-quest',
      zoneId: 30,
    });
  });

  it('refuses to save a global library without head builder rights', () => {
    mockPerms = {
      ...staff,
      permissions: { role: 'BUILDER' },
      canEditAnyZone: true,
      canEditZone: (z?: number) => z === 30,
    };
    openLibraries();
    fireEvent.click(screen.getByText('New Library'));
    fireEvent.change(screen.getByLabelText('Library name'), {
      target: { value: 'g' },
    });
    fireEvent.click(screen.getByText('Save'));
    expect(createLibrary).not.toHaveBeenCalled();
  });
});
