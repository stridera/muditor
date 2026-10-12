import {
  collectRoomFlagEdits,
  EXTRA_ROOM_FLAGS,
  pickRoomFlags,
} from '../room-flags';

describe('room flags', () => {
  it('fills the schema defaults for a room that has none of them', () => {
    expect(pickRoomFlags({})).toEqual({
      isIndoors: false,
      isSoundproof: false,
      isArena: false,
      isGuildhall: false,
      allowsMobs: true,
      allowsTracking: true,
      allowsPortals: true,
      allowsScanning: true,
      isInn: false,
      innName: null,
    });
  });

  it('keeps what the room has', () => {
    expect(
      pickRoomFlags({ isArena: true, allowsMobs: false, innName: 'The Boar' })
    ).toMatchObject({ isArena: true, allowsMobs: false, innName: 'The Boar' });
  });

  it('lists every flag once with the same default as pickRoomFlags', () => {
    const defaults = pickRoomFlags({});
    expect(new Set(EXTRA_ROOM_FLAGS.map(f => f.field)).size).toBe(
      EXTRA_ROOM_FLAGS.length
    );
    for (const f of EXTRA_ROOM_FLAGS) {
      expect(defaults[f.field]).toBe(f.defaultVal);
    }
  });

  it('collects only the flags that were edited, including a cleared inn name', () => {
    expect(collectRoomFlagEdits({})).toEqual({});
    expect(
      collectRoomFlagEdits({
        isIndoors: true,
        allowsScanning: false,
        innName: null,
      })
    ).toEqual({ isIndoors: true, allowsScanning: false, innName: null });
  });
});
