/**
 * Mob AI rule conditions (the `conditions` JSON of ClassAiRules / MobAbilities).
 *
 * The key set mirrors the runtime parser (fierymud-rs `mob_ai_rules.rs`) and
 * the API validator (`apps/api/src/mob-ai/mob-ai-rules.ts`). Edits are
 * MERGED into the stored object, never rebuilt from the form: keys this editor
 * does not model, and values it cannot show (for example `target_casting:
 * false`), survive a save untouched. Same lesson as the effect editor
 * round-trip fix.
 */

export type ConditionsJson = Record<string, unknown>;

export const AI_TARGET_OPTIONS = [
  { value: 'AUTO', label: 'Auto (ability default)' },
  { value: 'SELF', label: 'Self' },
  { value: 'TANK', label: 'Tank (who the enemies fight)' },
  { value: 'WEAKEST_ATTACKER', label: 'Weakest attacker' },
  { value: 'CASTER', label: 'Caster' },
  { value: 'MOST_BUFFED', label: 'Most buffed enemy' },
  { value: 'LOWEST_ALLY', label: 'Lowest-HP ally' },
  { value: 'ROOM', label: 'Whole room' },
] as const;

/**
 * Canonical selector for a stored target. Seeded rows are lowercase
 * (`weakest_attacker`); the GraphQL enum and the dialog select want uppercase.
 * Null / empty means AUTO; unrecognised values are returned normalised so they
 * stay visible instead of being silently rewritten.
 */
export function normalizeAiTarget(raw: string | null | undefined): string {
  const norm = (raw ?? '')
    .trim()
    .replace(/[-\s]+/g, '_')
    .toUpperCase();
  return norm === '' ? 'AUTO' : norm;
}

export const AI_LIFEFORCES = [
  'LIFE',
  'UNDEAD',
  'MAGIC',
  'CELESTIAL',
  'DEMONIC',
  'ELEMENTAL',
] as const;
export const AI_ALIGNS = ['good', 'neutral', 'evil'] as const;

export const RULE_LIMITS = {
  priority: { min: 0, max: 9999 },
  chancePct: { min: 0, max: 100 },
  cooldownS: { min: 0, max: 86_400 },
  minLevel: { min: 1, max: 105 },
  groupedTargets: { min: 1, max: 255 },
} as const;

export type CombatState = 'any' | 'in' | 'out';

/** What the editor shows. `undefined` / 'any' means "no constraint". */
export interface ConditionForm {
  combat: CombatState;
  selfHpBelow: number | undefined;
  targetHpBelow: number | undefined;
  allyHpBelow: number | undefined;
  groupedTargets: number | undefined;
  targetCasting: boolean;
  targetHasBuff: boolean;
  selfHasDebuff: boolean;
  telegraph: boolean;
  cooldownGroup: string | undefined;
  targetLifeforce: string | undefined;
  align: string | undefined;
}

export const EMPTY_FORM: ConditionForm = {
  combat: 'any',
  selfHpBelow: undefined,
  targetHpBelow: undefined,
  allyHpBelow: undefined,
  groupedTargets: undefined,
  targetCasting: false,
  targetHasBuff: false,
  selfHasDebuff: false,
  telegraph: false,
  cooldownGroup: undefined,
  targetLifeforce: undefined,
  align: undefined,
};

/** Keys the editor owns; everything else is carried through unchanged. */
export const KNOWN_CONDITION_KEYS = [
  'in_combat',
  'out_of_combat',
  'self_hp_below',
  'target_hp_below',
  'ally_hp_below',
  'grouped_targets',
  'target_casting',
  'target_has_buff',
  'self_has_debuff',
  'telegraph',
  'cooldown_group',
  'target_lifeforce',
  'align',
] as const;

const KNOWN = new Set<string>(KNOWN_CONDITION_KEYS);

export function asConditionsObject(value: unknown): ConditionsJson {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as ConditionsJson)
    : {};
}

/** Keys present in the stored conditions that the editor does not model. */
export function extraConditionKeys(value: unknown): string[] {
  return Object.keys(asConditionsObject(value)).filter(k => !KNOWN.has(k));
}

function pct(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

/** Read the stored JSON into editor state. */
export function conditionsToForm(value: unknown): ConditionForm {
  const c = asConditionsObject(value);
  // in_combat:true and out_of_combat:false both mean "in combat", and vice versa.
  let combat: CombatState = 'any';
  if (c.in_combat === true || c.out_of_combat === false) combat = 'in';
  if (c.out_of_combat === true || c.in_combat === false) combat = 'out';

  let grouped: number | undefined;
  if (c.grouped_targets === true) grouped = 2;
  else if (typeof c.grouped_targets === 'number') grouped = c.grouped_targets;

  return {
    combat,
    selfHpBelow: pct(c.self_hp_below),
    targetHpBelow: pct(c.target_hp_below),
    allyHpBelow: pct(c.ally_hp_below),
    groupedTargets: grouped,
    targetCasting: c.target_casting === true,
    targetHasBuff: c.target_has_buff === true,
    selfHasDebuff: c.self_has_debuff === true,
    telegraph: c.telegraph === true,
    cooldownGroup:
      typeof c.cooldown_group === 'string' && c.cooldown_group.trim() !== ''
        ? c.cooldown_group.trim()
        : undefined,
    targetLifeforce:
      typeof c.target_lifeforce === 'string'
        ? c.target_lifeforce.toUpperCase()
        : undefined,
    align: typeof c.align === 'string' ? c.align.toLowerCase() : undefined,
  };
}

function same<K extends keyof ConditionForm>(
  a: ConditionForm,
  b: ConditionForm,
  k: K
): boolean {
  return a[k] === b[k];
}

/**
 * Merge editor state into the stored conditions.
 *
 * Only fields the user actually changed (form differs from what the stored
 * value reads as) are written; every other key and value is copied through
 * verbatim, including keys unknown to this editor. Returns null when the
 * result is empty ("always").
 */
export function applyConditionEdits(
  original: unknown,
  next: ConditionForm
): ConditionsJson | null {
  const base = asConditionsObject(original);
  const was = conditionsToForm(original);
  const out: ConditionsJson = { ...base };

  const setOrDrop = (key: string, value: unknown) => {
    if (value === undefined || value === false) delete out[key];
    else out[key] = value;
  };

  if (!same(was, next, 'combat')) {
    delete out.in_combat;
    delete out.out_of_combat;
    if (next.combat === 'in') out.in_combat = true;
    if (next.combat === 'out') out.out_of_combat = true;
  }
  if (!same(was, next, 'selfHpBelow'))
    setOrDrop('self_hp_below', next.selfHpBelow);
  if (!same(was, next, 'targetHpBelow'))
    setOrDrop('target_hp_below', next.targetHpBelow);
  if (!same(was, next, 'allyHpBelow'))
    setOrDrop('ally_hp_below', next.allyHpBelow);
  if (!same(was, next, 'groupedTargets'))
    setOrDrop('grouped_targets', next.groupedTargets);
  if (!same(was, next, 'targetCasting'))
    setOrDrop('target_casting', next.targetCasting);
  if (!same(was, next, 'targetHasBuff'))
    setOrDrop('target_has_buff', next.targetHasBuff);
  if (!same(was, next, 'selfHasDebuff'))
    setOrDrop('self_has_debuff', next.selfHasDebuff);
  if (!same(was, next, 'telegraph')) setOrDrop('telegraph', next.telegraph);
  if (!same(was, next, 'cooldownGroup'))
    setOrDrop('cooldown_group', next.cooldownGroup?.trim() || undefined);
  if (!same(was, next, 'targetLifeforce'))
    setOrDrop('target_lifeforce', next.targetLifeforce);
  if (!same(was, next, 'align')) setOrDrop('align', next.align);

  return Object.keys(out).length === 0 ? null : out;
}

/** Drop one unknown key (the editor's "remove" button on preserved keys). */
export function removeConditionKey(
  original: unknown,
  key: string
): ConditionsJson | null {
  const out = { ...asConditionsObject(original) };
  delete out[key];
  return Object.keys(out).length === 0 ? null : out;
}

/** One-line human summary of a rule's conditions for list rows. */
export function summarizeConditions(value: unknown): string {
  const c = asConditionsObject(value);
  const form = conditionsToForm(value);
  const parts: string[] = [];
  if (form.combat === 'in') parts.push('in combat');
  if (form.combat === 'out') parts.push('out of combat');
  if (form.selfHpBelow !== undefined)
    parts.push(`self HP < ${form.selfHpBelow}%`);
  if (form.targetHpBelow !== undefined)
    parts.push(`target HP < ${form.targetHpBelow}%`);
  if (form.allyHpBelow !== undefined)
    parts.push(`ally HP < ${form.allyHpBelow}%`);
  if (form.groupedTargets !== undefined)
    parts.push(`${form.groupedTargets}+ enemies`);
  if (form.targetCasting) parts.push('target casting');
  if (form.targetHasBuff) parts.push('target buffed');
  if (form.selfHasDebuff) parts.push('self debuffed');
  if (form.telegraph) parts.push('telegraphed');
  if (form.cooldownGroup) parts.push(`cooldown group ${form.cooldownGroup}`);
  if (form.targetLifeforce) parts.push(`target ${form.targetLifeforce}`);
  if (form.align) parts.push(`${form.align} alignment`);
  const extras = extraConditionKeys(c);
  if (extras.length > 0) parts.push(`+${extras.length} other`);
  return parts.length > 0 ? parts.join(', ') : 'always';
}
