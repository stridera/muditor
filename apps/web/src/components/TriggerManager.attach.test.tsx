/**
 * Attach Existing dialog: one row per (zone, id) trigger even when ids repeat
 * across zones, a bounded list, and the dialog closes after a successful attach.
 */
import '@testing-library/jest-dom';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import TriggerManager from './TriggerManager';

const mockAttach = jest.fn().mockResolvedValue({ data: {} });
const mockRefetch = jest.fn();

jest.mock('./ScriptEditor', () => ({ __esModule: true, default: () => null }));
jest.mock('sonner', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));
jest.mock('@apollo/client', () => ({
  gql: (strings: TemplateStringsArray) => ({ src: strings.join('') }),
}));

// 250 world triggers: ids 1..125 exist in both zone 10 and zone 20.
const trigger = (zoneId: number, id: number) => ({
  id,
  zoneId,
  name: `Trigger ${zoneId}:${id}`,
  attachType: 'WORLD',
  numArgs: 0,
  argList: [],
  commands: `-- ${'very long line '.repeat(80)}`,
  createdAt: '',
  updatedAt: '',
});
const all = Array.from({ length: 125 }, (_, i) => [
  trigger(10, i + 1),
  trigger(20, i + 1),
]).flat();

jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: { src: string }) =>
    doc.src.includes('GetTriggersByAttachmentInline')
      ? {
          loading: false,
          data: { triggersByAttachment: [trigger(10, 1)] },
          refetch: mockRefetch,
        }
      : { loading: false, data: { triggers: all }, refetch: mockRefetch },
  useMutation: (doc: { src: string }) => [
    doc.src.includes('AttachTriggerInline') ? mockAttach : jest.fn(),
  ],
}));

function open() {
  render(
    <TriggerManager
      entityType='WORLD'
      entityZoneId={30}
      entityId={1}
      entityName='a room'
    />
  );
  fireEvent.click(screen.getByRole('button', { name: /attach existing/i }));
}

describe('TriggerManager attach dialog', () => {
  let errorSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => errorSpy.mockRestore());

  it('renders unique keys for ids shared between zones and caps the list', () => {
    open();
    const buttons = screen.getAllByRole('button', { name: 'Attach' });
    expect(buttons).toHaveLength(100);
    expect(screen.getByText(/Showing 100 of 249/)).toBeInTheDocument();
    // Zone 10 / id 1 is attached already; zone 20 / id 1 is not.
    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.queryByText('Trigger 10:1')).not.toBeInTheDocument();
    fireEvent.change(dialog.getByPlaceholderText('Search triggers...'), {
      target: { value: 'Trigger 20:1' },
    });
    expect(dialog.getAllByText('Trigger 20:1')).toHaveLength(1);
    const keyErrors = errorSpy.mock.calls.filter(c =>
      String(c[0]).includes('same key')
    );
    expect(keyErrors).toHaveLength(0);
  });

  it('keeps long rows inside the dialog and shrinkable', () => {
    open();
    const list = screen
      .getAllByRole('button', { name: 'Attach' })[0]!
      .closest('.overflow-y-auto') as HTMLElement;
    expect(list).toHaveClass('min-w-0');
    expect(
      within(screen.getByRole('dialog')).getAllByText(/very long line/)[0]
    ).toHaveClass('truncate');
  });

  it('attaches with the trigger zone and closes the dialog', async () => {
    open();
    fireEvent.click(screen.getAllByRole('button', { name: 'Attach' })[0]!);
    await waitFor(() => expect(mockAttach).toHaveBeenCalledTimes(1));
    expect(mockAttach.mock.calls[0]![0].variables.input).toMatchObject({
      triggerZoneId: 20,
      triggerId: 1,
      attachType: 'WORLD',
    });
    await waitFor(() =>
      expect(screen.queryByText('Attach Trigger')).not.toBeInTheDocument()
    );
  });
});
