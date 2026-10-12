import 'reflect-metadata';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@muditor/db';
import { ZonePermissionGuard } from '../auth/guards/zone-permission.guard';
import { MobResetResolver } from '../mobs/mob-reset.resolver';
import { ObjectResetResolver } from '../objects/object-reset.resolver';
import { RoomsResolver } from '../rooms/rooms.resolver';

/**
 * Zone authorization of every reset and room-content mutation: a BUILDER with
 * a WRITE grant on zone 30 only, acting on rows that belong to zone 30 or 31.
 */
describe('reset mutations: zone authorization', () => {
  const GRANTED = new Set([30]);

  // reset / equipment / content id -> owning zone
  const db = {
    mobResets: {
      findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
        where.id === 1 ? { zoneId: 30 } : where.id === 2 ? { zoneId: 31 } : null
      ),
    },
    mobResetEquipment: {
      findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
        where.id === 10
          ? { mob_resets: { zoneId: 30 } }
          : where.id === 20
            ? { mob_resets: { zoneId: 31 } }
            : null
      ),
    },
    mobResetEquipmentContents: {
      findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
        where.id === 100
          ? { equipment: { mob_resets: { zoneId: 30 } } }
          : where.id === 200
            ? { equipment: { mob_resets: { zoneId: 31 } } }
            : null
      ),
    },
    objectResets: {
      findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
        where.id === 5 ? { zoneId: 30 } : where.id === 6 ? { zoneId: 31 } : null
      ),
    },
    objectResetContents: {
      findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
        where.id === 50
          ? { reset: { zoneId: 30 } }
          : where.id === 60
            ? { reset: { zoneId: 31 } }
            : null
      ),
    },
  };
  const guard = new ZonePermissionGuard(
    db as never,
    {
      checkZonePermission: jest.fn(async (_u: string, zoneId: number) =>
        GRANTED.has(zoneId)
      ),
      hasAnyZoneGrants: jest.fn(async () => true),
    } as never,
    new Reflector()
  );

  function allowed(
    resolver: new (...a: never[]) => object,
    method: string,
    args: Record<string, unknown>,
    role: UserRole = UserRole.BUILDER
  ): Promise<boolean> {
    const proto = resolver.prototype as unknown as Record<string, () => void>;
    const gql = [{}, args, { req: { user: { id: 'b', role } } }, {}];
    return guard.canActivate({
      getArgs: () => gql,
      getArgByIndex: (i: number) => gql[i],
      getHandler: () => proto[method],
      getClass: () => resolver,
      getType: () => 'graphql',
    } as unknown as ExecutionContext);
  }

  describe('mob resets', () => {
    it('createMobReset needs write on the reset zone and the room zone', async () => {
      const data = (zoneId: number, roomZoneId: number) => ({
        zoneId,
        roomZoneId,
        mobZoneId: 99,
        mobId: 1,
        roomId: 1,
      });
      expect(
        await allowed(MobResetResolver, 'createMobReset', {
          data: data(30, 30),
        })
      ).toBe(true);
      expect(
        await allowed(MobResetResolver, 'createMobReset', {
          data: data(31, 31),
        })
      ).toBe(false);
      expect(
        await allowed(MobResetResolver, 'createMobReset', {
          data: data(30, 31),
        })
      ).toBe(false);
    });

    it.each([
      ['updateMobReset', 'id', 1, 2],
      ['deleteMobReset', 'id', 1, 2],
      ['addMobResetEquipment', 'resetId', 1, 2],
      ['deleteMobResetEquipment', 'id', 10, 20],
      ['updateMobResetEquipment', 'id', 10, 20],
      ['addMobResetEquipmentContent', 'equipmentId', 10, 20],
      ['updateMobResetEquipmentContent', 'id', 100, 200],
      ['deleteMobResetEquipmentContent', 'id', 100, 200],
    ])(
      '%s follows the owning zone of %s (own zone ok, other zone and unknown id denied)',
      async (method, arg, ownId, otherId) => {
        const base = { data: {} };
        expect(
          await allowed(MobResetResolver, method, { ...base, [arg]: ownId })
        ).toBe(true);
        expect(
          await allowed(MobResetResolver, method, { ...base, [arg]: otherId })
        ).toBe(false);
        expect(
          await allowed(MobResetResolver, method, { ...base, [arg]: 9999 })
        ).toBe(false);
      }
    );

    it('a builder without a grant cannot place a mob in a zone-31 room even with a zone-30 reset', async () => {
      expect(
        await allowed(MobResetResolver, 'updateMobReset', {
          id: 1,
          data: { roomZoneId: 31, roomId: 3 },
        })
      ).toBe(false);
    });
  });

  describe('object resets', () => {
    it('createObjectReset needs write on the reset zone and the room zone', async () => {
      const data = (zoneId: number, roomZoneId: number) => ({
        zoneId,
        roomZoneId,
        objectZoneId: 99,
        objectId: 1,
        roomId: 1,
      });
      expect(
        await allowed(ObjectResetResolver, 'createObjectReset', {
          data: data(30, 30),
        })
      ).toBe(true);
      expect(
        await allowed(ObjectResetResolver, 'createObjectReset', {
          data: data(31, 31),
        })
      ).toBe(false);
      expect(
        await allowed(ObjectResetResolver, 'createObjectReset', {
          data: data(30, 31),
        })
      ).toBe(false);
    });

    it.each([
      ['updateObjectReset', 'id', 5, 6],
      ['deleteObjectReset', 'id', 5, 6],
      ['addObjectResetContent', 'resetId', 5, 6],
      ['updateObjectResetContent', 'id', 50, 60],
      ['deleteObjectResetContent', 'id', 50, 60],
    ])(
      '%s follows the owning zone of %s',
      async (method, arg, ownId, otherId) => {
        const base = { data: {} };
        expect(
          await allowed(ObjectResetResolver, method, { ...base, [arg]: ownId })
        ).toBe(true);
        expect(
          await allowed(ObjectResetResolver, method, {
            ...base,
            [arg]: otherId,
          })
        ).toBe(false);
        expect(
          await allowed(ObjectResetResolver, method, { ...base, [arg]: 9999 })
        ).toBe(false);
      }
    );

    it('moving an object reset into another zone needs a grant there too', async () => {
      expect(
        await allowed(ObjectResetResolver, 'updateObjectReset', {
          id: 5,
          data: { roomZoneId: 31, roomId: 2 },
        })
      ).toBe(false);
      expect(
        await allowed(ObjectResetResolver, 'updateObjectReset', {
          id: 5,
          data: { roomZoneId: 30, roomId: 2 },
        })
      ).toBe(true);
    });
  });

  it('room extra descriptions are scoped to the zone argument', async () => {
    expect(
      await allowed(RoomsResolver, 'updateRoomExtraDescriptions', {
        zoneId: 30,
        id: 1,
        extraDescs: [],
      })
    ).toBe(true);
    expect(
      await allowed(RoomsResolver, 'updateRoomExtraDescriptions', {
        zoneId: 31,
        id: 1,
        extraDescs: [],
      })
    ).toBe(false);
  });

  it('IMMORTAL and PLAYER are denied; HEAD_BUILDER bypasses grants', async () => {
    const args = { id: 5, data: {} };
    expect(
      await allowed(
        ObjectResetResolver,
        'deleteObjectReset',
        args,
        UserRole.IMMORTAL
      )
    ).toBe(false);
    expect(
      await allowed(
        ObjectResetResolver,
        'deleteObjectReset',
        { id: 6 },
        UserRole.HEAD_BUILDER
      )
    ).toBe(true);
  });
});
