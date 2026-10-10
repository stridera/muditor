import {
  buildUpdateRoomExitInput,
  updateExitInPlace,
  type ExitLike,
} from '../exit-update';

interface TestRoom {
  id: number;
  zoneId: number;
  exits: ExitLike[];
}

const lockedDoor: ExitLike = {
  id: '7',
  direction: 'NORTH',
  toZoneId: 30,
  toRoomId: 2,
  description: 'A heavy door.',
  keywords: ['door'],
  flags: ['PICKPROOF', 'DOOR'],
  defaultState: 'LOCKED',
  hitPoints: 40,
  keyZoneId: 30,
  keyId: 5,
};

const room = { id: 1, zoneId: 30 };

describe('buildUpdateRoomExitInput', () => {
  it('sends every field so nothing is reset to a server default', () => {
    const input = buildUpdateRoomExitInput(room, lockedDoor, {
      description: 'New text',
    });
    expect(input).toEqual({
      roomZoneId: 30,
      roomId: 1,
      direction: 'NORTH',
      toZoneId: 30,
      toRoomId: 2,
      description: 'New text',
      keywords: ['door'],
      flags: ['PICKPROOF', 'DOOR'],
      keyZoneId: 30,
      keyId: 5,
      defaultState: 'LOCKED',
      hitPoints: 40,
    });
  });

  it('lets a key be cleared with null instead of falling back to the old value', () => {
    const input = buildUpdateRoomExitInput(room, lockedDoor, {
      keyZoneId: null,
      keyId: null,
      description: '',
      flags: [],
    });
    expect(input.keyZoneId).toBeNull();
    expect(input.keyId).toBeNull();
    expect(input.description).toBeNull();
    expect(input.flags).toEqual([]);
    expect(input.defaultState).toBe('LOCKED');
  });
});

describe('updateExitInPlace', () => {
  const setup = () => {
    let rooms: TestRoom[] = [{ ...room, exits: [lockedDoor] }];
    const setRooms = (fn: (rs: TestRoom[]) => TestRoom[]) => {
      rooms = fn(rooms);
    };
    return { get: () => rooms, setRooms };
  };

  it('replaces the exit with the server row and keeps lock state', async () => {
    const state = setup();
    const send = jest.fn().mockResolvedValue({
      ok: true,
      json: {
        data: {
          updateRoomExit: {
            ...lockedDoor,
            description: 'New text',
          },
        },
      },
    });
    const result = await updateExitInPlace<ExitLike, TestRoom>({
      room,
      existing: lockedDoor,
      patch: { description: 'New text' },
      setRooms: state.setRooms,
      send,
    });
    expect(result.ok).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);
    const exit = state.get()[0]!.exits[0]!;
    expect(exit.id).toBe('7');
    expect(exit.defaultState).toBe('LOCKED');
    expect(exit.flags).toEqual(['PICKPROOF', 'DOOR']);
    expect(exit.description).toBe('New text');
  });

  it('rolls the optimistic edit back to the original exit when the update fails', async () => {
    const state = setup();
    const seen: string[] = [];
    const result = await updateExitInPlace<ExitLike, TestRoom>({
      room,
      existing: lockedDoor,
      patch: { description: 'Changed' },
      setRooms: fn => {
        state.setRooms(fn);
        seen.push(state.get()[0]!.exits[0]!.description ?? '');
      },
      send: async () => ({
        ok: true,
        json: { errors: [{ message: 'No NORTH exit in room 30:1' }] },
      }),
    });
    expect(result).toEqual({ ok: false, error: 'No NORTH exit in room 30:1' });
    expect(seen).toEqual(['Changed', 'A heavy door.']);
    expect(state.get()[0]!.exits).toEqual([lockedDoor]);
  });

  it('rolls back when the network throws', async () => {
    const state = setup();
    const result = await updateExitInPlace<ExitLike, TestRoom>({
      room,
      existing: lockedDoor,
      patch: { flags: [] },
      setRooms: state.setRooms,
      send: async () => {
        throw new Error('offline');
      },
    });
    expect(result).toEqual({ ok: false, error: 'offline' });
    expect(state.get()[0]!.exits).toEqual([lockedDoor]);
  });
});
