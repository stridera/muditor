import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'Game message text with variants (experience progress, insults, month names, weather changes)',
})
export class SystemMessageDto {
  @Field(() => ID)
  id: number;

  @Field({ description: 'Unique key the game looks the message up by' })
  key: string;

  @Field({ description: 'Grouping (e.g., prompt, social, calendar, weather)' })
  category: string;

  @Field(() => [String], {
    description:
      'Message variants (the game picks one or uses them in order, depending on the key)',
  })
  messages: string[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
