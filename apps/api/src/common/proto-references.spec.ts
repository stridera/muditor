import { ConflictException } from '@nestjs/common';
import { MobsService } from '../mobs/mobs.service';
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
