import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'Per spell circle tuning (slot recovery time)',
})
export class SpellCircleDto {
  @Field(() => Int, { description: 'Spell circle, 1-14' })
  circle: number;

  @Field(() => Int, {
    nullable: true,
    description:
      'Base seconds a spent slot of this circle takes to recover (before the caster focus ' +
      'rate; the ability memorization time is added on top). NULL means the built-in value',
  })
  recoverSecs?: number | null;
}
