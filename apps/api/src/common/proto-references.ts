import { ConflictException } from '@nestjs/common';
import type { DatabaseService } from '../database/database.service';

/**
 * Object and mob prototypes are referenced by players' own data
 * ("CharacterItems", "CharacterPets"). Those FKs are ON DELETE RESTRICT, so a
 * prototype that players still hold cannot be deleted. Check up front so the
 * builder gets a clear message instead of an opaque FK error, and so a bulk
 * delete never half-succeeds.
 */

interface ProtoKey {
  zoneId: number;
  id: number;
}

const label = (k: ProtoKey) => `${k.zoneId}:${k.id}`;

export function isForeignKeyViolation(error: unknown): boolean {
  return (error as { code?: string } | null)?.code === 'P2003';
}

export async function assertNoPlayerItems(
  db: Pick<DatabaseService, 'characterItems'>,
  keys: ProtoKey[]
): Promise<void> {
  if (keys.length === 0) return;
  const rows = await db.characterItems.groupBy({
    by: ['objectZoneId', 'objectId'],
    where: {
      OR: keys.map(k => ({ objectZoneId: k.zoneId, objectId: k.id })),
    },
    _count: { _all: true },
  });
  if (rows.length === 0) return;
  const total = rows.reduce((n, r) => n + r._count._all, 0);
  const which = rows
    .map(r => `${r.objectZoneId}:${r.objectId} (${r._count._all})`)
    .join(', ');
  throw new ConflictException(
    `Cannot delete: ${total} player item${total === 1 ? '' : 's'} still reference ${rows.length === 1 ? 'this object' : 'these objects'} [${which}]. Players' items are never deleted with their prototype; remove or replace them first.`
  );
}

export async function assertNoPlayerPets(
  db: Pick<DatabaseService, 'characterPets'>,
  keys: ProtoKey[]
): Promise<void> {
  if (keys.length === 0) return;
  const rows = await db.characterPets.groupBy({
    by: ['mobPrototypeZoneId', 'mobPrototypeId'],
    where: {
      OR: keys.map(k => ({
        mobPrototypeZoneId: k.zoneId,
        mobPrototypeId: k.id,
      })),
    },
    _count: { _all: true },
  });
  if (rows.length === 0) return;
  const total = rows.reduce((n, r) => n + r._count._all, 0);
  const which = rows
    .map(r => `${r.mobPrototypeZoneId}:${r.mobPrototypeId} (${r._count._all})`)
    .join(', ');
  throw new ConflictException(
    `Cannot delete: ${total} player pet${total === 1 ? '' : 's'} still reference ${rows.length === 1 ? 'this mob' : 'these mobs'} [${which}]. Players' pets are never deleted with their prototype; remove them first.`
  );
}

/** Race-safe fallback when the FK fires between the check and the delete. */
export function rethrowAsInUse(error: unknown, keys: ProtoKey[]): never {
  if (isForeignKeyViolation(error)) {
    throw new ConflictException(
      `Cannot delete ${keys.map(label).join(', ')}: player items or pets still reference it.`
    );
  }
  throw error;
}
