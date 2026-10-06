import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import Redis from 'ioredis';
import { unixCrypt as crypt } from '../common/unix-crypt';
import type {
  ItemInstanceFlag,
  Permission,
  PlayerFlag,
  Prisma,
  Race,
} from '@muditor/db';
import { GameAdminService } from '../bridge/game-admin.service';
import { DatabaseService } from '../database/database.service';
import { RacesService } from '../races/races.service';
import { RoleCalculatorService } from '../users/services/role-calculator.service';
import {
  type CharacterFilterInput,
  CreateCharacterEffectInput,
  CreateCharacterInput,
  CreateCharacterItemInput,
  UpdateCharacterEffectInput,
  UpdateCharacterInput,
  UpdateCharacterItemInput,
} from './character.input';

/** Max failed password attempts before lockout */
const LOCKOUT_MAX_ATTEMPTS = 5;
/** Lockout duration in seconds (15 minutes) */
const LOCKOUT_WINDOW_SECONDS = 900;

/** Email domain of the placeholder users the game server auto-creates */
const LEGACY_PLACEHOLDER_EMAIL_SUFFIX = '@legacy.fierymud.local';

@Injectable()
export class CharactersService implements OnModuleDestroy {
  private readonly logger = new Logger(CharactersService.name);
  private redis: Redis | null = null;

  constructor(
    private readonly db: DatabaseService,
    private readonly roleCalculator: RoleCalculatorService,
    private readonly configService: ConfigService,
    private readonly racesService: RacesService,
    private readonly gameAdmin: GameAdminService
  ) {
    const redisUrl =
      this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
    this.redis = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
    const client = this.redis;
    client.connect().catch(() => {
      this.logger.warn(
        'Redis unavailable — character linking lockout protection disabled'
      );
      // Stop the reconnect loop so it cannot keep the event loop alive.
      client.disconnect();
      this.redis = null;
    });
  }

  /**
   * Check if a character is locked out from linking attempts.
   * Returns the remaining lockout time in seconds, or 0 if not locked out.
   */
  async getLockoutRemaining(characterName: string): Promise<number> {
    if (!this.redis) return 0;
    const key = `charlink:lockout:${characterName.toLowerCase()}`;
    try {
      const attempts = await this.redis.get(key);
      if (attempts && parseInt(attempts, 10) >= LOCKOUT_MAX_ATTEMPTS) {
        const ttl = await this.redis.ttl(key);
        return ttl > 0 ? ttl : 0;
      }
    } catch {
      // Redis error — fail open
    }
    return 0;
  }

  /**
   * Record a failed password attempt for a character.
   * Returns the new attempt count.
   */
  private async recordFailedAttempt(characterName: string): Promise<number> {
    if (!this.redis) return 0;
    const key = `charlink:lockout:${characterName.toLowerCase()}`;
    try {
      const count = await this.redis.incr(key);
      // Set/refresh TTL on first attempt or when reaching lockout threshold
      if (count === 1 || count === LOCKOUT_MAX_ATTEMPTS) {
        await this.redis.expire(key, LOCKOUT_WINDOW_SECONDS);
      }
      return count;
    } catch {
      return 0;
    }
  }

  /**
   * Clear failed attempt counter for a character (on successful link).
   */
  async clearFailedAttempts(characterName: string): Promise<void> {
    if (!this.redis) return;
    const key = `charlink:lockout:${characterName.toLowerCase()}`;
    try {
      await this.redis.del(key);
    } catch {
      // Redis error — non-critical
    }
  }

  onModuleDestroy() {
    // disconnect(), not quit(): quit waits on a reply from a server that may
    // be unreachable.
    this.redis?.disconnect();
    this.redis = null;
  }

  // Character operations
  async findAllCharacters(
    skip?: number,
    take?: number,
    filter?: CharacterFilterInput
  ) {
    const where: Prisma.CharactersWhereInput = {};

    // Build filter conditions
    if (filter?.name) {
      where.name = {
        contains: filter.name,
        mode: 'insensitive',
      };
    }

    return this.db.characters.findMany({
      where,
      include: {
        characterItems: {
          include: {
            objects: {
              select: { id: true, zoneId: true, name: true, type: true },
            },
            container: true,
            containedItems: true,
          },
        },
        characterEffects: true,
      },
      orderBy: { name: 'asc' },
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
    });
  }

  async findCharacterById(id: string) {
    const character = await this.db.characters.findUnique({
      where: { id },
      include: {
        characterItems: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                type: true,
              },
            },
            container: true,
            containedItems: true,
          },
        },
        characterEffects: true,
      },
    });

    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    return character;
  }

  /** Class display name for a classId (null if unknown). */
  async findClassName(classId: number): Promise<string | null> {
    const cls = await this.db.characterClass.findUnique({
      where: { id: classId },
      select: { plainName: true },
    });
    return cls?.plainName ?? null;
  }

  /** Throws BadRequest unless a CharacterClass with this id exists. */
  private async assertClassExists(classId: number): Promise<void> {
    const cls = await this.db.characterClass.findUnique({
      where: { id: classId },
      select: { id: true },
    });
    if (!cls) {
      throw new BadRequestException(`Class with ID ${classId} does not exist`);
    }
  }

  /**
   * Non-staff callers may only pick playable races; staff may set any race.
   * Unknown races surface as NotFound from RacesService.
   */
  private async assertRaceAllowed(race: Race, isStaff: boolean): Promise<void> {
    if (isStaff) return;
    const raceData = await this.racesService.findOne(race);
    if (!raceData.playable) {
      throw new BadRequestException(`Race ${race} is not playable`);
    }
  }

  /** Owning user id of a character (null if unlinked); NotFound when the character is missing. */
  async findCharacterOwnerId(id: string): Promise<string | null> {
    const character = await this.db.characters.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }
    return character.userId ?? null;
  }

  async findCharactersByUser(userId: string) {
    return this.db.characters.findMany({
      where: { userId },
      include: {
        characterItems: {
          include: {
            objects: {
              select: {
                id: true,
                zoneId: true,
                name: true,
                type: true,
              },
            },
          },
        },
        characterEffects: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCharactersCount(filter?: CharacterFilterInput) {
    const where: Prisma.CharactersWhereInput = {};

    // Build filter conditions (same as findAllCharacters)
    if (filter?.name) {
      where.name = {
        contains: filter.name,
        mode: 'insensitive',
      };
    }

    return this.db.characters.count({ where });
  }

  async createCharacter(
    data: CreateCharacterInput,
    userId: string,
    options: { isStaff?: boolean } = {}
  ) {
    // Check if character name already exists
    const existingCharacter = await this.db.characters.findUnique({
      where: { name: data.name },
    });

    if (existingCharacter) {
      throw new BadRequestException(
        `Character with name '${data.name}' already exists`
      );
    }

    await this.assertRaceAllowed(data.race, options.isStaff ?? false);
    await this.assertClassExists(data.classId);

    const hitPoints = Math.max(50, data.constitution * 5 + data.level * 10);
    const stamina = Math.max(100, data.constitution * 8 + data.level * 5);
    const createData: Prisma.CharactersCreateInput = {
      id: crypto.randomUUID(),
      name: data.name,
      level: data.level,
      alignment: data.alignment,
      strength: data.strength,
      intelligence: data.intelligence,
      wisdom: data.wisdom,
      dexterity: data.dexterity,
      constitution: data.constitution,
      charisma: data.charisma,
      luck: data.luck,
      gender: data.gender,
      race: data.race,
      description: data.description ?? null,
      title: data.title ?? null,
      users: { connect: { id: userId } },
      characterClass: { connect: { id: data.classId } },
      hitPointsMax: hitPoints,
      hitPoints,
      staminaMax: stamina,
      stamina,
    };
    return this.db.characters.create({
      data: createData,
      include: {
        characterItems: {
          include: {
            objects: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
        characterEffects: true,
      },
    });
  }

  async updateCharacter(
    id: string,
    data: UpdateCharacterInput,
    options: { isStaff?: boolean } = {}
  ) {
    const character = await this.findCharacterById(id);

    // If name is being changed, check for duplicates
    if (data.name && data.name !== character.name) {
      const existingCharacter = await this.db.characters.findUnique({
        where: { name: data.name },
      });

      if (existingCharacter) {
        throw new BadRequestException(
          `Character with name '${data.name}' already exists`
        );
      }
    }

    if (data.race !== undefined) {
      await this.assertRaceAllowed(data.race, options.isStaff ?? false);
    }
    if (data.classId !== undefined) {
      await this.assertClassExists(data.classId);
    }

    // Explicit construction: GraphQL field names differ from Prisma columns
    // (movement -> stamina, currentRoom -> currentRoomId, ...).
    const updateData: Prisma.CharactersUpdateInput = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.level !== undefined && { level: data.level }),
      ...(data.alignment !== undefined && { alignment: data.alignment }),
      ...(data.strength !== undefined && { strength: data.strength }),
      ...(data.intelligence !== undefined && {
        intelligence: data.intelligence,
      }),
      ...(data.wisdom !== undefined && { wisdom: data.wisdom }),
      ...(data.dexterity !== undefined && { dexterity: data.dexterity }),
      ...(data.constitution !== undefined && {
        constitution: data.constitution,
      }),
      ...(data.charisma !== undefined && { charisma: data.charisma }),
      ...(data.luck !== undefined && { luck: data.luck }),
      ...(data.hitPoints !== undefined && { hitPoints: data.hitPoints }),
      ...(data.hitPointsMax !== undefined && {
        hitPointsMax: data.hitPointsMax,
      }),
      ...(data.movement !== undefined && { stamina: data.movement }),
      ...(data.movementMax !== undefined && { staminaMax: data.movementMax }),
      ...(data.gender !== undefined && { gender: data.gender }),
      ...(data.race !== undefined && { race: data.race }),
      ...(data.classId !== undefined && {
        characterClass: { connect: { id: data.classId } },
      }),
      ...(data.height !== undefined && { height: data.height }),
      ...(data.weight !== undefined && { weight: data.weight }),
      ...(data.currentRoom !== undefined && {
        currentRoomId: data.currentRoom,
      }),
      ...(data.saveRoom !== undefined && { recallRoomId: data.saveRoom }),
      ...(data.homeRoom !== undefined && { recallRoomId: data.homeRoom }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.prompt !== undefined && { prompt: data.prompt }),
      ...(data.playerFlags !== undefined && {
        playerFlags: data.playerFlags as PlayerFlag[],
      }),
      ...(data.privilegeFlags !== undefined && {
        permissions: data.privilegeFlags as Permission[],
      }),
      ...(data.invisLevel !== undefined && { invisLevel: data.invisLevel }),
    };

    return this.db.characters.update({
      where: { id },
      data: updateData,
      include: {
        characterItems: {
          include: {
            objects: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
        characterEffects: true,
      },
    });
  }

  async deleteCharacter(id: string) {
    await this.findCharacterById(id);

    return this.db.characters.delete({
      where: { id },
      include: {
        characterItems: true,
        characterEffects: true,
      },
    });
  }

  // Character Item operations
  async findCharacterItems(characterId: string) {
    await this.findCharacterById(characterId); // Ensure character exists

    return this.db.characterItems.findMany({
      where: { characterId },
      include: {
        objects: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        container: true,
        containedItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCharacterItemById(id: number) {
    const item = await this.db.characterItems.findUnique({
      where: { id },
      include: {
        characters: true,
        objects: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        container: true,
        containedItems: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Character item with ID ${id} not found`);
    }

    return item;
  }

  async createCharacterItem(data: CreateCharacterItemInput) {
    // Ensure character exists
    await this.findCharacterById(data.characterId);

    // Verify object prototype exists
    const objectPrototype = await this.db.objects.findUnique({
      where: { zoneId_id: { zoneId: data.objectZoneId, id: data.objectId } },
      select: { id: true },
    });
    if (!objectPrototype) {
      throw new NotFoundException(
        `Object prototype (zone ${data.objectZoneId}, id ${data.objectId}) not found`
      );
    }

    // If containerId is specified, ensure it exists and belongs to same character
    if (data.containerId) {
      const container = await this.db.characterItems.findUnique({
        where: { id: data.containerId },
      });

      if (!container || container.characterId !== data.characterId) {
        throw new BadRequestException('Invalid container specified');
      }
    }

    // Map prototype to required object composite key (placeholder until proper lookup implemented)
    const itemCreateData: Parameters<
      typeof this.db.characterItems.create
    >[0]['data'] = {
      characterId: data.characterId,
      objectZoneId: data.objectZoneId,
      objectId: data.objectId,
      containerId: data.containerId ?? null,
      equippedLocation: data.equippedLocation ?? null,
      condition: data.condition,
      charges: data.charges,
      instanceFlags: data.instanceFlags as ItemInstanceFlag[],
      customName: data.customShortDesc ?? null,
      customExamineDescription: data.customLongDesc ?? null,
      customValues: {},
      updatedAt: new Date(),
    };
    return this.db.characterItems.create({
      data: itemCreateData,
      include: {
        characters: true,
        objects: {
          select: {
            id: true,
            zoneId: true,
            name: true,
            type: true,
          },
        },
        container: true,
        containedItems: true,
      },
    });
  }

  async updateCharacterItem(id: number, data: UpdateCharacterItemInput) {
    const item = await this.findCharacterItemById(id);

    // If containerId is being changed, validate it
    if (data.containerId !== undefined) {
      if (data.containerId) {
        const container = await this.db.characterItems.findUnique({
          where: { id: data.containerId },
        });

        if (!container || container.characterId !== item.characterId) {
          throw new BadRequestException('Invalid container specified');
        }
      }
    }

    return this.db.characterItems.update({
      where: { id },
      data: data as Prisma.CharacterItemsUpdateInput,
      include: {
        characters: true,
        objects: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        container: true,
        containedItems: true,
      },
    });
  }

  async deleteCharacterItem(id: number) {
    await this.findCharacterItemById(id);

    return this.db.characterItems.delete({
      where: { id },
    });
  }

  // Character Effect operations
  async findCharacterEffects(characterId: string) {
    await this.findCharacterById(characterId); // Ensure character exists

    return this.db.characterEffects.findMany({
      where: { characterId },
      include: {
        characters: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findCharacterEffectById(id: number) {
    const effect = await this.db.characterEffects.findUnique({
      where: { id },
      include: {
        characters: true,
      },
    });

    if (!effect) {
      throw new NotFoundException(`Character effect with ID ${id} not found`);
    }

    return effect;
  }

  async createCharacterEffect(data: CreateCharacterEffectInput) {
    // Ensure character exists
    await this.findCharacterById(data.characterId);

    // Duration is stored and expiration is calculated on-the-fly
    const effectCreateData: Parameters<
      typeof this.db.characterEffects.create
    >[0]['data'] = {
      characterId: data.characterId,
      effectId: parseInt(data.effectName, 10),
      duration: data.duration ?? null,
      strength: data.strength,
      sourceType: data.sourceType ?? null,
      sourceId: data.sourceId ?? null,
      appliedAt: new Date(),
    };
    return this.db.characterEffects.create({
      data: effectCreateData,
      include: {
        characters: true,
      },
    });
  }

  async updateCharacterEffect(id: number, data: UpdateCharacterEffectInput) {
    await this.findCharacterEffectById(id);
    // Duration is updated directly; expiration calculated on-the-fly
    return this.db.characterEffects.update({
      where: { id },
      data,
      include: {
        characters: true,
      },
    });
  }

  async deleteCharacterEffect(id: number) {
    await this.findCharacterEffectById(id);

    return this.db.characterEffects.delete({
      where: { id },
    });
  }

  // Utility methods
  async removeExpiredEffects(characterId?: string) {
    // Calculate expiration on-the-fly: appliedAt + duration
    const effects = await this.db.characterEffects.findMany({
      where: characterId ? { characterId: characterId } : {},
    });

    const expiredIds = effects
      .filter(e => {
        if (!e.duration || e.duration < 0) return false; // Permanent or invalid
        const expiresAt = new Date(e.appliedAt.getTime() + e.duration * 1000);
        return expiresAt <= new Date();
      })
      .map(e => e.id);

    if (expiredIds.length === 0) {
      return { count: 0 };
    }

    return this.db.characterEffects.deleteMany({
      where: { id: { in: expiredIds } },
    });
  }

  async getActiveEffects(characterId: string) {
    const effects = await this.db.characterEffects.findMany({
      where: { characterId },
      include: {
        characters: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    // Filter to active effects (not expired)
    const now = new Date();
    return effects.filter(e => {
      if (!e.duration || e.duration < 0) return true; // Permanent
      const expiresAt = new Date(e.appliedAt.getTime() + e.duration * 1000);
      return expiresAt > now;
    });
  }

  // Character session tracking (online state is tracked by game server runtime, not DB)
  async setCharacterOnline(characterId: string): Promise<void> {
    await this.db.characters.update({
      where: { id: characterId },
      data: { lastLogin: new Date() },
    });
  }

  async setCharacterOffline(characterId: string): Promise<void> {
    const character = await this.db.characters.findUnique({
      where: { id: characterId },
      select: { lastLogin: true, timePlayed: true },
    });

    if (character?.lastLogin) {
      const sessionTime = Math.floor(
        (Date.now() - character.lastLogin.getTime()) / 1000
      );

      await this.db.characters.update({
        where: { id: characterId },
        data: {
          timePlayed: { increment: sessionTime },
        },
      });
    }
  }

  /**
   * Characters with a live session on the game server. The game server's
   * session list is the only source of truth; if it is unreachable the result
   * is empty (never an approximation from recent logins).
   */
  async getOnlineCharacters(userId?: string) {
    let names: string[];
    try {
      const live = await this.gameAdmin.getOnlinePlayers();
      names = live.map(p => p.name);
    } catch (error) {
      this.logger.warn(
        `Game server player list unavailable, reporting no online characters: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return [];
    }
    if (names.length === 0) {
      return [];
    }

    const where: Prisma.CharactersWhereInput = {
      OR: names.map(name => ({ name: { equals: name, mode: 'insensitive' } })),
      ...(userId ? { userId } : {}),
    };

    const characters = await this.db.characters.findMany({
      where,
      select: {
        id: true,
        name: true,
        level: true,
        lastLogin: true,
        race: true,
        characterClass: {
          select: {
            plainName: true,
          },
        },
        users: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return characters.map(c => ({
      id: c.id,
      name: c.name,
      level: c.level,
      lastLogin: c.lastLogin,
      race: c.race ?? undefined,
      class: c.characterClass?.plainName ?? undefined,
      user: c.users ?? {
        id: c.id,
        displayName: c.name,
        role: this.roleCalculator.calculateRoleFromLevel(c.level),
      },
    }));
  }

  async getCharacterSessionInfo(characterId: string) {
    const character = await this.db.characters.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        lastLogin: true,
        timePlayed: true,
      },
    });

    if (!character) {
      throw new NotFoundException(`Character with ID ${characterId} not found`);
    }

    return {
      ...character,
      currentSessionTime: 0,
      totalTimePlayed: character.timePlayed,
    };
  }

  async updateCharacterActivity(characterId: string): Promise<void> {
    // Update last activity timestamp - useful for idle detection
    await this.db.characters.update({
      where: { id: characterId },
      data: {
        lastLogin: new Date(), // Update activity time
      },
    });
  }

  // Character linking methods
  /**
   * Link an existing game character to a user account.
   * Validates character password, enforces per-character lockout,
   * and recalculates user role on success.
   */
  async linkCharacterToUser(
    userId: string,
    characterName: string,
    characterPassword: string
  ) {
    // Check lockout BEFORE doing any expensive work
    const lockoutRemaining = await this.getLockoutRemaining(characterName);
    if (lockoutRemaining > 0) {
      const minutes = Math.ceil(lockoutRemaining / 60);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many failed attempts for this character. Try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
          error: 'Too Many Requests',
          retryAfter: lockoutRemaining,
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Find character by name (case-insensitive)
    const character = await this.db.characters.findFirst({
      where: {
        name: {
          equals: characterName,
          mode: 'insensitive',
        },
      },
    });

    if (!character) {
      throw new NotFoundException(`Character '${characterName}' not found`);
    }

    // Check if character is already linked. The one exception is a legacy
    // placeholder owner (auto-created by the game server on a legacy
    // character's first telnet login): the caller may claim it below, after
    // proving the character's game password.
    let placeholderOwnerId: string | null = null;
    if (character.userId) {
      if (
        character.userId !== userId &&
        (await this.isClaimablePlaceholder(character.userId))
      ) {
        placeholderOwnerId = character.userId;
      } else {
        throw new BadRequestException(
          `Character '${characterName}' is already linked to another account`
        );
      }
    }

    // Validate character password
    // Supports bcrypt ($2a$/$2b$) and legacy DES crypt (10 chars)
    let isPasswordValid = false;

    if (character.passwordHash.startsWith('$2')) {
      // Modern bcrypt hash
      isPasswordValid = await bcrypt.compare(
        characterPassword,
        character.passwordHash
      );
    } else if (character.passwordHash.length === 10) {
      // Legacy DES crypt - validate and upgrade to bcrypt
      const hashedPassword = crypt(characterPassword, character.passwordHash);
      isPasswordValid =
        hashedPassword.substring(0, 10) === character.passwordHash;

      if (isPasswordValid) {
        const bcryptHash = await bcrypt.hash(characterPassword, 10);
        await this.db.characters.update({
          where: { id: character.id },
          data: { passwordHash: bcryptHash },
        });
        this.logger.log(
          `Upgraded legacy password to bcrypt for character: ${character.name}`
        );
      }
    }

    if (!isPasswordValid) {
      const attempts = await this.recordFailedAttempt(characterName);
      const remaining = LOCKOUT_MAX_ATTEMPTS - attempts;
      this.logger.warn(
        `Failed character link attempt for '${characterName}' (${attempts}/${LOCKOUT_MAX_ATTEMPTS})`
      );

      if (remaining <= 0) {
        const minutes = Math.ceil(LOCKOUT_WINDOW_SECONDS / 60);
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: `Too many failed attempts. This character is locked for ${minutes} minutes.`,
            error: 'Too Many Requests',
            retryAfter: LOCKOUT_WINDOW_SECONDS,
          },
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      throw new BadRequestException(
        `Invalid character password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
      );
    }

    // Password valid — clear any failed attempts
    await this.clearFailedAttempts(characterName);

    if (placeholderOwnerId) {
      // Claim: move every character of the placeholder to the caller and
      // remove the placeholder, atomically. The guard on userId makes a
      // concurrent claim a no-op instead of a double move.
      const ownerId = placeholderOwnerId;
      await this.db.$transaction(async tx => {
        const moved = await tx.characters.updateMany({
          where: { userId: ownerId },
          data: { userId },
        });
        await tx.users.delete({ where: { id: ownerId } });
        this.logger.log(
          `User ${userId} claimed ${moved.count} character(s) from legacy placeholder ${ownerId} via '${character.name}'`
        );
      });
    } else {
      // Link character to user
      await this.db.characters.update({
        where: { id: character.id },
        data: { userId },
      });
    }

    // Recalculate user role. Raising is allowed here only: the caller proved
    // ownership with the character's password (legacy staff characters).
    await this.roleCalculator.updateUserRole(userId, { allowRaise: true });

    return character;
  }

  /**
   * A legacy placeholder is the synthetic account the game server creates on a
   * legacy character's first telnet login: placeholder email, no website
   * password and no Google link. Only such accounts may be claimed.
   */
  private async isClaimablePlaceholder(ownerId: string): Promise<boolean> {
    const owner = await this.db.users.findUnique({
      where: { id: ownerId },
      select: {
        email: true,
        passwordHash: true,
        googleLink: { select: { id: true } },
      },
    });
    return (
      !!owner &&
      owner.email.toLowerCase().endsWith(LEGACY_PLACEHOLDER_EMAIL_SUFFIX) &&
      !owner.passwordHash &&
      !owner.googleLink
    );
  }

  /**
   * Unlink a character from a user account
   * Recalculates user role after unlinking
   */
  async unlinkCharacterFromUser(characterId: string, userId: string) {
    const character = await this.db.characters.findUnique({
      where: { id: characterId },
    });

    if (!character) {
      throw new NotFoundException(`Character with ID ${characterId} not found`);
    }

    // Verify character belongs to the user
    if (character.userId !== userId) {
      throw new BadRequestException(
        'Character does not belong to this user account'
      );
    }

    // Unlink character
    await this.db.characters.update({
      where: { id: characterId },
      data: { userId: null },
    });

    // Recalculate user role (may be downgraded if this was their highest-level
    // character). Never promotes: allowRaise is intentionally not set.
    await this.roleCalculator.updateUserRole(userId);
  }

  /**
   * Find character by name for linking purposes
   */
  async findCharacterByNameForLinking(characterName: string) {
    const character = await this.db.characters.findFirst({
      where: {
        name: {
          equals: characterName,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        level: true,
        userId: true,
        passwordHash: true,
      },
    });

    if (!character) {
      return null;
    }

    return {
      id: character.id,
      name: character.name,
      level: character.level,
      isLinked: !!character.userId,
      hasPassword: !!character.passwordHash,
    };
  }

  async getCharacterLinkingInfo(characterName: string) {
    const character = await this.db.characters.findFirst({
      where: {
        name: {
          equals: characterName,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        level: true,
        race: true,
        classId: true,
        userId: true,
        lastLogin: true,
        timePlayed: true,
        characterClass: {
          select: { plainName: true },
        },
      },
    });

    if (!character) {
      throw new NotFoundException(`Character '${characterName}' not found`);
    }

    // Look up pretty race name from Races table
    const raceData = await this.db.races.findUnique({
      where: { race: character.race },
      select: { plainName: true },
    });

    return {
      id: character.id,
      name: character.name,
      level: character.level,
      race: raceData?.plainName ?? character.race,
      class: character.characterClass?.plainName ?? undefined,
      lastLogin: character.lastLogin,
      timePlayed: character.timePlayed,
      isLinked: !!character.userId,
      hasPassword: false, // Deprecated: passwords are now on User model
    };
  }
}
