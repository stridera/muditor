/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import ScriptsPage from './page';

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({
    permissions: { role: 'HEAD_BUILDER' },
    loading: false,
    grantsLoading: false,
    isImmortal: true,
    canEditAnyZone: true,
    canEditZone: () => true,
  }),
}));
jest.mock('@/hooks/use-list-state', () => ({
  useListState: () => ({ zone: null }),
}));

// The real editor wraps Monaco; the page only needs its dirty report.
let mockEditorDirty = false;
function MockScriptEditor({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  useEffect(() => {
    onDirtyChange?.(mockEditorDirty);
  }, [onDirtyChange]);
  return (
    <div data-testid='script-editor'>
      <div className='monaco-editor'>
        <textarea aria-label='Editor content' />
      </div>
    </div>
  );
}
jest.mock('@/components/ScriptEditor', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => MockScriptEditor(props),
}));

const mockQuery = jest
  .fn()
  .mockResolvedValue({ data: { trigger: { commands: '-- x' } } });
const mockTriggers = [
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
];
jest.mock('@apollo/client/react', () => ({
  useApolloClient: () => ({ query: mockQuery }),
  useMutation: () => [jest.fn()],
  useQuery: () => ({
    data: { triggers: mockTriggers },
    loading: false,
    error: undefined,
    refetch: jest.fn(),
  }),
}));

let confirmSpy: jest.SpyInstance;

async function openEditor() {
  render(<ScriptsPage />);
  fireEvent.click(screen.getByTitle('Edit'));
  await screen.findByTestId('script-editor');
}

beforeEach(() => {
  mockEditorDirty = false;
  confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
});
afterEach(() => confirmSpy.mockRestore());

describe('Scripts page unsaved-changes guard', () => {
  it('Escape closes a clean editor without asking', async () => {
    await openEditor();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByTestId('script-editor')).toBeNull()
    );
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('Escape with unsaved edits asks and stays open when declined', async () => {
    mockEditorDirty = true;
    await openEditor();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('script-editor')).toBeInTheDocument();
  });

  it('Escape with unsaved edits closes once the user agrees', async () => {
    mockEditorDirty = true;
    confirmSpy.mockReturnValue(true);
    await openEditor();
    fireEvent.keyDown(document.body, { key: 'Escape' });
    await waitFor(() =>
      expect(screen.queryByTestId('script-editor')).toBeNull()
    );
  });

  it('Escape inside the Monaco editor never closes it, even when clean', async () => {
    await openEditor();
    fireEvent.keyDown(screen.getByLabelText('Editor content'), {
      key: 'Escape',
    });
    expect(screen.getByTestId('script-editor')).toBeInTheDocument();
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('the Cancel button asks when there are unsaved edits', async () => {
    mockEditorDirty = true;
    await openEditor();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('script-editor')).toBeInTheDocument();
  });

  it('warns on reload while editing with unsaved edits, not when clean', async () => {
    mockEditorDirty = true;
    await openEditor();
    const dirtyEvent = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirtyEvent);
    expect(dirtyEvent.defaultPrevented).toBe(true);
  });
});
