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
  ObjectType as ObjectTypeEnum,
  ObjectFlag,
  EffectFlag,
  WearFlag,
} from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

// Register GraphQL enums
registerEnumType(ObjectTypeEnum, { name: 'ObjectType' });
registerEnumType(ObjectFlag, { name: 'ObjectFlag' });
registerEnumType(EffectFlag, { name: 'EffectFlag' });
registerEnumType(WearFlag, { name: 'WearFlag' });

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
  examineDescription: string;

  @Field({ nullable: true })
  actionDesc?: string;

  @Field(() => [ObjectFlag])
  flags: ObjectFlag[];

  @Field(() => [EffectFlag])
  effectFlags: EffectFlag[];

  @Field(() => [WearFlag])
  wearFlags: WearFlag[];

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
  values: any;

  @Field(() => Int)
  zoneId: number;

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
  examineDescription: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actionDesc?: string;

  @Field(() => [ObjectFlag], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(ObjectFlag, { each: true })
  flags?: ObjectFlag[];

  @Field(() => [EffectFlag], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(EffectFlag, { each: true })
  effectFlags?: EffectFlag[];

  @Field(() => [WearFlag], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(WearFlag, { each: true })
  wearFlags?: WearFlag[];

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
  values?: any;
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
  examineDescription?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  actionDesc?: string;

  @Field(() => [ObjectFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ObjectFlag, { each: true })
  flags?: ObjectFlag[];

  @Field(() => [EffectFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(EffectFlag, { each: true })
  effectFlags?: EffectFlag[];

  @Field(() => [WearFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(WearFlag, { each: true })
  wearFlags?: WearFlag[];

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
  values?: any;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  zoneId?: number;
}
