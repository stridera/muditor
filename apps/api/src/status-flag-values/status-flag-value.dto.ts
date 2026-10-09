import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'AI worth of a status flag: how much a mob wants gear that grants it',
})
export class StatusFlagValueDto {
  @Field({ description: 'Status flag name (e.g., sanctuary)' })
  flag: string;

  @Field(() => Int, {
    description:
      'AI value (negative for harmful flags; flags without a row are worth 0)',
  })
  aiValue: number;
}
