import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { WeatherTextDto } from './weather-text.dto';
import { SetWeatherTextInput, WeatherTextKeyInput } from './weather-text.input';
import { WeatherTextService } from './weather-text.service';

@Resolver(() => WeatherTextDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class WeatherTextResolver {
  constructor(private readonly service: WeatherTextService) {}

  // Queries - IMMORTAL+ can view

  @Query(() => [WeatherTextDto], {
    name: 'weatherTexts',
    description: 'Weather flavour lines per climate and time of day',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findAll() {
    return this.service.findAll();
  }

  // Mutations - BUILDER+ (world-content catalog)

  @Mutation(() => WeatherTextDto, {
    description: 'Set the weather flavour line for a climate and daypart',
  })
  @MinimumRole(UserRole.BUILDER)
  async setWeatherText(
    @Args('data', { type: () => SetWeatherTextInput }) data: SetWeatherTextInput
  ) {
    return this.service.set(data);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a weather line so the game uses its built-in text',
  })
  @MinimumRole(UserRole.BUILDER)
  async deleteWeatherText(
    @Args('key', { type: () => WeatherTextKeyInput }) key: WeatherTextKeyInput
  ) {
    return this.service.remove(key);
  }
}
