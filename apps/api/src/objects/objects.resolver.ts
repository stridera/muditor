import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { hidesGodZones } from '../common/god-zone-visibility';
import { EntityKeyInput } from '../common/dto/entity-key.input';
import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
// Import enum only AFTER GraphQL enums have been registered in object.dto (registration side-effect)
import { ObjectType as ObjectTypeEnum, Prisma, type Users } from '@muditor/db';
import { mapObject } from '../common/mappers/object.mapper';
import { CreateObjectInput, ObjectDto, UpdateObjectInput } from './object.dto';
import {
  ObjectEffectInput,
  ObjectResistanceInput,
  ConsumableEffectInput,
} from './object-effects.dto';
import { ObjectsService } from './objects.service';
import { clampSkip, clampTake } from '../common/pagination';

@Resolver(() => ObjectDto)
export class ObjectsResolver {
  constructor(private readonly objectsService: ObjectsService) {}

  // Object reads are public. Objects in god zones are hidden from anonymous
  // callers and mortal accounts; IMMORTAL+ still see them.
  @Query(() => [ObjectDto], { name: 'objects' })
  @UseGuards(OptionalJwtAuthGuard)
  async findAll(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @CurrentUser() user?: Users | null
  ): Promise<ObjectDto[]> {
    const params: { skip?: number; take?: number; hideGodZones: boolean } = {
      hideGodZones: hidesGodZones(user ?? null),
    };
    if (skip !== undefined) params.skip = clampSkip(skip);
    params.take = clampTake(take);
    const objects = await this.objectsService.findAll(params);
    return objects.map(o => mapObject(o));
  }

  @Query(() => ObjectDto, { name: 'object' })
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user?: Users | null
  ): Promise<ObjectDto | null> {
    const obj = await this.objectsService.findOne(
      zoneId,
      id,
      hidesGodZones(user ?? null)
    );
    return obj ? mapObject(obj) : null;
  }

  @Query(() => [ObjectDto], { name: 'objectsByZone' })
  @UseGuards(OptionalJwtAuthGuard)
  async findByZone(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @CurrentUser() user?: Users | null
  ): Promise<ObjectDto[]> {
    const objects = await this.objectsService.findByZone(
      zoneId,
      hidesGodZones(user ?? null)
    );
    return objects.map(o => mapObject(o));
  }

  @Query(() => [ObjectDto], { name: 'objectsByType' })
  @UseGuards(OptionalJwtAuthGuard)
  async findByType(
    // Provide explicit enum type in the decorator factory to prevent UndefinedTypeError.
    // The explicit lambda ensures Nest can reflect the enum even in CommonJS compilation mode.
    @Args('type', { type: () => ObjectTypeEnum }) type: ObjectTypeEnum,
    @CurrentUser() user?: Users | null
  ): Promise<ObjectDto[]> {
    const objects = await this.objectsService.findByType(
      type,
      hidesGodZones(user ?? null)
    );
    return objects.map(o => mapObject(o));
  }

  @Query(() => Int, { name: 'objectsCount' })
  @UseGuards(OptionalJwtAuthGuard)
  async count(@CurrentUser() user?: Users | null): Promise<number> {
    return this.objectsService.count(undefined, hidesGodZones(user ?? null));
  }

  @Query(() => [ObjectDto], { name: 'searchObjects' })
  @UseGuards(OptionalJwtAuthGuard)
  async searchObjects(
    @Args('search', { type: () => String }) search: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('zoneId', { type: () => Int, nullable: true }) zoneId?: number,
    @CurrentUser() user?: Users | null
  ): Promise<ObjectDto[]> {
    const objects = await this.objectsService.search(
      search,
      limit,
      zoneId,
      hidesGodZones(user ?? null)
    );
    return objects.map(o => mapObject(o));
  }

  @Mutation(() => ObjectDto)
  @RequireZoneWrite()
  async createObject(
    @Args('data') data: CreateObjectInput
  ): Promise<ObjectDto> {
    const { zoneId, values, ...objectData } = data;
    const valuesInput =
      values === null ? Prisma.JsonNull : (values ?? undefined);
    const createData: Prisma.ObjectsCreateInput = {
      ...objectData,
      ...(valuesInput !== undefined ? { values: valuesInput } : {}),
      zones: {
        connect: { id: zoneId },
      },
    };
    const created = await this.objectsService.create(createData);
    return mapObject(created);
  }

  @Mutation(() => ObjectDto)
  @RequireZoneWrite()
  async updateObject(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('data') data: UpdateObjectInput
  ): Promise<ObjectDto> {
    const { values, ...rest } = data;
    const valuesInput =
      values === null ? Prisma.JsonNull : (values ?? undefined);
    const updateData: Prisma.ObjectsUpdateInput = {
      ...rest,
      ...(valuesInput !== undefined ? { values: valuesInput } : {}),
    };
    const updated = await this.objectsService.update(zoneId, id, updateData);
    return mapObject(updated);
  }

  @Mutation(() => ObjectDto)
  @RequireZoneWrite()
  async deleteObject(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number
  ): Promise<ObjectDto> {
    const deleted = await this.objectsService.delete(zoneId, id);
    return mapObject(deleted);
  }

  @Mutation(() => Int, { name: 'deleteObjects' })
  @RequireZoneWrite()
  async deleteObjects(
    @Args('keys', { type: () => [EntityKeyInput] }) keys: EntityKeyInput[]
  ): Promise<number> {
    return this.objectsService.deleteMany(keys);
  }

  @Mutation(() => ObjectDto)
  @RequireZoneWrite()
  async updateObjectEffects(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('effects', { type: () => [ObjectEffectInput] })
    effects: ObjectEffectInput[]
  ): Promise<ObjectDto> {
    const obj = await this.objectsService.updateObjectEffects(
      zoneId,
      id,
      effects
    );
    return mapObject(obj!);
  }

  @Mutation(() => ObjectDto)
  @RequireZoneWrite()
  async updateObjectResistances(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('resistances', { type: () => [ObjectResistanceInput] })
    resistances: ObjectResistanceInput[]
  ): Promise<ObjectDto> {
    const obj = await this.objectsService.updateObjectResistances(
      zoneId,
      id,
      resistances
    );
    return mapObject(obj!);
  }

  @Mutation(() => ObjectDto)
  @RequireZoneWrite()
  async updateConsumableEffects(
    @Args('zoneId', { type: () => Int }) zoneId: number,
    @Args('id', { type: () => Int }) id: number,
    @Args('effects', { type: () => [ConsumableEffectInput] })
    effects: ConsumableEffectInput[]
  ): Promise<ObjectDto> {
    const obj = await this.objectsService.updateConsumableEffects(
      zoneId,
      id,
      effects
    );
    return mapObject(obj!);
  }
}
