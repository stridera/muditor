import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateObjectResetInput,
  ObjectResetDto,
  UpdateObjectResetInput,
} from '../object-resets/object-reset.dto';
import { ObjectResetService } from './object-reset.service';

@Resolver(() => ObjectResetDto)
export class ObjectResetResolver {
  constructor(private readonly objectResetService: ObjectResetService) {}

  @Query(() => [ObjectResetDto], { name: 'objectResetsByRoom' })
  async findByRoom(
    @Args('roomZoneId', { type: () => Int }) roomZoneId: number,
    @Args('roomId', { type: () => Int }) roomId: number
  ): Promise<ObjectResetDto[]> {
    return this.objectResetService.findByRoom(roomZoneId, roomId);
  }

  @Query(() => [ObjectResetDto], { name: 'objectResetsByZone' })
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number
  ): Promise<ObjectResetDto[]> {
    return this.objectResetService.findByZone(zoneId);
  }

  @Query(() => ObjectResetDto, { name: 'objectReset', nullable: true })
  async findOne(
    @Args('id', { type: () => ID }) id: number
  ): Promise<ObjectResetDto | null> {
    return this.objectResetService.findOne(id);
  }

  @Mutation(() => ObjectResetDto)
  @UseGuards(JwtAuthGuard)
  async createObjectReset(
    @Args('data') data: CreateObjectResetInput
  ): Promise<ObjectResetDto> {
    return this.objectResetService.create(data);
  }

  @Mutation(() => ObjectResetDto)
  @UseGuards(JwtAuthGuard)
  async updateObjectReset(
    @Args('id', { type: () => ID }) id: number,
    @Args('data') data: UpdateObjectResetInput
  ): Promise<ObjectResetDto> {
    return this.objectResetService.update(id, data);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteObjectReset(
    @Args('id', { type: () => ID }) id: number
  ): Promise<boolean> {
    return this.objectResetService.delete(id);
  }
}
