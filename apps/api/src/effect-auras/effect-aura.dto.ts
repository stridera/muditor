import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'Aura flavor line shown when looking at an actor with a matching effect',
})
export class EffectAuraDto {
  @Field(() => ID)
  id: number;

  @Field({ description: 'Unique identifier (e.g., sanctuary)' })
  slug: string;

  @Field(() => [String], {
    description: 'Effect keys that trigger this aura line',
  })
  keys: string[];

  @Field({ description: 'Text shown on look' })
  text: string;

  @Field({ description: 'Only shown to viewers with detect magic' })
  needsDetectMagic: boolean;

  @Field(() => String, {
    nullable: true,
    description:
      'Auras sharing a group are mutually exclusive (only the first by sort order is shown)',
  })
  exclusiveGroup?: string | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Minimum target alignment for this aura (inclusive)',
  })
  minAlignment?: number | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Maximum target alignment for this aura (inclusive)',
  })
  maxAlignment?: number | null;

  @Field(() => Int, { description: 'Display order (ascending)' })
  sortOrder: number;
}
