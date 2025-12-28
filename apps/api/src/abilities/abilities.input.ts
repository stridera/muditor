import { Field, InputType, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  Position,
  TargetType,
  TargetScope,
  SaveType,
  SpellSphere,
  ElementType,
} from '@prisma/client';

@InputType()
export class CreateAbilityInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ defaultValue: 'SPELL' })
  abilityType: string;

  @Field(() => Int, { nullable: true })
  schoolId?: number;

  @Field(() => Position, { defaultValue: Position.STANDING })
  minPosition: Position;

  @Field({ defaultValue: false })
  violent: boolean;

  @Field({ defaultValue: true })
  combatOk: boolean;

  @Field(() => Int, { defaultValue: 1 })
  castTimeRounds: number;

  @Field(() => Int, { defaultValue: 0 })
  cooldownMs: number;

  @Field({ defaultValue: false })
  inCombatOnly: boolean;

  @Field({ defaultValue: false })
  isArea: boolean;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [String], { defaultValue: [] })
  tags: string[];

  @Field({ nullable: true })
  luaScript?: string;

  // Spell metadata
  @Field(() => SpellSphere, { nullable: true })
  sphere?: SpellSphere;

  @Field(() => ElementType, { nullable: true })
  damageType?: ElementType;

  @Field(() => Int, { nullable: true })
  pages?: number;

  @Field(() => Int, { defaultValue: 0 })
  memorizationTime: number;

  @Field({ defaultValue: false })
  questOnly: boolean;

  @Field({ defaultValue: false })
  humanoidOnly: boolean;
}

@InputType()
export class UpdateAbilityInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  abilityType?: string;

  @Field(() => Int, { nullable: true })
  schoolId?: number;

  @Field(() => Position, { nullable: true })
  minPosition?: Position;

  @Field({ nullable: true })
  violent?: boolean;

  @Field({ nullable: true })
  combatOk?: boolean;

  @Field(() => Int, { nullable: true })
  castTimeRounds?: number;

  @Field(() => Int, { nullable: true })
  cooldownMs?: number;

  @Field({ nullable: true })
  inCombatOnly?: boolean;

  @Field({ nullable: true })
  isArea?: boolean;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field({ nullable: true })
  luaScript?: string;

  // Spell metadata
  @Field(() => SpellSphere, { nullable: true })
  sphere?: SpellSphere;

  @Field(() => ElementType, { nullable: true })
  damageType?: ElementType;

  @Field(() => Int, { nullable: true })
  pages?: number;

  @Field(() => Int, { nullable: true })
  memorizationTime?: number;

  @Field({ nullable: true })
  questOnly?: boolean;

  @Field({ nullable: true })
  humanoidOnly?: boolean;
}

@InputType()
export class CreateAbilityEffectInput {
  @Field(() => Int)
  abilityId: number;

  @Field(() => Int)
  effectId: number;

  @Field(() => GraphQLJSON, { nullable: true })
  overrideParams?: any;

  @Field(() => Int, { defaultValue: 0 })
  order: number;

  @Field({ nullable: true })
  trigger?: string;

  @Field(() => Int, { defaultValue: 100 })
  chancePct: number;

  @Field({ nullable: true })
  condition?: string;
}

@InputType()
export class AbilityEffectItemInput {
  @Field(() => Int)
  effectId: number;

  @Field(() => GraphQLJSON, { nullable: true })
  overrideParams?: any;

  @Field(() => Int)
  order: number;

  @Field({ nullable: true })
  trigger?: string;

  @Field(() => Int, { defaultValue: 100 })
  chancePct: number;

  @Field({ nullable: true })
  condition?: string;
}

@InputType()
export class UpdateAbilityEffectsInput {
  @Field(() => [AbilityEffectItemInput])
  effects: AbilityEffectItemInput[];
}

@InputType()
export class CreateAbilityTargetingInput {
  @Field(() => Int)
  abilityId: number;

  @Field(() => [TargetType], { defaultValue: [TargetType.SELF] })
  validTargets: TargetType[];

  @Field(() => TargetScope, { defaultValue: TargetScope.SINGLE })
  scope: TargetScope;

  @Field({ nullable: true })
  scopePattern?: string;

  @Field(() => Int, { defaultValue: 1 })
  maxTargets: number;

  @Field(() => Int, { defaultValue: 0 })
  range: number;

  @Field({ defaultValue: false })
  requireLos: boolean;
}

@InputType()
export class UpdateAbilityTargetingInput {
  @Field(() => [TargetType], { nullable: true })
  validTargets?: TargetType[];

  @Field(() => TargetScope, { nullable: true })
  scope?: TargetScope;

  @Field({ nullable: true })
  scopePattern?: string;

  @Field(() => Int, { nullable: true })
  maxTargets?: number;

  @Field(() => Int, { nullable: true })
  range?: number;

  @Field({ nullable: true })
  requireLos?: boolean;
}

@InputType()
export class CreateAbilitySavingThrowInput {
  @Field(() => Int)
  abilityId: number;

  @Field(() => SaveType, { defaultValue: SaveType.SPELL })
  saveType: SaveType;

  @Field()
  dcFormula: string;

  @Field(() => GraphQLJSON, { defaultValue: 'NEGATE' })
  onSaveAction: any;
}

@InputType()
export class CreateAbilityMessagesInput {
  @Field(() => Int)
  abilityId: number;

  @Field({ nullable: true })
  startToCaster?: string;

  @Field({ nullable: true })
  startToVictim?: string;

  @Field({ nullable: true })
  startToRoom?: string;

  @Field({ nullable: true })
  successToCaster?: string;

  @Field({ nullable: true })
  successToVictim?: string;

  @Field({ nullable: true })
  successToRoom?: string;

  @Field({ nullable: true })
  successToSelf?: string;

  @Field({ nullable: true })
  successSelfRoom?: string;

  @Field({ nullable: true })
  failToCaster?: string;

  @Field({ nullable: true })
  failToVictim?: string;

  @Field({ nullable: true })
  failToRoom?: string;

  @Field({ nullable: true })
  wearoffToTarget?: string;

  @Field({ nullable: true })
  wearoffToRoom?: string;

  @Field({ nullable: true })
  lookMessage?: string;
}

@InputType()
export class UpdateAbilityMessagesInput {
  @Field({ nullable: true })
  startToCaster?: string;

  @Field({ nullable: true })
  startToVictim?: string;

  @Field({ nullable: true })
  startToRoom?: string;

  @Field({ nullable: true })
  successToCaster?: string;

  @Field({ nullable: true })
  successToVictim?: string;

  @Field({ nullable: true })
  successToRoom?: string;

  @Field({ nullable: true })
  successToSelf?: string;

  @Field({ nullable: true })
  successSelfRoom?: string;

  @Field({ nullable: true })
  failToCaster?: string;

  @Field({ nullable: true })
  failToVictim?: string;

  @Field({ nullable: true })
  failToRoom?: string;

  @Field({ nullable: true })
  wearoffToTarget?: string;

  @Field({ nullable: true })
  wearoffToRoom?: string;

  @Field({ nullable: true })
  lookMessage?: string;
}

// Effect inputs
@InputType()
export class CreateEffectInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  effectType: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  defaultParams?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  paramSchema?: any;
}

@InputType()
export class UpdateEffectInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  effectType?: string;

  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  defaultParams?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  paramSchema?: any;
}
