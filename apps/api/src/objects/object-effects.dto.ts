import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ElementType, WearFlag } from '@muditor/db';
import GraphQLJSON from 'graphql-type-json';
import { Effect } from '../abilities/abilities.dto';

// --- ObjectEffects (granted when worn/held) ---

@ObjectType()
export class ObjectEffectDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  effectId: number;

  @Field(() => Effect)
  effect: Effect;

  @Field(() => Int)
  strength: number;

  @Field(() => GraphQLJSON)
  modifierData: any;

  @Field(() => WearFlag, { nullable: true })
  wearLocation?: WearFlag;
}

@InputType()
export class ObjectEffectInput {
  @Field(() => Int)
  @IsNumber()
  effectId: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  strength?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  modifierData?: any;

  @Field(() => WearFlag, { nullable: true })
  @IsOptional()
  @IsEnum(WearFlag)
  wearLocation?: WearFlag;
}

// --- ObjectResistance (element resistance bonuses) ---

@ObjectType()
export class ObjectResistanceDto {
  @Field(() => Int)
  id: number;

  @Field(() => ElementType)
  element: ElementType;

  @Field(() => Int)
  value: number;

  @Field()
  allowAbsorption: boolean;
}

@InputType()
export class ObjectResistanceInput {
  @Field(() => ElementType)
  @IsEnum(ElementType)
  element: ElementType;

  @Field(() => Int)
  @IsNumber()
  value: number;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  allowAbsorption?: boolean;
}

// --- ConsumableEffect (food/drink/potion effects) ---

@ObjectType()
export class ConsumableEffectDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  effectId: number;

  @Field(() => Effect)
  effect: Effect;

  @Field(() => Float)
  chance: number;

  @Field(() => Int)
  level: number;

  @Field(() => Int, { nullable: true })
  duration?: number;
}

@InputType()
export class ConsumableEffectInput {
  @Field(() => Int)
  @IsNumber()
  effectId: number;

  @Field(() => Float, { defaultValue: 1.0 })
  @IsOptional()
  @IsNumber()
  chance?: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  level?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  duration?: number;
}
