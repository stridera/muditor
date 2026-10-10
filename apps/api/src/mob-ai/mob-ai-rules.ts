import { BadRequestException } from '@nestjs/common';

/**
 * Validation for mob AI rules (`ClassAiRules` and the rule columns of
 * `MobAbilities`). The grammar mirrors the Rust runtime parser
 * (`fierymud-rs/crates/mud-world/src/mob_ai_rules.rs`): keep both in step.
 */

/** Target selectors; `AUTO` leaves the choice to the ability's own targeting. */
export const AI_TARGETS = [
  'AUTO',
  'SELF',
  'TANK',
  'WEAKEST_ATTACKER',
  'CASTER',
  'MOST_BUFFED',
  'LOWEST_ALLY',
  'ROOM',
] as const;
export type AiTarget = (typeof AI_TARGETS)[number];

export const AI_ALIGNS = ['good', 'neutral', 'evil'] as const;
export const AI_LIFEFORCES = [
  'LIFE',
  'UNDEAD',
  'MAGIC',
  'CELESTIAL',
  'DEMONIC',
  'ELEMENTAL',
] as const;

export type ConditionKind =
  | 'bool' // true or false
  | 'flag' // true, or false meaning "no constraint"
  | 'percent' // integer 0..100
  | 'count' // integer >= 1, or true (= 2), or false (no constraint)
  | 'lifeforce'
  | 'align';

export const CONDITION_KEYS: Record<string, ConditionKind> = {
  in_combat: 'bool',
  out_of_combat: 'bool',
  self_hp_below: 'percent',
  target_hp_below: 'percent',
  ally_hp_below: 'percent',
  grouped_targets: 'count',
  target_casting: 'flag',
  target_has_buff: 'flag',
  self_has_debuff: 'flag',
  target_lifeforce: 'lifeforce',
  align: 'align',
  telegraph: 'flag',
};

export const RULE_LIMITS = {
  priority: { min: 0, max: 9999 },
  chancePct: { min: 0, max: 100 },
  cooldownS: { min: 0, max: 86_400 },
  minLevel: { min: 1, max: 105 },
  groupedTargets: { min: 1, max: 255 },
} as const;

/** Gap left between priorities when new rules are appended or renumbered. */
export const PRIORITY_STEP = 10;

function fail(message: string): never {
  throw new BadRequestException(message);
}

export function assertIntInRange(
  label: string,
  value: unknown,
  range: { min: number; max: number }
): number {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < range.min ||
    value > range.max
  ) {
    fail(
      `${label} must be a whole number from ${range.min} to ${range.max} (got ${String(value)})`
    );
  }
  return value;
}

/** Canonical target name, case-insensitive; `_`, `-` and spaces are equal. */
export function normalizeTarget(raw: string): AiTarget {
  const norm = raw
    .trim()
    .replace(/[-\s]+/g, '_')
    .toUpperCase();
  const hit = AI_TARGETS.find(t => t === norm);
  if (!hit) {
    fail(`Unknown target "${raw}". Valid targets: ${AI_TARGETS.join(', ')}`);
  }
  return hit;
}

function checkValue(key: string, kind: ConditionKind, value: unknown): void {
  const bad = (expected: string): never =>
    fail(`Condition "${key}" ${expected} (got ${JSON.stringify(value)})`);
  switch (kind) {
    case 'bool':
    case 'flag':
      if (typeof value !== 'boolean') bad('must be true or false');
      return;
    case 'percent':
      if (
        typeof value !== 'number' ||
        !Number.isInteger(value) ||
        value < 0 ||
        value > 100
      ) {
        bad('must be a whole percent from 0 to 100');
      }
      return;
    case 'count':
      if (typeof value === 'boolean') return;
      if (
        typeof value !== 'number' ||
        !Number.isInteger(value) ||
        value < RULE_LIMITS.groupedTargets.min ||
        value > RULE_LIMITS.groupedTargets.max
      ) {
        bad(
          `must be true, false, or a count from ${RULE_LIMITS.groupedTargets.min} to ${RULE_LIMITS.groupedTargets.max}`
        );
      }
      return;
    case 'lifeforce':
      if (
        typeof value !== 'string' ||
        !AI_LIFEFORCES.includes(
          value.trim().toUpperCase() as (typeof AI_LIFEFORCES)[number]
        )
      ) {
        bad(`must be one of ${AI_LIFEFORCES.join(', ')}`);
      }
      return;
    case 'align':
      if (
        typeof value !== 'string' ||
        !AI_ALIGNS.includes(
          value.trim().toLowerCase() as (typeof AI_ALIGNS)[number]
        )
      ) {
        bad(`must be one of ${AI_ALIGNS.join(', ')}`);
      }
      return;
  }
}

/**
 * Validate a `conditions` value for storage.
 *
 * Keys outside {@link CONDITION_KEYS} are rejected, except those listed in
 * `preservedKeys` (the keys already stored on the rule being edited): editing
 * must round-trip keys a newer runtime understands without this API knowing
 * them. Values of preserved unknown keys are passed through untouched.
 *
 * Returns the value to store: `null` for "no conditions".
 */
export function validateConditions(
  value: unknown,
  preservedKeys: Iterable<string> = []
): Record<string, unknown> | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'object' || Array.isArray(value)) {
    fail('conditions must be an object of condition keys, or null');
  }
  const preserved = new Set(preservedKeys);
  const entries = Object.entries(value as Record<string, unknown>);
  const unknown = entries
    .map(([k]) => k)
    .filter(k => !(k in CONDITION_KEYS) && !preserved.has(k));
  if (unknown.length > 0) {
    fail(
      `Unknown condition key${unknown.length > 1 ? 's' : ''}: ${unknown
        .map(k => `"${k}"`)
        .join(', ')}. Valid keys: ${Object.keys(CONDITION_KEYS).join(', ')}`
    );
  }
  for (const [key, v] of entries) {
    const kind = CONDITION_KEYS[key];
    if (kind) checkValue(key, kind, v);
  }
  return entries.length === 0 ? null : (value as Record<string, unknown>);
}

/** Keys of a stored `conditions` JSON value (empty for null / non-objects). */
export function storedConditionKeys(stored: unknown): string[] {
  return stored && typeof stored === 'object' && !Array.isArray(stored)
    ? Object.keys(stored)
    : [];
}
