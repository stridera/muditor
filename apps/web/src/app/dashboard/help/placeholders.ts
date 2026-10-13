/**
 * Example text for the create dialog. Sphere and Duration only mean something
 * for spells, chants and skills; other categories get neutral examples so the
 * form does not suggest `cast 'fireball'` for a race or guide entry.
 */
export interface HelpPlaceholders {
  title: string;
  keywords: string;
  sphere: string;
  duration: string;
  usage: string;
}

const SPELL_LIKE: HelpPlaceholders = {
  title: 'e.g., Fireball',
  keywords: 'e.g., fireball, fire ball, fire',
  sphere: 'e.g., fire',
  duration: 'e.g., Instant',
  usage: "e.g., cast 'fireball' <target>",
};

const BY_CATEGORY: Record<string, HelpPlaceholders> = {
  spell: SPELL_LIKE,
  chant: {
    ...SPELL_LIKE,
    title: 'e.g., Chant of Renewal',
    keywords: 'e.g., renewal, chant of renewal',
    usage: "e.g., chant 'renewal'",
  },
  skill: {
    title: 'e.g., Backstab',
    keywords: 'e.g., backstab, stab',
    sphere: 'Spells only',
    duration: 'Spells only',
    usage: 'e.g., backstab <target>',
  },
  command: {
    title: 'e.g., Look',
    keywords: 'e.g., look, l, examine',
    sphere: 'Spells only',
    duration: 'Spells only',
    usage: 'e.g., look [target]',
  },
};

const GENERIC: HelpPlaceholders = {
  title: 'e.g., Getting Started',
  keywords: 'e.g., newbie, start, basics',
  sphere: 'Spells only',
  duration: 'Spells only',
  usage: 'Optional: how to use it in game',
};

export function helpPlaceholders(
  category: string | null | undefined
): HelpPlaceholders {
  return BY_CATEGORY[(category ?? '').toLowerCase()] ?? GENERIC;
}
