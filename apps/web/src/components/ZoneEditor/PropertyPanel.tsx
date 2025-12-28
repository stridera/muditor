'use client';

import {
  getExitDestinationZone,
  hasValidDestination,
  isValidRoomId,
} from '@/lib/room-utils';
import { ColoredTextEditor } from '@/components/ColoredTextEditor';
import { ColoredTextInline } from '@/components/ColoredTextViewer';
import { useTheme } from 'next-themes';
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
  flags?: string[];
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
  zones?: Array<{ id: number; name: string }>; // For cross-zone exit display
  onRoomChange: (field: keyof Room, value: string | string[]) => void;
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
  onEntityClick?: (entity: {
    type: 'mob' | 'object' | 'shop';
    id: number;
  }) => void;
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
  zones = [],
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
  onEntityClick,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div
      className={`w-96 ${isDark ? 'bg-gray-800' : 'bg-white'} border-l ${isDark ? 'border-gray-700' : 'border-gray-200'} flex flex-col h-full`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <h3
          className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-2`}
        >
          Room {room.id}: <ColoredTextInline markup={room.name} />
        </h3>

        {/* Condensed Meta Strip (no duplicate exits/entities) */}
        <div className='mb-4'>
          <div
            className={`flex flex-wrap items-center gap-2 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            <div
              className={`px-2 py-1 rounded-md font-mono ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
            >
              X:{room.layoutX ?? '∅'} Y:{room.layoutY ?? '∅'} Z:
              {room.layoutZ ?? 0}
            </div>
            {(() => {
              const sector = sectorOptions.find(s => s.value === room.sector);
              return (
                <div
                  className={`px-2 py-1 rounded-md flex items-center gap-1 ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
                  title={`Sector: ${sector?.label || room.sector}`}
                >
                  <span>{sector?.icon || '❓'}</span>
                  <span className='font-medium'>
                    {sector?.label || room.sector}
                  </span>
                </div>
              );
            })()}
            {viewMode === 'edit' ? (
              <div className='flex items-center gap-1'>
                <button
                  onClick={() =>
                    onUpdateZLevel(room.id, (room.layoutZ ?? 0) - 1)
                  }
                  className='w-6 h-6 flex items-center justify-center rounded bg-red-100 text-red-700 hover:bg-red-200 font-bold'
                  title='Lower floor (Ctrl+↓)'
                >
                  -
                </button>
                <div
                  className={`px-2 py-1 rounded-md ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
                >
                  {(room.layoutZ ?? 0) === 0
                    ? 'Ground'
                    : `${(room.layoutZ ?? 0) > 0 ? '+' : ''}${room.layoutZ}`}
                </div>
                <button
                  onClick={() =>
                    onUpdateZLevel(room.id, (room.layoutZ ?? 0) + 1)
                  }
                  className='w-6 h-6 flex items-center justify-center rounded bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold'
                  title='Raise floor (Ctrl+↑)'
                >
                  +
                </button>
              </div>
            ) : (
              <div
                className={`px-2 py-1 rounded-md ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
              >
                Floor:{' '}
                {(room.layoutZ ?? 0) === 0
                  ? 'Ground'
                  : `${(room.layoutZ ?? 0) > 0 ? '+' : ''}${room.layoutZ}`}
              </div>
            )}
            <span
              className={`px-2 py-1 rounded-md ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
            >
              {room.exits.length} exit{room.exits.length !== 1 ? 's' : ''}
            </span>
            {mobCount > 0 && (
              <span
                className={`px-2 py-1 rounded-md ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
              >
                {mobCount} mob{mobCount !== 1 ? 's' : ''}
              </span>
            )}
            {objectCount > 0 && (
              <span
                className={`px-2 py-1 rounded-md ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
              >
                {objectCount} object{objectCount !== 1 ? 's' : ''}
              </span>
            )}
            {shopCount > 0 && (
              <span
                className={`px-2 py-1 rounded-md ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-800'}`}
              >
                {shopCount} shop{shopCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      {viewMode === 'edit' && (
        <div
          className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <div
            className={`flex space-x-1 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} p-1 rounded-lg`}
          >
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
                    ? isDark
                      ? 'bg-gray-600 text-blue-400 shadow-sm'
                      : 'bg-white text-blue-700 shadow-sm'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className='mr-1'>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4'>
        {viewMode === 'view' && (
          <div className='space-y-6'>
            {/* Description */}
            <section>
              <h4
                className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
              >
                Description
              </h4>
              <div
                className={`${isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-700'} rounded-md p-3 text-sm leading-relaxed whitespace-pre-wrap`}
              >
                {room.roomDescription || 'No description.'}
              </div>
            </section>

            {/* (Sector moved to header meta strip) */}

            {/* Exits */}
            <section>
              <h4
                className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
              >
                🚪 Exits{' '}
                <span className='text-xs font-normal px-2 py-0.5 rounded-full bg-blue-100 text-blue-700'>
                  {room.exits.length}
                </span>
              </h4>
              {room.exits.length === 0 ? (
                <div className='text-xs italic text-gray-500'>No exits.</div>
              ) : (
                <ul className='space-y-2'>
                  {room.exits.map(exit => {
                    const destZoneId = getExitDestinationZone(
                      exit,
                      room.zoneId
                    );
                    const rawRoomId = exit.toRoomId as
                      | number
                      | string
                      | undefined
                      | null;
                    const destRoomId =
                      typeof rawRoomId === 'string'
                        ? parseInt(rawRoomId, 10)
                        : (rawRoomId ?? undefined);
                    const destinationRoom = allRooms.find(
                      r => r.id === destRoomId && r.zoneId === destZoneId
                    );
                    const icon =
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
                    return (
                      <li
                        key={exit.id}
                        className={`border rounded-md p-2 text-xs ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2 font-medium'>
                            <span>{icon}</span>
                            <span className='uppercase tracking-wide'>
                              {exit.direction}
                            </span>
                          </div>
                          <div className='text-[10px] font-mono opacity-60'>
                            ID:{destZoneId}:{destRoomId ?? '∅'}
                          </div>
                        </div>
                        <div className='mt-1 text-gray-600 dark:text-gray-300'>
                          {destinationRoom ? (
                            <span>
                              {destinationRoom.name} (Room {destRoomId}
                              {destZoneId !== room.zoneId
                                ? ` / Zone ${destZoneId}`
                                : ''}
                              )
                            </span>
                          ) : destZoneId !== room.zoneId ? (
                            // Cross-zone exit - show zone name and portal indicator
                            <span className='flex items-center gap-1'>
                              <span className='text-purple-600 dark:text-purple-400'>
                                🌐 Portal:
                              </span>
                              <span className='font-medium'>
                                {zones.find(z => z.id === destZoneId)?.name ||
                                  `Zone ${destZoneId}`}
                              </span>
                              <span className='text-xs opacity-75'>
                                (Room {destRoomId})
                              </span>
                            </span>
                          ) : (
                            <span className='italic'>Unlinked destination</span>
                          )}
                        </div>
                        {(exit.flags?.length ||
                          exit.keywords?.length ||
                          exit.key) && (
                          <div className='mt-2 flex flex-wrap gap-1'>
                            {exit.flags?.includes('IS_DOOR') && (
                              <span className='px-2 py-0.5 text-[10px] rounded-full bg-gray-100 text-gray-700 border border-gray-300'>
                                Door
                              </span>
                            )}
                            {exit.flags?.includes('CLOSED') && (
                              <span className='px-2 py-0.5 text-[10px] rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300'>
                                Closed
                              </span>
                            )}
                            {exit.flags?.includes('LOCKED') && (
                              <span className='px-2 py-0.5 text-[10px] rounded-full bg-red-100 text-red-700 border border-red-300'>
                                Locked
                              </span>
                            )}
                            {exit.flags?.includes('PICKPROOF') && (
                              <span className='px-2 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700 border border-purple-300'>
                                Pickproof
                              </span>
                            )}
                            {exit.key && (
                              <span className='px-2 py-0.5 text-[10px] rounded-full bg-blue-100 text-blue-700 border border-blue-300'>
                                Key
                              </span>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Entities */}
            <section>
              <h4
                className={`text-sm font-semibold mb-2 flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
              >
                👹 Entities
                <span className='text-xs font-normal px-2 py-0.5 rounded-full bg-green-100 text-green-700'>
                  {(room.mobs?.length || 0) +
                    (room.objects?.length || 0) +
                    (room.shops?.length || 0)}{' '}
                  total
                </span>
              </h4>
              {!room.mobs?.length &&
                !room.objects?.length &&
                !room.shops?.length && (
                  <div className='text-xs italic text-gray-500'>
                    No entities.
                  </div>
                )}
              <div className='space-y-4'>
                {room.mobs?.length ? (
                  <div>
                    <h5 className='text-xs uppercase tracking-wide font-medium mb-1 opacity-70'>
                      Mobs{' '}
                      <span className='ml-1 font-normal'>
                        ({room.mobs.length})
                      </span>
                    </h5>
                    <ul className='space-y-1'>
                      {room.mobs.map(m => (
                        <li
                          key={m.id}
                          className={`text-xs flex items-center justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          <button
                            type='button'
                            onClick={() =>
                              onEntityClick?.({ type: 'mob', id: m.id })
                            }
                            className='font-medium hover:underline text-left'
                          >
                            {m.name}
                          </button>
                          <span className='opacity-60'>
                            Lv{m.level}
                            {m.race ? ` / ${m.race}` : ''}
                            {m.mobClass ? ` / ${m.mobClass}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {room.objects?.length ? (
                  <div>
                    <h5 className='text-xs uppercase tracking-wide font-medium mb-1 opacity-70'>
                      Objects{' '}
                      <span className='ml-1 font-normal'>
                        ({room.objects.length})
                      </span>
                    </h5>
                    <ul className='space-y-1'>
                      {room.objects.map(o => (
                        <li
                          key={o.id}
                          className={`text-xs flex items-center justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                        >
                          <button
                            type='button'
                            onClick={() =>
                              onEntityClick?.({ type: 'object', id: o.id })
                            }
                            className='font-medium hover:underline text-left'
                          >
                            {o.name}
                          </button>
                          <span className='opacity-60'>{o.type}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {room.shops?.length ? (
                  <div>
                    <h5 className='text-xs uppercase tracking-wide font-medium mb-1 opacity-70'>
                      Shops{' '}
                      <span className='ml-1 font-normal'>
                        ({room.shops.length})
                      </span>
                    </h5>
                    <ul className='space-y-1'>
                      {room.shops.map(s => {
                        const keeper = room.mobs?.find(
                          m => m.id === s.keeperId
                        );
                        const label = keeper
                          ? `${keeper.name}'s Shop`
                          : `Shopkeeper ${s.keeperId}`;
                        return (
                          <li
                            key={s.id}
                            className={`text-xs flex items-center justify-between ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                          >
                            <button
                              type='button'
                              onClick={() =>
                                onEntityClick?.({ type: 'shop', id: s.id })
                              }
                              className='font-medium hover:underline text-left'
                            >
                              {label}
                            </button>
                            <span className='opacity-60'>
                              Buy {s.buyProfit}% / Sell {s.sellProfit}%
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>

            {/* Identifiers */}
            <section>
              <h4
                className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}
              >
                Identifiers
              </h4>
              <div
                className={`grid grid-cols-2 gap-3 text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                <div>
                  <div className='font-medium'>Room ID</div>
                  <div className='font-mono'>{room.id}</div>
                </div>
                <div>
                  <div className='font-medium'>Zone ID</div>
                  <div className='font-mono'>{room.zoneId}</div>
                </div>
              </div>
            </section>
          </div>
        )}
        {viewMode === 'edit' && activeTab === 'basic' && (
          <div className='space-y-4'>
            {/* Room Name */}
            <div>
              <label
                className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}
              >
                Room Name
              </label>
              <ColoredTextEditor
                value={room.name}
                onChange={value => onRoomChange('name', value)}
                placeholder='Enter room name'
                maxLength={80}
                showPreview={true}
              />
            </div>

            {/* Description */}
            <div>
              <label
                className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}
              >
                Description
              </label>
              <ColoredTextEditor
                value={room.roomDescription}
                onChange={value => onRoomChange('roomDescription', value)}
                placeholder='Describe what players see in this room'
                maxLength={1000}
                showPreview={true}
              />
              <div className='text-xs text-gray-500 mt-1'>
                {room.roomDescription?.length || 0}/1000 characters
              </div>
            </div>

            {/* Sector Type */}
            <div>
              <label
                className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}
              >
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

        {viewMode === 'edit' && activeTab === 'exits' && (
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
                              isValidRoomId(destRoomId) &&
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
                            : `Zone ${destZoneId}, Room ${isValidRoomId(destRoomId) ? destRoomId : 'None'}`}
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
                            zoneId !== '' && roomId !== ''
                              ? `${zoneId}:${roomId}`
                              : zoneId !== ''
                                ? zoneId
                                : roomId
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

        {viewMode === 'edit' && activeTab === 'entities' && (
          <div className='space-y-4'>
            {/* Mobs in room */}
            <div>
              <h4
                className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Mobs ({mobCount})
              </h4>
              {mobCount === 0 ? (
                <div
                  className={`text-center py-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <div className='text-2xl mb-2'>👹</div>
                  <p className='text-sm'>No mobs in this room</p>
                  <p
                    className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    Drag mobs from the palette to place them here
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {room.mobs?.map(mob => (
                    <div
                      key={mob.id}
                      className={`p-3 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-800/50' : 'bg-red-50 border-red-200'}`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span
                              className={`font-medium text-sm ${isDark ? 'text-red-200' : 'text-gray-900'}`}
                            >
                              {mob.name}
                            </span>
                            {mob.level && (
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'text-gray-600 bg-gray-100'}`}
                              >
                                Level {mob.level}
                              </span>
                            )}
                          </div>
                          <div className='flex gap-1'>
                            {mob.race && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white bg-opacity-60 text-gray-700'}`}
                              >
                                {mob.race}
                              </span>
                            )}
                            {mob.mobClass && (
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white bg-opacity-60 text-gray-700'}`}
                              >
                                {mob.mobClass}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className='flex gap-1'>
                          <a
                            href={`/dashboard/mobs/editor?zone={mob.zoneId}&id=${mob.id}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className={`text-xs px-2 py-1 rounded transition-colors ${isDark ? 'text-blue-400 bg-blue-900/30 hover:bg-blue-900/50' : 'text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200'}`}
                            title='Edit mob in new tab'
                          >
                            ✏️ Edit
                          </a>
                          {viewMode === 'edit' && onRemoveMob && (
                            <button
                              onClick={() => onRemoveMob(mob.id)}
                              className={`text-xs px-2 py-1 rounded transition-colors ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`}
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
              <h4
                className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Objects ({objectCount})
              </h4>
              {objectCount === 0 ? (
                <div
                  className={`text-center py-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <div className='text-2xl mb-2'>📦</div>
                  <p className='text-sm'>No objects in this room</p>
                  <p
                    className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                  >
                    Drag objects from the palette to place them here
                  </p>
                </div>
              ) : (
                <div className='space-y-2'>
                  {room.objects?.map(obj => (
                    <div
                      key={obj.id}
                      className={`p-3 rounded-lg border ${isDark ? 'bg-purple-900/20 border-purple-800/50' : 'bg-purple-50 border-purple-200'}`}
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2 mb-1'>
                            <span
                              className={`font-medium text-sm ${isDark ? 'text-purple-200' : 'text-gray-900'}`}
                            >
                              {obj.name}
                            </span>
                            {obj.type && (
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'text-gray-600 bg-gray-100'}`}
                              >
                                {obj.type}
                              </span>
                            )}
                          </div>
                          {obj.keywords && obj.keywords.length > 0 && (
                            <div className='flex flex-wrap gap-1 mt-1'>
                              {obj.keywords.map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-white bg-opacity-60 text-gray-700'}`}
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className='flex gap-1'>
                          <a
                            href={`/dashboard/objects/editor?zone={obj.zoneId}&id=${obj.id}`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className={`text-xs px-2 py-1 rounded transition-colors ${isDark ? 'text-purple-400 bg-purple-900/30 hover:bg-purple-900/50' : 'text-purple-600 hover:text-purple-800 bg-purple-100 hover:bg-purple-200'}`}
                            title='Edit object in new tab'
                          >
                            ✏️ Edit
                          </a>
                          {viewMode === 'edit' && onRemoveObject && (
                            <button
                              onClick={() => onRemoveObject(obj.id)}
                              className={`text-xs px-2 py-1 rounded transition-colors ${isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:text-red-800 hover:bg-red-50'}`}
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
              <h4
                className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Shops ({shopCount})
              </h4>
              {shopCount === 0 ? (
                <div
                  className={`text-center py-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  <div className='text-2xl mb-2'>🏪</div>
                  <p className='text-sm'>No shops in this room</p>
                  <p
                    className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                  >
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
                        className={`p-3 rounded-lg border ${isDark ? 'bg-amber-900/20 border-amber-800/50' : 'bg-amber-50 border-amber-200'}`}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                              <span
                                className={`font-medium text-sm ${isDark ? 'text-amber-200' : 'text-gray-900'}`}
                              >
                                🏪 Shop #{shop.id}
                              </span>
                              {shopkeeper && (
                                <span
                                  className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                                >
                                  Keeper: {shopkeeper.name}
                                </span>
                              )}
                            </div>
                            <div className='flex gap-2 text-xs'>
                              <span
                                className={`px-2 py-0.5 rounded ${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'}`}
                              >
                                Buys at {Math.round(shop.buyProfit * 100)}%
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}
                              >
                                Sells at {Math.round(shop.sellProfit * 100)}%
                              </span>
                            </div>
                          </div>
                          <div className='flex gap-1'>
                            <a
                              href={`/dashboard/shops/editor?zone={shop.zoneId}&id=${shop.id}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className={`text-xs px-2 py-1 rounded transition-colors ${isDark ? 'text-amber-400 bg-amber-900/30 hover:bg-amber-900/50' : 'text-amber-600 hover:text-amber-800 bg-amber-100 hover:bg-amber-200'}`}
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

        {viewMode === 'edit' && activeTab === 'advanced' && (
          <div className='space-y-4'>
            <h4
              className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Room Flags
            </h4>

            {/* Environment & Lighting */}
            <div
              className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              <h5
                className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Environment & Lighting
              </h5>
              <div className='grid grid-cols-2 gap-2'>
                {[
                  {
                    flag: 'DARK',
                    label: '🌑 Dark',
                    desc: 'Room is dark without light',
                  },
                  {
                    flag: 'ALWAYS_LIT',
                    label: '☀️ Always Lit',
                    desc: 'Never dark',
                  },
                  {
                    flag: 'INDOORS',
                    label: '🏠 Indoors',
                    desc: 'Inside a building',
                  },
                  {
                    flag: 'UNDERDARK',
                    label: '🕳️ Underdark',
                    desc: 'Underground area',
                  },
                ].map(({ flag, label, desc }) => (
                  <label
                    key={flag}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      (room.flags || []).includes(flag)
                        ? isDark
                          ? 'bg-blue-900/40 border border-blue-700'
                          : 'bg-blue-50 border border-blue-200'
                        : isDark
                          ? 'hover:bg-gray-600'
                          : 'hover:bg-gray-100'
                    }`}
                    title={desc}
                  >
                    <input
                      type='checkbox'
                      checked={(room.flags || []).includes(flag)}
                      onChange={e => {
                        const currentFlags = room.flags || [];
                        const newFlags = e.target.checked
                          ? [...currentFlags, flag]
                          : currentFlags.filter(f => f !== flag);
                        onRoomChange('flags', newFlags);
                      }}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='text-xs'>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Room Size */}
            <div
              className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              <h5
                className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Room Size (Combat)
              </h5>
              <div className='grid grid-cols-2 gap-2'>
                {[
                  {
                    flag: 'LARGE',
                    label: '📐 Large',
                    desc: 'Large combat area',
                  },
                  {
                    flag: 'MEDIUM_LARGE',
                    label: '📏 Medium-Large',
                    desc: 'Medium-large area',
                  },
                  {
                    flag: 'MEDIUM',
                    label: '📍 Medium',
                    desc: 'Standard room size',
                  },
                  {
                    flag: 'MEDIUM_SMALL',
                    label: '📌 Medium-Small',
                    desc: 'Medium-small area',
                  },
                  {
                    flag: 'SMALL',
                    label: '🔹 Small',
                    desc: 'Small combat area',
                  },
                  {
                    flag: 'VERY_SMALL',
                    label: '🔸 Very Small',
                    desc: 'Very cramped',
                  },
                  {
                    flag: 'ONE_PERSON',
                    label: '👤 One Person',
                    desc: 'Single occupant only',
                  },
                  {
                    flag: 'TUNNEL',
                    label: '🚇 Tunnel',
                    desc: 'Narrow passage',
                  },
                ].map(({ flag, label, desc }) => (
                  <label
                    key={flag}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      (room.flags || []).includes(flag)
                        ? isDark
                          ? 'bg-purple-900/40 border border-purple-700'
                          : 'bg-purple-50 border border-purple-200'
                        : isDark
                          ? 'hover:bg-gray-600'
                          : 'hover:bg-gray-100'
                    }`}
                    title={desc}
                  >
                    <input
                      type='checkbox'
                      checked={(room.flags || []).includes(flag)}
                      onChange={e => {
                        const currentFlags = room.flags || [];
                        const newFlags = e.target.checked
                          ? [...currentFlags, flag]
                          : currentFlags.filter(f => f !== flag);
                        onRoomChange('flags', newFlags);
                      }}
                      className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
                    />
                    <span className='text-xs'>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Restrictions */}
            <div
              className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              <h5
                className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Restrictions
              </h5>
              <div className='grid grid-cols-2 gap-2'>
                {[
                  {
                    flag: 'NO_MOB',
                    label: '🚫 No Mobs',
                    desc: 'Mobs cannot enter',
                  },
                  {
                    flag: 'NO_MAGIC',
                    label: '✨ No Magic',
                    desc: 'Magic is blocked',
                  },
                  {
                    flag: 'NO_TRACK',
                    label: '👣 No Track',
                    desc: 'Cannot be tracked',
                  },
                  {
                    flag: 'NO_SUMMON',
                    label: '🔮 No Summon',
                    desc: 'Cannot summon here',
                  },
                  { flag: 'NO_SCAN', label: '👁️ No Scan', desc: 'Cannot scan' },
                  {
                    flag: 'NO_WELL',
                    label: '💧 No Well',
                    desc: 'Cannot create wells',
                  },
                  {
                    flag: 'NO_SHIFT',
                    label: '🌀 No Shift',
                    desc: 'Cannot plane shift',
                  },
                  {
                    flag: 'NO_RECALL',
                    label: '🏠 No Recall',
                    desc: 'Cannot recall out',
                  },
                ].map(({ flag, label, desc }) => (
                  <label
                    key={flag}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      (room.flags || []).includes(flag)
                        ? isDark
                          ? 'bg-red-900/40 border border-red-700'
                          : 'bg-red-50 border border-red-200'
                        : isDark
                          ? 'hover:bg-gray-600'
                          : 'hover:bg-gray-100'
                    }`}
                    title={desc}
                  >
                    <input
                      type='checkbox'
                      checked={(room.flags || []).includes(flag)}
                      onChange={e => {
                        const currentFlags = room.flags || [];
                        const newFlags = e.target.checked
                          ? [...currentFlags, flag]
                          : currentFlags.filter(f => f !== flag);
                        onRoomChange('flags', newFlags);
                      }}
                      className='rounded border-gray-300 text-red-600 focus:ring-red-500'
                    />
                    <span className='text-xs'>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Special Areas */}
            <div
              className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              <h5
                className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Special Areas
              </h5>
              <div className='grid grid-cols-2 gap-2'>
                {[
                  {
                    flag: 'PEACEFUL',
                    label: '🕊️ Peaceful',
                    desc: 'No combat allowed',
                  },
                  {
                    flag: 'SOUNDPROOF',
                    label: '🔇 Soundproof',
                    desc: 'Sound blocked',
                  },
                  {
                    flag: 'PRIVATE',
                    label: '🔒 Private',
                    desc: 'Limited access',
                  },
                  { flag: 'ARENA', label: '⚔️ Arena', desc: 'PvP combat area' },
                  {
                    flag: 'DEATH',
                    label: '💀 Death',
                    desc: 'Instant death room',
                  },
                  {
                    flag: 'GODROOM',
                    label: '👑 Godroom',
                    desc: 'Immortal-only area',
                  },
                  { flag: 'HOUSE', label: '🏡 House', desc: 'Player housing' },
                  {
                    flag: 'GUILDHALL',
                    label: '🏛️ Guildhall',
                    desc: 'Guild headquarters',
                  },
                  {
                    flag: 'ATRIUM',
                    label: '🚪 Atrium',
                    desc: 'House entrance',
                  },
                  {
                    flag: 'HOUSECRASH',
                    label: '💥 Housecrash',
                    desc: 'Crash-save room',
                  },
                ].map(({ flag, label, desc }) => (
                  <label
                    key={flag}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      (room.flags || []).includes(flag)
                        ? isDark
                          ? 'bg-amber-900/40 border border-amber-700'
                          : 'bg-amber-50 border border-amber-200'
                        : isDark
                          ? 'hover:bg-gray-600'
                          : 'hover:bg-gray-100'
                    }`}
                    title={desc}
                  >
                    <input
                      type='checkbox'
                      checked={(room.flags || []).includes(flag)}
                      onChange={e => {
                        const currentFlags = room.flags || [];
                        const newFlags = e.target.checked
                          ? [...currentFlags, flag]
                          : currentFlags.filter(f => f !== flag);
                        onRoomChange('flags', newFlags);
                      }}
                      className='rounded border-gray-300 text-amber-600 focus:ring-amber-500'
                    />
                    <span className='text-xs'>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Technical/System Flags */}
            <div
              className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
            >
              <h5
                className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                Technical / System
              </h5>
              <div className='grid grid-cols-2 gap-2'>
                {[
                  {
                    flag: 'WORLDMAP',
                    label: '🗺️ Worldmap',
                    desc: 'World map location',
                  },
                  {
                    flag: 'FERRY_DEST',
                    label: '⛴️ Ferry Dest',
                    desc: 'Ferry destination',
                  },
                  {
                    flag: 'ISOLATED',
                    label: '🏝️ Isolated',
                    desc: 'Isolated area',
                  },
                  {
                    flag: 'ALT_EXIT',
                    label: '🚪 Alt Exit',
                    desc: 'Alternative exits',
                  },
                  {
                    flag: 'OBSERVATORY',
                    label: '🔭 Observatory',
                    desc: 'View distant areas',
                  },
                  {
                    flag: 'EFFECTS_NEXT',
                    label: '✨ Effects Next',
                    desc: 'Effects continue',
                  },
                  { flag: 'OLC', label: '🔧 OLC', desc: 'Being edited' },
                  {
                    flag: 'BFS_MARK',
                    label: '📍 BFS Mark',
                    desc: 'Pathfinding marker',
                  },
                ].map(({ flag, label, desc }) => (
                  <label
                    key={flag}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      (room.flags || []).includes(flag)
                        ? isDark
                          ? 'bg-green-900/40 border border-green-700'
                          : 'bg-green-50 border border-green-200'
                        : isDark
                          ? 'hover:bg-gray-600'
                          : 'hover:bg-gray-100'
                    }`}
                    title={desc}
                  >
                    <input
                      type='checkbox'
                      checked={(room.flags || []).includes(flag)}
                      onChange={e => {
                        const currentFlags = room.flags || [];
                        const newFlags = e.target.checked
                          ? [...currentFlags, flag]
                          : currentFlags.filter(f => f !== flag);
                        onRoomChange('flags', newFlags);
                      }}
                      className='rounded border-gray-300 text-green-600 focus:ring-green-500'
                    />
                    <span className='text-xs'>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Active Flags Summary */}
            {(room.flags || []).length > 0 && (
              <div
                className={`p-3 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}
              >
                <h5
                  className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}
                >
                  Active Flags ({(room.flags || []).length})
                </h5>
                <div className='flex flex-wrap gap-1'>
                  {(room.flags || []).map(flag => (
                    <span
                      key={flag}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isDark ? 'bg-blue-800/50 text-blue-200' : 'bg-blue-100 text-blue-700'}`}
                    >
                      {flag.replace(/_/g, ' ')}
                      <button
                        onClick={() => {
                          const newFlags = (room.flags || []).filter(
                            f => f !== flag
                          );
                          onRoomChange('flags', newFlags);
                        }}
                        className='ml-1 hover:text-red-500'
                        title={`Remove ${flag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {viewMode === 'edit' && (
        <div className='p-3 border-t border-gray-200'>
          <div className='flex justify-end'>
            <button
              onClick={onSaveRoom}
              disabled={saving}
              className='px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {saving ? 'Saving…' : 'Save Room'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
