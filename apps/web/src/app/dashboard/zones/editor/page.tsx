'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { EnhancedZoneEditor } from '@/components/ZoneEditor/EnhancedZoneEditor';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { useZoneContext } from '@/hooks/use-zone-context';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

function ZoneEditorContent() {
  const searchParams = useSearchParams();
  const zoneIdParam = searchParams.get('zone');
  const { zoneId: contextZoneId } = useZoneContext();
  const [localStorageZone, setLocalStorageZone] = useState<number | null>(null);

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
  const zoneId = zoneIdParam
    ? parseInt(zoneIdParam)
    : localStorageZone;

  // If no zone, show world map mode
  const worldMapMode = !zoneId;

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

      {/* Full-screen Zone Editor */}
      <div className='h-[calc(100vh-73px)]'>
        <EnhancedZoneEditor zoneId={zoneId ?? undefined} worldMapMode={worldMapMode} />
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
