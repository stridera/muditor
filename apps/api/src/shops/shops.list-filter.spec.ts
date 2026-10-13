import 'reflect-metadata';
import { UserRole, type Users } from '@muditor/db';
import { ShopsResolver } from './shops.resolver';
import { shopListWhere } from './shops.service';

describe('shopListWhere', () => {
  it('is empty without filters', () => {
    expect(shopListWhere({})).toEqual({});
  });

  it('matches numbers against id, keeper and zone, text against the keeper name', () => {
    const where = shopListWhere({ search: '30 baker' });
    expect(where.AND).toEqual([
      {
        OR: [
          { id: 30 },
          { keeperId: 30 },
          { zoneId: 30 },
          { mobs: { plainName: { contains: '30', mode: 'insensitive' } } },
        ],
      },
      {
        OR: [
          { mobs: { plainName: { contains: 'baker', mode: 'insensitive' } } },
        ],
      },
    ]);
  });

  it('applies zone, profit and keeper filters', () => {
    expect(
      shopListWhere({ zoneId: 30, highProfit: true, hasKeeper: false })
    ).toEqual({
      zoneId: 30,
      buyProfit: { gte: 0.8 },
      sellProfit: { gte: 0.8 },
      keeperId: { lte: 0 },
    });
    expect(shopListWhere({ hasKeeper: true }).keeperId).toEqual({ gt: 0 });
  });
});

describe('ShopsResolver paged list keeps god-zone hiding', () => {
  const svc = {
    findAll: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  };
  const r = new ShopsResolver(svc as never);
  const player = { id: 'p', role: UserRole.PLAYER } as unknown as Users;
  const immortal = { id: 'i', role: UserRole.IMMORTAL } as unknown as Users;

  it('combines the visibility filter with the list filters, for list and count', async () => {
    await r.findAll(0, 25, null, 30, 'baker', true, true);
    expect(svc.findAll.mock.lastCall![0].where).toMatchObject({
      zones: { isGodZone: false },
      zoneId: 30,
      keeperId: { gt: 0 },
    });
    await r.count(player, 30, 'baker');
    expect(svc.count.mock.lastCall![0]).toMatchObject({
      zones: { isGodZone: false },
      zoneId: 30,
    });
    await r.count(immortal, 30);
    expect(svc.count.mock.lastCall![0]).not.toHaveProperty('zones');
  });
});
