/** The Create Zone button is for head builders; builders would only get a Forbidden. */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ZonesPage from '../page';

let mockIsHeadBuilder = true;

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('@/hooks/use-permissions', () => ({
  usePermissions: () => ({ isHeadBuilder: mockIsHeadBuilder }),
}));
jest.mock('@/components/auth/permission-guard', () => ({
  PermissionGuard: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/components/dashboard/dual-interface', () => ({
  DualInterface: ({ adminView }: { adminView: React.ReactNode }) => adminView,
}));
jest.mock('@apollo/client', () => ({ gql: () => ({}) }));
jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    loading: false,
    error: undefined,
    refetch: jest.fn(),
    data: {
      zones: [{ id: 30, name: 'Mielikki', climate: 'TEMPERATE' }],
      roomsCount: 12,
    },
  }),
}));

describe('ZonesPage create button', () => {
  it('shows Create Zone to head builders', () => {
    mockIsHeadBuilder = true;
    render(<ZonesPage />);
    expect(screen.getByRole('link', { name: 'Create Zone' })).toHaveAttribute(
      'href',
      '/dashboard/zones/new'
    );
  });

  it('hides Create Zone from builders', () => {
    mockIsHeadBuilder = false;
    render(<ZonesPage />);
    expect(
      screen.queryByRole('link', { name: 'Create Zone' })
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Mielikki/)).toBeInTheDocument();
  });
});
