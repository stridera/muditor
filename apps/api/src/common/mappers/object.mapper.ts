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
    effectFlags: db.effectFlags,
    wearFlags: db.wearFlags,
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
