'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { NodeProps } from 'reactflow';

interface MobData {
  id: number;
  name: string;
  level: number;
  race?: string;
  class?: string;
  mobClass?: string;
  hitpoints?: number;
  alignment?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'boss';
  roomId?: number;
}

const getDifficultyStyle = (difficulty?: string) => {
  switch (difficulty) {
    case 'easy':
      return {
        bg: 'bg-green-100',
        border: 'border-green-400',
        text: 'text-green-800',
      };
    case 'medium':
      return {
        bg: 'bg-yellow-100',
        border: 'border-yellow-400',
        text: 'text-yellow-800',
      };
    case 'hard':
      return {
        bg: 'bg-red-100',
        border: 'border-red-400',
        text: 'text-red-800',
      };
    case 'boss':
      return {
        bg: 'bg-purple-100',
        border: 'border-purple-400',
        text: 'text-purple-800',
      };
    default:
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-400',
        text: 'text-gray-800',
      };
  }
};

const getAlignmentIcon = (alignment?: string) => {
  switch (alignment) {
    case 'GOOD':
      return '😇';
    case 'NEUTRAL':
      return '😐';
    case 'EVIL':
      return '😈';
    default:
      return '👹';
  }
};

export const MobNode: React.FC<NodeProps<MobData>> = ({ data, selected }) => {
  const style = getDifficultyStyle(data.difficulty);
  const alignmentIcon = getAlignmentIcon(data.alignment);
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
          ${selected ? 'ring-2 ring-red-500 ring-offset-2' : ''}
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
              <span className='text-lg'>{alignmentIcon}</span>
              <span className='font-bold text-sm'>Lvl {data.level}</span>
            </div>
            {data.difficulty && (
              <span className='bg-white bg-opacity-60 px-1.5 py-0.5 rounded text-xs font-medium capitalize'>
                {data.difficulty}
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
            {data.race && (
              <span className='text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded-full'>
                {data.race}
              </span>
            )}
            {data.mobClass && (
              <span className='text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded-full'>
                {data.mobClass}
              </span>
            )}
          </div>

          {data.hitpoints && (
            <div className='flex items-center gap-1 text-xs'>
              <span>❤️</span>
              <span>{data.hitpoints} HP</span>
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
            <div className='font-semibold mb-2'>
              {data.name} (Level {data.level})
            </div>

            <div className='grid grid-cols-2 gap-2 text-gray-300'>
              {data.race && (
                <div>
                  <span className='text-gray-400'>Race:</span> {data.race}
                </div>
              )}
              {data.mobClass && (
                <div>
                  <span className='text-gray-400'>Class:</span> {data.mobClass}
                </div>
              )}
              {data.hitpoints && (
                <div>
                  <span className='text-gray-400'>HP:</span> {data.hitpoints}
                </div>
              )}
              {data.alignment && (
                <div>
                  <span className='text-gray-400'>Align:</span> {data.alignment}
                </div>
              )}
              {data.difficulty && (
                <div>
                  <span className='text-gray-400'>Difficulty:</span>{' '}
                  {data.difficulty}
                </div>
              )}
            </div>

            {data.roomId && (
              <div className='border-t border-gray-700 pt-2 mt-2 text-gray-300'>
                Currently in Room {data.roomId}
              </div>
            )}

            <div className='border-t border-gray-700 pt-2 mt-2 text-gray-400 text-xs'>
              💡 Drag to a room to place this mob
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
