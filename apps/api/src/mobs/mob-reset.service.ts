import { Injectable } from '@nestjs/common';
import { MobResetEquipment, MobResets, Prisma, WearFlag } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import {
  CreateMobResetInput,
  MobResetDto,
  MobResetEquipmentDto,
  UpdateMobResetInput,
} from './mob-reset.dto';

// Internal relation shape used after Prisma queries so we can drop all `any` usage.
interface MobResetWithRelations extends MobResets {
  mobResetEquipment: Array<
    MobResetEquipment & {
      objects: {
        id: number;
        zoneId: number;
        name: string;
        type: string;
      };
    }
  >;
  mobs?: { id: number; zoneId: number; name: string } | null;
  rooms?: { id: number; zoneId: number; name: string } | null;
}

@Injectable()
export class MobResetService {
  constructor(private prisma: DatabaseService) {}

  async findByMob(mobZoneId: number, mobId: number): Promise<MobResetDto[]> {
    const resets = await this.prisma.mobResets.findMany({
      where: { mobZoneId, mobId },
      include: {
        mobResetEquipment: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                type: true,
              },
            },
          },
        },
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        rooms: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
      },
    });

    return resets.map(this.mapToDto);
  }

  async findOne(id: number): Promise<MobResetDto | null> {
    const reset = await this.prisma.mobResets.findUnique({
      where: { id },
      include: {
        mobResetEquipment: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                type: true,
              },
            },
          },
        },
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        rooms: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
      },
    });

    return reset ? this.mapToDto(reset) : null;
  }

  async create(data: CreateMobResetInput): Promise<MobResetDto> {
    const baseData: Prisma.MobResetsUncheckedCreateInput = {
      maxInstances: data.maxInstances || 1,
      probability: data.probability || 1.0,
      comment: data.comment ?? null,
      mobZoneId: data.mobZoneId,
      mobId: data.mobId,
      roomZoneId: data.roomZoneId,
      roomId: data.roomId,
      zoneId: data.zoneId,
    };

    const equipmentCreate =
      data.equipment && data.equipment.length
        ? {
            create: data.equipment.map(eq => ({
              objectZoneId: eq.objectZoneId,
              objectId: eq.objectId,
              wearLocation: eq.wearLocation ?? null,
              maxInstances: eq.maxInstances || 1,
              probability: eq.probability || 1.0,
            })),
          }
        : undefined;

    const reset = await this.prisma.mobResets.create({
      data: {
        ...baseData,
        ...(equipmentCreate && { mobResetEquipment: equipmentCreate }),
      },
      include: {
        mobResetEquipment: {
          include: {
            objects: {
              select: { id: true, zoneId: true, name: true, type: true },
            },
          },
        },
        mobs: { select: { id: true, zoneId: true, name: true } },
        rooms: { select: { id: true, zoneId: true, name: true } },
      },
    });
    return this.mapToDto(reset as MobResetWithRelations);
  }

  async update(id: number, data: UpdateMobResetInput): Promise<MobResetDto> {
    // Handle equipment updates
    const equipmentOperations = (data.equipment || []).map(eq => {
      if (eq.id) {
        const updateData: Prisma.MobResetEquipmentUncheckedUpdateInput = {};
        if (eq.objectZoneId !== undefined)
          updateData.objectZoneId = { set: eq.objectZoneId };
        if (eq.objectId !== undefined)
          updateData.objectId = { set: eq.objectId };
        if (eq.wearLocation !== undefined)
          updateData.wearLocation = { set: eq.wearLocation ?? null };
        if (eq.maxInstances !== undefined)
          updateData.maxInstances = { set: eq.maxInstances };
        if (eq.probability !== undefined)
          updateData.probability = { set: eq.probability };
        return this.prisma.mobResetEquipment.update({
          where: { id: eq.id },
          data: updateData,
        });
      }
      return this.prisma.mobResetEquipment.create({
        data: {
          objectZoneId: eq.objectZoneId!,
          objectId: eq.objectId!,
          resetId: id,
          wearLocation: eq.wearLocation ?? null,
          maxInstances: eq.maxInstances || 1,
          probability: eq.probability || 1.0,
        },
      });
    });

    // Execute all operations in transaction
    await this.prisma.$transaction([
      ...equipmentOperations,
      this.prisma.mobResets.update({
        where: { id },
        data: (() => {
          const updateData: Prisma.MobResetsUncheckedUpdateInput = {};
          if (data.maxInstances !== undefined)
            updateData.maxInstances = { set: data.maxInstances };
          if (data.probability !== undefined)
            updateData.probability = { set: data.probability };
          if (data.comment !== undefined)
            updateData.comment = { set: data.comment };
          if (data.roomZoneId !== undefined)
            updateData.roomZoneId = { set: data.roomZoneId };
          if (data.roomId !== undefined)
            updateData.roomId = { set: data.roomId };
          return updateData;
        })(),
      }),
    ]);

    // Return updated reset
    const updatedReset = await this.findOne(id);
    return updatedReset!;
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.mobResets.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteEquipment(id: number): Promise<boolean> {
    try {
      await this.prisma.mobResetEquipment.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async addEquipment(
    resetId: number,
    equipment: {
      objectZoneId: number;
      objectId: number;
      wearLocation?: WearFlag;
      maxInstances?: number;
      probability?: number;
    }
  ): Promise<MobResetDto> {
    await this.prisma.mobResetEquipment.create({
      data: {
        resetId,
        objectZoneId: equipment.objectZoneId,
        objectId: equipment.objectId,
        wearLocation: equipment.wearLocation ?? null,
        maxInstances: equipment.maxInstances || 1,
        probability: equipment.probability || 1.0,
      },
    });

    // Return updated reset
    const updatedReset = await this.findOne(resetId);
    return updatedReset!;
  }

  async updateEquipment(
    equipmentId: number,
    updates: {
      wearLocation?: WearFlag;
      maxInstances?: number;
      probability?: number;
    }
  ): Promise<boolean> {
    try {
      const data: Prisma.MobResetEquipmentUncheckedUpdateInput = {};
      if (updates.wearLocation !== undefined)
        data.wearLocation = { set: updates.wearLocation ?? null };
      if (updates.maxInstances !== undefined)
        data.maxInstances = { set: updates.maxInstances };
      if (updates.probability !== undefined)
        data.probability = { set: updates.probability };
      await this.prisma.mobResetEquipment.update({
        where: { id: equipmentId },
        data,
      });
      return true;
    } catch {
      return false;
    }
  }

  private mapToDto(reset: MobResetWithRelations): MobResetDto {
    // Build base DTO without optional mob/room/comment to satisfy exactOptionalPropertyTypes
    const dto: MobResetDto = {
      id: reset.id,
      zoneId: reset.zoneId,
      mobZoneId: reset.mobZoneId,
      mobId: reset.mobId,
      roomZoneId: reset.roomZoneId,
      roomId: reset.roomId,
      maxInstances: reset.maxInstances,
      probability: reset.probability,
      equipment: reset.mobResetEquipment.map(eq => ({
        id: eq.id,
        objectZoneId: eq.objectZoneId,
        objectId: eq.objectId,
        wearLocation:
          eq.wearLocation === null ? undefined : (eq.wearLocation as WearFlag),
        maxInstances: eq.maxInstances,
        probability: eq.probability,
        object: {
          id: eq.objects.id,
          zoneId: eq.objects.zoneId,
          name: eq.objects.name,
          type: eq.objects.type,
        },
      })) as MobResetEquipmentDto[],
    };
    if (reset.mobs) {
      dto.mob = {
        id: reset.mobs.id,
        zoneId: reset.mobs.zoneId,
        name: reset.mobs.name,
      };
    }
    if (reset.rooms) {
      dto.room = {
        id: reset.rooms.id,
        zoneId: reset.rooms.zoneId,
        name: reset.rooms.name,
      };
    }
    if (reset.comment !== null) {
      dto.comment = reset.comment;
    }
    return dto;
  }
}
