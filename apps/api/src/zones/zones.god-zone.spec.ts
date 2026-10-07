import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole, type Users } from '@muditor/db';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import type { DatabaseService } from '../database/database.service';
import type { GrantsService } from '../grants/grants.service';
import { hidesGodZones } from '../common/god-zone-visibility';
import { MobsResolver } from '../mobs/mobs.resolver';
import { MobsService } from '../mobs/mobs.service';
import { ObjectsResolver } from '../objects/objects.resolver';
import { ObjectsService } from '../objects/objects.service';
import { RoomsResolver } from '../rooms/rooms.resolver';
import { RoomsService } from '../rooms/rooms.service';
import type { ShopsService } from '../shops/shops.service';
import { ZonesResolver } from './zones.resolver';
import { ZonesService } from './zones.service';

const user = (role: UserRole): Users =>
  ({ id: 'u-1', role }) as unknown as Users;

describe('hidesGodZones', () => {
  it('hides from anonymous callers and mortal accounts, not from staff', () => {
    expect(hidesGodZones(null)).toBe(true);
    expect(hidesGodZones({ role: UserRole.PLAYER })).toBe(true);
    for (const role of [
      UserRole.IMMORTAL,
      UserRole.BUILDER,
      UserRole.HEAD_BUILDER,
      UserRole.CODER,
      UserRole.IMPLEMENTOR,
    ]) {
      expect(hidesGodZones({ role })).toBe(false);
    }
  });

  it('never filters internal callers that pass no viewer', () => {
    expect(hidesGodZones(undefined)).toBe(false);
  });
});

describe('ZonesResolver god zone visibility', () => {
  function setup() {
    const zonesService = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue({ id: 12 }),
    };
    const resolver = new ZonesResolver(
      zonesService as unknown as ZonesService,
      {} as GrantsService
    );
    return { resolver, zonesService };
  }

  it('public zone queries use optional auth', () => {
    const proto = ZonesResolver.prototype as unknown as Record<string, object>;
    for (const q of ['findAll', 'findOne', 'count']) {
      expect([q, Reflect.getMetadata(GUARDS_METADATA, proto[q]!)]).toEqual([
        q,
        [OptionalJwtAuthGuard],
      ]);
    }
  });

  it('hides god zones from anonymous callers and mortals on every zone query', async () => {
    const { resolver, zonesService } = setup();
    for (const viewer of [null, undefined, user(UserRole.PLAYER)]) {
      await resolver.findAll(undefined, undefined, viewer);
      await resolver.findOne(12, viewer);
      await resolver.count(viewer);
    }
    for (const call of zonesService.findAll.mock.calls) {
      expect(call[0]).toMatchObject({ hideGodZones: true });
    }
    for (const call of zonesService.findOne.mock.calls) {
      expect(call[1]).toBe(true);
    }
    for (const call of zonesService.count.mock.calls) {
      expect(call).toEqual([undefined, true]);
    }
  });

  it.each([UserRole.IMMORTAL, UserRole.BUILDER, UserRole.IMPLEMENTOR])(
    'shows god zones to %s',
    async role => {
      const { resolver, zonesService } = setup();
      await resolver.findAll(undefined, undefined, user(role));
      await resolver.findOne(12, user(role));
      await resolver.count(user(role));
      expect(zonesService.findAll.mock.calls[0]![0]).toMatchObject({
        hideGodZones: false,
      });
      expect(zonesService.findOne).toHaveBeenCalledWith(12, false);
      expect(zonesService.count).toHaveBeenCalledWith(undefined, false);
    }
  );

  describe('updateZone isGodZone', () => {
    it.each([UserRole.BUILDER, UserRole.IMMORTAL])(
      'is refused for %s',
      async role => {
        const { resolver, zonesService } = setup();
        await expect(
          resolver.updateZone(12, { isGodZone: true }, user(role))
        ).rejects.toBeInstanceOf(ForbiddenException);
        // Clearing the flag is just as privileged.
        await expect(
          resolver.updateZone(12, { isGodZone: false }, user(role))
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(zonesService.update).not.toHaveBeenCalled();
      }
    );

    it.each([UserRole.HEAD_BUILDER, UserRole.CODER, UserRole.IMPLEMENTOR])(
      'is allowed for %s',
      async role => {
        const { resolver, zonesService } = setup();
        await resolver.updateZone(12, { isGodZone: true }, user(role));
        expect(zonesService.update).toHaveBeenCalledWith(12, {
          isGodZone: true,
        });
      }
    );

    it('does not get in the way of ordinary zone edits by a BUILDER', async () => {
      const { resolver, zonesService } = setup();
      await resolver.updateZone(12, { name: 'New' }, user(UserRole.BUILDER));
      expect(zonesService.update).toHaveBeenCalledWith(12, { name: 'New' });
    });
  });
});

describe('ZonesService god zone filtering', () => {
  function setup() {
    const db = {
      zones: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    return { db, service: new ZonesService(db as unknown as DatabaseService) };
  }

  it('adds isGodZone:false only when asked to hide', async () => {
    const { db, service } = setup();
    await service.findAll({ hideGodZones: true });
    expect(db.zones.findMany.mock.calls[0]![0].where).toEqual({
      isGodZone: false,
    });
    await service.findAll({ where: { id: 3 }, hideGodZones: true });
    expect(db.zones.findMany.mock.calls[1]![0].where).toEqual({
      AND: [{ id: 3 }, { isGodZone: false }],
    });
    await service.findAll();
    expect(db.zones.findMany.mock.calls[2]![0].where).toBeUndefined();
    await service.findOne(12, true);
    expect(db.zones.findFirst.mock.calls[0]![0].where).toEqual({
      id: 12,
      isGodZone: false,
    });
    await service.findOne(12);
    expect(db.zones.findFirst.mock.calls[1]![0].where).toEqual({ id: 12 });
    await service.count(undefined, true);
    expect(db.zones.count).toHaveBeenCalledWith({
      where: { isGodZone: false },
    });
  });
});

describe('Rooms god zone visibility', () => {
  function setup() {
    const roomsService = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findByZone: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    };
    const resolver = new RoomsResolver(
      roomsService as unknown as RoomsService,
      {} as ShopsService
    );
    return { resolver, roomsService };
  }

  it('hides god-zone rooms from anonymous callers, shows them to staff', async () => {
    const { resolver, roomsService } = setup();
    await resolver.findAll(undefined, undefined, undefined, true, null);
    await resolver.findOne(12, 4, null);
    await resolver.findByZone(12, false, null);
    await resolver.count(undefined, null);
    expect(roomsService.findAll.mock.calls[0]![0]).toMatchObject({
      hideGodZones: true,
    });
    expect(roomsService.findOne).toHaveBeenLastCalledWith(12, 4, true);
    expect(roomsService.findByZone).toHaveBeenLastCalledWith(12, false, true);
    expect(roomsService.count).toHaveBeenLastCalledWith(undefined, true);

    const imm = user(UserRole.IMMORTAL);
    await resolver.findAll(undefined, undefined, undefined, true, imm);
    await resolver.findOne(12, 4, imm);
    await resolver.findByZone(12, false, imm);
    await resolver.count(undefined, imm);
    expect(roomsService.findAll.mock.calls[1]![0]).toMatchObject({
      hideGodZones: false,
    });
    expect(roomsService.findOne).toHaveBeenLastCalledWith(12, 4, false);
    expect(roomsService.findByZone).toHaveBeenLastCalledWith(12, false, false);
    expect(roomsService.count).toHaveBeenLastCalledWith(undefined, false);
  });

  it('room queries use optional auth', () => {
    const proto = RoomsResolver.prototype as unknown as Record<string, object>;
    for (const q of ['findAll', 'findOne', 'findByZone', 'count']) {
      expect([q, Reflect.getMetadata(GUARDS_METADATA, proto[q]!)]).toEqual([
        q,
        [OptionalJwtAuthGuard],
      ]);
    }
  });

  describe('RoomsService', () => {
    const baseRoom = {
      id: 4,
      zoneId: 12,
      name: 'Hall',
      roomDescription: '',
      sector: 'STRUCTURE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    function serviceSetup(isGodZone: boolean) {
      const db = {
        room: {
          findMany: jest.fn().mockResolvedValue([]),
          findUnique: jest.fn().mockResolvedValue(baseRoom),
          count: jest.fn().mockResolvedValue(0),
        },
        zones: {
          findUnique: jest.fn().mockResolvedValue({ isGodZone }),
          findMany: jest
            .fn()
            .mockImplementation(
              ({ where }: { where: { id: { in: number[] } } }) =>
                Promise.resolve(where.id.in.includes(12) ? [{ id: 12 }] : [])
            ),
        },
        $queryRawUnsafe: jest.fn().mockResolvedValue([]),
      };
      return {
        db,
        service: new RoomsService(db as unknown as DatabaseService),
      };
    }

    it('findOne in a god zone looks like a missing room to mortals', async () => {
      const { service } = serviceSetup(true);
      await expect(service.findOne(12, 4, true)).rejects.toBeInstanceOf(
        NotFoundException
      );
      await expect(service.findOne(12, 4, false)).resolves.toMatchObject({
        id: 4,
      });
      await expect(service.findOne(12, 4)).resolves.toMatchObject({ id: 4 });
    });

    it('findOne in a normal zone is unaffected', async () => {
      const { service } = serviceSetup(false);
      await expect(service.findOne(12, 4, true)).resolves.toMatchObject({
        id: 4,
      });
    });

    it('list and count queries exclude god zones only when asked', async () => {
      const { db, service } = serviceSetup(false);
      await service.findMany({ hideGodZones: true });
      expect(db.room.findMany.mock.calls[0]![0].where).toEqual({
        zones: { isGodZone: false },
      });
      await service.findMany({ zoneId: 30, hideGodZones: true });
      expect(db.room.findMany.mock.calls[1]![0].where).toEqual({
        zoneId: 30,
        zones: { isGodZone: false },
      });
      await service.findMany({});
      expect(db.room.findMany.mock.calls[2]![0].where).toBeUndefined();

      // The world map's lightweight raw-SQL path (rooms and exits).
      await service.findMany({ lightweight: true, hideGodZones: true });
      for (const call of db.$queryRawUnsafe.mock.calls) {
        expect(call[0]).toContain('is_god_zone');
      }
      db.$queryRawUnsafe.mockClear();
      await service.findMany({ lightweight: true });
      for (const call of db.$queryRawUnsafe.mock.calls) {
        expect(call[0]).not.toContain('is_god_zone');
      }

      await service.count(undefined, true);
      expect(db.room.count).toHaveBeenLastCalledWith({
        where: { zones: { isGodZone: false } },
      });
      await service.count(30);
      expect(db.room.count).toHaveBeenLastCalledWith({
        where: { zoneId: 30 },
      });
    });
  });
});

describe('Room exits into god zones', () => {
  const exit = (toZoneId: number | null) => ({
    id: 1,
    roomZoneId: 30,
    roomId: 1,
    direction: 'UP',
    description: null,
    keywords: [],
    toZoneId,
    toRoomId: 4,
    keyZoneId: null,
    keyId: null,
    flags: [],
    defaultState: 'OPEN',
    hitPoints: null,
  });
  const room = {
    id: 1,
    zoneId: 30,
    name: 'Square',
    roomDescription: '',
    sector: 'CITY',
    createdAt: new Date(),
    updatedAt: new Date(),
    exits: [exit(12), exit(31), exit(null)],
  };
  function setup() {
    const db = {
      room: {
        findMany: jest.fn().mockResolvedValue([room]),
        findUnique: jest.fn().mockResolvedValue(room),
      },
      zones: {
        findUnique: jest.fn().mockResolvedValue({ isGodZone: false }),
        findMany: jest.fn().mockResolvedValue([{ id: 12 }]),
      },
    };
    return {
      db,
      service: new RoomsService(db as unknown as DatabaseService),
    };
  }

  it('drops exits that lead into a god zone for hidden viewers only', async () => {
    const { service } = setup();
    const hidden = await service.findMany({ hideGodZones: true });
    expect(hidden[0]!.exits.map(e => e.toZoneId)).toEqual([31, null]);
    const one = await service.findOne(30, 1, true);
    expect(one.exits.map(e => e.toZoneId)).toEqual([31, null]);
    const staff = await service.findMany({});
    expect(staff[0]!.exits.map(e => e.toZoneId)).toEqual([12, 31, null]);
    const staffOne = await service.findOne(30, 1);
    expect(staffOne.exits).toHaveLength(3);
  });
});

describe('Mobs and objects in god zones', () => {
  it('mob and object reads use optional auth', () => {
    for (const [resolver, methods] of [
      [
        MobsResolver,
        ['findAll', 'findOne', 'findByZone', 'count', 'searchMobs'],
      ],
      [
        ObjectsResolver,
        [
          'findAll',
          'findOne',
          'findByZone',
          'findByType',
          'count',
          'searchObjects',
        ],
      ],
    ] as const) {
      const proto = resolver.prototype as unknown as Record<string, object>;
      for (const q of methods) {
        expect([q, Reflect.getMetadata(GUARDS_METADATA, proto[q]!)]).toEqual([
          q,
          [OptionalJwtAuthGuard],
        ]);
      }
    }
  });

  it('resolvers ask the services to hide god zones from mortals only', async () => {
    const mobsService = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findByZone: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      search: jest.fn().mockResolvedValue([]),
    };
    const objectsService = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      findByZone: jest.fn().mockResolvedValue([]),
      findByType: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      search: jest.fn().mockResolvedValue([]),
    };
    const mobs = new MobsResolver(mobsService as unknown as MobsService);
    const objects = new ObjectsResolver(
      objectsService as unknown as ObjectsService
    );
    for (const [viewer, hide] of [
      [null, true],
      [user(UserRole.PLAYER), true],
      [user(UserRole.IMMORTAL), false],
    ] as const) {
      await mobs.findAll(undefined, undefined, undefined, viewer);
      await mobs.findOne(12, 1, viewer);
      await mobs.findByZone(12, undefined, viewer);
      await mobs.count(viewer);
      await mobs.searchMobs('titan', 10, undefined, viewer);
      await objects.findAll(undefined, undefined, viewer);
      await objects.findOne(12, 1, viewer);
      await objects.findByZone(12, viewer);
      await objects.count(viewer);
      await objects.searchObjects('sword', 10, undefined, viewer);
      expect(mobsService.findAll.mock.lastCall![0]).toMatchObject({
        hideGodZones: hide,
      });
      expect(mobsService.findOne).toHaveBeenLastCalledWith(12, 1, hide);
      expect(mobsService.findByZone).toHaveBeenLastCalledWith(
        12,
        undefined,
        hide
      );
      expect(mobsService.count).toHaveBeenLastCalledWith(undefined, hide);
      expect(mobsService.search).toHaveBeenLastCalledWith(
        'titan',
        10,
        undefined,
        hide
      );
      expect(objectsService.findAll.mock.lastCall![0]).toMatchObject({
        hideGodZones: hide,
      });
      expect(objectsService.findOne).toHaveBeenLastCalledWith(12, 1, hide);
      expect(objectsService.findByZone).toHaveBeenLastCalledWith(12, hide);
      expect(objectsService.count).toHaveBeenLastCalledWith(undefined, hide);
      expect(objectsService.search).toHaveBeenLastCalledWith(
        'sword',
        10,
        undefined,
        hide
      );
    }
  });

  it('services add the zone filter to lists, counts and searches', async () => {
    const mobsDb = {
      mobs: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const mobs = new MobsService(mobsDb as unknown as DatabaseService);
    const hiddenFilter = { zones: { isGodZone: false } };
    await mobs.findAll({ hideGodZones: true });
    expect(mobsDb.mobs.findMany.mock.calls[0]![0].where).toMatchObject(
      hiddenFilter
    );
    await mobs.findAll({});
    expect(mobsDb.mobs.findMany.mock.calls[1]![0].where).not.toHaveProperty(
      'zones'
    );
    await mobs.findOne(12, 1, true);
    expect(mobsDb.mobs.findFirst.mock.calls[0]![0].where).toEqual({
      zoneId: 12,
      id: 1,
      ...hiddenFilter,
    });
    await mobs.findByZone(12, undefined, true);
    expect(mobsDb.mobs.findMany.mock.calls[2]![0].where).toMatchObject(
      hiddenFilter
    );
    await mobs.search('titan', 10, undefined, true);
    expect(mobsDb.mobs.findMany.mock.calls[3]![0].where).toMatchObject(
      hiddenFilter
    );
    await mobs.count(undefined, true);
    expect(mobsDb.mobs.count).toHaveBeenLastCalledWith({
      where: hiddenFilter,
    });

    const objDb = {
      objects: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    const objects = new ObjectsService(objDb as unknown as DatabaseService);
    await objects.findAll({ hideGodZones: true });
    expect(objDb.objects.findMany.mock.calls[0]![0].where).toEqual(
      hiddenFilter
    );
    await objects.findAll({});
    expect(objDb.objects.findMany.mock.calls[1]![0].where).toBeUndefined();
    await objects.findOne(12, 1, true);
    expect(objDb.objects.findFirst.mock.calls[0]![0].where).toEqual({
      zoneId: 12,
      id: 1,
      ...hiddenFilter,
    });
    await objects.findByZone(12, true);
    await objects.findByType('WEAPON' as never, true);
    await objects.search('sword', 10, undefined, true);
    for (const call of objDb.objects.findMany.mock.calls.slice(2)) {
      expect(call[0].where).toMatchObject(hiddenFilter);
    }
    await objects.count(undefined, true);
    expect(objDb.objects.count).toHaveBeenLastCalledWith({
      where: hiddenFilter,
    });
  });
});
