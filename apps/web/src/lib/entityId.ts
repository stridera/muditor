/**
 * Parse the id a builder typed for a new zone-scoped record (object, mob...).
 * Ids are non-negative integers (0 is valid); anything else returns null.
 */
export function parseEntityId(input: string | number): number | null {
  const text = String(input).trim();
  if (!/^\d+$/.test(text)) return null;
  const id = Number(text);
  return Number.isSafeInteger(id) ? id : null;
}
