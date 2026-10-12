import { Field, ObjectType } from '@nestjs/graphql';
import { Climate } from '@muditor/db';

@ObjectType({
  description:
    'Flavour line of the weather command for one zone climate and time of day',
})
export class WeatherTextDto {
  @Field(() => Climate)
  climate: Climate;

  @Field({
    description:
      'dawn, day, midday, evening, night or any. The game tries the exact hour band, then ' +
      'its group (day = day+midday; night = night+evening+dawn), then any',
  })
  daypart: string;

  @Field(() => String, {
    nullable: true,
    description:
      'XML-Lite text. NULL means the key has no line here and the built-in one is used',
  })
  text?: string | null;
}
