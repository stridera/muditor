/**
 * Room-related utility functions and type guards
 * Centralizes common room ID and exit validation logic
 */

/**
 * Type guard to check if a room ID is valid (not null or undefined)
 * Allows 0 as a valid room ID
 */
export function isValidRoomId(id: number | null | undefined): id is number {
  return id != null;
}

/**
 * Type guard to check if a zone ID is valid (not null or undefined)
 * Allows 0 as a valid zone ID
 */
export function isValidZoneId(id: number | null | undefined): id is number {
  return id != null;
}

/** Largest room id the database (32-bit integer column) can store. */
export const MAX_ROOM_ID = 2147483647;

/**
 * Next free room id in a zone: one past the highest id in use (0 for an empty
 * zone). Never reuses gaps, so ids of deleted rooms are not recycled.
 */
export function nextFreeRoomId(usedIds: Iterable<number>): number {
  let max = -1;
  for (const id of usedIds) {
    if (id > max) max = id;
  }
  return max + 1;
}

/**
 * Validate a candidate room id against the ids already used in its zone.
 * Returns an error message, or null when the id is usable. 0 is valid.
 */
export function validateNewRoomId(
  id: number | null | undefined,
  usedIds: Iterable<number>
): string | null {
  if (!isValidRoomId(id) || !Number.isInteger(id)) {
    return 'Room id must be a whole number';
  }
  if (id < 0) return 'Room id must be 0 or greater';
  if (id > MAX_ROOM_ID) {
    return `Room id must be ${MAX_ROOM_ID} or less`;
  }
  for (const used of usedIds) {
    if (used === id) return `Room ${id} already exists in this zone`;
  }
  return null;
}

/**
 * Type definition for a RoomExit with validated destination
 */
export interface RoomExitWithDestination {
  id: string;
  direction: string;
  toZoneId: number;
  toRoomId: number;
  description?: string;
  keyword?: string;
  key?: string;
}

/**
 * Type guard to check if an exit has a valid destination
 * Validates both toZoneId and toRoomId are present
 * Allows 0 for both zone and room IDs
 */
export function hasValidDestination(exit: {
  toZoneId?: number | null;
  toRoomId?: number | null;
  [key: string]: any;
}): exit is RoomExitWithDestination {
  return isValidZoneId(exit.toZoneId) && isValidRoomId(exit.toRoomId);
}

/**
 * Checks if an exit leads to a different zone
 * Requires the current zone ID for comparison
 */
export function isCrossZoneExit(
  exit: {
    toZoneId?: number | null;
    toRoomId?: number | null;
    [key: string]: any;
  },
  currentZoneId: number
): boolean {
  if (!hasValidDestination(exit)) {
    return false;
  }
  return exit.toZoneId !== currentZoneId;
}

/**
 * Gets the destination zone ID from an exit, defaulting to the current zone
 */
export function getExitDestinationZone(
  exit: {
    toZoneId?: number | null;
    [key: string]: any;
  },
  currentZoneId: number
): number {
  return exit.toZoneId ?? currentZoneId;
}
