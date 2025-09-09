import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import {
  RoomDto,
  CreateRoomInput,
  UpdateRoomInput,
  CreateRoomExitInput,
  RoomExitDto,
  UpdateRoomPositionInput,
} from './room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => RoomDto)
export class RoomsResolver {
  constructor(private readonly roomsService: RoomsService) {}

  @Query(() => [RoomDto], { name: 'rooms' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('zoneId', { type: () => Int, nullable: true }) zoneId?: number
  ): Promise<RoomDto[]> {
    return this.roomsService.findAll({ skip, take, zoneId });
  }

  @Query(() => RoomDto, { name: 'room' })
  async findOne(
    @Args('id', { type: () => Int }) id: number
  ): Promise<RoomDto | null> {
    return this.roomsService.findOne(id);
  }

  @Query(() => [RoomDto], { name: 'roomsByZone' })
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number
  ): Promise<RoomDto[]> {
    return this.roomsService.findByZone(zoneId);
  }

  @Query(() => Int, { name: 'roomsCount' })
  async count(
    @Args('zoneId', { type: () => Int, nullable: true }) zoneId?: number
  ): Promise<number> {
    return this.roomsService.count(zoneId);
  }

  @Mutation(() => RoomDto)
  @UseGuards(JwtAuthGuard)
  async createRoom(@Args('data') data: CreateRoomInput): Promise<RoomDto> {
    return this.roomsService.create(data);
  }

  @Mutation(() => RoomDto)
  @UseGuards(JwtAuthGuard)
  async updateRoom(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateRoomInput
  ): Promise<RoomDto> {
    return this.roomsService.update(id, data);
  }

  @Mutation(() => RoomDto)
  @UseGuards(JwtAuthGuard)
  async deleteRoom(
    @Args('id', { type: () => Int }) id: number
  ): Promise<RoomDto> {
    return this.roomsService.delete(id);
  }

  @Mutation(() => RoomExitDto)
  @UseGuards(JwtAuthGuard)
  async createRoomExit(
    @Args('data') data: CreateRoomExitInput
  ): Promise<RoomExitDto> {
    return this.roomsService.createExit(data);
  }

  @Mutation(() => RoomExitDto)
  @UseGuards(JwtAuthGuard)
  async deleteRoomExit(@Args('exitId') exitId: string): Promise<RoomExitDto> {
    return this.roomsService.deleteExit(exitId);
  }

  @Mutation(() => RoomDto)
  @UseGuards(JwtAuthGuard)
  async updateRoomPosition(
    @Args('id', { type: () => Int }) id: number,
    @Args('position') position: UpdateRoomPositionInput
  ): Promise<RoomDto> {
    return this.roomsService.updatePosition(id, position);
  }
}
