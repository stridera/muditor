import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';

interface Room {
  id: number;
  name: string;
  exits: {
    id: string;
    direction: string;
    destination: number;
    description?: string;
  }[];
}

interface RoomConnectionHelperProps {
  rooms: Room[];
  selectedRoomId: number | null;
  onCreateConnection: (
    fromRoom: number,
    toRoom: number,
    direction: string
  ) => void;
}

const DIRECTIONS = [
  { name: 'NORTH', opposite: 'SOUTH', icon: ArrowUp },
  { name: 'SOUTH', opposite: 'NORTH', icon: ArrowDown },
  { name: 'EAST', opposite: 'WEST', icon: ArrowRight },
  { name: 'WEST', opposite: 'EAST', icon: ArrowLeft },
  { name: 'NORTHEAST', opposite: 'SOUTHWEST', icon: ArrowUp },
  { name: 'NORTHWEST', opposite: 'SOUTHEAST', icon: ArrowUp },
  { name: 'SOUTHEAST', opposite: 'NORTHWEST', icon: ArrowDown },
  { name: 'SOUTHWEST', opposite: 'NORTHEAST', icon: ArrowDown },
  { name: 'UP', opposite: 'DOWN', icon: ArrowUp },
  { name: 'DOWN', opposite: 'UP', icon: ArrowDown },
];

export function RoomConnectionHelper({
  rooms,
  selectedRoomId,
  onCreateConnection,
}: RoomConnectionHelperProps) {
  const [targetRoomId, setTargetRoomId] = useState<number | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<string>('');
  const [createBidirectional, setCreateBidirectional] = useState(true);

  if (!selectedRoomId) {
    return (
      <Card className='mt-4'>
        <CardHeader>
          <CardTitle className='text-sm'>Connection Helper</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-gray-500'>
            Select a room to create connections
          </p>
        </CardContent>
      </Card>
    );
  }

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);
  const targetRoom = targetRoomId
    ? rooms.find(r => r.id === targetRoomId)
    : null;

  if (!selectedRoom) return null;

  const existingDirections = selectedRoom.exits.map(exit => exit.direction);
  const availableDirections = DIRECTIONS.filter(
    dir => !existingDirections.includes(dir.name)
  );

  const handleCreateConnection = () => {
    if (!targetRoomId || !selectedDirection) return;

    onCreateConnection(selectedRoomId, targetRoomId, selectedDirection);

    if (createBidirectional) {
      const direction = DIRECTIONS.find(d => d.name === selectedDirection);
      if (direction) {
        onCreateConnection(targetRoomId, selectedRoomId, direction.opposite);
      }
    }

    // Reset form
    setTargetRoomId(null);
    setSelectedDirection('');
  };

  const getSuggestedConnections = () => {
    // Find rooms without many connections that could benefit from linking
    return rooms
      .filter(
        room =>
          room.id !== selectedRoomId &&
          room.exits.length < 4 &&
          !selectedRoom.exits.some(exit => exit.destination === room.id)
      )
      .slice(0, 5);
  };

  return (
    <Card className='mt-4'>
      <CardHeader>
        <CardTitle className='text-sm'>Connection Helper</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <p className='text-sm font-medium mb-2'>From: {selectedRoom.name}</p>
          <p className='text-xs text-gray-600'>
            Current exits:{' '}
            {existingDirections.length > 0
              ? existingDirections.join(', ')
              : 'None'}
          </p>
        </div>

        {/* Target Room Selection */}
        <div>
          <label className='text-sm font-medium'>Connect to room:</label>
          <select
            value={targetRoomId || ''}
            onChange={e => setTargetRoomId(parseInt(e.target.value) || null)}
            className='w-full mt-1 px-3 py-1 border border-gray-300 rounded text-sm'
          >
            <option value=''>Select a room...</option>
            {rooms
              .filter(room => room.id !== selectedRoomId)
              .map(room => (
                <option key={room.id} value={room.id}>
                  Room {room.id}: {room.name}
                </option>
              ))}
          </select>
        </div>

        {/* Direction Selection */}
        {targetRoomId && (
          <div>
            <label className='text-sm font-medium'>Direction:</label>
            <div className='grid grid-cols-3 gap-2 mt-1'>
              {availableDirections.map(direction => {
                const Icon = direction.icon;
                return (
                  <button
                    key={direction.name}
                    onClick={() => setSelectedDirection(direction.name)}
                    className={`px-2 py-1 text-xs rounded border flex items-center justify-center gap-1 ${
                      selectedDirection === direction.name
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className='h-3 w-3' />
                    {direction.name.toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bidirectional Option */}
        {targetRoomId && selectedDirection && (
          <div className='flex items-center gap-2'>
            <input
              type='checkbox'
              id='bidirectional'
              checked={createBidirectional}
              onChange={e => setCreateBidirectional(e.target.checked)}
              className='rounded'
            />
            <label htmlFor='bidirectional' className='text-sm'>
              Create return path (
              {DIRECTIONS.find(
                d => d.name === selectedDirection
              )?.opposite.toLowerCase()}
              )
            </label>
          </div>
        )}

        {/* Create Button */}
        {targetRoomId && selectedDirection && (
          <Button onClick={handleCreateConnection} size='sm' className='w-full'>
            Create Connection
          </Button>
        )}

        {/* Quick Suggestions */}
        {getSuggestedConnections().length > 0 && (
          <div>
            <p className='text-sm font-medium mb-2'>Suggested connections:</p>
            <div className='space-y-1'>
              {getSuggestedConnections().map(room => (
                <button
                  key={room.id}
                  onClick={() => setTargetRoomId(room.id)}
                  className='w-full text-left px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 flex items-center justify-between'
                >
                  <span>{room.name}</span>
                  <Badge variant='outline' className='text-xs'>
                    {room.exits.length} exits
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Connection Analysis */}
        <div className='text-xs text-gray-500 space-y-1'>
          <p>💡 Tip: Well-connected zones typically have 2-4 exits per room</p>
          <p>🔄 Bidirectional connections make navigation more intuitive</p>
        </div>
      </CardContent>
    </Card>
  );
}
