import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateObjectInput, ObjectDto, UpdateObjectInput } from './object.dto';
import { ObjectsService } from './objects.service';

@Resolver(() => ObjectDto)
export class ObjectsResolver {
  constructor(private readonly objectsService: ObjectsService) { }

  @Query(() => [ObjectDto], { name: 'objects' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<ObjectDto[]> {
    return this.objectsService.findAll({ skip, take }) as any; // TODO: Map database fields to DTO
  }

  @Query(() => ObjectDto, { name: 'object' })
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<ObjectDto | null> {
    return this.objectsService.findOne(zoneId, id) as any; // TODO: Map database fields to DTO
  }

  @Query(() => [ObjectDto], { name: 'objectsByZone' })
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number
  ): Promise<ObjectDto[]> {
    return this.objectsService.findByZone(zoneId) as any; // TODO: Map database fields to DTO
  }

  @Query(() => [ObjectDto], { name: 'objectsByType' })
  async findByType(@Args('type') type: string): Promise<ObjectDto[]> {
    return this.objectsService.findByType(type) as any; // TODO: Map database fields to DTO
  }

  @Query(() => Int, { name: 'objectsCount' })
  async count(): Promise<number> {
    return this.objectsService.count();
  }

  @Mutation(() => ObjectDto)
  @UseGuards(JwtAuthGuard)
  async createObject(
    @Args('data') data: CreateObjectInput
  ): Promise<ObjectDto> {
    const { zoneId, ...objectData } = data;
    return this.objectsService.create({
      ...objectData,
      zone: {
        connect: { id: zoneId },
      },
    }) as any; // TODO: Map database fields to DTO
  }

  @Mutation(() => ObjectDto)
  @UseGuards(JwtAuthGuard)
  async updateObject(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateObjectInput
  ): Promise<ObjectDto> {
    return this.objectsService.update(zoneId, id, data) as any; // TODO: Map database fields to DTO
  }

  @Mutation(() => ObjectDto)
  @UseGuards(JwtAuthGuard)
  async deleteObject(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<ObjectDto> {
    return this.objectsService.delete(zoneId, id) as any; // TODO: Map database fields to DTO
  }

  @Mutation(() => Int, { name: 'deleteObjects' })
  @UseGuards(JwtAuthGuard)
  async deleteObjects(
    @Args('ids', { type: () => [Int] }) ids: number[]
  ): Promise<number> {
    return this.objectsService.deleteMany(ids);
  }
}
