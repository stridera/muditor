import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { EquipmentSetsService } from './equipment-sets.service';
import {
  EquipmentSetDto,
  EquipmentSetItemDto,
  MobEquipmentSetDto,
  CreateEquipmentSetInput,
  UpdateEquipmentSetInput,
  CreateEquipmentSetItemStandaloneInput,
  CreateMobEquipmentSetInput,
} from './equipment-set.dto';

@Resolver(() => EquipmentSetDto)
export class EquipmentSetsResolver {
  constructor(private readonly equipmentSetsService: EquipmentSetsService) {}

  @Query(() => [EquipmentSetDto], { name: 'equipmentSets' })
  findAll() {
    return this.equipmentSetsService.findAll();
  }

  @Query(() => EquipmentSetDto, { name: 'equipmentSet' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.equipmentSetsService.findOne(id);
  }

  @Mutation(() => EquipmentSetDto)
  createEquipmentSet(@Args('data') createEquipmentSetInput: CreateEquipmentSetInput) {
    return this.equipmentSetsService.create(createEquipmentSetInput);
  }

  @Mutation(() => EquipmentSetDto)
  updateEquipmentSet(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') updateEquipmentSetInput: UpdateEquipmentSetInput,
  ) {
    return this.equipmentSetsService.update(id, updateEquipmentSetInput);
  }

  @Mutation(() => Boolean)
  async deleteEquipmentSet(@Args('id', { type: () => ID }) id: string) {
    await this.equipmentSetsService.delete(id);
    return true;
  }

  @Mutation(() => EquipmentSetItemDto)
  createEquipmentSetItem(@Args('data') data: CreateEquipmentSetItemStandaloneInput) {
    return this.equipmentSetsService.createEquipmentSetItem(data);
  }

  @Mutation(() => Boolean)
  async deleteEquipmentSetItem(@Args('id', { type: () => ID }) id: string) {
    await this.equipmentSetsService.deleteEquipmentSetItem(id);
    return true;
  }

  @Mutation(() => MobEquipmentSetDto)
  createMobEquipmentSet(@Args('data') data: CreateMobEquipmentSetInput) {
    return this.equipmentSetsService.createMobEquipmentSet(data);
  }

  @Mutation(() => Boolean)
  async deleteMobEquipmentSet(@Args('id', { type: () => ID }) id: string) {
    await this.equipmentSetsService.deleteMobEquipmentSet(id);
    return true;
  }
}