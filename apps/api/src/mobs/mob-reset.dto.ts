import { Field, Float, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Prisma } from '@muditor/db';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { MOB_GEAR_SLOT_LABELS, MOB_GEAR_SLOT_MESSAGE } from './mob-gear-slots';

@ObjectType()
export class ObjectAffectDto {
  @Field()
  location: string;

  @Field(() => Int)
  modifier: number;
}

@ObjectType()
export class ObjectSummaryDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  zoneId: number;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field(() => Int, { nullable: true })
  cost?: number;

  @Field({ nullable: true })
  examineDescription?: string;

  @Field(() => Number, { nullable: true })
  weight?: number;

  @Field(() => Int, { nullable: true })
  level?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  values?: Prisma.JsonValue;

  @Field(() => [String], { nullable: true })
  flags?: string[];

  @Field(() => [String], { nullable: true })
  wearFlags?: string[];

  @Field(() => [ObjectAffectDto], { nullable: true })
  objectAffects?: ObjectAffectDto[];
}

@ObjectType()
export class MobSummaryDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  zoneId: number;

  @Field()
  name: string;
}

@ObjectType()
export class RoomSummaryDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  zoneId: number;

  @Field()
  name: string;
}

@ObjectType()
export class MobResetEquipmentContentDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'Id of the content row this one sits inside; null = directly inside the equipment item',
  })
  parentContentId?: number;

  @Field(() => Int)
  objectZoneId: number;

  @Field(() => Int)
  objectId: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int, {
    description: 'World-wide cap on live copies of this object (legacy P max)',
  })
  maxInstances: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => ObjectSummaryDto)
  object: ObjectSummaryDto;
}

@ObjectType()
export class MobResetEquipmentDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  objectZoneId: number;

  @Field(() => Int)
  objectId: number;

  /** Free-text slot label (NULL = carried); tolerant of legacy labels. */
  @Field(() => String, { nullable: true })
  wearLocation?: string;

  @Field(() => Int)
  maxInstances: number;

  @Field(() => Float)
  probability: number;

  @Field({
    description:
      'Decorative gear shows on the mob but cannot be looted or stolen',
  })
  decorative: boolean;

  @Field(() => ObjectSummaryDto, { description: 'The object being equipped' })
  object: ObjectSummaryDto;

  @Field(() => [MobResetEquipmentContentDto], {
    description:
      'Items spawned inside this carried or worn container (flat list, nested via parentContentId)',
  })
  contents: MobResetEquipmentContentDto[];
}

@ObjectType()
export class MobResetDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  zoneId: number;

  @Field(() => Int)
  mobZoneId: number;

  @Field(() => Int)
  mobId: number;

  @Field(() => Int)
  roomZoneId: number;

  @Field(() => Int)
  roomId: number;

  @Field(() => Int)
  maxInstances: number;

  @Field(() => Float)
  probability: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => [MobResetEquipmentDto])
  equipment: MobResetEquipmentDto[];

  @Field(() => MobSummaryDto, { nullable: true })
  mob?: MobSummaryDto;

  @Field(() => RoomSummaryDto, { nullable: true })
  room?: RoomSummaryDto;
}

// Input types for creating/updating equipment
@InputType()
export class CreateMobResetEquipmentInput {
  @Field(() => Int)
  @IsInt()
  objectZoneId: number;

  @Field(() => Int)
  @IsInt()
  objectId: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(MOB_GEAR_SLOT_LABELS, { message: MOB_GEAR_SLOT_MESSAGE })
  wearLocation?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1, { message: 'maxInstances must be at least 1' })
  maxInstances: number = 1;

  @Field(() => Float, { defaultValue: 1.0 })
  @IsNumber()
  @Min(0, { message: 'probability must be between 0 and 1' })
  @Max(1, { message: 'probability must be between 0 and 1' })
  probability: number = 1.0;
}

@InputType()
export class CreateMobResetInput {
  @Field(() => Int)
  @IsInt()
  zoneId: number;

  @Field(() => Int)
  @IsInt()
  mobZoneId: number;

  @Field(() => Int)
  @IsInt()
  mobId: number;

  @Field(() => Int)
  @IsInt()
  roomZoneId: number;

  @Field(() => Int)
  @IsInt()
  roomId: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  @Min(1, { message: 'maxInstances must be at least 1' })
  maxInstances: number = 1;

  @Field(() => Float, { defaultValue: 1.0 })
  @IsNumber()
  @Min(0, { message: 'probability must be between 0 and 1' })
  @Max(1, { message: 'probability must be between 0 and 1' })
  probability: number = 1.0;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;

  @Field(() => [CreateMobResetEquipmentInput], {
    nullable: true,
    defaultValue: [],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMobResetEquipmentInput)
  equipment?: CreateMobResetEquipmentInput[];
}

@InputType()
export class UpdateMobResetEquipmentInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @Type(() => Number) // GraphQL ID arrives as a string
  @IsInt()
  id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  objectZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  objectId?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(MOB_GEAR_SLOT_LABELS, { message: MOB_GEAR_SLOT_MESSAGE })
  wearLocation?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'maxInstances must be at least 1' })
  maxInstances?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'probability must be between 0 and 1' })
  @Max(1, { message: 'probability must be between 0 and 1' })
  probability?: number;
}

@InputType()
export class UpdateMobResetInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'maxInstances must be at least 1' })
  maxInstances?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'probability must be between 0 and 1' })
  @Max(1, { message: 'probability must be between 0 and 1' })
  probability?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  roomZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  roomId?: number;

  @Field(() => [UpdateMobResetEquipmentInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateMobResetEquipmentInput)
  equipment?: UpdateMobResetEquipmentInput[];
}

/**
 * One item inside a container: the container reset's object (or equipment
 * object), or another content row when parentContentId is set.
 */
@InputType()
export class ResetContentInput {
  @Field(() => Int)
  @IsInt()
  @Min(0)
  objectZoneId: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  objectId: number;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 1,
    description: 'World-wide cap on live copies of this object',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxInstances?: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'Content row this item sits inside; omit for directly inside the container',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  parentContentId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;
}

@InputType()
export class UpdateResetContentInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxInstances?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;
}
