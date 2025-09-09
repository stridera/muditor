'use client';

import React, { useState, useEffect } from 'react';

interface Room {
  id: number;
  name: string;
  description: string;
  sector: string;
  zoneId: number;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
  exits: RoomExit[];
  mobs?: Array<{ id: number; name: string; level: number }>;
  objects?: Array<{ id: number; name: string; type: string }>;
}

interface RoomExit {
  id: string;
  direction: string;
  destination: number | null;
  description?: string;
  keyword?: string;
}

interface PropertyPanelProps {
  room: Room;
  allRooms: Room[];
  onRoomChange: (field: keyof Room, value: string) => void;
  onSaveRoom: () => void;
  onCreateExit: (exitData: { direction: string; destination: number }) => void;
  onDeleteExit: (exitId: string) => void;
  onUpdateZLevel: (roomId: number, zLevel: number) => void;
  saving: boolean;
  managingExits: boolean;
}

const sectorOptions = [
  { value: 'STRUCTURE', label: 'Structure', icon: '🏛️' },
  { value: 'FIELD', label: 'Field', icon: '🌾' },
  { value: 'FOREST', label: 'Forest', icon: '🌲' },
  { value: 'HILLS', label: 'Hills', icon: '⛰️' },
  { value: 'MOUNTAIN', label: 'Mountain', icon: '🏔️' },
  { value: 'WATER', label: 'Water', icon: '🌊' },
  { value: 'SWAMP', label: 'Swamp', icon: '🐊' },
  { value: 'CITY', label: 'City', icon: '🏙️' },
  { value: 'ROAD', label: 'Road', icon: '🛤️' },
];

const directionOptions = [
  { value: 'NORTH', label: 'North', icon: '⬆️' },
  { value: 'SOUTH', label: 'South', icon: '⬇️' },
  { value: 'EAST', label: 'East', icon: '➡️' },
  { value: 'WEST', label: 'West', icon: '⬅️' },
  { value: 'NORTHEAST', label: 'Northeast', icon: '↗️' },
  { value: 'NORTHWEST', label: 'Northwest', icon: '↖️' },
  { value: 'SOUTHEAST', label: 'Southeast', icon: '↘️' },
  { value: 'SOUTHWEST', label: 'Southwest', icon: '↙️' },
  { value: 'UP', label: 'Up', icon: '⬆️' },
  { value: 'DOWN', label: 'Down', icon: '⬇️' },
];

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  room,
  allRooms,
  onRoomChange,
  onSaveRoom,
  onCreateExit,
  onDeleteExit,
  onUpdateZLevel,
  saving,
  managingExits,
}) => {
  const [activeTab, setActiveTab] = useState<
    'basic' | 'exits' | 'entities' | 'advanced'
  >('basic');
  const [showCreateExit, setShowCreateExit] = useState(false);
  const [newExitDirection, setNewExitDirection] = useState('NORTH');
  const [newExitDestination, setNewExitDestination] = useState('');
  const [newExitDescription, setNewExitDescription] = useState('');
  const [newExitKeyword, setNewExitKeyword] = useState('');

  // Reset form when room changes
  useEffect(() => {
    setShowCreateExit(false);
    setNewExitDirection('NORTH');
    setNewExitDestination('');
    setNewExitDescription('');
    setNewExitKeyword('');
  }, [room.id]);

  const handleCreateExit = () => {
    if (newExitDirection && newExitDestination) {
      onCreateExit({
        direction: newExitDirection,
        destination: parseInt(newExitDestination),
      });
      setShowCreateExit(false);
      setNewExitDirection('NORTH');
      setNewExitDestination('');
      setNewExitDescription('');
      setNewExitKeyword('');
    }
  };

  const availableRooms = allRooms.filter(r => r.id !== room.id);
  const mobCount = room.mobs?.length || 0;
  const objectCount = room.objects?.length || 0;

  return (
    <div className='w-96 bg-white border-l border-gray-200 flex flex-col h-full'>
      {/* Header */}
      <div className='p-4 border-b border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Room {room.id} Properties
        </h3>

        {/* Quick stats */}
        <div className='flex gap-2 text-xs'>
          <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
            {room.exits.length} exit{room.exits.length !== 1 ? 's' : ''}
          </span>
          <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full'>
            {mobCount} mob{mobCount !== 1 ? 's' : ''}
          </span>
          <span className='bg-purple-100 text-purple-800 px-2 py-1 rounded-full'>
            {objectCount} object{objectCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className='p-4 border-b border-gray-200'>
        <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg'>
          {[
            { key: 'basic', label: 'Basic', icon: '⚙️' },
            { key: 'exits', label: 'Exits', icon: '🚪' },
            { key: 'entities', label: 'Entities', icon: '👹' },
            { key: 'advanced', label: 'Advanced', icon: '🔧' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-2 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className='mr-1'>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className='flex-1 overflow-y-auto p-4'>
        {activeTab === 'basic' && (
          <div className='space-y-4'>
            {/* Room Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Room Name
              </label>
              <input
                type='text'
                value={room.name}
                onChange={e => onRoomChange('name', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter room name'
              />
            </div>

            {/* Description */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description
              </label>
              <textarea
                value={room.description}
                onChange={e => onRoomChange('description', e.target.value)}
                rows={5}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Describe what players see in this room'
              />
              <div className='text-xs text-gray-500 mt-1'>
                {room.description.length}/1000 characters
              </div>
            </div>

            {/* Sector Type */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Sector Type
              </label>
              <div className='grid grid-cols-3 gap-2'>
                {sectorOptions.map(sector => (
                  <button
                    key={sector.value}
                    onClick={() => onRoomChange('sector', sector.value)}
                    className={`p-3 text-center border-2 rounded-lg transition-colors ${
                      room.sector === sector.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className='text-lg mb-1'>{sector.icon}</div>
                    <div className='text-xs font-medium'>{sector.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Z-Level Control */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Z-Level (Elevation)
              </label>
              <div className='flex items-center space-x-3'>
                <button
                  onClick={() =>
                    onUpdateZLevel(room.id, (room.layoutZ ?? 0) - 1)
                  }
                  className='flex items-center justify-center w-8 h-8 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors'
                  title='Lower level (basement, underground)'
                >
                  ⬇️
                </button>

                <div className='flex-1 text-center'>
                  <div
                    className={`inline-flex items-center px-3 py-2 rounded-lg font-medium text-sm ${
                      (room.layoutZ ?? 0) > 0
                        ? 'bg-blue-100 text-blue-800'
                        : (room.layoutZ ?? 0) < 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {(room.layoutZ ?? 0) === 0
                      ? 'Ground Level'
                      : (room.layoutZ ?? 0) > 0
                        ? `Level +${room.layoutZ}`
                        : `Level ${room.layoutZ}`}
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {(room.layoutZ ?? 0) > 0
                      ? 'Above ground'
                      : (room.layoutZ ?? 0) < 0
                        ? 'Underground'
                        : 'Ground level'}
                  </div>
                </div>

                <button
                  onClick={() =>
                    onUpdateZLevel(room.id, (room.layoutZ ?? 0) + 1)
                  }
                  className='flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors'
                  title='Raise level (upper floor, tower)'
                >
                  ⬆️
                </button>
              </div>

              {/* Z-Level Quick Presets */}
              <div className='mt-3'>
                <div className='text-xs text-gray-600 mb-2'>Quick Presets:</div>
                <div className='flex flex-wrap gap-1'>
                  {[-3, -2, -1, 0, 1, 2, 3].map(level => (
                    <button
                      key={level}
                      onClick={() => onUpdateZLevel(room.id, level)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        (room.layoutZ ?? 0) === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {level === 0 ? 'Ground' : level > 0 ? `+${level}` : level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exits' && (
          <div className='space-y-4'>
            {/* Current Exits */}
            <div>
              <div className='flex items-center justify-between mb-3'>
                <h4 className='text-sm font-medium text-gray-700'>
                  Current Exits
                </h4>
                <button
                  onClick={() => setShowCreateExit(true)}
                  disabled={managingExits}
                  className='bg-green-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50'
                >
                  + Add Exit
                </button>
              </div>

              {room.exits.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <div className='text-2xl mb-2'>🚪</div>
                  <p className='text-sm'>No exits defined</p>
                  <p className='text-xs text-gray-400 mt-1'>
                    Add exits to connect this room to others
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {room.exits.map((exit, index) => {
                    const destRoom = allRooms.find(
                      r => r.id === exit.destination
                    );
                    const directionIcon =
                      directionOptions.find(d => d.value === exit.direction)
                        ?.icon || '→';

                    return (
                      <div
                        key={exit.id || index}
                        className='p-3 bg-gray-50 rounded-lg border'
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            <span className='text-lg'>{directionIcon}</span>
                            <span className='font-medium text-sm'>
                              {exit.direction}
                            </span>
                          </div>
                          <div className='flex gap-1'>
                            {destRoom && (
                              <button
                                onClick={() =>
                                  (window.location.href = `/dashboard/zones/editor?zone=${destRoom.zoneId}&room=${destRoom.id}`)
                                }
                                className='text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors'
                                title={`Navigate to ${destRoom.name}`}
                              >
                                🧭 Go
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteExit(exit.id)}
                              disabled={managingExits}
                              className='text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50'
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className='text-sm text-gray-600'>
                          →{' '}
                          {destRoom
                            ? `${destRoom.name} (Room ${destRoom.id})`
                            : `Room ${exit.destination || 'None'}`}
                          {!destRoom && exit.destination && (
                            <span className='text-red-500 ml-2'>
                              (Room not found)
                            </span>
                          )}
                        </div>

                        {exit.description && (
                          <div className='text-xs text-gray-500 mt-1'>
                            {exit.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Create Exit Form */}
            {showCreateExit && (
              <div className='border-t pt-4'>
                <h5 className='text-sm font-medium text-gray-700 mb-3'>
                  Create New Exit
                </h5>

                <div className='space-y-3'>
                  {/* Direction */}
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Direction
                    </label>
                    <select
                      value={newExitDirection}
                      onChange={e => setNewExitDirection(e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      {directionOptions.map(direction => (
                        <option key={direction.value} value={direction.value}>
                          {direction.icon} {direction.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination */}
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Destination Room
                    </label>
                    <select
                      value={newExitDestination}
                      onChange={e => setNewExitDestination(e.target.value)}
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      <option value=''>Select destination...</option>
                      {availableRooms.map(r => (
                        <option key={r.id} value={r.id}>
                          Room {r.id}: {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description (optional) */}
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Exit Description (Optional)
                    </label>
                    <input
                      type='text'
                      value={newExitDescription}
                      onChange={e => setNewExitDescription(e.target.value)}
                      placeholder='e.g., A wooden door leads north'
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>

                  {/* Keyword (optional) */}
                  <div>
                    <label className='block text-xs font-medium text-gray-700 mb-1'>
                      Keywords (Optional)
                    </label>
                    <input
                      type='text'
                      value={newExitKeyword}
                      onChange={e => setNewExitKeyword(e.target.value)}
                      placeholder='e.g., door gate'
                      className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                  </div>
                </div>

                <div className='flex gap-2 mt-4'>
                  <button
                    onClick={handleCreateExit}
                    disabled={
                      !newExitDirection || !newExitDestination || managingExits
                    }
                    className='flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50'
                  >
                    {managingExits ? 'Creating...' : 'Create Exit'}
                  </button>
                  <button
                    onClick={() => setShowCreateExit(false)}
                    className='px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'entities' && (
          <div className='space-y-4'>
            {/* Mobs in room */}
            <div>
              <h4 className='text-sm font-medium text-gray-700 mb-3'>
                Mobs ({mobCount})
              </h4>
              {mobCount === 0 ? (
                <div className='text-center py-6 text-gray-500'>
                  <div className='text-2xl mb-2'>👹</div>
                  <p className='text-sm'>No mobs in this room</p>
                  <p className='text-xs text-gray-400 mt-1'>
                    Drag mobs from the palette to place them here
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {room.mobs?.map(mob => (
                    <div
                      key={mob.id}
                      className='p-3 bg-red-50 border border-red-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <span className='font-medium text-sm'>
                            {mob.name}
                          </span>
                          <span className='text-xs text-gray-600 ml-2'>
                            Level {mob.level}
                          </span>
                        </div>
                        <div className='flex gap-1'>
                          <a
                            href={`/dashboard/mobs/editor?id=${mob.id}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors'
                            title='Edit mob in new tab'
                          >
                            ✏️ Edit
                          </a>
                          <button className='text-red-600 hover:text-red-800 text-xs px-2 py-1'>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Objects in room */}
            <div>
              <h4 className='text-sm font-medium text-gray-700 mb-3'>
                Objects ({objectCount})
              </h4>
              {objectCount === 0 ? (
                <div className='text-center py-6 text-gray-500'>
                  <div className='text-2xl mb-2'>📦</div>
                  <p className='text-sm'>No objects in this room</p>
                  <p className='text-xs text-gray-400 mt-1'>
                    Drag objects from the palette to place them here
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {room.objects?.map(obj => (
                    <div
                      key={obj.id}
                      className='p-3 bg-blue-50 border border-blue-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <span className='font-medium text-sm'>
                            {obj.name}
                          </span>
                          <span className='text-xs text-gray-600 ml-2'>
                            {obj.type}
                          </span>
                        </div>
                        <div className='flex gap-1'>
                          <a
                            href={`/dashboard/objects/editor?id=${obj.id}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-green-100 hover:bg-green-200 rounded transition-colors'
                            title='Edit object in new tab'
                          >
                            ✏️ Edit
                          </a>
                          <button className='text-blue-600 hover:text-blue-800 text-xs px-2 py-1'>
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className='space-y-4'>
            <div className='text-center py-8 text-gray-500'>
              <div className='text-2xl mb-2'>🔧</div>
              <p className='text-sm'>Advanced settings</p>
              <p className='text-xs text-gray-400 mt-1'>
                Room flags, special scripts, and triggers will go here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='p-4 border-t border-gray-200'>
        <button
          onClick={onSaveRoom}
          disabled={saving}
          className='w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {saving ? 'Saving Changes...' : 'Save Room'}
        </button>
      </div>
    </div>
  );
};
