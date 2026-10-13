import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'One summon-mount tier for one alignment side (Paladin = good, Anti-Paladin = evil)',
})
export class MountTypeDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int, {
    description:
      'Tier number; the game takes the highest tier (in ascending order) whose gates the ' +
      'summoner meets, so the lowest tier of a side is its base mount',
  })
  tier: number;

  @Field({ description: '"good" (Paladin) or "evil" (Anti-Paladin)' })
  alignmentSide: string;

  @Field(() => Int, { description: 'Minimum summoner level' })
  minLevel: number;

  @Field(() => Int, {
    description:
      'Alignment magnitude: a good summoner needs alignment >= this, an evil one <= -this',
  })
  minAlignment: number;

  @Field(() => Int, { description: 'Zone of the mount mob prototype' })
  mobZoneId: number;

  @Field(() => Int, { description: 'Id of the mount mob prototype' })
  mobId: number;

  @Field(() => Int, {
    description:
      'Added to the mount max HP (2 x summoner level + a 50-100 roll)',
  })
  hpBonus: number;

  @Field(() => Int, {
    description:
      'Added to the mount max movement (alignment term + a 0-50 roll)',
  })
  mvBonus: number;
}
