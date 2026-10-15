import 'reflect-metadata';
import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@muditor/db';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { ZONE_SCOPE_KEY } from '../auth/guards/zone-permission.guard';
import { ZonePermissionGuard } from '../auth/guards/zone-permission.guard';
import { RoleCalculatorService } from '../users/services/role-calculator.service';
import { ScriptLibrariesResolver } from './script-libraries.resolver';

/**
 * Library write rules through the REAL guards and the REAL resolver metadata:
 *   - HEAD_BUILDER and above: any library, including global (no zone) ones
 *   - BUILDER: only libraries in a zone they hold a WRITE grant on; global
 *     libraries are denied, moving a library into an ungranted zone is denied
 *   - IMMORTAL / PLAYER / anonymous: never
 */
describe('ScriptLibrariesResolver authorization', () => {
  const writableZones = new Set([30]);
  // library id -> owning zone (null = global)
  const libraryZones: Record<number, number | null> = {
    1: 30,
    2: 77,
    3: null,
  };
  const grants = {
    checkZonePermission: jest.fn(async (_u: string, zoneId: number) =>
      writableZones.has(zoneId)
    ),
    hasAnyZoneGrants: jest.fn(async () => true),
  };
  const db = {
    scriptLibrary: {
      findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
        where.id in libraryZones ? { zoneId: libraryZones[where.id] } : null
      ),
    },
  };
  const reflector = new Reflector();
  const roleGuard = new MinimumRoleGuard(
    reflector,
    new RoleCalculatorService({} as never)
  );
  const zoneGuard = new ZonePermissionGuard(
    db as never,
    grants as never,
    reflector
  );

  const proto = ScriptLibrariesResolver.prototype as unknown as Record<
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
      getClass: () => ScriptLibrariesResolver,
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

  const create = (zoneId?: number | null) => ({
    input: { name: 'x', code: 'return 1', zoneId },
  });

  describe('createScriptLibrary', () => {
    it.each([UserRole.HEAD_BUILDER, UserRole.CODER, UserRole.IMPLEMENTOR])(
      '%s may create zone and global libraries',
      async role => {
        expect(await allowed('createScriptLibrary', role, create(77))).toBe(
          true
        );
        expect(await allowed('createScriptLibrary', role, create())).toBe(true);
        expect(await allowed('createScriptLibrary', role, create(null))).toBe(
          true
        );
      }
    );

    it('a BUILDER creates only in a granted zone, never global', async () => {
      const m = 'createScriptLibrary';
      expect(await allowed(m, UserRole.BUILDER, create(30))).toBe(true);
      expect(await allowed(m, UserRole.BUILDER, create(77))).toBe(false);
      expect(await allowed(m, UserRole.BUILDER, create())).toBe(false);
      expect(await allowed(m, UserRole.BUILDER, create(null))).toBe(false);
    });

    it.each([UserRole.IMMORTAL, UserRole.PLAYER, null])(
      '%s may not create',
      async role => {
        expect(await allowed('createScriptLibrary', role, create(30))).toBe(
          false
        );
      }
    );
  });

  describe.each(['updateScriptLibrary', 'deleteScriptLibrary'])(
    '%s',
    method => {
      const args = (id: number, zoneId?: number | null) => ({
        id,
        input: zoneId === undefined ? {} : { zoneId },
      });

      it.each([UserRole.HEAD_BUILDER, UserRole.CODER, UserRole.IMPLEMENTOR])(
        '%s may change any library, global included',
        async role => {
          for (const id of [1, 2, 3]) {
            expect(await allowed(method, role, args(id))).toBe(true);
          }
        }
      );

      it('a BUILDER changes only libraries of a granted zone', async () => {
        expect(await allowed(method, UserRole.BUILDER, args(1))).toBe(true);
        expect(await allowed(method, UserRole.BUILDER, args(2))).toBe(false);
        expect(await allowed(method, UserRole.BUILDER, args(3))).toBe(false);
        expect(await allowed(method, UserRole.BUILDER, args(999))).toBe(false);
      });

      it.each([UserRole.IMMORTAL, UserRole.PLAYER, null])(
        '%s may not change libraries',
        async role => {
          expect(await allowed(method, role, args(1))).toBe(false);
        }
      );
    }
  );

  it('a BUILDER cannot move a library into an ungranted zone', async () => {
    const args = { id: 1, input: { zoneId: 77 } };
    expect(await allowed('updateScriptLibrary', UserRole.BUILDER, args)).toBe(
      false
    );
  });

  describe('making a library global (zoneId: null)', () => {
    const libs = { update: jest.fn(async () => ({})) };
    const resolver = new ScriptLibrariesResolver(libs as never);

    it('is refused for a BUILDER even on their own zone', () => {
      expect(() =>
        resolver.updateScriptLibrary(1, { zoneId: null }, {
          id: 'u1',
          role: UserRole.BUILDER,
        } as never)
      ).toThrow(ForbiddenException);
      expect(libs.update).not.toHaveBeenCalled();
    });

    it('is allowed for HEAD_BUILDER', async () => {
      await resolver.updateScriptLibrary(1, { zoneId: null }, {
        id: 'u1',
        role: UserRole.HEAD_BUILDER,
      } as never);
      expect(libs.update).toHaveBeenCalled();
    });
  });

  it('mutations carry the zone-write guard metadata', () => {
    for (const m of [
      'createScriptLibrary',
      'updateScriptLibrary',
      'deleteScriptLibrary',
    ]) {
      expect(Reflect.hasMetadata(ZONE_SCOPE_KEY, proto[m] as object)).toBe(
        true
      );
    }
  });
});
