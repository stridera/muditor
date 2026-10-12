/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { ZoneEditorHeaderActions } from '../ZoneEditorHeaderActions';

const mockAddRoom = jest.fn();
let mockCanEdit = true;

jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({ canEditZone: () => mockCanEdit }),
}));

describe('ZoneEditorHeaderActions', () => {
  beforeEach(() => {
    mockAddRoom.mockReset();
    mockCanEdit = true;
  });

  it('labels the way back to the zone page clearly', () => {
    render(<ZoneEditorHeaderActions zoneId={30} onAddRoom={mockAddRoom} />);
    const back = screen.getByRole('link', { name: /back to zone 30/i });
    expect(back).toHaveAttribute('href', '/dashboard/zones/30');
    expect(screen.queryByText(/zone details/i)).toBeNull();
  });

  it('offers zone-scoped create actions for room, mob, object and shop', () => {
    render(<ZoneEditorHeaderActions zoneId={30} onAddRoom={mockAddRoom} />);
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
    expect(mockAddRoom).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '+ Room' }));
    expect(mockAddRoom).toHaveBeenCalledTimes(1);
  });

  it('hides create actions without zone edit permission', () => {
    mockCanEdit = false;
    render(<ZoneEditorHeaderActions zoneId={30} onAddRoom={mockAddRoom} />);
    expect(screen.queryByRole('button', { name: '+ Room' })).toBeNull();
    expect(screen.queryByRole('link', { name: '+ Mob' })).toBeNull();
    expect(screen.getByRole('link', { name: /back to zone/i })).toBeVisible();
  });

  it('shows no zone actions on the world map', () => {
    render(<ZoneEditorHeaderActions zoneId={null} onAddRoom={mockAddRoom} />);
    expect(screen.queryByRole('link', { name: /back to zone/i })).toBeNull();
    expect(screen.queryByRole('button', { name: '+ Room' })).toBeNull();
    expect(screen.getByRole('link', { name: /all zones/i })).toBeVisible();
  });
});
