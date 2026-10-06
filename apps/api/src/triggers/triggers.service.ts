import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ScriptType, TriggerFlag } from '@muditor/db';
import { lintLua, lintLuaWithEntities } from '@muditor/types';
import type { EntityDatabase } from '@muditor/types';
import { DatabaseService } from '../database/database.service';
import {
  AttachTriggerInput,
  CreateTriggerInput,
  UpdateTriggerInput,
} from './trigger.dto';

@Injectable()
export class TriggersService {
  private entityDbCache: EntityDatabase | null = null;
  private entityDbCacheTime = 0;
  private static readonly ENTITY_CACHE_TTL_MS = 60_000; // 1 minute

  constructor(private prisma: DatabaseService) {}

  async findAll() {
    return this.prisma.triggers.findMany({
      include: {
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
      flags: (data.flags ?? []) as TriggerFlag[],
    };

    // Lint the script commands on create
    const lintResult = await this.lintCommands(data.commands);
    triggerData.syntaxError = lintResult.syntaxError;
    triggerData.needsReview = lintResult.needsReview;

    return this.prisma.triggers.create({
      data: triggerData,
      include: {
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
      const argListUpdate: Prisma.TriggersUpdateargListInput = {
        set: data.argList,
      };
      updateData.argList = argListUpdate;
      updateData.numArgs = data.argList.length;
    }
    if (data.flags) {
      const flagsUpdate: Prisma.TriggersUpdateflagsInput = {
        set: data.flags as TriggerFlag[],
      };
      updateData.flags = flagsUpdate;
    }

    // Re-lint when commands are updated
    if (data.commands !== undefined) {
      const lintResult = await this.lintCommands(data.commands);
      updateData.syntaxError = lintResult.syntaxError;
      updateData.needsReview = lintResult.needsReview;
    }

    return this.prisma.triggers.update({
      where: { zoneId_id: { zoneId, id } },
      data: updateData,
      include: {
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
    // Triggers no longer carry direct mob/object FKs — attachments live in
    // MobTriggers/ObjectTriggers junction tables. Create the link rows.
    if (data.mobId && data.mobZoneId && data.attachType === ScriptType.MOB) {
      await this.prisma.mobTriggers.upsert({
        where: {
          mobZoneId_mobId_triggerZoneId_triggerId: {
            mobZoneId: data.mobZoneId,
            mobId: data.mobId,
            triggerZoneId: data.triggerZoneId,
            triggerId: data.triggerId,
          },
        },
        create: {
          mobZoneId: data.mobZoneId,
          mobId: data.mobId,
          triggerZoneId: data.triggerZoneId,
          triggerId: data.triggerId,
        },
        update: {},
      });
    } else if (
      data.objectId &&
      data.objectZoneId &&
      data.attachType === ScriptType.OBJECT
    ) {
      await this.prisma.objectTriggers.upsert({
        where: {
          objectZoneId_objectId_triggerZoneId_triggerId: {
            objectZoneId: data.objectZoneId,
            objectId: data.objectId,
            triggerZoneId: data.triggerZoneId,
            triggerId: data.triggerId,
          },
        },
        create: {
          objectZoneId: data.objectZoneId,
          objectId: data.objectId,
          triggerZoneId: data.triggerZoneId,
          triggerId: data.triggerId,
        },
        update: {},
      });
    }

    // Optionally bump attachType + updatedBy on the trigger row
    const updateData: Prisma.TriggersUncheckedUpdateInput = {
      attachType: data.attachType,
    };
    if (userId !== undefined) updateData.updatedBy = userId;
    return this.prisma.triggers.update({
      where: { zoneId_id: { zoneId: data.triggerZoneId, id: data.triggerId } },
      data: updateData,
      include: {
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Detach a trigger from exactly one entity. The delete is scoped to the
   * given mob or object key so the trigger stays attached everywhere else.
   */
  async detachFromEntity(
    zoneId: number,
    id: number,
    entity: {
      mobZoneId?: number | null | undefined;
      mobId?: number | null | undefined;
      objectZoneId?: number | null | undefined;
      objectId?: number | null | undefined;
    },
    userId?: string
  ) {
    const { mobZoneId, mobId, objectZoneId, objectId } = entity;
    const hasMob = mobZoneId != null && mobId != null;
    const hasObject = objectZoneId != null && objectId != null;
    if (hasMob === hasObject) {
      throw new BadRequestException(
        'Specify exactly one entity to detach from: mobZoneId+mobId or objectZoneId+objectId'
      );
    }

    if (mobZoneId != null && mobId != null) {
      await this.prisma.mobTriggers.deleteMany({
        where: { triggerZoneId: zoneId, triggerId: id, mobZoneId, mobId },
      });
    } else if (objectZoneId != null && objectId != null) {
      await this.prisma.objectTriggers.deleteMany({
        where: { triggerZoneId: zoneId, triggerId: id, objectZoneId, objectId },
      });
    }

    const data: Prisma.TriggersUncheckedUpdateInput = {};
    if (userId !== undefined) data.updatedBy = userId;
    return this.prisma.triggers.update({
      where: { zoneId_id: { zoneId, id } },
      data,
      include: {
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /** Run linter on script commands and return lint fields for the DB record. */
  private async lintCommands(commands: string): Promise<{
    syntaxError: string | null;
    needsReview: boolean;
  }> {
    const issues = lintLua(commands);

    // Also run entity validation
    const entityDb = await this.loadEntityDatabase();
    const entityIssues = lintLuaWithEntities(commands, entityDb);
    issues.push(...entityIssues);

    const firstError = issues.find(i => i.severity === 'error');
    const firstWarning = !firstError
      ? issues.find(i => i.rule === 'entity-not-found')
      : undefined;
    const topIssue = firstError ?? firstWarning;
    return {
      syntaxError: topIssue
        ? `Line ${topIssue.line}: ${topIssue.message}`
        : null,
      needsReview: !!firstError,
    };
  }

  /** Load entity IDs from the database (cached for 1 minute). */
  private async loadEntityDatabase(): Promise<EntityDatabase> {
    const now = Date.now();
    if (
      this.entityDbCache &&
      now - this.entityDbCacheTime < TriggersService.ENTITY_CACHE_TTL_MS
    ) {
      return this.entityDbCache;
    }

    const [rooms, mobs, objects] = await Promise.all([
      this.prisma.room.findMany({ select: { zoneId: true, id: true } }),
      this.prisma.mobs.findMany({ select: { zoneId: true, id: true } }),
      this.prisma.objects.findMany({ select: { zoneId: true, id: true } }),
    ]);

    this.entityDbCache = {
      rooms: new Set(
        rooms.map((r: { zoneId: number; id: number }) => `${r.zoneId}:${r.id}`)
      ),
      mobs: new Set(
        mobs.map((m: { zoneId: number; id: number }) => `${m.zoneId}:${m.id}`)
      ),
      objects: new Set(
        objects.map(
          (o: { zoneId: number; id: number }) => `${o.zoneId}:${o.id}`
        )
      ),
    };
    this.entityDbCacheTime = now;
    return this.entityDbCache;
  }

  private buildWhereClauseForAttachment(
    attachType: ScriptType,
    zoneId: number,
    entityId: number
  ): Prisma.TriggersWhereInput {
    switch (attachType) {
      case ScriptType.MOB:
        return {
          attachType: ScriptType.MOB,
          mobTriggers: {
            some: { mobZoneId: zoneId, mobId: entityId },
          },
        };
      case ScriptType.OBJECT:
        return {
          attachType: ScriptType.OBJECT,
          objectTriggers: {
            some: { objectZoneId: zoneId, objectId: entityId },
          },
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
