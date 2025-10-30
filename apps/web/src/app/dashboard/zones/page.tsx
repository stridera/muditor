'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';
import { PermissionGuard } from '@/components/auth/permission-guard';
import { DualInterface } from '@/components/dashboard/dual-interface';
import { LoadingError } from '@/components/ui/error-display';
import { Loading } from '@/components/ui/loading';

const ZONES_QUERY = gql`
  query GetZonesDashboard {
    zones {
      id
      name
      climate
    }
    roomsCount
  }
`;

interface Zone {
  id: number;
  name: string;
  climate: string;
}

interface ZonesQueryResult {
  zones: Zone[];
  roomsCount: number;
}

export default function ZonesPage() {
  return (
    <PermissionGuard requireImmortal={true}>
      <ZonesContent />
    </PermissionGuard>
  );
}

function ZonesContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClimate, setSelectedClimate] = useState('all');

  const { data, loading, error, refetch } = useQuery<ZonesQueryResult>(ZONES_QUERY);

  const zones = data?.zones || [];
  const roomsCount = data?.roomsCount || 0;

  const filteredZones = useMemo(() => {
    return zones.filter(zone => {
      const matchesSearch =
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.id.toString().includes(searchTerm);
      const matchesClimate =
        selectedClimate === 'all' || zone.climate === selectedClimate;

      return matchesSearch && matchesClimate;
    });
  }, [zones, searchTerm, selectedClimate]);

  const climateOptions = useMemo(() => {
    const climates = Array.from(new Set(zones.map(zone => zone.climate)));
    return climates.sort();
  }, [zones]);

  if (loading) {
    return (
      <div className='animate-pulse'>
        <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='h-10 bg-gray-200 rounded'></div>
          <div className='h-10 bg-gray-200 rounded'></div>
        </div>
        <div className='space-y-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='bg-white p-4 rounded-lg shadow'>
              <div className='h-4 bg-gray-200 rounded w-1/3 mb-2'></div>
              <div className='h-3 bg-gray-200 rounded w-1/4'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <LoadingError error={error} onRetry={() => refetch()} resource="zones" />;
  }

  const adminView = (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Zones</h1>
          <p className='text-gray-600 mt-1'>
            {filteredZones.length} of {zones.length} zones, {roomsCount.toLocaleString()} rooms total
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Link
            href='/dashboard/zones/layout-test'
            className='bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'
          >
            🧪 Layout Test
          </Link>
          <Link
            href='/dashboard/zones/world-map'
            className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'
          >
            🗺️ World Map
          </Link>
          <Link
            href='/dashboard/zones/new'
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
          >
            Create Zone
          </Link>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow mb-6 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='search'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Search zones
            </label>
            <input
              type='text'
              id='search'
              placeholder='Search by name or ID...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor='climate'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Filter by climate
            </label>
            <select
              id='climate'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={selectedClimate}
              onChange={e => setSelectedClimate(e.target.value)}
            >
              <option value='all'>All climates</option>
              {climateOptions.map(climate => (
                <option key={climate} value={climate}>
                  {climate}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
        {filteredZones.map(zone => (
          <Link
            key={zone.id}
            href={`/dashboard/zones/${zone.id}`}
            className='bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4'
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h3 className='font-semibold text-gray-900 text-lg mb-1'>
                  {zone.name}
                </h3>
                <div className='flex items-center text-sm text-gray-600 space-x-4'>
                  <span>ID: {zone.id}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      zone.climate === 'NONE'
                        ? 'bg-gray-100 text-gray-700'
                        : zone.climate === 'OCEANIC'
                          ? 'bg-blue-100 text-blue-700'
                          : zone.climate === 'TEMPERATE'
                            ? 'bg-green-100 text-green-700'
                            : zone.climate === 'TROPICAL'
                              ? 'bg-yellow-100 text-yellow-700'
                              : zone.climate === 'SUBARCTIC'
                                ? 'bg-cyan-100 text-cyan-700'
                                : zone.climate === 'ARID'
                                  ? 'bg-orange-100 text-orange-700'
                                  : zone.climate === 'SEMIARID'
                                    ? 'bg-amber-100 text-amber-700'
                                    : zone.climate === 'ALPINE'
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {zone.climate}
                  </span>
                </div>
              </div>

              <div className='flex items-center space-x-2 ml-4'>
                <button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/dashboard/zones/editor?zone=${zone.id}`);
                  }}
                  className='text-blue-600 hover:text-blue-800 text-sm'
                >
                  Edit
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredZones.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>
            No zones found matching your criteria
          </p>
          <p className='text-gray-400 text-sm mt-2'>
            Try adjusting your search or filter
          </p>
        </div>
      )}
    </div>
  );

  return (
    <DualInterface
      title='Zones'
      description='View and manage zone configurations'
      adminView={adminView}
    >
      <div></div>
    </DualInterface>
  );
}
