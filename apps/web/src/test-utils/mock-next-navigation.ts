/**
 * In-memory stand-in for `next/navigation` with a real history stack, so
 * tests can drive URL-backed pages (push / replace / Back / Forward).
 *
 *   jest.mock('next/navigation', () =>
 *     jest.requireActual('@/test-utils/mock-next-navigation').nextNavigationMock
 *   );
 *   import { navigation } from '@/test-utils/mock-next-navigation';
 */
import { useMemo, useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
let entries: string[] = ['/dashboard/scripts'];
let index = 0;

function emit() {
  listeners.forEach(l => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
const getSnapshot = () => entries[index]!;

export const navigation = {
  /** Start a test at `url` with a fresh history. */
  reset(url = '/dashboard/scripts') {
    entries = [url];
    index = 0;
    emit();
  },
  get url() {
    return entries[index]!;
  },
  get entries() {
    return [...entries];
  },
  push(url: string) {
    entries = [...entries.slice(0, index + 1), resolve(url)];
    index = entries.length - 1;
    emit();
  },
  replace(url: string) {
    entries = entries.map((e, i) => (i === index ? resolve(url) : e));
    emit();
  },
  back() {
    if (index > 0) {
      index -= 1;
      emit();
    }
  },
  forward() {
    if (index < entries.length - 1) {
      index += 1;
      emit();
    }
  },
};

function resolve(url: string): string {
  // Relative "?a=b" links keep the current path, like the browser does.
  if (url.startsWith('?')) return entries[index]!.split('?')[0]! + url;
  return url;
}

const router = {
  push: (url: string) => navigation.push(url),
  replace: (url: string) => navigation.replace(url),
  back: () => navigation.back(),
  forward: () => navigation.forward(),
  refresh: () => {},
  prefetch: () => {},
};

export const nextNavigationMock = {
  useRouter: () => router,
  usePathname: () => {
    return useSyncExternalStore(subscribe, getSnapshot).split('?')[0]!;
  },
  useSearchParams: () => {
    const url = useSyncExternalStore(subscribe, getSnapshot);

    return useMemo(() => new URLSearchParams(url.split('?')[1] ?? ''), [url]);
  },
};
