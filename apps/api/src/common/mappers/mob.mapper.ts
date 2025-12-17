import { MobDto } from '../../mobs/mob.dto';
import { MobMapperSource } from './types';

// Computes dice string from numeric components
function buildDice(num: number, size: number, bonus: number): string {
  return `${num}d${size}${bonus >= 0 ? '+' : ''}${bonus}`;
}

// Extract resistance value from JSON resistances object
function getResistance(resistances: unknown, key: string): number {
  if (!resistances || typeof resistances !== 'object') return 0;
  const value = (resistances as Record<string, unknown>)[key];
  return typeof value === 'number' ? value : 0;
}

export function mapMob(db: MobMapperSource): MobDto {
  // Parse resistances JSON field
  const resistances = db.resistances ?? {};

  const dto: MobDto = {
    id: db.id,
    zoneId: db.zoneId,
    keywords: db.keywords,
    name: db.name,
    plainName: db.plainName,
    role: db.role,
    roomDescription: db.roomDescription,
    plainRoomDescription: db.plainRoomDescription,
    examineDescription: db.examineDescription,
    plainExamineDescription: db.plainExamineDescription,
    level: db.level,
    alignment: db.alignment,
    hitRoll: db.hitRoll,
    armorClass: db.armorClass,
    accuracy: db.accuracy,
    attackPower: db.attackPower,
    spellPower: db.spellPower,
    penetrationFlat: db.penetrationFlat,
    penetrationPercent: db.penetrationPercent,
    evasion: db.evasion,
    armorRating: db.armorRating,
    damageReductionPercent: db.damageReductionPercent,
    soak: db.soak,
    hardness: db.hardness,
    wardPercent: db.wardPercent,
    resistanceFire: getResistance(resistances, 'FIRE'),
    resistanceCold: getResistance(resistances, 'COLD'),
    resistanceLightning: getResistance(resistances, 'LIGHTNING'),
    resistanceAcid: getResistance(resistances, 'ACID'),
    resistancePoison: getResistance(resistances, 'POISON'),
    hpDice: buildDice(db.hpDiceNum, db.hpDiceSize, db.hpDiceBonus),
    damageDice: buildDice(
      db.damageDiceNum,
      db.damageDiceSize,
      db.damageDiceBonus
    ),
    damageType: db.damageType,
    strength: db.strength,
    intelligence: db.intelligence,
    wisdom: db.wisdom,
    dexterity: db.dexterity,
    constitution: db.constitution,
    charisma: db.charisma,
    perception: db.perception,
    concealment: db.concealment,
    ...(db.totalWealth !== null &&
      db.totalWealth !== undefined && { wealth: db.totalWealth }),
    race: db.race,
    gender: db.gender,
    size: db.size,
    lifeForce: db.lifeForce,
    composition: db.composition,
    mobFlags: db.mobFlags,
    effectFlags: db.effectFlags,
    position: db.position,
    stance: db.stance,
    ...(db.classId !== null &&
      db.classId !== undefined && { classId: db.classId }),
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
  return dto;
}
