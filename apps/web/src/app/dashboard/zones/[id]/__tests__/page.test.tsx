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

jest.mock('@/components/auth/permission-guard', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/components/zones/edit-zone-modal', () => ({
  EditZoneModal: () => null,
}));

describe('ZoneDetailPage with a bad id', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockReset();
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
});
