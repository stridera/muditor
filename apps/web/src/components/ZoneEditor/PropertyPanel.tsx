'use client';

import { getExitDestinationZone, hasValidDestination } from '@/lib/room-utils';
import React, { useEffect, useState } from 'react';

interface Room {
  id: number;
  name: string;
  roomDescription: string;
  sector: string;
  zoneId: number;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
  exits: RoomExit[];
  mobs?: Array<{
    id: number;
    name: string;
    level: number;
    race?: string;
    mobClass?: string;
    zoneId?: number;
  }>;
  objects?: Array<{
    id: number;
    name: string;
    type: string;
    keywords?: string[];
    zoneId?: number;
  }>;
  shops?: Array<{
    id: number;
    buyProfit: number;
    sellProfit: number;
    keeperId: number;
    zoneId?: number;
  }>;
}

interface RoomExit {
  id: string;
  direction: string;
  toZoneId?: number | null;
  toRoomId?: number | null;
  description?: string;
  keywords?: string[];
  key?: string;
  flags?: string[];
}

interface PropertyPanelProps {
  room: Room;
  allRooms: Room[];
  onRoomChange: (field: keyof Room, value: string) => void;
  onSaveRoom: () => void;
  onCreateExit: (exitData: {
    direction: string;
    toZoneId: number;
    toRoomId: number;
  }) => void;
  onDeleteExit: (exitId: string) => void;
  onUpdateExit: (exitId: string, exitData: Partial<RoomExit>) => void;
  onSelectRoom: (roomId: number) => void;
  onNavigateToZone?: (zoneId: number, roomId: number) => void;
  onUpdateZLevel: (roomId: number, zLevel: number) => void;
  onRemoveMob?: (mobId: number) => void;
  onRemoveObject?: (objectId: number) => void;
  saving: boolean;
  managingExits: boolean;
  viewMode: 'edit' | 'view';
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
  onUpdateExit,
  onSelectRoom,
  onNavigateToZone,
  onUpdateZLevel,
  onRemoveMob,
  onRemoveObject,
  saving,
  managingExits,
  viewMode,
}) => {
  const [activeTab, setActiveTab] = useState<
    'basic' | 'exits' | 'entities' | 'advanced'
  >('basic');
  const [showCreateExit, setShowCreateExit] = useState(false);
  const [newExitDirection, setNewExitDirection] = useState('NORTH');
  const [newExitDestination, setNewExitDestination] = useState('');
  const [newExitDescription, setNewExitDescription] = useState('');
  const [newExitKeyword, setNewExitKeyword] = useState('');
  const [editingExitId, setEditingExitId] = useState<string | null>(null);
  const [editExitData, setEditExitData] = useState<Partial<RoomExit>>({});

  // Reset form when room changes
  useEffect(() => {
    setShowCreateExit(false);
    setNewExitDirection('NORTH');
    setNewExitDestination('');
    setNewExitDescription('');
    setNewExitKeyword('');
    setEditingExitId(null);
    setEditExitData({});
  }, [room.id]);

  const handleCreateExit = () => {
    if (newExitDirection && newExitDestination) {
      const destinationStr = newExitDestination.trim();
      if (!destinationStr) return;
      // Parse destination - could be "roomId" or "zoneId:roomId"
      let destZoneId: number;
      let destRoomId: number;

      if (destinationStr.includes(':')) {
        // Format: "zoneId:roomId"
        const parts = destinationStr.split(':');
        const zoneStr = parts[0] ?? '';
        const roomStr = parts[1] ?? '';
        destZoneId = parseInt(zoneStr, 10);
        destRoomId = parseInt(roomStr, 10);
      } else {
        // Format: "roomId" - assume same zone
        destZoneId = room.zoneId;
        destRoomId = parseInt(destinationStr, 10);
      }

      if (!isNaN(destZoneId) && !isNaN(destRoomId)) {
        onCreateExit({
          direction: newExitDirection,
          toZoneId: destZoneId,
          toRoomId: destRoomId,
        });
      }
      setShowCreateExit(false);
      setNewExitDirection('NORTH');
      setNewExitDestination(''); // always reset to empty string (never undefined)
      setNewExitDescription('');
      setNewExitKeyword('');
    }
  };

  const handleEditExit = (exit: RoomExit) => {
    setEditingExitId(exit.id);
    setEditExitData({
      description: exit.description || '',
      keywords: exit.keywords || [],
      key: exit.key || '',
      flags: exit.flags || [],
    });
  };

  const handleSaveExitEdit = () => {
    if (editingExitId) {
      onUpdateExit(editingExitId, editExitData);
      setEditingExitId(null);
      setEditExitData({});
    }
  };

  const handleCancelExitEdit = () => {
    setEditingExitId(null);
    setEditExitData({});
  };

  const availableRooms = allRooms.filter(r => r.id !== room.id);
  const mobCount = room.mobs?.length || 0;
  const objectCount = room.objects?.length || 0;
  const shopCount = room.shops?.length || 0;

  return (
    <div className='w-96 bg-white border-l border-gray-200 flex flex-col h-full'>
      {/* Header */}
      <div className='p-4 border-b border-gray-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Room {room.id} Properties
        </h3>

        {/* Layout Coordinates (Debug) */}
        <div className='bg-gray-50 rounded px-2 py-1.5 mb-3 border border-gray-200'>
          <div className='text-xs font-mono text-gray-600'>
            <span className='font-semibold'>Layout:</span>{' '}
            <span className='text-gray-800'>
              X={room.layoutX ?? 'null'}, Y={room.layoutY ?? 'null'}, Z=
              {room.layoutZ ?? 0}
            </span>
          </div>
        </div>

        {/* Quick stats */}
        <div className='flex gap-2 text-xs mb-3'>
          <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full'>
            {room.exits.length} exit{room.exits.length !== 1 ? 's' : ''}
          </span>
          <span className='bg-green-100 text-green-800 px-2 py-1 rounded-full'>
            {mobCount} mob{mobCount !== 1 ? 's' : ''}
          </span>
          <span className='bg-purple-100 text-purple-800 px-2 py-1 rounded-full'>
            {objectCount} object{objectCount !== 1 ? 's' : ''}
          </span>
          {shopCount > 0 && (
            <span className='bg-amber-100 text-amber-800 px-2 py-1 rounded-full'>
              {shopCount} shop{shopCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Room Navigation & Z-Level Controls */}
        <div className='space-y-3'>
          {/* Z-Level Controls */}
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium text-gray-700 min-w-[45px]'>
              Floor:
            </span>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => onUpdateZLevel(room.id, (room.layoutZ ?? 0) - 1)}
                className='flex items-center justify-center w-7 h-7 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-bold transition-colors'
                title='Lower floor (Ctrl+↓)'
              >
                ⬇️
              </button>
              <div className='px-3 py-1 text-sm font-medium text-gray-700 min-w-[60px] text-center bg-gray-50 rounded border'>
                {(room.layoutZ ?? 0) === 0
                  ? 'Ground'
                  : `${(room.layoutZ ?? 0) > 0 ? '+' : ''}${room.layoutZ}`}
              </div>
              <button
                onClick={() => onUpdateZLevel(room.id, (room.layoutZ ?? 0) + 1)}
                className='flex items-center justify-center w-7 h-7 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-bold transition-colors'
                title='Raise floor (Ctrl+↑)'
              >
                ⬆️
              </button>
            </div>
          </div>

          {/* Available Exits Navigation (View Mode) */}
          {viewMode === 'view' && room.exits.length > 0 && (
            <div>
              <div className='text-sm font-medium text-gray-700 mb-2'>
                🧭 Available exits:
              </div>
              <div className='flex flex-wrap gap-1'>
                {room.exits.map(exit => {
                  const directionIcon =
                    {
                      NORTH: '⬆️',
                      SOUTH: '⬇️',
                      EAST: '➡️',
                      WEST: '⬅️',
                      NORTHEAST: '↗️',
                      NORTHWEST: '↖️',
                      SOUTHEAST: '↘️',
                      SOUTHWEST: '↙️',
                      UP: '🔺',
                      DOWN: '🔻',
                    }[exit.direction] || '➤';

                  // Use toZoneId and toRoomId if available
                  const destZoneId = getExitDestinationZone(exit, room.zoneId);
                  const destRoomId = exit.toRoomId;
                  const destinationRoom = allRooms.find(
                    r => r.id === destRoomId && r.zoneId === destZoneId
                  );
                  const isInZone =
                    destZoneId === room.zoneId && !!destinationRoom;

                  return (
                    <span
                      key={exit.id}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs ${
                        isInZone
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                      title={
                        isInZone
                          ? `${exit.direction}: ${destinationRoom?.name} (Room ${destRoomId})`
                          : `${exit.direction}: Zone ${destZoneId}, Room ${destRoomId}${destinationRoom ? ` - ${destinationRoom.name}` : ''}`
                      }
                    >
                      <span>{directionIcon}</span>
                      <span className='font-medium'>
                        {exit.direction.toLowerCase()}
                      </span>
                    </span>
                  );
                })}
              </div>
              <div className='text-xs text-gray-500 mt-2'>
                💡 Use arrow keys to navigate, Page Up/Down for UP/DOWN
              </div>
            </div>
          )}
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
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
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
                value={room.roomDescription}
                onChange={e => onRoomChange('roomDescription', e.target.value)}
                rows={5}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Describe what players see in this room'
              />
              <div className='text-xs text-gray-500 mt-1'>
                {room.roomDescription?.length || 0}/1000 characters
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
                    // Use toZoneId and toRoomId if available
                    const destZoneId = getExitDestinationZone(
                      exit,
                      room.zoneId
                    );
                    const destRoomId = exit.toRoomId;
                    const destRoom = allRooms.find(
                      r => r.id === destRoomId && r.zoneId === destZoneId
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
                            {destRoom && destZoneId === room.zoneId && (
                              <button
                                onClick={() => {
                                  console.log(
                                    '🧭 Go button clicked - selecting room:',
                                    destRoom.id,
                                    destRoom.name
                                  );
                                  onSelectRoom(destRoom.id);
                                }}
                                className='text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors'
                                title={`Select ${destRoom.name}`}
                              >
                                🧭 Go
                              </button>
                            )}
                            {destZoneId !== room.zoneId &&
                              destRoomId &&
                              onNavigateToZone && (
                                <button
                                  onClick={() => {
                                    console.log(
                                      '🌍 Go to Zone button clicked - navigating to zone:',
                                      destZoneId,
                                      'room:',
                                      destRoomId
                                    );
                                    onNavigateToZone(destZoneId, destRoomId);
                                  }}
                                  className='text-purple-600 hover:text-purple-800 text-xs px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded transition-colors'
                                  title={`Go to Zone ${destZoneId}, Room ${destRoomId}`}
                                >
                                  🌍 Go to Zone
                                </button>
                              )}
                            {viewMode === 'edit' && (
                              <button
                                onClick={() => handleEditExit(exit)}
                                className='text-green-600 hover:text-green-800 text-xs px-2 py-1 bg-green-100 hover:bg-green-200 rounded transition-colors'
                                title='Edit exit properties'
                              >
                                ✏️ Edit
                              </button>
                            )}
                            {viewMode === 'edit' && (
                              <button
                                onClick={() => onDeleteExit(exit.id)}
                                disabled={managingExits}
                                className='text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50'
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>

                        <div className='text-sm text-gray-600'>
                          →{' '}
                          {destRoom
                            ? `${destRoom.name} (${destZoneId !== room.zoneId ? `Zone ${destZoneId}, ` : ''}Room ${destRoomId})`
                            : `Zone ${destZoneId}, Room ${destRoomId !== null && destRoomId !== undefined ? destRoomId : 'None'}`}
                          {!destRoom &&
                            hasValidDestination(exit) &&
                            destZoneId === room.zoneId && (
                              <span className='text-red-500 ml-2'>
                                (Room not found)
                              </span>
                            )}
                        </div>

                        {/* Exit State Badges */}
                        {(exit.flags?.length ||
                          exit.keywords?.length ||
                          exit.key) && (
                          <div className='flex flex-wrap gap-1 mt-2'>
                            {exit.flags?.includes('IS_DOOR') && (
                              <span className='inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-300'>
                                🚪 Door
                              </span>
                            )}
                            {exit.flags?.includes('CLOSED') && (
                              <span className='inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-300'>
                                🚧 Closed
                              </span>
                            )}
                            {exit.flags?.includes('LOCKED') && (
                              <span className='inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-300'>
                                🔒 Locked
                              </span>
                            )}
                            {exit.flags?.includes('PICKPROOF') && (
                              <span className='inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-300'>
                                🛡️ Pickproof
                              </span>
                            )}
                            {exit.flags?.includes('HIDDEN') && (
                              <span className='inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border border-gray-300'>
                                👁️ Hidden
                              </span>
                            )}
                            {exit.keywords?.map((keyword, idx) => (
                              <span
                                key={idx}
                                className='inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-300'
                              >
                                🔑 {keyword}
                              </span>
                            ))}
                            {exit.key && (
                              <span className='inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-300'>
                                🗝️ Key: {exit.key}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Exit Description */}
                        {exit.description && (
                          <div className='mt-2 p-2 bg-gray-50 rounded border border-gray-200'>
                            <div className='text-xs font-medium text-gray-500 mb-1'>
                              Description:
                            </div>
                            <div className='text-xs text-gray-700 italic'>
                              {exit.description}
                            </div>
                          </div>
                        )}

                        {/* Exit Editing Form */}
                        {editingExitId === exit.id && (
                          <div className='mt-3 p-3 bg-white border border-blue-200 rounded-lg'>
                            <h6 className='text-sm font-medium text-gray-700 mb-3'>
                              Edit Exit Properties
                            </h6>

                            <div className='space-y-3'>
                              {/* Description */}
                              <div>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>
                                  Description
                                </label>
                                <input
                                  type='text'
                                  value={editExitData.description || ''}
                                  onChange={e =>
                                    setEditExitData({
                                      ...editExitData,
                                      description: e.target.value,
                                    })
                                  }
                                  placeholder='e.g., A wooden door leads north'
                                  className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                                />
                              </div>

                              {/* Keywords */}
                              <div>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>
                                  Keywords (comma-separated)
                                </label>
                                <input
                                  type='text'
                                  value={(editExitData.keywords || []).join(
                                    ', '
                                  )}
                                  onChange={e =>
                                    setEditExitData({
                                      ...editExitData,
                                      keywords: e.target.value
                                        .split(',')
                                        .map(k => k.trim())
                                        .filter(k => k),
                                    })
                                  }
                                  placeholder='e.g., door, gate, entrance'
                                  className='w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                                />
                              </div>

                              {/* Exit Flags */}
                              <div className='space-y-2'>
                                <label className='block text-xs font-medium text-gray-700 mb-1'>
                                  Exit Flags
                                </label>

                                {[
                                  'IS_DOOR',
                                  'CLOSED',
                                  'LOCKED',
                                  'PICKPROOF',
                                  'HIDDEN',
                                ].map(flag => (
                                  <div
                                    key={flag}
                                    className='flex items-center gap-2'
                                  >
                                    <input
                                      type='checkbox'
                                      id={`${flag}-${exit.id}`}
                                      checked={(
                                        editExitData.flags || []
                                      ).includes(flag)}
                                      onChange={e => {
                                        const currentFlags =
                                          editExitData.flags || [];
                                        setEditExitData({
                                          ...editExitData,
                                          flags: e.target.checked
                                            ? [...currentFlags, flag]
                                            : currentFlags.filter(
                                                f => f !== flag
                                              ),
                                        });
                                      }}
                                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                    />
                                    <label
                                      htmlFor={`${flag}-${exit.id}`}
                                      className='text-xs text-gray-700'
                                    >
                                      {flag === 'IS_DOOR'
                                        ? '🚪 Door'
                                        : flag === 'CLOSED'
                                          ? '🚧 Closed'
                                          : flag === 'LOCKED'
                                            ? '🔒 Locked'
                                            : flag === 'PICKPROOF'
                                              ? '🛡️ Pickproof'
                                              : '👁️ Hidden'}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className='flex gap-2 mt-4'>
                              <button
                                onClick={handleSaveExitEdit}
                                className='flex-1 bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700 transition-colors'
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelExitEdit}
                                className='px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors'
                              >
                                Cancel
                              </button>
                            </div>
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
                      Destination Zone & Room
                    </label>
                    <div className='flex gap-2'>
                      <input
                        type='number'
                        placeholder='Zone ID'
                        value={newExitDestination.split(':')[0] || room.zoneId}
                        onChange={e => {
                          const zoneId = e.target.value;
                          const roomId = newExitDestination.split(':')[1] || '';
                          setNewExitDestination(
                            zoneId && roomId
                              ? `${zoneId}:${roomId}`
                              : zoneId || roomId
                          );
                        }}
                        className='w-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        title='Zone ID'
                      />
                      <input
                        type='number'
                        placeholder='Room ID'
                        value={
                          newExitDestination.split(':')[1] || newExitDestination
                        }
                        onChange={e => {
                          const zoneId =
                            newExitDestination.split(':')[0] ||
                            room.zoneId.toString();
                          const roomId = e.target.value;
                          setNewExitDestination(
                            roomId ? `${zoneId}:${roomId}` : ''
                          );
                        }}
                        className='flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                        title='Room ID'
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-1'>
                      💡 Enter zone:room (e.g., {room.zoneId}:25 for same zone,
                      30:43 for different zone)
                    </p>
                  </div>

                  {/* Quick select from current zone */}
                  {availableRooms.length > 0 && (
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Or select from current zone:
                      </label>
                      <select
                        value={
                          newExitDestination.includes(':')
                            ? ''
                            : newExitDestination
                        }
                        onChange={e => setNewExitDestination(e.target.value)}
                        className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      >
                        <option value=''>Select from current zone...</option>
                        {availableRooms.map(r => (
                          <option key={r.id} value={r.id}>
                            Room {r.id}: {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='font-medium text-sm'>
                              {mob.name}
                            </span>
                            <span className='text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded'>
                              Level {mob.level}
                            </span>
                          </div>
                          <div className='flex gap-1'>
                            {mob.race && (
                              <span className='text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-gray-700'>
                                {mob.race}
                              </span>
                            )}
                            {mob.mobClass && (
                              <span className='text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-gray-700'>
                                {mob.mobClass}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='flex gap-1'>
                          <a
                            href={`/dashboard/mobs/editor?zoneId=${mob.zoneId}&id=${mob.id}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-600 hover:text-blue-800 text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded transition-colors'
                            title='Edit mob in new tab'
                          >
                            ✏️ Edit
                          </a>
                          {viewMode === 'edit' && onRemoveMob && (
                            <button
                              onClick={() => onRemoveMob(mob.id)}
                              className='text-red-600 hover:text-red-800 text-xs px-2 py-1 hover:bg-red-50 rounded transition-colors'
                            >
                              Remove
                            </button>
                          )}
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
                      className='p-3 bg-purple-50 border border-purple-200 rounded-lg'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span className='font-medium text-sm'>
                              {obj.name}
                            </span>
                            <span className='text-xs text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded'>
                              {obj.type}
                            </span>
                          </div>
                          {obj.keywords && obj.keywords.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-1'>
                              {obj.keywords.map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className='text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-gray-700'
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className='flex gap-1'>
                          <a
                            href={`/dashboard/objects/editor?zoneId=${obj.zoneId}&id=${obj.id}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-purple-600 hover:text-purple-800 text-xs px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded transition-colors'
                            title='Edit object in new tab'
                          >
                            ✏️ Edit
                          </a>
                          {viewMode === 'edit' && onRemoveObject && (
                            <button
                              onClick={() => onRemoveObject(obj.id)}
                              className='text-red-600 hover:text-red-800 text-xs px-2 py-1 hover:bg-red-50 rounded transition-colors'
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shops in room */}
            <div>
              <h4 className='text-sm font-medium text-gray-700 mb-3'>
                Shops ({shopCount})
              </h4>
              {shopCount === 0 ? (
                <div className='text-center py-6 text-gray-500'>
                  <div className='text-2xl mb-2'>🏪</div>
                  <p className='text-sm'>No shops in this room</p>
                  <p className='text-xs text-gray-400 mt-1'>
                    Shops are managed by specific shopkeeper mobs
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {room.shops?.map(shop => {
                    // Find the shopkeeper mob for this shop
                    const shopkeeper = room.mobs?.find(
                      mob => mob.id === shop.keeperId
                    );
                    return (
                      <div
                        key={shop.id}
                        className='p-3 bg-amber-50 border border-amber-200 rounded-lg'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <span className='font-medium text-sm'>
                                🏪 Shop #{shop.id}
                              </span>
                              {shopkeeper && (
                                <span className='text-xs text-gray-600'>
                                  Keeper: {shopkeeper.name}
                                </span>
                              )}
                            </div>
                            <div className='flex gap-2 text-xs'>
                              <span className='bg-green-100 text-green-700 px-2 py-0.5 rounded'>
                                Buys at {Math.round(shop.buyProfit * 100)}%
                              </span>
                              <span className='bg-red-100 text-red-700 px-2 py-0.5 rounded'>
                                Sells at {Math.round(shop.sellProfit * 100)}%
                              </span>
                            </div>
                          </div>
                          <div className='flex gap-1'>
                            <a
                              href={`/dashboard/shops/editor?zoneId=${shop.zoneId}&id=${shop.id}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='text-amber-600 hover:text-amber-800 text-xs px-2 py-1 bg-amber-100 hover:bg-amber-200 rounded transition-colors'
                              title='Edit shop in new tab'
                            >
                              ✏️ Edit
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
