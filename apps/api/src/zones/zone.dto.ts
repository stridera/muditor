import {
  ObjectType,
  Field,
  Int,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { ResetMode, Hemisphere, Climate } from '@prisma/client';

// Enums for GraphQL
export enum ResetModeEnum {
  NEVER = 'NEVER',
  EMPTY = 'EMPTY',
  ALWAYS = 'ALWAYS',
  NORMAL = 'NORMAL',
}

export enum HemisphereEnum {
  NORTH = 'NORTH',
  SOUTH = 'SOUTH',
  NORTHWEST = 'NORTHWEST',
  NORTHEAST = 'NORTHEAST',
  SOUTHWEST = 'SOUTHWEST',
  SOUTHEAST = 'SOUTHEAST',
}

export enum ClimateEnum {
  TEMPERATE = 'TEMPERATE',
  ARCTIC = 'ARCTIC',
  TROPICAL = 'TROPICAL',
  ARID = 'ARID',
  NONE = 'NONE',
}

// Register GraphQL enums
registerEnumType(ResetMode, { name: 'ResetMode' });
registerEnumType(Hemisphere, { name: 'Hemisphere' });
registerEnumType(Climate, { name: 'Climate' });

@ObjectType()
export class ZoneCountsDto {
  @Field(() => Int)
  rooms: number;

  @Field(() => Int)
  mobs: number;

  @Field(() => Int)
  objects: number;

  @Field(() => Int)
  shops: number;
}

@ObjectType()
export class ZoneRoomDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  sector: string;
}

@ObjectType()
export class ZoneDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  top: number;

  @Field(() => Int)
  lifespan: number;

  @Field(() => ResetMode)
  resetMode: ResetMode;

  @Field(() => Hemisphere)
  hemisphere: Hemisphere;

  @Field(() => Climate)
  climate: Climate;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [ZoneRoomDto], { nullable: true })
  rooms?: ZoneRoomDto[];

  @Field(() => ZoneCountsDto, { nullable: true })
  _count?: ZoneCountsDto;
}

@InputType()
export class CreateZoneInput {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field()
  @IsString()
  name: string;

  @Field(() => Int)
  @IsNumber()
  top: number;

  @Field(() => Int, { defaultValue: 30 })
  @IsOptional()
  @IsNumber()
  lifespan?: number;

  @Field(() => ResetMode, { defaultValue: ResetMode.NORMAL })
  @IsOptional()
  @IsEnum(ResetMode)
  resetMode?: ResetMode;

  @Field(() => Hemisphere, { defaultValue: Hemisphere.NORTHWEST })
  @IsOptional()
  @IsEnum(Hemisphere)
  hemisphere?: Hemisphere;

  @Field(() => Climate, { defaultValue: Climate.NONE })
  @IsOptional()
  @IsEnum(Climate)
  climate?: Climate;
}

@InputType()
export class UpdateZoneInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  top?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  lifespan?: number;

  @Field(() => ResetMode, { nullable: true })
  @IsOptional()
  @IsEnum(ResetMode)
  resetMode?: ResetMode;

  @Field(() => Hemisphere, { nullable: true })
  @IsOptional()
  @IsEnum(Hemisphere)
  hemisphere?: Hemisphere;

  @Field(() => Climate, { nullable: true })
  @IsOptional()
  @IsEnum(Climate)
  climate?: Climate;
}
