import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'Spell chant gibberish: how a bystander who cannot place a spell hears its name',
})
export class SpellSyllableDto {
  @Field(() => ID)
  id: number;

  @Field(() => Int, {
    description:
      'Match order (ascending): earlier rows win when several syllables prefix the remaining text',
  })
  sortOrder: number;

  @Field({
    description:
      'Lowercase text to match at the current position of the spell name',
  })
  syllable: string;

  @Field({ description: 'Gibberish heard in place of the matched syllable' })
  replacement: string;
}
