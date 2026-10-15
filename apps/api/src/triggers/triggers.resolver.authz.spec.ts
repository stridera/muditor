import 'reflect-metadata';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@muditor/db';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { ZonePermissionGuard } from '../auth/guards/zone-permission.guard';
import { RoleCalculatorService } from '../users/services/role-calculator.service';
import { TriggersResolver } from './triggers.resolver';

/**
 * Script (Trigger) write rules, run through the REAL guards and the REAL
 * resolver metadata:
 *   - HEAD_BUILDER (level 103) and above edit scripts in any zone
 *   - a BUILDER edits only scripts of zones they hold a WRITE grant for
 *   - IMMORTAL and PLAYER never edit scripts
 */
describe('TriggersResolver script authorization', () => {
  const writableZones = new Set([30]);
  const grants = {
    checkZonePermission: jest.fn(async (_userId: string, zoneId: number) =>
      writableZones.has(zoneId)
    ),
    hasAnyZoneGrants: jest.fn(async () => true),
  };
  const roleGuard = new MinimumRoleGuard(
    new Reflector(),
    new RoleCalculatorService({} as never)
  );
  const zoneGuard = new ZonePermissionGuard(
    {} as never,
    grants as never,
    new Reflector()
  );

  const proto = TriggersResolver.prototype as unknown as Record<
    string,
    (...a: never[]) => unknown
  >;

  function ctx(
    method: string,
    role: UserRole | null,
    args: Record<string, unknown>
  ): ExecutionContext {
    const user = role ? { id: 'u1', role } : undefined;
    const gqlArgs = [{}, args, { req: { user } }, {}];
    return {
      getArgs: () => gqlArgs,
      getArgByIndex: (i: number) => gqlArgs[i],
      getHandler: () => proto[method],
      getClass: () => TriggersResolver,
      getType: () => 'graphql',
    } as unknown as ExecutionContext;
  }

  async function allowed(
    method: string,
    role: UserRole | null,
    args: Record<string, unknown>
  ): Promise<boolean> {
    const c = ctx(method, role, args);
    return roleGuard.canActivate(c) && (await zoneGuard.canActivate(c));
  }

  const writes: Array<[string, (zoneId: number) => Record<string, unknown>]> = [
    ['createTrigger', zoneId => ({ input: { zoneId, name: 'x' } })],
    ['updateTrigger', zoneId => ({ zoneId, id: 1, input: {} })],
    ['deleteTrigger', zoneId => ({ zoneId, id: 1 })],
    ['markTriggerReviewed', zoneId => ({ zoneId, id: 1 })],
  ];

  describe.each(writes)('%s', (method, args) => {
    it.each([UserRole.HEAD_BUILDER, UserRole.CODER, UserRole.IMPLEMENTOR])(
      '%s may edit a script in any zone',
      async role => {
        expect(await allowed(method, role, args(30))).toBe(true);
        expect(await allowed(method, role, args(77))).toBe(true);
      }
    );

    it('a zone-grant-only BUILDER edits only the granted zone', async () => {
      expect(await allowed(method, UserRole.BUILDER, args(30))).toBe(true);
      expect(await allowed(method, UserRole.BUILDER, args(77))).toBe(false);
    });

    it.each([UserRole.IMMORTAL, UserRole.PLAYER, null])(
      '%s may not edit scripts',
      async role => {
        expect(await allowed(method, role, args(30))).toBe(false);
      }
    );
  });
});
