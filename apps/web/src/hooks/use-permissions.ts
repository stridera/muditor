'use client';

import { useAuth } from '@/contexts/auth-context';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

export const MY_PERMISSIONS_QUERY = gql`
  query MyPermissions {
    myPermissions {
      isPlayer
      isImmortal
      isBuilder
      isCoder
      isGod
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
  isGod: boolean;
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
  canEditZone: (zoneId?: number) => boolean;
  canManageCharacters: (characterOwnerId?: string) => boolean;
  isPlayer: boolean;
  isImmortal: boolean;
  isBuilder: boolean;
  isCoder: boolean;
  isGod: boolean;
}

export function usePermissions(): UsePermissionsResult {
  const { user } = useAuth();
  const { data, loading, error } = useQuery<MyPermissionsQueryResult>(
    MY_PERMISSIONS_QUERY,
    {
      skip: !user,
      errorPolicy: 'all',
    }
  );

  const permissions = data?.myPermissions || null;

  // Helper functions based on backend permission logic
  const canEditZone = (zoneId?: number): boolean => {
    if (!permissions) return false;
    if (permissions.isGod) return true;
    if (permissions.isCoder) return true;
    if (permissions.isBuilder) return true;
    return false;
  };

  const canManageCharacters = (characterOwnerId?: string): boolean => {
    if (!permissions || !user) return false;
    if (permissions.isGod) return true;
    if (characterOwnerId && user.id === characterOwnerId) return true;
    if (permissions.isCoder) return true;
    return false;
  };

  return {
    permissions,
    loading,
    error,
    canEditZone,
    canManageCharacters,
    isPlayer: permissions?.isPlayer || false,
    isImmortal: permissions?.isImmortal || false,
    isBuilder: permissions?.isBuilder || false,
    isCoder: permissions?.isCoder || false,
    isGod: permissions?.isGod || false,
  };
}
