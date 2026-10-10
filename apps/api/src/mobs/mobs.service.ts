import { Injectable } from '@nestjs/common';
import { type Mobs, Prisma } from '@muditor/db';
import { inVisibleZone } from '../common/god-zone-visibility';
import { assertNoPlayerPets, rethrowAsInUse } from '../common/proto-references';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MobsService {
  constructor(private readonly database: DatabaseService) {}

  async findAll(args?: {
    skip?: number;
    take?: number;
    search?: string;
    where?: Prisma.MobsWhereInput;
    orderBy?: Prisma.MobsOrderByWithRelationInput;
    /** Omit mobs in god zones (public readers below IMMORTAL). */
    hideGodZones?: boolean;
  }): Promise<Mobs[]> {
    const whereClause: Prisma.MobsWhereInput = {
      ...(args?.where || {}),
      ...inVisibleZone(!!args?.hideGodZones),
    };

    // Add search filter if provided
    if (args?.search && args.search.trim()) {
      whereClause.OR = [
        { name: { contains: args.search, mode: 'insensitive' } },
        { keywords: { hasSome: [args.search.toLowerCase()] } },
        { roomDescription: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    const findArgs: Prisma.MobsFindManyArgs = {
      where: whereClause,
      orderBy: args?.orderBy || { id: 'asc' },
      include: {},
    };
    if (args?.skip !== undefined) findArgs.skip = args.skip;
    if (args?.take !== undefined) findArgs.take = args.take;
    const mobs = await this.database.mobs.findMany(findArgs);
    return mobs;
  }

  async findOne(
    zoneId: number,
    id: number,
    hideGodZones = false
  ): Promise<Mobs | null> {
    const mob = await this.database.mobs.findFirst({
      where: { zoneId, id, ...inVisibleZone(hideGodZones) },
      include: {
        mobAbilities: { include: { ability: true } },
        defaultEffects: { include: { effect: true } },
        mobResets: {
          include: {
            rooms: { select: { id: true, zoneId: true, name: true } },
            zones: { select: { id: true, name: true } },
            mobResetEquipment: true,
          },
        },
      },
    });
    return mob;
  }

  async findByZone(
    zoneId: number,
    search?: string,
    hideGodZones = false
  ): Promise<Mobs[]> {
    const whereClause: Prisma.MobsWhereInput = {
      zoneId,
      ...inVisibleZone(hideGodZones),
    };

    // Add search filter if provided
    if (search && search.trim()) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { keywords: { hasSome: [search.toLowerCase()] } },
        { roomDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    const mobs = await this.database.mobs.findMany({
      where: whereClause,
      include: {
        mobResets: {
          include: {
            rooms: { select: { id: true, name: true } },
          },
        },
      },
    });
    return mobs;
  }

  async count(
    where?: Prisma.MobsWhereInput,
    hideGodZones = false
  ): Promise<number> {
    return this.database.mobs.count({
      where: { ...(where || {}), ...inVisibleZone(hideGodZones) },
    });
  }

  async search(
    search: string,
    limit: number = 10,
    zoneId?: number,
    hideGodZones = false
  ): Promise<Mobs[]> {
    const searchTerm = search.trim().toLowerCase();
    const searchNum = parseInt(searchTerm, 10);
    const isNumeric = !isNaN(searchNum);

    // Split search into words for multi-word AND logic
    const searchWords = searchTerm.split(/\s+/).filter(w => w.length > 0);

    // Build WHERE clause using plaintext fields
    const where: Prisma.MobsWhereInput = {
      ...(zoneId != null && { zoneId }),
      ...inVisibleZone(hideGodZones),
      OR: [
        // Check ID if numeric
        ...(isNumeric ? [{ id: searchNum }] : []),
        // Check keywords
        { keywords: { hasSome: searchWords } },
        // Search plaintext fields (all words must match - AND logic)
        {
          AND: searchWords.map(word => ({
            OR: [
              { plainName: { contains: word, mode: 'insensitive' } },
              { plainRoomDescription: { contains: word, mode: 'insensitive' } },
              {
                plainExamineDescription: {
                  contains: word,
                  mode: 'insensitive',
                },
              },
            ],
          })),
        },
      ],
    };

    return this.database.mobs.findMany({
      where,
      take: limit,
      orderBy: [{ zoneId: 'asc' }, { id: 'asc' }],
      include: {
        zones: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.MobsCreateInput): Promise<Mobs> {
    const mob = await this.database.mobs.create({
      data,
      include: {},
    });
    return mob;
  }

  async update(
    zoneId: number,
    id: number,
    data: Prisma.MobsUpdateInput
  ): Promise<Mobs> {
    const mob = await this.database.mobs.update({
      where: { zoneId_id: { zoneId, id } },
      data,
      include: {},
    });
    return mob;
  }

  async delete(zoneId: number, id: number): Promise<Mobs> {
    await assertNoPlayerPets(this.database, [{ zoneId, id }]);
    try {
      return await this.database.mobs.delete({
        where: { zoneId_id: { zoneId, id } },
      });
    } catch (error) {
      rethrowAsInUse(error, [{ zoneId, id }]);
    }
  }

  /**
   * Delete by composite key (zoneId, id). Matching on id alone would delete
   * same-numbered entities in other zones.
   */
  async deleteMany(
    keys: Array<{ zoneId: number; id: number }>
  ): Promise<number> {
    if (keys.length === 0) return 0;
    await assertNoPlayerPets(this.database, keys);
    try {
      const result = await this.database.mobs.deleteMany({
        where: { OR: keys.map(({ zoneId, id }) => ({ zoneId, id })) },
      });
      return result.count;
    } catch (error) {
      rethrowAsInUse(error, keys);
    }
  }

  /**
   * Find a CharacterClass by ID to get its name for combat formula calculations.
   */
  async findClassById(
    classId: number
  ): Promise<{ id: number; plainName: string } | null> {
    return this.database.characterClass.findUnique({
      where: { id: classId },
      select: { id: true, plainName: true },
    });
  }

  async updateMobDefaultEffects(
    zoneId: number,
    id: number,
    effects: Array<{
      effectId: number;
      strength?: number;
      modifierData?: Prisma.JsonValue;
    }>
  ) {
    await this.database.$transaction(async tx => {
      await tx.mobDefaultEffects.deleteMany({
        where: { mobZoneId: zoneId, mobId: id },
      });
      if (effects.length > 0) {
        await tx.mobDefaultEffects.createMany({
          data: effects.map(e => ({
            mobZoneId: zoneId,
            mobId: id,
            effectId: e.effectId,
            strength: e.strength ?? 1,
            modifierData: e.modifierData ?? {},
          })),
        });
      }
    });
    return this.findOne(zoneId, id);
  }
}
