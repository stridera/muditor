'use client';

import { useAuth } from '@/contexts/auth-context';
import { roleAtLeast, roleRank } from '@/lib/roles';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

export const MY_PERMISSIONS_QUERY = gql`
  query MyPermissions {
    myPermissions {
      isPlayer
      isImmortal
      isBuilder
      isCoder
      isImplementor
      canAccessDashboard
      canManageUsers
      canViewValidation
      maxCharacterLevel
      role
    }
  }
`;

/** The builder's own zone grants (BUILDER+; HEAD_BUILDER+ bypass grants). */
export const MY_ZONE_GRANTS_QUERY = gql`
  query MyZoneGrants {
    myZoneGrants {
      zoneId
      permissions
      expiresAt
    }
  }
`;

interface MyZoneGrant {
  zoneId: string | number;
  permissions: string[];
  expiresAt?: string | null;
}

interface MyZoneGrantsQueryResult {
  myZoneGrants: MyZoneGrant[];
}

export interface UserPermissions {
  isPlayer: boolean;
  isImmortal: boolean;
  isBuilder: boolean;
  isCoder: boolean;
  isImplementor: boolean;
  canAccessDashboard: boolean;
  canManageUsers: boolean;
  canViewValidation: boolean;
  maxCharacterLevel: number;
  role: string;
}

interface MyPermissionsQueryResult {
  myPermissions: UserPermissions;
}

export interface UsePermissionsResult {
  permissions: UserPermissions | null;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
  canEditZone: (zoneId?: number) => boolean;
  /**
   * True when the user can edit at least one zone: HEAD_BUILDER+ (every zone)
   * or a BUILDER holding a live WRITE/ADMIN zone grant. Gates the Scripts panel.
   */
  canEditAnyZone: boolean;
  /** Zone grants are still loading (canEditAnyZone/canEditZone fail closed). */
  grantsLoading: boolean;
  canManageCharacters: (characterOwnerId?: string) => boolean;
  isPlayer: boolean;
  isImmortal: boolean;
  isBuilder: boolean;
  isHeadBuilder: boolean;
  isCoder: boolean;
  isImplementor: boolean;
}

export function usePermissions(): UsePermissionsResult {
  const { user } = useAuth();
  const {
    data,
    loading,
    error,
    refetch: apolloRefetch,
  } = useQuery<MyPermissionsQueryResult>(MY_PERMISSIONS_QUERY, {
    skip: !user,
    errorPolicy: 'all',
  });

  const permissions = data?.myPermissions || null;

  // Every flag is derived from the role via lib/roles (never from the
  // server's per-role booleans, never with === on a role).
  const role = permissions?.role ?? user?.role;
  const isPlayer = !!permissions && roleRank(role) === 0;
  const isImmortal = roleAtLeast(role, 'IMMORTAL');
  const isBuilder = roleAtLeast(role, 'BUILDER');
  const isHeadBuilder = roleAtLeast(role, 'HEAD_BUILDER');
  const isCoder = roleAtLeast(role, 'CODER');
  const isImplementor = roleAtLeast(role, 'IMPLEMENTOR');

  // Mirrors the API's ZonePermissionGuard: HEAD_BUILDER+ bypass grants, a
  // BUILDER needs a live WRITE (or ADMIN) grant on the zone. Fails closed
  // while the grants are still loading.
  const { data: grantsData, loading: grantsQueryLoading } =
    useQuery<MyZoneGrantsQueryResult>(MY_ZONE_GRANTS_QUERY, {
      skip: !user || !isBuilder || isHeadBuilder,
      errorPolicy: 'all',
    });
  const grantsLoading = !!grantsQueryLoading;
  const zoneGrants = grantsData?.myZoneGrants;

  const grantAllowsWrite = (g: MyZoneGrant, now: number): boolean =>
    (!g.expiresAt || new Date(g.expiresAt).getTime() > now) &&
    (g.permissions.includes('WRITE') || g.permissions.includes('ADMIN'));

  const canEditZone = (zoneId?: number): boolean => {
    if (!permissions) return false;
    if (isHeadBuilder) return true;
    if (!isBuilder || zoneId === undefined || zoneId === null) return false;
    const now = Date.now();
    return (zoneGrants ?? []).some(
      g => Number(g.zoneId) === zoneId && grantAllowsWrite(g, now)
    );
  };

  const canEditAnyZone =
    !!permissions &&
    (isHeadBuilder ||
      (isBuilder &&
        (zoneGrants ?? []).some(g => grantAllowsWrite(g, Date.now()))));

  const canManageCharacters = (characterOwnerId?: string): boolean => {
    if (!permissions || !user) return false;
    if (characterOwnerId && user.id === characterOwnerId) return true;
    return isCoder;
  };

  const refetch = async () => {
    if (user) {
      await apolloRefetch();
    }
  };

  return {
    permissions,
    loading,
    error,
    refetch,
    canEditZone,
    canEditAnyZone,
    grantsLoading,
    canManageCharacters,
    isPlayer,
    isImmortal,
    isBuilder,
    isHeadBuilder,
    isCoder,
    isImplementor,
  };
}
