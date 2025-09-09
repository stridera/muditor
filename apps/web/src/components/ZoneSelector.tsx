'use client';

import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';

interface Zone {
  id: number;
  name: string;
}

interface ZoneSelectorProps {
  selectedZone?: number | null;
  onZoneChange: (zoneId: number | null) => void;
  className?: string;
}

interface ZonesQueryData {
  zones: Zone[];
}

const GET_ZONES = gql`
  query GetZones {
    zones {
      id
      name
    }
  }
`;

export default function ZoneSelector({
  selectedZone,
  onZoneChange,
  className = '',
}: ZoneSelectorProps) {
  const { data, loading, error } = useQuery<ZonesQueryData>(GET_ZONES);

  const zones = data?.zones || [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onZoneChange(value === 'all' ? null : parseInt(value));
  };

  if (loading) {
    return (
      <div className={className}>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Filter by zone
        </label>
        <div className='w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50'>
          Loading zones...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <label className='block text-sm font-medium text-gray-700 mb-1'>
          Filter by zone
        </label>
        <div className='w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-700'>
          Error loading zones
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label
        htmlFor='zone-selector'
        className='block text-sm font-medium text-gray-700 mb-1'
      >
        Filter by zone
      </label>
      <select
        id='zone-selector'
        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
        value={selectedZone || 'all'}
        onChange={handleChange}
      >
        <option value='all'>All zones</option>
        {zones.map((zone: Zone) => (
          <option key={zone.id} value={zone.id}>
            Zone {zone.id}: {zone.name}
          </option>
        ))}
      </select>
    </div>
  );
}
