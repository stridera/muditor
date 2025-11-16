import {
  RoomDto,
  RoomExitDto,
  RoomExtraDescriptionDto,
} from '../../rooms/room.dto';
import { RoomMapperSource } from './types';

export function mapRoom(db: RoomMapperSource): RoomDto {
  const exitsSource = db.exits || [];
  const exits: RoomExitDto[] = exitsSource.map(e => {
    const singleKeyword =
      e.keywords && e.keywords.length === 1 ? e.keywords[0] : undefined;
    const exit: RoomExitDto = {
      id: String(e.id),
      direction: e.direction,
      keywords: e.keywords || [],
      flags: e.flags || [],
      roomZoneId: e.roomZoneId,
      roomId: e.roomId,
      ...(e.description ? { description: e.description } : {}),
      ...(singleKeyword ? { keyword: singleKeyword } : {}),
      ...(e.key ? { key: e.key } : {}),
      ...(e.toZoneId !== null && e.toZoneId !== undefined
        ? { toZoneId: e.toZoneId }
        : {}),
      ...(e.toRoomId !== null && e.toRoomId !== undefined
        ? { toRoomId: e.toRoomId }
        : {}),
    };
    return exit;
  });

  const extraDescSource = db.roomExtraDescriptions || [];
  const extraDescs: RoomExtraDescriptionDto[] = extraDescSource.map(ed => ({
    id: String(ed.id),
    keywords: ed.keywords,
    description: ed.description || '',
  }));

  const dto: RoomDto = {
    id: db.id,
    name: db.name,
    description: db.roomDescription,
    roomDescription: db.roomDescription, // deprecated alias
    sector: db.sector,
    flags: db.flags,
    zoneId: db.zoneId,
    exits,
    extraDescs,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
    ...(db.createdBy && { createdBy: db.createdBy }),
    ...(db.updatedBy && { updatedBy: db.updatedBy }),
    ...(db.layoutX !== null &&
      db.layoutX !== undefined && { layoutX: db.layoutX }),
    ...(db.layoutY !== null &&
      db.layoutY !== undefined && { layoutY: db.layoutY }),
    ...(db.layoutZ !== null &&
      db.layoutZ !== undefined && { layoutZ: db.layoutZ }),
    // Pass through mobResets and objectResets for GraphQL field resolvers
    // These will be undefined for rooms loaded without these relations
    ...((db as any).mobResets && { mobResets: (db as any).mobResets }),
    ...((db as any).objectResets && { objectResets: (db as any).objectResets }),
  };
  return dto;
}
