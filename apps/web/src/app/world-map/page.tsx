'use client';

import { useState } from 'react';
import { WorldMapCanvas } from '@/components/WorldMap/WorldMapCanvas';
import { useRouter } from 'next/navigation';

export default function WorldMapPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mapOptions, setMapOptions] = useState({
    zoneGlow: true,
    zoneOutline: true,
    zoneLabels: true,
    roomGlow: false,
  });

  const handleZoneClick = (zoneId: number) => {
    router.push(`/zones/${zoneId}/edit`);
  };

  return (
    <div className='flex flex-col h-screen'>
      <div className='flex items-center justify-between px-4 py-2 border-b bg-white dark:bg-gray-800'>
        <h1 className='text-lg font-semibold'>World Map (Canvas Test)</h1>
        <div className='text-sm text-gray-600 dark:text-gray-400'>
          Pan: Click & Drag | Zoom: Scroll | Click Room to navigate
        </div>
      </div>
      <div className='flex-1 relative'>
        {loading && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10'>
            <div className='text-lg'>Loading world map...</div>
          </div>
        )}
        <div className='absolute top-2 right-2 z-20 bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md px-3 py-2 space-y-1 text-sm text-gray-800 dark:text-gray-100'>
          <div className='font-semibold text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>
            Display
          </div>
          {(
            [
              { key: 'zoneGlow', label: 'Zone glow' },
              { key: 'zoneOutline', label: 'Zone borders' },
              { key: 'zoneLabels', label: 'Zone labels' },
              { key: 'roomGlow', label: 'Room glow' },
            ] as const
          ).map(option => (
            <label
              key={option.key}
              className='flex items-center gap-2 cursor-pointer select-none'
            >
              <input
                type='checkbox'
                className='rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                checked={mapOptions[option.key]}
                onChange={e =>
                  setMapOptions(prev => ({
                    ...prev,
                    [option.key]: e.target.checked,
                  }))
                }
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        <WorldMapCanvas
          onZoneClick={handleZoneClick}
          onLoadingChange={setLoading}
          options={mapOptions}
        />
      </div>
    </div>
  );
}
