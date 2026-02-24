import type { Effect as PrismaEffect } from '@muditor/db';
import { Effect } from '../../abilities/abilities.dto';
import { ObjectDto } from '../../objects/object.dto';
import type { ObjectMapperSource } from './types';

function mapEffect(e: PrismaEffect): Effect {
  return {
    id: e.id,
    name: e.name,
    ...(e.description != null && { description: e.description }),
    effectType: e.effectType,
    tags: e.tags,
    defaultParams: e.defaultParams,
    ...(e.paramSchema != null && { paramSchema: e.paramSchema }),
  };
}

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
    grantedEffects: (db.grantedEffects ?? []).map(ge => ({
      id: ge.id,
      effectId: ge.effectId,
      effect: mapEffect(ge.effect),
      strength: ge.strength,
      modifierData: ge.modifierData,
      ...(ge.wearLocation && { wearLocation: ge.wearLocation }),
    })),
    objectResistances: (db.objectResistances ?? []).map(r => ({
      id: r.id,
      element: r.element,
      value: r.value,
      allowAbsorption: r.allowAbsorption,
    })),
    consumableEffects: (db.consumableEffects ?? []).map(ce => ({
      id: ce.id,
      effectId: ce.effectId,
      effect: mapEffect(ce.effect),
      chance: ce.chance,
      level: ce.level,
      ...(ce.duration !== null && { duration: ce.duration }),
    })),
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
  };
  return dto;
}
