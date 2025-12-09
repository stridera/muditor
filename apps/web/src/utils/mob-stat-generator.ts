/**
 * Mob Stat Generator - TypeScript port of fierylib/combat_formulas.py
 *
 * Generates intelligent default combat stats for mobs based on:
 * - Level (1-100)
 * - Role (TRASH, NORMAL, ELITE, MINIBOSS, BOSS, RAID_BOSS)
 * - Class (WARRIOR, SORCERER, CLERIC, etc.)
 * - Race
 * - Lifeforce (LIFE, UNDEAD, CONSTRUCT)
 * - Composition (FLESH, STONE, METAL, etc.)
 *
 * All formulas match the Python implementation in fierylib/src/fierylib/combat_formulas.py
 */

export interface MobStats {
  // Offensive
  accuracy: number;
  attackPower: number;
  spellPower: number;
  penetrationFlat: number;
  penetrationPercent: number;

  // Defensive
  evasion: number;
  armorRating: number;
  damageReductionPercent: number;
  soak: number;
  hardness: number;
  wardPercent: number;

  // Resistances
  resistanceFire: number;
  resistanceCold: number;
  resistanceLightning: number;
  resistanceAcid: number;
  resistancePoison: number;

  // Health & Damage
  hpDiceNum: number;
  hpDiceSize: number;
  hpDiceBonus: number;
  damageDiceNum: number;
  damageDiceSize: number;
  damageDiceBonus: number;
}

type MobRole = 'TRASH' | 'NORMAL' | 'ELITE' | 'MINIBOSS' | 'BOSS' | 'RAID_BOSS';
type MobClass =
  | 'WARRIOR'
  | 'SORCERER'
  | 'CLERIC'
  | 'DRUID'
  | 'RANGER'
  | 'THIEF'
  | 'SHAMAN'
  | 'LAYMAN';
type Lifeforce = 'LIFE' | 'UNDEAD' | 'CONSTRUCT';
type Composition =
  | 'FLESH'
  | 'BONE'
  | 'STONE'
  | 'METAL'
  | 'CRYSTAL'
  | 'GAS'
  | 'LIQUID'
  | 'PLANT'
  | 'WATER'
  | 'FIRE'
  | 'AIR'
  | 'EARTH';

/**
 * Calculate mob base HP bonus (from legacy get_set_hit)
 */
function getSetHit(
  level: number,
  raceFactor: number = 100,
  classFactor: number = 100
): number {
  let xmain = 0;

  // Level-based tiers
  if (level < 20) {
    xmain = Math.floor(3 * (level * (level / 1.25)));
  } else if (level < 35) {
    xmain = Math.floor(3 * (level * (level / 1.35)));
  } else if (level < 50) {
    xmain = Math.floor(3 * ((level * level) / 1.25));
  } else {
    xmain = Math.floor(3 * ((level * level) / 1.25));
  }

  // Level bracket deductions
  if (level <= 5) {
    // No deduction
  } else if (level <= 10) {
    xmain -= 25;
  } else if (level <= 20) {
    xmain -= 100;
  } else if (level <= 30) {
    xmain -= 200;
  } else {
    xmain -= 2000;
  }

  // Apply race/class factors
  const sfactor = Math.floor((raceFactor + classFactor) / 2);
  xmain = Math.floor((sfactor * xmain) / 100);

  // Final adjustment
  return Math.floor(xmain / (2 - level / 100.0));
}

/**
 * Calculate mob base damroll (from legacy get_set_hd)
 */
function getSetHd(
  level: number,
  raceFactor: number,
  classFactor: number
): number {
  let dam = 0;

  // Tier-based base damroll
  if (level < 10) {
    dam = level / 4.0;
  } else if (level < 20) {
    dam = level / 4.0;
  } else if (level < 35) {
    dam = level / 4.3;
  } else if (level < 50) {
    dam = level / 4.6;
  } else {
    dam = level / 4.4;
  }

  // Apply class/race factor modifiers
  const sfactor = (classFactor + raceFactor) / 2.0;
  dam = dam * (sfactor / 100.0);

  return Math.floor(dam);
}

/**
 * Calculate realistic HP dice from target HP
 */
function calculateRealisticHpDice(
  targetHp: number,
  level: number,
  isBoss: boolean = false
): [number, number, number] {
  if (targetHp <= 0) {
    return [0, 0, 0];
  }

  // Choose dice size based on level
  let diceSize = 8;
  if (level < 10) {
    diceSize = 8;
  } else if (level < 30) {
    diceSize = 10;
  } else if (level < 50) {
    diceSize = 12;
  } else {
    diceSize = 20;
  }

  let numDice: number;
  let dicePortion: number;
  let flatBonus: number;

  if (isBoss) {
    // Boss: 15% from dice, 85% flat bonus (low variance)
    dicePortion = Math.floor(targetHp * 0.15);
    flatBonus = targetHp - dicePortion;

    const avgPerDie = (diceSize + 1) / 2.0;
    numDice = Math.max(1, Math.floor(dicePortion / avgPerDie));

    const actualDiceAvg = Math.floor(numDice * avgPerDie);
    const finalBonus = targetHp - actualDiceAvg;

    return [numDice, diceSize, finalBonus];
  } else {
    // Normal: 50% from dice, 50% flat bonus (moderate variance)
    dicePortion = Math.floor(targetHp * 0.5);
    flatBonus = targetHp - dicePortion;

    const avgPerDie = (diceSize + 1) / 2.0;
    numDice = Math.max(1, Math.floor(dicePortion / avgPerDie));

    // Cap num_dice to reasonable values
    const maxDice = Math.min(50, level * 2);
    numDice = Math.min(numDice, maxDice);

    const actualDiceAvg = Math.floor(numDice * avgPerDie);
    const finalBonus = targetHp - actualDiceAvg;

    return [numDice, diceSize, finalBonus];
  }
}

/**
 * Calculate damage dice using modern formula
 */
function calculateDamageDiceModern(
  level: number,
  raceFactor: number = 100,
  classFactor: number = 100,
  isBoss: boolean = false
): [number, number, number] {
  // Get base damroll from legacy formula
  const baseDamroll = getSetHd(level, raceFactor, classFactor);

  // Variable split ratio
  const splitRatio = level < 50 ? 0.15 : 0.05;
  const fixedBonus = Math.floor(baseDamroll * splitRatio);
  const dicePortion = baseDamroll - fixedBonus;

  // Dice size by tier
  let diceSize = 4;
  if (level < 50) {
    diceSize = 4;
  } else if (level < 60) {
    diceSize = 8;
  } else {
    diceSize = 10;
  }

  // Calculate number of dice
  const avgPerDie = (diceSize + 1) / 2.0;
  let numDice = Math.max(1, Math.floor(dicePortion / avgPerDie));

  // Apply CoV cap (0.60 normal, 0.80 bosses)
  const covCap = isBoss ? 0.8 : 0.6;
  const maxNumDice = Math.floor((diceSize + 1) / (2 * covCap));
  numDice = Math.min(numDice, maxNumDice);

  // Recalculate bonus to match target damage
  const actualDiceAvg = numDice * avgPerDie;
  const finalBonus = baseDamroll - Math.floor(actualDiceAvg);

  return [numDice, diceSize, finalBonus];
}

/**
 * Convert legacy stats to modern combat system
 */
function convertLegacyToModernStats(
  level: number,
  legacyHitroll: number,
  legacyAc: number
): {
  accuracy: number;
  evasion: number;
  armorRating: number;
  damageReductionPercent: number;
} {
  // accuracy = legacy hitRoll (1:1 conversion)
  const accuracy = legacyHitroll;

  // evasion = derived from AC
  const baselineAc = 100 - level * 2;
  const evasion = Math.floor((baselineAc - legacyAc) / 2);

  // armorRating from AC
  const armorRating = Math.max(0, -legacyAc);

  // Calculate damageReductionPercent from armorRating
  let kConstant = 50;
  if (level <= 30) {
    kConstant = 50;
  } else if (level <= 60) {
    kConstant = 100;
  } else {
    kConstant = 200;
  }

  const damageReductionPercent =
    armorRating > 0
      ? Math.floor((armorRating * 100) / (armorRating + kConstant))
      : 0;

  return { accuracy, evasion, armorRating, damageReductionPercent };
}

/**
 * Calculate placeholder stats for new/advanced stats
 */
function calculatePlaceholderStats(
  level: number,
  role: MobRole,
  mobClass: MobClass,
  race: string,
  lifeforce: Lifeforce,
  composition: Composition
): Partial<MobStats> {
  // Role multiplier
  const roleMultipliers: Record<MobRole, number> = {
    TRASH: 0.5,
    NORMAL: 1.0,
    ELITE: 1.5,
    MINIBOSS: 2.5,
    BOSS: 4.0,
    RAID_BOSS: 5.0,
  };
  const roleMult = roleMultipliers[role] || 1.0;

  // ========== ATTACK POWER ==========
  const baseAttack = Math.max(0, Math.floor((level - 50) / 2));
  const classAttackBonus: Record<string, number> = {
    WARRIOR: 20,
    RANGER: 15,
    THIEF: 10,
    DRUID: 8,
    CLERIC: 5,
    SORCERER: 0,
    LAYMAN: 5,
  };
  const attackPower = Math.floor(
    baseAttack * roleMult + (classAttackBonus[mobClass] || 5)
  );

  // ========== SPELL POWER ==========
  const casterBase: Record<string, number> = {
    SORCERER: 40,
    DRUID: 35,
    CLERIC: 30,
    SHAMAN: 30,
    RANGER: 5,
    WARRIOR: 0,
    THIEF: 0,
    LAYMAN: 0,
  };
  const spellPower = Math.floor((casterBase[mobClass] || 0) * roleMult);

  // ========== SOAK ==========
  let roleSoak = 0;
  switch (role) {
    case 'TRASH':
      roleSoak = 0;
      break;
    case 'NORMAL':
      roleSoak = Math.max(0, Math.floor((level - 50) / 10));
      break;
    case 'ELITE':
      roleSoak = Math.max(0, Math.floor((level - 40) / 5));
      break;
    case 'MINIBOSS':
      roleSoak = Math.max(0, Math.floor((level - 30) / 3));
      break;
    case 'BOSS':
      roleSoak = Math.max(0, Math.floor((level - 20) / 2));
      break;
    case 'RAID_BOSS':
      roleSoak = Math.max(0, level - 10);
      break;
  }

  const compMult: Record<string, number> = {
    FLESH: 1.0,
    BONE: 0.8,
    STONE: 1.5,
    METAL: 2.0,
    CRYSTAL: 1.2,
    GAS: 0.0,
    LIQUID: 0.5,
    PLANT: 1.0,
    WATER: 0.5,
    FIRE: 0.5,
    AIR: 0.0,
    EARTH: 1.5,
  };
  const soak = Math.floor(roleSoak * (compMult[composition] || 1.0));

  // ========== HARDNESS ==========
  let baseHardness = 0;
  if (['BOSS', 'RAID_BOSS', 'MINIBOSS'].includes(role)) {
    baseHardness = 50 + Math.floor(level / 2);
  } else if (role === 'ELITE') {
    baseHardness = 25 + Math.floor(level / 4);
  }

  const compHardnessBonus: Record<string, number> = {
    FLESH: 0,
    BONE: 5,
    STONE: 15,
    METAL: 25,
    CRYSTAL: 10,
    GAS: -10,
    LIQUID: -5,
    PLANT: 0,
    WATER: -5,
    FIRE: 0,
    AIR: -10,
    EARTH: 15,
  };
  const hardness = Math.max(
    0,
    baseHardness + (compHardnessBonus[composition] || 0)
  );

  // ========== WARD PERCENT ==========
  const classWard: Record<string, number> = {
    SORCERER: 30,
    CLERIC: 25,
    DRUID: 20,
    SHAMAN: 25,
    RANGER: 10,
    WARRIOR: 5,
    THIEF: 5,
    LAYMAN: 0,
  };

  const magicalRaces = [
    'DRAGON',
    'DEMON',
    'DEVIL',
    'ELEMENTAL',
    'FAE',
    'CELESTIAL',
  ];
  const raceUpper = race.toUpperCase();
  const raceWardBonus = magicalRaces.some(mag => raceUpper.includes(mag))
    ? 20
    : 0;

  const lifeforceMult: Record<Lifeforce, number> = {
    LIFE: 1.0,
    UNDEAD: 1.2,
    CONSTRUCT: 0.8,
  };
  const wardPercent = Math.min(
    90,
    Math.floor(
      ((classWard[mobClass] || 5) + raceWardBonus) *
        (lifeforceMult[lifeforce] || 1.0) *
        roleMult
    )
  );

  // ========== PENETRATION ==========
  const penBase: Record<string, number> = {
    THIEF: 25,
    RANGER: 20,
    WARRIOR: 15,
    DRUID: 5,
    SORCERER: 0,
    CLERIC: 0,
    LAYMAN: 0,
  };
  const penetrationFlat = Math.floor((penBase[mobClass] || 0) * roleMult);

  let penetrationPercent = 0;
  if (
    ['BOSS', 'RAID_BOSS', 'MINIBOSS', 'ELITE'].includes(role) &&
    level >= 70
  ) {
    penetrationPercent = 10 + Math.floor((level - 70) / 5);
  }

  // ========== ELEMENTAL RESISTANCES ==========
  const resistances = {
    fire: 0,
    cold: 0,
    lightning: 0,
    acid: 0,
    poison: 0,
  };

  // Race-based elemental affinities
  if (raceUpper.includes('FIRE') && raceUpper.includes('DRAGON')) {
    resistances.fire = 75;
    resistances.cold = -25;
  } else if (raceUpper.includes('ICE') && raceUpper.includes('DRAGON')) {
    resistances.cold = 75;
    resistances.fire = -25;
  } else if (raceUpper.includes('LIGHTNING') && raceUpper.includes('DRAGON')) {
    resistances.lightning = 75;
  } else if (raceUpper.includes('ACID') && raceUpper.includes('DRAGON')) {
    resistances.acid = 75;
  } else if (raceUpper.includes('POISON') && raceUpper.includes('DRAGON')) {
    resistances.poison = 75;
  } else if (raceUpper.includes('DRAGON')) {
    resistances.fire = 25;
    resistances.cold = 25;
    resistances.lightning = 25;
    resistances.acid = 25;
    resistances.poison = 25;
  }

  // Demons and Devils
  if (raceUpper.includes('DEMON') || raceUpper.includes('DEVIL')) {
    resistances.fire = 50;
    resistances.cold = 25;
  }

  // Elementals
  if (raceUpper.includes('FIRE') && raceUpper.includes('ELEMENTAL')) {
    resistances.fire = 90;
    resistances.cold = -50;
  } else if (raceUpper.includes('ICE') && raceUpper.includes('ELEMENTAL')) {
    resistances.cold = 90;
    resistances.fire = -50;
  } else if (
    raceUpper.includes('LIGHTNING') &&
    raceUpper.includes('ELEMENTAL')
  ) {
    resistances.lightning = 90;
  } else if (raceUpper.includes('EARTH') && raceUpper.includes('ELEMENTAL')) {
    resistances.acid = 75;
    resistances.poison = 50;
  }

  // Lifeforce-based resistances
  if (lifeforce === 'UNDEAD') {
    resistances.poison = Math.max(resistances.poison, 90);
    resistances.cold = Math.max(resistances.cold, 50);
  } else if (lifeforce === 'CONSTRUCT') {
    resistances.poison = Math.max(resistances.poison, 100);
  }

  // Composition-based resistances
  if (composition === 'STONE') {
    resistances.acid = Math.max(resistances.acid, 40);
    resistances.fire = Math.max(resistances.fire, 30);
  } else if (composition === 'METAL') {
    resistances.lightning = Math.min(resistances.lightning, -25);
    resistances.acid = Math.max(resistances.acid, 50);
  } else if (composition === 'CRYSTAL') {
    resistances.lightning = Math.max(resistances.lightning, 40);
  }

  // Apply role multiplier to positive resistances
  for (const element of Object.keys(resistances) as Array<
    keyof typeof resistances
  >) {
    if (resistances[element] > 0) {
      resistances[element] = Math.min(
        90,
        Math.floor(resistances[element] * (0.5 + roleMult * 0.3))
      );
    }
  }

  // Cap all resistances
  for (const element of Object.keys(resistances) as Array<
    keyof typeof resistances
  >) {
    resistances[element] = Math.max(-50, Math.min(90, resistances[element]));
  }

  return {
    attackPower,
    spellPower,
    soak,
    hardness,
    wardPercent,
    penetrationFlat,
    penetrationPercent,
    resistanceFire: resistances.fire,
    resistanceCold: resistances.cold,
    resistanceLightning: resistances.lightning,
    resistanceAcid: resistances.acid,
    resistancePoison: resistances.poison,
  };
}

/**
 * Generate complete mob stats based on level and role
 */
export function generateMobStats(
  level: number,
  role: MobRole,
  mobClass: MobClass = 'WARRIOR',
  race: string = 'HUMAN',
  lifeforce: Lifeforce = 'LIFE',
  composition: Composition = 'FLESH',
  legacyHitroll: number = 0,
  legacyAc: number = 0
): MobStats {
  const isBoss = ['BOSS', 'RAID_BOSS', 'MINIBOSS'].includes(role);

  // Calculate HP
  const targetHp = getSetHit(level, 100, 100);
  const [hpDiceNum, hpDiceSize, hpDiceBonus] = calculateRealisticHpDice(
    targetHp,
    level,
    isBoss
  );

  // Calculate damage
  const [damageDiceNum, damageDiceSize, damageDiceBonus] =
    calculateDamageDiceModern(level, 100, 100, isBoss);

  // Convert legacy stats
  const { accuracy, evasion, armorRating, damageReductionPercent } =
    convertLegacyToModernStats(level, legacyHitroll, legacyAc);

  // Calculate placeholder stats
  const placeholderStats = calculatePlaceholderStats(
    level,
    role,
    mobClass,
    race,
    lifeforce,
    composition
  );

  return {
    accuracy,
    evasion,
    armorRating,
    damageReductionPercent,
    hpDiceNum,
    hpDiceSize,
    hpDiceBonus,
    damageDiceNum,
    damageDiceSize,
    damageDiceBonus,
    attackPower: placeholderStats.attackPower || 0,
    spellPower: placeholderStats.spellPower || 0,
    penetrationFlat: placeholderStats.penetrationFlat || 0,
    penetrationPercent: placeholderStats.penetrationPercent || 0,
    soak: placeholderStats.soak || 0,
    hardness: placeholderStats.hardness || 0,
    wardPercent: placeholderStats.wardPercent || 0,
    resistanceFire: placeholderStats.resistanceFire || 0,
    resistanceCold: placeholderStats.resistanceCold || 0,
    resistanceLightning: placeholderStats.resistanceLightning || 0,
    resistanceAcid: placeholderStats.resistanceAcid || 0,
    resistancePoison: placeholderStats.resistancePoison || 0,
  };
}
