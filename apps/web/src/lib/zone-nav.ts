/**
 * Sidebar paths whose pages filter by `?zone=`. A link to one of these carries
 * the remembered zone so the filter survives navigation from other sections.
 */
export const ZONE_SCOPED_PATHS: readonly string[] = [
  '/dashboard/rooms',
  '/dashboard/mobs',
  '/dashboard/objects',
  '/dashboard/shops',
  '/dashboard/quests',
];

/** Append `?zone=<zone>` to zone-scoped hrefs; other hrefs are unchanged. */
export function hrefWithZone(href: string, zone: number | null): string {
  if (zone == null || !ZONE_SCOPED_PATHS.includes(href)) return href;
  return `${href}?zone=${zone}`;
}

/** Zone to pre-fill a new entity with: a valid `?zone=` value, else `fallback`. */
export function newEntityZone(
  param: string | null | undefined,
  fallback: number
): number {
  const n = parseInt(param ?? '', 10);
  return Number.isNaN(n) || n < 0 ? fallback : n;
}
