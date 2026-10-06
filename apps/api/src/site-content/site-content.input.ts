import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { SiteContentKind } from '@muditor/db';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MESSAGE =
  'slug must be lowercase letters, digits and single hyphens (e.g. "new-player-guide")';

@InputType({ description: 'Input for creating site content' })
export class CreateSiteContentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  slug: string;

  @Field(() => SiteContentKind)
  @IsEnum(SiteContentKind)
  kind: SiteContentKind;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary?: string;

  @Field({ description: 'Markdown body' })
  @IsString()
  @IsNotEmpty()
  body: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  published: boolean;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  sortOrder: number;
}

@InputType({ description: 'Input for updating site content' })
export class UpdateSiteContentInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  slug?: string;

  @Field(() => SiteContentKind, { nullable: true })
  @IsEnum(SiteContentKind)
  @IsOptional()
  kind?: SiteContentKind;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  body?: string;

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
