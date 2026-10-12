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
let mockGrants: Array<{
  zoneId: string;
  permissions: string[];
  expiresAt?: string | null;
}> = [];

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ user: { id: 'u1', role: mockRole } }),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: (doc: { definitions: Array<{ name?: { value: string } }> }) => ({
    loading: false,
    error: undefined,
    refetch: jest.fn(),
    data:
      doc.definitions[0]?.name?.value === 'MyZoneGrants'
        ? { myZoneGrants: mockGrants }
        : {
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
    // A BUILDER needs a grant (none here); HEAD_BUILDER+ bypass grants.
    expect(result.current.canEditZone(1)).toBe(
      roleAtLeast(role, 'HEAD_BUILDER')
    );
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

  describe('canEditZone for a BUILDER', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const can = (zone: number) => {
      mockRole = 'BUILDER';
      const { result } = renderHook(() => usePermissions());
      return result.current.canEditZone(zone);
    };

    it('is false without a grant', () => {
      mockGrants = [];
      expect(can(990)).toBe(false);
    });

    it('is true with a WRITE or ADMIN grant on that zone only', () => {
      mockGrants = [
        { zoneId: '30', permissions: ['READ', 'WRITE'] },
        { zoneId: '31', permissions: ['ADMIN'], expiresAt: future },
        { zoneId: '32', permissions: ['READ'] },
        { zoneId: '33', permissions: ['WRITE'], expiresAt: past },
      ];
      expect(can(30)).toBe(true);
      expect(can(31)).toBe(true);
      expect(can(32)).toBe(false);
      expect(can(33)).toBe(false);
      expect(can(990)).toBe(false);
    });
  });
});
