import 'reflect-metadata';
import { Sector, UserRole, type Users } from '@muditor/db';
import type { DatabaseService } from '../database/database.service';
import type { ShopsService } from '../shops/shops.service';
import { RoomsResolver } from './rooms.resolver';
import { RoomsService } from './rooms.service';

const user = (role: UserRole): Users =>
  ({ id: 'u-1', role }) as unknown as Users;

describe('RoomsService server-side list filtering', () => {
  function setup() {
    const db = {
      room: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      zones: { findMany: jest.fn().mockResolvedValue([]) },
    };
    const service = new RoomsService(db as unknown as DatabaseService);
    return { service, db };
  }

  it('applies search, sector, zone and paging in one query', async () => {
    const { service, db } = setup();
    await service.findMany({
      skip: 100,
      take: 50,
      zoneId: 30,
      search: "Fingon's",
      sector: Sector.CITY,
    });
    const query = db.room.findMany.mock.calls[0]![0];
    expect(query.skip).toBe(100);
    expect(query.take).toBe(50);
    expect(query.orderBy).toEqual([{ zoneId: 'asc' }, { id: 'asc' }]);
    expect(query.where).toEqual({
      zoneId: 30,
      sector: Sector.CITY,
      OR: [
        { name: { contains: "Fingon's", mode: 'insensitive' } },
        { plainRoomDescription: { contains: "Fingon's", mode: 'insensitive' } },
      ],
    });
  });

  it('matches an exact room id when the search is numeric', async () => {
    const { service, db } = setup();
    await service.findMany({ search: '45' });
    expect(db.room.findMany.mock.calls[0]![0].where.OR).toContainEqual({
      id: 45,
    });
  });

  it('filters god zones and filters the count identically', async () => {
    const { service, db } = setup();
    await service.count(undefined, true, { search: 'x', sector: Sector.CITY });
    expect(db.room.count).toHaveBeenCalledWith({
      where: {
        zones: { isGodZone: false },
        sector: Sector.CITY,
        OR: expect.any(Array),
      },
    });
  });

  it('does not use the unfiltered raw loader when a filter is set', async () => {
    const queryRaw = jest.fn();
    const db = {
      room: { findMany: jest.fn().mockResolvedValue([]) },
      $queryRawUnsafe: queryRaw,
    };
    const service = new RoomsService(db as unknown as DatabaseService);
    await service.findMany({ lightweight: true, search: 'gate' });
    expect(queryRaw).not.toHaveBeenCalled();
    expect(db.room.findMany).toHaveBeenCalled();
  });
});

describe('RoomsResolver list auth + filters', () => {
  function setup() {
    const roomsService = {
      findAll: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    };
    const resolver = new RoomsResolver(
      roomsService as unknown as RoomsService,
      {} as ShopsService
    );
    return { resolver, roomsService };
  }

  it('shows god-zone rooms to a signed-in builder, hides them without a token', async () => {
    const { resolver, roomsService } = setup();
    await resolver.findAll(
      undefined,
      50,
      990,
      false,
      user(UserRole.BUILDER),
      undefined
    );
    await resolver.findAll(undefined, 50, 990, false, null, undefined);
    expect(roomsService.findAll.mock.calls[0]![0].hideGodZones).toBe(false);
    expect(roomsService.findAll.mock.calls[1]![0].hideGodZones).toBe(true);
  });

  it('passes trimmed search and sector through to list and count', async () => {
    const { resolver, roomsService } = setup();
    const admin = user(UserRole.IMPLEMENTOR);
    await resolver.findAll(
      0,
      50,
      undefined,
      false,
      admin,
      undefined,
      '  gate ',
      Sector.CITY
    );
    await resolver.count(undefined, admin, ' gate ', Sector.CITY);
    expect(roomsService.findAll.mock.calls[0]![0]).toMatchObject({
      search: 'gate',
      sector: Sector.CITY,
    });
    expect(roomsService.count).toHaveBeenCalledWith(undefined, false, {
      search: 'gate',
      sector: Sector.CITY,
    });
  });
});
