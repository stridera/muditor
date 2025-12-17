import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';

@InputType({ description: 'Input for creating a new help entry' })
export class CreateHelpEntryInput {
  @Field(() => [String], {
    description: 'Keywords for looking up this help entry',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  keywords: string[];

  @Field({ description: 'Primary display title' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @Field({ description: 'Full help text content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field(() => Int, {
    defaultValue: 0,
    description: 'Minimum player level to view',
  })
  @IsInt()
  @Min(0)
  minLevel: number;

  @Field({
    nullable: true,
    description: 'Category (e.g., spell, skill, command)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string;

  @Field({ nullable: true, description: 'Usage syntax' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  usage?: string;

  @Field({ nullable: true, description: 'Duration description' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  duration?: string;

  @Field({ nullable: true, description: 'Spell sphere' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sphere?: string;

  @Field(() => GraphQLJSON, {
    nullable: true,
    description: 'Class/circle requirements',
  })
  @IsOptional()
  classes?: Record<string, number>;
}

@InputType({ description: 'Input for updating a help entry' })
export class UpdateHelpEntryInput {
  @Field(() => [String], {
    nullable: true,
    description: 'Keywords for looking up this help entry',
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  keywords?: string[];

  @Field({ nullable: true, description: 'Primary display title' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @Field({ nullable: true, description: 'Full help text content' })
  @IsString()
  @IsOptional()
  content?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Minimum player level to view',
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  minLevel?: number;

  @Field({
    nullable: true,
    description: 'Category (e.g., spell, skill, command)',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  category?: string;

  @Field({ nullable: true, description: 'Usage syntax' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  usage?: string;

  @Field({ nullable: true, description: 'Duration description' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  duration?: string;

  @Field({ nullable: true, description: 'Spell sphere' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  sphere?: string;

  @Field(() => GraphQLJSON, {
    nullable: true,
    description: 'Class/circle requirements',
  })
  @IsOptional()
  classes?: Record<string, number>;
}

@InputType({ description: 'Filter options for help entries' })
export class HelpEntryFilterInput {
  @Field({ nullable: true, description: 'Filter by category' })
  @IsString()
  @IsOptional()
  category?: string;

  @Field({ nullable: true, description: 'Filter by sphere' })
  @IsString()
  @IsOptional()
  sphere?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Maximum minLevel to include',
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  maxMinLevel?: number;
}
