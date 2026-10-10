import type { AbilityEffectOutput } from './json-generator';

export interface AbilityEffectSaveInput {
  effectId: number;
  overrideParams: Record<string, unknown>;
  order: number;
  trigger: string | null;
  chancePct: number;
  condition: string | null;
}

export interface EffectSavePlan {
  /** Rows to send, in order. */
  effects: AbilityEffectSaveInput[];
  /** Top-level gates cannot be stored (AbilityEffect.effectId is required). */
  gateCount: number;
  /** True when the edited list is identical to what was loaded. */
  unchanged: boolean;
}

function normalise(effect: AbilityEffectOutput): AbilityEffectSaveInput {
  return {
    effectId: effect.effectId!,
    overrideParams: effect.overrideParams ?? {},
    order: effect.order,
    trigger: effect.trigger ?? null,
    chancePct: effect.chancePct,
    condition: effect.condition ?? null,
  };
}

/** Key-order-insensitive JSON for deep comparison. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v) => {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      return Object.fromEntries(
        Object.entries(v as Record<string, unknown>).sort(([a], [b]) =>
          a < b ? -1 : a > b ? 1 : 0
        )
      );
    }
    return v;
  });
}

/**
 * Build the updateAbilityEffects payload. Gates have no effectId and the
 * AbilityEffect table cannot hold them, so they are counted instead of being
 * silently dropped; the caller must refuse to save when `gateCount > 0`.
 */
export function planEffectSave(
  edited: AbilityEffectOutput[],
  original: AbilityEffectOutput[]
): EffectSavePlan {
  const gateCount = edited.filter(e => e.effectId == null).length;
  const effects = edited.filter(e => e.effectId != null).map(normalise);
  const originalNormalised = original
    .filter(e => e.effectId != null)
    .map(normalise);
  return {
    effects,
    gateCount,
    unchanged:
      gateCount === 0 && canonical(effects) === canonical(originalNormalised),
  };
}
