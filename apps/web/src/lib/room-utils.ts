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
export function hasValidDestination(
  exit: {
    toZoneId?: number | null;
    toRoomId?: number | null;
    [key: string]: any;
  }
): exit is RoomExitWithDestination {
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
