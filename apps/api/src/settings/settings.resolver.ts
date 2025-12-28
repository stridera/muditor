import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole, LoginStage, CommandCategory } from '@prisma/client';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { GameConfigDto } from './game-config.dto';
import { LevelDefinitionDto } from './level-definition.dto';
import { SystemTextDto } from './system-text.dto';
import { LoginMessageDto } from './login-message.dto';
import { CommandDto } from './command.dto';
import {
  UpdateGameConfigInput,
  UpdateLevelDefinitionInput,
  CreateSystemTextInput,
  UpdateSystemTextInput,
  CreateLoginMessageInput,
  UpdateLoginMessageInput,
} from './settings.input';
import { SettingsService } from './settings.service';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard, MinimumRoleGuard)
export class SettingsResolver {
  constructor(private readonly settingsService: SettingsService) {}

  // ============================================
  // GameConfig Queries & Mutations
  // ============================================

  @Query(() => [GameConfigDto], {
    name: 'gameConfigs',
    description: 'Get all game configuration entries',
  })
  @MinimumRole(UserRole.GOD)
  async findAllConfigs() {
    return this.settingsService.findAllConfigs();
  }

  @Query(() => [GameConfigDto], {
    name: 'gameConfigsByCategory',
    description: 'Get configuration entries by category',
  })
  @MinimumRole(UserRole.GOD)
  async findConfigsByCategory(@Args('category') category: string) {
    return this.settingsService.findConfigsByCategory(category);
  }

  @Query(() => GameConfigDto, {
    name: 'gameConfig',
    description: 'Get a single configuration entry',
  })
  @MinimumRole(UserRole.GOD)
  async findConfig(
    @Args('category') category: string,
    @Args('key') key: string
  ) {
    return this.settingsService.findConfig(category, key);
  }

  @Query(() => [String], {
    name: 'gameConfigCategories',
    description: 'Get all distinct configuration categories',
  })
  @MinimumRole(UserRole.GOD)
  async getConfigCategories() {
    return this.settingsService.getConfigCategories();
  }

  @Mutation(() => GameConfigDto, {
    name: 'updateGameConfig',
    description: 'Update a game configuration value',
  })
  @MinimumRole(UserRole.GOD)
  async updateConfig(
    @Args('category') category: string,
    @Args('key') key: string,
    @Args('data') data: UpdateGameConfigInput
  ) {
    return this.settingsService.updateConfig(category, key, data);
  }

  // ============================================
  // LevelDefinition Queries & Mutations
  // ============================================

  @Query(() => [LevelDefinitionDto], {
    name: 'levelDefinitions',
    description: 'Get all level definitions',
  })
  @MinimumRole(UserRole.GOD)
  async findAllLevels() {
    return this.settingsService.findAllLevels();
  }

  @Query(() => [LevelDefinitionDto], {
    name: 'mortalLevels',
    description: 'Get mortal level definitions (1-99)',
  })
  @MinimumRole(UserRole.GOD)
  async findMortalLevels() {
    return this.settingsService.findMortalLevels();
  }

  @Query(() => [LevelDefinitionDto], {
    name: 'immortalLevels',
    description: 'Get immortal level definitions (100+)',
  })
  @MinimumRole(UserRole.GOD)
  async findImmortalLevels() {
    return this.settingsService.findImmortalLevels();
  }

  @Query(() => LevelDefinitionDto, {
    name: 'levelDefinition',
    description: 'Get a single level definition',
  })
  @MinimumRole(UserRole.GOD)
  async findLevel(@Args('level', { type: () => Int }) level: number) {
    return this.settingsService.findLevel(level);
  }

  @Mutation(() => LevelDefinitionDto, {
    name: 'updateLevelDefinition',
    description: 'Update a level definition',
  })
  @MinimumRole(UserRole.GOD)
  async updateLevel(
    @Args('level', { type: () => Int }) level: number,
    @Args('data') data: UpdateLevelDefinitionInput
  ) {
    return this.settingsService.updateLevel(level, data);
  }

  // ============================================
  // SystemText Queries & Mutations
  // ============================================

  @Query(() => [SystemTextDto], {
    name: 'systemTexts',
    description: 'Get all system text entries',
  })
  @MinimumRole(UserRole.GOD)
  async findAllSystemText() {
    return this.settingsService.findAllSystemText();
  }

  @Query(() => [SystemTextDto], {
    name: 'systemTextsByCategory',
    description: 'Get system text entries by category',
  })
  @MinimumRole(UserRole.GOD)
  async findSystemTextByCategory(@Args('category') category: string) {
    return this.settingsService.findSystemTextByCategory(category);
  }

  @Query(() => SystemTextDto, {
    name: 'systemText',
    description: 'Get a single system text entry by ID',
  })
  @MinimumRole(UserRole.GOD)
  async findSystemText(@Args('id', { type: () => ID }) id: string | number) {
    return this.settingsService.findSystemText(Number(id));
  }

  @Query(() => SystemTextDto, {
    name: 'systemTextByKey',
    description: 'Get system text by key',
  })
  @MinimumRole(UserRole.GOD)
  async findSystemTextByKey(@Args('key') key: string) {
    return this.settingsService.findSystemTextByKey(key);
  }

  @Mutation(() => SystemTextDto, {
    name: 'createSystemText',
    description: 'Create a new system text entry',
  })
  @MinimumRole(UserRole.GOD)
  async createSystemText(@Args('data') data: CreateSystemTextInput) {
    return this.settingsService.createSystemText(data);
  }

  @Mutation(() => SystemTextDto, {
    name: 'updateSystemText',
    description: 'Update a system text entry',
  })
  @MinimumRole(UserRole.GOD)
  async updateSystemText(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateSystemTextInput
  ) {
    return this.settingsService.updateSystemText(Number(id), data);
  }

  @Mutation(() => Boolean, {
    name: 'deleteSystemText',
    description: 'Delete a system text entry',
  })
  @MinimumRole(UserRole.GOD)
  async deleteSystemText(@Args('id', { type: () => ID }) id: string | number) {
    await this.settingsService.deleteSystemText(Number(id));
    return true;
  }

  // ============================================
  // LoginMessage Queries & Mutations
  // ============================================

  @Query(() => [LoginMessageDto], {
    name: 'loginMessages',
    description: 'Get all login messages',
  })
  @MinimumRole(UserRole.GOD)
  async findAllLoginMessages() {
    return this.settingsService.findAllLoginMessages();
  }

  @Query(() => [LoginMessageDto], {
    name: 'loginMessagesByStage',
    description: 'Get login messages by stage',
  })
  @MinimumRole(UserRole.GOD)
  async findLoginMessagesByStage(
    @Args('stage', { type: () => LoginStage }) stage: LoginStage
  ) {
    return this.settingsService.findLoginMessagesByStage(stage);
  }

  @Query(() => LoginMessageDto, {
    name: 'loginMessage',
    description: 'Get a single login message',
  })
  @MinimumRole(UserRole.GOD)
  async findLoginMessage(@Args('id', { type: () => ID }) id: string | number) {
    return this.settingsService.findLoginMessage(Number(id));
  }

  @Mutation(() => LoginMessageDto, {
    name: 'createLoginMessage',
    description: 'Create a new login message',
  })
  @MinimumRole(UserRole.GOD)
  async createLoginMessage(@Args('data') data: CreateLoginMessageInput) {
    return this.settingsService.createLoginMessage(data);
  }

  @Mutation(() => LoginMessageDto, {
    name: 'updateLoginMessage',
    description: 'Update a login message',
  })
  @MinimumRole(UserRole.GOD)
  async updateLoginMessage(
    @Args('id', { type: () => ID }) id: string | number,
    @Args('data') data: UpdateLoginMessageInput
  ) {
    return this.settingsService.updateLoginMessage(Number(id), data);
  }

  @Mutation(() => Boolean, {
    name: 'deleteLoginMessage',
    description: 'Delete a login message',
  })
  @MinimumRole(UserRole.GOD)
  async deleteLoginMessage(
    @Args('id', { type: () => ID }) id: string | number
  ) {
    await this.settingsService.deleteLoginMessage(Number(id));
    return true;
  }

  // ============================================
  // Command Queries
  // ============================================

  @Query(() => [CommandDto], {
    name: 'commands',
    description: 'Get all command definitions',
  })
  @MinimumRole(UserRole.GOD)
  async findAllCommands() {
    return this.settingsService.findAllCommands();
  }

  @Query(() => [CommandDto], {
    name: 'commandsByCategory',
    description: 'Get commands by category',
  })
  @MinimumRole(UserRole.GOD)
  async findCommandsByCategory(
    @Args('category', { type: () => CommandCategory }) category: CommandCategory
  ) {
    return this.settingsService.findCommandsByCategory(category);
  }

  @Query(() => [CommandDto], {
    name: 'immortalCommands',
    description: 'Get all immortal-only commands',
  })
  @MinimumRole(UserRole.GOD)
  async findImmortalCommands() {
    return this.settingsService.findImmortalCommands();
  }

  @Query(() => CommandDto, {
    name: 'command',
    description: 'Get a single command by name',
  })
  @MinimumRole(UserRole.GOD)
  async findCommand(@Args('name') name: string) {
    return this.settingsService.findCommand(name);
  }

  @Query(() => [String], {
    name: 'availablePermissions',
    description: 'Get all unique permission flags used across commands',
  })
  @MinimumRole(UserRole.GOD)
  async getAvailablePermissions() {
    return this.settingsService.getAvailablePermissions();
  }

  @Query(() => [CommandCategory], {
    name: 'commandCategories',
    description: 'Get all command categories',
  })
  @MinimumRole(UserRole.GOD)
  getCommandCategories() {
    return this.settingsService.getCommandCategories();
  }
}
