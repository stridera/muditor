import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DatabaseService } from '../database/database.service';
import { RoleCalculatorService } from '../users/services/role-calculator.service';
import {
  CreateCharacterEffectInput,
  CreateCharacterInput,
  CreateCharacterItemInput,
  UpdateCharacterEffectInput,
  UpdateCharacterInput,
  UpdateCharacterItemInput,
} from './character.input';

@Injectable()
export class CharactersService {
  constructor(
    private readonly db: DatabaseService,
    private readonly roleCalculator: RoleCalculatorService
  ) {}

  // Character operations
  async findAllCharacters(skip?: number, take?: number) {
    const args: Parameters<typeof this.db.characters.findMany>[0] = {
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
    };
    if (skip !== undefined) args.skip = skip;
    if (take !== undefined) args.take = take;
    return this.db.characters.findMany(args);
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

  async getCharactersCount() {
    return this.db.characters.count();
  }

  async createCharacter(data: CreateCharacterInput, userId: string) {
    // Check if character name already exists
    const existingCharacter = await this.db.characters.findUnique({
      where: { name: data.name },
    });

    if (existingCharacter) {
      throw new BadRequestException(
        `Character with name '${data.name}' already exists`
      );
    }

    const createData: Parameters<typeof this.db.characters.create>[0]['data'] =
      {
        id: crypto.randomUUID(),
        ...data,
        users: { connect: { id: userId } },
        hitPointsMax: Math.max(50, data.constitution * 5 + data.level * 10),
        movementMax: Math.max(100, data.constitution * 8 + data.level * 5),
        hitPoints: Math.max(50, data.constitution * 5 + data.level * 10),
        movement: Math.max(100, data.constitution * 8 + data.level * 5),
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

  async updateCharacter(id: string, data: UpdateCharacterInput) {
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

    return this.db.characters.update({
      where: { id },
      data: data,
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

    // TODO: Fix object prototype lookup to use composite key (zoneId, id)
    // The input DTO needs to be updated to include objectZoneId

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
      objectZoneId: 0, // TODO: derive zone id from prototype
      objectId: data.objectPrototypeId,
      containerId: data.containerId ?? null,
      equippedLocation: data.equippedLocation ?? null,
      condition: data.condition,
      charges: data.charges,
      instanceFlags: data.instanceFlags,
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
      data,
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
      effectName: data.effectName,
      effectType: data.effectType ?? null,
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

  // Character online status tracking
  async setCharacterOnline(characterId: string): Promise<void> {
    await this.db.characters.update({
      where: { id: characterId },
      data: {
        isOnline: true,
        lastLogin: new Date(),
      },
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
          isOnline: false,
          timePlayed: {
            increment: sessionTime,
          },
        },
      });
    } else {
      await this.db.characters.update({
        where: { id: characterId },
        data: {
          isOnline: false,
        },
      });
    }
  }

  async getOnlineCharacters(userId?: string) {
    const where = userId
      ? {
          isOnline: true,
          userId,
        }
      : {
          isOnline: true,
        };

    return this.db.characters.findMany({
      where,
      select: {
        id: true,
        name: true,
        level: true,
        lastLogin: true,
        isOnline: true,
        race: true,
        classId: true,
        users: {
          select: {
            id: true,
            username: true,
            role: true,
          },
        },
      },
      orderBy: { lastLogin: 'desc' },
    });
  }

  async getCharacterSessionInfo(characterId: string) {
    const character = await this.db.characters.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        isOnline: true,
        lastLogin: true,
        timePlayed: true,
      },
    });

    if (!character) {
      throw new NotFoundException(`Character with ID ${characterId} not found`);
    }

    let currentSessionTime = 0;
    if (character.isOnline && character.lastLogin) {
      currentSessionTime = Math.floor(
        (Date.now() - character.lastLogin.getTime()) / 1000
      );
    }

    return {
      ...character,
      currentSessionTime,
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
   * Link an existing game character to a user account
   * Validates character password and recalculates user role
   */
  async linkCharacterToUser(
    userId: string,
    characterName: string,
    characterPassword: string
  ) {
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

    // Check if character is already linked
    if (character.userId) {
      throw new BadRequestException(
        `Character '${characterName}' is already linked to another account`
      );
    }

    // Validate character password
    if (!character.passwordHash) {
      throw new BadRequestException(
        `Character '${characterName}' does not have a password set`
      );
    }

    const isPasswordValid = await bcrypt.compare(
      characterPassword,
      character.passwordHash
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid character password');
    }

    // Link character to user
    await this.db.characters.update({
      where: { id: character.id },
      data: { userId },
    });

    // Recalculate and update user role based on character level
    await this.roleCalculator.updateUserRole(userId);

    return character;
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

    // Recalculate user role (may be downgraded if this was their highest-level character)
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

  /**
   * Validate character password for linking
   */
  async validateCharacterPassword(
    characterName: string,
    password: string
  ): Promise<boolean> {
    const character = await this.db.characters.findFirst({
      where: {
        name: {
          equals: characterName,
          mode: 'insensitive',
        },
      },
      select: {
        passwordHash: true,
      },
    });

    if (!character || !character.passwordHash) {
      return false;
    }

    return bcrypt.compare(password, character.passwordHash);
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
        isOnline: true,
      },
    });

    if (!character) {
      throw new NotFoundException(`Character '${characterName}' not found`);
    }

    return {
      id: character.id,
      name: character.name,
      level: character.level,
      race: character.race,
      class: character.classId,
      lastLogin: character.lastLogin,
      timePlayed: character.timePlayed,
      isOnline: character.isOnline,
      isLinked: !!character.userId,
      hasPassword: false, // Deprecated: passwords are now on User model
    };
  }
}
