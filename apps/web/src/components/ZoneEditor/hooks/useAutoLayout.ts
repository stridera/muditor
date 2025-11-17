import { useCallback, useState } from 'react';
import {
  autoLayoutRooms,
  detectOverlaps,
  type AutoLayoutRoom,
  type OverlapInfo,
} from '@muditor/types';

interface RoomExit {
  id: string;
  direction: string;
  toZoneId: number | null;
  toRoomId: number | null;
  description?: string | null;
  flags?: string[];
  keywords?: string[];
  key?: string | null;
}

interface Room {
  id: number;
  zoneId: number;
  name: string;
  sector: string;
  roomDescription?: string | null;
  layoutX: number | null;
  layoutY: number | null;
  layoutZ: number | null;
  exits?: RoomExit[];
}

interface UseAutoLayoutParams {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  addToUndoHistory: (action: {
    type: 'MOVE_MULTIPLE_ROOMS';
    timestamp: number;
    previousPositions: Record<number, { x: number; y: number }>;
    newPositions: Record<number, { x: number; y: number }>;
  }) => void;
  setError: (error: string | null) => void;
}

export const useAutoLayout = ({
  rooms,
  setRooms,
  authenticatedFetch,
  addToUndoHistory,
  setError,
}: UseAutoLayoutParams) => {
  const [overlaps, setOverlaps] = useState<OverlapInfo[]>([]);
  const [showOverlapInfo, setShowOverlapInfo] = useState(false);
  const [originalPositions, setOriginalPositions] = useState<
    Record<number, { x: number; y: number }>
  >({});

  // Convert Room to AutoLayoutRoom for the shared algorithm
  const convertToAutoLayoutRoom = useCallback((room: Room): AutoLayoutRoom => {
    const result: AutoLayoutRoom = {
      id: room.id,
      layoutX: room.layoutX,
      layoutY: room.layoutY,
      layoutZ: room.layoutZ,
      exits: (room.exits || []).map(exit => ({
        direction: exit.direction,
        toRoomId: exit.toRoomId,
        toZoneId: exit.toZoneId,
      })),
    };
    if (room.name) result.name = room.name;
    if (room.roomDescription) result.description = room.roomDescription;
    return result;
  }, []);

  // Auto-layout handler - positions rooms automatically following exits
  const handleAutoLayout = useCallback(
    async (selectedRoomId?: number | null) => {
      if (rooms.length === 0) return;

      // Save current positions for undo
      const currentPositions: Record<number, { x: number; y: number }> = {};
      rooms.forEach(room => {
        if (room.layoutX !== null && room.layoutY !== null) {
          currentPositions[room.id] = { x: room.layoutX, y: room.layoutY };
        }
      });
      setOriginalPositions(currentPositions);

      // Convert to AutoLayoutRoom format
      const autoLayoutRoomsData = rooms.map(convertToAutoLayoutRoom);

      // Run the auto-layout algorithm
      const layoutPositions = autoLayoutRooms(
        autoLayoutRoomsData,
        selectedRoomId ?? undefined
      );

      // Detect overlaps after layout
      const detectedOverlaps = detectOverlaps(layoutPositions);
      setOverlaps(detectedOverlaps);
      if (detectedOverlaps.length > 0) {
        console.log(
          `✨ Auto-layout detected ${detectedOverlaps.length} overlapping positions`
        );
      }

      // Apply new positions to rooms
      const updatedRooms = rooms.map(room => {
        const pos = layoutPositions[room.id];
        if (pos) {
          return {
            ...room,
            layoutX: pos.x,
            layoutY: pos.y,
            layoutZ: pos.z ?? room.layoutZ,
          };
        }
        return room;
      });

      // Update local state
      setRooms(updatedRooms);

      // Persist to database
      try {
        const mutations = updatedRooms
          .filter(room => layoutPositions[room.id])
          .map(room => {
            const pos = layoutPositions[room.id]!;
            return authenticatedFetch('/graphql', {
              method: 'POST',
              body: JSON.stringify({
                query: `mutation UpdateRoomPosition($zoneId:Int!,$id:Int!,$x:Int!,$y:Int!,$z:Int){
                updateRoom(zoneId:$zoneId,id:$id,data:{layoutX:$x,layoutY:$y,layoutZ:$z}){id layoutX layoutY layoutZ}
              }`,
                variables: {
                  zoneId: room.zoneId,
                  id: room.id,
                  x: pos.x,
                  y: pos.y,
                  z: pos.z ?? 0,
                },
              }),
            });
          });

        await Promise.all(mutations);

        // Add to undo history
        const newPositions: Record<number, { x: number; y: number }> = {};
        updatedRooms.forEach(room => {
          if (room.layoutX !== null && room.layoutY !== null) {
            newPositions[room.id] = { x: room.layoutX, y: room.layoutY };
          }
        });
        addToUndoHistory({
          type: 'MOVE_MULTIPLE_ROOMS',
          timestamp: Date.now(),
          previousPositions: currentPositions,
          newPositions: newPositions,
        });

        console.log(
          `✨ Auto-layout complete: positioned ${Object.keys(layoutPositions).length} rooms`
        );
      } catch (err) {
        console.error('Failed to save auto-layout positions:', err);
        setError('Failed to save auto-layout positions');
      }
    },
    [
      rooms,
      convertToAutoLayoutRoom,
      setRooms,
      authenticatedFetch,
      addToUndoHistory,
      setError,
    ]
  );

  // Reset to original database positions
  const handleResetLayout = useCallback(async () => {
    if (Object.keys(originalPositions).length === 0) {
      console.log('No original positions to reset to');
      return;
    }

    const updatedRooms = rooms.map(room => {
      const orig = originalPositions[room.id];
      if (orig) {
        return { ...room, layoutX: orig.x, layoutY: orig.y };
      }
      return room;
    });

    setRooms(updatedRooms);

    // Persist reset to database
    try {
      const mutations = updatedRooms
        .filter(room => originalPositions[room.id])
        .map(room => {
          const orig = originalPositions[room.id]!;
          return authenticatedFetch('/graphql', {
            method: 'POST',
            body: JSON.stringify({
              query: `mutation UpdateRoomPosition($zoneId:Int!,$id:Int!,$x:Int!,$y:Int!){
                updateRoom(zoneId:$zoneId,id:$id,data:{layoutX:$x,layoutY:$y}){id layoutX layoutY}
              }`,
              variables: {
                zoneId: room.zoneId,
                id: room.id,
                x: orig.x,
                y: orig.y,
              },
            }),
          });
        });

      await Promise.all(mutations);
      setOriginalPositions({});
      console.log('✨ Reset layout to original positions');
    } catch (err) {
      console.error('Failed to reset layout:', err);
      setError('Failed to reset layout');
    }
  }, [rooms, originalPositions, setRooms, authenticatedFetch, setError]);

  return {
    overlaps,
    showOverlapInfo,
    setShowOverlapInfo,
    originalPositions,
    handleAutoLayout,
    handleResetLayout,
  };
};
