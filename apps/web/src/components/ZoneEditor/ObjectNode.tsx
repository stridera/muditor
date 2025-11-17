'use client';

import { isValidRoomId } from '@/lib/room-utils';
import { useTheme } from 'next-themes';
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
  forceFullWidth?: boolean; // Panel list variant
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

const getRarityStyle = (rarity?: string, isDark?: boolean) => {
  switch (rarity) {
    case 'common':
      return {
        bg: isDark ? 'bg-gray-800' : 'bg-gray-100',
        border: isDark ? 'border-gray-600' : 'border-gray-400',
        text: isDark ? 'text-gray-300' : 'text-gray-800',
      };
    case 'uncommon':
      return {
        bg: isDark ? 'bg-green-900/40' : 'bg-green-100',
        border: isDark ? 'border-green-600' : 'border-green-400',
        text: isDark ? 'text-green-300' : 'text-green-800',
      };
    case 'rare':
      return {
        bg: isDark ? 'bg-blue-900/40' : 'bg-blue-100',
        border: isDark ? 'border-blue-600' : 'border-blue-400',
        text: isDark ? 'text-blue-300' : 'text-blue-800',
      };
    case 'epic':
      return {
        bg: isDark ? 'bg-purple-900/40' : 'bg-purple-100',
        border: isDark ? 'border-purple-600' : 'border-purple-400',
        text: isDark ? 'text-purple-300' : 'text-purple-800',
      };
    case 'legendary':
      return {
        bg: isDark ? 'bg-orange-900/40' : 'bg-orange-100',
        border: isDark ? 'border-orange-600' : 'border-orange-400',
        text: isDark ? 'text-orange-300' : 'text-orange-800',
      };
    default:
      return {
        bg: isDark ? 'bg-slate-800' : 'bg-slate-100',
        border: isDark ? 'border-slate-600' : 'border-slate-400',
        text: isDark ? 'text-slate-300' : 'text-slate-800',
      };
  }
};

export const ObjectNode: React.FC<NodeProps<ObjectData>> = ({
  data,
  selected,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const style = getRarityStyle(data.rarity, isDark);
  const typeIcon = getObjectTypeIcon(data.type);
  const [isHovered, setIsHovered] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const handleMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPopupPosition({ x: rect.right + 8, y: rect.top });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const isListVariant = !!data.forceFullWidth;

  return (
    <>
      <div
        className={`relative ${isListVariant ? 'w-full' : 'min-w-[140px] max-w-[180px]'}
          ${style.bg} ${style.border} ${style.text}
          ${selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
          border-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-150
          ${isListVariant ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isListVariant ? (
          <div className='p-3 space-y-1.5'>
            <div className='flex items-start justify-between gap-2'>
              <div className='min-w-0'>
                <div className='flex items-center gap-2 mb-0.5'>
                  <span className='text-base leading-none'>{typeIcon}</span>
                  {data.level !== undefined && data.level !== null && (
                    <span className='text-[11px] font-semibold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10'>
                      Lvl {data.level}
                    </span>
                  )}
                  {data.rarity && (
                    <span className='text-[10px] font-medium px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 capitalize'>
                      {data.rarity}
                    </span>
                  )}
                </div>
                <h3 className='font-semibold text-sm leading-tight truncate'>
                  {data.name || `Object ${data.id}`}
                </h3>
              </div>
            </div>
            {(data.type || data.material) && (
              <div className='flex flex-wrap gap-1 text-[11px]'>
                {data.type && (
                  <span className='px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10'>
                    {data.type}
                  </span>
                )}
                {data.material && (
                  <span className='px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10'>
                    {data.material}
                  </span>
                )}
              </div>
            )}
            {(data.value || data.weight) && (
              <div className='flex flex-wrap gap-3 text-[11px]'>
                {data.value !== undefined && data.value !== null && (
                  <span className='flex items-center gap-1'>
                    💰 {data.value}g
                  </span>
                )}
                {data.weight !== undefined && data.weight !== null && (
                  <span className='flex items-center gap-1'>
                    ⚖️ {data.weight}lb
                  </span>
                )}
              </div>
            )}
            {data.condition && (
              <div className='text-[10px] opacity-70'>
                Condition: {data.condition}
              </div>
            )}
            {isValidRoomId(data.roomId) && (
              <div className='text-[10px] opacity-60'>Room {data.roomId}</div>
            )}
          </div>
        ) : (
          <>
            <div
              className={`px-3 py-2 border-b border-opacity-30 ${isDark ? 'border-gray-600' : 'border-gray-400'}`}
            >
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <span className='text-lg'>{typeIcon}</span>
                  <span className='font-bold text-sm'>{data.type}</span>
                </div>
                {data.rarity && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize ${isDark ? 'bg-gray-700 bg-opacity-80' : 'bg-white bg-opacity-60'}`}
                  >
                    {data.rarity}
                  </span>
                )}
              </div>
              <h3 className='font-semibold text-sm mt-1 leading-tight line-clamp-2'>
                {data.name}
              </h3>
            </div>
            <div className='px-3 py-2'>
              <div className='flex flex-wrap gap-1 mb-2'>
                {data.material && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 bg-opacity-80' : 'bg-white bg-opacity-60'}`}
                  >
                    {data.material}
                  </span>
                )}
                {data.level !== undefined && data.level !== null && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 bg-opacity-80' : 'bg-white bg-opacity-60'}`}
                  >
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
              {isValidRoomId(data.roomId) && (
                <div className='mt-2 text-xs opacity-75'>
                  📍 Room {data.roomId}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {isHovered &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={`fixed text-xs rounded-lg p-3 shadow-xl border pointer-events-none min-w-[200px] max-w-[300px] z-[9999] ${
              isDark
                ? 'bg-gray-900 text-white border-gray-700'
                : 'bg-white text-gray-900 border-gray-200'
            }`}
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
            }}
          >
            <div className='font-semibold mb-2'>
              {data.name || `Object ${data.id}`}
            </div>
            <div
              className={`grid grid-cols-2 gap-2 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              <div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  Type:
                </span>{' '}
                {data.type}
              </div>
              {data.material && (
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    Material:
                  </span>{' '}
                  {data.material}
                </div>
              )}
              {data.level !== undefined && data.level !== null && (
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    Level:
                  </span>{' '}
                  {data.level}
                </div>
              )}
              {data.rarity && (
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    Rarity:
                  </span>{' '}
                  {data.rarity}
                </div>
              )}
              {data.condition && (
                <div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    Condition:
                  </span>{' '}
                  {data.condition}
                </div>
              )}
            </div>
            {(data.value || data.weight) && (
              <div
                className={`grid grid-cols-2 gap-2 mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {data.value !== undefined && data.value !== null && (
                  <div>
                    <span
                      className={isDark ? 'text-gray-400' : 'text-gray-500'}
                    >
                      Value:
                    </span>{' '}
                    {data.value}g
                  </div>
                )}
                {data.weight !== undefined && data.weight !== null && (
                  <div>
                    <span
                      className={isDark ? 'text-gray-400' : 'text-gray-500'}
                    >
                      Weight:
                    </span>{' '}
                    {data.weight}lb
                  </div>
                )}
              </div>
            )}
            {isValidRoomId(data.roomId) && (
              <div
                className={`border-t pt-2 mt-2 ${isDark ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}
              >
                Currently in Room {data.roomId}
              </div>
            )}
            <div
              className={`border-t pt-2 mt-2 text-xs ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'}`}
            >
              💡 Drag to a room to place this object
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
