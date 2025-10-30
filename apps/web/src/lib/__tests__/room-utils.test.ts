/**
 * Tests for room utility functions
 */

import {
  isValidRoomId,
  isValidZoneId,
  hasValidDestination,
  isCrossZoneExit,
  getExitDestinationZone,
} from '../room-utils';

describe('room-utils', () => {
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
      expect(
        hasValidDestination({ toZoneId: 0, toRoomId: 0 })
      ).toBe(true);
      expect(
        hasValidDestination({ toZoneId: 30, toRoomId: 45 })
      ).toBe(true);
      expect(
        hasValidDestination({ toZoneId: 0, toRoomId: 1 })
      ).toBe(true);
    });

    it('should return false for exits with null or undefined destinations', () => {
      expect(
        hasValidDestination({ toZoneId: null, toRoomId: 0 })
      ).toBe(false);
      expect(
        hasValidDestination({ toZoneId: 0, toRoomId: null })
      ).toBe(false);
      expect(
        hasValidDestination({ toZoneId: undefined, toRoomId: undefined })
      ).toBe(false);
    });
  });

  describe('isCrossZoneExit', () => {
    it('should return true for cross-zone exits', () => {
      expect(
        isCrossZoneExit({ toZoneId: 30, toRoomId: 0 }, 1)
      ).toBe(true);
      expect(
        isCrossZoneExit({ toZoneId: 1, toRoomId: 45 }, 30)
      ).toBe(true);
    });

    it('should return false for same-zone exits', () => {
      expect(
        isCrossZoneExit({ toZoneId: 30, toRoomId: 45 }, 30)
      ).toBe(false);
      expect(
        isCrossZoneExit({ toZoneId: 0, toRoomId: 0 }, 0)
      ).toBe(false);
    });

    it('should return false for exits with invalid destinations', () => {
      expect(
        isCrossZoneExit({ toZoneId: null, toRoomId: 45 }, 30)
      ).toBe(false);
      expect(
        isCrossZoneExit({ toZoneId: 30, toRoomId: null }, 30)
      ).toBe(false);
    });
  });

  describe('getExitDestinationZone', () => {
    it('should return toZoneId when present', () => {
      expect(
        getExitDestinationZone({ toZoneId: 30 }, 1)
      ).toBe(30);
      expect(
        getExitDestinationZone({ toZoneId: 0 }, 1)
      ).toBe(0);
    });

    it('should return currentZoneId when toZoneId is null or undefined', () => {
      expect(
        getExitDestinationZone({ toZoneId: null }, 30)
      ).toBe(30);
      expect(
        getExitDestinationZone({ toZoneId: undefined }, 1)
      ).toBe(1);
      expect(
        getExitDestinationZone({}, 0)
      ).toBe(0);
    });
  });
});
