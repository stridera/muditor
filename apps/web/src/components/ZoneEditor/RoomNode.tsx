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

// Sector type styling and icons - pre-computed for performance
// Light theme styles
const SECTOR_STYLES_LIGHT: Record<
  string,
  { bg: string; border: string; icon: string; text: string }
> = {
  STRUCTURE: {
    bg: 'bg-slate-100',
    border: 'border-slate-400',
    icon: '🏛️',
    text: 'text-slate-800',
  },
  FIELD: {
    bg: 'bg-green-100',
    border: 'border-green-400',
    icon: '🌾',
    text: 'text-green-800',
  },
  FOREST: {
    bg: 'bg-emerald-100',
    border: 'border-emerald-400',
    icon: '🌲',
    text: 'text-emerald-800',
  },
  HILLS: {
    bg: 'bg-amber-100',
    border: 'border-amber-400',
    icon: '⛰️',
    text: 'text-amber-800',
  },
  MOUNTAIN: {
    bg: 'bg-gray-100',
    border: 'border-gray-400',
    icon: '🏔️',
    text: 'text-gray-800',
  },
  WATER: {
    bg: 'bg-blue-100',
    border: 'border-blue-400',
    icon: '🌊',
    text: 'text-blue-800',
  },
  SWAMP: {
    bg: 'bg-teal-100',
    border: 'border-teal-400',
    icon: '🐊',
    text: 'text-teal-800',
  },
  CITY: {
    bg: 'bg-purple-100',
    border: 'border-purple-400',
    icon: '🏙️',
    text: 'text-purple-800',
  },
  ROAD: {
    bg: 'bg-yellow-100',
    border: 'border-yellow-400',
    icon: '🛤️',
    text: 'text-yellow-800',
  },
};

// Dark theme styles
const SECTOR_STYLES_DARK: Record<
  string,
  { bg: string; border: string; icon: string; text: string }
> = {
  STRUCTURE: {
    bg: 'bg-slate-800',
    border: 'border-slate-500',
    icon: '🏛️',
    text: 'text-slate-200',
  },
  FIELD: {
    bg: 'bg-green-900',
    border: 'border-green-500',
    icon: '🌾',
    text: 'text-green-200',
  },
  FOREST: {
    bg: 'bg-emerald-900',
    border: 'border-emerald-500',
    icon: '🌲',
    text: 'text-emerald-200',
  },
  HILLS: {
    bg: 'bg-amber-900',
    border: 'border-amber-500',
    icon: '⛰️',
    text: 'text-amber-200',
  },
  MOUNTAIN: {
    bg: 'bg-gray-800',
    border: 'border-gray-500',
    icon: '🏔️',
    text: 'text-gray-200',
  },
  WATER: {
    bg: 'bg-blue-900',
    border: 'border-blue-500',
    icon: '🌊',
    text: 'text-blue-200',
  },
  SWAMP: {
    bg: 'bg-teal-900',
    border: 'border-teal-500',
    icon: '🐊',
    text: 'text-teal-200',
  },
  CITY: {
    bg: 'bg-purple-900',
    border: 'border-purple-500',
    icon: '🏙️',
    text: 'text-purple-200',
  },
  ROAD: {
    bg: 'bg-yellow-900',
    border: 'border-yellow-500',
    icon: '🛤️',
    text: 'text-yellow-200',
  },
};

// Custom comparison function for RoomNode memoization
// Only re-render if critical props that affect visual output have changed
const arePropsEqual = (
  prevProps: NodeProps<RoomData>,
  nextProps: NodeProps<RoomData>
): boolean => {
  const prev = prevProps.data;
  const next = nextProps.data;

  // Quick checks for primitive values
  if (
    prev.roomId !== next.roomId ||
    prev.zoneId !== next.zoneId ||
    prev.name !== next.name ||
    prev.sector !== next.sector ||
    prev.layoutZ !== next.layoutZ ||
    prev.currentZLevel !== next.currentZLevel ||
    prev.isCurrentFloor !== next.isCurrentFloor ||
    prev.depthOpacity !== next.depthOpacity ||
    prev.isOverlapping !== next.isOverlapping ||
    prev.activeOverlapIndex !== next.activeOverlapIndex ||
    prev.overlapIndex !== next.overlapIndex ||
    prev.totalOverlaps !== next.totalOverlaps ||
    prevProps.selected !== nextProps.selected
  ) {
    return false;
  }

  // Check array lengths (counts affect badges)
  if (
    (prev.mobs?.length || 0) !== (next.mobs?.length || 0) ||
    (prev.objects?.length || 0) !== (next.objects?.length || 0) ||
    (prev.shops?.length || 0) !== (next.shops?.length || 0) ||
    prev.exits.length !== next.exits.length
  ) {
    return false;
  }

  // Check if exit directions changed (affects UP/DOWN indicators)
  const prevExitDirs = prev.exits
    .map(e => e.direction)
    .sort()
    .join(',');
  const nextExitDirs = next.exits
    .map(e => e.direction)
    .sort()
    .join(',');
  if (prevExitDirs !== nextExitDirs) {
    return false;
  }

  // Check overlappedRooms array
  if (prev.overlappedRooms?.length !== next.overlappedRooms?.length) {
    return false;
  }

  // If we got here, all critical props are equal - don't re-render
  return true;
};

const RoomNodeComponent: React.FC<NodeProps<RoomData>> = ({
  data,
  selected,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  // Use pre-computed constant styles instead of recalculating
  const sectorStyles = isDark ? SECTOR_STYLES_DARK : SECTOR_STYLES_LIGHT;

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
          relative w-[180px] h-[140px]
          ${sectorStyle.bg} ${depthEffects.borderStyle} ${sectorStyle.text}
          ${
            selected
              ? 'ring-4 ring-cyan-400 ring-offset-2 shadow-xl shadow-cyan-400/60 dark:ring-cyan-300 dark:shadow-cyan-300/60'
              : data.isOverlapping &&
                  data.overlappedRooms &&
                  data.overlappedRooms.length > 1
                ? 'ring-4 ring-orange-400 ring-offset-1 shadow-lg shadow-orange-300/50'
                : ''
          }
          ${depthEffects.additionalClasses}
          border-2 rounded-xl ${depthEffects.shadow} hover:shadow-xl transition-all duration-200
          cursor-pointer flex flex-col overflow-hidden
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
            </div>
          </div>

          <h3 className='font-semibold text-sm mt-1 leading-tight line-clamp-2 h-8 flex items-start'>
            <span className='block'>{data.name}</span>
          </h3>
        </div>

        {/* Content */}
        <div className='px-3 py-2 flex items-center justify-center flex-1'>
          {/* Entity indicators */}
          <div className='flex gap-2'>
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
                  const isCrossZone =
                    exit.toZoneId != null && exit.toZoneId !== data.zoneId;
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

// Export memoized version with custom comparison
export const RoomNode = React.memo(RoomNodeComponent, arePropsEqual);
