import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateMobResetInput,
  MobResetDto,
  UpdateMobResetInput,
} from './mob-reset.dto';
import { MobResetService } from './mob-reset.service';

@Resolver(() => MobResetDto)
export class MobResetResolver {
  constructor(private readonly mobResetService: MobResetService) {}

  @Query(() => [MobResetDto], { name: 'mobResets' })
  async findByMob(
    @Args('mobZoneId', { type: () => Int }) mobZoneId: number,
    @Args('mobId', { type: () => Int }) mobId: number
  ): Promise<MobResetDto[]> {
    return this.mobResetService.findByMob(mobZoneId, mobId);
  }

  @Query(() => MobResetDto, { name: 'mobReset', nullable: true })
  async findOne(
    @Args('id', { type: () => ID }) id: number
  ): Promise<MobResetDto | null> {
    return this.mobResetService.findOne(id);
  }

  @Mutation(() => MobResetDto)
  @UseGuards(JwtAuthGuard)
  async createMobReset(
    @Args('data') data: CreateMobResetInput
  ): Promise<MobResetDto> {
    return this.mobResetService.create(data);
  }

  @Mutation(() => MobResetDto)
  @UseGuards(JwtAuthGuard)
  async updateMobReset(
    @Args('id', { type: () => ID }) id: number,
    @Args('data') data: UpdateMobResetInput
  ): Promise<MobResetDto> {
    return this.mobResetService.update(id, data);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteMobReset(
    @Args('id', { type: () => ID }) id: number
  ): Promise<boolean> {
    return this.mobResetService.delete(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteMobResetEquipment(
    @Args('id', { type: () => ID }) id: number
  ): Promise<boolean> {
    return this.mobResetService.deleteEquipment(id);
  }
}
