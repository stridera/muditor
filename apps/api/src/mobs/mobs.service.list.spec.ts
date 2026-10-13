import type { DatabaseService } from '../database/database.service';
import { MobsService } from './mobs.service';

function setup() {
  const db = {
    mobs: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
  };
  return { service: new MobsService(db as unknown as DatabaseService), db };
}

describe('MobsService server-side list filtering', () => {
  it('AND-s search terms across name, descriptions, keywords and id', async () => {
    const { service, db } = setup();
    await service.findAll({
      skip: 50,
      take: 50,
      zoneId: 30,
      search: 'Guard 45',
      levelMin: 5,
      levelMax: 20,
      sortBy: 'level',
      sortDir: 'desc',
    });
    const query = db.mobs.findMany.mock.calls[0]![0];
    expect(query.skip).toBe(50);
    expect(query.take).toBe(50);
    expect(query.orderBy).toEqual([
      { level: 'desc' },
      { zoneId: 'asc' },
      { id: 'asc' },
    ]);
    expect(query.where.zoneId).toBe(30);
    expect(query.where.level).toEqual({ gte: 5, lte: 20 });
    expect(query.where.AND).toHaveLength(2);
    expect(query.where.AND[0].OR).toEqual([
      { plainName: { contains: 'Guard', mode: 'insensitive' } },
      { plainRoomDescription: { contains: 'Guard', mode: 'insensitive' } },
      { plainExamineDescription: { contains: 'Guard', mode: 'insensitive' } },
      { keywords: { has: 'guard' } },
    ]);
    expect(query.where.AND[1].OR).toContainEqual({ id: 45 });
  });

  it('sorts by the colour-free name and ignores unknown columns', async () => {
    const { service, db } = setup();
    await service.findAll({ sortBy: 'name' });
    expect(db.mobs.findMany.mock.calls[0]![0].orderBy[0]).toEqual({
      plainName: 'asc',
    });
    await service.findAll({ sortBy: 'hpDice; DROP TABLE' });
    expect(db.mobs.findMany.mock.calls[1]![0].orderBy).toEqual([
      { id: 'asc' },
      { zoneId: 'asc' },
    ]);
  });

  it('hides god zones in the list and the count identically', async () => {
    const { service, db } = setup();
    const filter = { hideGodZones: true, zoneId: 3, search: 'x', levelMin: 2 };
    await service.findAll(filter);
    await service.countFiltered(filter);
    expect(db.mobs.count).toHaveBeenCalledWith({
      where: db.mobs.findMany.mock.calls[0]![0].where,
    });
    expect(db.mobs.count.mock.calls[0]![0].where.zones).toEqual({
      isGodZone: false,
    });
  });

  it('without filters it returns the whole table in id order (back-compat)', async () => {
    const { service, db } = setup();
    await service.findAll({ take: 1000 });
    expect(db.mobs.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ id: 'asc' }, { zoneId: 'asc' }],
      take: 1000,
    });
  });
});
