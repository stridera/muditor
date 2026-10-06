/**
 * ProtectedRoute role gate: any role at or above the required one passes.
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { USER_ROLES, type UserRole } from '@/lib/roles';
import { ProtectedRoute } from '../protected-route';

let mockUser: { role: UserRole } | null = null;

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    isAuthenticated: !!mockUser,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUser = null;
  });

  it('renders children for IMPLEMENTOR when PLAYER is required (default)', () => {
    mockUser = { role: 'IMPLEMENTOR' };
    render(
      <ProtectedRoute>
        <div>secret</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('secret')).toBeInTheDocument();
    expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
  });

  it.each(USER_ROLES)(
    'renders children for %s when PLAYER is required',
    role => {
      mockUser = { role };
      render(
        <ProtectedRoute requiredRole='PLAYER'>
          <div>secret</div>
        </ProtectedRoute>
      );
      expect(screen.getByText('secret')).toBeInTheDocument();
    }
  );

  it('treats requireRole as a minimum, not an exact match', () => {
    mockUser = { role: 'IMPLEMENTOR' };
    render(
      <ProtectedRoute requireRole={['BUILDER']}>
        <div>secret</div>
      </ProtectedRoute>
    );
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('denies a role below the requirement and shows both roles', () => {
    mockUser = { role: 'BUILDER' };
    render(
      <ProtectedRoute requiredRole='CODER'>
        <div>secret</div>
      </ProtectedRoute>
    );
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Required: CODER')).toBeInTheDocument();
    expect(screen.getByText('Your role: BUILDER')).toBeInTheDocument();
  });
});
