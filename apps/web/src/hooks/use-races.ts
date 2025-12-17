'use client';

import {
  GetRacesDocument,
  type GetRacesQuery,
  type Race,
} from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';

export interface RaceOption {
  race: Race;
  name: string;
  displayName: string;
  playable: boolean;
  humanoid: boolean;
  magical: boolean;
}

export interface UseRacesResult {
  races: RaceOption[];
  loading: boolean;
  error: any;
}

export function useRaces(): UseRacesResult {
  const { data, loading, error } = useQuery<GetRacesQuery>(GetRacesDocument, {
    errorPolicy: 'all',
  });

  const races = data?.races || [];

  return {
    races,
    loading,
    error,
  };
}
