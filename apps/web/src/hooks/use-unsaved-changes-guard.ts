'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Shared protection against losing unsaved editor changes.
 *
 * `useUnsavedChangesGuard(isDirty)` arms while `isDirty` is true and covers:
 *  - browser tab close / reload (beforeunload),
 *  - in-app link clicks (Next.js `<Link>` and plain anchors),
 *  - the browser Back button (a sentinel history entry),
 *  - programmatic navigation, when the caller routes it through
 *    `confirmUnsavedNavigation()` (sidebar, breadcrumbs, command palette),
 *  - explicit close / cancel / dialog dismiss, via the returned `confirmDiscard`.
 *
 * `useDirtyBaseline(current)` supplies `isDirty` for form state by comparing
 * against the values the editor loaded with (no false positive right after
 * load: call `setBaseline` with the same object you load into the form).
 *
 * `useEscapeToClose` closes an editor on Escape, but never while focus is in
 * Monaco (vim users press Escape constantly) or in a popup widget.
 */

export const UNSAVED_CHANGES_MESSAGE =
  'You have unsaved changes. Discard them and leave?';

interface Guard {
  message: string;
}

const activeGuards = new Set<Guard>();
const SENTINEL_KEY = '__muditorUnsavedGuard';
let listenersInstalled = false;
// Popstate events caused by our own history.back() that onPopState must skip.
let ignoredPopstates = 0;

function currentMessage(): string {
  const first = activeGuards.values().next().value as Guard | undefined;
  return first?.message ?? UNSAVED_CHANGES_MESSAGE;
}

/** True when nothing is unsaved, or the user agreed to discard it. */
export function confirmUnsavedNavigation(): boolean {
  if (activeGuards.size === 0) return true;
  return window.confirm(currentMessage());
}

/** Ask before discarding, but only when `dirty`. */
export function confirmDiscardIf(
  dirty: boolean,
  message: string = UNSAVED_CHANGES_MESSAGE
): boolean {
  return !dirty || window.confirm(message);
}

/** Whether any mounted editor currently holds unsaved changes. */
export function hasActiveUnsavedChanges(): boolean {
  return activeGuards.size > 0;
}

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (activeGuards.size === 0) return;
  event.preventDefault();
  // Legacy browsers need a returnValue to show their prompt.
  event.returnValue = '';
}

function onClickCapture(event: MouseEvent) {
  if (activeGuards.size === 0 || event.defaultPrevented) return;
  if (event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (anchor.target && anchor.target !== '_self') return;
  if (anchor.hasAttribute('download')) return;
  let url: URL;
  try {
    url = new URL(anchor.href, window.location.href);
  } catch {
    return;
  }
  // Other origins unload the page: beforeunload shows the browser prompt.
  if (url.origin !== window.location.origin) return;
  // In-page anchors do not leave the editor.
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  ) {
    return;
  }
  if (!confirmUnsavedNavigation()) {
    event.preventDefault();
    event.stopPropagation();
  }
}

function pushSentinel() {
  const state = (window.history.state ?? {}) as Record<string, unknown>;
  window.history.pushState(
    { ...state, [SENTINEL_KEY]: true },
    '',
    window.location.href
  );
}

function onPopState() {
  if (ignoredPopstates > 0) {
    ignoredPopstates -= 1;
    return;
  }
  if (activeGuards.size === 0) return;
  // The user pressed Back from the sentinel entry onto the editor's own entry.
  if (window.confirm(currentMessage())) {
    // Carry on leaving: step back past the editor's entry as well.
    ignoredPopstates += 1;
    window.history.back();
  } else {
    pushSentinel();
  }
}

function syncListeners() {
  if (activeGuards.size > 0 && !listenersInstalled) {
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClickCapture, true);
    window.addEventListener('popstate', onPopState);
    ignoredPopstates = 0;
    pushSentinel();
    listenersInstalled = true;
  } else if (activeGuards.size === 0 && listenersInstalled) {
    window.removeEventListener('beforeunload', onBeforeUnload);
    document.removeEventListener('click', onClickCapture, true);
    window.removeEventListener('popstate', onPopState);
    listenersInstalled = false;
  }
}

/** Drop our sentinel entry again when the editor is closed in place. */
function popSentinelIfOnTop() {
  const state = window.history.state as Record<string, unknown> | null;
  // No listener is installed any more, so this popstate goes unnoticed.
  if (state?.[SENTINEL_KEY]) window.history.back();
}

export interface UnsavedChangesGuard {
  /** True when it is safe to discard: nothing is dirty, or the user agreed. */
  confirmDiscard: () => boolean;
  /**
   * Stop guarding (call right before a deliberate leave, e.g. the redirect
   * after a successful save, which would otherwise trigger the prompt).
   */
  disarm: () => void;
  /** Wrap a close / cancel handler so it asks first when dirty. */
  guard: <A extends unknown[]>(
    action: (...args: A) => void
  ) => (...args: A) => void;
}

export function useUnsavedChangesGuard(
  isDirty: boolean,
  message: string = UNSAVED_CHANGES_MESSAGE
): UnsavedChangesGuard {
  const [disarmed, setDisarmed] = useState(false);
  const armed = isDirty && !disarmed;
  const dirtyRef = useRef(armed);
  dirtyRef.current = armed;
  const messageRef = useRef(message);
  messageRef.current = message;
  const unmountingRef = useRef(false);
  // A disarm only covers the leave it was issued for: once the editor is clean
  // again (e.g. the same page reloaded with another record) guarding resumes.
  useEffect(() => {
    if (!isDirty) setDisarmed(false);
  }, [isDirty]);
  const entryRef = useRef<Guard | null>(null);

  // Declared first so its cleanup runs first on unmount.
  useEffect(() => {
    unmountingRef.current = false;
    return () => {
      unmountingRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!armed) return;
    const entry: Guard = {
      get message() {
        return messageRef.current;
      },
    };
    entryRef.current = entry;
    activeGuards.add(entry);
    syncListeners();
    return () => {
      entryRef.current = null;
      activeGuards.delete(entry);
      const wasInstalled = listenersInstalled;
      syncListeners();
      // Closed in place (not navigating away): remove the sentinel entry.
      if (wasInstalled && !listenersInstalled && !unmountingRef.current) {
        popSentinelIfOnTop();
      }
    };
  }, [armed]);

  const confirmDiscard = useCallback(() => {
    if (!dirtyRef.current) return true;
    return window.confirm(messageRef.current);
  }, []);

  const disarm = useCallback(() => {
    // Synchronous: a redirect issued right after must not see the guard.
    dirtyRef.current = false;
    if (entryRef.current) {
      activeGuards.delete(entryRef.current);
      syncListeners();
    }
    setDisarmed(true);
  }, []);

  const guard = useCallback(
    <A extends unknown[]>(action: (...args: A) => void) =>
      (...args: A) => {
        if (confirmDiscard()) action(...args);
      },
    [confirmDiscard]
  );

  return useMemo(
    () => ({ confirmDiscard, disarm, guard }),
    [confirmDiscard, disarm, guard]
  );
}

/**
 * Renderless form of `useUnsavedChangesGuard` for components that cannot call
 * a hook at that point (e.g. after an early return).
 */
export function UnsavedChangesGuard({
  dirty,
  message,
}: {
  dirty: boolean;
  message?: string;
}): null {
  useUnsavedChangesGuard(dirty, message);
  return null;
}

/** Structural equality for plain form state (objects, arrays, primitives). */
export function isEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null
  ) {
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object);
  const kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  return ka.every(
    key =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      isEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
  );
}

/**
 * Dirty flag for form state: `current` differs from the baseline. The baseline
 * starts as the first value seen; call `setBaseline(loaded)` alongside the
 * `setForm(loaded)` that applies server data, and again after a save that
 * keeps the editor open.
 */
export function useDirtyBaseline<T>(current: T): {
  isDirty: boolean;
  setBaseline: (value: T) => void;
} {
  const [baseline, setBaselineState] = useState<T>(current);
  const isDirty = useMemo(
    () => !isEqual(current, baseline),
    [current, baseline]
  );
  const setBaseline = useCallback((value: T) => setBaselineState(value), []);
  return { isDirty, setBaseline };
}

/**
 * Dirty flag for a dialog whose form is filled in by the handler that opens it:
 * the form is snapshotted on the render where `open` turns true, and dirty
 * means it has changed since.
 */
export function useDirtyWhileOpen<T>(open: boolean, form: T): boolean {
  const [snapshot, setSnapshot] = useState<{ form: T } | null>(null);
  // Render-phase updates of our own state are the supported "derive from
  // props" pattern; they re-render immediately without an effect flash.
  if (open && snapshot === null) setSnapshot({ form });
  if (!open && snapshot !== null) setSnapshot(null);
  return open && snapshot !== null && !isEqual(form, snapshot.form);
}

/**
 * Guard for a dialog editor. Returns an `onOpenChange` to hand to the dialog
 * (and to its Cancel button): dismissing a dirty dialog (Escape, overlay,
 * close button, Cancel) asks before discarding. Closing the dialog yourself
 * after a successful save needs no confirmation.
 */
export function useGuardedDialog<T>(
  open: boolean,
  form: T,
  onOpenChange: (open: boolean) => void,
  message: string = UNSAVED_CHANGES_MESSAGE
): (open: boolean) => void {
  const dirty = useDirtyWhileOpen(open, form);
  const { confirmDiscard } = useUnsavedChangesGuard(dirty, message);
  return useCallback(
    (next: boolean) => {
      if (!next && !confirmDiscard()) return;
      onOpenChange(next);
    },
    [confirmDiscard, onOpenChange]
  );
}

/** True when an Escape press belongs to Monaco or a popup, not the editor. */
function escapeBelongsToWidget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return (
    target.closest(
      '.monaco-editor, .monaco-diff-editor, [role="listbox"], [role="menu"], [role="combobox"][aria-expanded="true"]'
    ) !== null
  );
}

/**
 * Run `onEscape` when Escape is pressed outside Monaco and popups. Pass a
 * guarded handler so unsaved changes still ask first.
 */
export function useEscapeToClose(onEscape: () => void, enabled = true) {
  const handlerRef = useRef(onEscape);
  handlerRef.current = onEscape;
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return;
      if (escapeBelongsToWidget(e.target)) return;
      handlerRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
