import { BadRequestException } from '@nestjs/common';
import 'reflect-metadata';
import '../object.dto';
import { assertValidObjectValues } from '../object-values';
import { ObjectsResolver } from '../objects.resolver';
import { ObjectsService } from '../objects.service';

describe('assertValidObjectValues', () => {
  it('accepts the composite Key form', () => {
    expect(() =>
      assertValidObjectValues({ Key: { zone: 23, id: 2 }, Capacity: 50 })
    ).not.toThrow();
    expect(() =>
      assertValidObjectValues({ Key: { zone: 1000, id: 0 } })
    ).not.toThrow();
  });

  it('accepts no key: absent, null, or an int <= 0', () => {
    for (const v of [{}, { Key: null }, { Key: -1 }, { Key: 0 }, null, 5]) {
      expect(() => assertValidObjectValues(v)).not.toThrow();
    }
  });

  it('rejects a legacy vnum int with a clear error', () => {
    expect(() => assertValidObjectValues({ Key: 2302 })).toThrow(
      BadRequestException
    );
    expect(() => assertValidObjectValues({ Key: 2302 })).toThrow(
      /composite .*legacy vnum 2302/
    );
  });

  it('rejects malformed composites and other shapes', () => {
    for (const key of [
      { zone: 23 },
      { zone: 23, id: -1 },
      { zone: 2.5, id: 1 },
      { zone: '23', id: 1 },
      { zone: 23, id: 1, extra: true },
      '2302',
      [23, 2],
      1.5,
    ]) {
      expect(() => assertValidObjectValues({ Key: key })).toThrow(
        BadRequestException
      );
    }
  });
});

describe('ObjectsResolver values validation', () => {
  const service = {
    assertIdFree: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
  };
  const resolver = new ObjectsResolver(service as unknown as ObjectsService);

  beforeEach(() => jest.clearAllMocks());

  it('createObject rejects an int Key before touching the database', async () => {
    await expect(
      resolver.createObject({
        id: 1,
        zoneId: 23,
        values: { Key: 2302 },
      } as never)
    ).rejects.toThrow(BadRequestException);
    expect(service.create).not.toHaveBeenCalled();
  });

  it('updateObject rejects an int Key before touching the database', async () => {
    await expect(
      resolver.updateObject(23, 1, { values: { Key: 2302 } } as never)
    ).rejects.toThrow(/legacy vnum 2302/);
    expect(service.update).not.toHaveBeenCalled();
  });
});
