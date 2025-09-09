'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, NodeProps } from 'reactflow';

interface RoomData {
  roomId: number;
  name: string;
  sector: string;
  description: string;
  mobs?: Array<{ id: number; name: string; level: number }>;
  objects?: Array<{ id: number; name: string; type: string }>;
  exits: Array<{ direction: string; destination: number | null }>;
  room: any;
  layoutZ?: number | null;
}

// Sector type styling and icons
const sectorStyles: Record<
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

export const RoomNode: React.FC<NodeProps<RoomData>> = ({ data, selected }) => {
  const style = sectorStyles[data.sector] || sectorStyles.STRUCTURE;
  const mobCount = data.mobs?.length || 0;
  const objectCount = data.objects?.length || 0;
  const exitCount = data.exits.length;
  const zLevel = data.layoutZ ?? 0;
  const [isHovered, setIsHovered] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  // Calculate visual depth effects
  const depthEffects = {
    // Opacity based on depth (above ground = full opacity, below ground = more transparent)
    opacity: zLevel >= 0 ? 1 : Math.max(0.6, 1 + zLevel * 0.1),
    // Shadow intensity based on depth
    shadow:
      zLevel > 0
        ? `shadow-xl shadow-blue-500/20`
        : zLevel < 0
          ? `shadow-lg shadow-red-900/30`
          : 'shadow-lg',
    // Border style for depth indication
    borderStyle:
      zLevel > 0
        ? 'border-dashed border-blue-400'
        : zLevel < 0
          ? 'border-dotted border-red-600'
          : style.border,
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
          ${style.bg} ${depthEffects.borderStyle} ${style.text}
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          border-2 rounded-xl ${depthEffects.shadow} hover:shadow-xl transition-all duration-200
          cursor-pointer
        `}
        style={{ opacity: depthEffects.opacity }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Connection Handles */}
        <Handle
          type='target'
          position={Position.Top}
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
        />
        <Handle
          type='source'
          position={Position.Bottom}
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
        />
        <Handle
          type='target'
          position={Position.Left}
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
        />
        <Handle
          type='source'
          position={Position.Right}
          className='!bg-gray-600 !w-3 !h-3 !border-2 !border-white'
        />

        {/* Header */}
        <div className='px-3 py-2 border-b border-opacity-30 border-gray-400'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>{style.icon}</span>
              <span className='font-bold text-sm'>Room {data.roomId}</span>
            </div>
            <div className='flex items-center gap-1'>
              {zLevel !== 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                    zLevel > 0
                      ? 'bg-blue-500 bg-opacity-80 text-white'
                      : 'bg-red-500 bg-opacity-80 text-white'
                  }`}
                >
                  Z{zLevel > 0 ? '+' : ''}
                  {zLevel}
                </span>
              )}
              {exitCount > 0 && (
                <span className='bg-white bg-opacity-60 px-2 py-0.5 rounded-full text-xs font-medium'>
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
            {data.description}
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
          </div>

          {/* Sector tag */}
          <div className='mt-2'>
            <span className='text-xs px-2 py-0.5 bg-white bg-opacity-60 rounded-full font-medium'>
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
            <div className='text-gray-300 mb-2 leading-relaxed'>
              {data.description}
            </div>

            {data.exits.length > 0 && (
              <div className='border-t border-gray-700 pt-2'>
                <div className='font-semibold mb-1'>Exits:</div>
                {data.exits.map((exit, idx) => (
                  <div key={idx} className='text-gray-300'>
                    {exit.direction.toLowerCase()} →{' '}
                    {exit.destination ? `Room ${exit.destination}` : 'None'}
                  </div>
                ))}
              </div>
            )}

            {(mobCount > 0 || objectCount > 0) && (
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
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
};
