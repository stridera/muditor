import type { Effect as PrismaEffect } from '@muditor/db';
import { Effect } from '../../abilities/abilities.dto';
import {
  RoomDto,
  RoomExitDto,
  RoomExtraDescriptionDto,
} from '../../rooms/room.dto';
import { RoomEnvironmentalEffectDto } from '../../rooms/room-effects.dto';
import type { RoomMapperSource } from './types';

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
      defaultState: e.defaultState ?? 'OPEN',
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
      ...(e.hitPoints != null ? { hitPoints: e.hitPoints } : {}),
    };
    return exit;
  });

  const extraDescSource = db.roomExtraDescriptions || [];
  const extraDescs: RoomExtraDescriptionDto[] = extraDescSource.map(ed => ({
    id: String(ed.id),
    keywords: ed.keywords,
    description: ed.description || '',
  }));

  const environmentalEffects: RoomEnvironmentalEffectDto[] = (
    db.environmentalEffects ?? []
  ).map(re => ({
    effectId: re.effectId,
    effect: mapEffect(re.effect),
  }));

  const dto: RoomDto = {
    id: db.id,
    name: db.name,
    description: db.roomDescription,
    roomDescription: db.roomDescription, // deprecated alias
    sector: db.sector,
    zoneId: db.zoneId,
    exits,
    extraDescs,
    environmentalEffects,
    createdAt: db.createdAt,
    updatedAt: db.updatedAt,
    baseLightLevel: db.baseLightLevel ?? 0,
    capacity: db.capacity ?? 10,
    isPeaceful: db.isPeaceful ?? false,
    allowsMagic: db.allowsMagic ?? true,
    allowsRecall: db.allowsRecall ?? true,
    allowsSummon: db.allowsSummon ?? true,
    allowsTeleport: db.allowsTeleport ?? true,
    isDeathTrap: db.isDeathTrap ?? false,
    ...(db.createdBy && { createdBy: db.createdBy }),
    ...(db.updatedBy && { updatedBy: db.updatedBy }),
    ...(db.layoutX !== null &&
      db.layoutX !== undefined && { layoutX: db.layoutX }),
    ...(db.layoutY !== null &&
      db.layoutY !== undefined && { layoutY: db.layoutY }),
    ...(db.layoutZ !== null &&
      db.layoutZ !== undefined && { layoutZ: db.layoutZ }),
    ...(db.magicAffinity != null && { magicAffinity: db.magicAffinity }),
    ...(db.requiredMechanic != null && {
      requiredMechanic: db.requiredMechanic,
    }),
    ...(db.entryRestriction != null && {
      entryRestriction: db.entryRestriction,
    }),
    // Pass through mobResets and objectResets for GraphQL field resolvers
    // These will be undefined for rooms loaded without these relations
    ...(db['mobResets'] ? { mobResets: db['mobResets'] } : {}),
    ...(db['objectResets'] ? { objectResets: db['objectResets'] } : {}),
  };
  return dto;
}
