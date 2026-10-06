'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';

import {
  PublicHelpByKeywordDocument,
  PublicHelpCategoriesDocument,
  PublicHelpEntryByIdDocument,
  PublicHelpEntriesDocument,
  PublicSearchHelpDocument,
} from '@/generated/graphql';

export const HELP_SEARCH_MIN_CHARS = 2;

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function useHelpCategories() {
  const { data } = useQuery(PublicHelpCategoriesDocument);
  return data?.helpCategories ?? [];
}

/** Lists entries, or searches when `search` has at least 2 characters. */
export function usePublicHelpList(search: string, category: string | null) {
  const searching = search.trim().length >= HELP_SEARCH_MIN_CHARS;
  const filter = category ? { category } : {};

  const list = useQuery(PublicHelpEntriesDocument, {
    variables: { filter },
    skip: searching,
  });
  const found = useQuery(PublicSearchHelpDocument, {
    variables: { query: search.trim(), filter },
    skip: !searching,
  });

  const active = searching ? found : list;
  const entries = searching
    ? (found.data?.searchHelp ?? [])
    : (list.data?.helpEntries ?? []);

  return {
    searching,
    entries,
    loading: active.loading,
    error: active.error,
    refetch: () => void active.refetch(),
  };
}

/** Looks up one entry by id when given, otherwise by keyword. */
export function usePublicHelpEntry(keyword: string, id?: string) {
  const byId = useQuery(PublicHelpEntryByIdDocument, {
    variables: { id: id ?? '' },
    skip: !id,
  });
  const byKeyword = useQuery(PublicHelpByKeywordDocument, {
    variables: { keyword },
    skip: !!id,
  });
  const active = id ? byId : byKeyword;
  const entry = id
    ? (byId.data?.helpEntry ?? null)
    : (byKeyword.data?.helpByKeyword ?? null);
  return {
    entry,
    loading: active.loading,
    error: active.error,
    refetch: () => void active.refetch(),
  };
}
