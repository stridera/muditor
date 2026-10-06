/**
 * Strictly parse a numeric dynamic-route segment. Returns null for a missing,
 * array, non-numeric ("new", "abc") or partially numeric ("12abc") value so
 * callers can skip their query instead of sending `$id: Int!` as null.
 */
export function parseIntParam(
  value: string | string[] | undefined | null
): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}
