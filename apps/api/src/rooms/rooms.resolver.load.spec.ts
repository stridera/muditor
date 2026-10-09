import { Logger } from '@nestjs/common';
import { Kind, parse, type GraphQLResolveInfo } from 'graphql';
import type { Users } from '@muditor/db';
import { MAX_BULK_PAGE_SIZE, MAX_PAGE_SIZE } from '../common/pagination';
import type { ShopsService } from '../shops/shops.service';
import { RoomsResolver } from './rooms.resolver';
import type { RoomsService } from './rooms.service';
import { ShopKeeperBatch } from './shop-keeper-batch';

function infoFor(query: string): GraphQLResolveInfo {
  const doc = parse(query);
  const op = doc.definitions.find(d => d.kind === Kind.OPERATION_DEFINITION);
  if (op?.kind !== Kind.OPERATION_DEFINITION) throw new Error('no op');
  const fragments = Object.fromEntries(
    doc.definitions
      .filter(d => d.kind === Kind.FRAGMENT_DEFINITION)
      .map(d => [(d as { name: { value: string } }).name.value, d])
  );
  return { fieldNodes: [op.selectionSet.selections[0]], fragments } as never;
}

const user = { id: 'u', role: 'PLAYER' } as unknown as Users;

describe('RoomsResolver.findAll loading', () => {
  let rooms: { findAll: jest.Mock };
  let resolver: RoomsResolver;
  beforeEach(() => {
    rooms = { findAll: jest.fn().mockResolvedValue([]) };
    resolver = new RoomsResolver(
      rooms as unknown as RoomsService,
      {} as ShopsService
    );
  });

  it('picks the lightweight loader for the public world-map selection', async () => {
    await resolver.findAll(
      undefined,
      20000,
      undefined,
      false,
      null,
      infoFor('{ rooms { id zoneId name layoutX exits { id toRoomId } } }')
    );
    const params = rooms.findAll.mock.calls[0][0];
    expect(params.plan.lightweight).toBe(true);
    expect(params.take).toBe(MAX_BULK_PAGE_SIZE);
  });

  it('only requests the relations the selection reads', async () => {
    await resolver.findAll(
      undefined,
      10,
      undefined,
      false,
      user,
      infoFor('{ rooms { id shops { id } } }')
    );
    expect(rooms.findAll.mock.calls[0][0].plan).toEqual(
      expect.objectContaining({
        lightweight: false,
        mobs: true,
        objects: false,
      })
    );
  });

  it('pages anonymous callers who ask for relation graphs', async () => {
    await resolver.findAll(
      undefined,
      20000,
      undefined,
      false,
      null,
      infoFor('{ rooms { id mobs { id } } }')
    );
    expect(rooms.findAll.mock.calls[0][0].take).toBe(MAX_PAGE_SIZE);
    rooms.findAll.mockClear();
    await resolver.findAll(
      undefined,
      20000,
      undefined,
      false,
      user,
      infoFor('{ rooms { id mobs { id } } }')
    );
    expect(rooms.findAll.mock.calls[0][0].take).toBe(MAX_BULK_PAGE_SIZE);
  });

  it('warns when results hit the row cap', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    rooms.findAll.mockResolvedValue(
      Array.from({ length: MAX_BULK_PAGE_SIZE }, (_, i) => ({
        id: i,
        zoneId: 1,
        name: 'r',
        roomDescription: '',
        description: '',
        sector: 'CITY',
        exits: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    await resolver.findAll(
      undefined,
      undefined,
      undefined,
      true,
      null,
      infoFor('{ rooms { id } }')
    );
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/cap/));
    warn.mockRestore();
  });
});

describe('Room.shops batching', () => {
  const room = (ids: number[]) => ({
    mobResets: ids.map(id => ({ mobs: { id, zoneId: 1, name: 'm' } })),
  });
  const shop = (keeperId: number) => ({
    id: keeperId,
    zoneId: 1,
    keeperZoneId: 1,
    keeperId,
    buyProfit: 1,
    sellProfit: 1,
    temper: 0,
    flags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    shopItems: [],
    shopAccepts: [],
  });

  it('resolves every room in a request with one keeper query', async () => {
    const findByKeepers = jest.fn(async (keepers: Array<{ id: number }>) => {
      return new Map(
        keepers.filter(k => k.id % 2 === 0).map(k => [`1-${k.id}`, shop(k.id)])
      );
    });
    const findByKeeper = jest.fn();
    const shops = { findByKeepers, findByKeeper } as unknown as ShopsService;
    const resolver = new RoomsResolver({} as RoomsService, shops);
    const ctx = {};
    const lists = await Promise.all(
      Array.from({ length: 50 }, (_, i) =>
        resolver.shops(room([i * 2, i * 2 + 1]) as never, ctx)
      )
    );
    expect(findByKeepers).toHaveBeenCalledTimes(1);
    expect(findByKeepers.mock.calls[0]![0]).toHaveLength(100);
    expect(findByKeeper).not.toHaveBeenCalled();
    expect(lists.every(l => l.length === 1)).toBe(true);
  });

  it('a new request context gets a new batch', async () => {
    const findByKeepers = jest.fn().mockResolvedValue(new Map());
    const resolver = new RoomsResolver(
      {} as RoomsService,
      {
        findByKeepers,
      } as unknown as ShopsService
    );
    await resolver.shops(room([1]) as never, {});
    await resolver.shops(room([1]) as never, {});
    expect(findByKeepers).toHaveBeenCalledTimes(2);
  });

  it('ShopKeeperBatch dedupes identical keepers', async () => {
    const findByKeepers = jest.fn().mockResolvedValue(new Map());
    const batch = new ShopKeeperBatch({ findByKeepers } as never);
    await Promise.all([
      batch.load({ zoneId: 1, id: 5 }),
      batch.load({ zoneId: 1, id: 5 }),
    ]);
    expect(findByKeepers.mock.calls[0]![0]).toHaveLength(1);
  });
});
