'use client';

import { useZonesForSelector } from '@/hooks/use-zones-for-selector';

interface ZoneSelectorProps {
  selectedZone?: number | null;
  onZoneChange: (zoneId: number | null) => void;
  className?: string;
}

export default function ZoneSelector({
  selectedZone,
  onZoneChange,
  className = '',
}: ZoneSelectorProps) {
  const { zones, loading, error } = useZonesForSelector();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onZoneChange(value === 'all' ? null : parseInt(value));
  };

  if (loading) {
    return (
      <div className={className}>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'>
          Filter by zone
        </label>
        <div className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 dark:text-gray-200'>
          Loading zones...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <label className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'>
          Filter by zone
        </label>
        <div className='w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'>
          Error loading zones
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label
        htmlFor='zone-selector'
        className='block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1'
      >
        Filter by zone
      </label>
      <select
        id='zone-selector'
        className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
        value={selectedZone || 'all'}
        onChange={handleChange}
      >
        <option value='all'>All zones</option>
        {zones.map(zone => (
          <option key={zone.id} value={zone.id}>
            Zone {zone.id}: {zone.name}
          </option>
        ))}
      </select>
    </div>
  );
}
