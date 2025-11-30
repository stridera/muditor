import { MobDto } from '../../mobs/mob.dto';
import { MobMapperSource } from './types';

// Computes dice string from numeric components
function buildDice(num: number, size: number, bonus: number): string {
  return `${num}d${size}${bonus >= 0 ? '+' : ''}${bonus}`;
}

export function mapMob(db: MobMapperSource): MobDto {
  const dto: MobDto = {
    id: db.id,
    zoneId: db.zoneId,
    keywords: db.keywords,
    name: db.name,
    role: db.role,
    roomDescription: db.roomDescription,
    examineDescription: db.examineDescription,
    level: db.level,
    alignment: db.alignment,
    hitRoll: db.hitRoll,
    armorClass: db.armorClass,
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
