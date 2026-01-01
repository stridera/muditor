import { useCallback, useMemo } from 'react';
import type { AbilityEffectOutput } from '../generators/json-generator';

/**
 * Effect type definitions based on Effects IDL v1
 */
interface EffectTypeSchema {
  id: number;
  name: string;
  category: string;
  requiredParams: string[];
  optionalParams: string[];
  paramValidators: Record<string, (value: unknown) => boolean>;
}

/**
 * Effect type schemas based on Effects IDL v1
 */
const EFFECT_SCHEMAS: Record<number, EffectTypeSchema> = {
  1: {
    id: 1,
    name: 'damage',
    category: 'damage',
    requiredParams: ['damageType', 'formula'],
    optionalParams: ['canCrit', 'ignoreArmor'],
    paramValidators: {
      damageType: v =>
        typeof v === 'string' && DAMAGE_TYPES.includes(v as string),
      formula: v => typeof v === 'string' && v.length > 0,
      canCrit: v => typeof v === 'boolean',
      ignoreArmor: v => typeof v === 'boolean',
    },
  },
  2: {
    id: 2,
    name: 'heal',
    category: 'damage',
    requiredParams: ['formula'],
    optionalParams: ['healType'],
    paramValidators: {
      formula: v => typeof v === 'string' && v.length > 0,
      healType: v =>
        typeof v === 'string' &&
        ['standard', 'regen', 'lifesteal'].includes(v as string),
    },
  },
  3: {
    id: 3,
    name: 'dot',
    category: 'damage',
    requiredParams: ['damageType', 'formula', 'tickInterval', 'duration'],
    optionalParams: [],
    paramValidators: {
      damageType: v =>
        typeof v === 'string' && DAMAGE_TYPES.includes(v as string),
      formula: v => typeof v === 'string' && v.length > 0,
      tickInterval: v => typeof v === 'number' && v > 0,
      duration: v => typeof v === 'number' && v > 0,
    },
  },
  10: {
    id: 10,
    name: 'stat_mod',
    category: 'stats',
    requiredParams: ['stat', 'modifier'],
    optionalParams: ['duration', 'stacking'],
    paramValidators: {
      stat: v => typeof v === 'string' && STAT_TYPES.includes(v as string),
      modifier: v => typeof v === 'number',
      duration: v => typeof v === 'number' && v >= 0,
      stacking: v =>
        typeof v === 'string' &&
        ['replace', 'stack', 'max', 'refresh'].includes(v as string),
    },
  },
  12: {
    id: 12,
    name: 'protection',
    category: 'protection',
    requiredParams: ['damageTypes', 'percentage'],
    optionalParams: ['duration'],
    paramValidators: {
      damageTypes: v =>
        typeof v === 'string' && DAMAGE_TYPES.includes(v as string),
      percentage: v => typeof v === 'number' && v > 0 && v <= 100,
      duration: v => typeof v === 'number' && v >= 0,
    },
  },
  24: {
    id: 24,
    name: 'resurrect',
    category: 'special',
    requiredParams: ['kind'],
    optionalParams: ['hpPercentage'],
    paramValidators: {
      kind: v =>
        typeof v === 'string' &&
        ['revive', 'raise', 'resurrection', 'true_resurrection'].includes(
          v as string
        ),
      hpPercentage: v => typeof v === 'number' && v > 0 && v <= 100,
    },
  },
};

const DAMAGE_TYPES = [
  'physical',
  'fire',
  'cold',
  'lightning',
  'acid',
  'poison',
  'holy',
  'unholy',
  'force',
  'psychic',
];

const STAT_TYPES = [
  'str',
  'dex',
  'con',
  'int',
  'wis',
  'cha',
  'acc',
  'damroll',
  'eva',
  'ward',
  'focus',
  'perception',
];

export interface ValidationError {
  effectIndex: number;
  effectId: number;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Validate a single effect against its schema
 */
function validateEffect(
  effect: AbilityEffectOutput,
  index: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const effectId = effect.effectId ?? 0;
  const schema = EFFECT_SCHEMAS[effectId];

  // Basic validation
  if (!effectId || effectId <= 0) {
    errors.push({
      effectIndex: index,
      effectId: effectId,
      field: 'effectId',
      message: 'Missing or invalid effect ID',
      severity: 'error',
    });
    return errors;
  }

  // Chance validation
  if (effect.chancePct < 0 || effect.chancePct > 100) {
    errors.push({
      effectIndex: index,
      effectId: effectId,
      field: 'chancePct',
      message: 'Chance must be between 0 and 100',
      severity: 'error',
    });
  }

  // Order validation
  if (effect.order < 0) {
    errors.push({
      effectIndex: index,
      effectId: effectId,
      field: 'order',
      message: 'Order must be non-negative',
      severity: 'error',
    });
  }

  // Schema-based validation
  if (schema) {
    const params = effect.overrideParams || {};

    // Check required params
    for (const requiredParam of schema.requiredParams) {
      if (!(requiredParam in params)) {
        errors.push({
          effectIndex: index,
          effectId: effectId,
          field: requiredParam,
          message: `Missing required parameter: ${requiredParam}`,
          severity: 'warning', // Warning since blocks have defaults
        });
      }
    }

    // Validate param values
    for (const [paramName, value] of Object.entries(params)) {
      const validator = schema.paramValidators[paramName];
      if (validator && !validator(value)) {
        errors.push({
          effectIndex: index,
          effectId: effectId,
          field: paramName,
          message: `Invalid value for ${paramName}: ${JSON.stringify(value)}`,
          severity: 'error',
        });
      }
    }
  }

  return errors;
}

/**
 * Hook for validating effects against Effects IDL v1
 */
export function useEffectValidation(effects: AbilityEffectOutput[]) {
  const validate = useCallback((): ValidationResult => {
    const allErrors: ValidationError[] = [];

    effects.forEach((effect, index) => {
      const effectErrors = validateEffect(effect, index);
      allErrors.push(...effectErrors);
    });

    const errors = allErrors.filter(e => e.severity === 'error');
    const warnings = allErrors.filter(e => e.severity === 'warning');

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }, [effects]);

  const validationResult = useMemo(() => validate(), [validate]);

  return {
    validate,
    ...validationResult,
  };
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string[] {
  return errors.map(error => {
    const prefix = error.severity === 'error' ? 'ERROR' : 'WARNING';
    return `[${prefix}] Effect #${error.effectIndex + 1} (ID: ${error.effectId}): ${error.message}`;
  });
}

export default useEffectValidation;
