import fs from 'fs';
import path from 'path';

import {
  OBJECTIVE_TYPES,
  REWARD_TYPES,
  TRIGGER_TYPES,
} from '@/components/quests/quest-constants';

import { HELP_TOPICS, QUESTS_HELP_ANCHORS } from '../help-topics';
import { slugify } from '../slug';

const guide = HELP_TOPICS.quests.content;

describe('quests.md guide', () => {
  it('documents every objective type the editor offers', () => {
    // Same list the editor's objective-type <select> renders. Adding a type
    // there fails this test until the guide's objectives table covers it.
    expect(OBJECTIVE_TYPES.length).toBeGreaterThan(0);
    for (const { value, label } of OBJECTIVE_TYPES) {
      expect(guide).toContain(`\`${value}\``);
      expect(guide).toContain(label);
    }
  });

  it('documents every objective type in the database schema', () => {
    const schema = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../../../../../packages/db/prisma/schema.prisma'
      ),
      'utf8'
    );
    const body = /enum QuestObjectiveType \{([^}]*)\}/.exec(schema)?.[1] ?? '';
    const values = body
      .split('\n')
      .map(line => line.replace(/\/\/.*$/, '').trim())
      .filter(Boolean);

    expect(values.length).toBeGreaterThan(0);
    for (const value of values) {
      expect(guide).toContain(`\`${value}\``);
    }
    // The editor must offer exactly the schema's types.
    expect(OBJECTIVE_TYPES.map(t => t.value).sort()).toEqual(
      [...values].sort()
    );
  });

  it('documents every reward and trigger type the editor offers', () => {
    for (const { value, label } of [...REWARD_TYPES, ...TRIGGER_TYPES]) {
      expect(guide).toContain(`\`${value}\``);
      expect(guide).toContain(label);
    }
  });

  it('has a heading for every anchor the editor links to', () => {
    const slugs = guide
      .split('\n')
      .filter(line => /^#{1,6} /.test(line))
      .map(line => slugify(line.replace(/^#+ /, '')));

    for (const anchor of Object.values(QUESTS_HELP_ANCHORS)) {
      expect(slugs).toContain(anchor);
    }
    // Duplicate heading slugs would make anchors ambiguous.
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has the required top-level sections', () => {
    for (const heading of [
      'Overview',
      'Quick start',
      'Concepts',
      'Testing a quest',
      'Common mistakes',
      'Reference',
    ]) {
      expect(guide).toMatch(new RegExp(`^## ${heading}$`, 'm'));
    }
  });
});
