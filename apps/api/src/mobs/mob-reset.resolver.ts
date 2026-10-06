import { RequireZoneWrite } from '../common/decorators/zone-scope.decorator';
import { zoneLookups } from '../common/decorators/zone-lookups';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { WearFlag } from '@muditor/db';
import {
  CreateMobResetInput,
  MobResetDto,
  UpdateMobResetInput,
} from './mob-reset.dto';
import { MobResetService } from './mob-reset.service';

@Resolver(() => MobResetDto)
export class MobResetResolver {
  constructor(private readonly mobResetService: MobResetService) {}

  @Query(() => [MobResetDto], { name: 'mobResets' })
  async findByMob(
    @Args('mobZoneId', { type: () => Int }) mobZoneId: number,
    @Args('mobId', { type: () => Int }) mobId: number
  ): Promise<MobResetDto[]> {
    return this.mobResetService.findByMob(mobZoneId, mobId);
  }

  @Query(() => MobResetDto, { name: 'mobReset', nullable: true })
  async findOne(
    @Args('id', { type: () => ID }) id: number
  ): Promise<MobResetDto | null> {
    return this.mobResetService.findOne(id);
  }

  @Mutation(() => MobResetDto)
  @RequireZoneWrite()
  async createMobReset(
    @Args('data') data: CreateMobResetInput
  ): Promise<MobResetDto> {
    return this.mobResetService.create(data);
  }

  @Mutation(() => MobResetDto)
  @RequireZoneWrite({ lookup: zoneLookups.mobReset('id') })
  async updateMobReset(
    @Args('id', { type: () => ID }) id: number,
    @Args('data') data: UpdateMobResetInput
  ): Promise<MobResetDto> {
    return this.mobResetService.update(id, data);
  }

  @Mutation(() => Boolean)
  @RequireZoneWrite({ lookup: zoneLookups.mobReset('id') })
  async deleteMobReset(
    @Args('id', { type: () => ID }) id: number
  ): Promise<boolean> {
    return this.mobResetService.delete(id);
  }

  @Mutation(() => Boolean)
  @RequireZoneWrite({ lookup: zoneLookups.mobResetEquipment('id') })
  async deleteMobResetEquipment(
    @Args('id', { type: () => ID }) id: number
  ): Promise<boolean> {
    return this.mobResetService.deleteEquipment(id);
  }

  @Mutation(() => MobResetDto)
  @RequireZoneWrite({ lookup: zoneLookups.mobReset('resetId') })
  async addMobResetEquipment(
    @Args('resetId', { type: () => ID }) resetId: number,
    @Args('objectZoneId', { type: () => Int }) objectZoneId: number,
    @Args('objectId', { type: () => Int }) objectId: number,
    @Args('wearLocation', { type: () => WearFlag, nullable: true })
    wearLocation?: WearFlag,
    @Args('maxInstances', { type: () => Int, nullable: true })
    maxInstances?: number,
    @Args('probability', { type: () => Number, nullable: true })
    probability?: number
  ): Promise<MobResetDto> {
    const equipmentData: {
      objectZoneId: number;
      objectId: number;
      wearLocation?: WearFlag;
      maxInstances?: number;
      probability?: number;
    } = {
      objectZoneId,
      objectId,
    };
    if (wearLocation !== undefined) equipmentData.wearLocation = wearLocation;
    if (maxInstances !== undefined) equipmentData.maxInstances = maxInstances;
    if (probability !== undefined) equipmentData.probability = probability;
    return this.mobResetService.addEquipment(resetId, equipmentData);
  }

  @Mutation(() => Boolean)
  @RequireZoneWrite({ lookup: zoneLookups.mobResetEquipment('id') })
  async updateMobResetEquipment(
    @Args('id', { type: () => ID }) id: number,
    @Args('wearLocation', { type: () => WearFlag, nullable: true })
    wearLocation?: WearFlag,
    @Args('maxInstances', { type: () => Int, nullable: true })
    maxInstances?: number,
    @Args('probability', { type: () => Number, nullable: true })
    probability?: number
  ): Promise<boolean> {
    const updates: {
      wearLocation?: WearFlag;
      maxInstances?: number;
      probability?: number;
    } = {};
    if (wearLocation !== undefined) updates.wearLocation = wearLocation;
    if (maxInstances !== undefined) updates.maxInstances = maxInstances;
    if (probability !== undefined) updates.probability = probability;
    return this.mobResetService.updateEquipment(id, updates);
  }
}
