import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MobsService } from './mobs.service';
import { MobDto, CreateMobInput, UpdateMobInput } from './mob.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => MobDto)
export class MobsResolver {
  constructor(private readonly mobsService: MobsService) {}

  @Query(() => [MobDto], { name: 'mobs' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<MobDto[]> {
    return this.mobsService.findAll({ skip, take });
  }

  @Query(() => MobDto, { name: 'mob' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<MobDto | null> {
    return this.mobsService.findOne(id);
  }

  @Query(() => [MobDto], { name: 'mobsByZone' })
  async findByZone(@Args('zoneId', { type: () => Int }) zoneId: number): Promise<MobDto[]> {
    return this.mobsService.findByZone(zoneId);
  }

  @Query(() => Int, { name: 'mobsCount' })
  async count(): Promise<number> {
    return this.mobsService.count();
  }

  @Mutation(() => MobDto)
  @UseGuards(JwtAuthGuard)
  async createMob(@Args('data') data: CreateMobInput): Promise<MobDto> {
    const { zoneId, ...mobData } = data;
    return this.mobsService.create({
      ...mobData,
      zone: {
        connect: { id: zoneId }
      }
    });
  }

  @Mutation(() => MobDto)
  @UseGuards(JwtAuthGuard)
  async updateMob(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateMobInput,
  ): Promise<MobDto> {
    return this.mobsService.update(id, data);
  }

  @Mutation(() => MobDto)
  @UseGuards(JwtAuthGuard)
  async deleteMob(@Args('id', { type: () => Int }) id: number): Promise<MobDto> {
    return this.mobsService.delete(id);
  }
}