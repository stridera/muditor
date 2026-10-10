/**
 * Round-trip metadata attached to each Blockly block (via `block.data`).
 *
 * The visual editor only knows about the fields declared by an Effect's
 * `default_params`. Stored ability effects carry many more override keys
 * (durationUnit, amount, breakOnDamage, multihit, boltCount, multipliers,
 * components, casterClassMultiplier, mobZone/mobId, ...). When a block is
 * loaded we remember the original params plus the value every field had right
 * after loading ("baseline"). When JSON is generated, untouched fields keep
 * their exact original value and unknown keys survive unchanged; only fields
 * the builder actually edited are overwritten.
 */

export interface BlockRoundTripData {
  /** Deep copy of the stored overrideParams as loaded from the API. */
  originalParams: Record<string, unknown>;
  /** Value of each editor field immediately after loading (stringified). */
  baseline: Record<string, string>;
  /** Stored trigger, kept when the dropdown cannot represent it. */
  trigger?: string | undefined;
  /** Stored chance percentage. */
  chancePct?: number | undefined;
  /** Stored Lua condition (not editable in the visual editor). */
  condition?: string | undefined;
}

export function cloneJson<T>(value: T): T {
  return value === undefined ? value : JSON.parse(JSON.stringify(value));
}

interface DataCarrier {
  data?: string | null;
}

export function writeBlockData(
  block: DataCarrier,
  data: BlockRoundTripData
): void {
  block.data = JSON.stringify(data);
}

export function readBlockData(block: DataCarrier): BlockRoundTripData | null {
  if (!block.data) return null;
  try {
    const parsed = JSON.parse(block.data) as BlockRoundTripData;
    if (parsed && typeof parsed === 'object' && parsed.originalParams) {
      return parsed;
    }
  } catch {
    // Not our metadata (or corrupted): treat as a freshly created block.
  }
  return null;
}

/**
 * Convert a value read from a Blockly field back to the type the stored param
 * had, so `5` does not silently become `"5"` and `true` does not become `"TRUE"`.
 */
export function coerceLike(original: unknown, value: unknown): unknown {
  if (original === undefined || original === null) return value;
  if (typeof original === 'boolean') {
    if (value === 'TRUE' || value === true) return true;
    if (value === 'FALSE' || value === false) return false;
    return value;
  }
  if (typeof original === 'number') {
    if (typeof value === 'string' && value.trim() !== '') {
      const n = Number(value);
      if (!Number.isNaN(n)) return n;
    }
    return value;
  }
  if (typeof original === 'object' && typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

export function stringifyFieldValue(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}
