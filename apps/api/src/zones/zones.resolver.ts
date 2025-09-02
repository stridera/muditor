import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { ZoneDto, CreateZoneInput, UpdateZoneInput } from './zone.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => ZoneDto)
export class ZonesResolver {
  constructor(private readonly zonesService: ZonesService) {}

  @Query(() => [ZoneDto], { name: 'zones' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<ZoneDto[]> {
    return this.zonesService.findAll({ skip, take });
  }

  @Query(() => ZoneDto, { name: 'zone' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<ZoneDto | null> {
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
    @Args('data') data: UpdateZoneInput,
  ): Promise<ZoneDto> {
    return this.zonesService.update(id, data);
  }

  @Mutation(() => ZoneDto)
  @UseGuards(JwtAuthGuard)
  async deleteZone(@Args('id', { type: () => Int }) id: number): Promise<ZoneDto> {
    return this.zonesService.delete(id);
  }
}