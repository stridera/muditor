import { findFreeGridSlot } from '../layoutUtils';

const room = (x: number | null, y: number | null, z: number | null = 0) => ({
  layoutX: x,
  layoutY: y,
  layoutZ: z,
});

describe('findFreeGridSlot', () => {
  it('uses the origin for an empty zone', () => {
    expect(findFreeGridSlot([], null, 0)).toEqual({ x: 0, y: 0 });
  });

  it('skips the origin when rooms without a layout sit there (Room 1 case)', () => {
    const slot = findFreeGridSlot([room(null, null)], null, 0);
    expect(slot).not.toEqual({ x: 0, y: 0 });
  });

  it('places the room east of the selected room when free', () => {
    expect(findFreeGridSlot([room(2, 3)], { x: 2, y: 3 }, 0)).toEqual({
      x: 3,
      y: 3,
    });
  });

  it('falls through to the next neighbour when east is taken', () => {
    const rooms = [room(0, 0), room(1, 0)];
    expect(findFreeGridSlot(rooms, { x: 0, y: 0 }, 0)).toEqual({
      x: -1,
      y: 0,
    });
  });

  it('spirals outward when every neighbour is taken', () => {
    const rooms = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) rooms.push(room(x, y));
    }
    const slot = findFreeGridSlot(rooms, { x: 0, y: 0 }, 0);
    expect(Math.max(Math.abs(slot.x), Math.abs(slot.y))).toBe(2);
  });

  it('only considers rooms on the same floor', () => {
    expect(findFreeGridSlot([room(1, 0, 1)], { x: 0, y: 0 }, 0)).toEqual({
      x: 1,
      y: 0,
    });
  });

  it('never returns an occupied cell', () => {
    const rooms = [
      room(0, 0),
      room(1, 0),
      room(-1, 0),
      room(0, 1),
      room(0, -1),
    ];
    const slot = findFreeGridSlot(rooms, { x: 0, y: 0 }, 0);
    expect(rooms.some(r => r.layoutX === slot.x && r.layoutY === slot.y)).toBe(
      false
    );
  });
});
