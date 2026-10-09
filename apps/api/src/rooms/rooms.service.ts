// CLEAN REWRITE START -------------------------------------------------------
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { RoomLoadPlan } from '../common/room-selection';
import {
  BatchUpdateResult,
  CreateRoomExitInput,
  CreateRoomInput,
  UpdateRoomInput,
  UpdateRoomPositionInput,
} from './room.dto';

interface RoomExitResult {
  id: number;
  roomZoneId: number;
  roomId: number;
  direction: string;
  description: string | null;
  keywords: string[];
  toZoneId: number | null;
  toRoomId: number | null;
  keyZoneId: number | null;
  keyId: number | null;
  flags: string[];
  defaultState: string;
  hitPoints: number | null;
}

import { ExitState, Sector } from '@muditor/db';

interface RoomServiceResultBase {
  id: number;
  zoneId: number;
  name: string;
  description: string; // canonical
  roomDescription: string; // deprecated alias value (same as description)
  sector: Sector; // Prisma enum Sector
  exits: RoomExitResult[]; // full exits (lightweight will be empty array)
  extraDescs: Array<{ id: number; keywords: string[]; description: string }>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  layoutX: number | null;
  layoutY: number | null;
  layoutZ: number | null;
  baseLightLevel: number;
  capacity: number;
  entryRestriction: string | null;
  isPeaceful: boolean;
  allowsMagic: boolean;
  allowsRecall: boolean;
  allowsSummon: boolean;
  allowsTeleport: boolean;
  isDeathTrap: boolean;
  environmentalEffects: Array<{
    effectId: number;
    effect: {
      id: number;
      name: string;
      effectType: string;
      tags: string[];
      defaultParams: unknown;
    };
  }>;
  mobResets?: Array<{
    mobs?: { id: number; zoneId: number; name: string; keywords?: string[] };
  }>; // Populated for GraphQL field resolvers
  objectResets?: Array<{
    objects?: { id: number; zoneId: number; name: string; keywords?: string[] };
  }>; // Populated for GraphQL field resolvers
}

type RoomServiceResult = RoomServiceResultBase;

@Injectable()
export class RoomsService {
  constructor(private readonly db: DatabaseService) {}

  private readonly includeFull = {
    exits: true,
    roomExtraDescriptions: true,
    environmentalEffects: {
      include: {
        effect: true,
      },
    },
    mobResets: {
      include: {
        mobs: true,
      },
    },
    objectResets: {
      include: {
        objects: true,
      },
    },
  } as const;

  // Accept a subset of the Prisma Room shape; use indexed access type for flexibility without any
  private mapRoom(room: {
    id: number;
    zoneId: number;
    name: string;
    roomDescription: string;
    sector: Sector;
    exits?: RoomExitResult[];
    roomExtraDescriptions?: Array<{
      id: number;
      keywords: string[];
      description: string;
    }>;
    environmentalEffects?: Array<{
      effectId: number;
      effect: {
        id: number;
        name: string;
        effectType: string;
        tags: string[];
        defaultParams: unknown;
      };
    }>;
    mobResets?: Array<{
      mobs?: { id: number; zoneId: number; name: string; keywords?: string[] };
    }>;
    objectResets?: Array<{
      objects?: {
        id: number;
        zoneId: number;
        name: string;
        keywords?: string[];
      };
    }>;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
    updatedBy?: string | null;
    layoutX?: number | null;
    layoutY?: number | null;
    layoutZ?: number | null;
    baseLightLevel?: number;
    capacity?: number;
    entryRestriction?: string | null;
    isPeaceful?: boolean;
    allowsMagic?: boolean;
    allowsRecall?: boolean;
    allowsSummon?: boolean;
    allowsTeleport?: boolean;
    isDeathTrap?: boolean;
  }): RoomServiceResult {
    return {
      id: room.id,
      zoneId: room.zoneId,
      name: room.name,
      description: room.roomDescription, // DB column still roomDescription
      roomDescription: room.roomDescription, // alias
      sector: room.sector,
      exits: room.exits ?? [],
      extraDescs: room.roomExtraDescriptions ?? [],
      environmentalEffects: room.environmentalEffects ?? [],
      mobResets: room.mobResets ?? [],
      objectResets: room.objectResets ?? [],
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      createdBy: room.createdBy ?? null,
      updatedBy: room.updatedBy ?? null,
      layoutX: room.layoutX ?? null,
      layoutY: room.layoutY ?? null,
      layoutZ: room.layoutZ ?? null,
      baseLightLevel: room.baseLightLevel ?? 0,
      capacity: room.capacity ?? 10,
      entryRestriction: room.entryRestriction ?? null,
      isPeaceful: room.isPeaceful ?? false,
      allowsMagic: room.allowsMagic ?? true,
      allowsRecall: room.allowsRecall ?? true,
      allowsSummon: room.allowsSummon ?? true,
      allowsTeleport: room.allowsTeleport ?? true,
      isDeathTrap: room.isDeathTrap ?? false,
    };
  }

  /**
   * `hideGodZones` omits rooms in god zones (Zones.isGodZone). Public readers
   * pass it for anonymous/mortal viewers; internal callers leave it unset.
   */
  /**
   * For viewers who must not see god zones: drop exits whose target room is
   * in one, so a mortal-visible room never reveals a way into (or the
   * existence of) a god zone. One cheap query for the distinct target zones.
   */
  private async withoutGodZoneExits(
    rooms: RoomServiceResult[]
  ): Promise<RoomServiceResult[]> {
    const targets = new Set<number>();
    for (const room of rooms)
      for (const exit of room.exits)
        if (exit.toZoneId !== null) targets.add(exit.toZoneId);
    if (targets.size === 0) return rooms;
    const god = await this.db.zones.findMany({
      where: { id: { in: [...targets] }, isGodZone: true },
      select: { id: true },
    });
    if (god.length === 0) return rooms;
    const hidden = new Set(god.map(z => z.id));
    return rooms.map(room => ({
      ...room,
      exits: room.exits.filter(
        e => e.toZoneId === null || !hidden.has(e.toZoneId)
      ),
    }));
  }

  /**
   * Prisma `include` limited to the relations a selection needs. Without a
   * plan every relation is loaded (`includeFull`).
   */
  private includeFor(plan?: RoomLoadPlan): typeof this.includeFull {
    if (!plan) return this.includeFull;
    // Typed as the full include: `mapRoom` treats absent relations as empty.
    return {
      ...(plan.exits && { exits: true as const }),
      ...(plan.extraDescs && { roomExtraDescriptions: true as const }),
      ...(plan.environmentalEffects && {
        environmentalEffects: this.includeFull.environmentalEffects,
      }),
      ...(plan.mobs && { mobResets: this.includeFull.mobResets }),
      ...(plan.objects && { objectResets: this.includeFull.objectResets }),
    } as typeof this.includeFull;
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    zoneId?: number;
    lightweight?: boolean;
    hideGodZones?: boolean;
    /** Relations the caller will read; omitted = load everything. */
    plan?: RoomLoadPlan;
  }): Promise<RoomServiceResult[]> {
    const { skip, take, zoneId, hideGodZones, plan } = params || {};
    const lightweight = params?.lightweight || plan?.lightweight;
    if (lightweight) {
      const clauses: string[] = [];
      if (zoneId !== undefined) clauses.push(`r.zone_id = ${zoneId}`);
      if (hideGodZones)
        clauses.push(
          `r.zone_id NOT IN (SELECT id FROM "Zones" WHERE is_god_zone)`
        );
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      const limit = take !== undefined ? `LIMIT ${take}` : '';
      const offset = skip !== undefined ? `OFFSET ${skip}` : '';
      const rows = await this.db.$queryRawUnsafe<
        Array<{
          id: number;
          zoneId: number;
          name: string;
          roomDescription: string;
          sector: Sector;
          createdAt: Date;
          updatedAt: Date;
          layoutX: number | null;
          layoutY: number | null;
          layoutZ: number | null;
        }>
      >(`
        SELECT r.id,
               r.zone_id as "zoneId",
               r.name,
               r.room_description as "roomDescription",
               r.sector,
               r.created_at as "createdAt",
               r.updated_at as "updatedAt",
               r.layout_x as "layoutX",
               r.layout_y as "layoutY",
               r.layout_z as "layoutZ"
        FROM "Room" r
        ${where}
        ORDER BY r.id
        ${limit} ${offset}
      `);

      // Fetch exits for all rooms in lightweight mode
      const exitWhere = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      const exits = await this.db.$queryRawUnsafe<
        Array<{
          id: number;
          roomZoneId: number;
          roomId: number;
          direction: string;
          toZoneId: number | null;
          toRoomId: number | null;
        }>
      >(`
        SELECT e.id,
               e.room_zone_id as "roomZoneId",
               e.room_id as "roomId",
               e.direction,
               e.to_zone_id as "toZoneId",
               e.to_room_id as "toRoomId"
        FROM "RoomExit" e
        INNER JOIN "Room" r ON e.room_zone_id = r.zone_id AND e.room_id = r.id
        ${exitWhere}
        ORDER BY e.room_zone_id, e.room_id
      `);

      // Group exits by room
      const exitsByRoom = new Map<string, RoomExitResult[]>();
      for (const exit of exits) {
        const key = `${exit.roomZoneId}-${exit.roomId}`;
        if (!exitsByRoom.has(key)) {
          exitsByRoom.set(key, []);
        }
        exitsByRoom.get(key)!.push({
          id: exit.id,
          roomZoneId: exit.roomZoneId,
          roomId: exit.roomId,
          direction: exit.direction,
          description: null,
          keywords: [],
          toZoneId: exit.toZoneId,
          toRoomId: exit.toRoomId,
          keyZoneId: null,
          keyId: null,
          flags: [],
          defaultState: 'OPEN',
          hitPoints: null,
        });
      }

      const mapped = rows.map((r: (typeof rows)[0]) => {
        const roomKey = `${r.zoneId}-${r.id}`;
        const roomExits = exitsByRoom.get(roomKey) || [];
        return this.mapRoom({
          ...r,
          exits: roomExits,
          roomExtraDescriptions: [],
        });
      });
      return hideGodZones ? this.withoutGodZoneExits(mapped) : mapped;
    }
    const query: {
      include: typeof RoomsService.prototype.includeFull;
      orderBy: { id: 'asc' };
      where?: { zoneId?: number; zones?: { isGodZone: false } };
      skip?: number;
      take?: number;
    } = { include: this.includeFor(plan), orderBy: { id: 'asc' } };
    if (zoneId !== undefined || hideGodZones) {
      query.where = {
        ...(zoneId !== undefined && { zoneId }),
        ...(hideGodZones && { zones: { isGodZone: false } }),
      };
    }
    if (skip !== undefined) query.skip = skip;
    if (take !== undefined) query.take = take;
    const rooms = await this.db.room.findMany(query);
    const mapped = rooms.map(r => this.mapRoom(r));
    return hideGodZones ? this.withoutGodZoneExits(mapped) : mapped;
  }

  // Backward-compatible alias used by existing tests/specs
  async findAll(
    params?: Parameters<RoomsService['findMany']>[0]
  ): Promise<RoomServiceResult[]> {
    return this.findMany(params);
  }

  async findOne(
    zoneId: number,
    id: number,
    hideGodZones = false
  ): Promise<RoomServiceResult> {
    const room = await this.db.room.findUnique({
      where: { zoneId_id: { zoneId, id } },
      include: this.includeFull,
    });
    if (!room) throw new NotFoundException(`Room ${zoneId}/${id} not found`);
    if (hideGodZones) {
      const zone = await this.db.zones.findUnique({
        where: { id: zoneId },
        select: { isGodZone: true },
      });
      // Indistinguishable from a missing room, so mortals cannot probe.
      if (zone?.isGodZone)
        throw new NotFoundException(`Room ${zoneId}/${id} not found`);
    }
    const mapped = this.mapRoom(room);
    if (!hideGodZones) return mapped;
    const [visible] = await this.withoutGodZoneExits([mapped]);
    return visible!;
  }

  async findByZone(
    zoneId: number,
    lightweight = false,
    hideGodZones = false
  ): Promise<RoomServiceResult[]> {
    return this.findMany({ zoneId, lightweight, hideGodZones });
  }

  async count(zoneId?: number, hideGodZones = false): Promise<number> {
    return this.db.room.count({
      where: {
        ...(zoneId !== undefined && { zoneId }),
        ...(hideGodZones && { zones: { isGodZone: false } }),
      },
    });
  }

  async create(data: CreateRoomInput): Promise<RoomServiceResult> {
    let room;
    try {
      room = await this.db.room.create({
        data: {
          id: data.id,
          zoneId: data.zoneId,
          name: data.name,
          roomDescription: data.description ?? data.roomDescription ?? '',
          sector: data.sector || 'STRUCTURE',
          baseLightLevel: data.baseLightLevel ?? 0,
          capacity: data.capacity ?? 10,
          entryRestriction: data.entryRestriction ?? null,
          isPeaceful: data.isPeaceful ?? false,
          allowsMagic: data.allowsMagic ?? true,
          allowsRecall: data.allowsRecall ?? true,
          allowsSummon: data.allowsSummon ?? true,
          allowsTeleport: data.allowsTeleport ?? true,
          isDeathTrap: data.isDeathTrap ?? false,
        },
        include: this.includeFull,
      });
    } catch (err) {
      if (
        typeof err === 'object' &&
        err !== null &&
        (err as { code?: string }).code === 'P2002'
      ) {
        throw new ConflictException(
          `Room ${data.id} already exists in zone ${data.zoneId}`
        );
      }
      throw err;
    }
    return this.mapRoom(room);
  }

  async update(
    zoneId: number,
    id: number,
    data: UpdateRoomInput
  ): Promise<RoomServiceResult> {
    const update: Record<string, unknown> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined)
      update.roomDescription = data.description;
    else if (data.roomDescription !== undefined)
      update.roomDescription = data.roomDescription; // legacy alias
    if (data.sector !== undefined) update.sector = data.sector;
    if (data.baseLightLevel !== undefined)
      update.baseLightLevel = data.baseLightLevel;
    if (data.capacity !== undefined) update.capacity = data.capacity;
    if (data.entryRestriction !== undefined)
      update.entryRestriction = data.entryRestriction;
    if (data.isPeaceful !== undefined) update.isPeaceful = data.isPeaceful;
    if (data.allowsMagic !== undefined) update.allowsMagic = data.allowsMagic;
    if (data.allowsRecall !== undefined)
      update.allowsRecall = data.allowsRecall;
    if (data.allowsSummon !== undefined)
      update.allowsSummon = data.allowsSummon;
    if (data.allowsTeleport !== undefined)
      update.allowsTeleport = data.allowsTeleport;
    if (data.isDeathTrap !== undefined) update.isDeathTrap = data.isDeathTrap;
    const room = await this.db.room.update({
      where: { zoneId_id: { zoneId, id } },
      data: update,
      include: this.includeFull,
    });
    return this.mapRoom(room);
  }

  async delete(zoneId: number, id: number): Promise<RoomServiceResult> {
    const room = await this.db.room.delete({
      where: { zoneId_id: { zoneId, id } },
      include: this.includeFull,
    });
    return this.mapRoom(room);
  }

  async createExit(data: CreateRoomExitInput): Promise<RoomExitResult> {
    const keywords = (data.keywords || []).filter(
      k => !!k && k.trim().length > 0
    );
    const toZoneId = data.toZoneId ?? null;
    const toRoomId = data.toRoomId ?? null;
    const exit = await this.db.roomExit.create({
      data: {
        roomZoneId: data.roomZoneId,
        roomId: data.roomId,
        direction: data.direction,
        description: data.description ?? null,
        keywords,
        toZoneId,
        toRoomId,
        keyZoneId: data.keyZoneId ?? null,
        keyId: data.keyId ?? null,
        flags: [],
        defaultState: data.defaultState ?? ('OPEN' as ExitState),
        hitPoints: data.hitPoints ?? null,
      },
    });
    return exit as RoomExitResult;
  }

  async deleteExit(exitId: number): Promise<RoomExitResult> {
    const exit = await this.db.roomExit.delete({ where: { id: exitId } });
    return exit as RoomExitResult;
  }

  async updatePosition(
    zoneId: number,
    id: number,
    input: UpdateRoomPositionInput
  ): Promise<RoomServiceResult> {
    const data: Record<string, unknown> = {};
    if (input.layoutX !== undefined) data.layoutX = input.layoutX;
    if (input.layoutY !== undefined) data.layoutY = input.layoutY;
    if (input.layoutZ !== undefined) data.layoutZ = input.layoutZ;
    const room = await this.db.room.update({
      where: { zoneId_id: { zoneId, id } },
      data,
      include: this.includeFull,
    });
    return this.mapRoom(room);
  }

  async batchUpdatePositions(
    updates: Array<{
      zoneId: number;
      roomId: number;
      layoutX?: number;
      layoutY?: number;
      layoutZ?: number;
    }>
  ): Promise<BatchUpdateResult> {
    const errors: string[] = [];
    let updatedCount = 0;
    try {
      await this.db.$transaction(async tx => {
        for (const u of updates) {
          try {
            const data: Record<string, unknown> = {};
            if (u.layoutX !== undefined) data.layoutX = u.layoutX;
            if (u.layoutY !== undefined) data.layoutY = u.layoutY;
            if (u.layoutZ !== undefined) data.layoutZ = u.layoutZ;
            await tx.room.update({
              where: { zoneId_id: { zoneId: u.zoneId, id: u.roomId } },
              data,
            });
            updatedCount++;
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            // Swallow individual errors into the batch result list
            errors.push(`Room ${u.zoneId}/${u.roomId}: ${msg}`);
          }
        }
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { updatedCount: 0, errors: [`Transaction failed: ${msg}`] };
      return { updatedCount: 0, errors: [`Transaction failed: ${msg}`] };
    }
    return errors.length ? { updatedCount, errors } : { updatedCount };
  }
  async updateRoomEnvironmentalEffects(
    zoneId: number,
    id: number,
    effects: Array<{ effectId: number }>
  ) {
    await this.db.$transaction(async tx => {
      await tx.roomEnvironmentalEffect.deleteMany({
        where: { roomZoneId: zoneId, roomId: id },
      });
      if (effects.length > 0) {
        await tx.roomEnvironmentalEffect.createMany({
          data: effects.map(e => ({
            roomZoneId: zoneId,
            roomId: id,
            effectId: e.effectId,
          })),
        });
      }
    });
    return this.findOne(zoneId, id);
  }
}
// CLEAN REWRITE END ---------------------------------------------------------
