import { InputType, Field, Int } from '@nestjs/graphql';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsArray,
} from 'class-validator';
import {
  ConfigValueType,
  SystemTextCategory,
  LoginStage,
} from '@prisma/client';

// ============================================
// GameConfig Inputs
// ============================================

@InputType({ description: 'Input for updating a game configuration value' })
export class UpdateGameConfigInput {
  @Field({ description: 'New value for this configuration' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @Field({ nullable: true, description: 'Updated description' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}

// ============================================
// LevelDefinition Inputs
// ============================================

@InputType({ description: 'Input for updating a level definition' })
export class UpdateLevelDefinitionInput {
  @Field({ nullable: true, description: 'Display name for this level' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @Field(() => Int, { nullable: true, description: 'Experience required' })
  @IsInt()
  @IsOptional()
  @Min(0)
  expRequired?: number;

  @Field(() => Int, { nullable: true, description: 'HP gained at this level' })
  @IsInt()
  @IsOptional()
  @Min(0)
  hpGain?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Stamina gained at this level',
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  staminaGain?: number;

  @Field(() => [String], {
    nullable: true,
    description: 'Permissions for this level',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}

// ============================================
// SystemText Inputs
// ============================================

@InputType({ description: 'Input for creating system text' })
export class CreateSystemTextInput {
  @Field({ description: 'Unique key identifier' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  key: string;

  @Field(() => SystemTextCategory, { description: 'Text category' })
  @IsEnum(SystemTextCategory)
  category: SystemTextCategory;

  @Field({ nullable: true, description: 'Display title' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @Field({ description: 'Text content' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field(() => Int, { defaultValue: 0, description: 'Minimum level to view' })
  @IsInt()
  @Min(0)
  @Max(105)
  minLevel: number;

  @Field({ defaultValue: true, description: 'Whether this text is active' })
  @IsBoolean()
  isActive: boolean;
}

@InputType({ description: 'Input for updating system text' })
export class UpdateSystemTextInput {
  @Field(() => SystemTextCategory, {
    nullable: true,
    description: 'Text category',
  })
  @IsEnum(SystemTextCategory)
  @IsOptional()
  category?: SystemTextCategory;

  @Field({ nullable: true, description: 'Display title' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @Field({ nullable: true, description: 'Text content' })
  @IsString()
  @IsOptional()
  content?: string;

  @Field(() => Int, { nullable: true, description: 'Minimum level to view' })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(105)
  minLevel?: number;

  @Field({ nullable: true, description: 'Whether this text is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ============================================
// LoginMessage Inputs
// ============================================

@InputType({ description: 'Input for creating a login message' })
export class CreateLoginMessageInput {
  @Field(() => LoginStage, { description: 'Login flow stage' })
  @IsEnum(LoginStage)
  stage: LoginStage;

  @Field({ defaultValue: 'default', description: 'Message variant' })
  @IsString()
  @MaxLength(50)
  variant: string;

  @Field({ description: 'Message content' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @Field({ defaultValue: true, description: 'Whether this message is active' })
  @IsBoolean()
  isActive: boolean;
}

@InputType({ description: 'Input for updating a login message' })
export class UpdateLoginMessageInput {
  @Field({ nullable: true, description: 'Message content' })
  @IsString()
  @IsOptional()
  message?: string;

  @Field({ nullable: true, description: 'Whether this message is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
