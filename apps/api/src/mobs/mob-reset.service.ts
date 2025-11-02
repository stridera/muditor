import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateMobResetInput,
  MobResetDto,
  UpdateMobResetInput,
} from './mob-reset.dto';

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
    const reset = await this.prisma.mobResets.create({
      data: {
        maxInstances: data.maxInstances || 1,
        probability: data.probability || 1.0,
        comment: data.comment,
        mobZoneId: data.mobZoneId,
        mobId: data.mobId,
        roomZoneId: data.roomZoneId,
        roomId: data.roomId,
        zoneId: data.zoneId,
        mobResetEquipment: data.equipment
          ? {
              create: data.equipment.map(eq => ({
                objectZoneId: eq.objectZoneId,
                objectId: eq.objectId,
                wearLocation: eq.wearLocation,
                maxInstances: eq.maxInstances || 1,
                probability: eq.probability || 1.0,
              })),
            }
          : undefined,
      },
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

    return this.mapToDto(reset);
  }

  async update(id: number, data: UpdateMobResetInput): Promise<MobResetDto> {
    // Handle equipment updates
    const equipmentOperations =
      data.equipment?.map(eq => {
        if (eq.id) {
          // Update existing
          return this.prisma.mobResetEquipment.update({
            where: { id: eq.id },
            data: {
              objectZoneId: eq.objectZoneId,
              objectId: eq.objectId,
              wearLocation: eq.wearLocation,
              maxInstances: eq.maxInstances,
              probability: eq.probability,
            },
          });
        } else {
          // Create new
          return this.prisma.mobResetEquipment.create({
            data: {
              objectZoneId: eq.objectZoneId!,
              objectId: eq.objectId!,
              resetId: id,
              wearLocation: eq.wearLocation,
              maxInstances: eq.maxInstances || 1,
              probability: eq.probability || 1.0,
            },
          });
        }
      }) || [];

    // Execute all operations in transaction
    await this.prisma.$transaction([
      ...equipmentOperations,
      this.prisma.mobResets.update({
        where: { id },
        data: {
          maxInstances: data.maxInstances,
          probability: data.probability,
          comment: data.comment,
          roomZoneId: data.roomZoneId,
          roomId: data.roomId,
        },
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
      wearLocation?: string;
      maxInstances?: number;
      probability?: number;
    }
  ): Promise<MobResetDto> {
    await this.prisma.mobResetEquipment.create({
      data: {
        resetId,
        objectZoneId: equipment.objectZoneId,
        objectId: equipment.objectId,
        wearLocation: equipment.wearLocation || null,
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
      wearLocation?: string;
      maxInstances?: number;
      probability?: number;
    }
  ): Promise<boolean> {
    try {
      await this.prisma.mobResetEquipment.update({
        where: { id: equipmentId },
        data: {
          wearLocation: updates.wearLocation !== undefined ? updates.wearLocation : undefined,
          maxInstances: updates.maxInstances,
          probability: updates.probability,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  private mapToDto(reset: any): MobResetDto {
    return {
      id: reset.id,
      zoneId: reset.zoneId,
      mobZoneId: reset.mobZoneId,
      mobId: reset.mobId,
      roomZoneId: reset.roomZoneId,
      roomId: reset.roomId,
      maxInstances: reset.maxInstances,
      probability: reset.probability,
      comment: reset.comment,
      equipment:
        reset.mobResetEquipment?.map((eq: any) => ({
          id: eq.id,
          objectZoneId: eq.objectZoneId,
          objectId: eq.objectId,
          wearLocation: eq.wearLocation,
          maxInstances: eq.maxInstances,
          probability: eq.probability,
          object: eq.objects,
        })) || [],
      mob: reset.mobs,
      room: reset.rooms,
    };
  }
}
