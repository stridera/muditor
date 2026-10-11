import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'A word refused as a character name (staff/system voices, generic mob words)',
})
export class ReservedNameDto {
  @Field(() => ID)
  id: number;

  @Field({
    description:
      'Lowercase word; the game compares character names case-insensitively',
  })
  name: string;

  @Field(() => String, {
    nullable: true,
    description: 'Why the word is reserved (builder-facing note)',
  })
  reason?: string | null;

  @Field()
  createdAt: Date;
}
