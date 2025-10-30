import {
  ObjectType,
  Field,
  Int,
  InputType,
  Float,
} from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { MobDto } from '../mobs/mob.dto';
import { MobEquipmentSetDto } from '../equipment-sets/equipment-set.dto';
import { SpawnConditionDto } from '../object-resets/object-reset.dto';

@ObjectType()
export class MobResetDto {
  @Field()
  id: string;

  @Field(() => Int)
  max: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int)
  mobId: number;

  @Field(() => Int)
  roomId: number;

  @Field(() => Int)
  zoneId: number;

  @Field(() => Float)
  probability: number;

  @Field(() => MobDto)
  mob: MobDto;

  @Field(() => [MobEquipmentSetDto])
  equipmentSets: MobEquipmentSetDto[];

  @Field(() => [SpawnConditionDto])
  conditions: SpawnConditionDto[];
}

@InputType()
export class CreateMobResetInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Max must be at least 1' })
  max?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int)
  @IsNumber()
  mobId: number;

  @Field(() => Int)
  @IsNumber()
  roomId: number;

  @Field(() => Int)
  @IsNumber()
  zoneId: number;

  @Field(() => Float, { defaultValue: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.0, { message: 'Probability must be between 0.0 and 1.0' })
  @Max(1.0, { message: 'Probability must be between 0.0 and 1.0' })
  probability?: number;

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  equipmentSetIds?: string[];
}

@InputType()
export class UpdateMobResetInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Max must be at least 1' })
  max?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.0, { message: 'Probability must be between 0.0 and 1.0' })
  @Max(1.0, { message: 'Probability must be between 0.0 and 1.0' })
  probability?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  equipmentSetIds?: string[];
}