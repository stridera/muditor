import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as api from '@/lib/reset-api';
import { RoomExtraDescriptionsEditor } from './RoomExtraDescriptionsEditor';

jest.mock('@/lib/reset-api', () => ({
  ...jest.requireActual('@/lib/reset-api'),
  loadRoomExtraDescriptions: jest.fn(),
  saveRoomExtraDescriptions: jest.fn(),
}));
const m = api as unknown as Record<string, jest.Mock>;

beforeEach(() => {
  jest.resetAllMocks();
  m.loadRoomExtraDescriptions!.mockResolvedValue([
    { keywords: ['mural', 'painting'], description: 'A faded mural.' },
  ]);
});

describe('RoomExtraDescriptionsEditor', () => {
  it('loads the room extra descriptions', async () => {
    render(<RoomExtraDescriptionsEditor zoneId={30} roomId={4} canEdit />);
    expect(m.loadRoomExtraDescriptions).toHaveBeenCalledWith(30, 4);
    expect(
      await screen.findByLabelText('Extra description 1 keywords')
    ).toHaveValue('mural, painting');
    expect(screen.getByLabelText('Extra description 1 text')).toHaveValue(
      'A faded mural.'
    );
  });

  it('adds, edits and saves the whole list', async () => {
    m.saveRoomExtraDescriptions!.mockResolvedValue([
      { keywords: ['mural'], description: 'Faded.' },
      { keywords: ['altar', 'stone'], description: 'Cold stone.' },
    ]);
    render(<RoomExtraDescriptionsEditor zoneId={30} roomId={4} canEdit />);
    await screen.findByLabelText('Extra description 1 keywords');
    const save = screen.getByText('Save extra descriptions');
    expect(save).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Extra description 1 keywords'), {
      target: { value: 'mural' },
    });
    fireEvent.change(screen.getByLabelText('Extra description 1 text'), {
      target: { value: 'Faded.' },
    });
    fireEvent.click(screen.getByText('Add extra description'));
    fireEvent.change(screen.getByLabelText('Extra description 2 keywords'), {
      target: { value: 'altar, stone' },
    });
    fireEvent.change(screen.getByLabelText('Extra description 2 text'), {
      target: { value: 'Cold stone.' },
    });
    fireEvent.click(save);
    await waitFor(() =>
      expect(m.saveRoomExtraDescriptions).toHaveBeenCalledWith(30, 4, [
        { keywords: ['mural'], description: 'Faded.' },
        { keywords: ['altar', 'stone'], description: 'Cold stone.' },
      ])
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Saved');
  });

  it('removes an entry', async () => {
    m.saveRoomExtraDescriptions!.mockResolvedValue([]);
    render(<RoomExtraDescriptionsEditor zoneId={30} roomId={4} canEdit />);
    fireEvent.click(await screen.findByLabelText('Remove extra description 1'));
    fireEvent.click(screen.getByText('Save extra descriptions'));
    await waitFor(() =>
      expect(m.saveRoomExtraDescriptions).toHaveBeenCalledWith(30, 4, [])
    );
  });

  it('will not save an entry without keywords or text', async () => {
    render(<RoomExtraDescriptionsEditor zoneId={30} roomId={4} canEdit />);
    fireEvent.click(await screen.findByText('Add extra description'));
    fireEvent.click(screen.getByText('Save extra descriptions'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Extra description 2 needs at least one keyword and some text.'
    );
    expect(m.saveRoomExtraDescriptions).not.toHaveBeenCalled();
  });

  it('shows a refused save in words', async () => {
    m.saveRoomExtraDescriptions!.mockRejectedValue(
      new Error('Forbidden resource')
    );
    render(<RoomExtraDescriptionsEditor zoneId={990} roomId={4} canEdit />);
    fireEvent.change(await screen.findByLabelText('Extra description 1 text'), {
      target: { value: 'New text' },
    });
    fireEvent.click(screen.getByText('Save extra descriptions'));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'You do not have write access to zone 990.'
    );
  });

  it('is read-only without write access', async () => {
    render(
      <RoomExtraDescriptionsEditor zoneId={30} roomId={4} canEdit={false} />
    );
    expect(
      await screen.findByLabelText('Extra description 1 text')
    ).toBeDisabled();
    expect(screen.queryByText('Add extra description')).toBeNull();
    expect(screen.queryByText('Save extra descriptions')).toBeNull();
  });
});
