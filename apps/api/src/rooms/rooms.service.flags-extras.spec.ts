import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Sector } from '@muditor/db';
import { mapRoom } from '../common/mappers';
import { RoomsResolver } from './rooms.resolver';
import { RoomsService } from './rooms.service';

function makeDb() {
  const tx = {
    roomExtraDescriptions: {
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      createMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
  };
  return {
    tx,
    room: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (fn: (t: typeof tx) => Promise<void>) =>
      fn(tx)
    ),
  };
}

const roomRow = (over: Record<string, unknown> = {}) => ({
  id: 4,
  zoneId: 30,
  name: 'Hall',
  roomDescription: 'A hall.',
  sector: Sector.STRUCTURE,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  roomExtraDescriptions: [],
  exits: [],
  environmentalEffects: [],
  ...over,
});

describe('room flags', () => {
  let db: ReturnType<typeof makeDb>;
  let service: RoomsService;
  beforeEach(() => {
    db = makeDb();
    service = new RoomsService(db as never);
  });

  it('update writes only the flags that were sent', async () => {
    db.room.update.mockResolvedValue(roomRow({ isIndoors: true }));
    await service.update(30, 4, {
      isIndoors: true,
      allowsScanning: false,
      isInn: true,
      innName: 'The Rusty Boar',
    });
    expect(db.room.update.mock.calls[0]![0].data).toEqual({
      isIndoors: true,
      allowsScanning: false,
      isInn: true,
      innName: 'The Rusty Boar',
    });
  });

  it('update can clear the inn name', async () => {
    db.room.update.mockResolvedValue(roomRow());
    await service.update(30, 4, { isInn: false, innName: null as never });
    expect(db.room.update.mock.calls[0]![0].data).toEqual({
      isInn: false,
      innName: null,
    });
  });

  it('create defaults the flags the way the schema does', async () => {
    db.room.create.mockResolvedValue(roomRow());
    await service.create({ id: 4, zoneId: 30, name: 'Hall', description: 'x' });
    expect(db.room.create.mock.calls[0]![0].data).toMatchObject({
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

  it('the GraphQL room carries every flag, with defaults for rows that lack them', async () => {
    db.room.update.mockResolvedValue(
      roomRow({ isArena: true, allowsMobs: false, isInn: true, innName: 'Inn' })
    );
    const updated = await service.update(30, 4, { isArena: true });
    const dto = mapRoom(updated as never);
    expect(dto).toMatchObject({
      isIndoors: false,
      isSoundproof: false,
      isArena: true,
      isGuildhall: false,
      allowsMobs: false,
      allowsTracking: true,
      allowsPortals: true,
      allowsScanning: true,
      isInn: true,
      innName: 'Inn',
    });
  });
});

describe('room extra descriptions', () => {
  let db: ReturnType<typeof makeDb>;
  let service: RoomsService;
  beforeEach(() => {
    db = makeDb();
    service = new RoomsService(db as never);
  });

  it('replaces the whole list in one transaction, trimming and lower-casing keywords', async () => {
    db.room.findUnique.mockResolvedValueOnce({ id: 4 }).mockResolvedValueOnce(
      roomRow({
        roomExtraDescriptions: [
          { id: 1, keywords: ['mural', 'painting'], description: 'Faded.' },
        ],
      })
    );
    const result = await service.replaceExtraDescriptions(30, 4, [
      { keywords: [' Mural ', 'painting', ''], description: 'Faded.' },
      { keywords: ['Altar'], description: 'Stone.' },
    ]);
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.tx.roomExtraDescriptions.deleteMany).toHaveBeenCalledWith({
      where: { roomZoneId: 30, roomId: 4 },
    });
    expect(db.tx.roomExtraDescriptions.createMany).toHaveBeenCalledWith({
      data: [
        {
          roomZoneId: 30,
          roomId: 4,
          keywords: ['mural', 'painting'],
          description: 'Faded.',
        },
        {
          roomZoneId: 30,
          roomId: 4,
          keywords: ['altar'],
          description: 'Stone.',
        },
      ],
    });
    expect(result.extraDescs).toEqual([
      { id: 1, keywords: ['mural', 'painting'], description: 'Faded.' },
    ]);
  });

  it('an empty list clears them all', async () => {
    db.room.findUnique
      .mockResolvedValueOnce({ id: 4 })
      .mockResolvedValueOnce(roomRow());
    await service.replaceExtraDescriptions(30, 4, []);
    expect(db.tx.roomExtraDescriptions.deleteMany).toHaveBeenCalled();
    expect(db.tx.roomExtraDescriptions.createMany).not.toHaveBeenCalled();
  });

  it('rejects an entry without keywords or text, before writing anything', async () => {
    await expect(
      service.replaceExtraDescriptions(30, 4, [
        { keywords: ['  '], description: 'x' },
      ])
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.replaceExtraDescriptions(30, 4, [
        { keywords: ['mural'], description: '   ' },
      ])
    ).rejects.toThrow(/has no text/);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('404s for a room that does not exist', async () => {
    db.room.findUnique.mockResolvedValue(null);
    await expect(service.replaceExtraDescriptions(30, 99, [])).rejects.toThrow(
      NotFoundException
    );
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('the resolver passes zone and room straight through and returns the mapped room', async () => {
    const roomsService = {
      replaceExtraDescriptions: jest.fn().mockResolvedValue({
        id: 4,
        zoneId: 30,
        name: 'Hall',
        description: 'A hall.',
        roomDescription: 'A hall.',
        sector: Sector.STRUCTURE,
        exits: [],
        extraDescs: [{ id: 9, keywords: ['mural'], description: 'Faded.' }],
        environmentalEffects: [],
        createdAt: new Date(0),
        updatedAt: new Date(0),
      }),
    };
    const resolver = new RoomsResolver(roomsService as never, {} as never);
    const dto = await resolver.updateRoomExtraDescriptions(30, 4, [
      { keywords: ['mural'], description: 'Faded.' },
    ]);
    expect(roomsService.replaceExtraDescriptions).toHaveBeenCalledWith(30, 4, [
      { keywords: ['mural'], description: 'Faded.' },
    ]);
    expect(dto.extraDescs).toEqual([
      { id: '9', keywords: ['mural'], description: 'Faded.' },
    ]);
  });
});

describe('replaceExtraDescriptions limits', () => {
  const svc = () =>
    new RoomsService({ room: { findUnique: jest.fn() } } as never);

  it('rejects more than 100 extra descriptions', async () => {
    const many = Array.from({ length: 101 }, () => ({
      keywords: ['a'],
      description: 'x',
    }));
    await expect(svc().replaceExtraDescriptions(30, 4, many)).rejects.toThrow(
      /at most 100/
    );
  });

  it('rejects overlong keywords and text', async () => {
    await expect(
      svc().replaceExtraDescriptions(30, 4, [
        { keywords: ['k'.repeat(201)], description: 'x' },
      ])
    ).rejects.toThrow(/overlong keywords/);
    await expect(
      svc().replaceExtraDescriptions(30, 4, [
        { keywords: ['k'], description: 'x'.repeat(8001) },
      ])
    ).rejects.toThrow(/over 8000/);
  });
});
