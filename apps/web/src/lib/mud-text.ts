// Helpers for displaying legacy MUD text on the public site.

// Colour/format markup used in stored help text and names, e.g. `<b:red>`,
// `<cyan>`, `</>`. Placeholder tokens like `<victim>` are deliberately kept.
const COLOR_TAG =
  /<\/>|<(?:(?:b|u|dim|bold):)?(?:black|red|green|yellow|blue|magenta|cyan|white)>|<bg-[a-z:]+>|<\/?[bui]>|<hr>/g;

export function stripMudMarkup(text: string): string {
  return text.replace(COLOR_TAG, '');
}

/** Whether `slug` maps to one of the given race enum values. */
export function findRaceBySlug<T extends { race: string }>(
  races: T[],
  slug: string
): T | undefined {
  const value = slugToRace(slug);
  return races.find(r => r.race === value);
}

/** Race enum value (HALF_ELF) -> URL segment (half-elf). */
export function raceToSlug(race: string): string {
  return race.toLowerCase().replace(/_/g, '-');
}

/** URL segment (half-elf) -> race enum value (HALF_ELF). */
export function slugToRace(slug: string): string {
  return slug.toUpperCase().replace(/-/g, '_');
}

export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Class plain name (Anti-Paladin) -> URL segment (anti-paladin). */
export function nameToSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '-');
}
