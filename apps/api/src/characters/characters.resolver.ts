import { ForbiddenException, UseGuards } from '@nestjs/common';
import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserRole, type Characters, type Users } from '@muditor/db';
import { isStaff, roleAtLeast } from '../auth/role.util';
import { calculateRoleFromLevel } from '../users/services/role-calculator.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { RateLimit, RateLimitGuard } from '../bridge/rate-limit.guard';
import {
  CharacterDto,
  CharacterEffectDto,
  CharacterItemDto,
  CharacterLinkingInfoDto,
  CharacterSessionInfoDto,
  OnlineCharacterDto,
} from './character.dto';
import {
  CharacterFilterInput,
  CreateCharacterEffectInput,
  CreateCharacterInput,
  CreateCharacterItemInput,
  LinkCharacterInput,
  UnlinkCharacterInput,
  UpdateCharacterEffectInput,
  UpdateCharacterInput,
  UpdateCharacterItemInput,
} from './character.input';
import { CharactersService } from './characters.service';

/**
 * Fields of UpdateCharacterInput that the owner of a character may change on
 * their own character. Everything else (level, stats, resources, location,
 * flags, privilegeFlags, invisLevel, race, classId, ...) is staff-only (IMMORTAL+). This is an
 * allowlist so newly added input fields default to staff-only.
 */
export const SELF_EDITABLE_CHARACTER_FIELDS: ReadonlySet<string> = new Set([
  'name',
  'gender',
  'description',
  'title',
  'prompt',
  'height',
  'weight',
]);

@Resolver(() => CharacterDto)
@UseGuards(GraphQLJwtAuthGuard)
export class CharactersResolver {
  constructor(private readonly charactersService: CharactersService) {}

  /** Throws unless the caller is IMMORTAL+ or owns the character. */
  private async assertOwnerOrStaff(
    user: Users,
    characterId: string
  ): Promise<void> {
    if (isStaff(user.role)) return;
    const ownerId =
      await this.charactersService.findCharacterOwnerId(characterId);
    if (ownerId !== user.id) {
      throw new ForbiddenException('You do not have access to this character');
    }
  }

  /**
   * Role-escalation guard. A character's level drives its owner's account role,
   * so a caller may never set a level that maps to a role above their own, and
   * only IMPLEMENTOR may set any staff level (>= 100).
   */
  private assertMayAssignLevel(user: Users, level: number | undefined): void {
    if (level === undefined || level === null) return;
    const targetRole = calculateRoleFromLevel(level);
    if (
      !roleAtLeast(user.role, targetRole) ||
      (level >= 100 && user.role !== UserRole.IMPLEMENTOR)
    ) {
      throw new ForbiddenException(
        'You may not set a character level that grants a role above your own'
      );
    }
  }

  private assertStaff(user: Users): void {
    if (!isStaff(user.role)) {
      throw new ForbiddenException('Immortal role or higher required');
    }
  }

  // userId links a game character to a web account; only the owner and staff may see it
  @ResolveField(() => String, { name: 'userId', nullable: true })
  resolveUserId(
    @Parent() character: Characters,
    @CurrentUser() user: Users
  ): string | null {
    if (!user) return null;
    if (isStaff(user.role) || character.userId === user.id) {
      return character.userId ?? null;
    }
    return null;
  }

  // Map Prisma's stamina/staminaMax to the GraphQL movement/movementMax fields
  @ResolveField(() => Int, { name: 'movement' })
  resolveMovement(@Parent() character: Characters): number {
    return character.stamina ?? 0;
  }

  @ResolveField(() => Int, { name: 'movementMax' })
  resolveMovementMax(@Parent() character: Characters): number {
    return character.staminaMax ?? 0;
  }

  // Map Prisma's wealth (single BigInt in copper) to individual denomination fields
  // 1 platinum = 1000 copper, 1 gold = 100 copper, 1 silver = 10 copper
  @ResolveField(() => Int, { name: 'copper' })
  resolveCopper(@Parent() character: Characters): number {
    return Number(character.wealth ?? 0) % 10;
  }

  @ResolveField(() => Int, { name: 'silver' })
  resolveSilver(@Parent() character: Characters): number {
    return Math.floor(Number(character.wealth ?? 0) / 10) % 10;
  }

  @ResolveField(() => Int, { name: 'gold' })
  resolveGold(@Parent() character: Characters): number {
    return Math.floor(Number(character.wealth ?? 0) / 100) % 10;
  }

  @ResolveField(() => Int, { name: 'platinum' })
  resolvePlatinum(@Parent() character: Characters): number {
    return Math.floor(Number(character.wealth ?? 0) / 1000);
  }

  @ResolveField(() => Int, { name: 'bankCopper' })
  resolveBankCopper(@Parent() character: Characters): number {
    return Number(character.bankWealth ?? 0) % 10;
  }

  @ResolveField(() => Int, { name: 'bankSilver' })
  resolveBankSilver(@Parent() character: Characters): number {
    return Math.floor(Number(character.bankWealth ?? 0) / 10) % 10;
  }

  @ResolveField(() => Int, { name: 'bankGold' })
  resolveBankGold(@Parent() character: Characters): number {
    return Math.floor(Number(character.bankWealth ?? 0) / 100) % 10;
  }

  @ResolveField(() => Int, { name: 'bankPlatinum' })
  resolveBankPlatinum(@Parent() character: Characters): number {
    return Math.floor(Number(character.bankWealth ?? 0) / 1000);
  }

  // Map Prisma's 'permissions' array to DTO's 'privilegeFlags'
  @ResolveField(() => [String], { name: 'privilegeFlags', nullable: true })
  resolvePrivilegeFlags(@Parent() character: Characters): string[] {
    return character.permissions ?? [];
  }

  // Class display name, resolved from classId (CharacterClass.plainName)
  @ResolveField(() => String, { name: 'class', nullable: true })
  async resolveClass(@Parent() character: Characters): Promise<string | null> {
    if (character.classId == null) return null;
    return this.charactersService.findClassName(character.classId);
  }

  // Map Prisma's currentRoomId to DTO's currentRoom
  @ResolveField(() => Int, { name: 'currentRoom', nullable: true })
  resolveCurrentRoom(@Parent() character: Characters): number | null {
    return character.currentRoomId ?? null;
  }

  // Map Prisma's recallRoomId to DTO's saveRoom/homeRoom
  @ResolveField(() => Int, { name: 'saveRoom', nullable: true })
  resolveSaveRoom(@Parent() character: Characters): number | null {
    return character.recallRoomId ?? null;
  }

  @ResolveField(() => Int, { name: 'homeRoom', nullable: true })
  resolveHomeRoom(@Parent() character: Characters): number | null {
    return character.recallRoomId ?? null;
  }

  // Character queries
  @Query(() => [CharacterDto], { name: 'characters' })
  async findAllCharacters(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number,
    @Args('filter', { nullable: true }) filter?: CharacterFilterInput
  ) {
    return this.charactersService.findAllCharacters(skip, take, filter);
  }

  @Query(() => CharacterDto, { name: 'character' })
  async findCharacterById(@Args('id', { type: () => ID }) id: string) {
    return this.charactersService.findCharacterById(id);
  }

  @Query(() => [CharacterDto], { name: 'myCharacters' })
  async findMyCharacters(@CurrentUser() user: Users) {
    return this.charactersService.findCharactersByUser(user.id);
  }

  @Query(() => Int, { name: 'charactersCount' })
  async getCharactersCount(
    @Args('filter', { nullable: true }) filter?: CharacterFilterInput
  ) {
    return this.charactersService.getCharactersCount(filter);
  }

  // Character mutations
  @Mutation(() => CharacterDto)
  async createCharacter(
    @Args('data') data: CreateCharacterInput,
    @CurrentUser() user: Users
  ) {
    this.assertMayAssignLevel(user, data.level);
    // Level drives the derived account role; players may only start at level 1.
    if (!isStaff(user.role) && data.level !== 1) {
      throw new ForbiddenException(
        'Only staff may create characters above level 1'
      );
    }
    return this.charactersService.createCharacter(data, user.id, {
      isStaff: isStaff(user.role),
    });
  }

  @Mutation(() => CharacterDto)
  async updateCharacter(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateCharacterInput,
    @CurrentUser() user: Users
  ) {
    await this.assertOwnerOrStaff(user, id);
    this.assertMayAssignLevel(user, data.level);
    if (!isStaff(user.role)) {
      const forbidden = Object.entries(data)
        .filter(
          ([key, value]) =>
            value !== undefined && !SELF_EDITABLE_CHARACTER_FIELDS.has(key)
        )
        .map(([key]) => key);
      if (forbidden.length > 0) {
        throw new ForbiddenException(
          `Only staff may change: ${forbidden.join(', ')}`
        );
      }
    }
    return this.charactersService.updateCharacter(id, data, {
      isStaff: isStaff(user.role),
    });
  }

  @Mutation(() => CharacterDto)
  async deleteCharacter(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: Users
  ) {
    await this.assertOwnerOrStaff(user, id);
    return this.charactersService.deleteCharacter(id);
  }

  // Character Item queries
  @Query(() => [CharacterItemDto], { name: 'characterItems' })
  async findCharacterItems(
    @Args('characterId', { type: () => ID }) characterId: string
  ) {
    return this.charactersService.findCharacterItems(characterId);
  }

  @Query(() => CharacterItemDto, { name: 'characterItem' })
  async findCharacterItemById(@Args('id', { type: () => ID }) id: number) {
    return this.charactersService.findCharacterItemById(id);
  }

  // Character Item mutations
  @Mutation(() => CharacterItemDto)
  async createCharacterItem(
    @Args('data') data: CreateCharacterItemInput,
    @CurrentUser() user: Users
  ) {
    // Minting items from arbitrary object ids is staff-only, even on own characters.
    this.assertStaff(user);
    return this.charactersService.createCharacterItem(data);
  }

  @Mutation(() => CharacterItemDto)
  async updateCharacterItem(
    @Args('id', { type: () => ID }) id: number,
    @Args('data') data: UpdateCharacterItemInput,
    @CurrentUser() user: Users
  ) {
    this.assertStaff(user);
    return this.charactersService.updateCharacterItem(id, data);
  }

  @Mutation(() => Boolean)
  async deleteCharacterItem(
    @Args('id', { type: () => ID }) id: number,
    @CurrentUser() user: Users
  ) {
    this.assertStaff(user);
    await this.charactersService.deleteCharacterItem(id);
    return true;
  }

  // Character Effect queries
  @Query(() => [CharacterEffectDto], { name: 'characterEffects' })
  async findCharacterEffects(
    @Args('characterId', { type: () => ID }) characterId: string
  ) {
    return this.charactersService.findCharacterEffects(characterId);
  }

  @Query(() => [CharacterEffectDto], { name: 'activeCharacterEffects' })
  async findActiveCharacterEffects(
    @Args('characterId', { type: () => ID }) characterId: string
  ) {
    return this.charactersService.getActiveEffects(characterId);
  }

  @Query(() => CharacterEffectDto, { name: 'characterEffect' })
  async findCharacterEffectById(@Args('id', { type: () => ID }) id: number) {
    return this.charactersService.findCharacterEffectById(id);
  }

  // Character Effect mutations
  @Mutation(() => CharacterEffectDto)
  async createCharacterEffect(
    @Args('data') data: CreateCharacterEffectInput,
    @CurrentUser() user: Users
  ) {
    this.assertStaff(user);
    return this.charactersService.createCharacterEffect(data);
  }

  @Mutation(() => CharacterEffectDto)
  async updateCharacterEffect(
    @Args('id', { type: () => ID }) id: number,
    @Args('data') data: UpdateCharacterEffectInput,
    @CurrentUser() user: Users
  ) {
    this.assertStaff(user);
    return this.charactersService.updateCharacterEffect(id, data);
  }

  @Mutation(() => Boolean)
  async deleteCharacterEffect(
    @Args('id', { type: () => ID }) id: number,
    @CurrentUser() user: Users
  ) {
    this.assertStaff(user);
    await this.charactersService.deleteCharacterEffect(id);
    return true;
  }

  @Mutation(() => Int, {
    description: 'Remove expired effects for a character or all characters',
  })
  async removeExpiredEffects(
    @Args('characterId', { type: () => ID, nullable: true })
    characterId: string | undefined,
    @CurrentUser() user: Users
  ) {
    if (characterId) {
      await this.assertOwnerOrStaff(user, characterId);
    } else {
      this.assertStaff(user);
    }
    const result =
      await this.charactersService.removeExpiredEffects(characterId);
    return result.count;
  }

  // Character linking operations
  @Query(() => CharacterLinkingInfoDto, { name: 'characterLinkingInfo' })
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 30, windowSeconds: 60, keyPrefix: 'charlink:info' })
  async getCharacterLinkingInfo(@Args('characterName') characterName: string) {
    return this.charactersService.getCharacterLinkingInfo(characterName);
  }

  @Mutation(() => CharacterDto, {
    description: 'Link an existing game character to your user account',
  })
  @UseGuards(RateLimitGuard)
  @RateLimit({ limit: 5, windowSeconds: 60, keyPrefix: 'charlink:link' })
  async linkCharacter(
    @Args('data') data: LinkCharacterInput,
    @CurrentUser() user: Users
  ) {
    return this.charactersService.linkCharacterToUser(
      user.id,
      data.characterName,
      data.characterPassword
    );
  }

  @Mutation(() => Boolean, {
    description: 'Unlink a character from your user account',
  })
  @UseGuards(GraphQLJwtAuthGuard)
  async unlinkCharacter(
    @Args('data') data: UnlinkCharacterInput,
    @CurrentUser() user: Users
  ) {
    await this.charactersService.unlinkCharacterFromUser(
      data.characterId,
      user.id
    );
    return true;
  }

  // Character online status queries
  @Query(() => [OnlineCharacterDto], { name: 'onlineCharacters' })
  async getOnlineCharacters(
    @CurrentUser() user: Users,
    @Args('userId', { type: () => ID, nullable: true }) userId?: string
  ) {
    if (userId && userId !== user.id && !isStaff(user.role)) {
      throw new ForbiddenException(
        'You can only list your own online characters'
      );
    }
    return this.charactersService.getOnlineCharacters(userId);
  }

  @Query(() => [OnlineCharacterDto], { name: 'myOnlineCharacters' })
  async getMyOnlineCharacters(@CurrentUser() user: Users) {
    return this.charactersService.getOnlineCharacters(user.id);
  }

  @Query(() => CharacterSessionInfoDto, { name: 'characterSessionInfo' })
  async getCharacterSessionInfo(
    @Args('characterId', { type: () => ID }) characterId: string,
    @CurrentUser() user: Users
  ) {
    await this.assertOwnerOrStaff(user, characterId);
    return this.charactersService.getCharacterSessionInfo(characterId);
  }

  // Character online status mutations
  @Mutation(() => Boolean, { name: 'setCharacterOnline' })
  async setCharacterOnline(
    @Args('characterId', { type: () => ID }) characterId: string,
    @CurrentUser() user: Users
  ) {
    await this.assertOwnerOrStaff(user, characterId);
    await this.charactersService.setCharacterOnline(characterId);
    return true;
  }

  @Mutation(() => Boolean, { name: 'setCharacterOffline' })
  async setCharacterOffline(
    @Args('characterId', { type: () => ID }) characterId: string,
    @CurrentUser() user: Users
  ) {
    await this.assertOwnerOrStaff(user, characterId);
    await this.charactersService.setCharacterOffline(characterId);
    return true;
  }

  @Mutation(() => Boolean, { name: 'updateCharacterActivity' })
  async updateCharacterActivity(
    @Args('characterId', { type: () => ID }) characterId: string,
    @CurrentUser() user: Users
  ) {
    await this.assertOwnerOrStaff(user, characterId);
    await this.charactersService.updateCharacterActivity(characterId);
    return true;
  }
}
