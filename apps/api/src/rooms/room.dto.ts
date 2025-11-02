import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Direction, ExitFlag, RoomFlag, Sector } from '@prisma/client';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MobDto } from '../mobs/mob.dto';
import { ObjectDto } from '../objects/object.dto';
import { ShopDto } from '../shops/shop.dto';

// Register GraphQL enums
registerEnumType(Sector, { name: 'Sector' });
registerEnumType(Direction, { name: 'Direction' });
registerEnumType(RoomFlag, { name: 'RoomFlag' });
registerEnumType(ExitFlag, { name: 'ExitFlag' });

@ObjectType()
export class RoomExitDto {
  @Field()
  id: string;

  @Field(() => Direction)
  direction: Direction;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  keywords?: string[];

  @Field({ nullable: true })
  key?: string;

  @Field(() => Int, { nullable: true })
  toZoneId?: number;

  @Field(() => Int, { nullable: true })
  toRoomId?: number;

  @Field(() => [ExitFlag], { defaultValue: [] })
  flags: ExitFlag[];

  @Field(() => Int)
  roomZoneId: number;

  @Field(() => Int)
  roomId: number;

  @Field(() => Int, { nullable: true })
  destination?: number;
}

@ObjectType()
export class RoomExtraDescriptionDto {
  @Field()
  id: string;

  @Field(() => [String])
  keywords: string[];

  @Field()
  description: string;
}

@ObjectType()
export class RoomDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  roomDescription: string;

  @Field(() => Sector)
  sector: Sector;

  @Field(() => [RoomFlag])
  flags: RoomFlag[];

  @Field(() => Int)
  zoneId: number;

  @Field(() => [RoomExitDto])
  exits: RoomExitDto[];

  @Field(() => [RoomExtraDescriptionDto])
  extraDescs: RoomExtraDescriptionDto[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field({ nullable: true })
  createdBy?: string;

  @Field({ nullable: true })
  updatedBy?: string;

  // 3D Grid coordinates for zone editor (integer-based for MUD grid system)
  @Field(() => Int, { nullable: true })
  layoutX?: number;

  @Field(() => Int, { nullable: true })
  layoutY?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  layoutZ?: number;

  // Related entities (populated by GraphQL field resolvers)
  @Field(() => [MobDto], { defaultValue: [] })
  mobs?: MobDto[];

  @Field(() => [ObjectDto], { defaultValue: [] })
  objects?: ObjectDto[];

  @Field(() => [ShopDto], { defaultValue: [] })
  shops?: ShopDto[];
}

@InputType()
export class CreateRoomInput {
  @Field(() => Int)
  @IsNumber()
  id: number;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  roomDescription: string;

  @Field(() => Sector, { defaultValue: Sector.STRUCTURE })
  @IsOptional()
  @IsEnum(Sector)
  sector?: Sector;

  @Field(() => [RoomFlag], { defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsEnum(RoomFlag, { each: true })
  flags?: RoomFlag[];

  @Field(() => Int)
  @IsNumber()
  zoneId: number;
}

@InputType()
export class UpdateRoomInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  roomDescription?: string;

  @Field(() => Sector, { nullable: true })
  @IsOptional()
  @IsEnum(Sector)
  sector?: Sector;

  @Field(() => [RoomFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(RoomFlag, { each: true })
  flags?: RoomFlag[];

  // 3D Grid coordinates for zone editor (integer-based for MUD grid system)
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  layoutX?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  layoutY?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  layoutZ?: number;
}

@InputType()
export class UpdateRoomPositionInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(-1000, { message: 'X coordinate must be between -1000 and 1000' })
  @Max(1000, { message: 'X coordinate must be between -1000 and 1000' })
  layoutX?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(-1000, { message: 'Y coordinate must be between -1000 and 1000' })
  @Max(1000, { message: 'Y coordinate must be between -1000 and 1000' })
  layoutY?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(-100, { message: 'Z coordinate must be between -100 and 100' })
  @Max(100, { message: 'Z coordinate must be between -100 and 100' })
  layoutZ?: number;
}

@InputType()
export class BatchRoomPositionUpdateInput {
  @Field(() => Int)
  @IsInt()
  zoneId: number;

  @Field(() => Int)
  @IsInt()
  roomId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(-1000, { message: 'X coordinate must be between -1000 and 1000' })
  @Max(1000, { message: 'X coordinate must be between -1000 and 1000' })
  layoutX?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(-1000, { message: 'Y coordinate must be between -1000 and 1000' })
  @Max(1000, { message: 'Y coordinate must be between -1000 and 1000' })
  layoutY?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(-100, { message: 'Z coordinate must be between -100 and 100' })
  @Max(100, { message: 'Z coordinate must be between -100 and 100' })
  layoutZ?: number;
}

@InputType()
export class BatchUpdateRoomPositionsInput {
  @Field(() => [BatchRoomPositionUpdateInput])
  @IsArray()
  updates: BatchRoomPositionUpdateInput[];
}

@ObjectType()
export class BatchUpdateResult {
  @Field(() => Int)
  updatedCount: number;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@InputType()
export class CreateRoomExitInput {
  @Field(() => Direction)
  @IsEnum(Direction)
  direction: Direction;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  keywords?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  key?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  destination?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  toZoneId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  toRoomId?: number;

  @Field(() => Int)
  @IsNumber()
  roomZoneId: number;

  @Field(() => Int)
  @IsNumber()
  roomId: number;
}
