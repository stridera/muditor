import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ObjectType } from '@muditor/db';
import { ObjectResetService } from './object-reset.service';

type Mock = jest.Mock;

function makeDb() {
  return {
    objectResets: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    objectResetContents: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
}

const obj = (id: number, type: ObjectType, name = `obj${id}`) => ({
  id,
  zoneId: 30,
  name,
  type,
});

function resetRow(over: Record<string, unknown> = {}) {
  return {
    id: 7,
    zoneId: 30,
    objectZoneId: 30,
    objectId: 5,
    roomZoneId: 30,
    roomId: 100,
    maxInstances: 2,
    probability: 0.5,
    comment: null,
    resetBehavior: 'PERSISTENT',
    objects: obj(5, ObjectType.CONTAINER, 'a chest'),
    rooms: { id: 100, zoneId: 30, name: 'Vault' },
    contents: [],
    ...over,
  };
}

describe('ObjectResetService', () => {
  let db: ReturnType<typeof makeDb>;
  let service: ObjectResetService;

  beforeEach(() => {
    db = makeDb();
    service = new ObjectResetService(db as never);
  });

  it('maps a reset with its room and nested contents', async () => {
    db.objectResets.findMany.mockResolvedValue([
      resetRow({
        contents: [
          {
            id: 1,
            resetId: 7,
            parentContentId: null,
            objectZoneId: 30,
            objectId: 6,
            quantity: 3,
            maxInstances: 9,
            comment: 'coins',
            objects: obj(6, ObjectType.CONTAINER, 'a pouch'),
          },
          {
            id: 2,
            resetId: 7,
            parentContentId: 1,
            objectZoneId: 30,
            objectId: 8,
            quantity: 1,
            maxInstances: 1,
            comment: null,
            objects: obj(8, ObjectType.TREASURE, 'a gem'),
          },
        ],
      }),
    ]);

    const [dto] = await service.findByRoom(30, 100);
    expect(dto).toMatchObject({
      id: 7,
      zoneId: 30,
      objectZoneId: 30,
      objectId: 5,
      roomZoneId: 30,
      roomId: 100,
      maxInstances: 2,
      probability: 0.5,
      object: { name: 'a chest', type: 'CONTAINER' },
      room: { name: 'Vault' },
    });
    expect(dto!.contents).toHaveLength(2);
    expect(dto!.contents[0]).toMatchObject({
      id: 1,
      quantity: 3,
      maxInstances: 9,
      comment: 'coins',
    });
    expect(dto!.contents[0]).not.toHaveProperty('parentContentId');
    expect(dto!.contents[1]).toMatchObject({ id: 2, parentContentId: 1 });
  });

  it('hides resets that touch a god zone from public readers', async () => {
    db.objectResets.findMany.mockResolvedValue([]);
    await service.findByZone(30, true);
    const { where } = db.objectResets.findMany.mock.calls[0]![0];
    expect(where).toMatchObject({
      rooms: { zones: { isGodZone: false } },
      objects: { zones: { isGodZone: false } },
    });
    await service.findByZone(30, false);
    expect(db.objectResets.findMany.mock.calls[1]![0].where).toEqual({
      zoneId: 30,
    });
  });

  it('create stores the object zone and room zone separately (object may come from another zone)', async () => {
    db.objectResets.create.mockResolvedValue(
      resetRow({ objectZoneId: 12, objectId: 4 })
    );
    await service.create({
      zoneId: 30,
      objectZoneId: 12,
      objectId: 4,
      roomZoneId: 30,
      roomId: 100,
      maxInstances: 3,
      probability: 0.25,
      comment: 'near the door',
    });
    expect(db.objectResets.create.mock.calls[0]![0].data).toEqual({
      maxInstances: 3,
      probability: 0.25,
      comment: 'near the door',
      objectZoneId: 12,
      objectId: 4,
      roomZoneId: 30,
      roomId: 100,
      zoneId: 30,
    });
  });

  it('create turns a foreign-key failure into a readable 400', async () => {
    db.objectResets.create.mockRejectedValue(
      Object.assign(new Error('fk'), { code: 'P2003' })
    );
    await expect(
      service.create({
        zoneId: 30,
        objectZoneId: 30,
        objectId: 99999,
        roomZoneId: 30,
        roomId: 1,
      })
    ).rejects.toThrow(/does not exist/);
  });

  it('update only writes the given fields and needs both room keys to move', async () => {
    db.objectResets.update.mockResolvedValue({});
    db.objectResets.findFirst.mockResolvedValue(resetRow());
    await service.update(7, { maxInstances: 4, comment: 'x' });
    expect(db.objectResets.update.mock.calls[0]![0]).toEqual({
      where: { id: 7 },
      data: { maxInstances: { set: 4 }, comment: { set: 'x' } },
    });
    await expect(service.update(7, { roomId: 3 })).rejects.toThrow(
      BadRequestException
    );
    await service.update(7, { roomZoneId: 30, roomId: 3 });
    expect(db.objectResets.update.mock.calls[1]![0].data).toEqual({
      roomZoneId: { set: 30 },
      roomId: { set: 3 },
    });
  });

  it('delete reports false when the row is gone', async () => {
    db.objectResets.delete.mockResolvedValueOnce({});
    expect(await service.delete(7)).toBe(true);
    db.objectResets.delete.mockRejectedValueOnce(new Error('missing'));
    expect(await service.delete(7)).toBe(false);
  });

  describe('addContent', () => {
    it('puts an item directly inside a container reset', async () => {
      db.objectResets.findUnique.mockResolvedValue({
        id: 7,
        objects: obj(5, ObjectType.CONTAINER, 'a chest'),
      });
      db.objectResetContents.create.mockResolvedValue({});
      db.objectResets.findFirst.mockResolvedValue(resetRow());

      await service.addContent(7, {
        objectZoneId: 30,
        objectId: 6,
        quantity: 2,
        maxInstances: 4,
      });
      expect(db.objectResetContents.create.mock.calls[0]![0].data).toEqual({
        resetId: 7,
        parentContentId: null,
        objectZoneId: 30,
        objectId: 6,
        quantity: 2,
        maxInstances: 4,
        comment: null,
      });
    });

    it('rejects an item inside something that is not a container', async () => {
      db.objectResets.findUnique.mockResolvedValue({
        id: 7,
        objects: obj(5, ObjectType.WEAPON, 'a sword'),
      });
      await expect(
        service.addContent(7, { objectZoneId: 30, objectId: 6 })
      ).rejects.toThrow(/not a container/);
      expect(db.objectResetContents.create).not.toHaveBeenCalled();
    });

    it('nests inside another content row of the same reset, and only a container', async () => {
      db.objectResets.findUnique.mockResolvedValue({
        id: 7,
        objects: obj(5, ObjectType.CONTAINER),
      });
      db.objectResets.findFirst.mockResolvedValue(resetRow());
      db.objectResetContents.create.mockResolvedValue({});

      db.objectResetContents.findFirst.mockResolvedValueOnce({
        id: 1,
        parentContentId: null,
        objects: obj(6, ObjectType.CONTAINER, 'a pouch'),
      });
      await service.addContent(7, {
        objectZoneId: 30,
        objectId: 8,
        parentContentId: 1,
      });
      expect(db.objectResetContents.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 1, resetId: 7 } })
      );
      expect(
        db.objectResetContents.create.mock.calls[0]![0].data.parentContentId
      ).toBe(1);

      db.objectResetContents.findFirst.mockResolvedValueOnce({
        id: 2,
        parentContentId: 1,
        objects: obj(8, ObjectType.TREASURE, 'a gem'),
      });
      await expect(
        service.addContent(7, {
          objectZoneId: 30,
          objectId: 9,
          parentContentId: 2,
        })
      ).rejects.toThrow(/not a container/);
    });

    it('refuses a parent row that belongs to another reset', async () => {
      db.objectResets.findUnique.mockResolvedValue({
        id: 7,
        objects: obj(5, ObjectType.CONTAINER),
      });
      db.objectResetContents.findFirst.mockResolvedValue(null);
      await expect(
        service.addContent(7, {
          objectZoneId: 30,
          objectId: 8,
          parentContentId: 555,
        })
      ).rejects.toThrow(/does not belong to this container/);
    });

    it('404s for an unknown reset', async () => {
      db.objectResets.findUnique.mockResolvedValue(null);
      await expect(
        service.addContent(7, { objectZoneId: 30, objectId: 6 })
      ).rejects.toThrow(NotFoundException);
    });
  });

  it('updateContent and deleteContent write only what they are given', async () => {
    db.objectResetContents.update.mockResolvedValue({});
    expect(await service.updateContent(3, { quantity: 5 })).toBe(true);
    expect(db.objectResetContents.update.mock.calls[0]![0]).toEqual({
      where: { id: 3 },
      data: { quantity: { set: 5 } },
    });
    (db.objectResetContents.delete as Mock).mockResolvedValue({});
    expect(await service.deleteContent(3)).toBe(true);
    (db.objectResetContents.delete as Mock).mockRejectedValue(new Error('x'));
    expect(await service.deleteContent(3)).toBe(false);
  });
});
