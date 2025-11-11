import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateZoneInput, UpdateZoneInput, ZoneDto } from './zone.dto';
import { ZonesService } from './zones.service';

@Resolver(() => ZoneDto)
export class ZonesResolver {
  constructor(private readonly zonesService: ZonesService) {}

  @Query(() => [ZoneDto], { name: 'zones' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<ZoneDto[]> {
    const params: { skip?: number; take?: number } = {};
    if (skip !== undefined) params.skip = skip;
    if (take !== undefined) params.take = take;
    return this.zonesService.findAll(params);
  }

  @Query(() => ZoneDto, { name: 'zone' })
  async findOne(
    @Args('id', { type: () => Int }) id: number
  ): Promise<ZoneDto | null> {
    return this.zonesService.findOne(id);
  }

  @Query(() => Int, { name: 'zonesCount' })
  async count(): Promise<number> {
    return this.zonesService.count();
  }

  @Mutation(() => ZoneDto)
  @UseGuards(JwtAuthGuard)
  async createZone(@Args('data') data: CreateZoneInput): Promise<ZoneDto> {
    return this.zonesService.create(data);
  }

  @Mutation(() => ZoneDto)
  @UseGuards(JwtAuthGuard)
  async updateZone(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateZoneInput
  ): Promise<ZoneDto> {
    return this.zonesService.update(id, data);
  }

  @Mutation(() => ZoneDto)
  @UseGuards(JwtAuthGuard)
  async deleteZone(
    @Args('id', { type: () => Int }) id: number
  ): Promise<ZoneDto> {
    return this.zonesService.delete(id);
  }
}
