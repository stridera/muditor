/**
 * Shared auto-layout algorithm for zone editor and database seeding
 *
 * This module provides a unified implementation of the room auto-layout algorithm
 * that can be used by both the zone editor frontend and the world importer backend.
 */

// Auto-layout algorithm following exits
export interface LayoutPosition {
  x: number;
  y: number;
  z?: number;
}

export interface OverlapInfo {
  roomIds: number[];
  position: LayoutPosition;
  count: number;
}

// Minimal room interface for auto-layout (compatible with both editor and Prisma types)
export interface AutoLayoutRoom {
  id: number;
  name?: string;
  description?: string;
  layoutX?: number | null;
  layoutY?: number | null;
  layoutZ?: number | null;
  exits: AutoLayoutExit[];
}

export interface AutoLayoutExit {
  direction: string;
  toRoomId?: number | null;
  toZoneId?: number | null;
}

// Direction to coordinate offset mapping with 1-unit spacing for cleaner layout
const DIRECTION_OFFSETS: Record<string, { x: number; y: number }> = {
  // All caps versions (for compatibility)
  NORTH: { x: 0, y: -1 },
  SOUTH: { x: 0, y: 1 },
  EAST: { x: 1, y: 0 },
  WEST: { x: -1, y: 0 },
  NORTHEAST: { x: 1, y: -1 },
  NORTHWEST: { x: -1, y: -1 },
  SOUTHEAST: { x: 1, y: 1 },
  SOUTHWEST: { x: -1, y: 1 },
  UP: { x: 0, y: 0 }, // UP/DOWN maintain same X/Y position
  DOWN: { x: 0, y: 0 },

  // Capitalized versions (actual world data format)
  North: { x: 0, y: -1 },
  South: { x: 0, y: 1 },
  East: { x: 1, y: 0 },
  West: { x: -1, y: 0 },
  Northeast: { x: 1, y: -1 },
  Northwest: { x: -1, y: -1 },
  Southeast: { x: 1, y: 1 },
  Southwest: { x: -1, y: 1 },
  Up: { x: 0, y: 0 },
  Down: { x: 0, y: 0 },

  // Lowercase versions (for completeness)
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
  northeast: { x: 1, y: -1 },
  northwest: { x: -1, y: -1 },
  southeast: { x: 1, y: 1 },
  southwest: { x: -1, y: 1 },
  up: { x: 0, y: 0 },
  down: { x: 0, y: 0 },
};

/**
 * Smart starting room selection
 */
function selectStartingRoom(
  rooms: AutoLayoutRoom[],
  startRoomId?: number
): AutoLayoutRoom | null {
  if (startRoomId) {
    const specifiedRoom = rooms.find(r => r.id === startRoomId);
    if (specifiedRoom) {
      console.log(`🎯 Using specified starting room: ${startRoomId}`);
      return specifiedRoom;
    }
  }

  // Calculate room scores for smart selection
  const roomScores = rooms.map(room => {
    let score = 0;

    // Prefer rooms with more connections (likely central)
    score += room.exits.length * 10;

    // Prefer rooms with "entrance" keywords in name or description
    const text = `${room.name || ''} ${room.description || ''}`.toLowerCase();
    if (
      text.includes('entrance') ||
      text.includes('gate') ||
      text.includes('entry')
    ) {
      score += 50;
    }

    // Slightly prefer lower IDs (often spawn areas)
    const maxId = Math.max(...rooms.map(r => r.id));
    score += ((maxId - room.id) / maxId) * 5;

    // Prefer ground level (Z=0)
    if ((room.layoutZ || 0) === 0) {
      score += 20;
    }

    return { room, score };
  });

  // Sort by score descending and pick the best
  roomScores.sort((a, b) => b.score - a.score);
  const selectedRoom = roomScores[0]?.room;

  if (selectedRoom && roomScores.length > 0) {
    console.log(
      `🎯 Smart starting room selection: room ${selectedRoom.id} (score: ${roomScores[0]!.score}, exits: ${selectedRoom.exits.length})`
    );
  }

  return selectedRoom || null;
}

/**
 * Direction validation
 */
function validateDirection(direction: string): boolean {
  const knownDirections = Object.keys(DIRECTION_OFFSETS);
  return knownDirections.includes(direction);
}

/**
 * Detect overlaps
 */
function detectOverlaps(
  positions: Record<number, LayoutPosition>
): OverlapInfo[] {
  const positionMap = new Map<string, number[]>();

  // Group rooms by 3D position (including Z-level)
  for (const [roomIdStr, pos] of Object.entries(positions)) {
    const roomId = parseInt(roomIdStr);
    const key = `${pos.x},${pos.y},${pos.z ?? 0}`;
    if (!positionMap.has(key)) {
      positionMap.set(key, []);
    }
    positionMap.get(key)!.push(roomId);
  }

  // Find overlaps
  const overlaps: OverlapInfo[] = [];
  for (const [posKey, roomIds] of positionMap) {
    if (roomIds.length > 1) {
      const parts = posKey.split(',');
      const x = Number(parts[0]) || 0;
      const y = Number(parts[1]) || 0;
      const z = Number(parts[2]) || 0;
      overlaps.push({
        roomIds,
        position: { x, y, z },
        count: roomIds.length,
      });
    }
  }

  return overlaps;
}

/**
 * Layout quality metrics
 */
function calculateLayoutQuality(
  positions: Record<number, LayoutPosition>,
  rooms: AutoLayoutRoom[]
): number {
  let totalPathLength = 0;
  let pathCount = 0;
  let overlapCount = 0;

  // Calculate total path length between connected rooms
  for (const room of rooms) {
    const roomPos = positions[room.id];
    if (!roomPos) continue;

    for (const exit of room.exits) {
      if (exit.toRoomId === null || exit.toRoomId === undefined) continue;
      const destPos = positions[exit.toRoomId];
      if (!destPos) continue;

      const distance = Math.sqrt(
        Math.pow(destPos.x - roomPos.x, 2) +
          Math.pow(destPos.y - roomPos.y, 2) +
          Math.pow((destPos.z || 0) - (roomPos.z || 0), 2)
      );
      totalPathLength += distance;
      pathCount++;
    }
  }

  // Count overlaps
  const overlaps = detectOverlaps(positions);
  overlapCount = overlaps.reduce((sum, overlap) => sum + overlap.count - 1, 0);

  // Calculate quality score (lower is better) - overlaps are acceptable
  const averagePathLength = pathCount > 0 ? totalPathLength / pathCount : 0;
  const qualityScore = averagePathLength; // Don't penalize overlaps

  console.log(
    `📊 Layout quality: avg path length: ${averagePathLength.toFixed(2)}, overlaps: ${overlapCount}, score: ${qualityScore.toFixed(2)}`
  );

  // Debug: Log overlap details
  if (overlaps.length > 0) {
    console.log(`🔍 Detected ${overlaps.length} overlap groups:`);
    overlaps.forEach((overlap, idx) => {
      console.log(
        `  ${idx + 1}. Position (${overlap.position.x}, ${overlap.position.y}, ${overlap.position.z}): Rooms ${overlap.roomIds.join(', ')}`
      );
    });
  } else {
    console.log(`✅ No overlaps detected in auto-layout`);
  }

  return qualityScore;
}

/**
 * Main auto-layout algorithm using improved breadth-first search with smart starting room selection
 */
export function autoLayoutRooms(
  rooms: AutoLayoutRoom[],
  startRoomId?: number
): Record<number, LayoutPosition> {
  const positions: Record<number, LayoutPosition> = {};
  const visited = new Set<number>();
  const queue: Array<{ roomId: number; position: LayoutPosition }> = [];

  console.log(
    `🔍 autoLayoutRooms called with ${rooms.length} rooms, startRoomId: ${startRoomId}`
  );

  // Smart starting room selection
  const startRoom = selectStartingRoom(rooms, startRoomId);

  if (!startRoom) {
    console.log('❌ No start room found, returning empty positions');
    return positions;
  }

  console.log(`🔍 Starting auto-layout from room ${startRoom.id}`);

  // Start at origin with Z-level from existing room data
  const startZ = startRoom.layoutZ || 0;
  const startPos = { x: 0, y: 0, z: startZ };
  positions[startRoom.id] = startPos;
  visited.add(startRoom.id);
  queue.push({ roomId: startRoom.id, position: startPos });

  console.log(
    `🔍 Initial position: room ${startRoom.id} at (${startPos.x}, ${startPos.y}, Z${startPos.z})`
  );

  // BFS to place rooms following exits
  while (queue.length > 0) {
    const { roomId, position } = queue.shift()!;
    const room = rooms.find(r => r.id === roomId);
    if (!room) continue;

    console.log(
      `🔍 Processing room ${roomId} at (${position.x}, ${position.y}) with ${room.exits.length} exits`
    );

    // Process each exit
    for (const exit of room.exits) {
      console.log(`🔍 Found exit: ${exit.direction} → room ${exit.toRoomId}`);
      if (
        exit.toRoomId === null ||
        exit.toRoomId === undefined ||
        visited.has(exit.toRoomId)
      )
        continue;

      const destinationRoom = rooms.find(r => r.id === exit.toRoomId);
      if (!destinationRoom) continue;

      // Validate direction
      if (!validateDirection(exit.direction)) {
        console.warn(
          `⚠️ Unknown direction: ${exit.direction}, using default offset`
        );
      }

      // Calculate new position based on direction
      let newPosition: LayoutPosition;

      const directionUpper = exit.direction.toUpperCase();
      if (directionUpper === 'UP' || directionUpper === 'DOWN') {
        // UP/DOWN exits should maintain same X/Y but change Z-level
        const zChange = directionUpper === 'UP' ? 1 : -1;
        const currentZ = position.z || 0;
        newPosition = {
          x: position.x, // Same X coordinate
          y: position.y, // Same Y coordinate
          z: currentZ + zChange, // Change Z-level
        };
        console.log(
          `🔍 Placing room ${exit.toRoomId} at (${newPosition.x}, ${newPosition.y}, Z${newPosition.z}) via ${exit.direction} exit (Z-level change: ${zChange > 0 ? '+' : ''}${zChange})`
        );
      } else {
        // Horizontal exits use X/Y offset mapping
        const offset = DIRECTION_OFFSETS[exit.direction];
        if (!offset) {
          console.warn(
            `⚠️ No offset mapping for direction: ${exit.direction}, using default east offset`
          );
          // Use east as default for unknown directions (allowing overlaps)
          const defaultOffset = { x: 1, y: 0 };
          newPosition = {
            x: position.x + defaultOffset.x,
            y: position.y + defaultOffset.y,
            z: position.z || 0, // Maintain current Z-level
          };
        } else {
          newPosition = {
            x: position.x + offset.x,
            y: position.y + offset.y,
            z: position.z || 0, // Maintain current Z-level
          };
        }
        console.log(
          `🔍 Placing room ${exit.toRoomId} at (${newPosition.x}, ${newPosition.y}, Z${newPosition.z || 0}) via ${exit.direction} exit (offset: ${JSON.stringify(offset || 'calculated')})`
        );
      }

      positions[exit.toRoomId] = newPosition;
      visited.add(exit.toRoomId);
      queue.push({ roomId: exit.toRoomId, position: newPosition });
    }
  }

  // Place unconnected rooms in a separate area
  let unconnectedX = 10; // Start further away to avoid connected rooms
  let unconnectedY = 0;
  let unconnectedCount = 0;
  for (const room of rooms) {
    if (!visited.has(room.id)) {
      positions[room.id] = { x: unconnectedX, y: unconnectedY };
      console.log(
        `🔍 Placing unconnected room ${room.id} at (${unconnectedX}, ${unconnectedY})`
      );
      unconnectedCount++;
      unconnectedX += 1; // Use 1-unit spacing
      if (unconnectedX > 15) {
        // Wrap after 6 rooms per row
        unconnectedX = 10;
        unconnectedY += 1; // Use 1-unit spacing
      }
    }
  }

  console.log(
    `🔍 Auto-layout complete: ${Object.keys(positions).length} total positions, ${visited.size} connected, ${unconnectedCount} unconnected`
  );

  // Calculate and log layout quality
  calculateLayoutQuality(positions, rooms);

  return positions;
}

/**
 * Resolve overlaps by shifting rooms (disabled - overlaps are now allowed)
 */
export function resolveOverlaps(
  positions: Record<number, LayoutPosition>
): Record<number, LayoutPosition> {
  // Return original positions without any changes - overlaps are now allowed
  console.log(
    `🔍 LOCAL resolveOverlaps: Keeping original positions (overlaps allowed)`
  );
  return { ...positions };
}

// Export additional utility functions for advanced use cases
export { calculateLayoutQuality, detectOverlaps };
