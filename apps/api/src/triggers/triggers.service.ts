import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateTriggerInput,
  UpdateTriggerInput,
  AttachTriggerInput,
} from './trigger.dto';
import { ScriptType } from '@prisma/client';

@Injectable()
export class TriggersService {
  constructor(private prisma: DatabaseService) {}

  async findAll() {
    return this.prisma.trigger.findMany({
      include: {
        mob: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        zone: {
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

  async findOne(id: string) {
    const trigger = await this.prisma.trigger.findUnique({
      where: { id },
      include: {
        mob: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        zone: {
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

    return this.prisma.trigger.findMany({
      where: whereClause,
      include: {
        mob: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        zone: {
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
      numArgs: data.numArgs || 0,
      argList: data.argList,
      commands: data.commands,
      variables: JSON.parse(data.variables || '{}'),
      flags: data.flags || [],
      createdBy: userId,
    };

    // Set the appropriate attachment based on attachType
    if (data.mobId && data.attachType === ScriptType.MOB) {
      triggerData.mobId = data.mobId;
    } else if (data.objectId && data.attachType === ScriptType.OBJECT) {
      triggerData.objectId = data.objectId;
    } else if (data.zoneId && data.attachType === ScriptType.WORLD) {
      triggerData.zoneId = data.zoneId;
    }

    return this.prisma.trigger.create({
      data: triggerData,
      include: {
        mob: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateTriggerInput, userId?: string) {
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

    return this.prisma.trigger.update({
      where: { id },
      data: updateData,
      include: {
        mob: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    const existing = await this.findOne(id);

    await this.prisma.trigger.delete({
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

    return this.prisma.trigger.update({
      where: { id: data.triggerId },
      data: updateData,
      include: {
        mob: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        zone: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async detachFromEntity(triggerId: string, userId?: string) {
    return this.prisma.trigger.update({
      where: { id: triggerId },
      data: {
        mobId: null,
        objectId: null,
        zoneId: null,
        updatedBy: userId,
      },
      include: {
        mob: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            shortDesc: true,
          },
        },
        zone: {
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
