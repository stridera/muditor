import { useCallback, useEffect, useRef, useState } from 'react';
import type { Node } from 'reactflow';

interface UseRoomSelectionParams<
  TRoom extends { id: number; layoutZ?: number | null },
> {
  rooms: TRoom[];
  initialRoomId?: number | null;
  zoneId?: number | null;
  reactFlowInstance: {
    getNode: (id: string) => Node | undefined;
    setCenter: (
      x: number,
      y: number,
      opts?: { zoom?: number; duration?: number }
    ) => void;
  } | null;
  router: { push: (url: string) => void };
  setCurrentZLevel: (z: number) => void;
  log: { info?: (...args: unknown[]) => void };
}

export interface UseRoomSelectionResult<TRoom> {
  selectedRoomId: number | null;
  editedRoom: TRoom | null;
  handleSelectRoom: (roomId: number) => void;
  setEditedRoomField: (field: string, value: unknown) => void;
  clearSelection: () => void;
  setEditedRoom: React.Dispatch<React.SetStateAction<TRoom | null>>;
}

export function useRoomSelection<
  TRoom extends { id: number; layoutZ?: number | null },
>(params: UseRoomSelectionParams<TRoom>): UseRoomSelectionResult<TRoom> {
  const {
    rooms,
    initialRoomId,
    zoneId,
    reactFlowInstance,
    router,
    setCurrentZLevel,
    log,
  } = params;
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [editedRoom, setEditedRoom] = useState<TRoom | null>(null);
  const previousZoneIdRef = useRef<number | null | undefined>(zoneId);

  const handleSelectRoom = useCallback(
    (roomId: number, retryCount = 0) => {
      const room = rooms.find(r => r.id === roomId);
      if (!room) return;
      if (selectedRoomId === roomId && retryCount === 0) return;
      setSelectedRoomId(roomId);
      if (room) {
        setEditedRoom({ ...room } as TRoom);
      } else setEditedRoom(null);
      const z = room.layoutZ ?? 0;
      setCurrentZLevel(z);
      if (reactFlowInstance) {
        const node: Node | undefined = reactFlowInstance.getNode(
          roomId.toString()
        );
        if (node?.position) {
          const centerX = node.position.x + (node.width || 140) / 2;
          const centerY = node.position.y + (node.height || 140) / 2;
          reactFlowInstance.setCenter(centerX, centerY, {
            zoom: 1.0,
            duration: 600,
          });
        } else if (retryCount < 5) {
          // Node not positioned yet, retry after a short delay
          setTimeout(() => {
            handleSelectRoom(roomId, retryCount + 1);
          }, 100);
          return; // Don't update URL yet
        }
      }
      if (zoneId != null) {
        router.push(`/dashboard/zones/editor?zone=${zoneId}&room=${roomId}`);
      }
    },
    [rooms, selectedRoomId, reactFlowInstance, router, zoneId, setCurrentZLevel]
  );

  // Clear selection when zone changes
  useEffect(() => {
    if (previousZoneIdRef.current !== zoneId) {
      previousZoneIdRef.current = zoneId;
      setSelectedRoomId(null);
      setEditedRoom(null);
    }
  }, [zoneId]);

  // Auto-select initial room once rooms available
  useEffect(() => {
    if (
      initialRoomId != null &&
      rooms.length > 0 &&
      selectedRoomId == null &&
      rooms.some(r => r.id === initialRoomId)
    ) {
      log.info?.('select:initial-room', initialRoomId);
      // handleSelectRoom now has retry logic to wait for node positioning
      handleSelectRoom(initialRoomId);
    }
  }, [
    initialRoomId,
    rooms,
    selectedRoomId,
    handleSelectRoom,
    log,
    reactFlowInstance,
  ]);

  const setEditedRoomField = useCallback((field: string, value: unknown) => {
    setEditedRoom(prev => {
      if (!prev) return prev;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const updated = { ...(prev as TRoom), [field]: value } as TRoom;
      return updated;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRoomId(null);
    setEditedRoom(null);
  }, []);

  return {
    selectedRoomId,
    editedRoom,
    handleSelectRoom,
    setEditedRoomField,
    clearSelection,
    setEditedRoom,
  };
}
