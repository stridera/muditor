'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

export const ZoneProvider: React.FC<ZoneProviderProps> = ({ children }) => {
  const [selectedZone, setSelectedZoneState] = useState<number | null>(null);

  useEffect(() => {
    // Load selected zone from localStorage on component mount
    const stored = localStorage.getItem('muditor-selected-zone');
    if (stored && stored !== 'null') {
      const zoneId = parseInt(stored);
      if (!isNaN(zoneId)) {
        setSelectedZoneState(zoneId);
      }
    }
  }, []);

  const setSelectedZone = (zone: number | null) => {
    setSelectedZoneState(zone);
    if (zone === null) {
      localStorage.removeItem('muditor-selected-zone');
    } else {
      localStorage.setItem('muditor-selected-zone', zone.toString());
    }
  };

  return (
    <ZoneContext.Provider
      value={{
        selectedZone,
        setSelectedZone,
      }}
    >
      {children}
    </ZoneContext.Provider>
  );
};
