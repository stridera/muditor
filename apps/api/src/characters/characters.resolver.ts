import { UseGuards } from '@nestjs/common';
import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Users } from '@prisma/client';
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

  // Character queries
  @Query(() => [CharacterDto], { name: 'characters' })
  async findAllCharacters(
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ) {
    return this.charactersService.findAllCharacters(skip, take);
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
  async getCharactersCount() {
    return this.charactersService.getCharactersCount();
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
