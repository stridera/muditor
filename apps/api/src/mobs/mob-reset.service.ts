import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  MobResetDto,
  CreateMobResetInput,
  UpdateMobResetInput,
  CreateMobResetEquipmentInput,
  UpdateMobResetEquipmentInput,
} from './mob-reset.dto';

@Injectable()
export class MobResetService {
  constructor(private prisma: DatabaseService) {}

  async findByMob(mobZoneId: number, mobId: number): Promise<MobResetDto[]> {
    const resets = await this.prisma.mobReset.findMany({
      where: { mobZoneId, mobId },
      include: {
        equipment: {
          include: {
            object: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
              },
            },
          },
        },
        mob: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        room: {
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

  async findOne(id: string): Promise<MobResetDto | null> {
    const reset = await this.prisma.mobReset.findUnique({
      where: { id },
      include: {
        equipment: {
          include: {
            object: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
              },
            },
          },
        },
        mob: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        room: {
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
    const reset = await this.prisma.mobReset.create({
      data: {
        maxInstances: data.maxInstances || 1,
        probability: data.probability || 1.0,
        comment: data.comment,
        mobZoneId: data.mobZoneId,
        mobId: data.mobId,
        roomZoneId: data.roomZoneId,
        roomId: data.roomId,
        zoneId: data.zoneId,
        equipment: data.equipment
          ? {
              create: data.equipment.map((eq) => ({
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
        equipment: {
          include: {
            object: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
              },
            },
          },
        },
        mob: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        room: {
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

  async update(id: string, data: UpdateMobResetInput): Promise<MobResetDto> {
    // Handle equipment updates
    const equipmentOperations =
      data.equipment?.map((eq) => {
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
              wearLocation: eq.wearLocation,
              maxInstances: eq.maxInstances || 1,
              probability: eq.probability || 1.0,
              resetId: id,
            },
          });
        }
      }) || [];

    // Execute all operations in transaction
    await this.prisma.$transaction([
      ...equipmentOperations,
      this.prisma.mobReset.update({
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

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.mobReset.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteEquipment(id: string): Promise<boolean> {
    try {
      await this.prisma.mobResetEquipment.delete({
        where: { id },
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
      equipment: reset.equipment.map((eq: any) => ({
        id: eq.id,
        objectZoneId: eq.objectZoneId,
        objectId: eq.objectId,
        wearLocation: eq.wearLocation,
        maxInstances: eq.maxInstances,
        probability: eq.probability,
        object: eq.object,
      })),
      mob: reset.mob,
      room: reset.room,
    };
  }
}
