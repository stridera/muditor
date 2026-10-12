import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { SpellCircleDto } from './spell-circle.dto';
import { SetSpellCircleRecoverArgs } from './spell-circle.input';
import { SpellCirclesService } from './spell-circles.service';

@Resolver(() => SpellCircleDto)
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class SpellCirclesResolver {
  constructor(private readonly service: SpellCirclesService) {}

  // Queries - IMMORTAL+ can view

  @Query(() => [SpellCircleDto], {
    name: 'spellCircles',
    description: 'Slot recovery time for every spell circle (1-14)',
  })
  @MinimumRole(UserRole.IMMORTAL)
  async findAll() {
    return this.service.findAll();
  }

  // Mutations - BUILDER+ (world-content catalog)

  @Mutation(() => SpellCircleDto, {
    description:
      'Set the slot recovery time of a spell circle; null restores the built-in time',
  })
  @MinimumRole(UserRole.BUILDER)
  async setSpellCircleRecoverTime(
    @Args({ type: () => SetSpellCircleRecoverArgs })
    args: SetSpellCircleRecoverArgs
  ) {
    return this.service.setRecoverSecs(args.circle, args.recoverSecs ?? null);
  }
}
