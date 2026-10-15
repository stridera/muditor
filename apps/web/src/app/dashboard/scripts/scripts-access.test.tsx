/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ScriptsPage from './page';
import { navigation } from '@/test-utils/mock-next-navigation';

let mockPerms: Record<string, unknown> = {};

jest.mock(
  'next/navigation',
  () =>
    jest.requireActual('@/test-utils/mock-next-navigation').nextNavigationMock
);
jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => mockPerms,
}));
jest.mock('@/hooks/use-list-state', () => ({
  useListState: () => ({ zone: null }),
}));
let editorProps: Record<string, unknown> | null = null;
jest.mock('@/components/ScriptEditor', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    editorProps = props;
    return <div data-testid='script-editor' />;
  },
}));
jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({
    query: jest
      .fn()
      .mockResolvedValue({ data: { trigger: { commands: '-- x' } } }),
  }),
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
  permissions: { role: 'IMMORTAL' },
  loading: false,
  grantsLoading: false,
  isImmortal: true,
  canEditAnyZone: false,
  canEditZone: () => false,
};

describe('Scripts page access', () => {
  beforeEach(() => {
    editorProps = null;
    navigation.reset();
  });

  it('explains the requirement to non-staff', () => {
    mockPerms = {
      ...base,
      permissions: { role: 'PLAYER' },
      isImmortal: false,
    };
    render(<ScriptsPage />);
    expect(
      screen.getByText('Scripts are not available to you')
    ).toBeInTheDocument();
    expect(screen.queryByText('Mine')).toBeNull();
  });

  it('lets an immortal (100) browse every script, read-only', async () => {
    mockPerms = base;
    render(<ScriptsPage />);
    expect(screen.getByText('Mine')).toBeInTheDocument();
    expect(screen.getByText('Someone elses')).toBeInTheDocument();
    expect(screen.queryByText('New Script')).toBeNull();
    expect(screen.queryByTitle('Edit')).toBeNull();
    expect(screen.queryByTitle('Delete')).toBeNull();
    expect(screen.queryByTitle('Mark as reviewed')).toBeNull();

    fireEvent.click(screen.getAllByTitle('View')[0]!);
    await waitFor(() => expect(editorProps).not.toBeNull());
    expect(editorProps!.readOnly).toBe(true);
    expect(editorProps!.onSave).toBeUndefined();
    expect(screen.getByText('View Script')).toBeInTheDocument();
  });

  it('gives a grant holder edit controls only on the zones they can write', async () => {
    mockPerms = {
      ...base,
      permissions: { role: 'BUILDER' },
      canEditAnyZone: true,
      canEditZone: (z?: number) => z === 30,
    };
    render(<ScriptsPage />);
    expect(screen.getByText('Mine')).toBeInTheDocument();
    expect(screen.getByText('Someone elses')).toBeInTheDocument();
    expect(screen.getByText('New Script')).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit')).toHaveLength(1);
    expect(screen.getAllByTitle('Delete')).toHaveLength(1);
    expect(screen.getAllByTitle('View')).toHaveLength(1);

    fireEvent.click(screen.getByTitle('Edit'));
    await waitFor(() => expect(editorProps).not.toBeNull());
    expect(editorProps!.readOnly).toBeUndefined();
    expect(editorProps!.onSave).toEqual(expect.any(Function));
  });

  it('gives a head builder (103) edit controls on every script', () => {
    mockPerms = {
      ...base,
      permissions: { role: 'HEAD_BUILDER' },
      canEditAnyZone: true,
      canEditZone: () => true,
    };
    render(<ScriptsPage />);
    expect(screen.getByText('Mine')).toBeInTheDocument();
    expect(screen.getByText('Someone elses')).toBeInTheDocument();
    expect(screen.getAllByTitle('Edit')).toHaveLength(2);
    expect(screen.queryByTitle('View')).toBeNull();
  });
});
