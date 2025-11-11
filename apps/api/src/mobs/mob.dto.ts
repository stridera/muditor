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

  @Field({ description: 'Mob class identifier (e.g., NORMAL)' })
  mobClass: string;

  @Field()
  roomDescription: string;

  @Field()
  examineDescription: string;

  @Field(() => Int)
  level: number;

  @Field(() => Int)
  alignment: number;

  @Field(() => Int)
  hitRoll: number;

  @Field(() => Int)
  armorClass: number;

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

  @Field({ defaultValue: '1d8+0' })
  @IsOptional()
  @IsString()
  hpDice?: string;

  @Field({ defaultValue: '1d4+0' })
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
