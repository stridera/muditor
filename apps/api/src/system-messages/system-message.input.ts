import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const IDENT_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const KEY_MESSAGE =
  'key must be lowercase letters, digits and single underscores (e.g. "exp_progress")';
const CATEGORY_MESSAGE =
  'category must be lowercase letters, digits and single underscores (e.g. "weather")';
const MAX_VARIANTS = 500;
const MAX_MESSAGE_LENGTH = 2000;

@InputType({ description: 'Input for creating a system message' })
export class CreateSystemMessageInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(IDENT_PATTERN, { message: KEY_MESSAGE })
  key: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(IDENT_PATTERN, { message: CATEGORY_MESSAGE })
  category: string;

  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_VARIANTS)
  @IsString({ each: true })
  @MaxLength(MAX_MESSAGE_LENGTH, { each: true })
  messages: string[];
}

@InputType({
  description: 'Input for updating a system message (the key cannot change)',
})
export class UpdateSystemMessageInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(50)
  @Matches(IDENT_PATTERN, { message: CATEGORY_MESSAGE })
  category?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_VARIANTS)
  @IsString({ each: true })
  @MaxLength(MAX_MESSAGE_LENGTH, { each: true })
  @IsOptional()
  messages?: string[];
}
