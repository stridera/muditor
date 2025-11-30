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
  MobFlag,
  Position,
  Race,
  Size,
  Stance,
} from '@prisma/client';
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

@ObjectType()
export class MobDto {
  @Field(() => Int)
  id: number;

  @Field(() => [String])
  keywords: string[];

  @Field()
  role: string;

  @Field()
  shortDesc: string;

  @Field()
  longDesc: string;

  @Field()
  description: string;

  @Field(() => [MobFlag])
  mobFlags: MobFlag[];

  @Field(() => [EffectFlag])
  effectFlags: EffectFlag[];

  @Field(() => Int)
  alignment: number;

  @Field(() => Int)
  level: number;

  @Field(() => Int)
  armorClass: number;

  @Field(() => Int)
  hitRoll: number;

  @Field(() => Int)
  move: number;

  @Field(() => Int)
  hpDiceNum: number;

  @Field(() => Int)
  hpDiceSize: number;

  @Field(() => Int)
  hpDiceBonus: number;

  @Field(() => Int)
  estimatedHp: number;

  @Field(() => Int)
  damageDiceNum: number;

  @Field(() => Int)
  damageDiceSize: number;

  @Field(() => Int)
  damageDiceBonus: number;

  @Field(() => Int)
  copper: number;

  @Field(() => Int)
  silver: number;

  @Field(() => Int)
  gold: number;

  @Field(() => Int)
  platinum: number;

  @Field(() => Position)
  position: Position;

  @Field(() => Position)
  defaultPosition: Position;

  @Field(() => Gender)
  gender: Gender;

  @Field(() => Race, { nullable: true })
  race?: Race;

  @Field(() => Int)
  raceAlign: number;

  @Field(() => Size)
  size: Size;

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

  @Field(() => LifeForce)
  lifeForce: LifeForce;

  @Field(() => Composition)
  composition: Composition;

  @Field(() => Stance)
  stance: Stance;

  @Field(() => DamageType)
  damageType: DamageType;

  @Field(() => Int)
  zoneId: number;

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

  @Field(() => [String])
  @IsArray()
  keywords: string[];

  @Field()
  @IsString()
  role: string;

  @Field()
  @IsString()
  shortDesc: string;

  @Field()
  @IsString()
  longDesc: string;

  @Field()
  @IsString()
  description: string;

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

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  alignment?: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  level?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  armorClass?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  hitRoll?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  move?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  hpDiceNum?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  hpDiceSize?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  hpDiceBonus?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  estimatedHp?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  damageDiceNum?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  damageDiceSize?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  damageDiceBonus?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  copper?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  silver?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  gold?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  platinum?: number;

  @Field(() => Position, { defaultValue: Position.STANDING })
  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @Field(() => Position, { defaultValue: Position.STANDING })
  @IsOptional()
  @IsEnum(Position)
  defaultPosition?: Position;

  @Field(() => Gender, { defaultValue: Gender.NEUTRAL })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => Race, { nullable: true })
  @IsOptional()
  @IsEnum(Race)
  race?: Race;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  raceAlign?: number;

  @Field(() => Size, { defaultValue: Size.MEDIUM })
  @IsOptional()
  @IsEnum(Size)
  size?: Size;

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

  @Field(() => LifeForce, { defaultValue: LifeForce.LIFE })
  @IsOptional()
  @IsEnum(LifeForce)
  lifeForce?: LifeForce;

  @Field(() => Composition, { defaultValue: Composition.FLESH })
  @IsOptional()
  @IsEnum(Composition)
  composition?: Composition;

  @Field(() => Stance, { defaultValue: Stance.ALERT })
  @IsOptional()
  @IsEnum(Stance)
  stance?: Stance;

  @Field(() => DamageType, { defaultValue: DamageType.HIT })
  @IsOptional()
  @IsEnum(DamageType)
  damageType?: DamageType;

  @Field(() => Int)
  @IsNumber()
  zoneId: number;
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
  role?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shortDesc?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  longDesc?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

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

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  alignment?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  level?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  armorClass?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  hitRoll?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  move?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  hpDiceNum?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  hpDiceSize?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  hpDiceBonus?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  estimatedHp?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  damageDiceNum?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  damageDiceSize?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  damageDiceBonus?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  copper?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  silver?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  gold?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  platinum?: number;

  @Field(() => Position, { nullable: true })
  @IsOptional()
  @IsEnum(Position)
  position?: Position;

  @Field(() => Position, { nullable: true })
  @IsOptional()
  @IsEnum(Position)
  defaultPosition?: Position;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => Race, { nullable: true })
  @IsOptional()
  @IsEnum(Race)
  race?: Race;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  raceAlign?: number;

  @Field(() => Size, { nullable: true })
  @IsOptional()
  @IsEnum(Size)
  size?: Size;

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

  @Field(() => LifeForce, { nullable: true })
  @IsOptional()
  @IsEnum(LifeForce)
  lifeForce?: LifeForce;

  @Field(() => Composition, { nullable: true })
  @IsOptional()
  @IsEnum(Composition)
  composition?: Composition;

  @Field(() => Stance, { nullable: true })
  @IsOptional()
  @IsEnum(Stance)
  stance?: Stance;

  @Field(() => DamageType, { nullable: true })
  @IsOptional()
  @IsEnum(DamageType)
  damageType?: DamageType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  zoneId?: number;
}
