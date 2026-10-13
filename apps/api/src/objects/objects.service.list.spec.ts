import { ObjectType } from '@muditor/db';
import type { DatabaseService } from '../database/database.service';
import { ObjectsService } from './objects.service';

function setup() {
  const db = {
    objects: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  };
  return { service: new ObjectsService(db as unknown as DatabaseService), db };
}

describe('ObjectsService server-side list filtering', () => {
  it('applies zone, type, ranges, search, sort and paging in one query', async () => {
    const { service, db } = setup();
    await service.findAll({
      skip: 100,
      take: 50,
      zoneId: 30,
      types: [ObjectType.WEAPON, ObjectType.ARMOR],
      levelMin: 1,
      costMin: 1000,
      weightMax: 5,
      search: 'sword',
      sortBy: 'cost',
      sortDir: 'desc',
    });
    const query = db.objects.findMany.mock.calls[0]![0];
    expect(query.skip).toBe(100);
    expect(query.take).toBe(50);
    expect(query.orderBy).toEqual([
      { cost: 'desc' },
      { zoneId: 'asc' },
      { id: 'asc' },
    ]);
    expect(query.where).toMatchObject({
      zoneId: 30,
      type: { in: [ObjectType.WEAPON, ObjectType.ARMOR] },
      level: { gte: 1 },
      cost: { gte: 1000 },
      weight: { lte: 5 },
    });
    expect(query.where.AND).toHaveLength(1);
  });

  it('matches a type name typed into the search box', async () => {
    const { service, db } = setup();
    await service.findAll({ search: 'weapon' });
    expect(
      db.objects.findMany.mock.calls[0]![0].where.AND[0].OR
    ).toContainEqual({ type: ObjectType.WEAPON });
  });

  it('filters god zones and filters the count identically', async () => {
    const { service, db } = setup();
    const filter = {
      hideGodZones: true,
      search: 'a',
      types: [ObjectType.FOOD],
    };
    await service.findAll(filter);
    await service.countFiltered(filter);
    expect(db.objects.count).toHaveBeenCalledWith({
      where: db.objects.findMany.mock.calls[0]![0].where,
    });
    expect(db.objects.count.mock.calls[0]![0].where.zones).toEqual({
      isGodZone: false,
    });
  });

  it('keeps the unfiltered id-ordered behaviour for existing callers', async () => {
    const { service, db } = setup();
    await service.findAll({ take: 1000 });
    expect(db.objects.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ id: 'asc' }, { zoneId: 'asc' }],
      take: 1000,
    });
  });
});
