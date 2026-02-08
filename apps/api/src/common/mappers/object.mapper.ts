import { ObjectDto } from '../../objects/object.dto';
import { ObjectMapperSource } from './types';

export function mapObject(db: ObjectMapperSource): ObjectDto {
  const dto: ObjectDto = {
    id: db.id,
    type: db.type,
    keywords: db.keywords,
    name: db.name,
    plainName: db.plainName,
    roomDescription: db.roomDescription,
    plainRoomDescription: db.plainRoomDescription,
    examineDescription: db.examineDescription || '',
    plainExamineDescription: db.plainExamineDescription || '',
    ...(db.actionDescription && { actionDescription: db.actionDescription }),
    ...(db.plainActionDescription && {
      plainActionDescription: db.plainActionDescription,
    }),
    flags: db.flags,
    wearFlags: db.wearFlags,
    restrictions: db.restrictions ?? [],
    restrictedClassIds: db.restrictedClassIds ?? [],
    restrictedAlignments: db.restrictedAlignments ?? [],
    restrictedRaces: db.restrictedRaces ?? [],
    allowedRaces: db.allowedRaces ?? [],
    ...(db.minSize !== null &&
      db.minSize !== undefined && { minSize: db.minSize }),
    ...(db.maxSize !== null &&
      db.maxSize !== undefined && { maxSize: db.maxSize }),
    ...(db.passengerCapacity !== null &&
      db.passengerCapacity !== undefined && {
        passengerCapacity: db.passengerCapacity,
      }),
    ...(db.presenceOverride !== null &&
      db.presenceOverride !== undefined && {
        presenceOverride: db.presenceOverride,
      }),
    weight: db.weight,
    cost: db.cost,
    timer: db.timer,
    decomposeTimer: db.decomposeTimer,
    level: db.level,
    concealment: db.concealment,
    values: db.values as unknown as Record<string, unknown>,
    zoneId: db.zoneId,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
  return dto;
}
