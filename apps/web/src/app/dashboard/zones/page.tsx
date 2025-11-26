'use client';

import { PermissionGuard } from '@/components/auth/permission-guard';
import { DualInterface } from '@/components/dashboard/dual-interface';
import { ClimateBadge } from '@/components/ui/climate-badge';
import { LoadingError } from '@/components/ui/error-display';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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

  const { data, loading, error, refetch } =
    useQuery<ZonesQueryResult>(ZONES_QUERY);

  // Memoize zones array to satisfy hook dependency linting and avoid recreating on each render
  const zones = useMemo(() => data?.zones || [], [data?.zones]);
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
        <div className='h-8 bg-muted rounded w-1/4 mb-6'></div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='h-10 bg-muted rounded'></div>
          <div className='h-10 bg-muted rounded'></div>
        </div>
        <div className='space-y-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className='bg-card p-4 rounded-lg shadow'>
              <div className='h-4 bg-muted rounded w-1/3 mb-2'></div>
              <div className='h-3 bg-muted rounded w-1/4'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <LoadingError error={error} onRetry={() => refetch()} resource='zones' />
    );
  }

  const adminView = (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Zones</h1>
          <p className='text-muted-foreground mt-1'>
            {filteredZones.length} of {zones.length} zones,{' '}
            {roomsCount.toLocaleString()} rooms total
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Link
            href='/dashboard/zones/world-map'
            className='bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors'
          >
            🗺️ World Map
          </Link>
          <Link
            href='/dashboard/zones/new'
            className='bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors'
          >
            Create Zone
          </Link>
        </div>
      </div>

      <div className='bg-card rounded-lg shadow mb-6 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label
              htmlFor='search'
              className='block text-sm font-medium text-muted-foreground mb-1'
            >
              Search zones
            </label>
            <input
              type='text'
              id='search'
              placeholder='Search by name or ID...'
              className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor='climate'
              className='block text-sm font-medium text-muted-foreground mb-1'
            >
              Filter by climate
            </label>
            <select
              id='climate'
              className='w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
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
            className='bg-card rounded-lg shadow hover:shadow-md transition-shadow p-4'
          >
            <div className='flex items-start justify-between'>
              <div className='flex-1'>
                <h3 className='font-semibold text-foreground text-lg mb-1'>
                  {zone.name}
                </h3>
                <div className='flex items-center text-sm text-muted-foreground space-x-4'>
                  <span>ID: {zone.id}</span>
                  <ClimateBadge climate={zone.climate} />
                </div>
              </div>
              <div className='flex items-center space-x-2 ml-4'>
                <button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    router.push(`/dashboard/zones/editor?zone=${zone.id}`);
                  }}
                  className='text-primary hover:text-primary-foreground text-sm'
                >
                  📐 Visual Editor
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredZones.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-muted-foreground text-lg'>
            No zones found matching your criteria
          </p>
          <p className='text-muted-foreground text-sm mt-2'>
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
