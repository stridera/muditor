import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

// DTO for Board
@ObjectType()
export class BoardDto {
  @Field(() => Int)
  id: number;

  @Field()
  alias: string;

  @Field()
  title: string;

  @Field()
  locked: boolean;

  @Field(() => GraphQLJSON)
  privileges: unknown;

  @Field(() => [BoardMessageDto], { nullable: true })
  messages?: BoardMessageDto[] | null;

  @Field(() => Int, { nullable: true })
  messageCount?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

// DTO for BoardMessage
@ObjectType()
export class BoardMessageDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  boardId: number;

  @Field(() => BoardDto, { nullable: true })
  board?: BoardDto;

  @Field()
  poster: string;

  @Field(() => Int)
  posterLevel: number;

  @Field(() => Date)
  postedAt: Date;

  @Field()
  subject: string;

  @Field()
  content: string;

  @Field()
  sticky: boolean;

  @Field(() => [BoardMessageEditDto], { nullable: true })
  edits?: BoardMessageEditDto[] | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

// DTO for BoardMessageEdit
@ObjectType()
export class BoardMessageEditDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  messageId: number;

  @Field()
  editor: string;

  @Field(() => Date)
  editedAt: Date;
}

// Input for creating a new message
@InputType()
export class CreateBoardMessageInput {
  @Field(() => Int)
  @IsNumber()
  boardId: number;

  @Field()
  @IsString()
  poster: string;

  @Field(() => Int)
  @IsNumber()
  posterLevel: number;

  @Field()
  @IsString()
  subject: string;

  @Field()
  @IsString()
  content: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  sticky?: boolean;
}

// Input for updating a message
@InputType()
export class UpdateBoardMessageInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  subject?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  sticky?: boolean;
}

// Input for creating a board
@InputType()
export class CreateBoardInput {
  @Field()
  @IsString()
  alias: string;

  @Field()
  @IsString()
  title: string;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  privileges?: unknown;
}

// Input for updating a board
@InputType()
export class UpdateBoardInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  locked?: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  privileges?: unknown;
}
