import { Field, InputType } from '@nestjs/graphql';
import { Climate } from '@muditor/db';
import { IsEnum, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

// Must stay in step with the game's lookup (fierymud-rs mud-world weather_text.rs).
export const WEATHER_DAYPARTS = [
  'dawn',
  'day',
  'midday',
  'evening',
  'night',
  'any',
] as const;

@InputType({ description: 'Key of a weather flavour line' })
export class WeatherTextKeyInput {
  @Field(() => Climate)
  @IsEnum(Climate)
  climate: Climate;

  @Field()
  @IsString()
  @IsIn(WEATHER_DAYPARTS)
  daypart: string;
}

@InputType({ description: 'Input for setting a weather flavour line' })
export class SetWeatherTextInput extends WeatherTextKeyInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;
}
