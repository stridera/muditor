import React, { useMemo } from 'react';
import type { OverlapInfo } from '@muditor/types';

interface OverlapPanelProps {
  visible: boolean;
  overlaps: OverlapInfo[];
  rooms: Array<{ id: number; name: string }>;
  onClose: () => void;
}

export const OverlapPanel: React.FC<OverlapPanelProps> = ({
  visible,
  overlaps,
  rooms,
  onClose,
}) => {
  const roomNameMap = useMemo(() => {
    const map = new Map<number, string>();
    rooms.forEach(r => map.set(r.id, r.name));
    return map;
  }, [rooms]);

  if (!visible || overlaps.length === 0) return null;

  return (
    <div className='absolute top-14 right-4 z-50 w-80 rounded border border-yellow-400 bg-yellow-50 p-3 shadow-lg dark:border-yellow-500 dark:bg-yellow-900/80'>
      <div className='flex items-center justify-between mb-2'>
        <div className='text-sm font-semibold text-yellow-800 dark:text-yellow-100'>
          Overlapping rooms ({overlaps.length})
        </div>
        <button
          className='text-xs px-2 py-1 rounded bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-700 dark:hover:bg-yellow-600'
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <ul className='space-y-2 text-xs text-yellow-900 dark:text-yellow-100'>
        {overlaps.map(overlap => (
          <li
            key={`${overlap.position.x}-${overlap.position.y}-${overlap.position.z}`}
            className='rounded bg-white/70 dark:bg-yellow-800/60 px-2 py-1 border border-yellow-200 dark:border-yellow-700'
          >
            <div className='font-semibold'>
              ({overlap.position.x}, {overlap.position.y}, Z
              {overlap.position.z ?? 0})
            </div>
            <div className='mt-0.5'>
              {overlap.roomIds
                .map(id => roomNameMap.get(id) || `Room ${id}`)
                .join(', ')}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
