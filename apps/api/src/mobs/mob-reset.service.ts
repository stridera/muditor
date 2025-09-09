import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  MobResetDto,
  CreateMobResetInput,
  UpdateMobResetInput,
  CreateMobCarryingInput,
  CreateMobEquippedInput,
  UpdateMobCarryingInput,
  UpdateMobEquippedInput,
} from './mob-reset.dto';

@Injectable()
export class MobResetService {
  constructor(private prisma: DatabaseService) {}

  async findByMob(mobId: number): Promise<MobResetDto[]> {
    const resets = await this.prisma.mobReset.findMany({
      where: { mobId },
      include: {
        carrying: {
          include: {
            object: {
              select: {
                id: true,
                shortDesc: true,
                type: true,
              },
            },
          },
        },
        equipped: {
          include: {
            object: {
              select: {
                id: true,
                shortDesc: true,
                type: true,
              },
            },
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
        carrying: {
          include: {
            object: {
              select: {
                id: true,
                shortDesc: true,
                type: true,
              },
            },
          },
        },
        equipped: {
          include: {
            object: {
              select: {
                id: true,
                shortDesc: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return reset ? this.mapToDto(reset) : null;
  }

  async create(data: CreateMobResetInput): Promise<MobResetDto> {
    const reset = await this.prisma.mobReset.create({
      data: {
        max: data.max,
        name: data.name,
        mobId: data.mobId,
        roomId: data.roomId,
        zoneId: data.zoneId,
        carrying: {
          create: data.carrying.map(carrying => ({
            max: carrying.max,
            name: carrying.name,
            objectId: carrying.objectId,
          })),
        },
        equipped: {
          create: data.equipped.map(equipped => ({
            max: equipped.max,
            location: equipped.location,
            name: equipped.name,
            objectId: equipped.objectId,
          })),
        },
      },
      include: {
        carrying: {
          include: {
            object: {
              select: {
                id: true,
                shortDesc: true,
                type: true,
              },
            },
          },
        },
        equipped: {
          include: {
            object: {
              select: {
                id: true,
                shortDesc: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return this.mapToDto(reset);
  }

  async update(id: string, data: UpdateMobResetInput): Promise<MobResetDto> {
    // Handle carrying updates
    const carryingOperations =
      data.carrying?.map(carrying => {
        if (carrying.id) {
          // Update existing
          return this.prisma.mobCarrying.update({
            where: { id: carrying.id },
            data: {
              max: carrying.max,
              name: carrying.name,
              objectId: carrying.objectId,
            },
          });
        } else {
          // Create new
          return this.prisma.mobCarrying.create({
            data: {
              max: carrying.max || 1,
              name: carrying.name,
              objectId: carrying.objectId!,
              resetId: id,
            },
          });
        }
      }) || [];

    // Handle equipped updates
    const equippedOperations =
      data.equipped?.map(equipped => {
        if (equipped.id) {
          // Update existing
          return this.prisma.mobEquipped.update({
            where: { id: equipped.id },
            data: {
              max: equipped.max,
              location: equipped.location,
              name: equipped.name,
              objectId: equipped.objectId,
            },
          });
        } else {
          // Create new
          return this.prisma.mobEquipped.create({
            data: {
              max: equipped.max || 1,
              location: equipped.location!,
              name: equipped.name,
              objectId: equipped.objectId!,
              resetId: id,
            },
          });
        }
      }) || [];

    // Execute all operations in transaction
    await this.prisma.$transaction([
      ...carryingOperations,
      ...equippedOperations,
      this.prisma.mobReset.update({
        where: { id },
        data: {
          max: data.max,
          name: data.name,
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

  async deleteCarrying(id: string): Promise<boolean> {
    try {
      await this.prisma.mobCarrying.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteEquipped(id: string): Promise<boolean> {
    try {
      await this.prisma.mobEquipped.delete({
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
      max: reset.max,
      name: reset.name,
      mobId: reset.mobId,
      roomId: reset.roomId,
      zoneId: reset.zoneId,
      carrying: reset.carrying.map((carrying: any) => ({
        id: carrying.id,
        max: carrying.max,
        name: carrying.name,
        objectId: carrying.objectId,
        object: carrying.object,
      })),
      equipped: reset.equipped.map((equipped: any) => ({
        id: equipped.id,
        max: equipped.max,
        location: equipped.location,
        name: equipped.name,
        objectId: equipped.objectId,
        object: equipped.object,
      })),
    };
  }
}
