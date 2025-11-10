import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import {
  Race,
  RaceAlign,
  Size,
  LifeForce,
  Composition,
  EffectFlag,
  SkillCategory,
} from '@prisma/client';

@InputType()
export class CreateRaceInput {
  @Field(() => Race)
  @IsEnum(Race)
  race: Race;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  keywords: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  plainName: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  playable: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  humanoid: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  magical: boolean;

  @Field(() => RaceAlign, { defaultValue: RaceAlign.GOOD })
  @IsEnum(RaceAlign)
  raceAlign: RaceAlign;

  @Field(() => Size, { defaultValue: Size.MEDIUM })
  @IsEnum(Size)
  defaultSize: Size;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  defaultAlignment: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  bonusDamroll: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  bonusHitroll: number;

  @Field(() => Int, { defaultValue: 100 })
  @IsInt()
  @Min(1)
  focusBonus: number;

  @Field(() => LifeForce, { defaultValue: LifeForce.LIFE })
  @IsEnum(LifeForce)
  defaultLifeforce: LifeForce;

  @Field(() => Composition, { defaultValue: Composition.FLESH })
  @IsEnum(Composition)
  defaultComposition: Composition;

  @Field(() => Int, { defaultValue: 76 })
  @IsInt()
  @Min(1)
  @Max(200)
  maxStrength: number;

  @Field(() => Int, { defaultValue: 76 })
  @IsInt()
  @Min(1)
  @Max(200)
  maxDexterity: number;

  @Field(() => Int, { defaultValue: 76 })
  @IsInt()
  @Min(1)
  @Max(200)
  maxIntelligence: number;

  @Field(() => Int, { defaultValue: 76 })
  @IsInt()
  @Min(1)
  @Max(200)
  maxWisdom: number;

  @Field(() => Int, { defaultValue: 76 })
  @IsInt()
  @Min(1)
  @Max(200)
  maxConstitution: number;

  @Field(() => Int, { defaultValue: 76 })
  @IsInt()
  @Min(1)
  @Max(200)
  maxCharisma: number;

  @Field(() => Int, { defaultValue: 100 })
  @IsInt()
  @Min(1)
  expFactor: number;

  @Field(() => Int, { defaultValue: 100 })
  @IsInt()
  @Min(1)
  hpFactor: number;

  @Field(() => [EffectFlag], { defaultValue: [] })
  @IsArray()
  @IsEnum(EffectFlag, { each: true })
  permanentEffects: EffectFlag[];
}

@InputType()
export class UpdateRaceInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  keywords?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  displayName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  fullName?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  plainName?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  playable?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  humanoid?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  magical?: boolean;

  @Field(() => RaceAlign, { nullable: true })
  @IsEnum(RaceAlign)
  @IsOptional()
  raceAlign?: RaceAlign;

  @Field(() => Size, { nullable: true })
  @IsEnum(Size)
  @IsOptional()
  defaultSize?: Size;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  defaultAlignment?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  bonusDamroll?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  bonusHitroll?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  focusBonus?: number;

  @Field(() => LifeForce, { nullable: true })
  @IsEnum(LifeForce)
  @IsOptional()
  defaultLifeforce?: LifeForce;

  @Field(() => Composition, { nullable: true })
  @IsEnum(Composition)
  @IsOptional()
  defaultComposition?: Composition;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  maxStrength?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  maxDexterity?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  maxIntelligence?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  maxWisdom?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  maxConstitution?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @Max(200)
  @IsOptional()
  maxCharisma?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  expFactor?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @Min(1)
  @IsOptional()
  hpFactor?: number;

  @Field(() => [EffectFlag], { nullable: true })
  @IsArray()
  @IsEnum(EffectFlag, { each: true })
  @IsOptional()
  permanentEffects?: EffectFlag[];
}

@InputType()
export class AssignSkillToRaceInput {
  @Field(() => Race)
  @IsEnum(Race)
  race: Race;

  @Field(() => Int)
  @IsInt()
  abilityId: number;

  @Field(() => SkillCategory, { defaultValue: SkillCategory.SECONDARY })
  @IsEnum(SkillCategory)
  category: SkillCategory;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  bonus: number;
}

@InputType()
export class UpdateRaceSkillInput {
  @Field(() => SkillCategory, { nullable: true })
  @IsEnum(SkillCategory)
  @IsOptional()
  category?: SkillCategory;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  bonus?: number;
}
