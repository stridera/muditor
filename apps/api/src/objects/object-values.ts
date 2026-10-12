import { BadRequestException } from '@nestjs/common';

/**
 * Container keys are stored as the composite id `{"zone": N, "id": M}` (the
 * legacy vnum integer is gone; fierylib converts it on import). Integers <= 0
 * mean "no key" and stay valid. A positive integer is a legacy vnum and is
 * rejected so an old editor or script cannot write it back.
 */
export function assertValidObjectValues(values: unknown): void {
  if (!values || typeof values !== 'object' || Array.isArray(values)) return;
  const key = (values as Record<string, unknown>)['Key'];
  if (key === undefined || key === null) return;

  if (typeof key === 'number') {
    if (Number.isInteger(key) && key <= 0) return;
    throw new BadRequestException(
      `values.Key must be a composite {"zone": N, "id": M}, not the legacy vnum ${key}`
    );
  }

  if (typeof key === 'object' && !Array.isArray(key)) {
    const { zone, id, ...extra } = key as Record<string, unknown>;
    const ok = (n: unknown) =>
      typeof n === 'number' && Number.isInteger(n) && n >= 0;
    if (ok(zone) && ok(id) && Object.keys(extra).length === 0) return;
  }

  throw new BadRequestException(
    `values.Key must be a composite {"zone": N, "id": M} with whole numbers >= 0 (got ${JSON.stringify(key)})`
  );
}

/**
 * Ground text for a new object. Builders may leave it blank; fall back to
 * "<name> lies here." so the object is never invisible in a room.
 */
export function defaultRoomDescription(
  roomDescription: string | null | undefined,
  name: string
): string {
  const trimmed = roomDescription?.trim();
  if (trimmed) return roomDescription as string;
  const base = name.trim();
  if (!base) return 'Something lies here.';
  return `${base.charAt(0).toUpperCase()}${base.slice(1)} lies here.`;
}
