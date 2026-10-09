/**
 * Server-side page-size caps shared by the list resolvers and the GraphQL
 * complexity estimator, so the cost the limiter charges for a list field is the
 * number of rows the resolver can actually return.
 */

/** Most rows a list resolver returns when the caller gives no (or a huge) `take`. */
export const MAX_PAGE_SIZE = 1000;
/**
 * Bulk cap for `rooms` only: the public world map loads every (lightweight)
 * room in one request (~10k rooms today).
 */
export const MAX_BULK_PAGE_SIZE = 20000;

/** Per-root-field overrides of {@link MAX_PAGE_SIZE}. */
export const FIELD_PAGE_CAPS: Readonly<Record<string, number>> = {
  rooms: MAX_BULK_PAGE_SIZE,
};

/** Clamp a caller-supplied `take` to `[0, max]`; absent means "up to max". */
export function clampTake(
  take: number | null | undefined,
  max: number = MAX_PAGE_SIZE
): number {
  if (take === undefined || take === null || !Number.isFinite(take)) {
    return max;
  }
  return Math.min(Math.max(Math.trunc(take), 0), max);
}

/** Clamp `skip` to a non-negative integer. */
export function clampSkip(skip: number | null | undefined): number {
  if (skip === undefined || skip === null || !Number.isFinite(skip)) return 0;
  return Math.max(Math.trunc(skip), 0);
}
