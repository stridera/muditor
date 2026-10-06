'use client';

import { useQuery } from '@apollo/client/react';

import {
  PublicClassCirclesDocument,
  PublicClassesDocument,
  PublicClassSkillsDocument,
  PublicHelpByKeywordDocument,
  PublicRaceDocument,
  PublicRaceSkillsDocument,
  PublicRacesDocument,
  type Race,
} from '@/generated/graphql';

export function usePublicRaces() {
  const { data, loading, error, refetch } = useQuery(PublicRacesDocument);
  const races = (data?.races ?? []).filter(r => r.playable);
  return { races, loading, error, refetch };
}

export function usePublicRace(race: Race) {
  const { data, loading, error, refetch } = useQuery(PublicRaceDocument, {
    variables: { race },
  });
  return { race: data?.race ?? null, loading, error, refetch };
}

export function usePublicClasses() {
  const { data, loading, error, refetch } = useQuery(PublicClassesDocument);
  return { classes: data?.classes ?? [], loading, error, refetch };
}

/** Optional lore/guide help entry for a race or class; errors are ignored. */
export function useHelpGuide(keyword: string) {
  const { data } = useQuery(PublicHelpByKeywordDocument, {
    variables: { keyword },
    errorPolicy: 'ignore',
  });
  return data?.helpByKeyword ?? null;
}

export function usePublicClassSkills(classId: number) {
  const { data, loading, error, refetch } = useQuery(
    PublicClassSkillsDocument,
    { variables: { classId } }
  );
  return { skills: data?.classSkills ?? [], loading, error, refetch };
}

export function usePublicClassCircles(classId: number) {
  const { data, loading, error, refetch } = useQuery(
    PublicClassCirclesDocument,
    { variables: { classId } }
  );
  return { circles: data?.classCirclesList ?? [], loading, error, refetch };
}

export function usePublicRaceSkills(race: Race) {
  const { data, loading, error, refetch } = useQuery(PublicRaceSkillsDocument, {
    variables: { race },
  });
  return { skills: data?.raceSkills ?? [], loading, error, refetch };
}
