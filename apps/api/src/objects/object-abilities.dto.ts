import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** One spell slot on a potion / scroll / wand / staff (`ObjectAbilities` row). */
@ObjectType()
export class ObjectAbilityDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  abilityId: number;

  /** Display name of the ability (may carry colour markup). */
  @Field()
  abilityName: string;

  /** Plain, unique key of the ability, e.g. `CURE_LIGHT`. */
  @Field()
  abilityPlainName: string;

  @Field(() => Int)
  level: number;

  /** Wands and staves only; NULL means unlimited. */
  @Field(() => Int, { nullable: true })
  charges?: number;
}

@InputType()
export class ObjectAbilityInput {
  @Field(() => Int)
  @IsInt()
  abilityId: number;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  @Max(1000)
  level: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  charges?: number | null;
}
