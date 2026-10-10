import { ConflictException } from '@nestjs/common';
import { MobsService } from '../mobs/mobs.service';
import { ZonesService } from '../zones/zones.service';
import { ObjectsService } from '../objects/objects.service';
import {
  assertNoPlayerItems,
  assertNoPlayerPets,
  rethrowAsInUse,
} from './proto-references';

describe('prototype delete guards', () => {
  it('reports how many player items reference an object', async () => {
    const db = {
      characterItems: {
        groupBy: jest
          .fn()
          .mockResolvedValue([
            { objectZoneId: 30, objectId: 5, _count: { _all: 3 } },
          ]),
      },
    };
    await expect(
      assertNoPlayerItems(db as never, [{ zoneId: 30, id: 5 }])
    ).rejects.toThrow(/3 player items .*30:5 \(3\)/);
  });

  it('reports how many player pets reference a mob', async () => {
    const db = {
      characterPets: {
        groupBy: jest
          .fn()
          .mockResolvedValue([
            { mobPrototypeZoneId: 30, mobPrototypeId: 9, _count: { _all: 1 } },
          ]),
      },
    };
    await expect(
      assertNoPlayerPets(db as never, [{ zoneId: 30, id: 9 }])
    ).rejects.toThrow(/1 player pet still reference this mob/);
  });

  it('passes when nothing references the prototype', async () => {
    const db = { characterItems: { groupBy: jest.fn().mockResolvedValue([]) } };
    await expect(
      assertNoPlayerItems(db as never, [{ zoneId: 30, id: 5 }])
    ).resolves.toBeUndefined();
  });

  it('maps a raced FK violation to a conflict', () => {
    expect(() =>
      rethrowAsInUse({ code: 'P2003' }, [{ zoneId: 30, id: 5 }])
    ).toThrow(ConflictException);
    const other = new Error('boom');
    expect(() => rethrowAsInUse(other, [])).toThrow(other);
  });

  it('ObjectsService.delete refuses and never deletes while players hold copies', async () => {
    const database = {
      characterItems: {
        groupBy: jest
          .fn()
          .mockResolvedValue([
            { objectZoneId: 30, objectId: 5, _count: { _all: 2 } },
          ]),
      },
      objects: { delete: jest.fn() },
    };
    const service = new ObjectsService(database as never);
    await expect(service.delete(30, 5)).rejects.toBeInstanceOf(
      ConflictException
    );
    expect(database.objects.delete).not.toHaveBeenCalled();
  });

  it('MobsService.deleteMany refuses and never deletes while players hold pets', async () => {
    const database = {
      characterPets: {
        groupBy: jest
          .fn()
          .mockResolvedValue([
            { mobPrototypeZoneId: 30, mobPrototypeId: 9, _count: { _all: 4 } },
          ]),
      },
      mobs: { deleteMany: jest.fn() },
    };
    const service = new MobsService(database as never);
    await expect(service.deleteMany([{ zoneId: 30, id: 9 }])).rejects.toThrow(
      /4 player pets/
    );
    expect(database.mobs.deleteMany).not.toHaveBeenCalled();
  });
});

describe('zone delete guards', () => {
  const zoneRow = { id: 30 };

  it('ZonesService.delete refuses with a player item count and never deletes', async () => {
    const database = {
      characterItems: {
        groupBy: jest.fn().mockResolvedValue([
          { objectZoneId: 30, objectId: 5, _count: { _all: 2 } },
          { objectZoneId: 30, objectId: 6, _count: { _all: 1 } },
        ]),
      },
      characterPets: { groupBy: jest.fn().mockResolvedValue([]) },
      zones: { delete: jest.fn() },
    };
    const service = new ZonesService(database as never);
    const err = await service.delete(30).catch(e => e);
    expect(err).toBeInstanceOf(ConflictException);
    expect(err.message).toMatch(/3 player items .*30:5 \(2\), 30:6 \(1\)/);
    expect(database.characterItems.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { OR: [{ objectZoneId: 30 }] } })
    );
    expect(database.zones.delete).not.toHaveBeenCalled();
  });

  it('ZonesService.delete refuses with a player pet count', async () => {
    const database = {
      characterItems: { groupBy: jest.fn().mockResolvedValue([]) },
      characterPets: {
        groupBy: jest
          .fn()
          .mockResolvedValue([
            { mobPrototypeZoneId: 30, mobPrototypeId: 9, _count: { _all: 4 } },
          ]),
      },
      zones: { delete: jest.fn() },
    };
    const service = new ZonesService(database as never);
    await expect(service.delete(30)).rejects.toThrow(
      /4 player pets still reference this mob/
    );
    expect(database.zones.delete).not.toHaveBeenCalled();
  });

  it('ZonesService.delete maps a raced FK violation to a conflict', async () => {
    const database = {
      characterItems: { groupBy: jest.fn().mockResolvedValue([]) },
      characterPets: { groupBy: jest.fn().mockResolvedValue([]) },
      zones: { delete: jest.fn().mockRejectedValue({ code: 'P2003' }) },
    };
    const service = new ZonesService(database as never);
    await expect(service.delete(30)).rejects.toThrow(
      /Cannot delete zone 30: player items or pets/
    );
  });

  it('ZonesService.delete deletes an unreferenced zone', async () => {
    const database = {
      characterItems: { groupBy: jest.fn().mockResolvedValue([]) },
      characterPets: { groupBy: jest.fn().mockResolvedValue([]) },
      zones: { delete: jest.fn().mockResolvedValue(zoneRow) },
    };
    const service = new ZonesService(database as never);
    await expect(service.delete(30)).resolves.toBe(zoneRow);
    expect(database.zones.delete).toHaveBeenCalledWith({ where: { id: 30 } });
  });
});
