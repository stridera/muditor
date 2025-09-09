'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useZone } from '@/contexts/zone-context';
import ZoneSelector from '../../../components/ZoneSelector';

interface Room {
  id: number;
  name: string;
  description: string;
  sector: string;
  flags: string[];
  zoneId: number;
}

export default function RoomsPage() {
  const searchParams = useSearchParams();
  const zoneParam = searchParams.get('zone');
  const { selectedZone, setSelectedZone } = useZone();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsCount, setRoomsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');

  // Handle initial zone parameter from URL
  useEffect(() => {
    if (zoneParam && selectedZone === null) {
      const zoneId = parseInt(zoneParam);
      if (!isNaN(zoneId)) {
        setSelectedZone(zoneId);
      }
    }
  }, [zoneParam, selectedZone, setSelectedZone]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const query = selectedZone
          ? `
              query GetRoomsByZone($zoneId: Int!) {
                roomsByZone(zoneId: $zoneId) {
                  id
                  name
                  description
                  sector
                  flags
                  zoneId
                }
                roomsCount(zoneId: $zoneId)
              }
            `
          : `
              query GetRooms($take: Int) {
                rooms(take: $take) {
                  id
                  name
                  description
                  sector
                  flags
                  zoneId
                }
                roomsCount
              }
            `;

        const variables = selectedZone
          ? { zoneId: selectedZone }
          : { take: 100 };

        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, variables }),
        });

        const data = await response.json();
        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        setRooms(data.data.rooms || data.data.roomsByZone || []);
        setRoomsCount(data.data.roomsCount || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [selectedZone]);

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchesSearch =
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.id.toString().includes(searchTerm) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector =
        selectedSector === 'all' || room.sector === selectedSector;

      return matchesSearch && matchesSector;
    });
  }, [rooms, searchTerm, selectedSector]);

  const sectorOptions = useMemo(() => {
    const sectors = Array.from(new Set(rooms.map(room => room.sector)));
    return sectors.sort();
  }, [rooms]);

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
              <div className='h-4 bg-gray-200 rounded w-1/2 mb-2'></div>
              <div className='h-3 bg-gray-200 rounded w-3/4 mb-1'></div>
              <div className='h-3 bg-gray-200 rounded w-1/4'></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className='bg-red-50 border border-red-200 rounded-md p-4'
        data-testid='error-message'
      >
        <h3 className='text-red-800 font-medium'>Error loading rooms</h3>
        <p className='text-red-600 text-sm mt-1'>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            {selectedZone ? `Zone ${selectedZone} Rooms` : 'Rooms'}
          </h1>
          <p className='text-gray-600 mt-1'>
            {filteredRooms.length} of {roomsCount} rooms
            {selectedZone && ' in this zone'}
          </p>
        </div>
        <Link
          href='/dashboard/zones/editor'
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
        >
          Visual Zone Editor
        </Link>
      </div>

      <div className='bg-white rounded-lg shadow mb-6 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <ZoneSelector
            selectedZone={selectedZone}
            onZoneChange={setSelectedZone}
          />

          <div>
            <label
              htmlFor='search'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Search rooms
            </label>
            <input
              type='text'
              id='search'
              placeholder='Search by name, ID, or description...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor='sector'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Filter by sector
            </label>
            <select
              id='sector'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
            >
              <option value='all'>All sectors</option>
              {sectorOptions.map(sector => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredRooms.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-500 text-lg'>
            No rooms found matching your criteria
          </p>
          <p className='text-gray-400 text-sm mt-2'>
            Try adjusting your search or filter
          </p>
        </div>
      ) : (
        <div className='grid gap-4'>
          {filteredRooms.map(room => (
            <div
              key={room.id}
              className='bg-white border rounded-lg shadow hover:shadow-md transition-shadow p-4'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h3 className='font-semibold text-lg text-gray-900'>
                      {room.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        room.sector === 'INSIDE'
                          ? 'bg-blue-100 text-blue-700'
                          : room.sector === 'CITY'
                            ? 'bg-green-100 text-green-700'
                            : room.sector === 'FIELD'
                              ? 'bg-yellow-100 text-yellow-700'
                              : room.sector === 'FOREST'
                                ? 'bg-green-200 text-green-800'
                                : room.sector === 'HILLS'
                                  ? 'bg-orange-100 text-orange-700'
                                  : room.sector === 'MOUNTAIN'
                                    ? 'bg-gray-100 text-gray-700'
                                    : room.sector === 'WATER_SWIM'
                                      ? 'bg-cyan-100 text-cyan-700'
                                      : room.sector === 'WATER_NOSWIM'
                                        ? 'bg-blue-200 text-blue-800'
                                        : room.sector === 'FLYING'
                                          ? 'bg-purple-100 text-purple-700'
                                          : room.sector === 'UNDERWATER'
                                            ? 'bg-teal-100 text-teal-700'
                                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {room.sector}
                    </span>
                  </div>
                  <p className='text-gray-700 mb-2 line-clamp-2'>
                    {room.description}
                  </p>
                  <div className='flex items-center gap-4 text-sm text-gray-500'>
                    <span>Room #{room.id}</span>
                    <span>Zone {room.zoneId}</span>
                    {room.flags && room.flags.length > 0 && (
                      <>
                        <span>•</span>
                        <span>Flags: {room.flags.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className='flex items-center gap-2 ml-4'>
                  <Link
                    href={`/dashboard/zones/${room.zoneId}`}
                    className='text-gray-600 hover:text-gray-800 px-3 py-1 text-sm'
                  >
                    Zone
                  </Link>
                  <Link
                    href={`/dashboard/zones/editor?zone=${room.zoneId}&room=${room.id}`}
                    className='text-blue-600 hover:text-blue-800 px-3 py-1 text-sm'
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
