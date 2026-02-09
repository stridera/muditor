import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  Direction,
  ExitFlag,
  ExitState,
  MagicAffinity,
  PositionMechanic,
  Sector,
} from '@prisma/client';
import {
  IsArray,
  IsBoolean,
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
registerEnumType(ExitFlag, { name: 'ExitFlag' });
registerEnumType(ExitState, { name: 'ExitState' });
registerEnumType(MagicAffinity, { name: 'MagicAffinity' });
registerEnumType(PositionMechanic, { name: 'PositionMechanic' });

@ObjectType()
export class RoomExitDto {
  @Field()
  id: string;

  @Field(() => Direction)
  direction: Direction;

  @Field({ nullable: true })
  description?: string;

  // Deprecated single keyword field retained for backward compatibility
  @Field({ nullable: true, deprecationReason: 'Use keywords array instead' })
  keyword?: string;

  @Field(() => [String], { defaultValue: [] })
  keywords: string[];

  @Field(() => [ExitFlag], { defaultValue: [] })
  flags: ExitFlag[];

  @Field(() => ExitState, { defaultValue: ExitState.OPEN })
  defaultState: ExitState;

  @Field(() => Int, { nullable: true })
  hitPoints?: number;

  @Field({ nullable: true })
  key?: string;

  @Field(() => Int, { nullable: true })
  toZoneId?: number;

  @Field(() => Int, { nullable: true })
  toRoomId?: number;

  @Field(() => Int)
  roomZoneId: number;

  @Field(() => Int)
  roomId: number;
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

  // Canonical field (reverted decision): description
  @Field()
  description: string;

  // Deprecated alias retained for backward compatibility
  @Field({ deprecationReason: 'Use description instead' })
  roomDescription: string;

  @Field(() => Sector)
  sector: Sector;

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

  // Lighting & environment
  @Field(() => Int, { defaultValue: 0 })
  baseLightLevel: number;

  @Field(() => Int, { defaultValue: 10 })
  capacity: number;

  @Field(() => MagicAffinity, { nullable: true })
  magicAffinity?: MagicAffinity;

  @Field(() => PositionMechanic, { nullable: true })
  requiredMechanic?: PositionMechanic;

  @Field({ nullable: true })
  entryRestriction?: string;

  // Room property flags
  @Field({ defaultValue: false })
  isPeaceful: boolean;

  @Field({ defaultValue: true })
  allowsMagic: boolean;

  @Field({ defaultValue: true })
  allowsRecall: boolean;

  @Field({ defaultValue: true })
  allowsSummon: boolean;

  @Field({ defaultValue: true })
  allowsTeleport: boolean;

  @Field({ defaultValue: false })
  isDeathTrap: boolean;

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
  description: string;

  // Optional deprecated alias (will be ignored if description provided)
  @Field({ nullable: true, deprecationReason: 'Use description instead' })
  @IsOptional()
  @IsString()
  roomDescription?: string;

  @Field(() => Sector, { defaultValue: Sector.STRUCTURE })
  @IsOptional()
  @IsEnum(Sector)
  sector?: Sector;

  @Field(() => Int)
  @IsNumber()
  zoneId: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  baseLightLevel?: number;

  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @IsInt()
  capacity?: number;

  @Field(() => MagicAffinity, { nullable: true })
  @IsOptional()
  @IsEnum(MagicAffinity)
  magicAffinity?: MagicAffinity;

  @Field(() => PositionMechanic, { nullable: true })
  @IsOptional()
  @IsEnum(PositionMechanic)
  requiredMechanic?: PositionMechanic;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  entryRestriction?: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isPeaceful?: boolean;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  allowsMagic?: boolean;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  allowsRecall?: boolean;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  allowsSummon?: boolean;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  allowsTeleport?: boolean;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isDeathTrap?: boolean;
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
  description?: string;

  @Field({ nullable: true, deprecationReason: 'Use description instead' })
  @IsOptional()
  @IsString()
  roomDescription?: string; // legacy alias

  @Field(() => Sector, { nullable: true })
  @IsOptional()
  @IsEnum(Sector)
  sector?: Sector;

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

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  baseLightLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  capacity?: number;

  @Field(() => MagicAffinity, { nullable: true })
  @IsOptional()
  @IsEnum(MagicAffinity)
  magicAffinity?: MagicAffinity;

  @Field(() => PositionMechanic, { nullable: true })
  @IsOptional()
  @IsEnum(PositionMechanic)
  requiredMechanic?: PositionMechanic;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  entryRestriction?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPeaceful?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowsMagic?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowsRecall?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowsSummon?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  allowsTeleport?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isDeathTrap?: boolean;
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
  @IsString({ each: true })
  keywords?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  key?: string;

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

  @Field(() => ExitState, { nullable: true, defaultValue: ExitState.OPEN })
  @IsOptional()
  @IsEnum(ExitState)
  defaultState?: ExitState;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  hitPoints?: number;
}
