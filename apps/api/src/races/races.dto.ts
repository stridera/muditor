import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import {
  Race,
  RaceAlign,
  Size,
  LifeForce,
  Composition,
  EffectFlag,
  SkillCategory,
} from '@prisma/client';

// Register enums for GraphQL
registerEnumType(Race, { name: 'Race' });
registerEnumType(RaceAlign, { name: 'RaceAlign' });
registerEnumType(Size, { name: 'Size' });
registerEnumType(LifeForce, { name: 'LifeForce' });
registerEnumType(Composition, { name: 'Composition' });
registerEnumType(EffectFlag, { name: 'EffectFlag' });
registerEnumType(SkillCategory, { name: 'SkillCategory' });

@ObjectType()
export class RaceDto {
  @Field(() => Race)
  race: Race;

  @Field()
  name: string;

  @Field()
  keywords: string;

  @Field()
  displayName: string;

  @Field()
  fullName: string;

  @Field()
  plainName: string;

  @Field()
  playable: boolean;

  @Field()
  humanoid: boolean;

  @Field()
  magical: boolean;

  @Field(() => RaceAlign)
  raceAlign: RaceAlign;

  @Field(() => Size)
  defaultSize: Size;

  @Field(() => Int)
  defaultAlignment: number;

  @Field(() => Int)
  bonusDamroll: number;

  @Field(() => Int)
  bonusHitroll: number;

  @Field(() => Int)
  focusBonus: number;

  @Field(() => LifeForce)
  defaultLifeforce: LifeForce;

  @Field(() => Composition)
  defaultComposition: Composition;

  @Field(() => Int)
  maxStrength: number;

  @Field(() => Int)
  maxDexterity: number;

  @Field(() => Int)
  maxIntelligence: number;

  @Field(() => Int)
  maxWisdom: number;

  @Field(() => Int)
  maxConstitution: number;

  @Field(() => Int)
  maxCharisma: number;

  @Field(() => Int)
  expFactor: number;

  @Field(() => Int)
  hpFactor: number;

  @Field(() => [EffectFlag])
  permanentEffects: EffectFlag[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class RaceSkillDto {
  @Field(() => ID)
  id: number;

  @Field(() => Race)
  race: Race;

  @Field(() => Int)
  skillId: number;

  @Field(() => SkillCategory)
  category: SkillCategory;

  @Field(() => Int)
  bonus: number;

  @Field({ description: 'Skill name' })
  skillName: string;

  @Field({ description: 'Race name' })
  raceName: string;
}
