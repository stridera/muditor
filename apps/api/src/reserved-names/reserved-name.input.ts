import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

// Character names are letters only, so a reserved word is too. Input is
// trimmed and lowercased before validation (the game compares case-insensitively).
const NAME_PATTERN = /^[a-z]+$/;

const normalizeName = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

const trimReason = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() || null : value;

@InputType({ description: 'Input for reserving a character name' })
export class CreateReservedNameInput {
  @Field()
  @Transform(normalizeName)
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(NAME_PATTERN, { message: 'name must be a single word of letters' })
  name: string;

  @Field(() => String, { nullable: true })
  @Transform(trimReason)
  @IsString()
  @IsOptional()
  @MaxLength(200)
  reason?: string | null;
}
