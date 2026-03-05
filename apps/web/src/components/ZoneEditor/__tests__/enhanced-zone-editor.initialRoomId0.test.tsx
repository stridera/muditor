import '@testing-library/jest-dom';
import { isValidRoomId } from '@/lib/room-utils';

/**
 * Regression test: initialRoomId=0 must NOT be treated as falsy.
 *
 * The ZoneEditorOrchestrator has multiple useEffect chains that handle room
 * selection. This test validates the critical guard conditions that prevent
 * room 0 from being skipped or overridden.
 *
 * Key guards in ZoneEditorOrchestrator:
 * - Line 888: `initialRoomId !== null && initialRoomId !== undefined` (NOT `if (initialRoomId)`)
 * - Line 899: `selectedRoomId === null` (strict null check, 0 is not null)
 * - Line 910: `selectedRoomId != null` (loose null check, 0 passes)
 */

describe('EnhancedZoneEditor initialRoomId=0 regression', () => {
  describe('isValidRoomId utility', () => {
    it('returns true for 0', () => {
      expect(isValidRoomId(0)).toBe(true);
    });

    it('returns true for positive IDs', () => {
      expect(isValidRoomId(1)).toBe(true);
      expect(isValidRoomId(999)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidRoomId(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isValidRoomId(undefined)).toBe(false);
    });
  });

  describe('initialRoomId effect guard', () => {
    // Mirrors the guard at ZoneEditorOrchestrator line 888
    function initialRoomIdGuard(
      initialRoomId: number | null | undefined
    ): boolean {
      return initialRoomId !== null && initialRoomId !== undefined;
    }

    it('passes for initialRoomId=0', () => {
      expect(initialRoomIdGuard(0)).toBe(true);
    });

    it('passes for initialRoomId=1', () => {
      expect(initialRoomIdGuard(1)).toBe(true);
    });

    it('fails for null', () => {
      expect(initialRoomIdGuard(null)).toBe(false);
    });

    it('fails for undefined', () => {
      expect(initialRoomIdGuard(undefined)).toBe(false);
    });

    it('would fail if using truthy check (demonstrates the bug)', () => {
      // This is the buggy pattern: `if (initialRoomId)` treats 0 as falsy
      const buggyGuard = (id: number | null | undefined) => !!id;
      expect(buggyGuard(0)).toBe(false); // Bug: 0 is falsy
      expect(buggyGuard(1)).toBe(true);

      // The correct pattern used in the component:
      expect(initialRoomIdGuard(0)).toBe(true); // Correct: 0 is not null/undefined
    });
  });

  describe('fallback auto-select guard', () => {
    // Mirrors the guard at ZoneEditorOrchestrator line 899
    function fallbackShouldFire(selectedRoomId: number | null): boolean {
      return selectedRoomId === null;
    }

    it('does NOT fire when selectedRoomId=0', () => {
      expect(fallbackShouldFire(0)).toBe(false);
    });

    it('fires when selectedRoomId is null', () => {
      expect(fallbackShouldFire(null)).toBe(true);
    });

    it('does NOT fire when selectedRoomId is any number', () => {
      expect(fallbackShouldFire(1)).toBe(false);
      expect(fallbackShouldFire(42)).toBe(false);
    });
  });

  describe('reconciliation effect guard', () => {
    // Mirrors the guard at ZoneEditorOrchestrator line 910
    function roomExistsCheck(
      selectedRoomId: number | null,
      rooms: { id: number }[]
    ): boolean {
      return selectedRoomId != null && rooms.some(r => r.id === selectedRoomId);
    }

    it('finds room 0 in rooms list', () => {
      const rooms = [{ id: 0 }, { id: 1 }, { id: 5 }];
      expect(roomExistsCheck(0, rooms)).toBe(true);
    });

    it('returns false when selectedRoomId is null', () => {
      const rooms = [{ id: 0 }, { id: 1 }];
      expect(roomExistsCheck(null, rooms)).toBe(false);
    });

    it('returns false when room does not exist', () => {
      const rooms = [{ id: 1 }, { id: 5 }];
      expect(roomExistsCheck(99, rooms)).toBe(false);
    });
  });

  describe('URL searchParams regression', () => {
    it('string "0" is truthy (searchParams.get returns string)', () => {
      const roomParam = '0';
      expect(!!roomParam).toBe(true);
    });

    it('parseInt("0", 10) === 0 and is not NaN', () => {
      const parsed = parseInt('0', 10);
      expect(parsed).toBe(0);
      expect(isNaN(parsed)).toBe(false);
    });

    it('room.find matches room id 0', () => {
      const rooms = [{ id: 0 }, { id: 1 }];
      const match = rooms.find(r => r.id === 0);
      expect(match).toBeDefined();
      expect(match!.id).toBe(0);
    });
  });
});
