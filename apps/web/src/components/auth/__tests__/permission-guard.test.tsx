/**
 * PermissionGuard role gates: requireX is a minimum rank, not an exact match.
 * The mocked server payload deliberately carries WRONG per-role booleans (all
 * false) to prove the guard derives access from `role` via lib/roles.
 */
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { USER_ROLES, roleAtLeast, type UserRole } from '@/lib/roles';
import { PermissionGuard } from '../permission-guard';

let mockRole: UserRole | null = null;

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: mockRole ? { id: 'u1', role: mockRole } : null,
    loading: false,
  }),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    loading: false,
    error: undefined,
    refetch: jest.fn(),
    data: mockRole
      ? {
          myPermissions: {
            isPlayer: false,
            isImmortal: false,
            isBuilder: false,
            isCoder: false,
            isImplementor: false,
            canAccessDashboard: false,
            canManageUsers: false,
            canViewValidation: false,
            maxCharacterLevel: 1,
            role: mockRole,
          },
        }
      : undefined,
  }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));

const renderGuard = (props: Record<string, boolean>) =>
  render(
    <PermissionGuard {...props}>
      <div>secret</div>
    </PermissionGuard>
  );

describe('PermissionGuard', () => {
  beforeEach(() => {
    mockRole = null;
  });

  it.each(['requireImmortal', 'requireBuilder'] as const)(
    '%s: every role at or above the minimum passes, PLAYER fails',
    prop => {
      const minimum: UserRole =
        prop === 'requireImmortal' ? 'IMMORTAL' : 'BUILDER';
      for (const role of USER_ROLES) {
        mockRole = role;
        const { unmount } = renderGuard({ [prop]: true });
        if (roleAtLeast(role, minimum)) {
          expect(screen.getByText('secret')).toBeInTheDocument();
        } else {
          expect(screen.queryByText('secret')).not.toBeInTheDocument();
        }
        unmount();
      }
    }
  );

  it.each(['BUILDER', 'HEAD_BUILDER', 'CODER', 'IMPLEMENTOR'] as const)(
    '%s passes requireImmortal and requireBuilder',
    role => {
      mockRole = role;
      renderGuard({ requireImmortal: true, requireBuilder: true });
      expect(screen.getByText('secret')).toBeInTheDocument();
    }
  );

  it('PLAYER fails requireImmortal and requireBuilder', () => {
    mockRole = 'PLAYER';
    renderGuard({ requireImmortal: true });
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('BUILDER is denied requireCoder; HEAD_BUILDER too; CODER passes', () => {
    mockRole = 'BUILDER';
    const a = renderGuard({ requireCoder: true });
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    a.unmount();
    mockRole = 'HEAD_BUILDER';
    const b = renderGuard({ requireCoder: true });
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    b.unmount();
    mockRole = 'CODER';
    renderGuard({ requireCoder: true });
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('requireImplementor passes only for IMPLEMENTOR', () => {
    mockRole = 'CODER';
    const a = renderGuard({ requireImplementor: true });
    expect(screen.queryByText('secret')).not.toBeInTheDocument();
    a.unmount();
    mockRole = 'IMPLEMENTOR';
    renderGuard({ requireImplementor: true });
    expect(screen.getByText('secret')).toBeInTheDocument();
  });
});
