/**
 * Helpers shared by the server-side paged list queries (mobs, objects, ...).
 */

const MAX_SEARCH_TOKENS = 6;
const MAX_TOKEN_LENGTH = 100;

/**
 * Split a list-search box value into AND-ed terms. Whitespace separates terms;
 * a fully quoted value ("a b") is one exact phrase. Blank input yields none.
 */
export function searchTokens(search: string | null | undefined): string[] {
  const text = search?.trim();
  if (!text) return [];
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    const phrase = text.slice(1, -1).trim();
    return phrase ? [phrase.slice(0, MAX_TOKEN_LENGTH)] : [];
  }
  return text
    .replace(/"/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_SEARCH_TOKENS)
    .map(t => t.slice(0, MAX_TOKEN_LENGTH));
}

/** `id` of an all-digits term, so "45" also finds entity 45. */
export function numericIdToken(term: string): number | null {
  return /^\d{1,9}$/.test(term) ? Number(term) : null;
}

/** Normalise a caller-supplied sort direction; anything unknown is ascending. */
export function sortDirection(dir: string | null | undefined): 'asc' | 'desc' {
  return dir?.toLowerCase() === 'desc' ? 'desc' : 'asc';
}

/** Prisma int range filter, or undefined when both bounds are absent. */
export function intRange(
  min: number | null | undefined,
  max: number | null | undefined
): { gte?: number; lte?: number } | undefined {
  const range: { gte?: number; lte?: number } = {};
  if (min != null && Number.isFinite(min)) range.gte = Math.trunc(min);
  if (max != null && Number.isFinite(max)) range.lte = Math.trunc(max);
  return range.gte === undefined && range.lte === undefined ? undefined : range;
}
