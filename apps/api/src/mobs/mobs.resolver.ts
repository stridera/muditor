import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateMobInput, MobDto, UpdateMobInput } from './mob.dto';
import { MobsService } from './mobs.service';

@Resolver(() => MobDto)
export class MobsResolver {
  constructor(private readonly mobsService: MobsService) {}

  @Query(() => [MobDto], { name: 'mobs' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<MobDto[]> {
    return this.mobsService.findAll({ skip, take }) as any; // TODO: Map database fields to DTO
  }

  @Query(() => MobDto, { name: 'mob' })
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<MobDto | null> {
    return this.mobsService.findOne(zoneId, id) as any; // TODO: Map database fields to DTO
  }

  @Query(() => [MobDto], { name: 'mobsByZone' })
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number
  ): Promise<MobDto[]> {
    return this.mobsService.findByZone(zoneId) as any; // TODO: Map database fields to DTO
  }

  @Query(() => Int, { name: 'mobsCount' })
  async count(): Promise<number> {
    return this.mobsService.count();
  }

  @Mutation(() => MobDto)
  @UseGuards(JwtAuthGuard)
  async createMob(@Args('data') data: CreateMobInput): Promise<MobDto> {
    const { zoneId, race, hpDice, damageDice, ...rest } = data;
    
    // Parse dice strings (e.g., "2d8+3" -> num=2, size=8, bonus=3)
    const parseDice = (diceStr: string) => {
      const match = diceStr.match(/^(\d+)d(\d+)([+-]\d+)?$/);
      if (!match) return { num: 1, size: 8, bonus: 0 };
      return {
        num: parseInt(match[1]),
        size: parseInt(match[2]),
        bonus: parseInt(match[3] || '0'),
      };
    };
    
    const hp = parseDice(hpDice || '1d8+0');
    const dmg = parseDice(damageDice || '1d4+0');
    
    const createData: Prisma.MobsCreateInput = {
      ...rest,
      mobClass: 'NORMAL', // Default mob class
      desc: rest.description || '', // Use description as desc
      hpDiceNum: hp.num,
      hpDiceSize: hp.size,
      hpDiceBonus: hp.bonus,
      damageDiceNum: dmg.num,
      damageDiceSize: dmg.size,
      damageDiceBonus: dmg.bonus,
      zones: { connect: { id: zoneId } },
    };
    if (race) {
      createData.race = race as any;
    }
    return this.mobsService.create(createData) as any; // TODO: Map database fields to DTO
  }

  @Mutation(() => MobDto)
  @UseGuards(JwtAuthGuard)
  async updateMob(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateMobInput
  ): Promise<MobDto> {
    const { race, ...rest } = data;
    const updateData: Prisma.MobsUpdateInput = { ...rest };
    if (race) {
      updateData.race = race as any;
    }
    return this.mobsService.update(zoneId, id, updateData) as any; // TODO: Map database fields to DTO
  }

  @Mutation(() => MobDto)
  @UseGuards(JwtAuthGuard)
  async deleteMob(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<MobDto> {
    return this.mobsService.delete(zoneId, id) as any; // TODO: Map database fields to DTO
  }

  @Mutation(() => Int, { name: 'deleteMobs' })
  @UseGuards(JwtAuthGuard)
  async deleteMobs(
    @Args('ids', { type: () => [Int] }) ids: number[]
  ): Promise<number> {
    return this.mobsService.deleteMany(ids);
  }
}
