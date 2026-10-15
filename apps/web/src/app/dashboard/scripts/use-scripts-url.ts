'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * URL state for the Scripts section, so browser Back/Forward, reload and deep
 * links work:
 *
 *   /dashboard/scripts                       trigger list
 *   /dashboard/scripts?q=&type=&status=&sort=&dir=   list filters / sort
 *   /dashboard/scripts?trigger=30:5          trigger 5 of zone 30 open
 *   /dashboard/scripts?new=1                 new trigger
 *   /dashboard/scripts?tab=libraries         library list (q= filters it)
 *   /dashboard/scripts?tab=libraries&library=wand-quest   library open
 *   /dashboard/scripts?tab=libraries&new=1   new library
 *
 * `history: 'push'` (default) adds a history entry: use it for navigation
 * (opening a script, switching tab, changing a select). `'replace'` rewrites
 * the current entry: use it for typing in a filter and for housekeeping.
 */
export type ScriptsHistoryMode = 'push' | 'replace';

export type ScriptsUrlUpdates = Record<
  string,
  string | number | null | undefined
>;

export interface ScriptsUrl {
  /** Read a URL param. */
  get: (key: string) => string | null;
  /**
   * Merge params into the URL (null / undefined / '' removes one). With
   * `reset: true` every param not listed is dropped first, except `zone`
   * (the shared zone selection).
   */
  update: (
    updates: ScriptsUrlUpdates,
    options?: { history?: ScriptsHistoryMode; reset?: boolean }
  ) => void;
}

export function useScriptsUrl(): ScriptsUrl {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  // The query string we have asked the router for but may not have rendered
  // yet, so several updates in one tick compose instead of overwriting.
  const pendingRef = useRef(search);
  const lastSeenRef = useRef(search);
  if (lastSeenRef.current !== search) {
    lastSeenRef.current = search;
    pendingRef.current = search;
  }

  const get = useCallback(
    (key: string) => searchParams.get(key),
    [searchParams]
  );

  const update = useCallback<ScriptsUrl['update']>(
    (updates, options) => {
      const { history = 'push', reset = false } = options ?? {};
      const params = new URLSearchParams(pendingRef.current);
      if (reset) {
        for (const key of Array.from(params.keys())) {
          if (key !== 'zone') params.delete(key);
        }
      }
      for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === '') params.delete(key);
        else params.set(key, String(value));
      }
      const qs = params.toString();
      if (qs === pendingRef.current) return;
      pendingRef.current = qs;
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (history === 'replace') router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [router, pathname]
  );

  return useMemo(() => ({ get, update }), [get, update]);
}

/** Parse the `trigger=<zone>:<id>` param. */
export function parseTriggerParam(
  value: string | null
): { zoneId: number; id: number } | null {
  const match = /^(\d+):(\d+)$/.exec(value ?? '');
  if (!match) return null;
  const zoneId = Number(match[1]);
  const id = Number(match[2]);
  if (!Number.isSafeInteger(zoneId) || !Number.isSafeInteger(id)) return null;
  return { zoneId, id };
}

export function triggerParam(zoneId: number, id: number): string {
  return `${zoneId}:${id}`;
}

/**
 * A text filter mirrored into the URL. Typing updates the input immediately
 * and the URL (replace, debounced) shortly after; a URL change from outside
 * (Back / Forward, a link) is copied into the input.
 */
export function useUrlTextFilter(
  url: ScriptsUrl,
  key: string,
  delayMs = 250
): [string, (value: string) => void] {
  const urlValue = url.get(key) ?? '';
  const [text, setText] = useState(urlValue);
  // The value most recently known to be in sync between input and URL.
  const syncedRef = useRef(urlValue);
  const updateRef = useRef(url.update);
  updateRef.current = url.update;

  useEffect(() => {
    if (urlValue !== syncedRef.current) {
      syncedRef.current = urlValue;
      setText(urlValue);
    }
  }, [urlValue]);

  useEffect(() => {
    if (text === syncedRef.current) return;
    const timer = setTimeout(() => {
      syncedRef.current = text;
      updateRef.current({ [key]: text }, { history: 'replace' });
    }, delayMs);
    return () => clearTimeout(timer);
  }, [text, key, delayMs]);

  return [text, setText];
}
