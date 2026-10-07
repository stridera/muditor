import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DialogueMatchType } from '@muditor/db';

// DialogueMatchType is registered with GraphQL in quest.dto.ts.

@ObjectType()
export class DialogueResponseDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  nodeId: number;

  @Field(() => Int, { nullable: true })
  nextNodeId?: number;

  @Field(() => DialogueMatchType)
  matchType: DialogueMatchType;

  @Field(() => [String])
  matchKeywords: string[];

  @Field({ nullable: true })
  displayHint?: string;

  @Field(() => Int)
  order: number;
}

@ObjectType()
export class DialogueNodeDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  dialogueTreeId: number;

  @Field()
  npcMessage: string;

  @Field(() => Int)
  order: number;

  @Field(() => Boolean)
  isRoot: boolean;

  @Field(() => Boolean)
  isTerminal: boolean;

  @Field(() => [DialogueResponseDto])
  responses: DialogueResponseDto[];
}

@ObjectType()
export class DialogueTreeDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [DialogueNodeDto])
  nodes: DialogueNodeDto[];
}

@InputType()
export class UpdateDialogueTreeInput {
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
export class CreateDialogueNodeInput {
  @Field()
  @IsString()
  npcMessage: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isTerminal?: boolean;
}

@InputType()
export class UpdateDialogueNodeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  npcMessage?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isTerminal?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description:
      'true makes this the tree root (the previous root is demoted); false is refused',
  })
  @IsOptional()
  @IsBoolean()
  isRoot?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  order?: number;
}

@InputType()
export class CreateDialogueResponseInput {
  @Field(() => DialogueMatchType, { defaultValue: DialogueMatchType.CONTAINS })
  @IsOptional()
  @IsEnum(DialogueMatchType)
  matchType?: DialogueMatchType;

  @Field(() => [String])
  @IsArray()
  matchKeywords: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  nextNodeId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  displayHint?: string;
}

@InputType()
export class UpdateDialogueResponseInput {
  @Field(() => DialogueMatchType, { nullable: true })
  @IsOptional()
  @IsEnum(DialogueMatchType)
  matchType?: DialogueMatchType;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  matchKeywords?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  nextNodeId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  displayHint?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  order?: number;
}
