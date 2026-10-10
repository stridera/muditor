import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsInt, IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import type { Prisma } from '@muditor/db';

/** Target selectors a rule can aim at (see mob-ai-rules.ts). */
export enum MobAiTarget {
  AUTO = 'AUTO',
  SELF = 'SELF',
  TANK = 'TANK',
  WEAKEST_ATTACKER = 'WEAKEST_ATTACKER',
  CASTER = 'CASTER',
  MOST_BUFFED = 'MOST_BUFFED',
  LOWEST_ALLY = 'LOWEST_ALLY',
  ROOM = 'ROOM',
}
registerEnumType(MobAiTarget, { name: 'MobAiTarget' });

@ObjectType()
export class AiRuleAbilityDto {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  abilityType: string;
}

@ObjectType({ description: 'One AI rule shared by every mob of a class' })
export class ClassAiRuleDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  classId: number;

  @Field(() => Int)
  abilityId: number;

  @Field(() => AiRuleAbilityDto)
  ability: AiRuleAbilityDto;

  @Field(() => Int, { description: 'Lower runs first' })
  priority: number;

  @Field(() => Int)
  chancePct: number;

  @Field(() => Int)
  cooldownS: number;

  @Field(() => GraphQLJSON, { nullable: true })
  conditions?: Prisma.JsonValue | null;

  @Field({ description: 'Raw stored selector (see MobAiTarget)' })
  target: string;

  @Field(() => Int, { nullable: true })
  minLevel?: number | null;

  @Field()
  enabled: boolean;
}

@ObjectType({ description: 'One AI rule of a single mob (MobAbilities row)' })
export class MobAiRuleDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  mobZoneId: number;

  @Field(() => Int)
  mobId: number;

  @Field(() => Int)
  abilityId: number;

  @Field(() => AiRuleAbilityDto)
  ability: AiRuleAbilityDto;

  @Field(() => Int, { description: 'Lower runs first' })
  priority: number;

  @Field(() => Int)
  chancePct: number;

  @Field(() => Int)
  cooldownS: number;

  @Field(() => GraphQLJSON, { nullable: true })
  conditions?: Prisma.JsonValue | null;

  @Field(() => String, {
    nullable: true,
    description: 'Raw stored selector; null means AUTO',
  })
  target?: string | null;

  @Field({ description: 'MobAbilities.known; the runtime skips disabled rows' })
  enabled: boolean;
}

@InputType()
export class CreateClassAiRuleInput {
  @Field(() => Int)
  @IsInt()
  classId: number;

  @Field(() => Int)
  @IsInt()
  abilityId: number;

  @Field(() => Int, {
    nullable: true,
    description: 'Defaults to after the last rule of the class',
  })
  @IsOptional()
  @IsInt()
  priority?: number;

  @Field(() => Int, { defaultValue: 100 })
  @IsInt()
  chancePct: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsInt()
  cooldownS: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditions?: Prisma.JsonValue | null;

  @Field(() => MobAiTarget, { defaultValue: MobAiTarget.AUTO })
  @IsEnum(MobAiTarget)
  target: MobAiTarget;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  minLevel?: number | null;

  @Field({ defaultValue: true })
  @IsBoolean()
  enabled: boolean;
}

@InputType({
  description:
    'Partial update; omitted fields are left alone. conditions replaces the stored object, so send the full merged object (unknown keys the rule already has are accepted).',
})
export class UpdateClassAiRuleInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  abilityId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  priority?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  chancePct?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cooldownS?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditions?: Prisma.JsonValue | null;

  @Field(() => MobAiTarget, { nullable: true })
  @IsOptional()
  @IsEnum(MobAiTarget)
  target?: MobAiTarget;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  minLevel?: number | null;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

@InputType({
  description:
    'Create or update the rule for one ability on a mob (one rule per mob and ability). On update omitted fields are left alone.',
})
export class SaveMobAiRuleInput {
  @Field(() => Int)
  @IsInt()
  abilityId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  priority?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  chancePct?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cooldownS?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  conditions?: Prisma.JsonValue | null;

  @Field(() => MobAiTarget, { nullable: true })
  @IsOptional()
  @IsEnum(MobAiTarget)
  target?: MobAiTarget;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
