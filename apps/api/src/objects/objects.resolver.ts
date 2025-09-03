import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectsService } from './objects.service';
import { ObjectDto, CreateObjectInput, UpdateObjectInput } from './object.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => ObjectDto)
export class ObjectsResolver {
  constructor(private readonly objectsService: ObjectsService) {}

  @Query(() => [ObjectDto], { name: 'objects' })
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
  ): Promise<ObjectDto[]> {
    return this.objectsService.findAll({ skip, take });
  }

  @Query(() => ObjectDto, { name: 'object' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<ObjectDto | null> {
    return this.objectsService.findOne(id);
  }

  @Query(() => [ObjectDto], { name: 'objectsByZone' })
  async findByZone(@Args('zoneId', { type: () => Int }) zoneId: number): Promise<ObjectDto[]> {
    return this.objectsService.findByZone(zoneId);
  }

  @Query(() => [ObjectDto], { name: 'objectsByType' })
  async findByType(@Args('type') type: string): Promise<ObjectDto[]> {
    return this.objectsService.findByType(type);
  }

  @Query(() => Int, { name: 'objectsCount' })
  async count(): Promise<number> {
    return this.objectsService.count();
  }

  @Mutation(() => ObjectDto)
  @UseGuards(JwtAuthGuard)
  async createObject(@Args('data') data: CreateObjectInput): Promise<ObjectDto> {
    const { zoneId, ...objectData } = data;
    return this.objectsService.create({
      ...objectData,
      zone: {
        connect: { id: zoneId }
      }
    });
  }

  @Mutation(() => ObjectDto)
  @UseGuards(JwtAuthGuard)
  async updateObject(
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateObjectInput,
  ): Promise<ObjectDto> {
    return this.objectsService.update(id, data);
  }

  @Mutation(() => ObjectDto)
  @UseGuards(JwtAuthGuard)
  async deleteObject(@Args('id', { type: () => Int }) id: number): Promise<ObjectDto> {
    return this.objectsService.delete(id);
  }
}