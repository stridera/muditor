import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole, GrantPermission } from '@muditor/db';
import { DatabaseService } from '../../database/database.service';
import { GrantsService } from '../../grants/grants.service';

export const ZONE_SCOPE_KEY = 'zoneScope';

/**
 * Resolves the zone of an entity that is addressed only by a surrogate key
 * (e.g. a reset row or room exit id) instead of a (zoneId, id) pair.
 * Return null/undefined when the entity does not exist (access is denied).
 */
export interface ZoneScopeLookup {
  /** Name of the GraphQL argument holding the surrogate id */
  arg: string;
  resolve: (
    db: DatabaseService,
    value: number
  ) => Promise<number | null | undefined>;
}

export interface ZoneScopeOptions {
  /**
   * Field names that carry a zone id. Searched recursively through the
   * mutation args: top-level args, object args (`data`, `input`, ...) and
   * every element of array args (bulk mutations).
   * Defaults to `['zoneId']`.
   */
  keys?: string[];
  /** Additional zone resolution via surrogate-key lookup */
  lookup?: ZoneScopeLookup;
}

const BYPASS_ROLES: UserRole[] = [
  UserRole.IMPLEMENTOR,
  UserRole.CODER,
  UserRole.HEAD_BUILDER,
];

const MAX_DEPTH = 5;

export const NO_ZONE_GRANTS_MESSAGE =
  'No zone grants assigned — ask an implementor';

/**
 * Guard that checks zone-based write permissions using UserGrants.
 *
 * - IMPLEMENTOR, CODER, HEAD_BUILDER: bypass grants (full access)
 * - BUILDER: needs a non-expired WRITE (or ADMIN) grant for EVERY zone the
 *   mutation touches
 * - IMMORTAL / PLAYER: denied (this guard protects write operations)
 *
 * The affected zones are derived from the mutation args (see ZoneScope).
 * If no zone can be derived the request is denied (fail closed).
 * Must run after an authentication guard that sets `req.user`.
 */
@Injectable()
export class ZonePermissionGuard implements CanActivate {
  constructor(
    private readonly db: DatabaseService,
    private readonly grants: GrantsService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req?.user;

    if (!user) return false;

    if (BYPASS_ROLES.includes(user.role)) return true;
    if (user.role !== UserRole.BUILDER) return false;

    const options =
      this.reflector.getAllAndOverride<ZoneScopeOptions | undefined>(
        ZONE_SCOPE_KEY,
        [context.getHandler(), context.getClass()]
      ) ?? {};

    const args = ctx.getArgs() as Record<string, unknown>;
    const zoneIds = this.collectZoneIds(args, options.keys ?? ['zoneId']);
    if (zoneIds === null) return false; // malformed zone id

    if (options.lookup) {
      const raw = args[options.lookup.arg];
      const value = Number(raw);
      if (raw === undefined || raw === null || !Number.isInteger(value)) {
        return false;
      }
      const zoneId = await options.lookup.resolve(this.db, value);
      if (zoneId === null || zoneId === undefined) return false;
      zoneIds.add(zoneId);
    }

    if (zoneIds.size === 0) return false;

    for (const zoneId of zoneIds) {
      const allowed = await this.grants.checkZonePermission(
        user.id,
        zoneId,
        GrantPermission.WRITE
      );
      if (!allowed) {
        // Explicit (not silent) diagnosis for the common day-one case: a
        // builder who was never given any zone grants.
        if (!(await this.grants.hasAnyZoneGrants(user.id))) {
          throw new ForbiddenException(NO_ZONE_GRANTS_MESSAGE);
        }
        return false;
      }
    }
    return true;
  }

  /**
   * Collect every zone id found under the given key names. Returns null if a
   * found value is not an integer.
   */
  private collectZoneIds(
    args: Record<string, unknown>,
    keys: string[]
  ): Set<number> | null {
    const found = new Set<number>();
    let valid = true;

    const addValue = (value: unknown): void => {
      if (Array.isArray(value)) {
        value.forEach(addValue);
        return;
      }
      const num =
        typeof value === 'number' || typeof value === 'string'
          ? Number(value)
          : NaN;
      if (value === '' || !Number.isInteger(num)) {
        valid = false;
        return;
      }
      found.add(num);
    };

    const walk = (node: unknown, depth: number): void => {
      if (depth > MAX_DEPTH || node === null || typeof node !== 'object') {
        return;
      }
      if (Array.isArray(node)) {
        node.forEach(el => walk(el, depth + 1));
        return;
      }
      for (const [key, value] of Object.entries(node)) {
        if (keys.includes(key) && value !== undefined && value !== null) {
          addValue(value);
        } else {
          walk(value, depth + 1);
        }
      }
    };

    walk(args, 0);
    return valid ? found : null;
  }
}
