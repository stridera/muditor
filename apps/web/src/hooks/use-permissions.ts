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

  const canEditZone = (_zoneId?: number): boolean => {
    if (!permissions) return false;
    return isBuilder;
  };

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
    canManageCharacters,
    isPlayer,
    isImmortal,
    isBuilder,
    isHeadBuilder,
    isCoder,
    isImplementor,
  };
}
