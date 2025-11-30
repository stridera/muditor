import {
  Composition,
  DamageType,
  Gender,
  LifeForce,
  Position,
  Race,
  Size,
  Stance,
} from '@prisma/client';
import { mapMob } from '../mob.mapper';
import { MobMapperSource } from '../types';

function base(): MobMapperSource {
  return {
    id: 20,
    zoneId: 5,
    keywords: ['orc'],
    name: 'Orc',
    role: 'NORMAL',
    roomDescription: 'A fearsome orc',
    examineDescription: 'It looks angry',
    level: 3,
    alignment: 0,
    hitRoll: 1,
    armorClass: 10,
    hpDiceNum: 2,
    hpDiceSize: 6,
    hpDiceBonus: 5,
    damageDiceNum: 1,
    damageDiceSize: 4,
    damageDiceBonus: 0,
    damageType: DamageType.HIT,
    strength: 10,
    intelligence: 8,
    wisdom: 7,
    dexterity: 9,
    constitution: 11,
    charisma: 6,
    perception: 5,
    concealment: 0,
    totalWealth: undefined,
    race: Race.HUMANOID,
    gender: Gender.MALE,
    size: Size.MEDIUM,
    lifeForce: LifeForce.LIFE,
    composition: Composition.FLESH,
    mobFlags: [],
    effectFlags: [],
    position: Position.STANDING,
    stance: Stance.ALERT,
    classId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Fields omitted by Omit<Mobs,'wealth'> but may exist; keep index signature compatibility
    // 'wealth' is omitted from MobMapperSource by design; retain placeholder cast avoided.
    // Provide only properties defined in MobMapperSource shape.
  } as unknown as MobMapperSource; // satisfy type (wealth omitted in source type definition)
}

describe('mapMob', () => {
  it('omits wealth when totalWealth is undefined', () => {
    const dto = mapMob(base());
    expect(dto).not.toHaveProperty('wealth');
  });

  it('includes wealth when totalWealth has a value', () => {
    const src = { ...base(), totalWealth: 123 };
    const dto = mapMob(src);
    expect(dto.wealth).toBe(123);
  });

  it('builds hpDice and damageDice strings correctly', () => {
    const dto = mapMob(base());
    expect(dto.hpDice).toBe('2d6+5');
    expect(dto.damageDice).toBe('1d4+0');
  });

  it('omits classId when null', () => {
    const dto = mapMob(base());
    expect(dto).not.toHaveProperty('classId');
  });

  it('includes classId when present', () => {
    const src = { ...base(), classId: 77 };
    const dto = mapMob(src);
    expect(dto.classId).toBe(77);
  });
});
