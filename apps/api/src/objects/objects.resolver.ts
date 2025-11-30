import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
// Import enum only AFTER GraphQL enums have been registered in object.dto (registration side-effect)
import { ObjectType as ObjectTypeEnum } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { mapObject } from '../common/mappers/object.mapper';
import { CreateObjectInput, ObjectDto, UpdateObjectInput } from './object.dto';
import { ObjectsService } from './objects.service';

@Resolver(() => ObjectDto)
export class ObjectsResolver {
  constructor(private readonly objectsService: ObjectsService) {}

  @Query(() => [ObjectDto], { name: 'objects' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<ObjectDto[]> {
    const params: { skip?: number; take?: number } = {};
    if (skip !== undefined) params.skip = skip;
    if (take !== undefined) params.take = take;
    const objects = await this.objectsService.findAll(params);
    return objects.map(o => mapObject(o));
  }

  @Query(() => ObjectDto, { name: 'object' })
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<ObjectDto | null> {
    const obj = await this.objectsService.findOne(zoneId, id);
    return obj ? mapObject(obj) : null;
  }

  @Query(() => [ObjectDto], { name: 'objectsByZone' })
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number
  ): Promise<ObjectDto[]> {
    const objects = await this.objectsService.findByZone(zoneId);
    return objects.map(o => mapObject(o));
  }

  @Query(() => [ObjectDto], { name: 'objectsByType' })
  async findByType(
    // Provide explicit enum type in the decorator factory to prevent UndefinedTypeError.
    // The explicit lambda ensures Nest can reflect the enum even in CommonJS compilation mode.
    @Args('type', { type: () => ObjectTypeEnum }) type: ObjectTypeEnum
  ): Promise<ObjectDto[]> {
    const objects = await this.objectsService.findByType(type);
    return objects.map(o => mapObject(o));
  }

  @Query(() => Int, { name: 'objectsCount' })
  async count(): Promise<number> {
    return this.objectsService.count();
  }

  @Query(() => [ObjectDto], { name: 'searchObjects' })
  async searchObjects(
    @Args('search', { type: () => String }) search: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('zoneId', { type: () => Int, nullable: true }) zoneId?: number
  ): Promise<ObjectDto[]> {
    const objects = await this.objectsService.search(search, limit, zoneId);
    return objects.map(o => mapObject(o));
  }

  @Mutation(() => ObjectDto)
  @UseGuards(JwtAuthGuard)
  async createObject(
    @Args('data') data: CreateObjectInput
  ): Promise<ObjectDto> {
    const { zoneId, ...objectData } = data;
    const created = await this.objectsService.create({
      ...objectData,
      zones: {
        connect: { id: zoneId },
      },
    });
    return mapObject(created);
  }

  @Mutation(() => ObjectDto)
  @UseGuards(JwtAuthGuard)
  async updateObject(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateObjectInput
  ): Promise<ObjectDto> {
    const updated = await this.objectsService.update(zoneId, id, data);
    return mapObject(updated);
  }

  @Mutation(() => ObjectDto)
  @UseGuards(JwtAuthGuard)
  async deleteObject(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<ObjectDto> {
    const deleted = await this.objectsService.delete(zoneId, id);
    return mapObject(deleted);
  }

  @Mutation(() => Int, { name: 'deleteObjects' })
  @UseGuards(JwtAuthGuard)
  async deleteObjects(
    @Args('ids', { type: () => [Int] }) ids: number[]
  ): Promise<number> {
    return this.objectsService.deleteMany(ids);
  }
}
