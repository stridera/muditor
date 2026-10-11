/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ZoneEditorHeaderActions } from '../ZoneEditorHeaderActions';

const mockPush = jest.fn();
let mockCanEdit = true;
let mockDialogProps: Record<string, unknown> | null = null;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));
jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({ canEditZone: () => mockCanEdit }),
}));
jest.mock('@/components/rooms/CreateRoomDialog', () => ({
  CreateRoomDialog: (props: Record<string, unknown>) => {
    mockDialogProps = props;
    return props.open ? <div data-testid='room-dialog' /> : null;
  },
}));

describe('ZoneEditorHeaderActions', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockCanEdit = true;
    mockDialogProps = null;
  });

  it('labels the way back to the zone page clearly', () => {
    render(<ZoneEditorHeaderActions zoneId={30} />);
    const back = screen.getByRole('link', { name: /back to zone 30/i });
    expect(back).toHaveAttribute('href', '/dashboard/zones/30');
    expect(screen.queryByText(/zone details/i)).toBeNull();
  });

  it('offers zone-scoped create actions for room, mob, object and shop', () => {
    render(<ZoneEditorHeaderActions zoneId={30} />);
    expect(screen.getByRole('link', { name: '+ Mob' })).toHaveAttribute(
      'href',
      '/dashboard/mobs/editor?zone=30'
    );
    expect(screen.getByRole('link', { name: '+ Object' })).toHaveAttribute(
      'href',
      '/dashboard/objects/editor?zone=30'
    );
    expect(screen.getByRole('link', { name: '+ Shop' })).toHaveAttribute(
      'href',
      '/dashboard/shops/editor?zone=30'
    );
    expect(screen.queryByTestId('room-dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '+ Room' }));
    expect(screen.getByTestId('room-dialog')).toBeInTheDocument();
    expect(mockDialogProps).toMatchObject({ zoneId: 30, lockZone: true });
  });

  it('opens the created room in the editor', () => {
    render(<ZoneEditorHeaderActions zoneId={30} />);
    (mockDialogProps!.onCreated as (r: { zoneId: number; id: number }) => void)(
      { zoneId: 30, id: 7 }
    );
    expect(mockPush).toHaveBeenCalledWith(
      '/dashboard/zones/editor?zone=30&room=7'
    );
  });

  it('hides create actions without zone edit permission', () => {
    mockCanEdit = false;
    render(<ZoneEditorHeaderActions zoneId={30} />);
    expect(screen.queryByRole('button', { name: '+ Room' })).toBeNull();
    expect(screen.queryByRole('link', { name: '+ Mob' })).toBeNull();
    expect(screen.getByRole('link', { name: /back to zone/i })).toBeVisible();
  });

  it('shows no zone actions on the world map', () => {
    render(<ZoneEditorHeaderActions zoneId={null} />);
    expect(screen.queryByRole('link', { name: /back to zone/i })).toBeNull();
    expect(screen.queryByRole('button', { name: '+ Room' })).toBeNull();
    expect(screen.getByRole('link', { name: /all zones/i })).toBeVisible();
  });
});
