import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo, useEffect, useState } from 'react';

export interface ZoneContext {
  zoneId: number | null;
  entityType: 'rooms' | 'mobs' | 'objects' | 'shops' | 'visual-editor' | null;
  isInZoneContext: boolean;
}

/**
 * Hook to extract zone context from URL and localStorage
 * Supports both /zones/:id and query param ?zone=:id patterns
 * Falls back to localStorage for zone-aware pages without URL params
 */
export function useZoneContext(): ZoneContext {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localStorageZone, setLocalStorageZone] = useState<number | null>(null);

  // Load zone from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('muditor-selected-zone');
      if (stored && stored !== 'null') {
        const zoneId = parseInt(stored, 10);
        if (!isNaN(zoneId)) {
          setLocalStorageZone(zoneId);
        }
      }
    }
  }, []);

  return useMemo(() => {
    // Check for zone in query params first (used by rooms, mobs, objects, visual editor)
    // Support both 'zone' and 'zone_id' parameter names
    const zoneParam = searchParams.get('zone') || searchParams.get('zone_id');
    if (zoneParam) {
      const zoneId = parseInt(zoneParam, 10);
      if (!isNaN(zoneId)) {
        // Determine entity type from pathname
        let entityType: ZoneContext['entityType'] = null;
        if (pathname.includes('/rooms')) entityType = 'rooms';
        else if (pathname.includes('/mobs')) entityType = 'mobs';
        else if (pathname.includes('/objects')) entityType = 'objects';
        else if (pathname.includes('/shops')) entityType = 'shops';
        else if (pathname.includes('/zones/editor'))
          entityType = 'visual-editor';

        return {
          zoneId,
          entityType,
          isInZoneContext: true,
        };
      }
    }

    // Check for /zones/:id pattern (zone dashboard)
    const zonesMatch = pathname?.match(/\/zones\/(\d+)$/);
    if (zonesMatch?.[1]) {
      const zoneId = parseInt(zonesMatch[1], 10);
      if (!isNaN(zoneId)) {
        return {
          zoneId,
          entityType: null, // On zone dashboard, not viewing specific entities
          isInZoneContext: true,
        };
      }
    }

    // Fallback: Check if on entity pages with localStorage zone
    if (localStorageZone) {
      let entityType: ZoneContext['entityType'] = null;
      if (
        pathname === '/dashboard/rooms' ||
        pathname.startsWith('/dashboard/rooms/')
      ) {
        entityType = 'rooms';
      } else if (
        pathname === '/dashboard/mobs' ||
        pathname.startsWith('/dashboard/mobs/')
      ) {
        entityType = 'mobs';
      } else if (
        pathname === '/dashboard/objects' ||
        pathname.startsWith('/dashboard/objects/')
      ) {
        entityType = 'objects';
      } else if (
        pathname === '/dashboard/shops' ||
        pathname.startsWith('/dashboard/shops/')
      ) {
        entityType = 'shops';
      } else if (pathname === '/dashboard/zones/editor') {
        entityType = 'visual-editor';
      }

      if (entityType) {
        return {
          zoneId: localStorageZone,
          entityType,
          isInZoneContext: true,
        };
      }
    }

    // Not in zone context
    return {
      zoneId: null,
      entityType: null,
      isInZoneContext: false,
    };
  }, [pathname, searchParams, localStorageZone]);
}
