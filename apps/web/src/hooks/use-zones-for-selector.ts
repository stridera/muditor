'use client';

import { useQuery } from '@apollo/client/react';
import {
  GetZonesForSelectorDocument,
  type GetZonesForSelectorQuery,
} from '@/generated/graphql';
import { useMemo } from 'react';

export type Zone = GetZonesForSelectorQuery['zones'][number];

/**
 * Hook to fetch lightweight zone data for selectors, search, and filters.
 * Uses Apollo cache to prevent duplicate queries across components.
 *
 * @returns {Object} - zones array, loading state, and error
 */
export function useZonesForSelector() {
  const { data, loading, error } = useQuery(GetZonesForSelectorDocument, {
    fetchPolicy: 'cache-first', // Use cache to avoid repeated requests
  });

  // Memoize zones to prevent infinite re-renders
  const zones = useMemo(() => data?.zones || [], [data?.zones]);

  return { zones, loading, error };
}
