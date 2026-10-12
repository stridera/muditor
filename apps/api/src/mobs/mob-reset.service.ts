import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  type MobResetEquipment,
  type MobResetEquipmentContents,
  type MobResets,
  Prisma,
  WearFlag,
} from '@muditor/db';
import { inVisibleZone } from '../common/god-zone-visibility';
import { DatabaseService } from '../database/database.service';
import {
  assertContainerObject,
  assertSameTree,
  rethrowResetRowError,
  rethrowResetWriteError,
} from '../common/reset-content.util';
import {
  CreateMobResetInput,
  MobResetDto,
  MobResetEquipmentDto,
  ResetContentInput,
  UpdateMobResetInput,
  UpdateResetContentInput,
} from './mob-reset.dto';

// Internal relation shape used after Prisma queries so we can drop all `any` usage.
interface MobResetWithRelations extends MobResets {
  mobResetEquipment: Array<
    MobResetEquipment & {
      objects: {
        id: number;
        zoneId: number;
        name: string;
        type: string;
      };
      contents?: Array<
        MobResetEquipmentContents & {
          objects: { id: number; zoneId: number; name: string; type: string };
        }
      >;
    }
  >;
  mobs?: { id: number; zoneId: number; name: string } | null;
  rooms?: { id: number; zoneId: number; name: string } | null;
}

/**
 * A reset is hidden from the public when its zone, the room it spawns into or
 * the mob it spawns lives in a god zone.
 */
function resetVisibility(hide: boolean): Prisma.MobResetsWhereInput {
  if (!hide) return {};
  return {
    ...inVisibleZone(true),
    rooms: { zones: { isGodZone: false } },
    mobs: { zones: { isGodZone: false } },
  };
}

const OBJECT_SUMMARY = {
  select: { id: true, zoneId: true, name: true, type: true },
} as const;

/** Everything mapToDto needs; shared so every read returns the same shape. */
const RESET_INCLUDE = {
  mobResetEquipment: {
    orderBy: { id: 'asc' as const },
    include: {
      objects: OBJECT_SUMMARY,
      contents: {
        orderBy: { id: 'asc' as const },
        include: { objects: OBJECT_SUMMARY },
      },
    },
  },
  mobs: { select: { id: true, zoneId: true, name: true } },
  rooms: { select: { id: true, zoneId: true, name: true } },
} satisfies Prisma.MobResetsInclude;

@Injectable()
export class MobResetService {
  constructor(private prisma: DatabaseService) {}

  async findByMob(
    mobZoneId: number,
    mobId: number,
    hideGodZones = false
  ): Promise<MobResetDto[]> {
    const resets = await this.prisma.mobResets.findMany({
      where: { mobZoneId, mobId, ...resetVisibility(hideGodZones) },
      include: RESET_INCLUDE,
    });
    return resets.map(this.mapToDto);
  }

  async findByZone(
    zoneId: number,
    hideGodZones = false
  ): Promise<MobResetDto[]> {
    const resets = await this.prisma.mobResets.findMany({
      where: { zoneId, ...resetVisibility(hideGodZones) },
      include: RESET_INCLUDE,
      orderBy: [{ roomZoneId: 'asc' }, { roomId: 'asc' }, { id: 'asc' }],
    });
    return resets.map(this.mapToDto);
  }

  async findByRoom(
    roomZoneId: number,
    roomId: number,
    hideGodZones = false
  ): Promise<MobResetDto[]> {
    const resets = await this.prisma.mobResets.findMany({
      where: { roomZoneId, roomId, ...resetVisibility(hideGodZones) },
      include: RESET_INCLUDE,
      orderBy: { id: 'asc' },
    });
    return resets.map(this.mapToDto);
  }

  async findOne(id: number, hideGodZones = false): Promise<MobResetDto | null> {
    const reset = await this.prisma.mobResets.findFirst({
      where: { AND: [{ id }, resetVisibility(hideGodZones)] },
      include: RESET_INCLUDE,
    });
    return reset ? this.mapToDto(reset) : null;
  }

  async create(data: CreateMobResetInput): Promise<MobResetDto> {
    const baseData: Prisma.MobResetsUncheckedCreateInput = {
      maxInstances: data.maxInstances ?? 1,
      probability: data.probability ?? 1.0,
      comment: data.comment ?? null,
      mobZoneId: data.mobZoneId,
      mobId: data.mobId,
      roomZoneId: data.roomZoneId,
      roomId: data.roomId,
      zoneId: data.zoneId,
    };

    const equipmentCreate =
      data.equipment && data.equipment.length
        ? {
            create: data.equipment.map(eq => ({
              objectZoneId: eq.objectZoneId,
              objectId: eq.objectId,
              wearLocation: eq.wearLocation ?? null,
              maxInstances: eq.maxInstances ?? 1,
              probability: eq.probability ?? 1.0,
            })),
          }
        : undefined;

    try {
      const reset = await this.prisma.mobResets.create({
        data: {
          ...baseData,
          ...(equipmentCreate && { mobResetEquipment: equipmentCreate }),
        },
        include: RESET_INCLUDE,
      });
      return this.mapToDto(reset as MobResetWithRelations);
    } catch (e) {
      return rethrowResetWriteError(e);
    }
  }

  async update(id: number, data: UpdateMobResetInput): Promise<MobResetDto> {
    if ((data.roomZoneId === undefined) !== (data.roomId === undefined)) {
      throw new BadRequestException(
        'Moving a reset needs both roomZoneId and roomId'
      );
    }
    // Handle equipment updates
    const equipmentOperations = (data.equipment || []).map(eq => {
      if (eq.id) {
        const updateData: Prisma.MobResetEquipmentUncheckedUpdateInput = {};
        if (eq.objectZoneId !== undefined)
          updateData.objectZoneId = { set: eq.objectZoneId };
        if (eq.objectId !== undefined)
          updateData.objectId = { set: eq.objectId };
        if (eq.wearLocation !== undefined)
          updateData.wearLocation = { set: eq.wearLocation ?? null };
        if (eq.maxInstances !== undefined)
          updateData.maxInstances = { set: eq.maxInstances };
        if (eq.probability !== undefined)
          updateData.probability = { set: eq.probability };
        // Scoped to this reset: an equipment id from another (possibly
        // other-zone) reset must not be writable through this one.
        return this.prisma.mobResetEquipment.updateMany({
          where: { id: eq.id, resetId: id },
          data: updateData,
        });
      }
      return this.prisma.mobResetEquipment.create({
        data: {
          objectZoneId: eq.objectZoneId!,
          objectId: eq.objectId!,
          resetId: id,
          wearLocation: eq.wearLocation ?? null,
          maxInstances: eq.maxInstances ?? 1,
          probability: eq.probability ?? 1.0,
        },
      });
    });

    // Execute all operations in transaction
    try {
      // @ts-expect-error - Extended Prisma client type incompatibility with transaction array syntax
      await this.prisma.$transaction([
        ...equipmentOperations,
        this.prisma.mobResets.update({
          where: { id },
          data: (() => {
            const updateData: Prisma.MobResetsUncheckedUpdateInput = {};
            if (data.maxInstances !== undefined)
              updateData.maxInstances = { set: data.maxInstances };
            if (data.probability !== undefined)
              updateData.probability = { set: data.probability };
            if (data.comment !== undefined)
              updateData.comment = { set: data.comment };
            if (data.roomZoneId !== undefined)
              updateData.roomZoneId = { set: data.roomZoneId };
            if (data.roomId !== undefined)
              updateData.roomId = { set: data.roomId };
            return updateData;
          })(),
        }),
      ]);
    } catch (e) {
      return rethrowResetWriteError(e);
    }

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
      wearLocation?: WearFlag;
      maxInstances?: number;
      probability?: number;
      decorative?: boolean;
    }
  ): Promise<MobResetDto> {
    try {
      await this.prisma.mobResetEquipment.create({
        data: {
          resetId,
          objectZoneId: equipment.objectZoneId,
          objectId: equipment.objectId,
          wearLocation: equipment.wearLocation ?? null,
          maxInstances: equipment.maxInstances ?? 1,
          probability: equipment.probability ?? 1.0,
          decorative: equipment.decorative ?? false,
        },
      });
    } catch (e) {
      return rethrowResetWriteError(e);
    }

    // Return updated reset
    const updatedReset = await this.findOne(resetId);
    return updatedReset!;
  }

  async updateEquipment(
    equipmentId: number,
    updates: {
      wearLocation?: WearFlag;
      maxInstances?: number;
      probability?: number;
      decorative?: boolean;
    }
  ): Promise<boolean> {
    try {
      const data: Prisma.MobResetEquipmentUncheckedUpdateInput = {};
      if (updates.wearLocation !== undefined)
        data.wearLocation = { set: updates.wearLocation ?? null };
      if (updates.maxInstances !== undefined)
        data.maxInstances = { set: updates.maxInstances };
      if (updates.probability !== undefined)
        data.probability = { set: updates.probability };
      if (updates.decorative !== undefined)
        data.decorative = { set: updates.decorative };
      await this.prisma.mobResetEquipment.update({
        where: { id: equipmentId },
        data,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Put an object inside a container the mob carries or wears. With
   * `parentContentId` it nests inside another content row of the same
   * equipment item. Returns the whole reset so the UI can refresh in one call.
   */
  async addEquipmentContent(
    equipmentId: number,
    data: ResetContentInput
  ): Promise<MobResetDto> {
    const equipment = await this.prisma.mobResetEquipment.findUnique({
      where: { id: equipmentId },
      include: { objects: OBJECT_SUMMARY },
    });
    if (!equipment) {
      throw new NotFoundException(`Equipment ${equipmentId} not found`);
    }

    if (data.parentContentId != null) {
      const parent = await this.prisma.mobResetEquipmentContents.findFirst({
        where: { id: data.parentContentId, equipmentId },
        include: { objects: OBJECT_SUMMARY },
      });
      assertSameTree(parent, data.parentContentId);
      assertContainerObject(parent.objects, 'nested container');
    } else {
      assertContainerObject(equipment.objects, 'equipment item');
    }

    try {
      await this.prisma.mobResetEquipmentContents.create({
        data: {
          equipmentId,
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
    const reset = await this.findOne(equipment.resetId);
    return reset!;
  }

  async updateEquipmentContent(
    id: number,
    data: UpdateResetContentInput
  ): Promise<boolean> {
    const update: Prisma.MobResetEquipmentContentsUncheckedUpdateInput = {};
    if (data.quantity !== undefined) update.quantity = { set: data.quantity };
    if (data.maxInstances !== undefined)
      update.maxInstances = { set: data.maxInstances };
    if (data.comment !== undefined) update.comment = { set: data.comment };
    try {
      await this.prisma.mobResetEquipmentContents.update({
        where: { id },
        data: update,
      });
      return true;
    } catch (e) {
      return rethrowResetRowError(e, 'Equipment content', id);
    }
  }

  async deleteEquipmentContent(id: number): Promise<boolean> {
    try {
      await this.prisma.mobResetEquipmentContents.delete({ where: { id } });
      return true;
    } catch (e) {
      return rethrowResetRowError(e, 'Equipment content', id);
    }
  }

  private mapToDto(reset: MobResetWithRelations): MobResetDto {
    // Build base DTO without optional mob/room/comment to satisfy exactOptionalPropertyTypes
    const dto: MobResetDto = {
      id: reset.id,
      zoneId: reset.zoneId,
      mobZoneId: reset.mobZoneId,
      mobId: reset.mobId,
      roomZoneId: reset.roomZoneId,
      roomId: reset.roomId,
      maxInstances: reset.maxInstances,
      probability: reset.probability,
      equipment: reset.mobResetEquipment.map(eq => ({
        id: eq.id,
        objectZoneId: eq.objectZoneId,
        objectId: eq.objectId,
        wearLocation:
          eq.wearLocation === null ? undefined : (eq.wearLocation as WearFlag),
        maxInstances: eq.maxInstances,
        probability: eq.probability,
        decorative: eq.decorative ?? false,
        object: {
          id: eq.objects.id,
          zoneId: eq.objects.zoneId,
          name: eq.objects.name,
          type: eq.objects.type,
        },
        contents: (eq.contents ?? []).map(c => ({
          id: c.id,
          parentContentId: c.parentContentId ?? undefined,
          objectZoneId: c.objectZoneId,
          objectId: c.objectId,
          quantity: c.quantity,
          maxInstances: c.maxInstances,
          ...(c.comment !== null && c.comment !== undefined
            ? { comment: c.comment }
            : {}),
          object: {
            id: c.objects.id,
            zoneId: c.objects.zoneId,
            name: c.objects.name,
            type: c.objects.type,
          },
        })),
      })) as MobResetEquipmentDto[],
    };
    if (reset.mobs) {
      dto.mob = {
        id: reset.mobs.id,
        zoneId: reset.mobs.zoneId,
        name: reset.mobs.name,
      };
    }
    if (reset.rooms) {
      dto.room = {
        id: reset.rooms.id,
        zoneId: reset.rooms.zoneId,
        name: reset.rooms.name,
      };
    }
    if (reset.comment !== null) {
      dto.comment = reset.comment;
    }
    return dto;
  }
}
