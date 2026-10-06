'use client';

import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';

import {
  AccountLockStatusDocument,
  ApproveGameLoginDocument,
  ClearAccountLockDocument,
  DenyGameLoginDocument,
  GameLoginCodeDocument,
  GamePasswordStatusDocument,
  SetGamePasswordDocument,
} from '@/generated/graphql';

export function useGameLoginLookup() {
  const [lookup, { data, loading, error }] = useLazyQuery(
    GameLoginCodeDocument,
    { fetchPolicy: 'network-only' }
  );
  return { lookup, request: data?.gameLoginCode ?? null, loading, error };
}

export function useApproveGameLogin() {
  return useMutation(ApproveGameLoginDocument);
}

export function useDenyGameLogin() {
  return useMutation(DenyGameLoginDocument);
}

export function useGamePasswordStatus() {
  const { data, loading, error, refetch } = useQuery(
    GamePasswordStatusDocument,
    { fetchPolicy: 'network-only' }
  );
  return { statuses: data?.gamePasswordStatus ?? [], loading, error, refetch };
}

export function useSetGamePassword() {
  return useMutation(SetGamePasswordDocument);
}

export function useAccountLockStatus() {
  const { data, loading, error, refetch } = useQuery(
    AccountLockStatusDocument,
    { fetchPolicy: 'network-only' }
  );
  return { lock: data?.accountLockStatus ?? null, loading, error, refetch };
}

export function useClearAccountLock() {
  return useMutation(ClearAccountLockDocument);
}
