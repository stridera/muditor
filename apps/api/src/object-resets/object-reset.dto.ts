import { ObjectType, Field, Int, ID, InputType, Float } from '@nestjs/graphql';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ObjectSummaryDto, RoomSummaryDto } from '../mobs/mob-reset.dto';

@ObjectType()
export class ObjectResetContentDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'Id of the content row this one sits inside; null = directly inside the reset object',
  })
  parentContentId?: number;

  @Field(() => Int)
  objectZoneId: number;

  @Field(() => Int)
  objectId: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int, {
    description: 'World-wide cap on live copies of this object',
  })
  maxInstances: number;

  @Field({ nullable: true })
  comment?: string;

  @Field(() => ObjectSummaryDto)
  object: ObjectSummaryDto;
}

@ObjectType()
export class ObjectResetDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int)
  zoneId: number;

  @Field(() => Int)
  objectZoneId: number;

  @Field(() => Int)
  objectId: number;

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

  @Field(() => ObjectSummaryDto)
  object: ObjectSummaryDto;

  @Field(() => RoomSummaryDto, { nullable: true })
  room?: RoomSummaryDto;

  @Field(() => [ObjectResetContentDto], {
    description:
      'Items spawned inside this container (flat list, nested via parentContentId)',
  })
  contents: ObjectResetContentDto[];
}

@InputType()
export class CreateObjectResetInput {
  @Field(() => Int, { description: 'Zone that owns the reset (needs WRITE)' })
  @IsInt()
  @Min(0)
  zoneId: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  objectZoneId: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  objectId: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  roomZoneId: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  roomId: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxInstances?: number;

  @Field(() => Float, { defaultValue: 1.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.0, { message: 'Probability must be between 0.0 and 1.0' })
  @Max(1.0, { message: 'Probability must be between 0.0 and 1.0' })
  probability?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;
}

@InputType()
export class UpdateObjectResetInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxInstances?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.0, { message: 'Probability must be between 0.0 and 1.0' })
  @Max(1.0, { message: 'Probability must be between 0.0 and 1.0' })
  probability?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  comment?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  roomZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  roomId?: number;
}
