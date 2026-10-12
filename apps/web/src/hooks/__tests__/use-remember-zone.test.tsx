/**
 * Opening a zone page makes that zone the remembered zone (localStorage +
 * context), so the sidebar's zone-scoped links carry ?zone=.
 */
import { render, renderHook, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LAST_ZONE_KEY } from '../use-list-state';
import { ZoneProvider, useZone } from '@/contexts/zone-context';
import { hrefWithZone } from '@/lib/zone-nav';
import { useRememberZone } from '../use-remember-zone';

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
}));

beforeEach(() => window.localStorage.clear());

function Sidebar() {
  const { selectedZone } = useZone();
  return <a href={hrefWithZone('/dashboard/objects', selectedZone)}>Objects</a>;
}

function ZonePage({ id }: { id: number | null }) {
  useRememberZone(id);
  return null;
}

describe('useRememberZone', () => {
  it('stores the zone and updates the sidebar object link', () => {
    render(
      <ZoneProvider>
        <Sidebar />
        <ZonePage id={30} />
      </ZoneProvider>
    );
    expect(window.localStorage.getItem(LAST_ZONE_KEY)).toBe('30');
    expect(screen.getByRole('link', { name: 'Objects' })).toHaveAttribute(
      'href',
      '/dashboard/objects?zone=30'
    );
  });

  it('remembers zone 0', () => {
    renderHook(() => useRememberZone(0), { wrapper: ZoneProvider });
    expect(window.localStorage.getItem(LAST_ZONE_KEY)).toBe('0');
  });

  it('leaves the remembered zone alone without a zone', () => {
    window.localStorage.setItem(LAST_ZONE_KEY, '12');
    renderHook(() => useRememberZone(null), { wrapper: ZoneProvider });
    expect(window.localStorage.getItem(LAST_ZONE_KEY)).toBe('12');
  });
});
