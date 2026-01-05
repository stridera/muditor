import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ScriptType } from '@prisma/client';
import { DatabaseService } from '../database/database.service';
import {
  AttachTriggerInput,
  CreateTriggerInput,
  UpdateTriggerInput,
} from './trigger.dto';

@Injectable()
export class TriggersService {
  constructor(private prisma: DatabaseService) {}

  async findAll() {
    return this.prisma.triggers.findMany({
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ zoneId: 'asc' }, { id: 'asc' }],
    });
  }

  async findByZone(zoneId: number) {
    return this.prisma.triggers.findMany({
      where: { zoneId },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async findNeedingReview() {
    return this.prisma.triggers.findMany({
      where: {
        needsReview: true,
      },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ zoneId: 'asc' }, { id: 'asc' }],
    });
  }

  async countNeedingReview() {
    return this.prisma.triggers.count({
      where: {
        needsReview: true,
      },
    });
  }

  async clearNeedsReview(zoneId: number, id: number, userId?: string) {
    return this.prisma.triggers.update({
      where: { zoneId_id: { zoneId, id } },
      data: {
        needsReview: false,
        syntaxError: null,
        updatedBy: userId ?? null,
      },
    });
  }

  async findOne(zoneId: number, id: number) {
    const trigger = await this.prisma.triggers.findUnique({
      where: { zoneId_id: { zoneId, id } },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
        mobTriggers: {
          include: {
            mob: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                plainName: true,
              },
            },
          },
        },
        objectTriggers: {
          include: {
            object: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                plainName: true,
              },
            },
          },
        },
      },
    });

    if (!trigger) {
      throw new NotFoundException(`Trigger ${zoneId}:${id} not found`);
    }

    return trigger;
  }

  async findByAttachment(
    attachType: ScriptType,
    zoneId: number,
    entityId: number
  ) {
    const whereClause = this.buildWhereClauseForAttachment(
      attachType,
      zoneId,
      entityId
    );

    return this.prisma.triggers.findMany({
      where: whereClause,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async create(data: CreateTriggerInput, userId?: string) {
    // Get next available ID in the zone
    const maxTrigger = await this.prisma.triggers.findFirst({
      where: { zoneId: data.zoneId },
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    const nextId = data.id ?? (maxTrigger?.id ?? -1) + 1;

    const triggerData: Prisma.TriggersUncheckedCreateInput = {
      zoneId: data.zoneId,
      id: nextId,
      name: data.name,
      attachType: data.attachType,
      commands: data.commands,
      argList: data.argList || [],
      numArgs: (data.argList || []).length,
      createdBy: userId ?? null,
      mobZoneId: null,
      mobId: null,
      objectZoneId: null,
      objectId: null,
      variables: {},
      flags: [],
    };

    if (data.mobId && data.mobZoneId) {
      triggerData.mobZoneId = data.mobZoneId;
      triggerData.mobId = data.mobId;
    } else if (data.objectId && data.objectZoneId) {
      triggerData.objectZoneId = data.objectZoneId;
      triggerData.objectId = data.objectId;
    }

    return this.prisma.triggers.create({
      data: triggerData,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(
    zoneId: number,
    id: number,
    data: UpdateTriggerInput,
    userId?: string
  ) {
    await this.findOne(zoneId, id);

    const updateData: Prisma.TriggersUncheckedUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.attachType !== undefined) updateData.attachType = data.attachType;
    if (data.commands !== undefined) updateData.commands = data.commands;
    if (userId !== undefined) updateData.updatedBy = userId;
    if (data.argList) {
      updateData.argList = {
        set: data.argList,
      } as Prisma.TriggersUpdateargListInput;
      updateData.numArgs = data.argList.length;
    }
    if (data.variables) {
      updateData.variables = JSON.parse(data.variables);
    }
    if (data.mobId !== undefined && data.mobZoneId !== undefined) {
      updateData.mobZoneId = data.mobZoneId;
      updateData.mobId = data.mobId;
      updateData.objectZoneId = null;
      updateData.objectId = null;
    } else if (data.objectId !== undefined && data.objectZoneId !== undefined) {
      updateData.objectZoneId = data.objectZoneId;
      updateData.objectId = data.objectId;
      updateData.mobZoneId = null;
      updateData.mobId = null;
    }

    return this.prisma.triggers.update({
      where: { zoneId_id: { zoneId, id } },
      data: updateData,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(zoneId: number, id: number) {
    const existing = await this.findOne(zoneId, id);

    await this.prisma.triggers.delete({
      where: { zoneId_id: { zoneId, id } },
    });

    return existing;
  }

  async attachToEntity(data: AttachTriggerInput, userId?: string) {
    const updateData: Prisma.TriggersUncheckedUpdateInput = {
      attachType: data.attachType,
    };
    if (userId !== undefined) updateData.updatedBy = userId;

    updateData.mobZoneId = null;
    updateData.mobId = null;
    updateData.objectZoneId = null;
    updateData.objectId = null;

    if (data.mobId && data.mobZoneId && data.attachType === ScriptType.MOB) {
      updateData.mobZoneId = data.mobZoneId;
      updateData.mobId = data.mobId;
    } else if (
      data.objectId &&
      data.objectZoneId &&
      data.attachType === ScriptType.OBJECT
    ) {
      updateData.objectZoneId = data.objectZoneId;
      updateData.objectId = data.objectId;
    }

    return this.prisma.triggers.update({
      where: { zoneId_id: { zoneId: data.triggerZoneId, id: data.triggerId } },
      data: updateData,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async detachFromEntity(zoneId: number, id: number, userId?: string) {
    const data: Prisma.TriggersUncheckedUpdateInput = {
      mobZoneId: null,
      mobId: null,
      objectZoneId: null,
      objectId: null,
    };
    if (userId !== undefined) data.updatedBy = userId;
    return this.prisma.triggers.update({
      where: { zoneId_id: { zoneId, id } },
      data,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  private buildWhereClauseForAttachment(
    attachType: ScriptType,
    zoneId: number,
    entityId: number
  ) {
    switch (attachType) {
      case ScriptType.MOB:
        return {
          attachType: ScriptType.MOB,
          mobZoneId: zoneId,
          mobId: entityId,
        };
      case ScriptType.OBJECT:
        return {
          attachType: ScriptType.OBJECT,
          objectZoneId: zoneId,
          objectId: entityId,
        };
      case ScriptType.WORLD:
        return {
          attachType: ScriptType.WORLD,
          zoneId,
        };
      default:
        throw new Error(`Unknown attachment type: ${attachType}`);
    }
  }
}
