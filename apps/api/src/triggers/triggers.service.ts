import { Injectable, NotFoundException } from '@nestjs/common';
import { TriggerAttachType } from '@prisma/client';
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
    return this.prisma.trigger.findMany({
      include: {
        mob: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            zoneId: true,
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
            zoneId: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            zoneId: true,
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

  async findByAttachment(attachType: TriggerAttachType, entityId: number) {
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
            zoneId: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            zoneId: true,
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
      triggerTypes: data.triggerTypes || [],
      script: data.commands,
      arguments: data.argList ? data.argList.split(' ') : [],
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

    return this.prisma.trigger.create({
      data: triggerData,
      include: {
        mob: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            zoneId: true,
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
            zoneId: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            zoneId: true,
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
    if (data.mobId && data.attachType === TriggerAttachType.MOB) {
      updateData.mobId = data.mobId;
    } else if (data.objectId && data.attachType === TriggerAttachType.OBJECT) {
      updateData.objectId = data.objectId;
    } else if (data.zoneId && data.attachType === TriggerAttachType.ZONE) {
      updateData.zoneId = data.zoneId;
    }

    return this.prisma.trigger.update({
      where: { id: data.triggerId },
      data: updateData,
      include: {
        mob: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            zoneId: true,
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
        mobZoneId: null,
        mobId: null,
        objectZoneId: null,
        objectId: null,
        zoneId: null,
        updatedBy: userId,
      },
      include: {
        mob: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
          },
        },
        object: {
          select: {
            id: true,
            zoneId: true,
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
    attachType: TriggerAttachType,
    entityId: number
  ) {
    switch (attachType) {
      case TriggerAttachType.MOB:
        return {
          attachType: TriggerAttachType.MOB,
          mobId: entityId,
        };
      case TriggerAttachType.OBJECT:
        return {
          attachType: TriggerAttachType.OBJECT,
          objectId: entityId,
        };
      case TriggerAttachType.ZONE:
        return {
          attachType: TriggerAttachType.ZONE,
          zoneId: entityId,
        };
      default:
        throw new Error(`Unknown attachment type: ${attachType}`);
    }
  }
}
