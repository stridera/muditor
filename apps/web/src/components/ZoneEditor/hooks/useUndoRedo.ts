// Minimal RoomLike interface replacing temporary any alias
interface RoomLike {
  id: number;
  layoutX?: number | null | undefined;
  layoutY?: number | null | undefined;
  layoutZ?: number | null | undefined;
}
import { useCallback, useState } from 'react';
import type { Node } from 'reactflow';
import { pixelsToGrid, pixelsToGridY } from '../editor-constants';

// Generic minimal room shape; actual Room can extend this
export interface BaseRoomShape {
  id: number;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
  zoneId?: number;
}

export interface UndoAction {
  type: 'MOVE_ROOM' | 'MOVE_MULTIPLE_ROOMS';
  timestamp: number;
  roomId?: number;
  roomIds?: number[];
  previousPosition?: { x: number; y: number };
  previousPositions?: Record<number, { x: number; y: number }>;
  newPosition?: { x: number; y: number };
  newPositions?: Record<number, { x: number; y: number }>;
}

export interface UseUndoRedoParams<TRoom extends BaseRoomShape> {
  rooms: TRoom[]; // Accept full Room shape but only use layout props
  setRooms: React.Dispatch<React.SetStateAction<TRoom[]>>;
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
  log: {
    info?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
  };
}

export const useUndoRedo = <TRoom extends BaseRoomShape>({
  rooms,
  setRooms,
  setNodes,
  authenticatedFetch,
  log,
}: UseUndoRedoParams<TRoom>) => {
  const [undoHistory, setUndoHistory] = useState<UndoAction[]>([]);
  const [undoIndex, setUndoIndex] = useState(-1);
  const MAX_UNDO_HISTORY = 50;

  const addToUndoHistory = useCallback(
    (action: UndoAction) => {
      setUndoHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, undoIndex + 1);
        newHistory.push(action);
        if (newHistory.length > MAX_UNDO_HISTORY) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setUndoIndex(prevIndex => Math.min(prevIndex + 1, MAX_UNDO_HISTORY - 1));
    },
    [undoIndex]
  );

  const canUndo = undoIndex >= 0;
  const canRedo = undoIndex < undoHistory.length - 1;

  const handleUndo = useCallback(async () => {
    if (!canUndo || undoIndex < 0) return;
    const action = undoHistory[undoIndex];
    if (!action) return;
    try {
      if (
        action.type === 'MOVE_ROOM' &&
        action.roomId !== null &&
        action.roomId !== undefined &&
        action.previousPosition
      ) {
        const roomId = action.roomId;
        const prevPos = action.previousPosition;
        const currentRoom = rooms.find(r => r.id === roomId);
        const currentZ = currentRoom?.layoutZ ?? 0;
        const response = await authenticatedFetch(
          process.env.NEXT_PUBLIC_GRAPHQL_URL || '/graphql',
          {
            method: 'POST',
            body: JSON.stringify({
              query: `
              mutation UpdateRoomPosition($id: Int!, $position: UpdateRoomPositionInput!) {
                updateRoomPosition(id: $id, position: $position) {
                  id
                  layoutX
                  layoutY
                  layoutZ
                }
              }
            `,
              variables: {
                id: roomId,
                position: {
                  layoutX: pixelsToGrid(prevPos.x),
                  layoutY: pixelsToGridY(prevPos.y),
                  layoutZ: currentZ,
                },
              },
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (!data.errors) {
            setNodes(nodes =>
              nodes.map(node =>
                node.id === roomId.toString()
                  ? { ...node, position: prevPos }
                  : node
              )
            );
            setRooms((prevRooms: TRoom[]) =>
              prevRooms.map((room: TRoom) =>
                room.id === roomId
                  ? {
                      ...room,
                      layoutX: pixelsToGrid(prevPos.x),
                      layoutY: pixelsToGridY(prevPos.y),
                    }
                  : room
              )
            );
          } else {
            log.error?.(
              'GraphQL error undo room',
              roomId,
              data.errors[0].message
            );
          }
        } else {
          log.error?.('HTTP error undo room', roomId, response.status);
        }
      } else if (
        action.type === 'MOVE_MULTIPLE_ROOMS' &&
        action.previousPositions
      ) {
        const updates = Object.entries(action.previousPositions).map(
          ([roomIdStr, prevPos]) => {
            const roomId = parseInt(roomIdStr);
            const currentRoom = rooms.find(r => r.id === roomId);
            const currentZ = currentRoom?.layoutZ ?? 0;
            return {
              roomId,
              layoutX: pixelsToGrid(prevPos.x),
              layoutY: pixelsToGridY(prevPos.y),
              layoutZ: currentZ,
            };
          }
        );
        const response = await authenticatedFetch(
          process.env.NEXT_PUBLIC_GRAPHQL_URL ||
            'http://localhost:3001/graphql',
          {
            method: 'POST',
            body: JSON.stringify({
              query: `
                mutation BatchUpdateRoomPositions($input: BatchUpdateRoomPositionsInput!) {
                  batchUpdateRoomPositions(input: $input) {
                    updatedCount
                    errors
                  }
                }
              `,
              variables: { input: { updates } },
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (!data.errors) {
            const result = data.data.batchUpdateRoomPositions;
            if (result.errors && result.errors.length > 0) {
              log.warn?.('Some undo operations had issues', result.errors);
            }
            setNodes(nodes =>
              nodes.map(node => {
                const prevPos = action.previousPositions?.[parseInt(node.id)];
                return prevPos ? { ...node, position: prevPos } : node;
              })
            );
            setRooms((prevRooms: TRoom[]) =>
              prevRooms.map((room: TRoom) => {
                const prevPos = action.previousPositions?.[room.id];
                if (prevPos) {
                  return {
                    ...room,
                    layoutX: pixelsToGrid(prevPos.x),
                    layoutY: pixelsToGridY(prevPos.y),
                  };
                }
                return room;
              })
            );
          } else {
            log.error?.('GraphQL error batch undo', data.errors[0].message);
            throw new Error(data.errors[0].message);
          }
        } else {
          log.error?.(
            'HTTP error batch undo',
            response.status,
            response.statusText
          );
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      setUndoIndex(prevIndex => prevIndex - 1);
    } catch (error) {
      log.error?.('Failed to undo', error);
    }
  }, [
    canUndo,
    undoIndex,
    undoHistory,
    rooms,
    setNodes,
    setRooms,
    authenticatedFetch,
    log,
  ]);

  const handleRedo = useCallback(async () => {
    if (!canRedo) return;
    const nextIndex = undoIndex + 1;
    const action = undoHistory[nextIndex];
    if (!action) return;
    try {
      if (
        action.type === 'MOVE_ROOM' &&
        action.roomId !== null &&
        action.roomId !== undefined &&
        action.newPosition
      ) {
        const roomId = action.roomId;
        const newPos = action.newPosition;
        const currentRoom = rooms.find(r => r.id === roomId);
        const currentZ = currentRoom?.layoutZ ?? 0;
        const response = await authenticatedFetch(
          process.env.NEXT_PUBLIC_GRAPHQL_URL || '/graphql',
          {
            method: 'POST',
            body: JSON.stringify({
              query: `
              mutation UpdateRoomPosition($id: Int!, $position: UpdateRoomPositionInput!) {
                updateRoomPosition(id: $id, position: $position) {
                  id
                  layoutX
                  layoutY
                  layoutZ
                }
              }
            `,
              variables: {
                id: roomId,
                position: {
                  layoutX: pixelsToGrid(newPos.x),
                  layoutY: pixelsToGridY(newPos.y),
                  layoutZ: currentZ,
                },
              },
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (!data.errors) {
            setNodes(nodes =>
              nodes.map(node =>
                node.id === roomId.toString()
                  ? { ...node, position: newPos }
                  : node
              )
            );
            setRooms(prevRooms =>
              prevRooms.map(room =>
                room.id === roomId
                  ? {
                      ...room,
                      layoutX: pixelsToGrid(newPos.x),
                      layoutY: pixelsToGrid(newPos.y),
                    }
                  : room
              )
            );
          } else {
            log.error?.(
              'GraphQL error redo room',
              roomId,
              data.errors[0].message
            );
          }
        } else {
          log.error?.('HTTP error redo room', roomId, response.status);
        }
      } else if (action.type === 'MOVE_MULTIPLE_ROOMS' && action.newPositions) {
        const updates = Object.entries(action.newPositions).map(
          ([roomIdStr, newPos]) => {
            const roomId = parseInt(roomIdStr);
            const currentRoom = rooms.find(r => r.id === roomId);
            const currentZ = currentRoom?.layoutZ ?? 0;
            return {
              roomId,
              layoutX: pixelsToGrid(newPos.x),
              layoutY: pixelsToGridY(newPos.y),
              layoutZ: currentZ,
            };
          }
        );
        const response = await authenticatedFetch(
          process.env.NEXT_PUBLIC_GRAPHQL_URL ||
            'http://localhost:3001/graphql',
          {
            method: 'POST',
            body: JSON.stringify({
              query: `
                mutation BatchUpdateRoomPositions($input: BatchUpdateRoomPositionsInput!) {
                  batchUpdateRoomPositions(input: $input) {
                    updatedCount
                    errors
                  }
                }
              `,
              variables: { input: { updates } },
            }),
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (!data.errors) {
            const result = data.data.batchUpdateRoomPositions;
            if (result.errors && result.errors.length > 0) {
              log.warn?.('Some redo operations had issues', result.errors);
            }
            setNodes(nodes =>
              nodes.map(node => {
                const redoPos = action.newPositions?.[parseInt(node.id)];
                return redoPos ? { ...node, position: redoPos } : node;
              })
            );
            setRooms(prevRooms =>
              prevRooms.map(room => {
                const redoPos = action.newPositions?.[room.id];
                if (redoPos) {
                  return {
                    ...room,
                    layoutX: pixelsToGrid(redoPos.x),
                    layoutY: pixelsToGridY(redoPos.y),
                  };
                }
                return room;
              })
            );
          } else {
            log.error?.('GraphQL error batch redo', data.errors[0].message);
            throw new Error(data.errors[0].message);
          }
        } else {
          log.error?.(
            'HTTP error batch redo',
            response.status,
            response.statusText
          );
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      setUndoIndex(nextIndex);
    } catch (error) {
      log.error?.('Failed to redo', error);
    }
  }, [
    canRedo,
    undoIndex,
    undoHistory,
    rooms,
    setNodes,
    setRooms,
    authenticatedFetch,
    log,
  ]);

  return {
    addToUndoHistory,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    undoHistory,
    undoIndex,
  };
};
