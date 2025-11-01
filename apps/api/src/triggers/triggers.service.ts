import { Injectable, NotFoundException } from '@nestjs/common';
import { ScriptType } from '@prisma/client';
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
            shortDesc: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    const trigger = await this.prisma.triggers.findUnique({
      where: { id },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
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

    if (!trigger) {
      throw new NotFoundException(`Trigger with ID ${id} not found`);
    }

    return trigger;
  }

  async findByAttachment(attachType: ScriptType, entityId: number) {
    const whereClause = this.buildWhereClauseForAttachment(
      attachType,
      entityId
    );

    return this.prisma.triggers.findMany({
      where: whereClause,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: CreateTriggerInput, userId?: string) {
    const triggerData: any = {
      name: data.name,
      attachType: data.attachType,
      script: data.commands,
      arguments: data.argList || [],
      createdBy: userId,
    };

    // Set the appropriate attachment based on attachType
    if (data.mobId) {
      triggerData.mobZoneId = data.zoneId;
      triggerData.mobId = data.mobId;
    } else if (data.objectId) {
      triggerData.objectZoneId = data.zoneId;
      triggerData.objectId = data.objectId;
    } else if (data.zoneId) {
      triggerData.zoneId = data.zoneId;
    }

    return this.prisma.triggers.create({
      data: triggerData,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
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

  async update(id: number, data: UpdateTriggerInput, userId?: string) {
    const existing = await this.findOne(id);

    const updateData: any = {
      ...data,
      updatedBy: userId,
    };

    // Handle variables JSON conversion
    if (data.variables) {
      updateData.variables = JSON.parse(data.variables);
    }

    // Handle attachment changes
    if (data.mobId !== undefined) {
      updateData.mobId = data.mobId;
      updateData.objectId = null;
      updateData.zoneId = null;
    } else if (data.objectId !== undefined) {
      updateData.objectId = data.objectId;
      updateData.mobId = null;
      updateData.zoneId = null;
    } else if (data.zoneId !== undefined) {
      updateData.zoneId = data.zoneId;
      updateData.mobId = null;
      updateData.objectId = null;
    }

    return this.prisma.triggers.update({
      where: { id },
      data: updateData,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
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

  async delete(id: number) {
    const existing = await this.findOne(id);

    await this.prisma.triggers.delete({
      where: { id },
    });

    return existing;
  }

  async attachToEntity(data: AttachTriggerInput, userId?: string) {
    const updateData: any = {
      attachType: data.attachType,
      updatedBy: userId,
    };

    // Clear all attachments first
    updateData.mobId = null;
    updateData.objectId = null;
    updateData.zoneId = null;

    // Set the appropriate attachment
    if (data.mobId && data.attachType === ScriptType.MOB) {
      updateData.mobId = data.mobId;
    } else if (data.objectId && data.attachType === ScriptType.OBJECT) {
      updateData.objectId = data.objectId;
    } else if (data.zoneId && data.attachType === ScriptType.WORLD) {
      updateData.zoneId = data.zoneId;
    }

    return this.prisma.triggers.update({
      where: { id: data.triggerId },
      data: updateData,
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
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

  async detachFromEntity(triggerId: number, userId?: string) {
    return this.prisma.triggers.update({
      where: { id: triggerId },
      data: {
        mobZoneId: null,
        mobId: null,
        objectZoneId: null,
        objectId: null,
        zoneId: null,
        updatedBy: userId,
      },
      include: {
        mobs: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        objects: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
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
    entityId: number
  ) {
    switch (attachType) {
      case ScriptType.MOB:
        return {
          attachType: ScriptType.MOB,
          mobId: entityId,
        };
      case ScriptType.OBJECT:
        return {
          attachType: ScriptType.OBJECT,
          objectId: entityId,
        };
      case ScriptType.WORLD:
        return {
          attachType: ScriptType.WORLD,
          zoneId: entityId,
        };
      default:
        throw new Error(`Unknown attachment type: ${attachType}`);
    }
  }
}
