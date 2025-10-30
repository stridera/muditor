import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateCharacterInput,
  UpdateCharacterInput,
  CreateCharacterItemInput,
  UpdateCharacterItemInput,
  CreateCharacterEffectInput,
  UpdateCharacterEffectInput,
} from './character.input';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CharactersService {
  constructor(private readonly db: DatabaseService) {}

  // Character operations
  async findAllCharacters(skip?: number, take?: number) {
    return this.db.character.findMany({
      skip,
      take,
      include: {
        items: {
          include: {
            object: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
              },
            },
            container: true,
            containedItems: true,
          },
        },
        effects: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findCharacterById(id: string) {
    const character = await this.db.character.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            object: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
              },
            },
            container: true,
            containedItems: true,
          },
        },
        effects: true,
      },
    });

    if (!character) {
      throw new NotFoundException(`Character with ID ${id} not found`);
    }

    return character;
  }

  async findCharactersByUser(userId: string) {
    return this.db.character.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            object: {
              select: {
                id: true,
                zoneId: true,
                shortDesc: true,
                type: true,
              },
            },
          },
        },
        effects: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCharactersCount() {
    return this.db.character.count();
  }

  async createCharacter(data: CreateCharacterInput, userId: string) {
    // Check if character name already exists
    const existingCharacter = await this.db.character.findUnique({
      where: { name: data.name },
    });

    if (existingCharacter) {
      throw new BadRequestException(
        `Character with name '${data.name}' already exists`
      );
    }

    return this.db.character.create({
      data: {
        ...data,
        user: { connect: { id: userId } },
        // Set default max values based on constitution and level
        hitPointsMax: Math.max(50, data.constitution * 5 + data.level * 10),
        movementMax: Math.max(100, data.constitution * 8 + data.level * 5),
        hitPoints: Math.max(50, data.constitution * 5 + data.level * 10),
        movement: Math.max(100, data.constitution * 8 + data.level * 5),
      } as any,
      include: {
        items: {
          include: {
            object: {
              select: {
                id: true,
                shortDesc: true,
                type: true,
              },
            },
          },
        },
        effects: true,
      },
    });
  }

  async updateCharacter(id: string, data: UpdateCharacterInput) {
    const character = await this.findCharacterById(id);

    // If name is being changed, check for duplicates
    if (data.name && data.name !== character.name) {
      const existingCharacter = await this.db.character.findUnique({
        where: { name: data.name },
      });

      if (existingCharacter) {
        throw new BadRequestException(
          `Character with name '${data.name}' already exists`
        );
      }
    }

    return this.db.character.update({
      where: { id },
      data: data as any,
      include: {
        items: {
          include: {
            object: {
              select: {
                id: true,
                shortDesc: true,
                type: true,
              },
            },
          },
        },
        effects: true,
      },
    });
  }

  async deleteCharacter(id: string) {
    await this.findCharacterById(id);

    return this.db.character.delete({
      where: { id },
      include: {
        items: true,
        effects: true,
      },
    });
  }

  // Character Item operations
  async findCharacterItems(characterId: string) {
    await this.findCharacterById(characterId); // Ensure character exists

    return this.db.characterItem.findMany({
      where: { characterId },
      include: {
        object: {
          select: {
            id: true,
            shortDesc: true,
            type: true,
          },
        },
        container: true,
        containedItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCharacterItemById(id: string) {
    const item = await this.db.characterItem.findUnique({
      where: { id },
      include: {
        character: true,
        object: {
          select: {
            id: true,
            shortDesc: true,
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
      const container = await this.db.characterItem.findUnique({
        where: { id: data.containerId },
      });

      if (!container || container.characterId !== data.characterId) {
        throw new BadRequestException('Invalid container specified');
      }
    }

    return this.db.characterItem.create({
      data: data as any,
      include: {
        character: true,
        object: {
          select: {
            id: true,
            zoneId: true,
            shortDesc: true,
            type: true,
          },
        },
        container: true,
        containedItems: true,
      },
    });
  }

  async updateCharacterItem(id: string, data: UpdateCharacterItemInput) {
    const item = await this.findCharacterItemById(id);

    // If containerId is being changed, validate it
    if (data.containerId !== undefined) {
      if (data.containerId) {
        const container = await this.db.characterItem.findUnique({
          where: { id: data.containerId },
        });

        if (!container || container.characterId !== item.characterId) {
          throw new BadRequestException('Invalid container specified');
        }
      }
    }

    return this.db.characterItem.update({
      where: { id },
      data,
      include: {
        character: true,
        object: {
          select: {
            id: true,
            shortDesc: true,
            type: true,
          },
        },
        container: true,
        containedItems: true,
      },
    });
  }

  async deleteCharacterItem(id: string) {
    await this.findCharacterItemById(id);

    return this.db.characterItem.delete({
      where: { id },
    });
  }

  // Character Effect operations
  async findCharacterEffects(characterId: string) {
    await this.findCharacterById(characterId); // Ensure character exists

    return this.db.characterEffect.findMany({
      where: { characterId },
      include: {
        character: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async findCharacterEffectById(id: string) {
    const effect = await this.db.characterEffect.findUnique({
      where: { id },
      include: {
        character: true,
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
    return this.db.characterEffect.create({
      data: data as any,
      include: {
        character: true,
      },
    });
  }

  async updateCharacterEffect(id: string, data: UpdateCharacterEffectInput) {
    await this.findCharacterEffectById(id);
    // Duration is updated directly; expiration calculated on-the-fly
    return this.db.characterEffect.update({
      where: { id },
      data,
      include: {
        character: true,
      },
    });
  }

  async deleteCharacterEffect(id: string) {
    await this.findCharacterEffectById(id);

    return this.db.characterEffect.delete({
      where: { id },
    });
  }

  // Utility methods
  async removeExpiredEffects(characterId?: string) {
    // Calculate expiration on-the-fly: appliedAt + duration
    const effects = await this.db.characterEffect.findMany({
      where: characterId ? { characterId } : {},
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

    return this.db.characterEffect.deleteMany({
      where: { id: { in: expiredIds } },
    });
  }

  async getActiveEffects(characterId: string) {
    const effects = await this.db.characterEffect.findMany({
      where: { characterId },
      include: {
        character: true,
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
    await this.db.character.update({
      where: { id: characterId },
      data: {
        isOnline: true,
        lastLogin: new Date(),
      },
    });
  }

  async setCharacterOffline(characterId: string): Promise<void> {
    const character = await this.db.character.findUnique({
      where: { id: characterId },
      select: { lastLogin: true, timePlayed: true },
    });

    if (character?.lastLogin) {
      const sessionTime = Math.floor(
        (Date.now() - character.lastLogin.getTime()) / 1000
      );

      await this.db.character.update({
        where: { id: characterId },
        data: {
          isOnline: false,
          timePlayed: {
            increment: sessionTime,
          },
        },
      });
    } else {
      await this.db.character.update({
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

    return this.db.character.findMany({
      where,
      select: {
        id: true,
        name: true,
        level: true,
        lastLogin: true,
        isOnline: true,
        race: true,
        classId: true,
        user: {
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
    const character = await this.db.character.findUnique({
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
    await this.db.character.update({
      where: { id: characterId },
      data: {
        lastLogin: new Date(), // Update activity time
      },
    });
  }

  // Character linking methods
  // DEPRECATED: Character linking methods
  // Characters now require userId at creation, so linking is no longer supported
  async linkCharacterToUser(
    userId: string,
    characterName: string,
    characterPassword: string
  ) {
    throw new BadRequestException(
      'Character linking is deprecated. Characters are now created directly by users.'
    );
  }

  async unlinkCharacterFromUser(characterId: string, userId: string) {
    throw new BadRequestException(
      'Character unlinking is not currently supported. Please contact an administrator.'
    );
  }

  async findCharacterByNameForLinking(characterName: string) {
    const character = await this.db.character.findFirst({
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
      hasPassword: false, // Deprecated: passwords are now on User model
    };
  }

  async validateCharacterPassword(
    characterName: string,
    password: string
  ): Promise<boolean> {
    throw new BadRequestException(
      'Character password validation is deprecated. Use user authentication instead.'
    );
  }

  async getCharacterLinkingInfo(characterName: string) {
    const character = await this.db.character.findFirst({
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
