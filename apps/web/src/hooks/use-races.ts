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
  /** Per-attribute caps (Races.max_*); the game clamps creation stats to these. */
  maxStrength: number;
  maxIntelligence: number;
  maxWisdom: number;
  maxDexterity: number;
  maxConstitution: number;
  maxCharisma: number;
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
    maxStrength: r.maxStrength,
    maxIntelligence: r.maxIntelligence,
    maxWisdom: r.maxWisdom,
    maxDexterity: r.maxDexterity,
    maxConstitution: r.maxConstitution,
    maxCharisma: r.maxCharisma,
  }));

  return {
    races,
    loading,
    error,
  };
}
