import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { SkillCategory } from '@prisma/client';

@ObjectType()
export class ClassDto {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  plainName: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  hitDice: string;

  @Field({ nullable: true })
  primaryStat?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class ClassSkillDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  classId: number;

  @Field(() => Int)
  skillId: number;

  @Field(() => SkillCategory, { nullable: true })
  category?: SkillCategory;

  @Field(() => Int)
  minLevel: number;

  @Field(() => Int, { nullable: true })
  maxLevel?: number;

  @Field({ description: 'Class name' })
  className: string;

  @Field({ description: 'Skill name' })
  skillName: string;
}

@ObjectType()
export class CircleSpellDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  spellId: number;

  @Field()
  spellName: string;

  @Field(() => Int, { nullable: true })
  minLevel?: number;

  @Field(() => Int, { nullable: true })
  proficiencyGain?: number;
}

@ObjectType()
export class ClassCircleDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  classId: number;

  @Field(() => Int)
  circle: number;

  @Field(() => Int)
  minLevel: number;

  @Field({ description: 'Class name' })
  className: string;

  @Field(() => [CircleSpellDto], { description: 'Spells in this circle' })
  spells: CircleSpellDto[];
}
