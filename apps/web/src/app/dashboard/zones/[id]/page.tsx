'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PermissionGuard } from '@/components/auth/permission-guard';

interface Room {
  id: number;
  name: string;
  description: string;
  sector: string;
}

interface ZoneDetail {
  id: number;
  name: string;
  lifespan: number;
  climate: string;
  resetMode: string;
  hemisphere: string;
  _count: {
    rooms: number;
    mobs: number;
    objects: number;
    shops: number;
  };
}

export default function ZoneDetailPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <ZoneDetailContent />
    </PermissionGuard>
  );
}

function ZoneDetailContent() {
  const params = useParams();
  const zoneId = params.id as string;
  const [zone, setZone] = useState<ZoneDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchZone = async () => {
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query GetZone($id: Int!) {
                zone(id: $id) {
                  id
                  name
                  lifespan
                  climate
                  resetMode
                  hemisphere
                  _count {
                    rooms
                    mobs
                    objects
                    shops
                  }
                }
              }
            `,
            variables: { id: parseInt(zoneId) },
          }),
        });

        const data = await response.json();
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        if (!data.data.zone) {
          throw new Error('Zone not found');
        }

        setZone(data.data.zone);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch zone');
      } finally {
        setLoading(false);
      }
    };

    fetchZone();
  }, [zoneId]);

  if (loading) {
    return (
      <div className='animate-pulse'>
        <div className='h-8 bg-gray-200 rounded w-1/3 mb-6'></div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
            <div className='space-y-2'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='h-3 bg-gray-200 rounded'></div>
              ))}
            </div>
          </div>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='h-4 bg-gray-200 rounded w-1/4 mb-4'></div>
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='h-4 bg-gray-200 rounded'></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-md p-4'>
        <h3 className='text-red-800 font-medium'>Error loading zone</h3>
        <p className='text-red-600 text-sm mt-1'>{error || 'Zone not found'}</p>
        <Link
          href='/dashboard/zones'
          className='text-red-700 hover:text-red-900 text-sm underline mt-2 inline-block'
        >
          ← Back to zones
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <nav className='flex items-center text-sm text-gray-500 mb-2'>
            <Link href='/dashboard' className='hover:text-gray-700'>
              Dashboard
            </Link>
            <span className='mx-2'>/</span>
            <Link href='/dashboard/zones' className='hover:text-gray-700'>
              Zones
            </Link>
            <span className='mx-2'>/</span>
            <span className='text-gray-900'>{zone.name}</span>
          </nav>
          <h1 className='text-3xl font-bold text-gray-900'>{zone.name}</h1>
          <p className='text-gray-600 mt-1'>Zone ID: {zone.id}</p>
        </div>
        <div className='flex space-x-3'>
          <Link
            href={`/dashboard/zones/editor?zone=${zone.id}`}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Edit Zone
          </Link>
          <Link
            href={`/dashboard/zones/${zone.id}/rooms`}
            className='bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
          >
            View Rooms
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Zone Information
          </h2>
          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Lifespan
                </label>
                <p className='text-gray-900 mt-1'>{zone.lifespan} minutes</p>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Climate
                </label>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                    zone.climate === 'NONE'
                      ? 'bg-gray-100 text-gray-700'
                      : zone.climate === 'TEMPERATE'
                        ? 'bg-green-100 text-green-700'
                        : zone.climate === 'TROPICAL'
                          ? 'bg-yellow-100 text-yellow-700'
                          : zone.climate === 'ARCTIC'
                            ? 'bg-cyan-100 text-cyan-700'
                            : zone.climate === 'ARID'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {zone.climate}
                </span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700'>
                  Reset Mode
                </label>
                <p className='text-gray-900 mt-1'>{zone.resetMode}</p>
              </div>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700'>
                Hemisphere
              </label>
              <p className='text-gray-900 mt-1'>{zone.hemisphere}</p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Zone Statistics
          </h2>
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center p-4 bg-blue-50 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>
                {zone._count.rooms}
              </div>
              <div className='text-sm text-blue-800'>Rooms</div>
            </div>
            <div className='text-center p-4 bg-green-50 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>
                {zone._count.mobs}
              </div>
              <div className='text-sm text-green-800'>Mobs</div>
            </div>
            <div className='text-center p-4 bg-purple-50 rounded-lg'>
              <div className='text-2xl font-bold text-purple-600'>
                {zone._count.objects}
              </div>
              <div className='text-sm text-purple-800'>Objects</div>
            </div>
            <div className='text-center p-4 bg-orange-50 rounded-lg'>
              <div className='text-2xl font-bold text-orange-600'>
                {zone._count.shops}
              </div>
              <div className='text-sm text-orange-800'>Shops</div>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow p-6'>
        <h2 className='text-xl font-semibold text-gray-900 mb-4'>
          Rooms in Zone
        </h2>
        <p className='text-gray-600 mb-4'>
          This zone contains {zone._count.rooms} room
          {zone._count.rooms !== 1 ? 's' : ''}.
        </p>
        <div className='flex space-x-3'>
          <Link
            href={`/dashboard/rooms?zone=${zone.id}`}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            View All Rooms
          </Link>
          <Link
            href={`/dashboard/zones/editor?zone=${zone.id}`}
            className='bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'
          >
            Visual Editor
          </Link>
        </div>
      </div>
    </div>
  );
}
