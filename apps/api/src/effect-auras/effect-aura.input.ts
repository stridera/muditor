import { Field, InputType, Int } from '@nestjs/graphql';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const SLUG_PATTERN = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;
const SLUG_MESSAGE =
  'slug must be lowercase letters, digits and single hyphens/underscores (e.g. "sanctuary")';

@InputType({ description: 'Input for creating an effect aura' })
export class CreateEffectAuraInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  slug: string;

  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  keys: string[];

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  needsDetectMagic: boolean;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  exclusiveGroup?: string | null;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  minAlignment?: number | null;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  maxAlignment?: number | null;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  sortOrder: number;
}

@InputType({ description: 'Input for updating an effect aura' })
export class UpdateEffectAuraInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(100)
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  slug?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsOptional()
  keys?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(500)
  text?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  needsDetectMagic?: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Pass null or empty to clear',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  exclusiveGroup?: string | null;

  @Field(() => Int, { nullable: true, description: 'Pass null to clear' })
  @IsInt()
  @IsOptional()
  minAlignment?: number | null;

  @Field(() => Int, { nullable: true, description: 'Pass null to clear' })
  @IsInt()
  @IsOptional()
  maxAlignment?: number | null;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
