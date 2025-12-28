import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  UpdateGameConfigInput,
  UpdateLevelDefinitionInput,
  CreateSystemTextInput,
  UpdateSystemTextInput,
  CreateLoginMessageInput,
  UpdateLoginMessageInput,
} from './settings.input';
import { LoginStage, CommandCategory } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private readonly db: DatabaseService) {}

  // ============================================
  // GameConfig Methods
  // ============================================

  /**
   * Get all game configuration entries
   */
  async findAllConfigs() {
    return this.db.gameConfig.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  /**
   * Get configuration entries by category
   */
  async findConfigsByCategory(category: string) {
    return this.db.gameConfig.findMany({
      where: { category },
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Get a single configuration entry
   */
  async findConfig(category: string, key: string) {
    const config = await this.db.gameConfig.findUnique({
      where: { category_key: { category, key } },
    });

    if (!config) {
      throw new NotFoundException(`Config ${category}.${key} not found`);
    }

    return config;
  }

  /**
   * Update a configuration value
   */
  async updateConfig(
    category: string,
    key: string,
    data: UpdateGameConfigInput
  ) {
    const config = await this.findConfig(category, key);

    // Validate value based on type
    this.validateConfigValue(
      data.value,
      config.valueType,
      config.minValue,
      config.maxValue
    );

    return this.db.gameConfig.update({
      where: { category_key: { category, key } },
      data: {
        value: data.value,
        description: data.description ?? config.description,
      },
    });
  }

  /**
   * Get all distinct categories
   */
  async getConfigCategories() {
    const results = await this.db.gameConfig.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return results.map(r => r.category);
  }

  private validateConfigValue(
    value: string,
    valueType: string,
    minValue: string | null,
    maxValue: string | null
  ) {
    switch (valueType) {
      case 'INT': {
        const num = parseInt(value, 10);
        if (isNaN(num)) {
          throw new BadRequestException(`Value must be an integer`);
        }
        if (minValue && num < parseInt(minValue, 10)) {
          throw new BadRequestException(`Value must be at least ${minValue}`);
        }
        if (maxValue && num > parseInt(maxValue, 10)) {
          throw new BadRequestException(`Value must be at most ${maxValue}`);
        }
        break;
      }
      case 'FLOAT': {
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new BadRequestException(`Value must be a number`);
        }
        if (minValue && num < parseFloat(minValue)) {
          throw new BadRequestException(`Value must be at least ${minValue}`);
        }
        if (maxValue && num > parseFloat(maxValue)) {
          throw new BadRequestException(`Value must be at most ${maxValue}`);
        }
        break;
      }
      case 'BOOL': {
        if (value !== 'true' && value !== 'false') {
          throw new BadRequestException(`Value must be 'true' or 'false'`);
        }
        break;
      }
      // STRING and JSON are not validated
    }
  }

  // ============================================
  // LevelDefinition Methods
  // ============================================

  /**
   * Get all level definitions
   */
  async findAllLevels() {
    return this.db.levelDefinition.findMany({
      orderBy: { level: 'asc' },
    });
  }

  /**
   * Get mortal levels (1-99)
   */
  async findMortalLevels() {
    return this.db.levelDefinition.findMany({
      where: { isImmortal: false },
      orderBy: { level: 'asc' },
    });
  }

  /**
   * Get immortal levels (100+)
   */
  async findImmortalLevels() {
    return this.db.levelDefinition.findMany({
      where: { isImmortal: true },
      orderBy: { level: 'asc' },
    });
  }

  /**
   * Get a single level definition
   */
  async findLevel(level: number) {
    const levelDef = await this.db.levelDefinition.findUnique({
      where: { level },
    });

    if (!levelDef) {
      throw new NotFoundException(`Level ${level} not found`);
    }

    return levelDef;
  }

  /**
   * Update a level definition
   */
  async updateLevel(level: number, data: UpdateLevelDefinitionInput) {
    await this.findLevel(level); // Ensure exists

    return this.db.levelDefinition.update({
      where: { level },
      data,
    });
  }

  // ============================================
  // SystemText Methods
  // ============================================

  /**
   * Get all system text entries
   */
  async findAllSystemText() {
    return this.db.systemText.findMany({
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });
  }

  /**
   * Get system text by category
   */
  async findSystemTextByCategory(category: string) {
    return this.db.systemText.findMany({
      where: { category: category as any },
      orderBy: { key: 'asc' },
    });
  }

  /**
   * Get a single system text entry
   */
  async findSystemText(id: number) {
    const text = await this.db.systemText.findUnique({
      where: { id },
    });

    if (!text) {
      throw new NotFoundException(`SystemText with ID ${id} not found`);
    }

    return text;
  }

  /**
   * Get system text by key
   */
  async findSystemTextByKey(key: string) {
    const text = await this.db.systemText.findUnique({
      where: { key },
    });

    if (!text) {
      throw new NotFoundException(`SystemText "${key}" not found`);
    }

    return text;
  }

  /**
   * Create a new system text entry
   */
  async createSystemText(data: CreateSystemTextInput) {
    const existing = await this.db.systemText.findUnique({
      where: { key: data.key },
    });

    if (existing) {
      throw new BadRequestException(`SystemText "${data.key}" already exists`);
    }

    return this.db.systemText.create({ data });
  }

  /**
   * Update a system text entry
   */
  async updateSystemText(id: number, data: UpdateSystemTextInput) {
    await this.findSystemText(id); // Ensure exists

    return this.db.systemText.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a system text entry
   */
  async deleteSystemText(id: number) {
    await this.findSystemText(id); // Ensure exists

    return this.db.systemText.delete({
      where: { id },
    });
  }

  // ============================================
  // LoginMessage Methods
  // ============================================

  /**
   * Get all login messages
   */
  async findAllLoginMessages() {
    return this.db.loginMessage.findMany({
      orderBy: [{ stage: 'asc' }, { variant: 'asc' }],
    });
  }

  /**
   * Get login messages by stage
   */
  async findLoginMessagesByStage(stage: LoginStage) {
    return this.db.loginMessage.findMany({
      where: { stage },
      orderBy: { variant: 'asc' },
    });
  }

  /**
   * Get a single login message
   */
  async findLoginMessage(id: number) {
    const message = await this.db.loginMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException(`LoginMessage with ID ${id} not found`);
    }

    return message;
  }

  /**
   * Create a new login message
   */
  async createLoginMessage(data: CreateLoginMessageInput) {
    const existing = await this.db.loginMessage.findUnique({
      where: { stage_variant: { stage: data.stage, variant: data.variant } },
    });

    if (existing) {
      throw new BadRequestException(
        `LoginMessage for ${data.stage} with variant "${data.variant}" already exists`
      );
    }

    return this.db.loginMessage.create({ data });
  }

  /**
   * Update a login message
   */
  async updateLoginMessage(id: number, data: UpdateLoginMessageInput) {
    await this.findLoginMessage(id); // Ensure exists

    return this.db.loginMessage.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a login message
   */
  async deleteLoginMessage(id: number) {
    await this.findLoginMessage(id); // Ensure exists

    return this.db.loginMessage.delete({
      where: { id },
    });
  }

  // ============================================
  // Command Methods
  // ============================================

  /**
   * Get all commands
   */
  async findAllCommands() {
    return this.db.command.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get commands by category
   */
  async findCommandsByCategory(category: CommandCategory) {
    return this.db.command.findMany({
      where: { category },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get immortal-only commands
   */
  async findImmortalCommands() {
    return this.db.command.findMany({
      where: { immortalOnly: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get a single command by name
   */
  async findCommand(name: string) {
    const command = await this.db.command.findUnique({
      where: { name },
    });

    if (!command) {
      throw new NotFoundException(`Command "${name}" not found`);
    }

    return command;
  }

  /**
   * Get all unique permission flags used across commands
   */
  async getAvailablePermissions(): Promise<string[]> {
    const commands = await this.db.command.findMany({
      select: { permissions: true },
    });

    const allPermissions = new Set<string>();
    for (const cmd of commands) {
      for (const perm of cmd.permissions) {
        allPermissions.add(perm);
      }
    }

    return Array.from(allPermissions).sort();
  }

  /**
   * Get all command categories
   */
  getCommandCategories(): CommandCategory[] {
    return Object.values(CommandCategory);
  }
}
