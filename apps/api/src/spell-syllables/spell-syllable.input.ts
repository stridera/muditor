import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// The game matches against the lowercased spell name, so syllables must not
// contain uppercase letters. A single space is a legitimate syllable.
const LOWERCASE_PATTERN = /^[^A-Z]+$/;
const LOWERCASE_MESSAGE = 'syllable must be lowercase';
const MAX_SORT_ORDER = 1_000_000;

@InputType({ description: 'Input for creating a spell syllable' })
export class CreateSpellSyllableInput {
  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(-MAX_SORT_ORDER)
  @Max(MAX_SORT_ORDER)
  sortOrder: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(LOWERCASE_PATTERN, { message: LOWERCASE_MESSAGE })
  syllable: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  replacement: string;
}

@InputType({ description: 'Input for updating a spell syllable' })
export class UpdateSpellSyllableInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(-MAX_SORT_ORDER)
  @Max(MAX_SORT_ORDER)
  sortOrder?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(50)
  @Matches(LOWERCASE_PATTERN, { message: LOWERCASE_MESSAGE })
  syllable?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(50)
  replacement?: string;
}
