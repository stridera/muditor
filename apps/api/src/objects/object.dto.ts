import {
  ObjectType,
  Field,
  Int,
  InputType,
  registerEnumType,
  Float,
} from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
} from 'class-validator';
import {
  Alignment,
  ObjectFlag,
  ObjectRestriction,
  ObjectType as ObjectTypeEnum,
  Race,
  Size,
  WearFlag,
} from '@muditor/db';
import { Prisma } from '@muditor/db';
import GraphQLJSON from 'graphql-type-json';
import {
  ObjectEffectDto,
  ObjectResistanceDto,
  ConsumableEffectDto,
} from './object-effects.dto';

// Register GraphQL enums
registerEnumType(ObjectTypeEnum, { name: 'ObjectType' });
registerEnumType(ObjectFlag, { name: 'ObjectFlag' });
registerEnumType(WearFlag, { name: 'WearFlag' });
registerEnumType(ObjectRestriction, { name: 'ObjectRestriction' });
registerEnumType(Alignment, { name: 'Alignment' });

@ObjectType()
export class ObjectDto {
  @Field(() => Int)
  id: number;

  @Field(() => ObjectTypeEnum)
  type: ObjectTypeEnum;

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

  @Field({ nullable: true })
  actionDescription?: string;

  @Field({ nullable: true })
  plainActionDescription?: string;

  @Field(() => [ObjectFlag])
  flags: ObjectFlag[];

  @Field(() => [WearFlag])
  wearFlags: WearFlag[];

  @Field(() => [ObjectRestriction])
  restrictions: ObjectRestriction[];

  @Field(() => [Int])
  restrictedClassIds: number[];

  @Field(() => [Alignment])
  restrictedAlignments: Alignment[];

  @Field(() => [Race])
  restrictedRaces: Race[];

  @Field(() => [Race])
  allowedRaces: Race[];

  @Field(() => Size, { nullable: true })
  minSize?: Size;

  @Field(() => Size, { nullable: true })
  maxSize?: Size;

  @Field(() => Int, { nullable: true })
  passengerCapacity?: number;

  @Field({ nullable: true })
  presenceOverride?: string;

  @Field(() => Float)
  weight: number;

  @Field(() => Int)
  cost: number;

  @Field(() => Int)
  timer: number;

  @Field(() => Int)
  decomposeTimer: number;

  @Field(() => Int)
  level: number;

  @Field(() => Int)
  concealment: number;

  @Field(() => GraphQLJSON)
  values: Prisma.JsonValue;

  @Field(() => Int)
  zoneId: number;

  @Field(() => [ObjectEffectDto], { defaultValue: [] })
  grantedEffects: ObjectEffectDto[];

  @Field(() => [ObjectResistanceDto], { defaultValue: [] })
  objectResistances: ObjectResistanceDto[];

  @Field(() => [ConsumableEffectDto], { defaultValue: [] })
  consumableEffects: ConsumableEffectDto[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@InputType()
export class CreateObjectInput {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field(() => Int)
  @IsNumber()
  zoneId: number;

  @Field(() => ObjectTypeEnum, { defaultValue: ObjectTypeEnum.NOTHING })
  @IsOptional()
  @IsEnum(ObjectTypeEnum)
  type?: ObjectTypeEnum;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actionDescription?: string;

  @Field(() => [ObjectFlag], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(ObjectFlag, { each: true })
  flags?: ObjectFlag[];

  @Field(() => [WearFlag], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(WearFlag, { each: true })
  wearFlags?: WearFlag[];

  @Field(() => [ObjectRestriction], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(ObjectRestriction, { each: true })
  restrictions?: ObjectRestriction[];

  @Field(() => [Int], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  restrictedClassIds?: number[];

  @Field(() => [Alignment], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(Alignment, { each: true })
  restrictedAlignments?: Alignment[];

  @Field(() => [Race], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(Race, { each: true })
  restrictedRaces?: Race[];

  @Field(() => [Race], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(Race, { each: true })
  allowedRaces?: Race[];

  @Field(() => Size, { nullable: true })
  @IsOptional()
  @IsEnum(Size)
  minSize?: Size;

  @Field(() => Size, { nullable: true })
  @IsOptional()
  @IsEnum(Size)
  maxSize?: Size;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  passengerCapacity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  presenceOverride?: string;

  @Field(() => Float, { defaultValue: 0.0 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  timer?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  decomposeTimer?: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  level?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  concealment?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  values?: Prisma.JsonValue;
}

@InputType()
export class UpdateObjectInput {
  @Field(() => ObjectTypeEnum, { nullable: true })
  @IsOptional()
  @IsEnum(ObjectTypeEnum)
  type?: ObjectTypeEnum;

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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actionDescription?: string;

  @Field(() => [ObjectFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ObjectFlag, { each: true })
  flags?: ObjectFlag[];

  @Field(() => [WearFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(WearFlag, { each: true })
  wearFlags?: WearFlag[];

  @Field(() => [ObjectRestriction], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ObjectRestriction, { each: true })
  restrictions?: ObjectRestriction[];

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  @IsArray()
  restrictedClassIds?: number[];

  @Field(() => [Alignment], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Alignment, { each: true })
  restrictedAlignments?: Alignment[];

  @Field(() => [Race], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Race, { each: true })
  restrictedRaces?: Race[];

  @Field(() => [Race], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(Race, { each: true })
  allowedRaces?: Race[];

  @Field(() => Size, { nullable: true })
  @IsOptional()
  @IsEnum(Size)
  minSize?: Size;

  @Field(() => Size, { nullable: true })
  @IsOptional()
  @IsEnum(Size)
  maxSize?: Size;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  passengerCapacity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  presenceOverride?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  timer?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  decomposeTimer?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  level?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  concealment?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  values?: Prisma.JsonValue;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  zoneId?: number;
}
