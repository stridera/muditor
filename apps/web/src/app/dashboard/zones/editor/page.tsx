'use client';

export const dynamic = 'force-dynamic';

import { useSearchParams } from 'next/navigation';
import { EnhancedZoneEditor } from '@/components/ZoneEditor/EnhancedZoneEditor';
import { PermissionGuard } from '@/components/auth/permission-guard';
import Link from 'next/link';
import { Suspense } from 'react';

function ZoneEditorContent() {
  const searchParams = useSearchParams();
  const zoneIdParam = searchParams.get('zone');
  const zoneId = zoneIdParam ? parseInt(zoneIdParam) : null;

  if (!zoneId) {
    return (
      <div className='p-6'>
        <div className='bg-yellow-50 border border-yellow-200 rounded-md p-4'>
          <h3 className='text-yellow-800 font-medium'>No Zone Selected</h3>
          <p className='text-yellow-600 text-sm mt-1'>
            Please select a zone to edit by adding ?zone=ID to the URL
          </p>
          <Link
            href='/dashboard/zones'
            className='inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm'
          >
            ← Back to Zones List
          </Link>
        </div>
      </div>
    );
  }

  return (
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
            <h1 className='text-lg font-semibold text-gray-900'>
              Zone {zoneId} Editor
            </h1>
          </div>
          <div className='flex items-center gap-3'>
            <Link
              href={`/dashboard/zones/${zoneId}`}
              className='text-blue-600 hover:text-blue-800 text-sm px-3 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors'
            >
              📄 Zone Details
            </Link>
            <Link
              href='/dashboard/zones'
              className='text-gray-600 hover:text-gray-800 text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors'
            >
              📋 All Zones
            </Link>
          </div>
        </div>
      </div>

      {/* Full-screen Zone Editor */}
      <div className='h-[calc(100vh-73px)]'>
        <EnhancedZoneEditor zoneId={zoneId} />
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
