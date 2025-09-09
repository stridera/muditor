import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MobResetService } from './mob-reset.service';
import {
  MobResetDto,
  CreateMobResetInput,
  UpdateMobResetInput,
} from './mob-reset.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => MobResetDto)
export class MobResetResolver {
  constructor(private readonly mobResetService: MobResetService) {}

  @Query(() => [MobResetDto], { name: 'mobResets' })
  async findByMob(
    @Args('mobId', { type: () => Int }) mobId: number
  ): Promise<MobResetDto[]> {
    return this.mobResetService.findByMob(mobId);
  }

  @Query(() => MobResetDto, { name: 'mobReset', nullable: true })
  async findOne(
    @Args('id', { type: () => ID }) id: string
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
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateMobResetInput
  ): Promise<MobResetDto> {
    return this.mobResetService.update(id, data);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteMobReset(
    @Args('id', { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.mobResetService.delete(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteMobCarrying(
    @Args('id', { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.mobResetService.deleteCarrying(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteMobEquipped(
    @Args('id', { type: () => ID }) id: string
  ): Promise<boolean> {
    return this.mobResetService.deleteEquipped(id);
  }
}
