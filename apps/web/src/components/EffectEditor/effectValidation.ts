import type { AbilityEffectOutput } from './generators/json-generator';
import {
  DURATION_UNIT_VALUES,
  EXTRA_TRIGGER_VALUES,
  GATE_TYPES,
  RESOURCE_VALUES,
  TRIGGER_VALUES,
} from './effect-vocab';

/** The slice of an Effect row the check needs (`Effect.default_params` is its param schema). */
export interface EffectCatalogEntry {
  id: number;
  name: string;
  defaultParams?: Record<string, unknown> | null;
}

export interface ValidationError {
  effectIndex: number;
  effectId: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

const FORMULA_KEYS = new Set([
  'amount',
  'duration',
  'chance',
  'power',
  'level',
  'hours',
  'percent',
  'distance',
  'boltCount',
  'powerRoll',
  'damageOnMovement',
  'maxObjectLevel',
  'maxObjectWeight',
  'scaling',
]);

/** Numbers that must not be negative. */
const NON_NEGATIVE_KEYS = new Set([
  'duration',
  'decay',
  'distance',
  'maxCount',
  'maxCircle',
  'hp',
  'interval',
  'hunger',
  'thirst',
  'refreshAfter',
]);
/** 0..100 */
const PERCENT_KEYS = new Set(['percent', 'chance', 'percentage']);
/** 0..1 */
const FRACTION_KEYS = new Set(['hpPercent', 'expPenalty']);

/** Parameters worth a warning when absent (the Effect default fills them in). */
const EXPECTED_PARAMS: Record<string, string[]> = {
  damage: ['amount'],
  heal: ['amount'],
  status: ['flag'],
  modify: ['target'],
};

const FORMULA_CHARS = /^[\w.\s+\-*/%(),<>=!&|?:'"]+$/;
const NOT_A_NUMBER = /\b(nan|infinity|undefined|null)\b/i;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Dice / arithmetic / function-call formula text such as "10d35 + pow(skill, 1.5)". */
function formulaProblem(text: string): string | null {
  const s = text.trim();
  if (s === '') return 'is empty';
  if (NOT_A_NUMBER.test(s)) return 'is not a number or formula';
  let depth = 0;
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')' && --depth < 0) return 'has unbalanced parentheses';
  }
  return depth === 0 ? null : 'has unbalanced parentheses';
}

function typeName(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'a list';
  return typeof v === 'object' ? 'an object' : `a ${typeof v}`;
}

function checkParams(
  params: Record<string, unknown>,
  catalog: EffectCatalogEntry | undefined,
  push: (
    field: string,
    message: string,
    severity?: 'error' | 'warning'
  ) => void,
  prefix: string
): void {
  const defaults = catalog?.defaultParams ?? {};
  const effectName = catalog?.name;

  for (const [key, value] of Object.entries(params)) {
    const field = prefix + key;

    if (typeof value === 'number' && !Number.isFinite(value)) {
      push(field, `${key} must be a finite number`);
      continue;
    }

    if (typeof value === 'number') {
      if (NON_NEGATIVE_KEYS.has(key) && value < 0) {
        push(field, `${key} cannot be negative (got ${value})`);
      }
      if (PERCENT_KEYS.has(key) && (value < 0 || value > 100)) {
        push(field, `${key} must be between 0 and 100 (got ${value})`);
      }
      if (FRACTION_KEYS.has(key) && (value < 0 || value > 1)) {
        push(field, `${key} must be between 0 and 1 (got ${value})`);
      }
    }

    if (typeof value === 'string') {
      if (FORMULA_KEYS.has(key)) {
        const problem = formulaProblem(value);
        if (problem) {
          push(field, `${key} ${problem} (got ${JSON.stringify(value)})`);
        } else if (!FORMULA_CHARS.test(value.trim())) {
          push(
            field,
            `${key} has characters the formula grammar does not support (got ${JSON.stringify(value)})`,
            'warning'
          );
        }
      } else if (/^\s*(nan|infinity|undefined|null)\s*$/i.test(value)) {
        push(field, `${key} has an invalid value (${JSON.stringify(value)})`);
      }
    }

    if (key === 'durationUnit') {
      if (
        typeof value !== 'string' ||
        !(DURATION_UNIT_VALUES as readonly string[]).includes(value)
      ) {
        push(
          field,
          `durationUnit must be one of ${DURATION_UNIT_VALUES.join(', ')} (got ${JSON.stringify(value)})`
        );
      }
    }
    if (
      key === 'resource' &&
      (effectName === 'heal' || effectName === 'damage') &&
      (typeof value !== 'string' ||
        !(RESOURCE_VALUES as readonly string[]).includes(value))
    ) {
      push(
        field,
        `resource must be one of ${RESOURCE_VALUES.join(', ')} (got ${JSON.stringify(value)})`
      );
    }

    // Type against the effect's default_params (its parameter schema).
    if (Object.prototype.hasOwnProperty.call(defaults, key)) {
      const expected = defaults[key];
      let mismatch = false;
      if (typeof expected === 'boolean') mismatch = typeof value !== 'boolean';
      else if (typeof expected === 'number')
        mismatch = typeof value !== 'number' && typeof value !== 'string';
      else if (typeof expected === 'string')
        mismatch =
          typeof value !== 'string' &&
          typeof value !== 'number' &&
          !Array.isArray(value);
      else if (Array.isArray(expected)) mismatch = !Array.isArray(value);
      else if (isRecord(expected)) mismatch = !isRecord(value);
      if (mismatch) {
        push(
          field,
          `${key} should be ${typeName(expected).replace('a number', 'a number or formula')}, not ${typeName(value)}`
        );
      }
    }
  }

  const components = params['components'];
  if (Array.isArray(components)) {
    let total = 0;
    components.forEach((c, i) => {
      const pct = isRecord(c) ? c['percent'] : undefined;
      if (typeof pct !== 'number' || !Number.isFinite(pct) || pct < 0) {
        push(
          `${prefix}components[${i}]`,
          `components[${i}].percent must be a non-negative number`
        );
      } else {
        total += pct;
      }
    });
    if (components.length > 0 && Math.abs(total - 100) > 0.001) {
      push(
        `${prefix}components`,
        `components add up to ${total}%, should be 100%`,
        'warning'
      );
    }
  }

  for (const key of (effectName && EXPECTED_PARAMS[effectName]) || []) {
    if (!(key in params)) {
      push(
        prefix + key,
        `${key} is not set; the effect default will be used`,
        'warning'
      );
    }
  }
}

function validateOne(
  effect: AbilityEffectOutput,
  index: number,
  catalog: Map<number, EffectCatalogEntry> | null,
  prefix: string,
  out: ValidationError[]
): void {
  const effectId = effect.effectId ?? 0;
  const push = (
    field: string,
    message: string,
    severity: 'error' | 'warning' = 'error'
  ) =>
    out.push({
      effectIndex: index,
      effectId,
      field,
      message:
        prefix && !message.startsWith(prefix)
          ? `${prefix} ${message}`
          : message,
      severity,
    });
  const label = (f: string) => prefix + f;

  const isGate = effect.gateType !== undefined && effect.effectId === undefined;
  if (isGate) {
    if (!(GATE_TYPES as readonly string[]).includes(effect.gateType!)) {
      push(label('gateType'), `Unknown gate type: ${String(effect.gateType)}`);
    }
  } else if (
    typeof effect.effectId !== 'number' ||
    !Number.isInteger(effect.effectId) ||
    effect.effectId <= 0
  ) {
    push(label('effectId'), 'Missing or invalid effect ID');
    return;
  } else if (catalog && !catalog.has(effect.effectId)) {
    push(label('effectId'), `Unknown effect ID: ${effect.effectId}`);
  }

  if (
    typeof effect.chancePct !== 'number' ||
    !Number.isFinite(effect.chancePct) ||
    effect.chancePct < 0 ||
    effect.chancePct > 100
  ) {
    push(label('chancePct'), 'Chance must be between 0 and 100');
  }
  if (
    typeof effect.order !== 'number' ||
    !Number.isInteger(effect.order) ||
    effect.order < 0
  ) {
    push(label('order'), 'Order must be a non-negative whole number');
  }
  if (effect.trigger !== undefined && effect.trigger !== null) {
    const known: readonly string[] = [
      ...TRIGGER_VALUES,
      ...EXTRA_TRIGGER_VALUES,
    ];
    if (typeof effect.trigger !== 'string' || !known.includes(effect.trigger)) {
      push(
        label('trigger'),
        `Unknown trigger ${JSON.stringify(effect.trigger)} (use one of ${known.join(', ')})`
      );
    }
  }
  if (
    effect.condition !== undefined &&
    effect.condition !== null &&
    typeof effect.condition !== 'string'
  ) {
    push(label('condition'), 'Condition must be text');
  }

  const rawParams = effect.overrideParams;
  if (rawParams !== undefined && rawParams !== null && !isRecord(rawParams)) {
    push(label('overrideParams'), 'Parameters must be an object');
    return;
  }
  const params = rawParams ?? {};
  const entry = isGate ? undefined : catalog?.get(effect.effectId!);
  if (isGate) {
    const pct = params['percentage'];
    if (typeof pct === 'number' && (pct < 0 || pct > 100)) {
      push(label('percentage'), 'percentage must be between 0 and 100');
    }
  } else {
    checkParams(params, entry, push, prefix);
  }

  // Gate branches hold nested effects.
  for (const branch of ['onPass', 'onFail']) {
    const nested = params[branch];
    if (nested === undefined) continue;
    if (!Array.isArray(nested)) {
      push(label(branch), `${branch} must be a list of effects`);
      continue;
    }
    nested.forEach((child, i) =>
      validateOne(
        child as AbilityEffectOutput,
        index,
        catalog,
        `${prefix}${branch}[${i}].`,
        out
      )
    );
  }
}

/**
 * Check every effect and gate against the Effect catalog: known effect ID,
 * parameter types (from the Effect's `default_params`), closed vocabularies
 * (duration unit, trigger, resource), numeric ranges and formula text.
 * `catalog` null skips the "known effect" and type checks (not loaded yet).
 */
export function validateEffectList(
  effects: AbilityEffectOutput[],
  catalog: EffectCatalogEntry[] | null
): ValidationError[] {
  const byId = catalog ? new Map(catalog.map(e => [e.id, e])) : null;
  const out: ValidationError[] = [];
  effects.forEach((effect, i) => {
    if (!isRecord(effect)) {
      out.push({
        effectIndex: i,
        effectId: 0,
        field: 'effect',
        message: 'Each entry must be an object',
        severity: 'error',
      });
      return;
    }
    validateOne(effect, i, byId, '', out);
  });
  return out;
}
