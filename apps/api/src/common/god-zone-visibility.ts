import type { UserRole } from '@muditor/db';
import { isStaff } from '../auth/role.util';

/**
 * God zones (Zones.isGodZone) are staff-only content. IMMORTAL and above see
 * them; anonymous callers and mortal accounts do not.
 *
 * `viewer` follows the convention used by the public read queries: `null` is
 * an anonymous caller, a user object is an authenticated one. Internal
 * callers that pass nothing (`undefined`) are never filtered.
 */
export function hidesGodZones(
  viewer: { role: UserRole } | null | undefined
): boolean {
  if (viewer === undefined) return false;
  return !isStaff(viewer?.role);
}

/**
 * Prisma `where` fragment for entities that carry a `zones` relation (rooms,
 * mobs, objects, ...): excludes rows in god zones when `hide` is set.
 */
export function inVisibleZone(hide: boolean): {
  zones?: { isGodZone: false };
} {
  return hide ? { zones: { isGodZone: false } } : {};
}
