/**
 * Combat dice formulas ported from FieryMUD legacy C++ code.
 * These calculate default HP and damage dice based on level, race, and class.
 *
 * The legacy MUD stores dice MODIFIERS in mob files, not absolute values.
 * Base dice are calculated from level with race/class factors applied.
 */

/**
 * Race dice factors - determines base damage scaling by race.
 * Higher values = more physical damage focus.
 * Values from legacy/src/races.cpp
 */
export const RACE_DICE_FACTORS: Record<string, number> = {
  // Player races
  HUMAN: 100,
  ELF: 80,
  DWARF: 100,
  HALFLING: 80,
  GNOME: 75,
  TROLL: 120,
  DROW: 80,
  OGRE: 120,
  ORC: 100,
  HALF_ELF: 90,
  HALF_ORC: 100,
  GOLIATH: 110,
  DUERGAR: 100,
  SVERFNEBLIN: 90,
  NYMPH: 70,
  DRAGONBORN: 100,
  DRAGONBORN_FIRE: 100,
  DRAGONBORN_FROST: 100,
  DRAGONBORN_ACID: 100,
  DRAGONBORN_LIGHTNING: 100,
  DRAGONBORN_GAS: 100,
  // Monster races
  HUMANOID: 100,
  ANIMAL: 100,
  UNDEAD: 100,
  DRAGON: 120,
  DRAGON_GENERAL: 120,
  DRAGON_FIRE: 120,
  DRAGON_FROST: 120,
  DRAGON_ACID: 120,
  DRAGON_LIGHTNING: 120,
  DRAGON_GAS: 120,
  GIANT: 120,
  DEMON: 110,
  ELEMENTAL: 100,
  PLANT: 80,
  FAERIE: 70,
  CELESTIAL: 100,
  ABERRATION: 100,
  GOLEM: 120,
  GOBLIN: 80,
  INSECT: 80,
  FISH: 60,
  BROWNIE: 70,
  OTHER: 100,
};

/**
 * Class dice factors - determines base damage scaling by class.
 * Higher values = more physical damage focus.
 * Values from legacy/src/class.cpp
 */
export const CLASS_DICE_FACTORS: Record<string, number> = {
  // Melee classes (high damage)
  WARRIOR: 120,
  PALADIN: 120,
  ANTI_PALADIN: 120,
  MERCENARY: 120,
  BERSERKER: 120,
  // Hybrid classes
  RANGER: 100,
  MONK: 100,
  ROGUE: 100,
  THIEF: 100,
  ASSASSIN: 100,
  HUNTER: 100,
  // Caster classes (low physical damage)
  SORCERER: 80,
  CLERIC: 80,
  DRUID: 80,
  SHAMAN: 80,
  NECROMANCER: 80,
  CONJURER: 80,
  BARD: 80,
  PYROMANCER: 80,
  CRYOMANCER: 80,
  ILLUSIONIST: 80,
  PRIEST: 80,
  DIABOLIST: 80,
  MYSTIC: 80,
  // Default
  LAYMAN: 100,
};

/**
 * Get the dice factor for a race.
 * @param race - The race name (case-insensitive)
 * @returns The dice factor (default 100 if unknown)
 */
export function getRaceDiceFactor(race: string): number {
  return RACE_DICE_FACTORS[race.toUpperCase()] ?? 100;
}

/**
 * Get the dice factor for a class.
 * @param className - The class name (case-insensitive)
 * @returns The dice factor (default 100 if unknown)
 */
export function getClassDiceFactor(className: string): number {
  return CLASS_DICE_FACTORS[className.toUpperCase()] ?? 100;
}

/**
 * Calculate the combined dice factor from race and class.
 * Uses the average of race and class factors.
 * @param raceFactor - The race dice factor (50-150)
 * @param classFactor - The class dice factor (50-150)
 * @returns Combined factor (50-150)
 */
export function getCombinedDiceFactor(
  raceFactor: number,
  classFactor: number
): number {
  return Math.floor((raceFactor + classFactor) / 2);
}

/**
 * Calculate base HP dice (hit points) based on level.
 * Formula from legacy get_set_hp() in magic.cpp
 *
 * @param level - Mob level (1-99)
 * @returns Object with { num, size, bonus } for HP dice
 */
export function calculateHpDice(level: number): {
  num: number;
  size: number;
  bonus: number;
} {
  const clampedLevel = Math.max(1, Math.min(99, level));

  // Base HP formula: level determines dice count, size is fixed
  // Low levels: fewer dice, higher levels: many dice
  const num = Math.floor(clampedLevel / 2.5 + 0.5);
  const size = 8; // Standard d8 for HP

  // Bonus scales with level for consistent HP totals
  const bonus = Math.floor(clampedLevel * 2);

  return { num: Math.max(1, num), size, bonus };
}

/**
 * Calculate base damage dice based on level and race/class factors.
 * Formula from legacy get_set_dice() in magic.cpp
 *
 * @param level - Mob level (1-99)
 * @param raceFactor - Race dice factor (default 100)
 * @param classFactor - Class dice factor (default 100)
 * @returns Object with { num, size } for damage dice
 */
export function calculateDamageDice(
  level: number,
  raceFactor: number = 100,
  classFactor: number = 100
): { num: number; size: number } {
  const clampedLevel = Math.max(1, Math.min(99, level));
  const combinedFactor = getCombinedDiceFactor(raceFactor, classFactor);

  // Base dice calculation from level
  // Formula: (level / 2.5 + 0.5) scaled by combined factor
  const baseDice = Math.floor(clampedLevel / 2.5 + 0.5);
  const scaledDice = Math.floor((baseDice * combinedFactor) / 100);

  // Dice size scales with level tiers
  let size: number;
  if (clampedLevel <= 10) {
    size = 6;
  } else if (clampedLevel <= 30) {
    size = 8;
  } else if (clampedLevel <= 60) {
    size = 10;
  } else {
    size = 12;
  }

  return { num: Math.max(1, scaledDice), size };
}

/**
 * Calculate base damage bonus (damroll) based on level and race/class factors.
 * Formula from legacy get_set_hd() in magic.cpp
 *
 * @param level - Mob level (1-99)
 * @param raceFactor - Race dice factor (default 100)
 * @param classFactor - Class dice factor (default 100)
 * @returns The damage bonus value
 */
export function calculateDamageBonus(
  level: number,
  raceFactor: number = 100,
  classFactor: number = 100
): number {
  const clampedLevel = Math.max(1, Math.min(99, level));
  const combinedFactor = getCombinedDiceFactor(raceFactor, classFactor);

  // Base damroll formula from level
  const baseDamroll = Math.floor(clampedLevel / 2.5 + 0.5);
  return Math.floor((baseDamroll * combinedFactor) / 100);
}

/**
 * Calculate all default combat stats for a mob based on level, race, and class.
 * This is the main entry point for calculating mob defaults.
 *
 * @param level - Mob level (1-99)
 * @param race - Race name (e.g., "HUMANOID", "DRAGON")
 * @param className - Class name (e.g., "WARRIOR", "SORCERER"), optional
 * @returns Object with hpDice and damageDice formatted as strings
 */
export function calculateMobCombatDefaults(
  level: number,
  race: string,
  className?: string
): {
  hpDice: string;
  damageDice: string;
  damageDiceNum: number;
  damageDiceSize: number;
  damageDiceBonus: number;
  hpDiceNum: number;
  hpDiceSize: number;
  hpDiceBonus: number;
} {
  const raceFactor = getRaceDiceFactor(race);
  const classFactor = className ? getClassDiceFactor(className) : 100;

  const hp = calculateHpDice(level);
  const dmg = calculateDamageDice(level, raceFactor, classFactor);
  const bonus = calculateDamageBonus(level, raceFactor, classFactor);

  // Format dice strings
  const hpBonus = hp.bonus >= 0 ? `+${hp.bonus}` : `${hp.bonus}`;
  const dmgBonus = bonus >= 0 ? `+${bonus}` : `${bonus}`;

  return {
    hpDice: `${hp.num}d${hp.size}${hpBonus}`,
    damageDice: `${dmg.num}d${dmg.size}${dmgBonus}`,
    hpDiceNum: hp.num,
    hpDiceSize: hp.size,
    hpDiceBonus: hp.bonus,
    damageDiceNum: dmg.num,
    damageDiceSize: dmg.size,
    damageDiceBonus: bonus,
  };
}
