import questsGuide from '@/content/help/quests.md';

/**
 * Registry of help guides. To add a guide for another editor (mobs, objects,
 * zones, shops), drop a markdown file in src/content/help, import it here and
 * add an entry. `HelpButton` / `HelpDrawer` work for any registered topic.
 */
export const HELP_TOPICS = {
  quests: {
    title: 'Quest builder guide',
    content: questsGuide,
  },
} as const;

export type HelpTopic = keyof typeof HELP_TOPICS;

/**
 * Anchors (heading slugs) the quest editor links to. A test checks that each
 * one matches a heading in quests.md, so renaming a heading breaks CI instead
 * of silently breaking the `?` icons.
 */
export const QUESTS_HELP_ANCHORS = {
  offering: 'offering-a-quest',
  requirements: 'prerequisites-and-requirements',
  availability: 'availability-requirement',
  phases: 'phases',
  objectives: 'objectives',
  rewards: 'rewards',
  repeatable: 'repeatable-cooldown-and-time-limits',
  customLua: 'custom-lua',
} as const;
