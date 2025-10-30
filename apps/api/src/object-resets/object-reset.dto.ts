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
  Min,
  Max,
} from 'class-validator';
import { ObjectDto } from '../objects/object.dto';

@ObjectType()
export class SpawnConditionDto {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field()
  parameters: string; // JSON string for GraphQL compatibility
}

@ObjectType()
export class ObjectResetDto {
  @Field()
  id: string;

  @Field(() => Int)
  max: number;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int)
  objectId: number;

  @Field(() => Int)
  roomId: number;

  @Field(() => Int)
  zoneId: number;

  @Field(() => Float)
  probability: number;

  @Field(() => ObjectDto)
  object: ObjectDto;

  @Field(() => [SpawnConditionDto])
  conditions: SpawnConditionDto[];
}

@InputType()
export class CreateObjectResetInput {
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
  objectId: number;

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
}

@InputType()
export class UpdateObjectResetInput {
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
}

@InputType()
export class CreateSpawnConditionInput {
  @Field()
  @IsString()
  type: string;

  @Field()
  @IsString()
  parameters: string; // JSON string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  mobResetId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  objectResetId?: string;
}