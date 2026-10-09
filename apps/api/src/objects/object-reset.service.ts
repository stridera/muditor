import { Injectable } from '@nestjs/common';
import {
  type ObjectResets,
  ObjectType as ObjectTypeEnum,
  Prisma,
} from '@muditor/db';
import { inVisibleZone } from '../common/god-zone-visibility';
import { DatabaseService } from '../database/database.service';
import {
  CreateObjectResetInput,
  ObjectResetDto,
  UpdateObjectResetInput,
} from '../object-resets/object-reset.dto';

// Internal relation shape used after Prisma queries
interface ObjectResetWithRelations extends ObjectResets {
  objects: {
    id: number;
    zoneId: number;
    name: string;
    type: ObjectTypeEnum;
  };
  rooms?: {
    id: number;
    zoneId: number;
    name: string;
  } | null;
  containedResets?: ObjectResetWithRelations[];
}

/**
 * A reset is hidden from the public when its zone, the room it spawns into or
 * the object it spawns lives in a god zone.
 */
function resetVisibility(hide: boolean): Prisma.ObjectResetsWhereInput {
  if (!hide) return {};
  return {
    ...inVisibleZone(true),
    rooms: { zones: { isGodZone: false } },
    objects: { zones: { isGodZone: false } },
  };
}

@Injectable()
export class ObjectResetService {
  constructor(private prisma: DatabaseService) {}

  async findByRoom(
    roomZoneId: number,
    roomId: number,
    hideGodZones = false
  ): Promise<ObjectResetDto[]> {
    const resets = await this.prisma.objectResets.findMany({
      where: { roomZoneId, roomId, ...resetVisibility(hideGodZones) },
      include: {
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
            type: true,
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

  async findByZone(
    zoneId: number,
    hideGodZones = false
  ): Promise<ObjectResetDto[]> {
    const resets = await this.prisma.objectResets.findMany({
      where: { zoneId, ...resetVisibility(hideGodZones) },
      include: {
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
            type: true,
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

  async findOne(
    id: number,
    hideGodZones = false
  ): Promise<ObjectResetDto | null> {
    const reset = await this.prisma.objectResets.findFirst({
      where: { AND: [{ id }, resetVisibility(hideGodZones)] },
      include: {
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
            type: true,
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

  async create(data: CreateObjectResetInput): Promise<ObjectResetDto> {
    const reset = await this.prisma.objectResets.create({
      data: {
        maxInstances: data.max ?? 1,
        probability: data.probability ?? 1.0,
        objectZoneId: data.zoneId, // Objects are typically in the same zone as the reset
        objectId: data.objectId,
        roomZoneId: data.zoneId,
        roomId: data.roomId,
        zoneId: data.zoneId,
      },
      include: {
        objects: {
          select: { id: true, zoneId: true, name: true, type: true },
        },
        rooms: {
          select: { id: true, zoneId: true, name: true },
        },
      },
    });

    return this.mapToDto(reset as ObjectResetWithRelations);
  }

  async update(
    id: number,
    data: UpdateObjectResetInput
  ): Promise<ObjectResetDto> {
    const updateData: Prisma.ObjectResetsUncheckedUpdateInput = {};

    if (data.max !== undefined) updateData.maxInstances = { set: data.max };
    if (data.probability !== undefined)
      updateData.probability = { set: data.probability };

    await this.prisma.objectResets.update({
      where: { id },
      data: updateData,
    });

    const updatedReset = await this.findOne(id);
    return updatedReset!;
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.objectResets.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  private mapToDto(reset: ObjectResetWithRelations): ObjectResetDto {
    const dto: ObjectResetDto = {
      id: String(reset.id),
      max: reset.maxInstances,
      objectId: reset.objectId,
      roomId: reset.roomId ?? 0,
      zoneId: reset.zoneId,
      probability: reset.probability,
      object: {
        id: reset.objects.id,
        zoneId: reset.objects.zoneId,
        name: reset.objects.name,
        plainName: '',
        keywords: [],
        roomDescription: '',
        plainRoomDescription: '',
        examineDescription: '',
        plainExamineDescription: '',
        type: reset.objects.type,
        flags: [],
        wearFlags: [],
        restrictions: [],
        restrictedClassIds: [],
        restrictedAlignments: [],
        restrictedRaces: [],
        allowedRaces: [],
        values: {},
        weight: 0,
        cost: 0,
        level: 0,
        timer: 0,
        decomposeTimer: 0,
        concealment: 0,
        grantedEffects: [],
        objectResistances: [],
        consumableEffects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    if (reset.comment) {
      dto.name = reset.comment;
    }

    return dto;
  }
}
