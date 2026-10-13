import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { type Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { hidesGodZones } from '../common/god-zone-visibility';
import { ObjectAbilityDto, ObjectAbilityInput } from './object-abilities.dto';
import { ObjectAbilitiesService } from './object-abilities.service';

@Resolver()
export class ObjectAbilitiesResolver {
  constructor(private readonly service: ObjectAbilitiesService) {}

  @Query(() => [ObjectAbilityDto], { name: 'objectAbilities' })
  @UseGuards(OptionalJwtAuthGuard)
  async objectAbilities(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user?: Users | null
  ): Promise<ObjectAbilityDto[]> {
    return this.service.list(zoneId, id, hidesGodZones(user ?? null));
  }

  @Mutation(() => [ObjectAbilityDto])
  @RequireZoneWrite()
  async setObjectAbilities(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('abilities', { type: () => [ObjectAbilityInput] })
    abilities: ObjectAbilityInput[]
  ): Promise<ObjectAbilityDto[]> {
    return this.service.replace(zoneId, id, abilities);
  }
}
