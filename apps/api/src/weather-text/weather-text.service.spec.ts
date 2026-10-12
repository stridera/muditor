import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';
import { WeatherTextService } from './weather-text.service';

type Row = { climate: string; daypart: string; text: string | null };

type Key = { climate_daypart: { climate: string; daypart: string } };

function makeDb(seed: Row[] = []) {
  const rows = [...seed];
  const find = (k: Key) =>
    rows.find(
      r =>
        r.climate === k.climate_daypart.climate &&
        r.daypart === k.climate_daypart.daypart
    );
  const weatherText = {
    findMany: jest.fn(async () => rows.map(r => ({ ...r }))),
    findUnique: jest.fn(async ({ where }: { where: Key }) => {
      const r = find(where);
      return r ? { ...r } : null;
    }),
    upsert: jest.fn(
      async ({
        where,
        create,
        update,
      }: {
        where: Key;
        create: Row;
        update: Partial<Row>;
      }) => {
        const r = find(where);
        if (r) return Object.assign(r, update);
        rows.push({ ...create });
        return create;
      }
    ),
    delete: jest.fn(async ({ where }: { where: Key }) => {
      const r = find(where)!;
      rows.splice(rows.indexOf(r), 1);
      return r;
    }),
  };
  return { db: { weatherText } as unknown as DatabaseService, weatherText };
}

describe('WeatherTextService', () => {
  it('lists the rows', async () => {
    const { db } = makeDb([{ climate: 'ARID', daypart: 'day', text: 'Hot.' }]);
    await expect(new WeatherTextService(db).findAll()).resolves.toHaveLength(1);
  });

  it('upserts a trimmed line', async () => {
    const { db, weatherText } = makeDb();
    const service = new WeatherTextService(db);
    await service.set({
      climate: 'ARID' as never,
      daypart: 'day',
      text: ' Hot. ',
    });
    expect(weatherText.upsert.mock.calls[0]![0].create).toEqual({
      climate: 'ARID',
      daypart: 'day',
      text: 'Hot.',
    });
    await service.set({
      climate: 'ARID' as never,
      daypart: 'day',
      text: 'Hotter.',
    });
    expect(weatherText.upsert.mock.calls[1]![0].update).toEqual({
      text: 'Hotter.',
    });
  });

  it('rejects a blank line', async () => {
    const { db, weatherText } = makeDb();
    await expect(
      new WeatherTextService(db).set({
        climate: 'ARID' as never,
        daypart: 'day',
        text: '   ',
      })
    ).rejects.toThrow(BadRequestException);
    expect(weatherText.upsert).not.toHaveBeenCalled();
  });

  it('deletes an existing row and reports a missing one', async () => {
    const { db } = makeDb([{ climate: 'ARID', daypart: 'day', text: 'Hot.' }]);
    const service = new WeatherTextService(db);
    const key = { climate: 'ARID' as never, daypart: 'day' };
    await expect(service.remove(key)).resolves.toBe(true);
    await expect(service.remove(key)).rejects.toThrow(NotFoundException);
  });
});
