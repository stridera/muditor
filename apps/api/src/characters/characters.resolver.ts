import { UseGuards } from '@nestjs/common';
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
import type { Users } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
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

@Resolver(() => CharacterDto)
@UseGuards(GraphQLJwtAuthGuard)
export class CharactersResolver {
  constructor(private readonly charactersService: CharactersService) {}

  // Map Prisma's stamina/staminaMax to the GraphQL movement/movementMax fields
  @ResolveField(() => Int, { name: 'movement' })
  resolveMovement(@Parent() character: any): number {
    return character.stamina ?? character.movement ?? 0;
  }

  @ResolveField(() => Int, { name: 'movementMax' })
  resolveMovementMax(@Parent() character: any): number {
    return character.staminaMax ?? character.movementMax ?? 0;
  }

  // Map Prisma's wealth (single BigInt in copper) to individual denomination fields
  // 1 platinum = 1000 copper, 1 gold = 100 copper, 1 silver = 10 copper
  @ResolveField(() => Int, { name: 'copper' })
  resolveCopper(@Parent() character: any): number {
    return Number(character.wealth ?? 0) % 10;
  }

  @ResolveField(() => Int, { name: 'silver' })
  resolveSilver(@Parent() character: any): number {
    return Math.floor(Number(character.wealth ?? 0) / 10) % 10;
  }

  @ResolveField(() => Int, { name: 'gold' })
  resolveGold(@Parent() character: any): number {
    return Math.floor(Number(character.wealth ?? 0) / 100) % 10;
  }

  @ResolveField(() => Int, { name: 'platinum' })
  resolvePlatinum(@Parent() character: any): number {
    return Math.floor(Number(character.wealth ?? 0) / 1000);
  }

  @ResolveField(() => Int, { name: 'bankCopper' })
  resolveBankCopper(@Parent() character: any): number {
    return Number(character.bankWealth ?? 0) % 10;
  }

  @ResolveField(() => Int, { name: 'bankSilver' })
  resolveBankSilver(@Parent() character: any): number {
    return Math.floor(Number(character.bankWealth ?? 0) / 10) % 10;
  }

  @ResolveField(() => Int, { name: 'bankGold' })
  resolveBankGold(@Parent() character: any): number {
    return Math.floor(Number(character.bankWealth ?? 0) / 100) % 10;
  }

  @ResolveField(() => Int, { name: 'bankPlatinum' })
  resolveBankPlatinum(@Parent() character: any): number {
    return Math.floor(Number(character.bankWealth ?? 0) / 1000);
  }

  // Map Prisma's 'permissions' array to DTO's 'privilegeFlags'
  @ResolveField(() => [String], { name: 'privilegeFlags', nullable: true })
  resolvePrivilegeFlags(@Parent() character: any): string[] {
    return character.permissions ?? character.privilegeFlags ?? [];
  }

  // Map Prisma's currentRoomId to DTO's currentRoom
  @ResolveField(() => Int, { name: 'currentRoom', nullable: true })
  resolveCurrentRoom(@Parent() character: any): number | null {
    return character.currentRoomId ?? character.currentRoom ?? null;
  }

  // Map Prisma's recallRoomId to DTO's saveRoom/homeRoom
  @ResolveField(() => Int, { name: 'saveRoom', nullable: true })
  resolveSaveRoom(@Parent() character: any): number | null {
    return character.recallRoomId ?? character.saveRoom ?? null;
  }

  @ResolveField(() => Int, { name: 'homeRoom', nullable: true })
  resolveHomeRoom(@Parent() character: any): number | null {
    return character.recallRoomId ?? character.homeRoom ?? null;
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
    return this.charactersService.createCharacter(data, user.id);
  }

  @Mutation(() => CharacterDto)
  async updateCharacter(
    @Args('id', { type: () => ID }) id: string,
    @Args('data') data: UpdateCharacterInput
  ) {
    return this.charactersService.updateCharacter(id, data);
  }

  @Mutation(() => CharacterDto)
  async deleteCharacter(@Args('id', { type: () => ID }) id: string) {
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
  async createCharacterItem(@Args('data') data: CreateCharacterItemInput) {
    return this.charactersService.createCharacterItem(data);
  }

  @Mutation(() => CharacterItemDto)
  async updateCharacterItem(
    @Args('id', { type: () => ID }) id: number,
    @Args('data') data: UpdateCharacterItemInput
  ) {
    return this.charactersService.updateCharacterItem(id, data);
  }

  @Mutation(() => Boolean)
  async deleteCharacterItem(@Args('id', { type: () => ID }) id: number) {
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
  async createCharacterEffect(@Args('data') data: CreateCharacterEffectInput) {
    return this.charactersService.createCharacterEffect(data);
  }

  @Mutation(() => CharacterEffectDto)
  async updateCharacterEffect(
    @Args('id', { type: () => ID }) id: number,
    @Args('data') data: UpdateCharacterEffectInput
  ) {
    return this.charactersService.updateCharacterEffect(id, data);
  }

  @Mutation(() => Boolean)
  async deleteCharacterEffect(@Args('id', { type: () => ID }) id: number) {
    await this.charactersService.deleteCharacterEffect(id);
    return true;
  }

  @Mutation(() => Int, {
    description: 'Remove expired effects for a character or all characters',
  })
  async removeExpiredEffects(
    @Args('characterId', { type: () => ID, nullable: true })
    characterId?: string
  ) {
    const result =
      await this.charactersService.removeExpiredEffects(characterId);
    return result.count;
  }

  // Character linking operations
  @Query(() => CharacterLinkingInfoDto, { name: 'characterLinkingInfo' })
  async getCharacterLinkingInfo(@Args('characterName') characterName: string) {
    return this.charactersService.getCharacterLinkingInfo(characterName);
  }

  @Mutation(() => CharacterDto, {
    description: 'Link an existing game character to your user account',
  })
  @UseGuards(GraphQLJwtAuthGuard)
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

  @Query(() => Boolean, { name: 'validateCharacterPassword' })
  async validateCharacterPassword(
    @Args('characterName') characterName: string,
    @Args('password') password: string
  ) {
    return this.charactersService.validateCharacterPassword(
      characterName,
      password
    );
  }

  // Character online status queries
  @Query(() => [OnlineCharacterDto], { name: 'onlineCharacters' })
  async getOnlineCharacters(
    @Args('userId', { type: () => ID, nullable: true }) userId?: string
  ) {
    return this.charactersService.getOnlineCharacters(userId);
  }

  @Query(() => [OnlineCharacterDto], { name: 'myOnlineCharacters' })
  async getMyOnlineCharacters(@CurrentUser() user: Users) {
    return this.charactersService.getOnlineCharacters(user.id);
  }

  @Query(() => CharacterSessionInfoDto, { name: 'characterSessionInfo' })
  async getCharacterSessionInfo(
    @Args('characterId', { type: () => ID }) characterId: string
  ) {
    return this.charactersService.getCharacterSessionInfo(characterId);
  }

  // Character online status mutations
  @Mutation(() => Boolean, { name: 'setCharacterOnline' })
  async setCharacterOnline(
    @Args('characterId', { type: () => ID }) characterId: string
  ) {
    await this.charactersService.setCharacterOnline(characterId);
    return true;
  }

  @Mutation(() => Boolean, { name: 'setCharacterOffline' })
  async setCharacterOffline(
    @Args('characterId', { type: () => ID }) characterId: string
  ) {
    await this.charactersService.setCharacterOffline(characterId);
    return true;
  }

  @Mutation(() => Boolean, { name: 'updateCharacterActivity' })
  async updateCharacterActivity(
    @Args('characterId', { type: () => ID }) characterId: string
  ) {
    await this.charactersService.updateCharacterActivity(characterId);
    return true;
  }
}
