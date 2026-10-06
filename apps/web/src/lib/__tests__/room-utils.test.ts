/**
 * Tests for room utility functions
 */

import {
  getExitDestinationZone,
  hasValidDestination,
  isCrossZoneExit,
  isValidRoomId,
  isValidZoneId,
  nextFreeRoomId,
  validateNewRoomId,
} from '../room-utils';

describe('room-utils', () => {
  describe('nextFreeRoomId', () => {
    it('returns 0 for an empty zone', () => {
      expect(nextFreeRoomId([])).toBe(0);
    });

    it('returns one past the highest id, not the first gap', () => {
      expect(nextFreeRoomId([0, 1, 2])).toBe(3);
      expect(nextFreeRoomId([1, 5, 3])).toBe(6);
      expect(nextFreeRoomId(new Set([0]))).toBe(1);
    });
  });

  describe('validateNewRoomId', () => {
    it('accepts 0 and unused ids', () => {
      expect(validateNewRoomId(0, [1, 2])).toBeNull();
      expect(validateNewRoomId(7, [1, 2])).toBeNull();
    });

    it('rejects used, negative, fractional and missing ids', () => {
      expect(validateNewRoomId(2, [1, 2])).toMatch(/already exists/);
      expect(validateNewRoomId(0, [0])).toMatch(/already exists/);
      expect(validateNewRoomId(-1, [])).toMatch(/0 or greater/);
      expect(validateNewRoomId(2147483647, [])).toBeNull();
      expect(validateNewRoomId(2147483648, [])).toMatch(/2147483647 or less/);
      expect(validateNewRoomId(1.5, [])).toMatch(/whole number/);
      expect(validateNewRoomId(null, [])).toMatch(/whole number/);
      expect(validateNewRoomId(NaN, [])).toMatch(/whole number/);
    });
  });

  describe('isValidRoomId', () => {
    it('should return true for valid room IDs including 0', () => {
      expect(isValidRoomId(0)).toBe(true);
      expect(isValidRoomId(1)).toBe(true);
      expect(isValidRoomId(3045)).toBe(true);
    });

    it('should return false for null and undefined', () => {
      expect(isValidRoomId(null)).toBe(false);
      expect(isValidRoomId(undefined)).toBe(false);
    });
  });

  describe('isValidZoneId', () => {
    it('should return true for valid zone IDs including 0', () => {
      expect(isValidZoneId(0)).toBe(true);
      expect(isValidZoneId(1)).toBe(true);
      expect(isValidZoneId(30)).toBe(true);
    });

    it('should return false for null and undefined', () => {
      expect(isValidZoneId(null)).toBe(false);
      expect(isValidZoneId(undefined)).toBe(false);
    });
  });

  describe('hasValidDestination', () => {
    it('should return true for exits with valid destinations including 0', () => {
      expect(hasValidDestination({ toZoneId: 0, toRoomId: 0 })).toBe(true);
      expect(hasValidDestination({ toZoneId: 30, toRoomId: 45 })).toBe(true);
      expect(hasValidDestination({ toZoneId: 0, toRoomId: 1 })).toBe(true);
    });

    it('should return false for exits with null or undefined destinations', () => {
      expect(hasValidDestination({ toZoneId: null, toRoomId: 0 })).toBe(false);
      expect(hasValidDestination({ toZoneId: 0, toRoomId: null })).toBe(false);
      expect(hasValidDestination({ toZoneId: null, toRoomId: null })).toBe(
        false
      );
    });
  });

  describe('isCrossZoneExit', () => {
    it('should return true for cross-zone exits', () => {
      expect(isCrossZoneExit({ toZoneId: 30, toRoomId: 0 }, 1)).toBe(true);
      expect(isCrossZoneExit({ toZoneId: 1, toRoomId: 45 }, 30)).toBe(true);
    });

    it('should return false for same-zone exits', () => {
      expect(isCrossZoneExit({ toZoneId: 30, toRoomId: 45 }, 30)).toBe(false);
      expect(isCrossZoneExit({ toZoneId: 0, toRoomId: 0 }, 0)).toBe(false);
    });

    it('should return false for exits with invalid destinations', () => {
      expect(isCrossZoneExit({ toZoneId: null, toRoomId: 45 }, 30)).toBe(false);
      expect(isCrossZoneExit({ toZoneId: 30, toRoomId: null }, 30)).toBe(false);
    });
  });

  describe('getExitDestinationZone', () => {
    it('should return toZoneId when present', () => {
      expect(getExitDestinationZone({ toZoneId: 30 }, 1)).toBe(30);
      expect(getExitDestinationZone({ toZoneId: 0 }, 1)).toBe(0);
    });

    it('should return currentZoneId when toZoneId is null or undefined', () => {
      expect(getExitDestinationZone({ toZoneId: null }, 30)).toBe(30);
      expect(getExitDestinationZone({ toZoneId: null }, 1)).toBe(1);
      expect(getExitDestinationZone({}, 0)).toBe(0);
    });
  });
});
