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
import { ObjectDto } from '../objects/object.dto';

@ObjectType()
export class EquipmentSetItemDto {
  @Field()
  id: string;

  @Field(() => Int)
  objectId: number;

  @Field({ nullable: true })
  slot?: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  probability: number;

  @Field(() => ObjectDto)
  object: ObjectDto;
}

@ObjectType()
export class EquipmentSetDto {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [EquipmentSetItemDto])
  items: EquipmentSetItemDto[];
}

@ObjectType()
export class MobEquipmentSetDto {
  @Field()
  id: string;

  @Field()
  mobResetId: string;

  @Field()
  equipmentSetId: string;

  @Field(() => Float)
  probability: number;

  @Field(() => EquipmentSetDto)
  equipmentSet: EquipmentSetDto;
}

@InputType()
export class CreateEquipmentSetInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [CreateEquipmentSetItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  items?: CreateEquipmentSetItemInput[];
}

@InputType()
export class UpdateEquipmentSetInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class CreateEquipmentSetItemInput {
  @Field(() => Int)
  @IsNumber()
  objectId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slot?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity?: number;

  @Field(() => Float, { defaultValue: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.0, { message: 'Probability must be between 0.0 and 1.0' })
  @Max(1.0, { message: 'Probability must be between 0.0 and 1.0' })
  probability?: number;
}

@InputType()
export class CreateEquipmentSetItemStandaloneInput {
  @Field()
  @IsString()
  equipmentSetId: string;

  @Field(() => Int)
  @IsNumber()
  objectId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slot?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity?: number;

  @Field(() => Float, { defaultValue: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.0, { message: 'Probability must be between 0.0 and 1.0' })
  @Max(1.0, { message: 'Probability must be between 0.0 and 1.0' })
  probability?: number;
}

@InputType()
export class CreateMobEquipmentSetInput {
  @Field()
  @IsString()
  mobResetId: string;

  @Field()
  @IsString()
  equipmentSetId: string;

  @Field(() => Float, { defaultValue: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.0, { message: 'Probability must be between 0.0 and 1.0' })
  @Max(1.0, { message: 'Probability must be between 0.0 and 1.0' })
  probability?: number;
}