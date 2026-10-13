/**
 * Value vocabularies shared by the effect blocks and the Validate check.
 * Kept free of Blockly imports so validation can run (and be tested) without
 * a workspace.
 */

/** Units a duration can be expressed in. fierymud-rs maps minutes -> 60 s, rounds -> 4 s, hours -> 75 s. */
export const DURATION_UNIT_VALUES = [
  'hours',
  'minutes',
  'rounds',
  'seconds',
] as const;

/** Trigger labels the block dropdown offers. */
export const TRIGGER_VALUES = [
  'on_cast',
  'on_hit',
  'on_miss',
  'on_crit',
  'on_kill',
  'on_take_damage',
  'on_tick',
] as const;

/** Trigger labels found in imported content that the dropdown lacks. */
export const EXTRA_TRIGGER_VALUES = [
  'on_ally_attacked',
  'on_damage',
  'on_use',
  'passive',
] as const;

export const GATE_TYPES = [
  'check',
  'chance',
  'saving_throw',
  'attack_roll',
  'contest',
] as const;

export const RESOURCE_VALUES = ['hp', 'move'] as const;
