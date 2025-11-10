import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  BatchUpdateResult,
  CreateRoomExitInput,
  CreateRoomInput,
  RoomDto,
  UpdateRoomInput,
  UpdateRoomPositionInput,
} from './room.dto';

// Internal type for what the service actually returns (before GraphQL field resolvers)
type RoomServiceResult = Omit<RoomDto, 'mobs' | 'objects' | 'shops'> & {
  mobResets: Array<{
    id: string;
    zoneId: number;
    maxInstances: number;
    probability: number;
    comment: string | null;
    mobZoneId: number;
    mobId: number;
    roomZoneId: number;
    roomId: number;
  }>;
  objectResets: Array<{
    id: string;
    zoneId: number;
    maxInstances: number;
    probability: number;
    comment: string | null;
    objectZoneId: number;
    objectId: number;
    roomZoneId: number;
    roomId: number;
  }>;
  exits: Array<{
    id: string;
    direction: string;
    description?: string;
    keywords?: string[];
    destination?: number | null;
    roomZoneId: number;
    roomId: number;
  }>;
  extraDescs: Array<{
    id: string;
    keywords: string[];
    description: string;
    roomZoneId: number;
    roomId: number;
  }>;
};

@Injectable()
export class RoomsService {
  constructor(private readonly db: DatabaseService) {}

  // Shared include pattern to prevent stack overflow from circular references
  private readonly roomInclude = {
    exits: true,
    roomExtraDescriptions: true,
    mobResets: {
      select: {
        id: true,
        zoneId: true,
        maxInstances: true,
        probability: true,
        comment: true,
        mobZoneId: true,
        mobId: true,
        roomZoneId: true,
        roomId: true,
        mobs: {
          select: {
            id: true,
            zoneId: true,
            keywords: true,
            name: true,
            level: true,
            race: true,
          },
        },
      },
    },
    objectResets: {
      select: {
        id: true,
        zoneId: true,
        maxInstances: true,
        probability: true,
        comment: true,
        objectZoneId: true,
        objectId: true,
        roomZoneId: true,
        roomId: true,
        objects: {
          select: {
            id: true,
            zoneId: true,
            keywords: true,
            name: true,
            type: true,
          },
        },
      },
    },
  } as const;

  async findAll(params?: {
    skip?: number;
    take?: number;
    zoneId?: number;
    lightweight?: boolean;
  }): Promise<RoomServiceResult[]> {
    const { skip, take, zoneId, lightweight = false } = params || {};

    // Lightweight query for map rendering - only essential fields
    if (lightweight) {
      // Use raw query to avoid stack depth issues with large datasets and composite keys
      const whereClause = zoneId ? `WHERE r.zone_id = ${zoneId}` : '';
      const limitClause = take ? `LIMIT ${take}` : '';
      const offsetClause = skip ? `OFFSET ${skip}` : '';

      const rooms = await this.db.$queryRawUnsafe(`
        SELECT
          r.id,
          r.zone_id as "zoneId",
          r.name,
          r.sector,
          r.layout_x as "layoutX",
          r.layout_y as "layoutY",
          r.layout_z as "layoutZ",
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', e.id,
                'direction', e.direction,
                'toZoneId', e.to_zone_id,
                'toRoomId', e.to_room_id,
                'destination', dest.id,
                'description', e.description,
                'keywords', e.keywords,
                'key', e.key,
                'flags', e.flags
              )
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::json
          ) as exits,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', mr.id,
                'zoneId', mr.zone_id,
                'maxInstances', mr.max_instances,
                'probability', mr.probability,
                'comment', mr.comment,
                'mobZoneId', mr.mob_zone_id,
                'mobId', mr.mob_id,
                'roomZoneId', mr.room_zone_id,
                'roomId', mr.room_id,
                'mobs', jsonb_build_object(
                  'id', m.id,
                  'zoneId', m.zone_id,
                  'keywords', m.keywords,
                  'name', m.name,
                  'level', m.level,
                  'race', m.race
                )
              )
            ) FILTER (WHERE mr.id IS NOT NULL),
            '[]'::json
          ) as mob_resets,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', orst.id,
                'zoneId', orst.zone_id,
                'maxInstances', orst.max_instances,
                'probability', orst.probability,
                'comment', orst.comment,
                'objectZoneId', orst.object_zone_id,
                'objectId', orst.object_id,
                'roomZoneId', orst.room_zone_id,
                'roomId', orst.room_id,
                'objects', jsonb_build_object(
                  'id', o.id,
                  'zoneId', o.zone_id,
                  'keywords', o.keywords,
                  'name', o.name,
                  'type', o.type
                )
              )
            ) FILTER (WHERE orst.id IS NOT NULL),
            '[]'::json
          ) as object_resets
        FROM "Rooms" r
        LEFT JOIN "RoomExits" e ON e.room_zone_id = r.zone_id AND e.room_id = r.id
        LEFT JOIN "Rooms" dest ON dest.zone_id = e.to_zone_id AND dest.id = e.to_room_id
        LEFT JOIN "MobResets" mr ON mr.room_zone_id = r.zone_id AND mr.room_id = r.id
        LEFT JOIN "Mobs" m ON m.zone_id = mr.mob_zone_id AND m.id = mr.mob_id
        LEFT JOIN "ObjectResets" orst ON orst.room_zone_id = r.zone_id AND orst.room_id = r.id
        LEFT JOIN "Objects" o ON o.zone_id = orst.object_zone_id AND o.id = orst.object_id
        ${whereClause}
        GROUP BY r.id, r.zone_id, r.name, r.sector, r.layout_x, r.layout_y, r.layout_z
        ORDER BY r.id
        ${limitClause}
        ${offsetClause}
      `);
      return rooms as any;
    }

    // Full query with all data
    const rooms = await this.db.rooms.findMany({
      where: zoneId ? { zoneId } : undefined,
      skip,
      take,
      include: this.roomInclude,
      orderBy: { id: 'asc' },
    });

    return rooms as any;
  }

  async findOne(zoneId: number, id: number): Promise<RoomServiceResult | null> {
    const room = await this.db.rooms.findUnique({
      where: {
        zoneId_id: {
          zoneId,
          id,
        },
      },
      include: this.roomInclude,
    });

    if (!room) {
      throw new NotFoundException(
        `Room with zoneId ${zoneId} and id ${id} not found`
      );
    }

    return room as any;
  }

  async findByZone(
    zoneId: number,
    lightweight = false
  ): Promise<RoomServiceResult[]> {
    // Lightweight query for map rendering - only essential fields
    if (lightweight) {
      // Use raw query to avoid stack depth issues with large datasets and composite keys
      const rooms = await this.db.$queryRawUnsafe(`
        SELECT
          r.id,
          r.zone_id as "zoneId",
          r.name,
          r.sector,
          r.layout_x as "layoutX",
          r.layout_y as "layoutY",
          r.layout_z as "layoutZ",
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', e.id,
                'direction', e.direction,
                'toZoneId', e.to_zone_id,
                'toRoomId', e.to_room_id,
                'destination', dest.id,
                'description', e.description,
                'keywords', e.keywords,
                'key', e.key,
                'flags', e.flags
              )
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::json
          ) as exits,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', mr.id,
                'zoneId', mr.zone_id,
                'maxInstances', mr.max_instances,
                'probability', mr.probability,
                'comment', mr.comment,
                'mobZoneId', mr.mob_zone_id,
                'mobId', mr.mob_id,
                'roomZoneId', mr.room_zone_id,
                'roomId', mr.room_id,
                'mobs', jsonb_build_object(
                  'id', m.id,
                  'zoneId', m.zone_id,
                  'keywords', m.keywords,
                  'name', m.name,
                  'level', m.level,
                  'race', m.race
                )
              )
            ) FILTER (WHERE mr.id IS NOT NULL),
            '[]'::json
          ) as mob_resets,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', orst.id,
                'zoneId', orst.zone_id,
                'maxInstances', orst.max_instances,
                'probability', orst.probability,
                'comment', orst.comment,
                'objectZoneId', orst.object_zone_id,
                'objectId', orst.object_id,
                'roomZoneId', orst.room_zone_id,
                'roomId', orst.room_id,
                'objects', jsonb_build_object(
                  'id', o.id,
                  'zoneId', o.zone_id,
                  'keywords', o.keywords,
                  'name', o.name,
                  'type', o.type
                )
              )
            ) FILTER (WHERE orst.id IS NOT NULL),
            '[]'::json
          ) as object_resets
        FROM "Rooms" r
        LEFT JOIN "RoomExits" e ON e.room_zone_id = r.zone_id AND e.room_id = r.id
        LEFT JOIN "Rooms" dest ON dest.zone_id = e.to_zone_id AND dest.id = e.to_room_id
        LEFT JOIN "MobResets" mr ON mr.room_zone_id = r.zone_id AND mr.room_id = r.id
        LEFT JOIN "Mobs" m ON m.zone_id = mr.mob_zone_id AND m.id = mr.mob_id
        LEFT JOIN "ObjectResets" orst ON orst.room_zone_id = r.zone_id AND orst.room_id = r.id
        LEFT JOIN "Objects" o ON o.zone_id = orst.object_zone_id AND o.id = orst.object_id
        WHERE r.zone_id = ${zoneId}
        GROUP BY r.id, r.zone_id, r.name, r.sector, r.layout_x, r.layout_y, r.layout_z
        ORDER BY r.id
      `);
      return rooms as any;
    }

    // Full query with all data
    const rooms = await this.db.rooms.findMany({
      where: { zoneId },
      include: this.roomInclude,
      orderBy: { id: 'asc' },
    });

    return rooms as any;
  }

  async count(zoneId?: number): Promise<number> {
    return this.db.rooms.count({
      where: zoneId ? { zoneId } : undefined,
    });
  }

  async create(data: CreateRoomInput): Promise<RoomServiceResult> {
    const room = await this.db.rooms.create({
      data: {
        id: data.id,
        zoneId: data.zoneId,
        name: data.name,
        roomDescription: data.roomDescription,
        sector: data.sector || 'STRUCTURE',
        flags: data.flags || [],
      },
      include: this.roomInclude,
    });

    return room as any;
  }

  async update(
    zoneId: number,
    id: number,
    data: UpdateRoomInput
  ): Promise<RoomServiceResult> {
    const room = await this.db.rooms.update({
      where: { zoneId_id: { zoneId, id } },
      data: {
        name: data.name,
        roomDescription: data.roomDescription,
        sector: data.sector,
        flags: data.flags,
      },
      include: this.roomInclude,
    });

    return room as any;
  }

  async delete(zoneId: number, id: number): Promise<RoomServiceResult> {
    const room = await this.db.rooms.delete({
      where: { zoneId_id: { zoneId, id } },
      include: this.roomInclude,
    });

    return room as any;
  }

  async createExit(data: CreateRoomExitInput): Promise<any> {
    const exit = await this.db.roomExits.create({
      data: {
        direction: data.direction,
        description: data.description,
        keywords: data.keywords || [],
        toZoneId: data.toZoneId,
        toRoomId: data.toRoomId,
        roomZoneId: data.roomZoneId,
        roomId: data.roomId,
      },
    });

    return exit;
  }

  async deleteExit(exitId: number): Promise<any> {
    const exit = await this.db.roomExits.delete({
      where: { id: exitId },
    });

    return exit;
  }

  async updatePosition(
    zoneId: number,
    id: number,
    position: UpdateRoomPositionInput
  ): Promise<RoomServiceResult> {
    const room = await this.db.rooms.update({
      where: { zoneId_id: { zoneId, id } },
      data: {
        layoutX: position.layoutX,
        layoutY: position.layoutY,
        layoutZ: position.layoutZ,
      },
      include: {
        exits: true,
        roomExtraDescriptions: true,
        mobResets: {
          select: {
            id: true,
            zoneId: true,
            maxInstances: true,
            probability: true,
            comment: true,
            mobZoneId: true,
            mobId: true,
            roomZoneId: true,
            roomId: true,
            mobs: {
              select: {
                id: true,
                zoneId: true,
                keywords: true,
                name: true,
                level: true,
                race: true,
              },
            },
          },
        },
        objectResets: {
          select: {
            id: true,
            zoneId: true,
            maxInstances: true,
            probability: true,
            comment: true,
            objectZoneId: true,
            objectId: true,
            roomZoneId: true,
            roomId: true,
            objects: {
              select: {
                id: true,
                zoneId: true,
                keywords: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
    });

    return room as any;
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
      // Use a transaction to ensure all updates succeed or fail together
      const result = await this.db.$transaction(async tx => {
        const updatePromises = updates.map(async update => {
          try {
            await tx.rooms.update({
              where: {
                zoneId_id: { zoneId: update.zoneId, id: update.roomId },
              },
              data: {
                layoutX: update.layoutX,
                layoutY: update.layoutY,
                layoutZ: update.layoutZ,
              },
            });
            return {
              success: true,
              zoneId: update.zoneId,
              roomId: update.roomId,
            };
          } catch (error) {
            console.error(
              `Failed to update room ${update.zoneId}/${update.roomId}:`,
              error
            );
            return {
              success: false,
              zoneId: update.zoneId,
              roomId: update.roomId,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        });

        const results = await Promise.all(updatePromises);

        // Count successful updates and collect errors
        for (const result of results) {
          if (result.success) {
            updatedCount++;
          } else {
            errors.push(
              `Room ${result.zoneId}/${result.roomId}: ${result.error}`
            );
          }
        }

        return results;
      });

      return {
        updatedCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Batch update transaction failed:', error);
      return {
        updatedCount: 0,
        errors: [
          `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }
}
