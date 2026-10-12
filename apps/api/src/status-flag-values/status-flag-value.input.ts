import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Max,
  Min,
} from 'class-validator';

export const FLAG_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const FLAG_MESSAGE =
  'flag must be lowercase letters, digits and single underscores (e.g. "major_paralysis")';
const MAX_AI_VALUE = 100000;

@InputType({ description: 'Input for creating a status flag value' })
export class CreateStatusFlagValueInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(FLAG_PATTERN, { message: FLAG_MESSAGE })
  flag: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  @Min(-MAX_AI_VALUE)
  @Max(MAX_AI_VALUE)
  aiValue: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  preventsMovement: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  preventsCasting: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  preventsSpeaking: boolean;
}

@InputType({ description: 'Input for updating a status flag value' })
export class UpdateStatusFlagValueInput {
  @Field(() => Int)
  @IsInt()
  @Min(-MAX_AI_VALUE)
  @Max(MAX_AI_VALUE)
  aiValue: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  preventsMovement?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  preventsCasting?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  preventsSpeaking?: boolean;
}
