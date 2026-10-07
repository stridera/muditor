'use client';

import React, {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { LAST_ZONE_KEY } from '@/hooks/use-list-state';

export interface ZoneContextType {
  selectedZone: number | null;
  setSelectedZone: (zone: number | null) => void;
}

const ZoneContext = createContext<ZoneContextType | undefined>(undefined);

export const useZone = () => {
  const context = useContext(ZoneContext);
  if (context === undefined) {
    throw new Error('useZone must be used within a ZoneProvider');
  }
  return context;
};

interface ZoneProviderProps {
  children: React.ReactNode;
}

/**
 * Syncs the selected zone from the URL (?zone=) or localStorage. Isolated in
 * its own component so the useSearchParams() Suspense boundary does not force
 * the whole app tree (rendered from the root layout) into client-side bailout.
 */
const ZoneUrlSync: React.FC<{
  onZone: (zone: number | null) => void;
}> = ({ onZone }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Priority 1: Check URL parameters first
    const urlZone = searchParams.get('zone');
    if (urlZone) {
      const zoneId = parseInt(urlZone);
      if (!isNaN(zoneId)) {
        // Persisting the zone is the list pages' job (useListState): an editor
        // URL's ?zone= is the entity's zone, not a list filter.
        onZone(zoneId);
        return;
      }
    }

    // Priority 2: Load from localStorage if no URL parameter
    const stored = localStorage.getItem(LAST_ZONE_KEY);
    const zoneId = stored ? parseInt(stored) : NaN;
    onZone(isNaN(zoneId) ? null : zoneId);
  }, [searchParams, onZone]);

  return null;
};

export const ZoneProvider: React.FC<ZoneProviderProps> = ({ children }) => {
  const [selectedZone, setSelectedZoneState] = useState<number | null>(null);
  const setSelectedZone = (zone: number | null) => {
    setSelectedZoneState(zone);
    if (zone === null) {
      localStorage.removeItem(LAST_ZONE_KEY);
    } else {
      localStorage.setItem(LAST_ZONE_KEY, zone.toString());
    }
  };

  return (
    <ZoneContext.Provider
      value={{
        selectedZone,
        setSelectedZone,
      }}
    >
      <Suspense fallback={null}>
        <ZoneUrlSync onZone={setSelectedZoneState} />
      </Suspense>
      {children}
    </ZoneContext.Provider>
  );
};
