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

  const races: RaceOption[] = (data?.races || []).map(r => ({
    race: r.race,
    name: r.name,
    displayName: r.plainName,
    playable: r.playable,
    humanoid: r.humanoid,
    magical: r.magical,
  }));

  return {
    races,
    loading,
    error,
  };
}
