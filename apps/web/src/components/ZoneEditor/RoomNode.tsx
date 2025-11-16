'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useTheme } from 'next-themes';

interface OverlapInfo {
  roomIds: number[];
  position: { x: number; y: number };
  count: number;
}

interface RoomData {
  roomId: number;
  zoneId: number;
  name: string;
  sector: string;
  roomDescription: string;
  mobs?: Array<{ id: number; name: string; level: number }>;
  objects?: Array<{ id: number; name: string; type: string }>;
  shops?: Array<{
    id: number;
    buyProfit: number;
    sellProfit: number;
    keeperId: number;
  }>;
  exits: Array<{
    direction: string;
    toZoneId?: number | null;
    toRoomId?: number | null;
  }>;
  room: any;
  layoutZ?: number | null;
  isOverlapping?: boolean;
  overlapInfo?: OverlapInfo;
  currentZLevel?: number;
  isCurrentFloor?: boolean;
  depthOpacity?: number;
  // New properties for overlap management
  overlappedRooms?: Array<{ id: number; name: string }>;
  activeOverlapIndex?: number;
  overlapIndex?: number; // Position in visual stack (0 = top)
  totalOverlaps?: number; // Total number of overlapping rooms
  onSwitchOverlapRoom?: (direction: 'next' | 'prev') => void;
}

// Sector type styling and icons - theme-aware
const getSectorStyles = (isDark: boolean): Record<
  string,
  { bg: string; border: string; icon: string; text: string }
> => ({
  STRUCTURE: {
    bg: isDark ? 'bg-slate-800' : 'bg-slate-100',
    border: isDark ? 'border-slate-500' : 'border-slate-400',
    icon: '🏛️',
    text: isDark ? 'text-slate-200' : 'text-slate-800',
  },
  FIELD: {
    bg: isDark ? 'bg-green-900' : 'bg-green-100',
    border: isDark ? 'border-green-500' : 'border-green-400',
    icon: '🌾',
    text: isDark ? 'text-green-200' : 'text-green-800',
  },
  FOREST: {
    bg: isDark ? 'bg-emerald-900' : 'bg-emerald-100',
    border: isDark ? 'border-emerald-500' : 'border-emerald-400',
    icon: '🌲',
    text: isDark ? 'text-emerald-200' : 'text-emerald-800',
  },
  HILLS: {
    bg: isDark ? 'bg-amber-900' : 'bg-amber-100',
    border: isDark ? 'border-amber-500' : 'border-amber-400',
    icon: '⛰️',
    text: isDark ? 'text-amber-200' : 'text-amber-800',
  },
  MOUNTAIN: {
    bg: isDark ? 'bg-gray-800' : 'bg-gray-100',
    border: isDark ? 'border-gray-500' : 'border-gray-400',
    icon: '🏔️',
    text: isDark ? 'text-gray-200' : 'text-gray-800',
  },
  WATER: {
    bg: isDark ? 'bg-blue-900' : 'bg-blue-100',
    border: isDark ? 'border-blue-500' : 'border-blue-400',
    icon: '🌊',
    text: isDark ? 'text-blue-200' : 'text-blue-800',
  },
  SWAMP: {
    bg: isDark ? 'bg-teal-900' : 'bg-teal-100',
    border: isDark ? 'border-teal-500' : 'border-teal-400',
    icon: '🐊',
    text: isDark ? 'text-teal-200' : 'text-teal-800',
  },
  CITY: {
    bg: isDark ? 'bg-purple-900' : 'bg-purple-100',
    border: isDark ? 'border-purple-500' : 'border-purple-400',
    icon: '🏙️',
    text: isDark ? 'text-purple-200' : 'text-purple-800',
  },
  ROAD: {
    bg: isDark ? 'bg-yellow-900' : 'bg-yellow-100',
    border: isDark ? 'border-yellow-500' : 'border-yellow-400',
    icon: '🛤️',
    text: isDark ? 'text-yellow-200' : 'text-yellow-800',
  },
});

export const RoomNode: React.FC<NodeProps<RoomData>> = ({ data, selected }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const sectorStyles = getSectorStyles(isDark);

  // Rename to sectorStyle to avoid shadowing NodeProps.style and improve clarity.
  // Explicit annotation ensures it is never treated as possibly undefined.
  const sectorStyle = (sectorStyles[data.sector] ?? sectorStyles.STRUCTURE) as {
    bg: string;
    border: string;
    icon: string;
    text: string;
  };
  const mobCount = data.mobs?.length || 0;
  const objectCount = data.objects?.length || 0;
  const shopCount = data.shops?.length || 0;
  const exitCount = data.exits.length;
  const zLevel = data.layoutZ ?? 0;
  const currentZLevel = data.currentZLevel ?? 0;
  const isCurrentFloor = data.isCurrentFloor ?? true;
  const [isHovered, setIsHovered] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Check for UP/DOWN exits (actual vertical connections)
  const hasUpExit = data.exits.some(exit => exit.direction === 'UP');
  const hasDownExit = data.exits.some(exit => exit.direction === 'DOWN');

  // Calculate visual depth effects based on floor relationship
  const floorDifference = zLevel - currentZLevel;
  const depthEffects = {
    // Opacity - dimmer for non-current floors
    opacity: isCurrentFloor ? 1 : (data.depthOpacity ?? 0.4),

    // Shadow intensity based on floor relationship
    shadow: isCurrentFloor
      ? zLevel > 0
        ? `shadow-xl shadow-blue-500/20`
        : zLevel < 0
          ? `shadow-lg shadow-red-900/30`
          : 'shadow-lg'
      : 'shadow-sm',

    // Border style for floor indication
    borderStyle: isCurrentFloor
      ? zLevel > 0
        ? 'border-dashed border-blue-400'
        : zLevel < 0
          ? 'border-dotted border-red-600'
          : sectorStyle.border
      : floorDifference > 0
        ? 'border-dashed border-blue-300/50' // Upper floors - light blue dashed
        : floorDifference < 0
          ? 'border-dotted border-red-400/50' // Lower floors - light red dotted
          : sectorStyle.border,

    // Additional styling for non-current floors
    additionalClasses: isCurrentFloor
      ? ''
      : floorDifference > 0
        ? 'ring-1 ring-blue-200/50' // Subtle ring for upper floors
        : floorDifference < 0
          ? 'ring-1 ring-red-200/50' // Subtle ring for lower floors
          : '',
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({
      x: rect.right + 8,
      y: rect.top,
    });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <>
      <div
        className={`
          relative min-w-[160px] max-w-[200px]
          ${sectorStyle.bg} ${depthEffects.borderStyle} ${sectorStyle.text}
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          ${depthEffects.additionalClasses}
          ${
            data.isOverlapping &&
            data.overlappedRooms &&
            data.overlappedRooms.length > 1
              ? 'ring-4 ring-orange-400 ring-offset-1 shadow-lg shadow-orange-300/50'
              : ''
          }
          border-2 rounded-xl ${depthEffects.shadow} hover:shadow-xl transition-all duration-200
          cursor-pointer
        `}
        style={{
          opacity: depthEffects.opacity,
          transform:
            data.isOverlapping &&
            data.overlappedRooms &&
            data.overlappedRooms.length > 1
              ? 'scale(1.02)'
              : 'scale(1)',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Overlap Stack Number Badge */}
        {data.isOverlapping && data.totalOverlaps && data.totalOverlaps > 1 && (
          <div
            className='absolute -top-3 -left-3 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white z-10'
            title={`Card ${(data.overlapIndex ?? 0) + 1} of ${data.totalOverlaps} overlapping rooms - Press ${(data.overlapIndex ?? 0) + 1} to select`}
          >
            {(data.overlapIndex ?? 0) + 1}
          </div>
        )}
        {/* Connection Handles - All handles are both source and target */}
        <Handle
          type='source'
          position={Position.Top}
          id='top'
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
        />
        <Handle
          type='target'
          position={Position.Top}
          id='top-target'
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
          style={{ opacity: 0 }}
        />
        <Handle
          type='source'
          position={Position.Bottom}
          id='bottom'
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
        />
        <Handle
          type='target'
          position={Position.Bottom}
          id='bottom-target'
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
          style={{ opacity: 0 }}
        />
        <Handle
          type='source'
          position={Position.Left}
          id='left'
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
        />
        <Handle
          type='target'
          position={Position.Left}
          id='left-target'
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
          style={{ opacity: 0 }}
        />
        <Handle
          type='source'
          position={Position.Right}
          id='right'
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
        />
        <Handle
          type='target'
          position={Position.Right}
          id='right-target'
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
          style={{ opacity: 0 }}
        />

        {/* Up/Down handles - positioned in the center for vertical movement */}
        <Handle
          type='source'
          position={Position.Top}
          id='up'
          className='!bg-blue-500 !w-4 !h-2 !border-2 !border-white !rounded-sm'
          style={{ top: '-8px', left: '50%', transform: 'translateX(-50%)' }}
        />
        <Handle
          type='target'
          position={Position.Top}
          id='up-target'
          className='!bg-blue-500 !w-4 !h-2 !border-2 !border-white !rounded-sm'
          style={{
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0,
          }}
        />
        <Handle
          type='source'
          position={Position.Bottom}
          id='down'
          className='!bg-red-500 !w-4 !h-2 !border-2 !border-white !rounded-sm'
          style={{ bottom: '-8px', left: '50%', transform: 'translateX(-50%)' }}
        />
        <Handle
          type='target'
          position={Position.Bottom}
          id='down-target'
          className='!bg-red-500 !w-4 !h-2 !border-2 !border-white !rounded-sm'
          style={{
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: 0,
          }}
        />

        {/* Header */}
        <div className='px-3 py-2 border-b border-opacity-30 border-gray-400'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>{sectorStyle.icon}</span>
              <span className='font-bold text-sm'>Room {data.roomId}</span>
            </div>
            <div className='flex items-center gap-1'>
              {data.isOverlapping &&
                data.overlappedRooms &&
                data.overlappedRooms.length > 1 && (
                  <div className='flex items-center gap-1 bg-orange-50 border border-orange-300 rounded px-1 py-0.5'>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        data.onSwitchOverlapRoom?.('prev');
                      }}
                      className='text-xs hover:bg-orange-200 rounded px-1 transition-colors'
                      title='Previous overlapping room'
                    >
                      ◀
                    </button>
                    <span
                      className='text-xs font-bold text-orange-600 px-1'
                      title={`Room ${(data.activeOverlapIndex || 0) + 1} of ${data.overlappedRooms.length} overlapping rooms`}
                    >
                      📚 {(data.activeOverlapIndex || 0) + 1}/
                      {data.overlappedRooms.length}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        data.onSwitchOverlapRoom?.('next');
                      }}
                      className='text-xs hover:bg-orange-200 rounded px-1 transition-colors'
                      title='Next overlapping room'
                    >
                      ▶
                    </button>
                  </div>
                )}
              {data.isOverlapping &&
                (!data.overlappedRooms || data.overlappedRooms.length <= 1) && (
                  <span
                    className='text-xs font-bold text-orange-600 px-1 py-0.5 bg-orange-100 rounded border border-orange-300 animate-pulse'
                    title={`Overlapping with ${data.overlapInfo?.count || 1} other rooms`}
                  >
                    ⚠️
                  </span>
                )}
              {zLevel !== 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                    isCurrentFloor
                      ? zLevel > 0
                        ? 'bg-blue-500 bg-opacity-80 text-white'
                        : 'bg-red-500 bg-opacity-80 text-white'
                      : 'bg-gray-400 bg-opacity-60 text-gray-100'
                  }`}
                >
                  Z{zLevel > 0 ? '+' : ''}
                  {zLevel}
                  {!isCurrentFloor && ' (other floor)'}
                </span>
              )}
              {/* UP/DOWN Exit Indicators */}
              {hasUpExit && (
                <span
                  className='bg-blue-500 text-white px-1.5 py-0.5 rounded text-xs font-bold shadow-sm'
                  title='Room has UP exit (vertical connection)'
                >
                  ⬆️
                </span>
              )}
              {hasDownExit && (
                <span
                  className='bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold shadow-sm'
                  title='Room has DOWN exit (vertical connection)'
                >
                  ⬇️
                </span>
              )}
              {exitCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-white bg-opacity-60 text-gray-800'}`}>
                  {exitCount} exit{exitCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          <h3 className='font-semibold text-sm mt-1 leading-tight line-clamp-2 h-8 flex items-start'>
            <span className='block'>{data.name}</span>
          </h3>
        </div>

        {/* Content */}
        <div className='px-3 py-2'>
          <div className='text-xs opacity-75 mb-2 line-clamp-2'>
            {data.roomDescription}
          </div>

          {/* Entity indicators */}
          <div className='flex gap-2 mt-2'>
            {mobCount > 0 && (
              <div className='flex items-center gap-1 bg-red-500 bg-opacity-20 px-2 py-1 rounded-full'>
                <span className='text-xs'>👹</span>
                <span className='text-xs font-medium'>{mobCount}</span>
              </div>
            )}
            {objectCount > 0 && (
              <div className='flex items-center gap-1 bg-blue-500 bg-opacity-20 px-2 py-1 rounded-full'>
                <span className='text-xs'>📦</span>
                <span className='text-xs font-medium'>{objectCount}</span>
              </div>
            )}
            {shopCount > 0 && (
              <div className='flex items-center gap-1 bg-green-500 bg-opacity-20 px-2 py-1 rounded-full'>
                <span className='text-xs'>🏪</span>
                <span className='text-xs font-medium'>{shopCount}</span>
              </div>
            )}
          </div>

          {/* Sector tag */}
          <div className='mt-2'>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-gray-700 text-gray-200' : 'bg-white bg-opacity-60 text-gray-800'}`}>
              {data.sector.toLowerCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Portal-based popup */}
      {isHovered &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className='fixed bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700 pointer-events-none min-w-[200px] max-w-[300px] z-[9999]'
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
            }}
          >
            <div className='font-semibold mb-2'>
              Room {data.roomId}: {data.name}
            </div>
            <div className='text-gray-400 text-[10px] mb-2 font-mono'>
              Layout: ({data.room?.layoutX ?? 'null'},{' '}
              {data.room?.layoutY ?? 'null'}, {data.layoutZ ?? 0})
            </div>
            <div className='text-gray-300 mb-2 leading-relaxed'>
              {data.roomDescription}
            </div>

            {data.exits.length > 0 && (
              <div className='border-t border-gray-700 pt-2'>
                <div className='font-semibold mb-1'>Exits:</div>
                {data.exits.map((exit, idx) => {
                  // Show zone ID only for cross-zone exits
                  const isCrossZone = exit.toZoneId != null && exit.toZoneId !== data.zoneId;
                  const displayText = isCrossZone
                    ? `Zone ${exit.toZoneId}:${exit.toRoomId}`
                    : exit.toRoomId != null
                      ? `Room ${exit.toRoomId}`
                      : 'None';

                  const isVertical =
                    exit.direction === 'UP' || exit.direction === 'DOWN';
                  const verticalClass =
                    exit.direction === 'UP'
                      ? 'text-blue-300 font-semibold'
                      : exit.direction === 'DOWN'
                        ? 'text-red-300 font-semibold'
                        : 'text-gray-300';

                  return (
                    <div key={idx} className={verticalClass}>
                      {exit.direction.toLowerCase()}{' '}
                      {isVertical
                        ? '⬆️⬇️'.charAt(exit.direction === 'UP' ? 0 : 1)
                        : ''}{' '}
                      → {displayText}
                    </div>
                  );
                })}
              </div>
            )}

            {(mobCount > 0 || objectCount > 0 || shopCount > 0) && (
              <div className='border-t border-gray-700 pt-2 mt-2'>
                {mobCount > 0 && (
                  <div className='text-red-300'>
                    👹 {mobCount} mob{mobCount !== 1 ? 's' : ''}
                  </div>
                )}
                {objectCount > 0 && (
                  <div className='text-blue-300'>
                    📦 {objectCount} object{objectCount !== 1 ? 's' : ''}
                  </div>
                )}
                {shopCount > 0 && (
                  <div className='text-green-300'>
                    🏪 {shopCount} shop{shopCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            )}

            {data.isOverlapping &&
              data.overlappedRooms &&
              data.overlappedRooms.length > 1 && (
                <div className='border-t border-gray-700 pt-2 mt-2'>
                  <div className='font-semibold mb-1 text-orange-300'>
                    📚 Overlapping Rooms ({data.overlappedRooms.length}):
                  </div>
                  {data.overlappedRooms.map((room, idx) => (
                    <div
                      key={room.id}
                      className={`text-sm ${
                        idx === (data.activeOverlapIndex || 0)
                          ? 'text-orange-200 font-semibold'
                          : 'text-gray-400'
                      }`}
                    >
                      {idx === (data.activeOverlapIndex || 0) ? '→ ' : '  '}
                      Room {room.id}: {room.name}
                    </div>
                  ))}
                  <div className='text-xs text-gray-500 mt-1'>
                    Use ◀ ▶ buttons to switch between rooms
                  </div>
                </div>
              )}
          </div>,
          document.body
        )}
    </>
  );
};
