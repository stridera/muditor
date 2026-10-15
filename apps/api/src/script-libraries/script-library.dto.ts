import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * Library names are what scripts pass to `require("<name>")`. Lowercase only,
 * so lookups never depend on case; the game does an exact string match.
 */
export const LIBRARY_NAME_PATTERN = /^[a-z0-9_\-./]+$/;
export const LIBRARY_NAME_MAX_LENGTH = 64;
export const LIBRARY_NAME_MESSAGE =
  'name must be 1-64 characters of lowercase letters, digits, "_", "-", "." or "/"';

@ObjectType()
export class ScriptLibraryDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int, { nullable: true })
  zoneId?: number | null;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field()
  code: string;

  @Field(() => Int)
  lineCount: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  createdBy?: string | null;

  @Field(() => String, { nullable: true })
  updatedBy?: string | null;
}

@InputType()
export class CreateScriptLibraryInput {
  @Field()
  @IsString()
  @MaxLength(LIBRARY_NAME_MAX_LENGTH, { message: LIBRARY_NAME_MESSAGE })
  @Matches(LIBRARY_NAME_PATTERN, { message: LIBRARY_NAME_MESSAGE })
  name: string;

  @Field(() => Int, {
    nullable: true,
    description:
      'Owning zone. Omit for a global library (HEAD_BUILDER and above only).',
  })
  @IsOptional()
  @IsInt()
  zoneId?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field()
  @IsString()
  code: string;
}

@InputType()
export class UpdateScriptLibraryInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(LIBRARY_NAME_MAX_LENGTH, { message: LIBRARY_NAME_MESSAGE })
  @Matches(LIBRARY_NAME_PATTERN, { message: LIBRARY_NAME_MESSAGE })
  name?: string;

  @Field(() => Int, {
    nullable: true,
    description:
      'Move to another zone. Null makes the library global (HEAD_BUILDER and above only); omit to keep it.',
  })
  @IsOptional()
  @IsInt()
  zoneId?: number | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  code?: string;
}
