/**
 * A non-numeric id segment (e.g. "new") must never reach the API as a null
 * `$id: Int!`; the page shows "Zone not found" instead.
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ZoneDetailPage from '../page';

let mockParams: Record<string, string> = { id: 'new' };

jest.mock('next/navigation', () => ({
  useParams: () => mockParams,
}));

const mockSetSelectedZone = jest.fn();
jest.mock('@/contexts/zone-context', () => ({
  useZone: () => ({
    selectedZone: null,
    setSelectedZone: mockSetSelectedZone,
  }),
}));

jest.mock('@/components/auth/permission-guard', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/components/zones/edit-zone-modal', () => ({
  EditZoneModal: () => null,
}));

describe('ZoneDetailPage with a bad id', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
    mockSetSelectedZone.mockReset();
  });

  it.each(['new', 'abc', '12abc'])(
    'shows "Zone not found" and sends no request for id %s',
    id => {
      mockParams = { id };
      render(<ZoneDetailPage />);
      expect(screen.getByText('Error loading zone')).toBeVisible();
      expect(screen.getByText('Zone not found')).toBeVisible();
      expect(screen.getByText('← Back to zones')).toBeVisible();
      expect(global.fetch).not.toHaveBeenCalled();
    }
  );

  it('does not remember a zone for a bad id', () => {
    mockParams = { id: 'new' };
    render(<ZoneDetailPage />);
    expect(mockSetSelectedZone).not.toHaveBeenCalled();
  });

  it('remembers the zone it opens so the sidebar links carry it', () => {
    mockParams = { id: '30' };
    (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {}));
    render(<ZoneDetailPage />);
    expect(mockSetSelectedZone).toHaveBeenCalledWith(30);
  });
});
