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

// Enhanced direction to coordinate offset mapping with dynamic spacing for natural layout
const BASE_DIRECTION_OFFSETS: Record<string, { x: number; y: number }> = {
  // All caps versions (for compatibility)
  'NORTH': { x: 0, y: -1 },
  'SOUTH': { x: 0, y: 1 },
  'EAST': { x: 1, y: 0 },
  'WEST': { x: -1, y: 0 },
  'NORTHEAST': { x: 1, y: -1 },
  'NORTHWEST': { x: -1, y: -1 },
  'SOUTHEAST': { x: 1, y: 1 },
  'SOUTHWEST': { x: -1, y: 1 },
  'UP': { x: 0, y: 0 }, // UP/DOWN maintain same X/Y position
  'DOWN': { x: 0, y: 0 },

  // Capitalized versions (actual world data format)
  'North': { x: 0, y: -1 },
  'South': { x: 0, y: 1 },
  'East': { x: 1, y: 0 },
  'West': { x: -1, y: 0 },
  'Northeast': { x: 1, y: -1 },
  'Northwest': { x: -1, y: -1 },
  'Southeast': { x: 1, y: 1 },
  'Southwest': { x: -1, y: 1 },
  'Up': { x: 0, y: 0 },
  'Down': { x: 0, y: 0 },

  // Lowercase versions (for completeness)
  'north': { x: 0, y: -1 },
  'south': { x: 0, y: 1 },
  'east': { x: 1, y: 0 },
  'west': { x: -1, y: 0 },
  'northeast': { x: 1, y: -1 },
  'northwest': { x: -1, y: -1 },
  'southeast': { x: 1, y: 1 },
  'southwest': { x: -1, y: 1 },
  'up': { x: 0, y: 0 },
  'down': { x: 0, y: 0 },
};

/**
 * Calculate dynamic spacing based on room density and zone size
 */
function calculateDynamicSpacing(rooms: AutoLayoutRoom[]): number {
  const roomCount = rooms.length;

  // Base spacing increases with zone size for readability
  let spacing = 2; // Minimum 2-unit spacing for readability

  if (roomCount > 100) {
    spacing = 4; // Large zones need more spacing
  } else if (roomCount > 50) {
    spacing = 3; // Medium zones get moderate spacing
  }

  console.log(`📏 Dynamic spacing: ${spacing} units for ${roomCount} rooms`);
  return spacing;
}

/**
 * Get directional offset with dynamic spacing
 */
function getDirectionalOffset(direction: string, spacing: number): { x: number; y: number } {
  const baseOffset = BASE_DIRECTION_OFFSETS[direction];
  if (!baseOffset) return { x: spacing, y: 0 }; // Default to east

  return {
    x: baseOffset.x * spacing,
    y: baseOffset.y * spacing
  };
}

// Backward compatibility - use dynamic spacing (deprecated)
const DIRECTION_OFFSETS = BASE_DIRECTION_OFFSETS;

/**
 * Calculate room centrality based on graph properties
 */
function calculateRoomCentrality(rooms: AutoLayoutRoom[]): Map<number, number> {
  const centralityScores = new Map<number, number>();

  // Build adjacency list for graph analysis
  const adjacencyList = new Map<number, number[]>();
  rooms.forEach(room => {
    adjacencyList.set(room.id, room.exits.map(e => e.toRoomId).filter(d => d !== null && d !== undefined) as number[]);
  });

  // Calculate betweenness centrality (simplified)
  rooms.forEach(room => {
    let centrality = 0;

    // Direct connections score
    const directConnections = room.exits.length;
    centrality += directConnections * 10;

    // Hub potential - rooms that connect to many well-connected rooms
    const connectedRoomExits = room.exits
      .map(exit => rooms.find(r => r.id === exit.toRoomId))
      .filter(r => r !== undefined)
      .reduce((sum, r) => sum + (r?.exits.length || 0), 0);
    centrality += connectedRoomExits * 2;

    // Entrance/important room keywords
    const text = `${room.name || ''} ${room.description || ''}`.toLowerCase();
    if (text.includes('entrance') || text.includes('gate') || text.includes('entry')) {
      centrality += 50;
    }
    if (text.includes('central') || text.includes('main') || text.includes('plaza') || text.includes('square')) {
      centrality += 40;
    }
    if (text.includes('crossroads') || text.includes('intersection') || text.includes('junction')) {
      centrality += 30;
    }

    // Prefer ground level
    if ((room.layoutZ || 0) === 0) {
      centrality += 20;
    }

    // Slight preference for lower IDs (often spawn areas)
    const maxId = Math.max(...rooms.map(r => r.id));
    centrality += (maxId - room.id) / maxId * 5;

    centralityScores.set(room.id, centrality);
  });

  return centralityScores;
}

/**
 * Enhanced starting room selection with MUD spawn room priority
 */
function selectStartingRoom(rooms: AutoLayoutRoom[], startRoomId?: number): AutoLayoutRoom | null {
  // First priority: Explicit start room ID provided
  if (startRoomId) {
    const specifiedRoom = rooms.find(r => r.id === startRoomId);
    if (specifiedRoom) {
      console.log(`🎯 Using specified starting room: ${startRoomId}`);
      return specifiedRoom;
    }
  }

  // Second priority: MUD starting room (3001) - the global spawn point
  const mudStartRoom = rooms.find(r => r.id === 3001);
  if (mudStartRoom) {
    console.log(`🌍 Using MUD starting room (3001) as global layout origin for world map connectivity`);
    return mudStartRoom;
  }

  // Third priority: Other common spawn/starting room IDs
  const commonStartRoomIds = [3000, 3002, 1, 100, 1000];
  for (const roomId of commonStartRoomIds) {
    const possibleStartRoom = rooms.find(r => r.id === roomId);
    if (possibleStartRoom) {
      console.log(`🎯 Using common starting room ID: ${roomId}`);
      return possibleStartRoom;
    }
  }

  // Fourth priority: Calculate centrality scores for all rooms
  const centralityScores = calculateRoomCentrality(rooms);

  // Find the most central room
  let bestRoom: AutoLayoutRoom | undefined = undefined;
  let bestScore = -1;

  centralityScores.forEach((score, roomId) => {
    if (score > bestScore) {
      bestScore = score;
      const foundRoom = rooms.find(r => r.id === roomId);
      if (foundRoom) {
        bestRoom = foundRoom;
      }
    }
  });

  if (bestRoom) {
    console.log(`🎯 Smart starting room selection: room ${(bestRoom as AutoLayoutRoom).id} (centrality: ${bestScore.toFixed(1)}, exits: ${(bestRoom as AutoLayoutRoom).exits.length})`);
    return bestRoom;
  }

  // Last resort: Fallback to first room
  const fallbackRoom = rooms[0];
  if (fallbackRoom) {
    console.log(`🎯 Fallback starting room selection: room ${fallbackRoom.id} (exits: ${fallbackRoom.exits.length})`);
    return fallbackRoom;
  }

  return null;
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
function detectOverlaps(positions: Record<number, LayoutPosition>): OverlapInfo[] {
  const positionMap = new Map<string, number[]>();

  console.log(`🔍 detectOverlaps: Checking ${Object.keys(positions).length} positions`);

  // Group rooms by 3D position (including Z-level)
  for (const [roomIdStr, pos] of Object.entries(positions)) {
    const roomId = parseInt(roomIdStr);
    const key = `${pos.x},${pos.y},${pos.z ?? 0}`;

    // Debug specific rooms
    if (roomId === 3045 || roomId === 3094) {
      console.log(`🔍 Room ${roomId} position: (${pos.x}, ${pos.y}, ${pos.z ?? 0}) key: "${key}"`);
    }

    if (!positionMap.has(key)) {
      positionMap.set(key, []);
    }
    positionMap.get(key)!.push(roomId);
  }

  // Find overlaps
  const overlaps: OverlapInfo[] = [];
  for (const [posKey, roomIds] of positionMap) {
    if (roomIds.length > 1) {
      const [x, y, z] = posKey.split(',').map(Number);
      console.log(`🔍 Found overlap at position ${posKey}: rooms ${roomIds.join(', ')}`);
      overlaps.push({
        roomIds,
        position: { x, y, z },
        count: roomIds.length
      });
    }
  }

  console.log(`🔍 detectOverlaps: Found ${overlaps.length} overlap groups`);
  return overlaps;
}

/**
 * Layout quality metrics
 */
function calculateLayoutQuality(positions: Record<number, LayoutPosition>, rooms: AutoLayoutRoom[]): number {
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

  console.log(`📊 Layout quality: avg path length: ${averagePathLength.toFixed(2)}, overlaps: ${overlapCount}, score: ${qualityScore.toFixed(2)}`);

  return qualityScore;
}

/**
 * Build bidirectional connections (add reverse connections for incoming exits)
 */
function buildBidirectionalConnections(rooms: AutoLayoutRoom[]): Map<number, AutoLayoutExit[]> {
  const connections = new Map<number, AutoLayoutExit[]>();

  // Initialize with existing exits
  for (const room of rooms) {
    connections.set(room.id, [...room.exits]);
  }

  // Add reverse connections
  for (const room of rooms) {
    for (const exit of room.exits) {
      if (exit.toRoomId === null || exit.toRoomId === undefined) continue;

      // Add reverse connection to destination room
      if (!connections.has(exit.toRoomId)) {
        connections.set(exit.toRoomId, []);
      }

      const reverseDirection = getReverseDirection(exit.direction);
      if (reverseDirection) {
        // Check if reverse connection already exists to avoid duplicates
        const destConnections = connections.get(exit.toRoomId)!;
        const hasReverse = destConnections.some(e =>
          e.toRoomId === room.id && e.direction === reverseDirection
        );

        if (!hasReverse) {
          destConnections.push({
            direction: reverseDirection,
            toRoomId: room.id
          });
        }
      }
    }
  }

  const totalOriginal = rooms.reduce((sum, room) => sum + room.exits.length, 0);
  const totalBidirectional = Array.from(connections.values()).reduce((sum, exits) => sum + exits.length, 0);
  console.log(`🔍 Built bidirectional graph: ${totalOriginal} original exits → ${totalBidirectional} total connections`);

  return connections;
}

/**
 * Get reverse direction for an exit
 */
function getReverseDirection(direction: string): string | null {
  const reverseMap: Record<string, string> = {
    // All caps versions
    'NORTH': 'SOUTH',
    'SOUTH': 'NORTH',
    'EAST': 'WEST',
    'WEST': 'EAST',
    'NORTHEAST': 'SOUTHWEST',
    'NORTHWEST': 'SOUTHEAST',
    'SOUTHEAST': 'NORTHWEST',
    'SOUTHWEST': 'NORTHEAST',
    'UP': 'DOWN',
    'DOWN': 'UP',

    // Capitalized versions
    'North': 'South',
    'South': 'North',
    'East': 'West',
    'West': 'East',
    'Northeast': 'Southwest',
    'Northwest': 'Southeast',
    'Southeast': 'Northwest',
    'Southwest': 'Northeast',
    'Up': 'Down',
    'Down': 'Up',

    // Lowercase versions
    'north': 'south',
    'south': 'north',
    'east': 'west',
    'west': 'east',
    'northeast': 'southwest',
    'northwest': 'southeast',
    'southeast': 'northwest',
    'southwest': 'northeast',
    'up': 'down',
    'down': 'up'
  };

  return reverseMap[direction] || null;
}

/**
 * Enhanced auto-layout algorithm with natural spacing and smart positioning
 */
export function autoLayoutRooms(rooms: AutoLayoutRoom[], startRoomId?: number): Record<number, LayoutPosition> {
  const positions: Record<number, LayoutPosition> = {};
  const visited = new Set<number>();
  const queue: Array<{ roomId: number; position: LayoutPosition; depth: number }> = [];

  console.log(`🔍 autoLayoutRooms called with ${rooms.length} rooms, startRoomId: ${startRoomId}`);

  // Calculate dynamic spacing based on zone size
  const spacing = calculateDynamicSpacing(rooms);

  // Build bidirectional connections
  const bidirectionalConnections = buildBidirectionalConnections(rooms);

  // Enhanced starting room selection with centrality analysis
  const startRoom = selectStartingRoom(rooms, startRoomId);

  if (!startRoom) {
    console.log('❌ No start room found, returning empty positions');
    return positions;
  }

  console.log(`🔍 Starting enhanced auto-layout from room ${startRoom.id} with ${spacing}-unit spacing`);

  // Start at origin with Z-level from existing room data
  const startZ = startRoom.layoutZ || 0;
  const startPos = { x: 0, y: 0, z: startZ };
  positions[startRoom.id] = startPos;
  visited.add(startRoom.id);
  queue.push({ roomId: startRoom.id, position: startPos, depth: 0 });

  console.log(`🔍 Initial position: room ${startRoom.id} at (${startPos.x}, ${startPos.y}, Z${startPos.z})`);

  // Enhanced BFS with natural placement logic
  while (queue.length > 0) {
    const { roomId, position, depth } = queue.shift()!;
    const connections = bidirectionalConnections.get(roomId) || [];

    console.log(`🔍 Processing room ${roomId} at (${position.x}, ${position.y}) depth ${depth} with ${connections.length} connections`);

    // Sort connections by importance for more natural placement
    const sortedConnections = connections.slice().sort((a, b) => {
      // Prioritize cardinal directions for main pathways
      const cardinalDirections = ['north', 'south', 'east', 'west', 'NORTH', 'SOUTH', 'EAST', 'WEST'];
      const aIsCardinal = cardinalDirections.includes(a.direction);
      const bIsCardinal = cardinalDirections.includes(b.direction);

      if (aIsCardinal !== bIsCardinal) {
        return bIsCardinal ? 1 : -1; // Cardinal directions first
      }

      // Then prioritize by alphabetical order for consistency
      return a.direction.localeCompare(b.direction);
    });

    // Process each connection with enhanced positioning
    for (const connection of sortedConnections) {
      console.log(`🔍 Found connection: ${connection.direction} → room ${connection.toRoomId}`);
      if (connection.toRoomId === null || connection.toRoomId === undefined || visited.has(connection.toRoomId)) continue;

      const destinationRoom = rooms.find(r => r.id === connection.toRoomId);
      if (!destinationRoom) continue;

      // Validate direction
      if (!validateDirection(connection.direction)) {
        console.warn(`⚠️ Unknown direction: ${connection.direction}, using default offset`);
      }

      // Calculate new position with dynamic spacing
      let newPosition: LayoutPosition;

      const directionUpper = connection.direction.toUpperCase();
      if (directionUpper === 'UP' || directionUpper === 'DOWN') {
        // UP/DOWN exits maintain same X/Y but change Z-level
        const zChange = directionUpper === 'UP' ? 1 : -1;
        const currentZ = position.z || 0;
        newPosition = {
          x: position.x, // Same X coordinate
          y: position.y, // Same Y coordinate
          z: currentZ + zChange, // Change Z-level
        };
        console.log(`🔍 Placing room ${connection.toRoomId} at (${newPosition.x}, ${newPosition.y}, Z${newPosition.z}) via ${connection.direction} connection (Z-level change: ${zChange > 0 ? '+' : ''}${zChange})`);
      } else {
        // Horizontal exits use dynamic spacing
        const offset = getDirectionalOffset(connection.direction, spacing);
        newPosition = {
          x: position.x + offset.x,
          y: position.y + offset.y,
          z: position.z || 0, // Maintain current Z-level
        };
        console.log(`🔍 Placing room ${connection.toRoomId} at (${newPosition.x}, ${newPosition.y}, Z${newPosition.z || 0}) via ${connection.direction} connection (offset: ${offset.x},${offset.y} with ${spacing}-unit spacing)`);
      }

      positions[connection.toRoomId] = newPosition;
      visited.add(connection.toRoomId);
      queue.push({ roomId: connection.toRoomId, position: newPosition, depth: depth + 1 });

      // Debug specific rooms
      if (connection.toRoomId === 3045 || connection.toRoomId === 3094) {
        console.log(`🎯 Placed room ${connection.toRoomId} at (${newPosition.x}, ${newPosition.y}, ${newPosition.z}) from room ${roomId} via ${connection.direction}`);
      }
    }
  }

  // Place unconnected rooms in a more organized area
  const unconnectedSpacing = Math.max(spacing, 2);
  let unconnectedX = spacing * 5; // Start further away from main layout
  let unconnectedY = 0;
  let unconnectedCount = 0;
  const maxUnconnectedPerRow = Math.max(6, Math.ceil(Math.sqrt(rooms.length - visited.size)));

  for (const room of rooms) {
    if (!visited.has(room.id)) {
      positions[room.id] = { x: unconnectedX, y: unconnectedY };
      console.log(`🔍 Placing unconnected room ${room.id} at (${unconnectedX}, ${unconnectedY})`);
      unconnectedCount++;
      unconnectedX += unconnectedSpacing;

      if (unconnectedCount % maxUnconnectedPerRow === 0) {
        unconnectedX = spacing * 5; // Reset to start of row
        unconnectedY += unconnectedSpacing;
      }
    }
  }

  console.log(`🔍 Enhanced auto-layout complete: ${Object.keys(positions).length} total positions, ${visited.size} connected, ${unconnectedCount} unconnected`);

  // Calculate and log layout quality
  calculateLayoutQuality(positions, rooms);

  return positions;
}

/**
 * Resolve overlaps by shifting rooms (disabled - overlaps are now allowed)
 */
export function resolveOverlaps(positions: Record<number, LayoutPosition>): Record<number, LayoutPosition> {
  // Return original positions without any changes - overlaps are now allowed
  console.log(`🔍 resolveOverlaps: Keeping original positions (overlaps allowed)`);
  return { ...positions };
}

/**
 * Detect one-way exits (exits without corresponding return path)
 */
export function detectOneWayExits(rooms: AutoLayoutRoom[]): Array<{
  fromRoom: number;
  toRoom: number;
  direction: string;
  isOneWay: boolean;
  reason: 'no_return_exit' | 'mismatched_direction' | 'target_not_found';
}> {
  const oneWayExits: Array<{
    fromRoom: number;
    toRoom: number;
    direction: string;
    isOneWay: boolean;
    reason: 'no_return_exit' | 'mismatched_direction' | 'target_not_found';
  }> = [];

  for (const room of rooms) {
    for (const exit of room.exits) {
      if (exit.toRoomId === null || exit.toRoomId === undefined) continue;

      const targetRoom = rooms.find(r => r.id === exit.toRoomId);
      if (!targetRoom) {
        oneWayExits.push({
          fromRoom: room.id,
          toRoom: exit.toRoomId,
          direction: exit.direction,
          isOneWay: true,
          reason: 'target_not_found'
        });
        continue;
      }

      // Check if there's a corresponding return exit
      const expectedReturnDirection = getReverseDirection(exit.direction);
      if (!expectedReturnDirection) continue;

      const hasReturnExit = targetRoom.exits.some(returnExit =>
        returnExit.toRoomId === room.id &&
        returnExit.direction.toLowerCase() === expectedReturnDirection.toLowerCase()
      );

      oneWayExits.push({
        fromRoom: room.id,
        toRoom: exit.toRoomId,
        direction: exit.direction,
        isOneWay: !hasReturnExit,
        reason: hasReturnExit ? 'no_return_exit' : 'no_return_exit'
      });
    }
  }

  const oneWayCount = oneWayExits.filter(e => e.isOneWay).length;
  const totalExits = oneWayExits.length;
  console.log(`🔍 One-way exit analysis: ${oneWayCount} one-way exits out of ${totalExits} total exits`);

  return oneWayExits;
}

// Export additional utility functions for advanced use cases
export { detectOverlaps, calculateLayoutQuality };