import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { Effect } from '../abilities/abilities.dto';

@ObjectType()
export class MobDefaultEffectDto {
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
}

@InputType()
export class MobDefaultEffectInput {
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
}
