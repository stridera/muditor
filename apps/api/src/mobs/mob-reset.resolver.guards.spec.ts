import 'reflect-metadata';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@muditor/db';
import {
  ZONE_SCOPE_KEY,
  ZonePermissionGuard,
} from '../auth/guards/zone-permission.guard';
import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import { MobResetResolver } from './mob-reset.resolver';

describe('MobResetResolver guards', () => {
  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(MobResetResolver, [
      'createMobReset',
      'updateMobReset',
      'deleteMobReset',
      'deleteMobResetEquipment',
      'addMobResetEquipment',
      'updateMobResetEquipment',
    ]);
  });
});

describe('MobResetResolver zone escape', () => {
  const granted = new Set([30]);
  const guard = new ZonePermissionGuard(
    {
      mobResets: { findUnique: jest.fn(async () => ({ zoneId: 30 })) },
    } as never,
    {
      checkZonePermission: jest.fn(async (_u: string, zoneId: number) =>
        granted.has(zoneId)
      ),
      hasAnyZoneGrants: jest.fn(async () => true),
    } as never,
    new Reflector()
  );
  const proto = MobResetResolver.prototype as unknown as Record<
    string,
    () => void
  >;

  function ctxFor(handler: () => void, args: Record<string, unknown>) {
    const gql = [
      {},
      args,
      { req: { user: { id: 'b', role: UserRole.BUILDER } } },
      {},
    ];
    return {
      getArgs: () => gql,
      getArgByIndex: (i: number) => gql[i],
      getHandler: () => handler,
      getClass: () => MobResetResolver,
      getType: () => 'graphql',
    } as unknown as ExecutionContext;
  }

  it('createMobReset denies a builder placing a reset in a room of a zone they cannot write', async () => {
    const handler = proto.createMobReset!;
    expect(
      await guard.canActivate(
        ctxFor(handler, {
          data: {
            zoneId: 30,
            roomZoneId: 31,
            mobZoneId: 30,
            roomId: 1,
            mobId: 1,
          },
        })
      )
    ).toBe(false);
  });

  it('createMobReset allows a reset whose zone and room zone are both granted (mob may come from anywhere)', async () => {
    const handler = proto.createMobReset!;
    expect(
      await guard.canActivate(
        ctxFor(handler, {
          data: {
            zoneId: 30,
            roomZoneId: 30,
            mobZoneId: 99,
            roomId: 1,
            mobId: 1,
          },
        })
      )
    ).toBe(true);
  });

  it('updateMobReset denies moving a reset into a room of another zone', async () => {
    const handler = proto.updateMobReset!;
    const keys = Reflect.getMetadata(ZONE_SCOPE_KEY, handler) as {
      keys: string[];
    };
    expect(keys.keys).toEqual(['zoneId', 'roomZoneId']);
    expect(
      await guard.canActivate(
        ctxFor(handler, { id: 5, data: { roomZoneId: 31, roomId: 2 } })
      )
    ).toBe(false);
  });
});
