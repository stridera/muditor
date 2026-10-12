import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const MIN_SPELL_CIRCLE = 1;
export const MAX_SPELL_CIRCLE = 14;
export const MAX_RECOVER_SECS = 86_400;

@ArgsType()
export class SetSpellCircleRecoverArgs {
  @Field(() => Int)
  @IsInt()
  @Min(MIN_SPELL_CIRCLE)
  @Max(MAX_SPELL_CIRCLE)
  circle: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(MAX_RECOVER_SECS)
  recoverSecs?: number | null;
}
