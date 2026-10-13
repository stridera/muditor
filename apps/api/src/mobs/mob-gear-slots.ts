import { BadRequestException } from '@nestjs/common';

/**
 * Slot labels for `MobResetEquipment.wear_location`. The column is free text
 * and fierymud-rs reads it with `Slot::from_label_warn`: a NULL value means
 * the mob carries the item, a label it does not know (including the object
 * `WearFlag` names MAINHAND / OFFHAND / TWOHAND) leaves the item carried
 * instead of worn. These are the canonical labels (`Slot::db_label`).
 */
export const MOB_GEAR_SLOTS = [
  'HEAD',
  'EYES',
  'FACE',
  'EAR_LEFT',
  'EAR_RIGHT',
  'NECK',
  'NECK_2',
  'ABOUT',
  'BODY',
  'ARMS',
  'WRIST_LEFT',
  'WRIST_RIGHT',
  'HANDS',
  'FINGER_LEFT',
  'FINGER_RIGHT',
  'WAIST',
  'BELT',
  'LEGS',
  'FEET',
  'WIELD',
  'HOLD',
  'LIGHT',
  'HOVER',
  'BADGE',
] as const;

/** Older labels the game still resolves; present in imported legacy rows. */
export const MOB_GEAR_SLOT_ALIASES = [
  'EAR',
  'EARS',
  'LEAR',
  'REAR',
  'NECK_1',
  'WRIST',
  'WRIST_L',
  'WRIST_R',
  'FINGER_L',
  'FINGER_R',
  'WIELD2',
  'TWO_HAND_WIELD',
  'HOLD2',
  'SHIELD',
  'OBELT',
] as const;

/** Every label the game understands (what the API accepts on write). */
export const MOB_GEAR_SLOT_LABELS: readonly string[] = [
  ...MOB_GEAR_SLOTS,
  ...MOB_GEAR_SLOT_ALIASES,
];

const MESSAGE =
  'wearLocation must be one of the mob gear slots (' +
  MOB_GEAR_SLOTS.join(', ') +
  '), or null for carried';

/**
 * Validate a gear slot from a mutation argument. `null` / `undefined` pass
 * through (carried); an empty string is rejected, not coerced, so a client
 * bug cannot store a blank label.
 */
export function assertMobGearSlot(
  value: string | null | undefined
): string | null | undefined {
  if (value === null || value === undefined) return value;
  if (!MOB_GEAR_SLOT_LABELS.includes(value)) {
    throw new BadRequestException(MESSAGE);
  }
  return value;
}

export const MOB_GEAR_SLOT_MESSAGE = MESSAGE;
