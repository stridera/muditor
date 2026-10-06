/**
 * usePermissions flags must be derived from the role via lib/roles:
 * isImmortal >= IMMORTAL, isBuilder >= BUILDER, isHeadBuilder >= HEAD_BUILDER,
 * isCoder >= CODER, isImplementor == IMPLEMENTOR. The mocked server payload
 * carries wrong booleans on purpose.
 */
import { renderHook } from '@testing-library/react';
import { USER_ROLES, roleAtLeast, type UserRole } from '@/lib/roles';
import { usePermissions } from '../use-permissions';

let mockRole: UserRole = 'PLAYER';

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ user: { id: 'u1', role: mockRole } }),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({
    loading: false,
    error: undefined,
    refetch: jest.fn(),
    data: {
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
    },
  }),
}));

describe('usePermissions role flags', () => {
  it.each(USER_ROLES)('%s gets the correct flag set', role => {
    mockRole = role;
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isPlayer).toBe(role === 'PLAYER');
    expect(result.current.isImmortal).toBe(roleAtLeast(role, 'IMMORTAL'));
    expect(result.current.isBuilder).toBe(roleAtLeast(role, 'BUILDER'));
    expect(result.current.isHeadBuilder).toBe(
      roleAtLeast(role, 'HEAD_BUILDER')
    );
    expect(result.current.isCoder).toBe(roleAtLeast(role, 'CODER'));
    expect(result.current.isImplementor).toBe(role === 'IMPLEMENTOR');
    expect(result.current.canEditZone(1)).toBe(roleAtLeast(role, 'BUILDER'));
  });

  it('BUILDER explicitly: immortal+builder, not coder', () => {
    mockRole = 'BUILDER';
    const { result } = renderHook(() => usePermissions());
    expect(result.current).toMatchObject({
      isImmortal: true,
      isBuilder: true,
      isHeadBuilder: false,
      isCoder: false,
      isImplementor: false,
    });
  });
});
