import { Field, ObjectType, ID, Int, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import {
  Position,
  SaveType,
  TargetType,
  TargetScope,
  SkillCategory,
  SpellSphere,
  ElementType,
} from '@prisma/client';

// Register enums with GraphQL (Position already registered in mob.dto.ts)
registerEnumType(SaveType, { name: 'SaveType' });
registerEnumType(TargetType, { name: 'TargetType' });
registerEnumType(TargetScope, { name: 'TargetScope' });
registerEnumType(SkillCategory, { name: 'SkillCategory' });
registerEnumType(SpellSphere, { name: 'SpellSphere' });
registerEnumType(ElementType, { name: 'ElementType' });

@ObjectType()
export class AbilitySchool {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class Effect {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  effectType: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => GraphQLJSON)
  defaultParams: any;

  @Field(() => GraphQLJSON, { nullable: true })
  paramSchema?: any;
}

@ObjectType()
export class AbilityEffect {
  @Field(() => ID)
  abilityId: number;

  @Field(() => ID)
  effectId: number;

  @Field(() => Effect)
  effect: Effect;

  @Field(() => GraphQLJSON, { nullable: true })
  overrideParams?: any;

  @Field(() => Int)
  order: number;

  @Field({ nullable: true })
  trigger?: string;

  @Field(() => Int)
  chancePct: number;

  @Field({ nullable: true })
  condition?: string;
}

@ObjectType()
export class AbilityTargeting {
  @Field(() => [TargetType])
  validTargets: TargetType[];

  @Field(() => TargetScope)
  scope: TargetScope;

  @Field({ nullable: true })
  scopePattern?: string;

  @Field(() => Int)
  maxTargets: number;

  @Field(() => Int)
  range: number;

  @Field()
  requireLos: boolean;
}

@ObjectType()
export class AbilityRestrictions {
  @Field(() => [GraphQLJSON])
  requirements: any[];

  @Field({ nullable: true })
  customRequirementLua?: string;
}

@ObjectType()
export class AbilitySavingThrow {
  @Field(() => ID)
  id: number;

  @Field(() => SaveType)
  saveType: SaveType;

  @Field()
  dcFormula: string;

  @Field(() => GraphQLJSON)
  onSaveAction: any;
}

@ObjectType()
export class AbilityMessages {
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
  failToCaster?: string;

  @Field({ nullable: true })
  failToVictim?: string;

  @Field({ nullable: true })
  failToRoom?: string;

  @Field({ nullable: true })
  wearoffToTarget?: string;

  @Field({ nullable: true })
  wearoffToRoom?: string;
}

@ObjectType()
export class Ability {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  abilityType: string;

  @Field(() => Int, { nullable: true })
  schoolId?: number;

  @Field(() => AbilitySchool, { nullable: true })
  school?: AbilitySchool;

  @Field(() => Position)
  minPosition: Position;

  @Field()
  violent: boolean;

  @Field()
  combatOk: boolean;

  @Field(() => Int)
  castTimeRounds: number;

  @Field(() => Int)
  cooldownMs: number;

  @Field()
  inCombatOnly: boolean;

  @Field()
  isArea: boolean;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => [String])
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

  @Field(() => Int)
  memorizationTime: number;

  @Field()
  questOnly: boolean;

  @Field()
  humanoidOnly: boolean;

  // Relations
  @Field(() => [AbilityEffect], { nullable: true })
  effects?: AbilityEffect[];

  @Field(() => AbilityTargeting, { nullable: true })
  targeting?: AbilityTargeting;

  @Field(() => AbilityRestrictions, { nullable: true })
  restrictions?: AbilityRestrictions;

  @Field(() => [AbilitySavingThrow], { nullable: true })
  savingThrows?: AbilitySavingThrow[];

  @Field(() => AbilityMessages, { nullable: true })
  messages?: AbilityMessages;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
