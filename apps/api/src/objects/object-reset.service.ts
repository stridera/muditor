import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@muditor/db';
import {
  assertContainerObject,
  assertSameTree,
  rethrowResetRowError,
  rethrowResetWriteError,
} from '../common/reset-content.util';
import { inVisibleZone } from '../common/god-zone-visibility';
import { DatabaseService } from '../database/database.service';
import {
  ResetContentInput,
  UpdateResetContentInput,
} from '../mobs/mob-reset.dto';
import {
  CreateObjectResetInput,
  ObjectResetDto,
  UpdateObjectResetInput,
} from '../object-resets/object-reset.dto';

const OBJECT_SUMMARY = {
  select: { id: true, zoneId: true, name: true, type: true },
} as const;

const RESET_INCLUDE = {
  objects: OBJECT_SUMMARY,
  rooms: { select: { id: true, zoneId: true, name: true } },
  contents: {
    orderBy: { id: 'asc' as const },
    include: { objects: OBJECT_SUMMARY },
  },
} satisfies Prisma.ObjectResetsInclude;

type ObjectResetWithRelations = Prisma.ObjectResetsGetPayload<{
  include: typeof RESET_INCLUDE;
}>;

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
      include: RESET_INCLUDE,
      orderBy: { id: 'asc' },
    });
    return resets.map(r => this.mapToDto(r));
  }

  async findByZone(
    zoneId: number,
    hideGodZones = false
  ): Promise<ObjectResetDto[]> {
    const resets = await this.prisma.objectResets.findMany({
      where: { zoneId, ...resetVisibility(hideGodZones) },
      include: RESET_INCLUDE,
      orderBy: [{ roomZoneId: 'asc' }, { roomId: 'asc' }, { id: 'asc' }],
    });
    return resets.map(r => this.mapToDto(r));
  }

  async findOne(
    id: number,
    hideGodZones = false
  ): Promise<ObjectResetDto | null> {
    const reset = await this.prisma.objectResets.findFirst({
      where: { AND: [{ id }, resetVisibility(hideGodZones)] },
      include: RESET_INCLUDE,
    });
    return reset ? this.mapToDto(reset) : null;
  }

  async create(data: CreateObjectResetInput): Promise<ObjectResetDto> {
    try {
      const reset = await this.prisma.objectResets.create({
        data: {
          maxInstances: data.maxInstances ?? 1,
          probability: data.probability ?? 1.0,
          comment: data.comment ?? null,
          objectZoneId: data.objectZoneId,
          objectId: data.objectId,
          roomZoneId: data.roomZoneId,
          roomId: data.roomId,
          zoneId: data.zoneId,
        },
        include: RESET_INCLUDE,
      });
      return this.mapToDto(reset);
    } catch (e) {
      return rethrowResetWriteError(e);
    }
  }

  async update(
    id: number,
    data: UpdateObjectResetInput
  ): Promise<ObjectResetDto> {
    if ((data.roomZoneId === undefined) !== (data.roomId === undefined)) {
      throw new BadRequestException(
        'Moving a reset needs both roomZoneId and roomId'
      );
    }
    const updateData: Prisma.ObjectResetsUncheckedUpdateInput = {};
    if (data.maxInstances !== undefined)
      updateData.maxInstances = { set: data.maxInstances };
    if (data.probability !== undefined)
      updateData.probability = { set: data.probability };
    if (data.comment !== undefined) updateData.comment = { set: data.comment };
    if (data.roomZoneId !== undefined)
      updateData.roomZoneId = { set: data.roomZoneId };
    if (data.roomId !== undefined) updateData.roomId = { set: data.roomId };

    try {
      await this.prisma.objectResets.update({
        where: { id },
        data: updateData,
      });
    } catch (e) {
      return rethrowResetWriteError(e);
    }
    const updated = await this.findOne(id);
    return updated!;
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.objectResets.delete({ where: { id } });
      return true;
    } catch (e) {
      return rethrowResetRowError(e, 'Object reset', id);
    }
  }

  /**
   * Put an object inside the reset's container. With `parentContentId` it
   * nests inside another content row of the same reset. Returns the whole
   * reset so the UI can refresh in one call.
   */
  async addContent(
    resetId: number,
    data: ResetContentInput
  ): Promise<ObjectResetDto> {
    const reset = await this.prisma.objectResets.findUnique({
      where: { id: resetId },
      include: { objects: OBJECT_SUMMARY },
    });
    if (!reset)
      throw new NotFoundException(`Object reset ${resetId} not found`);

    if (data.parentContentId != null) {
      const parent = await this.prisma.objectResetContents.findFirst({
        where: { id: data.parentContentId, resetId },
        include: { objects: OBJECT_SUMMARY },
      });
      assertSameTree(parent, data.parentContentId);
      assertContainerObject(parent.objects, 'nested container');
    } else {
      assertContainerObject(reset.objects, 'reset object');
    }

    try {
      await this.prisma.objectResetContents.create({
        data: {
          resetId,
          parentContentId: data.parentContentId ?? null,
          objectZoneId: data.objectZoneId,
          objectId: data.objectId,
          quantity: data.quantity ?? 1,
          maxInstances: data.maxInstances ?? 1,
          comment: data.comment ?? null,
        },
      });
    } catch (e) {
      return rethrowResetWriteError(e);
    }
    const updated = await this.findOne(resetId);
    return updated!;
  }

  async updateContent(
    id: number,
    data: UpdateResetContentInput
  ): Promise<boolean> {
    const update: Prisma.ObjectResetContentsUncheckedUpdateInput = {};
    if (data.quantity !== undefined) update.quantity = { set: data.quantity };
    if (data.maxInstances !== undefined)
      update.maxInstances = { set: data.maxInstances };
    if (data.comment !== undefined) update.comment = { set: data.comment };
    try {
      await this.prisma.objectResetContents.update({
        where: { id },
        data: update,
      });
      return true;
    } catch (e) {
      return rethrowResetRowError(e, 'Reset content', id);
    }
  }

  async deleteContent(id: number): Promise<boolean> {
    try {
      await this.prisma.objectResetContents.delete({ where: { id } });
      return true;
    } catch (e) {
      return rethrowResetRowError(e, 'Reset content', id);
    }
  }

  private mapToDto(reset: ObjectResetWithRelations): ObjectResetDto {
    const dto: ObjectResetDto = {
      id: reset.id,
      zoneId: reset.zoneId,
      objectZoneId: reset.objectZoneId,
      objectId: reset.objectId,
      roomZoneId: reset.roomZoneId,
      roomId: reset.roomId,
      maxInstances: reset.maxInstances,
      probability: reset.probability,
      object: {
        id: reset.objects.id,
        zoneId: reset.objects.zoneId,
        name: reset.objects.name,
        type: reset.objects.type,
      },
      contents: reset.contents.map(c => ({
        id: c.id,
        ...(c.parentContentId !== null
          ? { parentContentId: c.parentContentId }
          : {}),
        objectZoneId: c.objectZoneId,
        objectId: c.objectId,
        quantity: c.quantity,
        maxInstances: c.maxInstances,
        ...(c.comment !== null ? { comment: c.comment } : {}),
        object: {
          id: c.objects.id,
          zoneId: c.objects.zoneId,
          name: c.objects.name,
          type: c.objects.type,
        },
      })),
    };
    if (reset.rooms) {
      dto.room = {
        id: reset.rooms.id,
        zoneId: reset.rooms.zoneId,
        name: reset.rooms.name,
      };
    }
    if (reset.comment !== null) dto.comment = reset.comment;
    return dto;
  }
}
