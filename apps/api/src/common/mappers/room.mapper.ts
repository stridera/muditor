import {
  RoomDto,
  RoomExitDto,
  RoomExtraDescriptionDto,
} from '../../rooms/room.dto';
import { RoomMapperSource } from './types';

export function mapRoom(db: RoomMapperSource): RoomDto {
  const exitsSource = db.exits || [];
  const exits: RoomExitDto[] = exitsSource.map(e => {
    const exit: RoomExitDto = {
      id: String(e.id),
      direction: e.direction,
      flags: e.flags || [],
      roomZoneId: e.roomZoneId,
      roomId: e.roomId,
      keywords: e.keywords || [],
    };
    if (e.description !== null && e.description !== undefined)
      exit.description = e.description;
    if (e.key !== null && e.key !== undefined) exit.key = e.key;
    if (e.toZoneId !== null && e.toZoneId !== undefined)
      exit.toZoneId = e.toZoneId;
    if (e.toRoomId !== null && e.toRoomId !== undefined)
      exit.toRoomId = e.toRoomId;
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
    roomDescription: db.roomDescription,
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
    mobs: [],
    objects: [],
    shops: [],
  };
  return dto;
}
