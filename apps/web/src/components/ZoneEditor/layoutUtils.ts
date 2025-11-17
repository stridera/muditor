import type { OverlapInfo } from '@muditor/types';

// Minimal room shape required for layout algorithm
interface LayoutRoom {
  id: number;
  layoutZ?: number | null;
  exits: Array<{ direction: string; toRoomId: number | null | undefined }>;
}

// Breadth-first auto layout based on exits; assigns grid positions and preserves Z when present.
export function autoLayoutRooms(
  rooms: LayoutRoom[]
): Record<number, { x: number; y: number; z?: number }> {
  const positions: Record<number, { x: number; y: number; z?: number }> = {};
  const visited = new Set<number>();
  const queue: Array<{ roomId: number; x: number; y: number; z: number }> = [];

  const startRoom = rooms[0];
  if (startRoom) {
    queue.push({ roomId: startRoom.id, x: 0, y: 0, z: startRoom.layoutZ ?? 0 });

    const directionOffsets: Record<
      string,
      { x: number; y: number; z: number }
    > = {
      NORTH: { x: 0, y: -2, z: 0 },
      SOUTH: { x: 0, y: 2, z: 0 },
      EAST: { x: 2, y: 0, z: 0 },
      WEST: { x: -2, y: 0, z: 0 },
      NORTHEAST: { x: 2, y: -2, z: 0 },
      NORTHWEST: { x: -2, y: -2, z: 0 },
      SOUTHEAST: { x: 2, y: 2, z: 0 },
      SOUTHWEST: { x: -2, y: 2, z: 0 },
      UP: { x: 0, y: 0, z: 1 },
      DOWN: { x: 0, y: 0, z: -1 },
    };

    while (queue.length > 0) {
      const { roomId, x, y, z } = queue.shift()!;
      if (visited.has(roomId)) continue;
      visited.add(roomId);
      positions[roomId] = { x, y, z };
      const room = rooms.find(r => r.id === roomId);
      if (room?.exits) {
        room.exits.forEach(exit => {
          if (exit.toRoomId != null && !visited.has(exit.toRoomId)) {
            const offset = directionOffsets[exit.direction] || {
              x: 1,
              y: 1,
              z: 0,
            };
            queue.push({
              roomId: exit.toRoomId,
              x: x + offset.x,
              y: y + offset.y,
              z: z + offset.z,
            });
          }
        });
      }
    }

    // Position any remaining unconnected rooms in a grid below connected cluster.
    let gridX = 0;
    let gridY = 4;
    const roomsPerRow = Math.ceil(Math.sqrt(rooms.length));
    rooms.forEach(room => {
      if (!positions[room.id]) {
        positions[room.id] = {
          x: gridX * 2,
          y: gridY * 2,
          z: room.layoutZ ?? 0,
        };
        gridX++;
        if (gridX >= roomsPerRow) {
          gridX = 0;
          gridY++;
        }
      }
    });
  }
  return positions;
}

export function detectOverlaps(
  positions: Record<
    number,
    { x: number | null | undefined; y: number | null | undefined; z?: number }
  >
): OverlapInfo[] {
  const overlaps: OverlapInfo[] = [];
  const positionMap = new Map<string, number[]>();
  Object.entries(positions).forEach(([roomIdStr, pos]) => {
    const roomId = parseInt(roomIdStr);
    const key = `${pos.x},${pos.y},${pos.z ?? 0}`;
    if (!positionMap.has(key)) positionMap.set(key, []);
    positionMap.get(key)!.push(roomId);
  });
  positionMap.forEach((roomIds, posKey) => {
    if (roomIds.length > 1) {
      const [x, y] = posKey.split(',').map(Number);
      // Ensure numeric x,y to satisfy strict exactOptionalPropertyTypes
      // Normalize null/undefined to 0 to satisfy LayoutPosition requirements
      overlaps.push({
        roomIds,
        position: { x: x ?? 0, y: y ?? 0 },
        count: roomIds.length,
      });
    }
  });
  return overlaps;
}

export function resolveOverlaps(
  positions: Record<number, { x: number; y: number; z?: number }>
): Record<number, { x: number; y: number; z?: number }> {
  const resolved = { ...positions };
  const overlaps = detectOverlaps(positions);
  overlaps.forEach(overlap => {
    const { roomIds, position } = overlap;
    roomIds.forEach((roomId, index) => {
      if (index > 0) {
        const offsetX = index % 2 === 0 ? -1 : 1;
        const offsetY = Math.floor(index / 2);
        resolved[roomId] = {
          ...resolved[roomId],
          x: position.x + offsetX,
          y: position.y + offsetY,
        };
      }
    });
  });
  return resolved;
}
