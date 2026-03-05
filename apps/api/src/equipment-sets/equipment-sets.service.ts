import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateEquipmentSetInput,
  CreateEquipmentSetItemStandaloneInput,
  CreateMobEquipmentSetInput,
  UpdateEquipmentSetInput,
} from './equipment-set.dto';

const EQUIPMENT_SET_INCLUDE = {
  equipmentSetItems: {
    include: {
      objects: true,
    },
  },
} as const;

const MOB_EQUIPMENT_SET_INCLUDE = {
  equipment_sets: {
    include: {
      equipmentSetItems: {
        include: {
          objects: true,
        },
      },
    },
  },
} as const;

@Injectable()
export class EquipmentSetsService {
  constructor(private database: DatabaseService) {}

  async findAll() {
    const sets = await this.database.equipmentSets.findMany({
      include: EQUIPMENT_SET_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return sets.map(this.mapSetToDto);
  }

  async findOne(id: string) {
    const set = await this.database.equipmentSets.findUnique({
      where: { id: parseInt(id) },
      include: EQUIPMENT_SET_INCLUDE,
    });
    if (!set) throw new NotFoundException(`Equipment set ${id} not found`);
    return this.mapSetToDto(set);
  }

  async create(data: CreateEquipmentSetInput) {
    const set = await this.database.equipmentSets.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        ...(data.items?.length && {
          equipmentSetItems: {
            create: data.items.map(item => ({
              objectZoneId: item.objectZoneId,
              objectId: item.objectId,
              slot: item.slot ?? null,
              quantity: item.quantity ?? 1,
              probability: item.probability ?? 1.0,
            })),
          },
        }),
      },
      include: EQUIPMENT_SET_INCLUDE,
    });
    return this.mapSetToDto(set);
  }

  async update(id: string, data: UpdateEquipmentSetInput) {
    const set = await this.database.equipmentSets.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description ?? null,
        }),
      },
      include: EQUIPMENT_SET_INCLUDE,
    });
    return this.mapSetToDto(set);
  }

  async delete(id: string) {
    await this.database.equipmentSets.delete({
      where: { id: parseInt(id) },
    });
  }

  async createEquipmentSetItem(data: CreateEquipmentSetItemStandaloneInput) {
    const item = await this.database.equipmentSetItems.create({
      data: {
        equipmentSetId: parseInt(data.equipmentSetId),
        objectZoneId: data.objectZoneId,
        objectId: data.objectId,
        slot: data.slot ?? null,
        quantity: data.quantity ?? 1,
        probability: data.probability ?? 1.0,
      },
      include: { objects: true },
    });
    return this.mapItemToDto(item);
  }

  async deleteEquipmentSetItem(id: string) {
    await this.database.equipmentSetItems.delete({
      where: { id: parseInt(id) },
    });
  }

  async createMobEquipmentSet(data: CreateMobEquipmentSetInput) {
    const link = await this.database.mobEquipmentSets.create({
      data: {
        mobResetId: parseInt(data.mobResetId),
        equipmentSetId: parseInt(data.equipmentSetId),
        probability: data.probability ?? 1.0,
      },
      include: MOB_EQUIPMENT_SET_INCLUDE,
    });
    return this.mapMobEquipmentSetToDto(link);
  }

  async deleteMobEquipmentSet(id: string) {
    await this.database.mobEquipmentSets.delete({
      where: { id: parseInt(id) },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Prisma include result shapes are deeply nested generics
  private mapItemToDto(item: any) {
    return {
      id: String(item.id),
      objectZoneId: item.objectZoneId,
      objectId: item.objectId,
      slot: item.slot,
      quantity: item.quantity,
      probability: item.probability,
      object: item.objects,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapSetToDto(set: any) {
    return {
      id: String(set.id),
      name: set.name,
      description: set.description,
      createdAt: set.createdAt,
      updatedAt: set.updatedAt,
      items: (set.equipmentSetItems || []).map((item: any) => ({
        id: String(item.id),
        objectZoneId: item.objectZoneId,
        objectId: item.objectId,
        slot: item.slot,
        quantity: item.quantity,
        probability: item.probability,
        object: item.objects,
      })),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapMobEquipmentSetToDto(link: any) {
    return {
      id: String(link.id),
      mobResetId: String(link.mobResetId),
      equipmentSetId: String(link.equipmentSetId),
      probability: link.probability,
      equipmentSet: this.mapSetToDto(link.equipment_sets),
    };
  }
}
