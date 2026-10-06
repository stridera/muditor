/**
 * Browser-side error reporter. Sends errors to the API's `/api/client-errors`
 * sink so everything a user sees also lands in the server log
 * (`[client-error]` lines). Never throws and never blocks the UI.
 */

export type ClientErrorKind =
  | 'window'
  | 'unhandledrejection'
  | 'react'
  | 'apollo';

export interface ClientErrorInput {
  message: string;
  stack?: string | undefined;
  kind: ClientErrorKind;
  operationName?: string | undefined;
}

/** Identical reports within this window are sent once. */
export const DEDUPE_WINDOW_MS = 60_000;
/** Client-side ceiling so a render loop cannot flood the server's rate limit. */
export const MAX_REPORTS_PER_WINDOW = 20;

const MAX_MESSAGE = 2000;
const MAX_STACK = 8000;

const recent = new Map<string, number>();
let windowStart = 0;
let sentInWindow = 0;

/** Test hook: forget dedupe/rate-limit state. */
export function resetClientErrorReporter(): void {
  recent.clear();
  windowStart = 0;
  sentInWindow = 0;
}

function endpoint(): string {
  const graphqlUrl =
    process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql';
  try {
    return new URL('/api/client-errors', graphqlUrl).toString();
  } catch {
    return '/api/client-errors';
  }
}

/** Current route without query string or hash (those can carry tokens). */
export function currentRoute(): string {
  return typeof window === 'undefined' ? '' : window.location.pathname;
}

function isIgnorable(message: string): boolean {
  // Benign browser noise that is not actionable
  return /ResizeObserver loop/i.test(message);
}

function shouldSend(key: string, now: number): boolean {
  for (const [k, at] of recent) {
    if (now - at >= DEDUPE_WINDOW_MS) recent.delete(k);
  }
  if (recent.has(key)) return false;

  if (now - windowStart >= DEDUPE_WINDOW_MS) {
    windowStart = now;
    sentInWindow = 0;
  }
  if (sentInWindow >= MAX_REPORTS_PER_WINDOW) return false;

  recent.set(key, now);
  sentInWindow += 1;
  return true;
}

export function reportClientError(input: ClientErrorInput): void {
  try {
    if (typeof window === 'undefined') return;
    const message = (input.message || 'Unknown error').slice(0, MAX_MESSAGE);
    if (isIgnorable(message)) return;

    const route = currentRoute();
    const key = `${input.kind}|${input.operationName ?? ''}|${route}|${message}`;
    if (!shouldSend(key, Date.now())) return;

    const payload = JSON.stringify({
      message,
      stack: input.stack?.slice(0, MAX_STACK),
      route,
      operationName: input.operationName,
      kind: input.kind,
      userAgent: navigator.userAgent?.slice(0, 300),
      release: process.env.NEXT_PUBLIC_RELEASE || undefined,
    });
    send(payload);
  } catch {
    // Reporting must never break the app
  }
}

function send(payload: string): void {
  const url = endpoint();
  const token = localStorage.getItem('auth-token');

  // sendBeacon cannot set an Authorization header, so signed-in users go via
  // keepalive fetch (same unload-safety) and the server can attach their id.
  if (!token && typeof navigator.sendBeacon === 'function') {
    const queued = navigator.sendBeacon(
      url,
      new Blob([payload], { type: 'application/json' })
    );
    if (queued) return;
  }

  void fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { authorization: `Bearer ${token}` }),
    },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}

let installed = false;

/** Register window error + unhandledrejection listeners exactly once. */
export function installGlobalErrorHandlers(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', event => {
    const err = event.error as Error | undefined;
    reportClientError({
      kind: 'window',
      message: err?.message || event.message || 'Unknown window error',
      stack: err?.stack,
    });
  });

  window.addEventListener('unhandledrejection', event => {
    const reason: unknown = event.reason;
    reportClientError({
      kind: 'unhandledrejection',
      message:
        reason instanceof Error
          ? reason.message
          : typeof reason === 'string'
            ? reason
            : 'Unhandled promise rejection',
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });
}
