import { useCallback, useMemo } from 'react';
import type { AbilityEffectOutput } from '../generators/json-generator';
import {
  validateEffectList,
  type EffectCatalogEntry,
  type ValidationError,
} from '../effectValidation';

export type { ValidationError, EffectCatalogEntry };

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

/**
 * Hook for validating effects against the Effect catalog (types, enums,
 * ranges, required parameters); see `validateEffectList`.
 */
export function useEffectValidation(
  effects: AbilityEffectOutput[],
  catalog: EffectCatalogEntry[] | null = null
) {
  const validate = useCallback((): ValidationResult => {
    const all = validateEffectList(effects, catalog);
    const errors = all.filter(e => e.severity === 'error');
    const warnings = all.filter(e => e.severity === 'warning');
    return { valid: errors.length === 0, errors, warnings };
  }, [effects, catalog]);

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
