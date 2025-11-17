import type { OverlapInfo } from '@muditor/types';
import { detectOverlaps } from '@muditor/types';
import { useEffect, useRef, useState } from 'react';

interface UseOverlapParams {
  rooms: Array<{
    id: number;
    layoutX?: number | null;
    layoutY?: number | null;
    layoutZ?: number | null;
  }>;
  worldMapMode: boolean;
  currentViewMode: string; // 'zone' | 'world-map' etc
}

export function useOverlapManagement({
  rooms,
  worldMapMode,
  currentViewMode,
}: UseOverlapParams) {
  const [overlaps, setOverlaps] = useState<OverlapInfo[]>([]);
  const [showOverlapInfo, setShowOverlapInfo] = useState(false);
  const [activeOverlapRooms, setActiveOverlapRooms] = useState<
    Record<string, number>
  >({});
  // Track last signature to avoid redundant JSON string comparisons on every render
  const lastSignatureRef = useRef<string>('');

  const getActiveOverlapIndex = (roomId: number, roomIds: number[]) => {
    if (!roomIds || roomIds.length === 0) return 0;
    const key = roomIds.join('-');
    const stored = activeOverlapRooms[key];
    if (stored !== undefined) return stored;
    return Math.max(0, roomIds.indexOf(roomId));
  };

  const handleSwitchOverlapRoom = (
    roomId: number,
    roomIds: number[],
    direction: 'next' | 'prev'
  ) => {
    if (!roomIds || roomIds.length < 2) return;
    const key = roomIds.join('-');
    const current = activeOverlapRooms[key] ?? roomIds.indexOf(roomId);
    const next =
      direction === 'next'
        ? (current + 1) % roomIds.length
        : (current - 1 + roomIds.length) % roomIds.length;
    setActiveOverlapRooms(prev => ({ ...prev, [key]: next }));
  };

  // Effect: detect overlaps when rooms load/change in zone view only
  useEffect(() => {
    if (rooms.length > 0 && !worldMapMode && currentViewMode !== 'world-map') {
      const positions: Record<number, { x: number; y: number; z?: number }> =
        {};
      rooms.forEach(room => {
        if (
          room.layoutX !== null &&
          room.layoutX !== undefined &&
          room.layoutY !== null &&
          room.layoutY !== undefined
        ) {
          positions[room.id] = {
            x: room.layoutX,
            y: room.layoutY,
            z: room.layoutZ ?? 0,
          };
        }
      });
      const detectedOverlaps = detectOverlaps(positions);
      const signature = JSON.stringify(detectedOverlaps);
      if (signature !== lastSignatureRef.current) {
        lastSignatureRef.current = signature;
        setOverlaps(detectedOverlaps);
      }
    }
  }, [rooms, worldMapMode, currentViewMode]);

  const resetOverlaps = () => {
    setOverlaps([]);
    setShowOverlapInfo(false);
    lastSignatureRef.current = '[]';
  };

  return {
    overlaps,
    setOverlaps, // expose for auto-layout updates
    showOverlapInfo,
    setShowOverlapInfo,
    activeOverlapRooms,
    getActiveOverlapIndex,
    handleSwitchOverlapRoom,
    resetOverlaps,
  };
}
