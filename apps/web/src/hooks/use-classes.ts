'use client';

import { GetClassesDocument, type GetClassesQuery } from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';

export interface ClassOption {
  id: string;
  name: string;
  description?: string | null;
  hitDice: string;
  primaryStat?: string | null;
}

export interface UseClassesResult {
  classes: ClassOption[];
  loading: boolean;
  error: any;
}

export function useClasses(): UseClassesResult {
  const { data, loading, error } = useQuery<GetClassesQuery>(
    GetClassesDocument,
    {
      errorPolicy: 'all',
    }
  );

  const classes = data?.classes || [];

  return {
    classes,
    loading,
    error,
  };
}
