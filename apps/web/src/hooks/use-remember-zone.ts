'use client';

import { useZone } from '@/contexts/zone-context';
import { useEffect, useRef } from 'react';

/**
 * Make `zoneId` the remembered zone (localStorage + zone context) while a zone
 * page is open, so the sidebar's zone-scoped links (rooms, mobs, objects, ...)
 * carry `?zone=`. Pass null to leave the remembered zone alone.
 */
export function useRememberZone(zoneId: number | null | undefined): void {
  const { setSelectedZone } = useZone();
  const setRef = useRef(setSelectedZone);
  setRef.current = setSelectedZone;

  useEffect(() => {
    if (zoneId == null || Number.isNaN(zoneId)) return;
    setRef.current(zoneId);
  }, [zoneId]);
}
