/**
 * useListState keeps list-page filters in the URL (?zone=, q, page, ...) and
 * falls back to the last zone remembered in localStorage (muditor:lastZone).
 */
import { act, renderHook } from '@testing-library/react';
import {
  LAST_ZONE_KEY,
  LIST_QUERY_KEY_PREFIX,
  searchFiltersFromParams,
  searchFiltersToParams,
  useListReturnHref,
  useListState,
} from '../use-list-state';

let mockSearch = '';
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/dashboard/mobs',
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

function lastReplaceUrl(): string {
  const calls = mockReplace.mock.calls;
  return calls[calls.length - 1]![0] as string;
}

beforeEach(() => {
  mockSearch = '';
  mockReplace.mockReset();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('useListState', () => {
  it('reads zone, page and params from the URL', () => {
    mockSearch = 'zone=30&page=3&q=dragon';
    const { result } = renderHook(() => useListState());
    expect(result.current.zone).toBe(30);
    expect(result.current.page).toBe(3);
    expect(result.current.searchFilters.searchTerm).toBe('dragon');
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('remembers the URL zone in localStorage', () => {
    mockSearch = 'zone=30';
    renderHook(() => useListState());
    expect(window.localStorage.getItem(LAST_ZONE_KEY)).toBe('30');
  });

  it('re-selects the remembered zone on a fresh visit without ?zone=', () => {
    window.localStorage.setItem(LAST_ZONE_KEY, '530');
    const { result } = renderHook(() => useListState());
    expect(result.current.zone).toBe(530);
    expect(mockReplace).toHaveBeenCalledWith('/dashboard/mobs?zone=530', {
      scroll: false,
    });
  });

  it('does nothing without a URL zone or remembered zone', () => {
    const { result } = renderHook(() => useListState());
    expect(result.current.zone).toBeNull();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('setZone writes the URL, remembers the zone and resets the page', () => {
    mockSearch = 'zone=30&page=4';
    const { result } = renderHook(() => useListState());
    act(() => result.current.setZone(12));
    expect(lastReplaceUrl()).toBe('/dashboard/mobs?zone=12');
    expect(window.localStorage.getItem(LAST_ZONE_KEY)).toBe('12');
  });

  it('setZone(null) clears the URL param and forgets the zone', () => {
    mockSearch = 'zone=30&q=orc';
    const { result } = renderHook(() => useListState());
    act(() => result.current.setZone(null));
    expect(lastReplaceUrl()).toBe('/dashboard/mobs?q=orc');
    expect(window.localStorage.getItem(LAST_ZONE_KEY)).toBeNull();
  });

  it('composes several updates made in the same tick', () => {
    mockSearch = 'zone=30';
    const { result } = renderHook(() => useListState());
    act(() => {
      result.current.set({ sort: 'name' });
      result.current.set({ dir: 'desc' });
      result.current.setPage(2);
    });
    expect(lastReplaceUrl()).toBe(
      '/dashboard/mobs?zone=30&sort=name&dir=desc&page=2'
    );
  });

  it('resets the page when other params change but omits page=1', () => {
    mockSearch = 'zone=30&page=5';
    const { result } = renderHook(() => useListState());
    act(() => result.current.set({ per: 50 }));
    expect(lastReplaceUrl()).toBe('/dashboard/mobs?zone=30&per=50');
    act(() => result.current.setPage(1));
    expect(lastReplaceUrl()).toBe('/dashboard/mobs?zone=30&per=50');
  });

  it('does not rewrite the URL when search filters are unchanged', () => {
    mockSearch = 'zone=30&q=orc';
    const { result } = renderHook(() => useListState());
    act(() => result.current.setSearchFilters({ searchTerm: 'orc' }));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('stores the list query string for back-to-list links', () => {
    mockSearch = 'zone=30&page=2';
    renderHook(() => useListState());
    expect(
      window.sessionStorage.getItem(LIST_QUERY_KEY_PREFIX + '/dashboard/mobs')
    ).toBe('zone=30&page=2');
  });
});

describe('search filter <-> params', () => {
  it('round-trips search text, level range, types and custom filters', () => {
    const filters = {
      searchTerm: 'sword',
      levelMin: 5,
      levelMax: 20,
      types: ['WEAPON', 'ARMOR'],
      customFilters: { isHighLevel: true, slot: 'HEAD' },
    };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchFiltersToParams(filters))) {
      if (v != null) params.set(k, v);
    }
    expect(searchFiltersFromParams(params)).toEqual(filters);
  });
});

describe('useListReturnHref', () => {
  it('returns the list path with its saved query string', () => {
    window.sessionStorage.setItem(
      LIST_QUERY_KEY_PREFIX + '/dashboard/mobs',
      'zone=30&page=2'
    );
    const { result } = renderHook(() => useListReturnHref('/dashboard/mobs'));
    expect(result.current).toBe('/dashboard/mobs?zone=30&page=2');
  });

  it('falls back to the bare list path', () => {
    const { result } = renderHook(() => useListReturnHref('/dashboard/mobs'));
    expect(result.current).toBe('/dashboard/mobs');
  });
});
