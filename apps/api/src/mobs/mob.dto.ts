import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  Composition,
  DamageType,
  EffectFlag,
  Gender,
  LifeForce,
  MobBehavior,
  MobFlag,
  MobRole,
  MobTrait,
  Position,
  Race,
  Size,
  Stance,
} from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// Register GraphQL enums
registerEnumType(MobFlag, { name: 'MobFlag' });
registerEnumType(EffectFlag, { name: 'EffectFlag' });
registerEnumType(Gender, { name: 'Gender' });
registerEnumType(Race, { name: 'Race' });
registerEnumType(DamageType, { name: 'DamageType' });
registerEnumType(Position, { name: 'Position' });
registerEnumType(LifeForce, { name: 'LifeForce' });
registerEnumType(Composition, { name: 'Composition' });
registerEnumType(Stance, { name: 'Stance' });
registerEnumType(Size, { name: 'Size' });
registerEnumType(MobRole, { name: 'MobRole' });
registerEnumType(MobTrait, { name: 'MobTrait' });
registerEnumType(MobBehavior, { name: 'MobBehavior' });

// This DTO matches the actual Prisma Mob model
@ObjectType()
export class MobDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  zoneId: number;

  @Field(() => [String])
  keywords: string[];

  @Field()
  name: string;

  @Field()
  plainName: string;

  @Field()
  roomDescription: string;

  @Field()
  plainRoomDescription: string;

  @Field()
  examineDescription: string;

  @Field()
  plainExamineDescription: string;

  @Field(() => Int)
  level: number;

  @Field(() => MobRole)
  role: MobRole;

  @Field(() => Int)
  alignment: number;

  @Field(() => Int)
  hitRoll: number;

  @Field(() => Int)
  armorClass: number;

  @Field(() => Int)
  accuracy: number;

  @Field(() => Int)
  attackPower: number;

  @Field(() => Int)
  spellPower: number;

  @Field(() => Int)
  penetrationFlat: number;

  @Field(() => Int)
  penetrationPercent: number;

  @Field(() => Int)
  evasion: number;

  @Field(() => Int)
  armorRating: number;

  @Field(() => Int)
  damageReductionPercent: number;

  @Field(() => Int)
  soak: number;

  @Field(() => Int)
  hardness: number;

  @Field(() => Int)
  wardPercent: number;

  @Field(() => Int)
  resistanceFire: number;

  @Field(() => Int)
  resistanceCold: number;

  @Field(() => Int)
  resistanceLightning: number;

  @Field(() => Int)
  resistanceAcid: number;

  @Field(() => Int)
  resistancePoison: number;

  @Field()
  hpDice: string;

  @Field()
  damageDice: string;

  @Field(() => DamageType)
  damageType: DamageType;

  @Field(() => Int)
  strength: number;

  @Field(() => Int)
  intelligence: number;

  @Field(() => Int)
  wisdom: number;

  @Field(() => Int)
  dexterity: number;

  @Field(() => Int)
  constitution: number;

  @Field(() => Int)
  charisma: number;

  @Field(() => Int)
  perception: number;

  @Field(() => Int)
  concealment: number;

  @Field(() => Int, { nullable: true })
  wealth?: number;

  @Field(() => Race)
  race: Race;

  @Field(() => Gender)
  gender: Gender;

  @Field(() => Size)
  size: Size;

  @Field(() => LifeForce)
  lifeForce: LifeForce;

  @Field(() => Composition)
  composition: Composition;

  @Field(() => [MobFlag])
  mobFlags: MobFlag[];

  @Field(() => [EffectFlag])
  effectFlags: EffectFlag[];

  @Field(() => [MobTrait])
  traits: MobTrait[];

  @Field(() => [MobBehavior])
  behaviors: MobBehavior[];

  @Field({ nullable: true, description: 'Lua formula for aggression targeting' })
  aggressionFormula?: string;

  @Field({ nullable: true, description: 'Lua formula for activity restrictions' })
  activityRestrictions?: string;

  @Field(() => GraphQLJSON, { description: 'JSON resistances map: {"FIRE": 0, "charm": 50}' })
  resistances: Record<string, number>;

  @Field(() => Position)
  position: Position;

  @Field(() => Stance)
  stance: Stance;

  @Field(() => Int, { nullable: true })
  classId?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@InputType()
export class CreateMobInput {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field(() => Int)
  @IsNumber()
  zoneId: number;

  @Field(() => [String])
  @IsArray()
  keywords: string[];

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  roomDescription: string;

  @Field()
  @IsString()
  examineDescription: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  level?: number;

  @Field(() => MobRole, { defaultValue: MobRole.NORMAL })
  @IsOptional()
  @IsEnum(MobRole)
  role?: MobRole;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  alignment?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  hitRoll?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  armorClass?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  attackPower?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  spellPower?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  penetrationFlat?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  penetrationPercent?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  evasion?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  armorRating?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  damageReductionPercent?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  soak?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  hardness?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  wardPercent?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  resistanceFire?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  resistanceCold?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  resistanceLightning?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  resistanceAcid?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  resistancePoison?: number;

  @Field({
    nullable: true,
    description:
      'HP dice (e.g., "10d8+50"). If not provided, calculated from level/race/class.',
  })
  @IsOptional()
  @IsString()
  hpDice?: string;

  @Field({
    nullable: true,
    description:
      'Damage dice (e.g., "5d10+20"). If not provided, calculated from level/race/class.',
  })
  @IsOptional()
  @IsString()
  damageDice?: string;

  @Field(() => DamageType, { defaultValue: DamageType.HIT })
  @IsOptional()
  @IsEnum(DamageType)
  damageType?: DamageType;

  @Field(() => Int, { defaultValue: 13 })
  @IsOptional()
  @IsNumber()
  strength?: number;

  @Field(() => Int, { defaultValue: 13 })
  @IsOptional()
  @IsNumber()
  intelligence?: number;

  @Field(() => Int, { defaultValue: 13 })
  @IsOptional()
  @IsNumber()
  wisdom?: number;

  @Field(() => Int, { defaultValue: 13 })
  @IsOptional()
  @IsNumber()
  dexterity?: number;

  @Field(() => Int, { defaultValue: 13 })
  @IsOptional()
  @IsNumber()
  constitution?: number;

  @Field(() => Int, { defaultValue: 13 })
  @IsOptional()
  @IsNumber()
  charisma?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  perception?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  concealment?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  wealth?: number;

  @Field(() => Race, { defaultValue: Race.HUMANOID })
  @IsOptional()
  @IsEnum(Race)
  race?: Race;

  @Field(() => Gender, { defaultValue: Gender.NEUTRAL })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => Size, { defaultValue: Size.MEDIUM })
  @IsOptional()
  @IsEnum(Size)
  size?: Size;

  @Field(() => LifeForce, { defaultValue: LifeForce.LIFE })
  @IsOptional()
  @IsEnum(LifeForce)
  lifeForce?: LifeForce;

  @Field(() => Composition, { defaultValue: Composition.FLESH })
  @IsOptional()
  @IsEnum(Composition)
  composition?: Composition;

  @Field(() => [MobFlag], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(MobFlag, { each: true })
  mobFlags?: MobFlag[];

  @Field(() => [EffectFlag], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(EffectFlag, { each: true })
  effectFlags?: EffectFlag[];

  @Field(() => [MobTrait], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(MobTrait, { each: true })
  traits?: MobTrait[];

  @Field(() => [MobBehavior], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(MobBehavior, { each: true })
  behaviors?: MobBehavior[];

  @Field({ nullable: true, description: 'Lua formula for aggression targeting' })
  @IsOptional()
  @IsString()
  aggressionFormula?: string;

  @Field({ nullable: true, description: 'Lua formula for activity restrictions' })
  @IsOptional()
  @IsString()
  activityRestrictions?: string;

  @Field(() => GraphQLJSON, {
    nullable: true,
    defaultValue: {},
    description: 'JSON resistances map: {"FIRE": 0, "charm": 50}',
  })
  @IsOptional()
  resistances?: Record<string, number>;

  @Field(() => Position, { defaultValue: Position.STANDING })
  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @Field(() => Stance, { defaultValue: Stance.ALERT })
  @IsOptional()
  @IsEnum(Stance)
  stance?: Stance;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  classId?: number;
}

@ObjectType()
export class MobCombatDefaultsDto {
  @Field()
  hpDice: string;

  @Field()
  damageDice: string;

  @Field(() => Int)
  hpDiceNum: number;

  @Field(() => Int)
  hpDiceSize: number;

  @Field(() => Int)
  hpDiceBonus: number;

  @Field(() => Int)
  damageDiceNum: number;

  @Field(() => Int)
  damageDiceSize: number;

  @Field(() => Int)
  damageDiceBonus: number;
}

@InputType()
export class UpdateMobInput {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  keywords?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  roomDescription?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  examineDescription?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  level?: number;

  @Field(() => MobRole, { nullable: true })
  @IsOptional()
  @IsEnum(MobRole)
  role?: MobRole;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  alignment?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  hitRoll?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  armorClass?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  attackPower?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  spellPower?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  penetrationFlat?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  penetrationPercent?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  evasion?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  armorRating?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  damageReductionPercent?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  soak?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  hardness?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  wardPercent?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  resistanceFire?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  resistanceCold?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  resistanceLightning?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  resistanceAcid?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  resistancePoison?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  hpDice?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  damageDice?: string;

  @Field(() => DamageType, { nullable: true })
  @IsOptional()
  @IsEnum(DamageType)
  damageType?: DamageType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  strength?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  intelligence?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  wisdom?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  dexterity?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  constitution?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  charisma?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  perception?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  concealment?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  wealth?: number;

  @Field(() => Race, { nullable: true })
  @IsOptional()
  @IsEnum(Race)
  race?: Race;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => Size, { nullable: true })
  @IsOptional()
  @IsEnum(Size)
  size?: Size;

  @Field(() => LifeForce, { nullable: true })
  @IsOptional()
  @IsEnum(LifeForce)
  lifeForce?: LifeForce;

  @Field(() => Composition, { nullable: true })
  @IsOptional()
  @IsEnum(Composition)
  composition?: Composition;

  @Field(() => [MobFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(MobFlag, { each: true })
  mobFlags?: MobFlag[];

  @Field(() => [EffectFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(EffectFlag, { each: true })
  effectFlags?: EffectFlag[];

  @Field(() => [MobTrait], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(MobTrait, { each: true })
  traits?: MobTrait[];

  @Field(() => [MobBehavior], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(MobBehavior, { each: true })
  behaviors?: MobBehavior[];

  @Field({ nullable: true, description: 'Lua formula for aggression targeting' })
  @IsOptional()
  @IsString()
  aggressionFormula?: string;

  @Field({ nullable: true, description: 'Lua formula for activity restrictions' })
  @IsOptional()
  @IsString()
  activityRestrictions?: string;

  @Field(() => GraphQLJSON, { nullable: true, description: 'JSON resistances map' })
  @IsOptional()
  resistances?: Record<string, number>;

  @Field(() => Position, { nullable: true })
  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @Field(() => Stance, { nullable: true })
  @IsOptional()
  @IsEnum(Stance)
  stance?: Stance;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  classId?: number;
}
