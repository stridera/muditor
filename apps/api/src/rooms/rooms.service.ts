// CLEAN REWRITE START -------------------------------------------------------
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
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
  key: string | null;
  flags: string[];
}

import { RoomFlag, Sector } from '@prisma/client';

interface RoomServiceResultBase {
  id: number;
  zoneId: number;
  name: string;
  description: string; // canonical
  roomDescription: string; // deprecated alias value (same as description)
  sector: Sector; // Prisma enum Sector
  flags: RoomFlag[];
  exits: RoomExitResult[]; // full exits (lightweight will be empty array)
  extraDescs: Array<{ id: number; keywords: string[]; description: string }>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
  layoutX: number | null;
  layoutY: number | null;
  layoutZ: number | null;
}

type RoomServiceResult = RoomServiceResultBase;

@Injectable()
export class RoomsService {
  constructor(private readonly db: DatabaseService) { }

  private readonly includeFull = {
    exits: true,
    roomExtraDescriptions: true,
  } as const;

  // Accept a subset of the Prisma Room shape; use indexed access type for flexibility without any
  private mapRoom(room: {
    id: number;
    zoneId: number;
    name: string;
    roomDescription: string;
    sector: Sector;
    flags: RoomFlag[];
    exits?: RoomExitResult[];
    roomExtraDescriptions?: Array<{
      id: number;
      keywords: string[];
      description: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
    updatedBy?: string | null;
    layoutX?: number | null;
    layoutY?: number | null;
    layoutZ?: number | null;
  }): RoomServiceResult {
    return {
      id: room.id,
      zoneId: room.zoneId,
      name: room.name,
      description: room.roomDescription, // DB column still roomDescription
      roomDescription: room.roomDescription, // alias
      sector: room.sector,
      flags: room.flags as RoomFlag[],
      exits: room.exits ?? [],
      extraDescs: room.roomExtraDescriptions ?? [],
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      createdBy: room.createdBy ?? null,
      updatedBy: room.updatedBy ?? null,
      layoutX: room.layoutX ?? null,
      layoutY: room.layoutY ?? null,
      layoutZ: room.layoutZ ?? null,
    };
  }

  async findMany(params?: {
    skip?: number;
    take?: number;
    zoneId?: number;
    lightweight?: boolean;
  }): Promise<RoomServiceResult[]> {
    const { skip, take, zoneId, lightweight } = params || {};
    if (lightweight) {
      const clauses: string[] = [];
      if (zoneId !== undefined) clauses.push(`r.zone_id = ${zoneId}`);
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
          flags: string[];
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
               r.flags,
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
          key: null,
          flags: [],
        });
      }

      return rows.map(r => {
        const roomKey = `${r.zoneId}-${r.id}`;
        const roomExits = exitsByRoom.get(roomKey) || [];
        return this.mapRoom({
          ...r,
          exits: roomExits,
          roomExtraDescriptions: [],
          flags: (r.flags as unknown as RoomFlag[]) || [],
        });
      });
    }
    const query: {
      include: typeof RoomsService.prototype.includeFull;
      orderBy: { id: 'asc' };
      where?: { zoneId: number };
      skip?: number;
      take?: number;
    } = { include: this.includeFull, orderBy: { id: 'asc' } };
    if (zoneId !== undefined) query.where = { zoneId };
    if (skip !== undefined) query.skip = skip;
    if (take !== undefined) query.take = take;
    const rooms = await this.db.room.findMany(query);
    return rooms.map(r => this.mapRoom(r));
  }

  // Backward-compatible alias used by existing tests/specs
  async findAll(params?: {
    skip?: number;
    take?: number;
    zoneId?: number;
    lightweight?: boolean;
  }): Promise<RoomServiceResult[]> {
    return this.findMany(params);
  }

  async findOne(zoneId: number, id: number): Promise<RoomServiceResult> {
    const room = await this.db.room.findUnique({
      where: { zoneId_id: { zoneId, id } },
      include: this.includeFull,
    });
    if (!room) throw new NotFoundException(`Room ${zoneId}/${id} not found`);
    return this.mapRoom(room);
  }

  async findByZone(
    zoneId: number,
    lightweight = false
  ): Promise<RoomServiceResult[]> {
    return this.findMany({ zoneId, lightweight });
  }

  async count(zoneId?: number): Promise<number> {
    if (zoneId !== undefined) return this.db.room.count({ where: { zoneId } });
    return this.db.room.count();
  }

  async create(data: CreateRoomInput): Promise<RoomServiceResult> {
    const room = await this.db.room.create({
      data: {
        id: data.id,
        zoneId: data.zoneId,
        name: data.name,
        roomDescription: data.description ?? data.roomDescription ?? '',
        sector: data.sector || 'STRUCTURE',
        flags: data.flags || [],
      },
      include: this.includeFull,
    });
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
    if (data.flags !== undefined) update.flags = data.flags;
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

  async createExit(
    data: CreateRoomExitInput
  ): Promise<RoomExitResult> {
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
        key: data.key ?? null,
        flags: [],
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
}
// CLEAN REWRITE END ---------------------------------------------------------
