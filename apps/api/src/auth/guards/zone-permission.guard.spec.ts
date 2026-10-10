import 'reflect-metadata';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GrantPermission, UserRole } from '@muditor/db';
import {
  NO_ZONE_GRANTS_MESSAGE,
  ZONE_SCOPE_KEY,
  ZonePermissionGuard,
} from './zone-permission.guard';
import type { ZoneScopeOptions } from './zone-permission.guard';

describe('ZonePermissionGuard', () => {
  const grantedZones = new Set([30]);
  const grants = {
    checkZonePermission: jest.fn(
      async (_userId: string, zoneId: number, _perm: GrantPermission) =>
        grantedZones.has(zoneId)
    ),
    hasAnyZoneGrants: jest.fn(async (_userId: string) => true),
  };
  const db = {
    roomExit: { findUnique: jest.fn() },
  };
  let guard: ZonePermissionGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new ZonePermissionGuard(
      db as never,
      grants as never,
      new Reflector()
    );
  });

  function ctx(
    role: UserRole | null,
    args: Record<string, unknown>,
    options?: ZoneScopeOptions
  ): ExecutionContext {
    const handler = function handler() {};
    if (options) Reflect.defineMetadata(ZONE_SCOPE_KEY, options, handler);
    const user = role ? { id: 'user-1', role } : undefined;
    const gqlArgs = [{}, args, { req: { user } }, {}];
    return {
      getArgs: () => gqlArgs,
      getArgByIndex: (i: number) => gqlArgs[i],
      getHandler: () => handler,
      getClass: () => class Dummy {},
      getType: () => 'graphql',
    } as unknown as ExecutionContext;
  }

  it('denies unauthenticated requests', async () => {
    expect(await guard.canActivate(ctx(null, { zoneId: 30 }))).toBe(false);
  });

  it('denies PLAYER and IMMORTAL (view-only) even with a zoneId', async () => {
    expect(await guard.canActivate(ctx(UserRole.PLAYER, { zoneId: 30 }))).toBe(
      false
    );
    expect(
      await guard.canActivate(ctx(UserRole.IMMORTAL, { zoneId: 30 }))
    ).toBe(false);
  });

  it('allows a BUILDER with a WRITE grant for the zone and denies other zones', async () => {
    expect(await guard.canActivate(ctx(UserRole.BUILDER, { zoneId: 30 }))).toBe(
      true
    );
    expect(await guard.canActivate(ctx(UserRole.BUILDER, { zoneId: 31 }))).toBe(
      false
    );
    expect(grants.checkZonePermission).toHaveBeenCalledWith(
      'user-1',
      30,
      GrantPermission.WRITE
    );
  });

  it('gives an explicit error when a BUILDER has no zone grants at all', async () => {
    grants.hasAnyZoneGrants.mockResolvedValueOnce(false);
    await expect(
      guard.canActivate(ctx(UserRole.BUILDER, { zoneId: 31 }))
    ).rejects.toThrow(NO_ZONE_GRANTS_MESSAGE);
    expect(NO_ZONE_GRANTS_MESSAGE).toBe(
      'No zone grants assigned — ask an implementor'
    );
  });

  it('checks every zone key (e.g. trigger zone plus target mob zone)', async () => {
    const opts = { keys: ['triggerZoneId', 'mobZoneId', 'objectZoneId'] };
    expect(
      await guard.canActivate(
        ctx(
          UserRole.BUILDER,
          { input: { triggerZoneId: 31, mobZoneId: 30, mobId: 1 } },
          opts
        )
      )
    ).toBe(false);
    expect(
      await guard.canActivate(
        ctx(
          UserRole.BUILDER,
          { input: { triggerZoneId: 30, mobZoneId: 30, mobId: 1 } },
          opts
        )
      )
    ).toBe(true);
  });

  it('only checks the shop keeper zone when keeper fields are present', async () => {
    const opts = { keys: ['zoneId', 'keeperZoneId'] };
    // Unchanged keeper: the web omits (or nulls) the keeper fields.
    expect(
      await guard.canActivate(
        ctx(UserRole.BUILDER, { zoneId: 30, id: 1, data: {} }, opts)
      )
    ).toBe(true);
    expect(
      await guard.canActivate(
        ctx(
          UserRole.BUILDER,
          { zoneId: 30, id: 1, data: { keeperId: null, keeperZoneId: null } },
          opts
        )
      )
    ).toBe(true);
    // Changed keeper in a zone the builder cannot write is still rejected.
    expect(
      await guard.canActivate(
        ctx(
          UserRole.BUILDER,
          { zoneId: 30, id: 1, data: { keeperId: 5, keeperZoneId: 31 } },
          opts
        )
      )
    ).toBe(false);
  });

  it('reads the zone from input objects (data.zoneId / input.zoneId)', async () => {
    expect(
      await guard.canActivate(
        ctx(UserRole.BUILDER, { data: { zoneId: 30, name: 'x' } })
      )
    ).toBe(true);
    expect(
      await guard.canActivate(ctx(UserRole.BUILDER, { input: { zoneId: 31 } }))
    ).toBe(false);
  });

  it('checks an update that also moves the entity to another zone', async () => {
    expect(
      await guard.canActivate(
        ctx(UserRole.BUILDER, { zoneId: 30, id: 1, data: { zoneId: 31 } })
      )
    ).toBe(false);
  });

  it('uses the configured key for zone mutations (id of the zone)', async () => {
    const opts = { keys: ['id'] };
    expect(
      await guard.canActivate(ctx(UserRole.BUILDER, { id: 30 }, opts))
    ).toBe(true);
    expect(
      await guard.canActivate(ctx(UserRole.BUILDER, { id: 31 }, opts))
    ).toBe(false);
    expect(
      await guard.canActivate(ctx(UserRole.BUILDER, { data: { id: 31 } }, opts))
    ).toBe(false);
  });

  it('bypasses the grant check for IMPLEMENTOR, CODER and HEAD_BUILDER', async () => {
    for (const role of [
      UserRole.IMPLEMENTOR,
      UserRole.CODER,
      UserRole.HEAD_BUILDER,
    ]) {
      expect(await guard.canActivate(ctx(role, { zoneId: 99 }))).toBe(true);
    }
    expect(grants.checkZonePermission).not.toHaveBeenCalled();
  });

  describe('bulk mutations', () => {
    it('allows when every element is in a permitted zone', async () => {
      const keys = [
        { zoneId: 30, id: 1 },
        { zoneId: 30, id: 2 },
      ];
      expect(await guard.canActivate(ctx(UserRole.BUILDER, { keys }))).toBe(
        true
      );
    });

    it('denies when one element is in an unpermitted zone', async () => {
      const keys = [
        { zoneId: 30, id: 1 },
        { zoneId: 31, id: 2 },
      ];
      expect(await guard.canActivate(ctx(UserRole.BUILDER, { keys }))).toBe(
        false
      );
    });

    it('walks nested arrays (batchUpdateRoomPositions)', async () => {
      const input = {
        updates: [
          { zoneId: 30, id: 1 },
          { zoneId: 31, id: 2 },
        ],
      };
      expect(await guard.canActivate(ctx(UserRole.BUILDER, { input }))).toBe(
        false
      );
    });
  });

  describe('fail closed', () => {
    it('denies a BUILDER when no zoneId can be derived', async () => {
      expect(
        await guard.canActivate(ctx(UserRole.BUILDER, { name: 'x' }))
      ).toBe(false);
      expect(await guard.canActivate(ctx(UserRole.BUILDER, {}))).toBe(false);
    });

    it('denies an empty bulk list', async () => {
      expect(await guard.canActivate(ctx(UserRole.BUILDER, { keys: [] }))).toBe(
        false
      );
    });

    it('denies a malformed zoneId', async () => {
      expect(
        await guard.canActivate(ctx(UserRole.BUILDER, { zoneId: 'abc' }))
      ).toBe(false);
    });
  });

  describe('surrogate-key lookup', () => {
    const lookup = {
      arg: 'exitId',
      resolve: async (d: typeof db, id: number) =>
        (await d.roomExit.findUnique({ where: { id } }))?.roomZoneId,
    };
    const opts = { lookup } as unknown as ZoneScopeOptions;

    it('resolves the zone from the entity', async () => {
      db.roomExit.findUnique.mockResolvedValueOnce({ roomZoneId: 30 });
      expect(
        await guard.canActivate(ctx(UserRole.BUILDER, { exitId: 5 }, opts))
      ).toBe(true);
      db.roomExit.findUnique.mockResolvedValueOnce({ roomZoneId: 31 });
      expect(
        await guard.canActivate(ctx(UserRole.BUILDER, { exitId: 6 }, opts))
      ).toBe(false);
    });

    it('denies when the entity does not exist', async () => {
      db.roomExit.findUnique.mockResolvedValueOnce(null);
      expect(
        await guard.canActivate(ctx(UserRole.BUILDER, { exitId: 7 }, opts))
      ).toBe(false);
    });
  });
});
