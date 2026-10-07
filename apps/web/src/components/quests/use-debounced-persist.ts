'use client';

import { useCallback, useEffect, useRef } from 'react';

type Patch = Record<string, unknown>;
type Send = (patch: Patch) => Promise<unknown>;

interface Pending {
  patch: Patch;
  send: Send;
  timer: ReturnType<typeof setTimeout> | null;
}

// Fields typed by hand: saving on every keystroke would flood the API (and
// responses can arrive out of order), so they wait for a pause in typing.
const TEXT_FIELDS = new Set([
  'name',
  'description',
  'playerDescription',
  'internalNote',
  'luaExpression',
  'condition',
]);

/**
 * Coalesces edits to the same record into one request.
 *
 * `persist(key, patch, send)` merges `patch` into whatever is already waiting
 * for `key`. A patch touching a free-text field is sent after `delayMs` of
 * quiet; any other patch (selects, checkboxes, pickers) flushes immediately,
 * together with pending text. Everything pending is flushed on unmount.
 */
export function useDebouncedPersist(
  onError: (error: unknown) => void,
  delayMs = 600
) {
  const pending = useRef(new Map<string, Pending>());
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const flush = useCallback(async (key: string) => {
    const entry = pending.current.get(key);
    if (!entry) return;
    if (entry.timer) clearTimeout(entry.timer);
    pending.current.delete(key);
    try {
      await entry.send(entry.patch);
    } catch (err) {
      onErrorRef.current(err);
    }
  }, []);

  const persist = useCallback(
    (key: string, patch: Patch, send: Send) => {
      const existing = pending.current.get(key);
      if (existing?.timer) clearTimeout(existing.timer);
      const entry: Pending = {
        patch: { ...(existing?.patch ?? {}), ...patch },
        send,
        timer: null,
      };
      pending.current.set(key, entry);

      const textOnly = Object.keys(patch).every(k => TEXT_FIELDS.has(k));
      if (textOnly) {
        entry.timer = setTimeout(() => void flush(key), delayMs);
      } else {
        void flush(key);
      }
    },
    [flush, delayMs]
  );

  useEffect(() => {
    const map = pending.current;
    return () => {
      for (const key of [...map.keys()]) void flush(key);
    };
  }, [flush]);

  return persist;
}
