'use client';

export const dynamic = 'force-dynamic';

import { ZoneEditorOrchestrator } from '@/components/ZoneEditor/ZoneEditorOrchestrator';
import { WorldMapCanvas } from '@/components/WorldMap/WorldMapCanvas';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { useZoneContext } from '@/hooks/use-zone-context';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { isValidZoneId } from '@/lib/room-utils';

function ZoneEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const zoneIdParam = searchParams.get('zone');
  const roomIdParam = searchParams.get('room');
  const { zoneId: contextZoneId } = useZoneContext();
  const [localStorageZone, setLocalStorageZone] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapOptions, setMapOptions] = useState({
    zoneGlow: true,
    zoneOutline: true,
    zoneLabels: true,
    roomGlow: false,
  });

  // Load zone from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('muditor-selected-zone');
      if (stored && stored !== 'null') {
        const storedZoneId = parseInt(stored, 10);
        if (!isNaN(storedZoneId)) {
          setLocalStorageZone(storedZoneId);
        }
      }
    }
  }, []);

  // Priority: URL param > localStorage > null (world map)
  // Use useMemo to ensure recalculation when searchParams changes
  const zoneId = useMemo(() => {
    if (zoneIdParam != null) {
      const parsed = parseInt(zoneIdParam);
      if (!isNaN(parsed)) return parsed;
    }
    return localStorageZone;
  }, [zoneIdParam, localStorageZone]);

  // Parse room ID from URL
  const initialRoomId = useMemo(() => {
    if (roomIdParam != null) {
      const parsed = parseInt(roomIdParam);
      if (!isNaN(parsed)) return parsed;
    }
    return undefined;
  }, [roomIdParam]);

  // If no zone, show world map mode (use isValidZoneId to allow zone 0)
  const worldMapMode = useMemo(() => {
    return !isValidZoneId(zoneId);
  }, [zoneId]);

  const handleZoneClick = (clickedZoneId: number) => {
    console.log('handleZoneClick called with zoneId:', clickedZoneId);
    const url = `/dashboard/zones/editor?zone=${clickedZoneId}`;
    console.log('Navigating to:', url);
    router.push(url);
  };

  return (
    <div className='fixed inset-0 z-40 bg-gray-50 dark:bg-gray-900'>
      {/* Full-screen Header */}
      <div className='bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Link
              href='/dashboard'
              className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm'
            >
              Dashboard
            </Link>
            <span className='text-gray-300 dark:text-gray-600'>›</span>
            <Link
              href='/dashboard/zones'
              className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm'
            >
              Zones
            </Link>
            <span className='text-gray-300 dark:text-gray-600'>›</span>
            <h1 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
              {worldMapMode ? 'World Map' : `Zone ${zoneId} Editor`}
            </h1>
          </div>
          <div className='flex items-center gap-3'>
            {!worldMapMode && (
              <Link
                href={`/dashboard/zones/${zoneId}`}
                className='text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors'
              >
                📄 Zone Details
              </Link>
            )}
            <Link
              href='/dashboard/zones'
              className='text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors'
            >
              📋 All Zones
            </Link>
          </div>
        </div>
      </div>

      {/* Full-screen Zone Editor or World Map */}
      <div className='h-[calc(100vh-73px)]'>
        {worldMapMode ? (
          <>
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
          </>
        ) : (
          <ZoneEditorOrchestrator
            zoneId={zoneId ?? undefined}
            initialRoomId={initialRoomId}
            worldMapMode={false}
          />
        )}
      </div>
    </div>
  );
}

export default function ZoneEditorPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <Suspense fallback={<div className='p-6'>Loading zone editor...</div>}>
        <ZoneEditorContent />
      </Suspense>
    </PermissionGuard>
  );
}
