import { useCallback, useMemo, useState } from 'react';
import {
  detectOverlaps,
  type LayoutPosition,
  type OverlapInfo,
} from '@muditor/types';

interface RoomPosition {
  id: number;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
}

export const useRoomOverlaps = (rooms: RoomPosition[]) => {
  const [showOverlapInfo, setShowOverlapInfo] = useState(false);

  const positions = useMemo(() => {
    const byId: Record<number, LayoutPosition> = {};
    rooms.forEach(room => {
      if (room.layoutX === null || room.layoutX === undefined) return;
      if (room.layoutY === null || room.layoutY === undefined) return;
      byId[room.id] = {
        x: room.layoutX,
        y: room.layoutY,
        z: room.layoutZ ?? 0,
      };
    });
    return byId;
  }, [rooms]);

  const overlaps: OverlapInfo[] = useMemo(
    () => detectOverlaps(positions),
    [positions]
  );

  const toggleOverlapInfo = useCallback(() => {
    setShowOverlapInfo(v => !v);
  }, []);

  return { overlaps, showOverlapInfo, toggleOverlapInfo };
};
