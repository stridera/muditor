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
        <label className='block text-sm font-medium text-foreground/80 mb-1'>
          Filter by zone
        </label>
        <div className='w-full px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground'>
          Loading zones...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <label className='block text-sm font-medium text-foreground/80 mb-1'>
          Filter by zone
        </label>
        <div className='w-full px-3 py-2 border border-destructive/30 rounded-md bg-destructive/10 text-destructive'>
          Error loading zones
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label
        htmlFor='zone-selector'
        className='block text-sm font-medium text-foreground/80 mb-1'
      >
        Filter by zone
      </label>
      <select
        id='zone-selector'
        className='w-full px-3 py-2 border border-border rounded-md bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
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
