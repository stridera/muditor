import { Field, InputType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  Allow,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Position,
  Prisma,
  TargetType,
  TargetScope,
  SaveType,
  SpellSphere,
  ElementType,
} from '@muditor/db';

// Empty string is accepted on update/create as "clear" (stored as NULL).
const PROMPT_LETTER_PATTERN = /^[A-Za-z]?$/;
const PROMPT_LETTER_MESSAGE = 'promptLetter must be a single letter';

@InputType()
export class CreateAbilityInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ defaultValue: 'SPELL' })
  @IsString()
  abilityType: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  schoolId?: number;

  @Field(() => Position, { defaultValue: Position.STANDING })
  @IsEnum(Position)
  minPosition: Position;

  @Field({ defaultValue: false })
  @IsBoolean()
  violent: boolean;

  @Field({ defaultValue: true })
  @IsBoolean()
  combatOk: boolean;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  castTimeRounds: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  cooldownMs: number;

  @Field(() => String, {
    nullable: true,
    description: 'Prompt cooldown-bar letter (%d<letter>); one ASCII letter',
  })
  @IsString()
  @IsOptional()
  @Matches(PROMPT_LETTER_PATTERN, { message: PROMPT_LETTER_MESSAGE })
  promptLetter?: string | null;

  @Field({ defaultValue: false })
  @IsBoolean()
  inCombatOnly: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  isArea: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  luaScript?: string;

  // Spell metadata
  @Field(() => SpellSphere, { nullable: true })
  @IsOptional()
  @IsEnum(SpellSphere)
  sphere?: SpellSphere;

  @Field(() => ElementType, { nullable: true })
  @IsOptional()
  @IsEnum(ElementType)
  damageType?: ElementType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  pages?: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  memorizationTime: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  questOnly: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  humanoidOnly: boolean;
}

@InputType()
export class UpdateAbilityInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, {
    nullable: true,
    description: 'Omit to leave unchanged; null clears',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  abilityType?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'Omit to leave unchanged; null clears',
  })
  @IsOptional()
  @IsInt()
  schoolId?: number | null;

  @Field(() => Position, { nullable: true })
  @IsOptional()
  @IsEnum(Position)
  minPosition?: Position;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  violent?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  combatOk?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  castTimeRounds?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cooldownMs?: number;

  @Field(() => String, {
    nullable: true,
    description: 'Prompt cooldown-bar letter; pass null or empty to clear',
  })
  @IsString()
  @IsOptional()
  @Matches(PROMPT_LETTER_PATTERN, { message: PROMPT_LETTER_MESSAGE })
  promptLetter?: string | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  inCombatOnly?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isArea?: boolean;

  @Field(() => String, {
    nullable: true,
    description: 'Omit to leave unchanged; null clears',
  })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  luaScript?: string;

  // Spell metadata
  @Field(() => SpellSphere, {
    nullable: true,
    description: 'Omit to leave unchanged; null clears',
  })
  @IsOptional()
  @IsEnum(SpellSphere)
  sphere?: SpellSphere | null;

  @Field(() => ElementType, {
    nullable: true,
    description: 'Omit to leave unchanged; null clears',
  })
  @IsOptional()
  @IsEnum(ElementType)
  damageType?: ElementType | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Omit to leave unchanged; null clears',
  })
  @IsOptional()
  @IsInt()
  pages?: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  memorizationTime?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  questOnly?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  humanoidOnly?: boolean;
}

@InputType()
export class CreateAbilityEffectInput {
  @Field(() => Int)
  @IsInt()
  abilityId: number;

  @Field(() => Int)
  @IsInt()
  effectId: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @Allow()
  overrideParams?: Prisma.InputJsonValue;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  order: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  trigger?: string;

  @Field(() => Int, { defaultValue: 100 })
  @IsInt()
  chancePct: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  condition?: string;
}

// The global ValidationPipe whitelists with forbidNonWhitelisted, so every
// property here needs a class-validator decorator or the whole mutation is
// rejected with "property effects should not exist".
@InputType()
export class AbilityEffectItemInput {
  @Field(() => Int)
  @IsInt()
  effectId: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  overrideParams?: Prisma.InputJsonValue;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  order: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  trigger?: string;

  @Field(() => Int, { defaultValue: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  chancePct: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  condition?: string;
}

@InputType()
export class UpdateAbilityEffectsInput {
  @Field(() => [AbilityEffectItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AbilityEffectItemInput)
  effects: AbilityEffectItemInput[];
}

@InputType()
export class CreateAbilityTargetingInput {
  @Field(() => Int)
  @IsInt()
  abilityId: number;

  @Field(() => [TargetType], { defaultValue: [TargetType.SELF] })
  @IsArray()
  @IsEnum(TargetType, { each: true })
  validTargets: TargetType[];

  @Field(() => TargetScope, { defaultValue: TargetScope.SINGLE })
  @IsEnum(TargetScope)
  scope: TargetScope;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  scopePattern?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsInt()
  maxTargets: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  range: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  requireLos: boolean;
}

@InputType()
export class UpdateAbilityTargetingInput {
  @Field(() => [TargetType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(TargetType, { each: true })
  validTargets?: TargetType[];

  @Field(() => TargetScope, { nullable: true })
  @IsOptional()
  @IsEnum(TargetScope)
  scope?: TargetScope;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  scopePattern?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  maxTargets?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  range?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requireLos?: boolean;
}

@InputType()
export class CreateAbilitySavingThrowInput {
  @Field(() => Int)
  @IsInt()
  abilityId: number;

  @Field(() => SaveType, { defaultValue: SaveType.WILL })
  @IsEnum(SaveType)
  saveType: SaveType;

  @Field()
  @IsString()
  dcFormula: string;

  @Field(() => GraphQLJSON, { defaultValue: 'NEGATE' })
  @Allow()
  onSaveAction: Prisma.InputJsonValue;
}

@InputType()
export class CreateAbilityMessagesInput {
  @Field(() => Int)
  @IsInt()
  abilityId: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startToCaster?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startToVictim?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startToRoom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  successToCaster?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  successToVictim?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  successToRoom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  successToSelf?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  successSelfRoom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  failToCaster?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  failToVictim?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  failToRoom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  wearoffToTarget?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  wearoffToRoom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lookMessage?: string;
}

@InputType()
export class UpdateAbilityMessagesInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startToCaster?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startToVictim?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startToRoom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  successToCaster?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  successToVictim?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  successToRoom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  successToSelf?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  successSelfRoom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  failToCaster?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  failToVictim?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  failToRoom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  wearoffToTarget?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  wearoffToRoom?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lookMessage?: string;
}

// Effect inputs
@InputType()
export class CreateEffectInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsString()
  effectType: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @Allow()
  defaultParams?: Prisma.InputJsonValue;
}

@InputType()
export class UpdateEffectInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  effectType?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @Allow()
  defaultParams?: Prisma.InputJsonValue;
}
