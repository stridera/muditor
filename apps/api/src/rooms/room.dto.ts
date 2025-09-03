import { ObjectType, Field, Int, InputType, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, IsEnum, IsArray } from 'class-validator';
import { Sector, Direction, RoomFlag } from '@prisma/client';

// Register GraphQL enums
registerEnumType(Sector, { name: 'Sector' });
registerEnumType(Direction, { name: 'Direction' });
registerEnumType(RoomFlag, { name: 'RoomFlag' });

@ObjectType()
export class RoomExitDto {
  @Field()
  id: string;

  @Field(() => Direction)
  direction: Direction;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  keyword?: string;

  @Field({ nullable: true })
  key?: string;

  @Field(() => Int, { nullable: true })
  destination?: number;
}

@ObjectType()
export class RoomExtraDescriptionDto {
  @Field()
  id: string;

  @Field()
  keyword: string;

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
  description: string;

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
  description?: string;

  @Field(() => Sector, { nullable: true })
  @IsOptional()
  @IsEnum(Sector)
  sector?: Sector;

  @Field(() => [RoomFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(RoomFlag, { each: true })
  flags?: RoomFlag[];
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

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  keyword?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  key?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  destination?: number;

  @Field(() => Int)
  @IsNumber()
  roomId: number;
}