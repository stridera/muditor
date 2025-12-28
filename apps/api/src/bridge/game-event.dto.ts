import { Field, ObjectType, registerEnumType, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

/**
 * Game event types published by FieryMUD
 */
export enum GameEventType {
  // Player lifecycle events
  PLAYER_LOGIN = 'PLAYER_LOGIN',
  PLAYER_LOGOUT = 'PLAYER_LOGOUT',
  PLAYER_DEATH = 'PLAYER_DEATH',
  PLAYER_LEVEL_UP = 'PLAYER_LEVEL_UP',
  PLAYER_QUIT = 'PLAYER_QUIT',
  PLAYER_ZONE_ENTER = 'PLAYER_ZONE_ENTER',

  // Communication channel events
  CHAT_GOSSIP = 'CHAT_GOSSIP',
  CHAT_SHOUT = 'CHAT_SHOUT',
  CHAT_OOC = 'CHAT_OOC',
  CHAT_CLAN = 'CHAT_CLAN',
  CHAT_GROUP = 'CHAT_GROUP',
  CHAT_TELL = 'CHAT_TELL',
  CHAT_SAY = 'CHAT_SAY',
  CHAT_EMOTE = 'CHAT_EMOTE',

  // Admin/system alerts
  ADMIN_CRASH = 'ADMIN_CRASH',
  ADMIN_ZONE_RESET = 'ADMIN_ZONE_RESET',
  ADMIN_WARNING = 'ADMIN_WARNING',
  ADMIN_SHUTDOWN = 'ADMIN_SHUTDOWN',
  ADMIN_BROADCAST = 'ADMIN_BROADCAST',

  // World events
  ZONE_LOADED = 'ZONE_LOADED',
  ZONE_RESET = 'ZONE_RESET',
  MOB_KILLED = 'MOB_KILLED',
  BOSS_SPAWN = 'BOSS_SPAWN',
  QUEST_COMPLETE = 'QUEST_COMPLETE',
}

registerEnumType(GameEventType, {
  name: 'GameEventType',
  description: 'Types of events published by the FieryMUD game server',
});

/**
 * Event categories for subscription filtering
 */
export enum GameEventCategory {
  PLAYER = 'player',
  CHAT = 'chat',
  ADMIN = 'admin',
  WORLD = 'world',
}

registerEnumType(GameEventCategory, {
  name: 'GameEventCategory',
  description: 'Categories of game events for subscription filtering',
});

/**
 * Game event DTO - matches the structure from FieryMUD's GameEvent
 */
@ObjectType({ description: 'A game event from FieryMUD' })
export class GameEvent {
  @Field(() => GameEventType)
  type!: GameEventType;

  @Field()
  timestamp!: Date;

  @Field({ nullable: true })
  playerName?: string;

  @Field(() => Int, { nullable: true })
  zoneId?: number;

  @Field(() => Int, { nullable: true })
  roomVnum?: number;

  @Field()
  message!: string;

  @Field({ nullable: true })
  targetPlayer?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, unknown>;
}

/**
 * Filter input for game event subscriptions
 */
@ObjectType({ description: 'Filter for game event subscriptions' })
export class GameEventFilter {
  @Field(() => [GameEventType], { nullable: true })
  types?: GameEventType[];

  @Field(() => [GameEventCategory], { nullable: true })
  categories?: GameEventCategory[];

  @Field({ nullable: true })
  playerName?: string;

  @Field(() => Int, { nullable: true })
  zoneId?: number;
}

/**
 * Determines the category of a game event type
 */
export function getEventCategory(type: GameEventType): GameEventCategory {
  if (type.startsWith('PLAYER_')) return GameEventCategory.PLAYER;
  if (type.startsWith('CHAT_')) return GameEventCategory.CHAT;
  if (type.startsWith('ADMIN_')) return GameEventCategory.ADMIN;
  return GameEventCategory.WORLD;
}
