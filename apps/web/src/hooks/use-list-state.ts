'use client';

import type { SearchFilters } from '@/components/EnhancedSearch';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** localStorage key remembering the last zone used on a list page. */
export const LAST_ZONE_KEY = 'muditor:lastZone';
/** sessionStorage key prefix remembering a list page's last query string. */
export const LIST_QUERY_KEY_PREFIX = 'muditor:listQuery:';

function parseZone(value: string | null | undefined): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function readLastZone(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseZone(window.localStorage.getItem(LAST_ZONE_KEY));
  } catch {
    return null;
  }
}

/** Serialize EnhancedSearch filters into URL params (q, lmin, lmax, types, f.<key>). */
export function searchFiltersToParams(
  filters: SearchFilters
): Record<string, string | null> {
  const out: Record<string, string | null> = {
    q: filters.searchTerm || null,
    lmin: filters.levelMin != null ? String(filters.levelMin) : null,
    lmax: filters.levelMax != null ? String(filters.levelMax) : null,
    types:
      filters.types && filters.types.length ? filters.types.join(',') : null,
  };
  for (const [key, value] of Object.entries(filters.customFilters ?? {})) {
    out[`f.${key}`] =
      value === undefined || value === '' || value === false
        ? null
        : String(value);
  }
  return out;
}

/** Inverse of searchFiltersToParams. */
export function searchFiltersFromParams(
  params: URLSearchParams
): SearchFilters {
  const filters: SearchFilters = { searchTerm: params.get('q') ?? '' };
  const lmin = parseInt(params.get('lmin') ?? '', 10);
  const lmax = parseInt(params.get('lmax') ?? '', 10);
  if (!Number.isNaN(lmin)) filters.levelMin = lmin;
  if (!Number.isNaN(lmax)) filters.levelMax = lmax;
  const types = params.get('types');
  if (types) filters.types = types.split(',').filter(Boolean);
  const custom: Record<string, string | boolean> = {};
  params.forEach((value, key) => {
    if (key.startsWith('f.')) {
      custom[key.slice(2)] = value === 'true' ? true : value;
    }
  });
  if (Object.keys(custom).length) filters.customFilters = custom;
  return filters;
}

export interface ListState {
  /** Effective zone filter: URL `?zone=` first, else the remembered last zone. */
  zone: number | null;
  /** Select a zone (null = all zones, which also forgets the remembered zone). */
  setZone: (zone: number | null) => void;
  /** 1-based page from `?page=`. */
  page: number;
  setPage: (page: number) => void;
  /** Read any URL param. */
  get: (key: string) => string | null;
  /**
   * Merge URL params (null/undefined removes). Resets `page` unless the
   * update itself sets it. Uses router.replace so typing does not spam history.
   */
  set: (updates: Record<string, string | number | null | undefined>) => void;
  /** EnhancedSearch filters decoded from the URL. */
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
}

/**
 * Shared state for list pages (rooms, mobs, objects, shops, quests). The zone
 * filter, search text, filters, sort and page live in the URL so deep links
 * and back-navigation keep them. A fresh visit without `?zone=` re-selects the
 * last zone remembered in localStorage (`muditor:lastZone`).
 */
export function useListState(): ListState {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const urlZone = parseZone(searchParams.get('zone'));
  // The query string we have asked the router for but may not have rendered yet,
  // so several set() calls in one tick compose instead of overwriting.
  const pendingRef = useRef(search);
  const lastSeenRef = useRef(search);
  if (lastSeenRef.current !== search) {
    lastSeenRef.current = search;
    pendingRef.current = search;
  }

  const navigate = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      if (qs === pendingRef.current) return;
      pendingRef.current = qs;
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  // No ?zone= (fresh visit, or a sidebar link to the bare list path): re-select
  // the last zone (replace, no history entry). Clearing the zone forgets it, so
  // an explicit "all zones" is not undone.
  useEffect(() => {
    if (urlZone != null) return;
    const stored = readLastZone();
    if (stored != null) {
      const params = new URLSearchParams(pendingRef.current);
      params.set('zone', String(stored));
      navigate(params);
    }
  }, [urlZone, navigate]);

  // Remember the URL zone and this list's query string (for "back to list" links).
  useEffect(() => {
    try {
      if (urlZone != null) {
        window.localStorage.setItem(LAST_ZONE_KEY, String(urlZone));
      }
      window.sessionStorage.setItem(LIST_QUERY_KEY_PREFIX + pathname, search);
    } catch {
      /* storage unavailable */
    }
  }, [urlZone, pathname, search]);

  // Read synchronously so the first query already uses the remembered zone.
  const zone = urlZone ?? readLastZone();

  const set = useCallback<ListState['set']>(
    updates => {
      const params = new URLSearchParams(pendingRef.current);
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === '') params.delete(key);
        else params.set(key, String(value));
      }
      if (!('page' in updates)) params.delete('page');
      else if (params.get('page') === '1') params.delete('page');
      navigate(params);
    },
    [navigate]
  );

  const setZone = useCallback<ListState['setZone']>(
    next => {
      try {
        if (next == null) window.localStorage.removeItem(LAST_ZONE_KEY);
        else window.localStorage.setItem(LAST_ZONE_KEY, String(next));
      } catch {
        /* storage unavailable */
      }
      set({ zone: next });
    },
    [set]
  );

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '', 10) || 1);
  const setPage = useCallback((p: number) => set({ page: p }), [set]);
  const get = useCallback(
    (key: string) => searchParams.get(key),
    [searchParams]
  );

  const searchFilters = useMemo(
    () => searchFiltersFromParams(new URLSearchParams(search)),
    [search]
  );
  const setSearchFilters = useCallback(
    (filters: SearchFilters) => {
      const next = searchFiltersToParams(filters);
      // Drop stale f.* params that the new filters no longer carry.
      const current = new URLSearchParams(pendingRef.current);
      current.forEach((_, key) => {
        if (key.startsWith('f.') && !(key in next)) next[key] = null;
      });
      const unchanged = Object.entries(next).every(
        ([k, v]) => (current.get(k) ?? null) === v
      );
      if (unchanged) return; // EnhancedSearch echoes its initial state on mount
      set(next);
    },
    [set]
  );

  return {
    zone,
    setZone,
    page,
    setPage,
    get,
    set,
    searchFilters,
    setSearchFilters,
  };
}

/**
 * Href back to a list page that keeps its last zone/search/page (from this
 * browser session). Without history it falls back to the plain list path,
 * which re-selects the last zone.
 */
export function useListReturnHref(listPath: string): string {
  const [href, setHref] = useState(listPath);
  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(
        LIST_QUERY_KEY_PREFIX + listPath
      );
      setHref(saved ? `${listPath}?${saved}` : listPath);
    } catch {
      setHref(listPath);
    }
  }, [listPath]);
  return href;
}
