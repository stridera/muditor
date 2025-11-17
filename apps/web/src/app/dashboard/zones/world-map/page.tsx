'use client';

export const dynamic = 'force-dynamic';

import { ZoneEditorOrchestrator } from '@/components/ZoneEditor/ZoneEditorOrchestrator';
import { PermissionGuard } from '@/components/auth/permission-guard';
import Link from 'next/link';

export default function WorldMapPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <div className='fixed inset-0 z-40 bg-gray-50'>
        {/* Full-screen Header */}
        <div className='bg-white border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/dashboard'
                className='text-gray-500 hover:text-gray-700 text-sm'
              >
                Dashboard
              </Link>
              <span className='text-gray-300'>›</span>
              <Link
                href='/dashboard/zones'
                className='text-gray-500 hover:text-gray-700 text-sm'
              >
                Zones
              </Link>
              <span className='text-gray-300'>›</span>
              <h1 className='text-lg font-semibold text-gray-900'>World Map</h1>
            </div>
            <div className='flex items-center gap-3'>
              <Link
                href='/dashboard/zones'
                className='text-gray-600 hover:text-gray-800 text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors'
              >
                📋 All Zones
              </Link>
            </div>
          </div>
        </div>

        {/* Full-screen World Map Editor */}
        <div className='h-[calc(100vh-73px)]'>
          <ZoneEditorOrchestrator worldMapMode={true} />
        </div>
      </div>
    </PermissionGuard>
  );
}
