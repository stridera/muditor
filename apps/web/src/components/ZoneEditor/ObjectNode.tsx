'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { NodeProps } from 'reactflow';

interface ObjectData {
  id: number;
  name: string;
  type: string;
  keywords?: string[];
  value?: number;
  weight?: number;
  level?: number;
  material?: string;
  condition?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  roomId?: number;
}

const getObjectTypeIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    WEAPON: '⚔️',
    ARMOR: '🛡️',
    TREASURE: '💎',
    FOOD: '🍖',
    DRINK: '🧪',
    KEY: '🗝️',
    LIGHT: '🕯️',
    CONTAINER: '📦',
    BOOK: '📚',
    SCROLL: '📜',
    POTION: '🧪',
    TOOL: '🔧',
    JEWELRY: '💍',
    CLOTHING: '👕',
    OTHER: '❓',
  };
  return iconMap[type.toUpperCase()] || '📦';
};

const getRarityStyle = (rarity?: string) => {
  switch (rarity) {
    case 'common':
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-400',
        text: 'text-gray-800',
      };
    case 'uncommon':
      return {
        bg: 'bg-green-100',
        border: 'border-green-400',
        text: 'text-green-800',
      };
    case 'rare':
      return {
        bg: 'bg-blue-100',
        border: 'border-blue-400',
        text: 'text-blue-800',
      };
    case 'epic':
      return {
        bg: 'bg-purple-100',
        border: 'border-purple-400',
        text: 'text-purple-800',
      };
    case 'legendary':
      return {
        bg: 'bg-orange-100',
        border: 'border-orange-400',
        text: 'text-orange-800',
      };
    default:
      return {
        bg: 'bg-slate-100',
        border: 'border-slate-400',
        text: 'text-slate-800',
      };
  }
};

export const ObjectNode: React.FC<NodeProps<ObjectData>> = ({
  data,
  selected,
}) => {
  const style = getRarityStyle(data.rarity);
  const typeIcon = getObjectTypeIcon(data.type);
  const [isHovered, setIsHovered] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

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
          relative min-w-[140px] max-w-[180px]
          ${style.bg} ${style.border} ${style.text}
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          border-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200
          cursor-grab active:cursor-grabbing
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className='px-3 py-2 border-b border-opacity-30 border-gray-400'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-lg'>{typeIcon}</span>
              <span className='font-bold text-sm'>{data.type}</span>
            </div>
            {data.rarity && (
              <span className='bg-white bg-opacity-60 px-1.5 py-0.5 rounded text-xs font-medium capitalize'>
                {data.rarity}
              </span>
            )}
          </div>

          <h3 className='font-semibold text-sm mt-1 leading-tight line-clamp-2'>
            {data.name}
          </h3>
        </div>

        {/* Content */}
        <div className='px-3 py-2'>
          <div className='flex flex-wrap gap-1 mb-2'>
            {data.material && (
              <span className='text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded-full'>
                {data.material}
              </span>
            )}
            {data.level && (
              <span className='text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded-full'>
                Lvl {data.level}
              </span>
            )}
          </div>

          <div className='flex justify-between items-center text-xs mb-2'>
            {data.value && (
              <div className='flex items-center gap-1'>
                <span>💰</span>
                <span>{data.value}g</span>
              </div>
            )}
            {data.weight && (
              <div className='flex items-center gap-1'>
                <span>⚖️</span>
                <span>{data.weight}lb</span>
              </div>
            )}
          </div>

          {data.condition && (
            <div className='text-xs mb-2'>
              <span className='opacity-75'>Condition: </span>
              <span
                className={
                  data.condition === 'perfect'
                    ? 'text-green-600'
                    : data.condition === 'good'
                      ? 'text-blue-600'
                      : data.condition === 'worn'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                }
              >
                {data.condition}
              </span>
            </div>
          )}

          {data.roomId && (
            <div className='mt-2 text-xs opacity-75'>📍 Room {data.roomId}</div>
          )}
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
            <div className='font-semibold mb-2'>{data.name}</div>

            <div className='grid grid-cols-2 gap-2 text-gray-300 mb-2'>
              <div>
                <span className='text-gray-400'>Type:</span> {data.type}
              </div>
              {data.material && (
                <div>
                  <span className='text-gray-400'>Material:</span>{' '}
                  {data.material}
                </div>
              )}
              {data.level && (
                <div>
                  <span className='text-gray-400'>Level:</span> {data.level}
                </div>
              )}
              {data.rarity && (
                <div>
                  <span className='text-gray-400'>Rarity:</span> {data.rarity}
                </div>
              )}
              {data.condition && (
                <div>
                  <span className='text-gray-400'>Condition:</span>{' '}
                  {data.condition}
                </div>
              )}
            </div>

            {(data.value || data.weight) && (
              <div className='grid grid-cols-2 gap-2 text-gray-300 mb-2'>
                {data.value && (
                  <div>
                    <span className='text-gray-400'>Value:</span> {data.value}g
                  </div>
                )}
                {data.weight && (
                  <div>
                    <span className='text-gray-400'>Weight:</span> {data.weight}
                    lb
                  </div>
                )}
              </div>
            )}

            {data.roomId && (
              <div className='border-t border-gray-700 pt-2 mt-2 text-gray-300'>
                Currently in Room {data.roomId}
              </div>
            )}

            <div className='border-t border-gray-700 pt-2 mt-2 text-gray-400 text-xs'>
              💡 Drag to a room to place this object
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
