import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { Effect } from '../abilities/abilities.dto';

@ObjectType()
export class RoomEnvironmentalEffectDto {
  @Field(() => Int)
  effectId: number;

  @Field(() => Effect)
  effect: Effect;
}

@InputType()
export class RoomEnvironmentalEffectInput {
  @Field(() => Int)
  @IsNumber()
  effectId: number;
}
