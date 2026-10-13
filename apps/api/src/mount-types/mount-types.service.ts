import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@muditor/db';
import { DatabaseService } from '../database/database.service';
import {
  MAX_MOUNT_ALIGNMENT,
  MAX_MOUNT_BONUS,
  MAX_MOUNT_LEVEL,
  UpdateMountTypeInput,
} from './mount-type.input';

type IntField = 'minLevel' | 'minAlignment' | 'hpBonus' | 'mvBonus';

const INT_LIMITS: Record<IntField, [string, number]> = {
  minLevel: ['Minimum level', MAX_MOUNT_LEVEL],
  minAlignment: ['Minimum alignment', MAX_MOUNT_ALIGNMENT],
  hpBonus: ['HP bonus', MAX_MOUNT_BONUS],
  mvBonus: ['Movement bonus', MAX_MOUNT_BONUS],
};

@Injectable()
export class MountTypesService {
  constructor(private readonly db: DatabaseService) {}

  /** Every tier, ordered by alignment side then tier. */
  async findAll() {
    return this.db.mountType.findMany({
      orderBy: [{ alignmentSide: 'asc' }, { tier: 'asc' }],
    });
  }

  /** Edits one tier. The tier and side are fixed; only the gates, mob and bonuses change. */
  async update(input: UpdateMountTypeInput) {
    const existing = await this.db.mountType.findUnique({
      where: { id: input.id },
    });
    if (!existing) {
      throw new NotFoundException(`Mount type ${input.id} not found`);
    }

    for (const field of Object.keys(INT_LIMITS) as IntField[]) {
      const value = input[field];
      if (value === undefined || value === null) continue;
      const [label, max] = INT_LIMITS[field];
      if (!Number.isInteger(value) || value < 0 || value > max) {
        throw new BadRequestException(
          `${label} must be a whole number 0-${max}`
        );
      }
    }

    const mobZoneId = input.mobZoneId ?? existing.mobZoneId;
    const mobId = input.mobId ?? existing.mobId;
    if (
      !Number.isInteger(mobZoneId) ||
      !Number.isInteger(mobId) ||
      mobZoneId < 0 ||
      mobId < 0
    ) {
      throw new BadRequestException(
        'Mount mob zone and id must be whole numbers'
      );
    }
    const mob = await this.db.mobs.findUnique({
      where: { zoneId_id: { zoneId: mobZoneId, id: mobId } },
      select: { id: true },
    });
    if (!mob) {
      throw new BadRequestException(
        `Mount mob ${mobZoneId}:${mobId} does not exist`
      );
    }

    const data: Prisma.MountTypeUncheckedUpdateInput = { mobZoneId, mobId };
    if (input.minLevel != null) data.minLevel = input.minLevel;
    if (input.minAlignment != null) data.minAlignment = input.minAlignment;
    if (input.hpBonus != null) data.hpBonus = input.hpBonus;
    if (input.mvBonus != null) data.mvBonus = input.mvBonus;
    return this.db.mountType.update({ where: { id: input.id }, data });
  }
}
