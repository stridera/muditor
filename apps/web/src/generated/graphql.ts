/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  BigInt: { input: any; output: any };
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any };
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any };
};

export type Ability = {
  __typename?: 'Ability';
  abilityType: Scalars['String']['output'];
  castTimeRounds: Scalars['Int']['output'];
  combatOk: Scalars['Boolean']['output'];
  cooldownMs: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  damageType?: Maybe<ElementType>;
  description?: Maybe<Scalars['String']['output']>;
  effects?: Maybe<Array<AbilityEffect>>;
  humanoidOnly: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  inCombatOnly: Scalars['Boolean']['output'];
  isArea: Scalars['Boolean']['output'];
  luaScript?: Maybe<Scalars['String']['output']>;
  memorizationTime: Scalars['Int']['output'];
  messages?: Maybe<AbilityMessages>;
  minPosition: Position;
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  pages?: Maybe<Scalars['Int']['output']>;
  questOnly: Scalars['Boolean']['output'];
  restrictions?: Maybe<AbilityRestrictions>;
  savingThrows?: Maybe<Array<AbilitySavingThrow>>;
  school?: Maybe<AbilitySchool>;
  schoolId?: Maybe<Scalars['Int']['output']>;
  sphere?: Maybe<SpellSphere>;
  tags: Array<Scalars['String']['output']>;
  targeting?: Maybe<AbilityTargeting>;
  updatedAt: Scalars['DateTime']['output'];
  violent: Scalars['Boolean']['output'];
};

export type AbilityEffect = {
  __typename?: 'AbilityEffect';
  abilityId: Scalars['ID']['output'];
  chancePct: Scalars['Int']['output'];
  condition?: Maybe<Scalars['String']['output']>;
  effect: Effect;
  effectId: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  overrideParams?: Maybe<Scalars['JSON']['output']>;
  trigger?: Maybe<Scalars['String']['output']>;
};

export type AbilityEffectItemInput = {
  chancePct?: Scalars['Int']['input'];
  condition?: InputMaybe<Scalars['String']['input']>;
  effectId: Scalars['Int']['input'];
  order: Scalars['Int']['input'];
  overrideParams?: InputMaybe<Scalars['JSON']['input']>;
  trigger?: InputMaybe<Scalars['String']['input']>;
};

export type AbilityMessages = {
  __typename?: 'AbilityMessages';
  failToCaster?: Maybe<Scalars['String']['output']>;
  failToRoom?: Maybe<Scalars['String']['output']>;
  failToVictim?: Maybe<Scalars['String']['output']>;
  lookMessage?: Maybe<Scalars['String']['output']>;
  startToCaster?: Maybe<Scalars['String']['output']>;
  startToRoom?: Maybe<Scalars['String']['output']>;
  startToVictim?: Maybe<Scalars['String']['output']>;
  successSelfRoom?: Maybe<Scalars['String']['output']>;
  successToCaster?: Maybe<Scalars['String']['output']>;
  successToRoom?: Maybe<Scalars['String']['output']>;
  successToSelf?: Maybe<Scalars['String']['output']>;
  successToVictim?: Maybe<Scalars['String']['output']>;
  wearoffToRoom?: Maybe<Scalars['String']['output']>;
  wearoffToTarget?: Maybe<Scalars['String']['output']>;
};

export type AbilityRestrictions = {
  __typename?: 'AbilityRestrictions';
  customRequirementLua?: Maybe<Scalars['String']['output']>;
  requirements: Array<Scalars['JSON']['output']>;
};

export type AbilitySavingThrow = {
  __typename?: 'AbilitySavingThrow';
  dcFormula: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  onSaveAction: Scalars['JSON']['output'];
  saveType: SaveType;
};

export type AbilitySchool = {
  __typename?: 'AbilitySchool';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type AbilityTargeting = {
  __typename?: 'AbilityTargeting';
  maxTargets: Scalars['Int']['output'];
  range: Scalars['Int']['output'];
  requireLos: Scalars['Boolean']['output'];
  scope: TargetScope;
  scopePattern?: Maybe<Scalars['String']['output']>;
  validTargets: Array<TargetType>;
};

export type AccountItemCharacterDto = {
  __typename?: 'AccountItemCharacterDto';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type AccountItemDto = {
  __typename?: 'AccountItemDto';
  customData?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  object: AccountItemObjectDto;
  objectId: Scalars['Int']['output'];
  objectZoneId: Scalars['Int']['output'];
  quantity: Scalars['Int']['output'];
  slot: Scalars['Int']['output'];
  storedAt: Scalars['DateTime']['output'];
  storedByCharacter?: Maybe<AccountItemCharacterDto>;
  storedByCharacterId?: Maybe<Scalars['String']['output']>;
};

export type AccountItemObjectDto = {
  __typename?: 'AccountItemObjectDto';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  type?: Maybe<Scalars['String']['output']>;
  zoneId: Scalars['Int']['output'];
};

export type AccountMailDto = {
  __typename?: 'AccountMailDto';
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  isBroadcast: Scalars['Boolean']['output'];
  isDeleted: Scalars['Boolean']['output'];
  readAt?: Maybe<Scalars['DateTime']['output']>;
  recipient?: Maybe<AccountMailUserDto>;
  recipientUserId?: Maybe<Scalars['String']['output']>;
  sender?: Maybe<AccountMailUserDto>;
  senderName: Scalars['String']['output'];
  senderUserId: Scalars['String']['output'];
  sentAt: Scalars['DateTime']['output'];
  subject: Scalars['String']['output'];
};

export type AccountMailFilterInput = {
  includeBroadcasts?: InputMaybe<Scalars['Boolean']['input']>;
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  recipientUserId?: InputMaybe<Scalars['String']['input']>;
  searchBody?: InputMaybe<Scalars['String']['input']>;
  searchSubject?: InputMaybe<Scalars['String']['input']>;
  senderUserId?: InputMaybe<Scalars['String']['input']>;
};

export type AccountMailUserDto = {
  __typename?: 'AccountMailUserDto';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type AccountStorageDto = {
  __typename?: 'AccountStorageDto';
  accountWealth: Scalars['BigInt']['output'];
  items: Array<AccountItemDto>;
};

export type AdminUser = {
  __typename?: 'AdminUser';
  id: Scalars['ID']['output'];
  role: UserRole;
  username: Scalars['String']['output'];
};

export type AssignSkillToClassInput = {
  abilityId: Scalars['Int']['input'];
  classId: Scalars['Int']['input'];
  minLevel?: Scalars['Int']['input'];
};

export type AssignSkillToRaceInput = {
  abilityId: Scalars['Int']['input'];
  bonus?: Scalars['Int']['input'];
  category?: SkillCategory;
  race: Race;
};

export type AttachTriggerInput = {
  attachType: ScriptType;
  mobId?: InputMaybe<Scalars['Int']['input']>;
  objectId?: InputMaybe<Scalars['Int']['input']>;
  triggerId: Scalars['Int']['input'];
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  accessToken: Scalars['String']['output'];
  user: User;
};

export type BanRecord = {
  __typename?: 'BanRecord';
  active: Scalars['Boolean']['output'];
  /** The admin who issued the ban */
  admin?: Maybe<AdminUser>;
  bannedAt: Scalars['DateTime']['output'];
  bannedBy: Scalars['ID']['output'];
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  reason: Scalars['String']['output'];
  unbannedAt?: Maybe<Scalars['DateTime']['output']>;
  unbannedBy?: Maybe<Scalars['ID']['output']>;
  /** The admin who lifted the ban */
  unbanner?: Maybe<AdminUser>;
  userId: Scalars['ID']['output'];
};

export type BanUserInput = {
  /** ISO string for ban expiration. If not provided, ban is permanent */
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  reason: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};

export type BatchRoomPositionUpdateInput = {
  layoutX?: InputMaybe<Scalars['Int']['input']>;
  layoutY?: InputMaybe<Scalars['Int']['input']>;
  layoutZ?: InputMaybe<Scalars['Int']['input']>;
  roomId: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type BatchUpdateResult = {
  __typename?: 'BatchUpdateResult';
  errors?: Maybe<Array<Scalars['String']['output']>>;
  updatedCount: Scalars['Int']['output'];
};

export type BatchUpdateRoomPositionsInput = {
  updates: Array<BatchRoomPositionUpdateInput>;
};

export type BoardDto = {
  __typename?: 'BoardDto';
  alias: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  locked: Scalars['Boolean']['output'];
  messageCount?: Maybe<Scalars['Int']['output']>;
  messages?: Maybe<Array<BoardMessageDto>>;
  privileges: Scalars['JSON']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BoardMessageDto = {
  __typename?: 'BoardMessageDto';
  board?: Maybe<BoardDto>;
  boardId: Scalars['Int']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  edits?: Maybe<Array<BoardMessageEditDto>>;
  id: Scalars['Int']['output'];
  postedAt: Scalars['DateTime']['output'];
  poster: Scalars['String']['output'];
  posterLevel: Scalars['Int']['output'];
  sticky: Scalars['Boolean']['output'];
  subject: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type BoardMessageEditDto = {
  __typename?: 'BoardMessageEditDto';
  editedAt: Scalars['DateTime']['output'];
  editor: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  messageId: Scalars['Int']['output'];
};

/** Bridge connection status */
export type BridgeStatus = {
  __typename?: 'BridgeStatus';
  connected: Scalars['Boolean']['output'];
  subscribedChannels: Scalars['Int']['output'];
};

/** Result of broadcasting a message */
export type BroadcastResultType = {
  __typename?: 'BroadcastResultType';
  message: Scalars['String']['output'];
  recipientCount: Scalars['Int']['output'];
  success: Scalars['Boolean']['output'];
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type CharacterDto = {
  __typename?: 'CharacterDto';
  alignment: Scalars['Int']['output'];
  armorClass: Scalars['Int']['output'];
  bankCopper: Scalars['Int']['output'];
  bankGold: Scalars['Int']['output'];
  bankPlatinum: Scalars['Int']['output'];
  bankSilver: Scalars['Int']['output'];
  baseSize: Scalars['Int']['output'];
  birthTime: Scalars['DateTime']['output'];
  characterEffects?: Maybe<Array<CharacterEffectDto>>;
  characterItems?: Maybe<Array<CharacterItemDto>>;
  charisma: Scalars['Int']['output'];
  classId?: Maybe<Scalars['Int']['output']>;
  constitution: Scalars['Int']['output'];
  copper: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentRoom?: Maybe<Scalars['Int']['output']>;
  currentSize: Scalars['Int']['output'];
  damageRoll: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  dexterity: Scalars['Int']['output'];
  effectFlags: Array<Scalars['String']['output']>;
  experience: Scalars['Int']['output'];
  gender: Scalars['String']['output'];
  gold: Scalars['Int']['output'];
  height?: Maybe<Scalars['Int']['output']>;
  hitPoints: Scalars['Int']['output'];
  hitPointsMax: Scalars['Int']['output'];
  hitRoll: Scalars['Int']['output'];
  homeRoom?: Maybe<Scalars['Int']['output']>;
  hunger: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  intelligence: Scalars['Int']['output'];
  invisLevel: Scalars['Int']['output'];
  isOnline: Scalars['Boolean']['output'];
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  level: Scalars['Int']['output'];
  luck: Scalars['Int']['output'];
  movement: Scalars['Int']['output'];
  movementMax: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  olcZones: Array<Scalars['Int']['output']>;
  pageLength: Scalars['Int']['output'];
  platinum: Scalars['Int']['output'];
  playerClass?: Maybe<Scalars['String']['output']>;
  playerFlags: Array<Scalars['String']['output']>;
  privilegeFlags: Array<Scalars['String']['output']>;
  prompt: Scalars['String']['output'];
  raceId: Scalars['Int']['output'];
  raceType?: Maybe<Scalars['String']['output']>;
  saveRoom?: Maybe<Scalars['Int']['output']>;
  silver: Scalars['Int']['output'];
  skillPoints: Scalars['Int']['output'];
  strength: Scalars['Int']['output'];
  thirst: Scalars['Int']['output'];
  timePlayed: Scalars['Int']['output'];
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['String']['output'];
  weight?: Maybe<Scalars['Int']['output']>;
  wisdom: Scalars['Int']['output'];
};

export type CharacterEffectDto = {
  __typename?: 'CharacterEffectDto';
  appliedAt: Scalars['DateTime']['output'];
  character: CharacterDto;
  characterId: Scalars['String']['output'];
  duration?: Maybe<Scalars['Int']['output']>;
  effectName: Scalars['String']['output'];
  effectType?: Maybe<Scalars['String']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  modifierData: Scalars['JSON']['output'];
  sourceId?: Maybe<Scalars['Int']['output']>;
  sourceType?: Maybe<Scalars['String']['output']>;
  strength: Scalars['Int']['output'];
};

export type CharacterFilterInput = {
  isOnline?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  playerClass?: InputMaybe<Scalars['String']['input']>;
  raceType?: InputMaybe<Scalars['String']['input']>;
};

export type CharacterItemDto = {
  __typename?: 'CharacterItemDto';
  characterId: Scalars['String']['output'];
  characters: CharacterDto;
  charges: Scalars['Int']['output'];
  condition: Scalars['Int']['output'];
  containedItems: Array<CharacterItemDto>;
  container?: Maybe<CharacterItemDto>;
  containerId?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  customLongDesc?: Maybe<Scalars['String']['output']>;
  customShortDesc?: Maybe<Scalars['String']['output']>;
  customValues: Scalars['JSON']['output'];
  equippedLocation?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  instanceFlags: Array<Scalars['String']['output']>;
  objectPrototypeId: Scalars['Int']['output'];
  objects: ObjectSummaryDto;
  updatedAt: Scalars['DateTime']['output'];
};

export type CharacterLinkingInfoDto = {
  __typename?: 'CharacterLinkingInfoDto';
  class?: Maybe<Scalars['String']['output']>;
  hasPassword: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isLinked: Scalars['Boolean']['output'];
  isOnline: Scalars['Boolean']['output'];
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  race?: Maybe<Scalars['String']['output']>;
  timePlayed: Scalars['Int']['output'];
};

export type CharacterSessionInfoDto = {
  __typename?: 'CharacterSessionInfoDto';
  currentSessionTime: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isOnline: Scalars['Boolean']['output'];
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  totalTimePlayed: Scalars['Int']['output'];
};

export type CircleSpellDto = {
  __typename?: 'CircleSpellDto';
  id: Scalars['ID']['output'];
  minLevel?: Maybe<Scalars['Int']['output']>;
  proficiencyGain?: Maybe<Scalars['Int']['output']>;
  spellId: Scalars['Int']['output'];
  spellName: Scalars['String']['output'];
};

export type ClassCircleDto = {
  __typename?: 'ClassCircleDto';
  circle: Scalars['Int']['output'];
  classId: Scalars['Int']['output'];
  /** Class name */
  className: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  minLevel: Scalars['Int']['output'];
  /** Spells in this circle */
  spells: Array<CircleSpellDto>;
};

export type ClassDto = {
  __typename?: 'ClassDto';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  hitDice: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  plainName: Scalars['String']['output'];
  primaryStat?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ClassSkillDto = {
  __typename?: 'ClassSkillDto';
  category?: Maybe<SkillCategory>;
  classId: Scalars['Int']['output'];
  /** Class name */
  className: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  maxLevel?: Maybe<Scalars['Int']['output']>;
  minLevel: Scalars['Int']['output'];
  skillId: Scalars['Int']['output'];
  /** Skill name */
  skillName: Scalars['String']['output'];
};

export type Climate =
  | 'ALPINE'
  | 'ARCTIC'
  | 'ARID'
  | 'NONE'
  | 'OCEANIC'
  | 'SEMIARID'
  | 'SUBARCTIC'
  | 'SUBTROPICAL'
  | 'TEMPERATE'
  | 'TROPICAL';

/** Category of MUD commands */
export type CommandCategory =
  | 'ADMIN'
  | 'BUILDING'
  | 'CLAN'
  | 'COMBAT'
  | 'COMMUNICATION'
  | 'INFORMATION'
  | 'MAGIC'
  | 'MOVEMENT'
  | 'OBJECT'
  | 'SKILLS'
  | 'SOCIAL'
  | 'SYSTEM';

/** MUD command definition with permission requirements */
export type CommandDto = {
  __typename?: 'CommandDto';
  /** Alternative names/aliases for the command */
  aliases: Array<Scalars['String']['output']>;
  /** Command category for organization */
  category: CommandCategory;
  createdAt: Scalars['DateTime']['output'];
  /** Brief description of what the command does */
  description?: Maybe<Scalars['String']['output']>;
  /** Whether this command requires an immortal level */
  immortalOnly: Scalars['Boolean']['output'];
  /** Primary command name */
  name: Scalars['String']['output'];
  /** Permission flags required to use this command */
  permissions: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  /** Usage syntax example */
  usage?: Maybe<Scalars['String']['output']>;
};

/** Result of executing a game command */
export type CommandResultType = {
  __typename?: 'CommandResultType';
  executor?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Composition =
  | 'AIR'
  | 'BONE'
  | 'EARTH'
  | 'ETHER'
  | 'FIRE'
  | 'FLESH'
  | 'ICE'
  | 'LAVA'
  | 'METAL'
  | 'MIST'
  | 'PLANT'
  | 'STONE'
  | 'WATER';

/** Type of configuration value */
export type ConfigValueType = 'BOOL' | 'FLOAT' | 'INT' | 'JSON' | 'STRING';

export type CreateAbilityInput = {
  abilityType?: Scalars['String']['input'];
  castTimeRounds?: Scalars['Int']['input'];
  combatOk?: Scalars['Boolean']['input'];
  cooldownMs?: Scalars['Int']['input'];
  damageType?: InputMaybe<ElementType>;
  description?: InputMaybe<Scalars['String']['input']>;
  humanoidOnly?: Scalars['Boolean']['input'];
  inCombatOnly?: Scalars['Boolean']['input'];
  isArea?: Scalars['Boolean']['input'];
  luaScript?: InputMaybe<Scalars['String']['input']>;
  memorizationTime?: Scalars['Int']['input'];
  minPosition?: Position;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  pages?: InputMaybe<Scalars['Int']['input']>;
  questOnly?: Scalars['Boolean']['input'];
  schoolId?: InputMaybe<Scalars['Int']['input']>;
  sphere?: InputMaybe<SpellSphere>;
  tags?: Array<Scalars['String']['input']>;
  violent?: Scalars['Boolean']['input'];
};

export type CreateAbilityMessagesInput = {
  abilityId: Scalars['Int']['input'];
  failToCaster?: InputMaybe<Scalars['String']['input']>;
  failToRoom?: InputMaybe<Scalars['String']['input']>;
  failToVictim?: InputMaybe<Scalars['String']['input']>;
  lookMessage?: InputMaybe<Scalars['String']['input']>;
  startToCaster?: InputMaybe<Scalars['String']['input']>;
  startToRoom?: InputMaybe<Scalars['String']['input']>;
  startToVictim?: InputMaybe<Scalars['String']['input']>;
  successSelfRoom?: InputMaybe<Scalars['String']['input']>;
  successToCaster?: InputMaybe<Scalars['String']['input']>;
  successToRoom?: InputMaybe<Scalars['String']['input']>;
  successToSelf?: InputMaybe<Scalars['String']['input']>;
  successToVictim?: InputMaybe<Scalars['String']['input']>;
  wearoffToRoom?: InputMaybe<Scalars['String']['input']>;
  wearoffToTarget?: InputMaybe<Scalars['String']['input']>;
};

export type CreateAbilitySavingThrowInput = {
  abilityId: Scalars['Int']['input'];
  dcFormula: Scalars['String']['input'];
  onSaveAction?: Scalars['JSON']['input'];
  saveType?: SaveType;
};

export type CreateAbilityTargetingInput = {
  abilityId: Scalars['Int']['input'];
  maxTargets?: Scalars['Int']['input'];
  range?: Scalars['Int']['input'];
  requireLos?: Scalars['Boolean']['input'];
  scope?: TargetScope;
  scopePattern?: InputMaybe<Scalars['String']['input']>;
  validTargets?: Array<TargetType>;
};

export type CreateBoardInput = {
  alias: Scalars['String']['input'];
  locked?: Scalars['Boolean']['input'];
  privileges?: InputMaybe<Scalars['JSON']['input']>;
  title: Scalars['String']['input'];
};

export type CreateBoardMessageInput = {
  boardId: Scalars['Int']['input'];
  content: Scalars['String']['input'];
  poster: Scalars['String']['input'];
  posterLevel: Scalars['Int']['input'];
  sticky?: Scalars['Boolean']['input'];
  subject: Scalars['String']['input'];
};

export type CreateCharacterEffectInput = {
  characterId: Scalars['String']['input'];
  duration?: InputMaybe<Scalars['Int']['input']>;
  effectName: Scalars['String']['input'];
  effectType?: InputMaybe<Scalars['String']['input']>;
  sourceId?: InputMaybe<Scalars['Int']['input']>;
  sourceType?: InputMaybe<Scalars['String']['input']>;
  strength?: Scalars['Int']['input'];
};

export type CreateCharacterInput = {
  alignment?: Scalars['Int']['input'];
  charisma?: Scalars['Int']['input'];
  constitution?: Scalars['Int']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  dexterity?: Scalars['Int']['input'];
  gender?: Scalars['String']['input'];
  intelligence?: Scalars['Int']['input'];
  level?: Scalars['Int']['input'];
  luck?: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  playerClass?: InputMaybe<Scalars['String']['input']>;
  raceId?: Scalars['Int']['input'];
  raceType?: Scalars['String']['input'];
  strength?: Scalars['Int']['input'];
  title?: InputMaybe<Scalars['String']['input']>;
  wisdom?: Scalars['Int']['input'];
};

export type CreateCharacterItemInput = {
  characterId: Scalars['String']['input'];
  charges?: Scalars['Int']['input'];
  condition?: Scalars['Int']['input'];
  containerId?: InputMaybe<Scalars['Int']['input']>;
  customLongDesc?: InputMaybe<Scalars['String']['input']>;
  customShortDesc?: InputMaybe<Scalars['String']['input']>;
  equippedLocation?: InputMaybe<Scalars['String']['input']>;
  instanceFlags?: Array<Scalars['String']['input']>;
  objectPrototypeId: Scalars['Int']['input'];
};

export type CreateClassCircleInput = {
  circle: Scalars['Int']['input'];
  classId: Scalars['Int']['input'];
  minLevel: Scalars['Int']['input'];
};

export type CreateClassInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  hitDice?: Scalars['String']['input'];
  name: Scalars['String']['input'];
  primaryStat?: InputMaybe<Scalars['String']['input']>;
};

export type CreateEffectInput = {
  defaultParams?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  effectType: Scalars['String']['input'];
  name: Scalars['String']['input'];
  paramSchema?: InputMaybe<Scalars['JSON']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreateEquipmentSetInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  items?: InputMaybe<Array<CreateEquipmentSetItemInput>>;
  name: Scalars['String']['input'];
};

export type CreateEquipmentSetItemInput = {
  objectId: Scalars['Int']['input'];
  probability?: Scalars['Float']['input'];
  quantity?: Scalars['Int']['input'];
  slot?: InputMaybe<Scalars['String']['input']>;
};

export type CreateEquipmentSetItemStandaloneInput = {
  equipmentSetId: Scalars['String']['input'];
  objectId: Scalars['Int']['input'];
  probability?: Scalars['Float']['input'];
  quantity?: Scalars['Int']['input'];
  slot?: InputMaybe<Scalars['String']['input']>;
};

export type CreateGrantInput = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  permissions: Array<GrantPermission>;
  resourceId: Scalars['String']['input'];
  resourceType: GrantResourceType;
  userId: Scalars['String']['input'];
};

/** Input for creating a new help entry */
export type CreateHelpEntryInput = {
  /** Category (e.g., spell, skill, command) */
  category?: InputMaybe<Scalars['String']['input']>;
  /** Class/circle requirements */
  classes?: InputMaybe<Scalars['JSON']['input']>;
  /** Full help text content */
  content: Scalars['String']['input'];
  /** Duration description */
  duration?: InputMaybe<Scalars['String']['input']>;
  /** Keywords for looking up this help entry */
  keywords: Array<Scalars['String']['input']>;
  /** Minimum player level to view */
  minLevel?: Scalars['Int']['input'];
  /** Spell sphere */
  sphere?: InputMaybe<Scalars['String']['input']>;
  /** Primary display title */
  title: Scalars['String']['input'];
  /** Usage syntax */
  usage?: InputMaybe<Scalars['String']['input']>;
};

/** Input for creating a login message */
export type CreateLoginMessageInput = {
  /** Whether this message is active */
  isActive?: Scalars['Boolean']['input'];
  /** Message content */
  message: Scalars['String']['input'];
  /** Login flow stage */
  stage: LoginStage;
  /** Message variant */
  variant?: Scalars['String']['input'];
};

export type CreateMobEquipmentSetInput = {
  equipmentSetId: Scalars['String']['input'];
  mobResetId: Scalars['String']['input'];
  probability?: Scalars['Float']['input'];
};

export type CreateMobInput = {
  accuracy?: Scalars['Int']['input'];
  alignment?: Scalars['Int']['input'];
  armorClass?: Scalars['Int']['input'];
  armorRating?: Scalars['Int']['input'];
  attackPower?: Scalars['Int']['input'];
  charisma?: Scalars['Int']['input'];
  classId?: InputMaybe<Scalars['Int']['input']>;
  composition?: Composition;
  concealment?: Scalars['Int']['input'];
  constitution?: Scalars['Int']['input'];
  damageDice: Scalars['String']['input'];
  damageReductionPercent?: Scalars['Int']['input'];
  damageType?: DamageType;
  dexterity?: Scalars['Int']['input'];
  effectFlags?: Array<EffectFlag>;
  evasion?: Scalars['Int']['input'];
  examineDescription: Scalars['String']['input'];
  gender?: Gender;
  hardness?: Scalars['Int']['input'];
  hitRoll?: Scalars['Int']['input'];
  hpDice: Scalars['String']['input'];
  id: Scalars['Int']['input'];
  intelligence?: Scalars['Int']['input'];
  keywords: Array<Scalars['String']['input']>;
  level?: Scalars['Int']['input'];
  lifeForce?: LifeForce;
  mobFlags?: Array<MobFlag>;
  name: Scalars['String']['input'];
  penetrationFlat?: Scalars['Int']['input'];
  penetrationPercent?: Scalars['Int']['input'];
  perception?: Scalars['Int']['input'];
  position?: Position;
  race?: Race;
  resistanceAcid?: Scalars['Int']['input'];
  resistanceCold?: Scalars['Int']['input'];
  resistanceFire?: Scalars['Int']['input'];
  resistanceLightning?: Scalars['Int']['input'];
  resistancePoison?: Scalars['Int']['input'];
  role?: MobRole;
  roomDescription: Scalars['String']['input'];
  size?: Size;
  soak?: Scalars['Int']['input'];
  spellPower?: Scalars['Int']['input'];
  stance?: Stance;
  strength?: Scalars['Int']['input'];
  wardPercent?: Scalars['Int']['input'];
  wealth?: Scalars['Int']['input'];
  wisdom?: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type CreateMobResetEquipmentInput = {
  maxInstances?: Scalars['Int']['input'];
  objectId: Scalars['Int']['input'];
  objectZoneId: Scalars['Int']['input'];
  probability?: Scalars['Float']['input'];
  wearLocation?: InputMaybe<WearFlag>;
};

export type CreateMobResetInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  equipment?: InputMaybe<Array<CreateMobResetEquipmentInput>>;
  maxInstances?: Scalars['Int']['input'];
  mobId: Scalars['Int']['input'];
  mobZoneId: Scalars['Int']['input'];
  probability?: Scalars['Float']['input'];
  roomId: Scalars['Int']['input'];
  roomZoneId: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type CreateObjectInput = {
  actionDescription?: InputMaybe<Scalars['String']['input']>;
  concealment?: Scalars['Int']['input'];
  cost?: Scalars['Int']['input'];
  decomposeTimer?: Scalars['Int']['input'];
  effectFlags?: Array<EffectFlag>;
  examineDescription: Scalars['String']['input'];
  flags?: Array<ObjectFlag>;
  id: Scalars['Int']['input'];
  keywords: Array<Scalars['String']['input']>;
  level?: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  roomDescription: Scalars['String']['input'];
  timer?: Scalars['Int']['input'];
  type?: ObjectType;
  values?: InputMaybe<Scalars['JSON']['input']>;
  wearFlags?: Array<WearFlag>;
  weight?: Scalars['Float']['input'];
  zoneId: Scalars['Int']['input'];
};

export type CreateObjectResetInput = {
  max?: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  objectId: Scalars['Int']['input'];
  probability?: Scalars['Float']['input'];
  roomId: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type CreateRaceInput = {
  bonusDamroll?: Scalars['Int']['input'];
  bonusHitroll?: Scalars['Int']['input'];
  defaultAlignment?: Scalars['Int']['input'];
  defaultComposition?: Composition;
  defaultLifeforce?: LifeForce;
  defaultSize?: Size;
  displayName: Scalars['String']['input'];
  expFactor?: Scalars['Int']['input'];
  focusBonus?: Scalars['Int']['input'];
  fullName: Scalars['String']['input'];
  hpFactor?: Scalars['Int']['input'];
  humanoid?: Scalars['Boolean']['input'];
  keywords: Scalars['String']['input'];
  magical?: Scalars['Boolean']['input'];
  maxCharisma?: Scalars['Int']['input'];
  maxConstitution?: Scalars['Int']['input'];
  maxDexterity?: Scalars['Int']['input'];
  maxIntelligence?: Scalars['Int']['input'];
  maxStrength?: Scalars['Int']['input'];
  maxWisdom?: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  permanentEffects?: Array<EffectFlag>;
  plainName: Scalars['String']['input'];
  playable?: Scalars['Boolean']['input'];
  race: Race;
  raceAlign?: RaceAlign;
};

export type CreateRoomExitInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  direction: Direction;
  key?: InputMaybe<Scalars['String']['input']>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  roomId: Scalars['Int']['input'];
  roomZoneId: Scalars['Int']['input'];
  toRoomId?: InputMaybe<Scalars['Int']['input']>;
  toZoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateRoomInput = {
  description: Scalars['String']['input'];
  flags?: Array<RoomFlag>;
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  roomDescription?: InputMaybe<Scalars['String']['input']>;
  sector?: Sector;
  zoneId: Scalars['Int']['input'];
};

export type CreateShopInput = {
  buyMessages?: Array<Scalars['String']['input']>;
  buyProfit?: Scalars['Float']['input'];
  doNotBuyMessages?: Array<Scalars['String']['input']>;
  flags?: Array<ShopFlag>;
  id: Scalars['Int']['input'];
  keeperId?: InputMaybe<Scalars['Int']['input']>;
  missingCashMessages?: Array<Scalars['String']['input']>;
  noSuchItemMessages?: Array<Scalars['String']['input']>;
  sellMessages?: Array<Scalars['String']['input']>;
  sellProfit?: Scalars['Float']['input'];
  temper?: Scalars['Int']['input'];
  tradesWithFlags?: Array<ShopTradesWith>;
  zoneId: Scalars['Int']['input'];
};

/** Input for creating a new social command */
export type CreateSocialInput = {
  /** Message to actor when targeting self */
  charAuto?: InputMaybe<Scalars['String']['input']>;
  /** Message to actor when target found */
  charFound?: InputMaybe<Scalars['String']['input']>;
  /** Message to actor when no target */
  charNoArg?: InputMaybe<Scalars['String']['input']>;
  /** Hide who initiated the action */
  hide?: Scalars['Boolean']['input'];
  /** Minimum position for the target */
  minVictimPosition?: Position;
  /** Unique command name (e.g., smile, bow, hug) */
  name: Scalars['String']['input'];
  /** Message when target not found */
  notFound?: InputMaybe<Scalars['String']['input']>;
  /** Message to room when actor targets self */
  othersAuto?: InputMaybe<Scalars['String']['input']>;
  /** Message to room (excluding target) when target found */
  othersFound?: InputMaybe<Scalars['String']['input']>;
  /** Message to room when no target */
  othersNoArg?: InputMaybe<Scalars['String']['input']>;
  /** Message to target */
  victFound?: InputMaybe<Scalars['String']['input']>;
};

/** Input for creating system text */
export type CreateSystemTextInput = {
  /** Text category */
  category: SystemTextCategory;
  /** Text content */
  content: Scalars['String']['input'];
  /** Whether this text is active */
  isActive?: Scalars['Boolean']['input'];
  /** Unique key identifier */
  key: Scalars['String']['input'];
  /** Minimum level to view */
  minLevel?: Scalars['Int']['input'];
  /** Display title */
  title?: InputMaybe<Scalars['String']['input']>;
};

export type CreateTriggerInput = {
  argList?: Array<Scalars['String']['input']>;
  attachType: ScriptType;
  commands: Scalars['String']['input'];
  mobId?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  numArgs?: Scalars['Int']['input'];
  objectId?: InputMaybe<Scalars['Int']['input']>;
  variables?: Scalars['String']['input'];
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateZoneInput = {
  climate?: Climate;
  hemisphere?: Hemisphere;
  id: Scalars['Int']['input'];
  lifespan?: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  resetMode?: ResetMode;
};

export type DamageType =
  | 'ACID'
  | 'ALIGN'
  | 'BITE'
  | 'BLAST'
  | 'BLUDGEON'
  | 'CLAW'
  | 'COLD'
  | 'CRUSH'
  | 'ENERGY'
  | 'FIRE'
  | 'HIT'
  | 'MAUL'
  | 'MENTAL'
  | 'PIERCE'
  | 'POISON'
  | 'POUND'
  | 'PUNCH'
  | 'ROT'
  | 'SHOCK'
  | 'SLASH'
  | 'STAB'
  | 'STING'
  | 'THRASH'
  | 'WATER'
  | 'WHIP';

export type Direction =
  | 'DOWN'
  | 'EAST'
  | 'IN'
  | 'NONE'
  | 'NORTH'
  | 'NORTHEAST'
  | 'NORTHWEST'
  | 'OUT'
  | 'PORTAL'
  | 'SOUTH'
  | 'SOUTHEAST'
  | 'SOUTHWEST'
  | 'UP'
  | 'WEST';

export type Effect = {
  __typename?: 'Effect';
  defaultParams: Scalars['JSON']['output'];
  description?: Maybe<Scalars['String']['output']>;
  effectType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  paramSchema?: Maybe<Scalars['JSON']['output']>;
  tags: Array<Scalars['String']['output']>;
};

export type EffectFlag =
  | 'ACID_WEAPON'
  | 'ANIMATED'
  | 'AWARE'
  | 'BERSERK'
  | 'BLESS'
  | 'BLIND'
  | 'BLUR'
  | 'CAMOUFLAGED'
  | 'CHARM'
  | 'COLDSHIELD'
  | 'CONFUSION'
  | 'CURSE'
  | 'DETECT_ALIGN'
  | 'DETECT_INVIS'
  | 'DETECT_MAGIC'
  | 'DETECT_POISON'
  | 'DISEASE'
  | 'DISPLACEMENT'
  | 'ENLARGE'
  | 'EXPOSED'
  | 'FAMILIARITY'
  | 'FARSEE'
  | 'FEAR'
  | 'FEATHER_FALL'
  | 'FIRESHIELD'
  | 'FIRE_WEAPON'
  | 'FLY'
  | 'GLORY'
  | 'GREATER_DISPLACEMENT'
  | 'HARNESS'
  | 'HASTE'
  | 'HEX'
  | 'HURT_THROAT'
  | 'ICE_WEAPON'
  | 'IMMOBILIZED'
  | 'INFRAVISION'
  | 'INSANITY'
  | 'INVISIBLE'
  | 'LIGHT'
  | 'MAJOR_GLOBE'
  | 'MAJOR_PARALYSIS'
  | 'MESMERIZED'
  | 'MINOR_GLOBE'
  | 'MINOR_PARALYSIS'
  | 'MISDIRECTING'
  | 'MISDIRECTION'
  | 'NEGATE_AIR'
  | 'NEGATE_COLD'
  | 'NEGATE_EARTH'
  | 'NEGATE_HEAT'
  | 'NO_TRACK'
  | 'ON_FIRE'
  | 'POISON'
  | 'POISON_WEAPON'
  | 'PROTECT_AIR'
  | 'PROTECT_COLD'
  | 'PROTECT_EARTH'
  | 'PROTECT_EVIL'
  | 'PROTECT_FIRE'
  | 'PROTECT_GOOD'
  | 'RADIANT_WEAPON'
  | 'RAY_OF_ENFEEBLEMENT'
  | 'REDUCE'
  | 'REMOTE_AGGRO'
  | 'SANCTUARY'
  | 'SENSE_LIFE'
  | 'SHADOWING'
  | 'SHOCK_WEAPON'
  | 'SILENCE'
  | 'SLEEP'
  | 'SNEAK'
  | 'SONG_OF_REST'
  | 'SOULSHIELD'
  | 'SPIRIT_BEAR'
  | 'SPIRIT_WOLF'
  | 'STEALTH'
  | 'STONE_SKIN'
  | 'TAMED'
  | 'TONGUES'
  | 'ULTRAVISION'
  | 'UNUSED'
  | 'VAMPIRIC_TOUCH'
  | 'VITALITY'
  | 'WATERBREATH'
  | 'WATERWALK'
  | 'WRATH';

export type ElementType =
  | 'ACID'
  | 'AIR'
  | 'BLEED'
  | 'COLD'
  | 'CRUSH'
  | 'EARTH'
  | 'FIRE'
  | 'FORCE'
  | 'HEAL'
  | 'HOLY'
  | 'MENTAL'
  | 'NATURE'
  | 'NECROTIC'
  | 'PHYSICAL'
  | 'PIERCE'
  | 'POISON'
  | 'RADIANT'
  | 'SHADOW'
  | 'SHOCK'
  | 'SLASH'
  | 'SONIC'
  | 'UNHOLY'
  | 'WATER';

export type EquipmentSetDto = {
  __typename?: 'EquipmentSetDto';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  items: Array<EquipmentSetItemDto>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type EquipmentSetItemDto = {
  __typename?: 'EquipmentSetItemDto';
  id: Scalars['String']['output'];
  object: ObjectDto;
  objectId: Scalars['Int']['output'];
  probability: Scalars['Float']['output'];
  quantity: Scalars['Int']['output'];
  slot?: Maybe<Scalars['String']['output']>;
};

export type ExitFlag = 'CLOSED' | 'HIDDEN' | 'IS_DOOR' | 'LOCKED' | 'PICKPROOF';

/** Game configuration entry */
export type GameConfigDto = {
  __typename?: 'GameConfigDto';
  /** Configuration category (e.g., server, combat, progression) */
  category: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  /** Human-readable description */
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Whether this config contains sensitive data */
  isSecret: Scalars['Boolean']['output'];
  /** Configuration key within category */
  key: Scalars['String']['output'];
  /** Maximum valid value */
  maxValue?: Maybe<Scalars['String']['output']>;
  /** Minimum valid value */
  minValue?: Maybe<Scalars['String']['output']>;
  /** Whether changing this requires server restart */
  restartReq: Scalars['Boolean']['output'];
  updatedAt: Scalars['DateTime']['output'];
  /** Configuration value as string */
  value: Scalars['String']['output'];
  /** Type of the value */
  valueType: ConfigValueType;
};

/** A game event from FieryMUD */
export type GameEvent = {
  __typename?: 'GameEvent';
  message: Scalars['String']['output'];
  metadata?: Maybe<Scalars['JSON']['output']>;
  playerName?: Maybe<Scalars['String']['output']>;
  roomVnum?: Maybe<Scalars['Int']['output']>;
  targetPlayer?: Maybe<Scalars['String']['output']>;
  timestamp: Scalars['DateTime']['output'];
  type: GameEventType;
  zoneId?: Maybe<Scalars['Int']['output']>;
};

/** Categories of game events for subscription filtering */
export type GameEventCategory = 'ADMIN' | 'CHAT' | 'PLAYER' | 'WORLD';

/** Types of events published by the FieryMUD game server */
export type GameEventType =
  | 'ADMIN_BROADCAST'
  | 'ADMIN_CRASH'
  | 'ADMIN_SHUTDOWN'
  | 'ADMIN_WARNING'
  | 'ADMIN_ZONE_RESET'
  | 'BOSS_SPAWN'
  | 'CHAT_CLAN'
  | 'CHAT_EMOTE'
  | 'CHAT_GOSSIP'
  | 'CHAT_GROUP'
  | 'CHAT_OOC'
  | 'CHAT_SAY'
  | 'CHAT_SHOUT'
  | 'CHAT_TELL'
  | 'MOB_KILLED'
  | 'PLAYER_DEATH'
  | 'PLAYER_LEVEL_UP'
  | 'PLAYER_LOGIN'
  | 'PLAYER_LOGOUT'
  | 'PLAYER_QUIT'
  | 'PLAYER_ZONE_ENTER'
  | 'QUEST_COMPLETE'
  | 'ZONE_LOADED'
  | 'ZONE_RESET';

export type Gender = 'FEMALE' | 'MALE' | 'NEUTRAL' | 'NON_BINARY';

/** Permission level for a grant */
export type GrantPermission = 'ADMIN' | 'DELETE' | 'READ' | 'WRITE';

/** Type of resource that can be granted access to */
export type GrantResourceType = 'MOB' | 'OBJECT' | 'SHOP' | 'ZONE';

export type GrantZoneAccessInput = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  permissions: Array<GrantPermission>;
  userId: Scalars['String']['input'];
  zoneId: Scalars['Float']['input'];
};

/** Help entry for in-game documentation */
export type HelpEntryDto = {
  __typename?: 'HelpEntryDto';
  /** Category (e.g., spell, skill, command, class, area) */
  category?: Maybe<Scalars['String']['output']>;
  /** Class/circle requirements (e.g., {"Pyromancer": 7}) */
  classes?: Maybe<Scalars['JSON']['output']>;
  /** Full help text content */
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  /** Duration description */
  duration?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** Keywords for looking up this help entry */
  keywords: Array<Scalars['String']['output']>;
  /** Minimum player level to view (0 = all, 100+ = immortal only) */
  minLevel: Scalars['Int']['output'];
  /** Original help file this came from */
  sourceFile?: Maybe<Scalars['String']['output']>;
  /** Spell sphere (fire, water, healing, etc.) */
  sphere?: Maybe<Scalars['String']['output']>;
  /** Primary display title */
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  /** Usage syntax */
  usage?: Maybe<Scalars['String']['output']>;
};

/** Filter options for help entries */
export type HelpEntryFilterInput = {
  /** Filter by category */
  category?: InputMaybe<Scalars['String']['input']>;
  /** Maximum minLevel to include */
  maxMinLevel?: InputMaybe<Scalars['Int']['input']>;
  /** Filter by sphere */
  sphere?: InputMaybe<Scalars['String']['input']>;
};

export type Hemisphere = 'NORTHEAST' | 'NORTHWEST' | 'SOUTHEAST' | 'SOUTHWEST';

export type KeeperDto = {
  __typename?: 'KeeperDto';
  id: Scalars['Int']['output'];
  keywords: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  zoneId: Scalars['Int']['output'];
};

/** Result of kicking a player */
export type KickResultType = {
  __typename?: 'KickResultType';
  message: Scalars['String']['output'];
  reason: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

/** Level definition with experience and permissions */
export type LevelDefinitionDto = {
  __typename?: 'LevelDefinitionDto';
  createdAt: Scalars['DateTime']['output'];
  /** Experience required to reach this level */
  expRequired: Scalars['Int']['output'];
  /** HP gained at this level */
  hpGain: Scalars['Int']['output'];
  /** Whether this is an immortal level (100+) */
  isImmortal: Scalars['Boolean']['output'];
  /** Level number (1-105) */
  level: Scalars['Int']['output'];
  /** Display name for immortal levels */
  name?: Maybe<Scalars['String']['output']>;
  /** Permissions granted at this level */
  permissions: Array<Scalars['String']['output']>;
  /** Stamina gained at this level */
  staminaGain: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type LifeForce =
  | 'CELESTIAL'
  | 'DEMONIC'
  | 'ELEMENTAL'
  | 'LIFE'
  | 'MAGIC'
  | 'UNDEAD';

export type LinkCharacterInput = {
  characterName: Scalars['String']['input'];
  characterPassword: Scalars['String']['input'];
};

export type LoginInput = {
  identifier: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

/** Login flow message */
export type LoginMessageDto = {
  __typename?: 'LoginMessageDto';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Whether this message is active */
  isActive: Scalars['Boolean']['output'];
  /** Message content */
  message: Scalars['String']['output'];
  /** Login flow stage */
  stage: LoginStage;
  updatedAt: Scalars['DateTime']['output'];
  /** Message variant (default, or for A/B testing) */
  variant: Scalars['String']['output'];
};

/** Stage in the login/character creation flow */
export type LoginStage =
  | 'CHARACTER_SELECT'
  | 'CONFIRM_PASSWORD'
  | 'CREATE_NAME_PROMPT'
  | 'CREATE_PASSWORD'
  | 'CREATION_COMPLETE'
  | 'INVALID_LOGIN'
  | 'PASSWORD_PROMPT'
  | 'RECONNECT_MESSAGE'
  | 'SELECT_CLASS'
  | 'SELECT_RACE'
  | 'TOO_MANY_ATTEMPTS'
  | 'USERNAME_PROMPT'
  | 'WELCOME_BANNER';

export type MobDto = {
  __typename?: 'MobDto';
  accuracy: Scalars['Int']['output'];
  alignment: Scalars['Int']['output'];
  armorClass: Scalars['Int']['output'];
  armorRating: Scalars['Int']['output'];
  attackPower: Scalars['Int']['output'];
  charisma: Scalars['Int']['output'];
  classId?: Maybe<Scalars['Int']['output']>;
  composition: Composition;
  concealment: Scalars['Int']['output'];
  constitution: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  damageDice: Scalars['String']['output'];
  damageReductionPercent: Scalars['Int']['output'];
  damageType: DamageType;
  dexterity: Scalars['Int']['output'];
  effectFlags: Array<EffectFlag>;
  evasion: Scalars['Int']['output'];
  examineDescription: Scalars['String']['output'];
  gender: Gender;
  hardness: Scalars['Int']['output'];
  hitRoll: Scalars['Int']['output'];
  hpDice: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  intelligence: Scalars['Int']['output'];
  keywords: Array<Scalars['String']['output']>;
  level: Scalars['Int']['output'];
  lifeForce: LifeForce;
  mobFlags: Array<MobFlag>;
  name: Scalars['String']['output'];
  penetrationFlat: Scalars['Int']['output'];
  penetrationPercent: Scalars['Int']['output'];
  perception: Scalars['Int']['output'];
  plainExamineDescription: Scalars['String']['output'];
  plainName: Scalars['String']['output'];
  plainRoomDescription: Scalars['String']['output'];
  position: Position;
  race: Race;
  resistanceAcid: Scalars['Int']['output'];
  resistanceCold: Scalars['Int']['output'];
  resistanceFire: Scalars['Int']['output'];
  resistanceLightning: Scalars['Int']['output'];
  resistancePoison: Scalars['Int']['output'];
  role: MobRole;
  roomDescription: Scalars['String']['output'];
  size: Size;
  soak: Scalars['Int']['output'];
  spellPower: Scalars['Int']['output'];
  stance: Stance;
  strength: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  wardPercent: Scalars['Int']['output'];
  wealth?: Maybe<Scalars['Int']['output']>;
  wisdom: Scalars['Int']['output'];
  zoneId: Scalars['Int']['output'];
};

export type MobEquipmentSetDto = {
  __typename?: 'MobEquipmentSetDto';
  equipmentSet: EquipmentSetDto;
  equipmentSetId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  mobResetId: Scalars['String']['output'];
  probability: Scalars['Float']['output'];
};

export type MobFlag =
  | 'AGGRESSIVE'
  | 'AGGRO_EVIL'
  | 'AGGRO_GOOD'
  | 'AGGRO_NEUTRAL'
  | 'ANTI_PALADIN'
  | 'AQUATIC'
  | 'ASSASSIN'
  | 'AWARE'
  | 'BANKER'
  | 'BERSERKER'
  | 'BLUR'
  | 'CLERIC'
  | 'CONJURER'
  | 'DIABOLIST'
  | 'DRUID'
  | 'FAST_TRACK'
  | 'HASTE'
  | 'HATES_SUN'
  | 'HELPER'
  | 'ILLUSION'
  | 'IS_NPC'
  | 'MEMORY'
  | 'MERCENARY'
  | 'MONK'
  | 'MOUNT'
  | 'MOUNTABLE'
  | 'NECROMANCER'
  | 'NO_BASH'
  | 'NO_BLIND'
  | 'NO_CHARM'
  | 'NO_CLASS_AI'
  | 'NO_EQ_RESTRICT'
  | 'NO_KILL'
  | 'NO_POISON'
  | 'NO_SILENCE'
  | 'NO_SLEEP'
  | 'NO_SUMMON'
  | 'NO_VICIOUS'
  | 'PALADIN'
  | 'PEACEFUL'
  | 'PEACEKEEPER'
  | 'POISON_BITE'
  | 'POSTMASTER'
  | 'PROTECTOR'
  | 'RANGER'
  | 'RECEPTIONIST'
  | 'SCAVENGER'
  | 'SENTINEL'
  | 'SHAMAN'
  | 'SLOW_TRACK'
  | 'SORCERER'
  | 'SPEC'
  | 'STAY_SECT'
  | 'STAY_ZONE'
  | 'SUMMONED_MOUNT'
  | 'TEACHER'
  | 'THIEF'
  | 'TRACK'
  | 'WARRIOR'
  | 'WIMPY';

export type MobResetDto = {
  __typename?: 'MobResetDto';
  comment?: Maybe<Scalars['String']['output']>;
  equipment: Array<MobResetEquipmentDto>;
  id: Scalars['ID']['output'];
  maxInstances: Scalars['Int']['output'];
  mob?: Maybe<MobSummaryDto>;
  mobId: Scalars['Int']['output'];
  mobZoneId: Scalars['Int']['output'];
  probability: Scalars['Float']['output'];
  room?: Maybe<RoomSummaryDto>;
  roomId: Scalars['Int']['output'];
  roomZoneId: Scalars['Int']['output'];
  zoneId: Scalars['Int']['output'];
};

export type MobResetEquipmentDto = {
  __typename?: 'MobResetEquipmentDto';
  id: Scalars['ID']['output'];
  maxInstances: Scalars['Int']['output'];
  /** The object being equipped */
  object: ObjectSummaryDto;
  objectId: Scalars['Int']['output'];
  objectZoneId: Scalars['Int']['output'];
  probability: Scalars['Float']['output'];
  wearLocation?: Maybe<WearFlag>;
};

export type MobRole =
  | 'BOSS'
  | 'ELITE'
  | 'MINIBOSS'
  | 'NORMAL'
  | 'RAID_BOSS'
  | 'TRASH';

export type MobSummaryDto = {
  __typename?: 'MobSummaryDto';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  zoneId: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addMobResetEquipment: MobResetDto;
  /** Assign a skill to a class */
  assignSkillToClass: ClassSkillDto;
  /** Assign a skill to a race */
  assignSkillToRace: RaceSkillDto;
  attachTrigger: TriggerDto;
  banUser: BanRecord;
  batchUpdateRoomPositions: BatchUpdateResult;
  /** Broadcast a message to all online players */
  broadcastMessage: BroadcastResultType;
  changePassword: PasswordResetResponse;
  createAbility: Ability;
  createAbilityMessages: AbilityMessages;
  createAbilitySavingThrow: AbilitySavingThrow;
  createAbilityTargeting: AbilityTargeting;
  createBoard: BoardDto;
  createBoardMessage: BoardMessageDto;
  createCharacter: CharacterDto;
  createCharacterEffect: CharacterEffectDto;
  createCharacterItem: CharacterItemDto;
  createClass: ClassDto;
  createClassCircle: ClassCircleDto;
  createEffect: Effect;
  createEquipmentSet: EquipmentSetDto;
  createEquipmentSetItem: EquipmentSetItemDto;
  createGrant: UserGrantDto;
  /** Create a new help entry */
  createHelpEntry: HelpEntryDto;
  /** Create a new login message */
  createLoginMessage: LoginMessageDto;
  createMob: MobDto;
  createMobEquipmentSet: MobEquipmentSetDto;
  createMobReset: MobResetDto;
  createObject: ObjectDto;
  createObjectReset: ObjectResetDto;
  createRace: RaceDto;
  createRoom: RoomDto;
  createRoomExit: RoomExitDto;
  createShop: ShopDto;
  /** Create a new social command */
  createSocial: SocialDto;
  /** Create a new system text entry */
  createSystemText: SystemTextDto;
  createTrigger: TriggerDto;
  createZone: ZoneDto;
  deleteAbility: Scalars['Boolean']['output'];
  deleteAbilityMessages: Scalars['Boolean']['output'];
  deleteAbilitySavingThrow: Scalars['Boolean']['output'];
  deleteAbilityTargeting: Scalars['Boolean']['output'];
  deleteAccountMail: AccountMailDto;
  deleteBoard: BoardDto;
  deleteBoardMessage: BoardMessageDto;
  deleteCharacter: CharacterDto;
  deleteCharacterEffect: Scalars['Boolean']['output'];
  deleteCharacterItem: Scalars['Boolean']['output'];
  deleteClass: Scalars['Boolean']['output'];
  deleteEffect: Scalars['Boolean']['output'];
  deleteEquipmentSet: Scalars['Boolean']['output'];
  deleteEquipmentSetItem: Scalars['Boolean']['output'];
  deleteGrant: Scalars['Boolean']['output'];
  /** Delete a help entry */
  deleteHelpEntry: Scalars['Boolean']['output'];
  /** Delete a login message */
  deleteLoginMessage: Scalars['Boolean']['output'];
  deleteMob: MobDto;
  deleteMobEquipmentSet: Scalars['Boolean']['output'];
  deleteMobReset: Scalars['Boolean']['output'];
  deleteMobResetEquipment: Scalars['Boolean']['output'];
  deleteMobs: Scalars['Int']['output'];
  deleteObject: ObjectDto;
  deleteObjectReset: Scalars['Boolean']['output'];
  deleteObjects: Scalars['Int']['output'];
  deletePlayerMail: PlayerMailDto;
  deleteRace: Scalars['Boolean']['output'];
  deleteRoom: RoomDto;
  deleteRoomExit: RoomExitDto;
  deleteShop: ShopDto;
  /** Delete a social command */
  deleteSocial: Scalars['Boolean']['output'];
  /** Delete a system text entry */
  deleteSystemText: Scalars['Boolean']['output'];
  deleteTrigger: TriggerDto;
  deleteZone: ZoneDto;
  depositItem: AccountItemDto;
  depositWealth: Scalars['BigInt']['output'];
  detachTrigger: TriggerDto;
  /** Execute a god command on FieryMUD */
  executeGameCommand: CommandResultType;
  /** Grant zone access to a user */
  grantZoneAccess: UserGrantDto;
  /** Disconnect a player from FieryMUD */
  kickPlayer: KickResultType;
  /** Link an existing game character to your user account */
  linkCharacter: CharacterDto;
  login: AuthPayload;
  markAccountMailRead: AccountMailDto;
  markMailRead: PlayerMailDto;
  markObjectRetrieved: PlayerMailDto;
  markTriggerReviewed: TriggerDto;
  markWealthRetrieved: PlayerMailDto;
  refreshToken: Scalars['String']['output'];
  register: AuthPayload;
  removeClassCircle: Scalars['Boolean']['output'];
  removeClassSkill: Scalars['Boolean']['output'];
  /** Remove expired effects for a character or all characters */
  removeExpiredEffects: Scalars['Int']['output'];
  removeRaceSkill: Scalars['Boolean']['output'];
  requestPasswordReset: PasswordResetResponse;
  resetPassword: PasswordResetResponse;
  /** Revoke zone access from a user */
  revokeZoneAccess: Scalars['Boolean']['output'];
  sendAccountMail: AccountMailDto;
  sendBroadcast: Scalars['Int']['output'];
  sendMail: PlayerMailDto;
  setCharacterOffline: Scalars['Boolean']['output'];
  setCharacterOnline: Scalars['Boolean']['output'];
  unbanUser: BanRecord;
  /** Unlink a character from your user account */
  unlinkCharacter: Scalars['Boolean']['output'];
  updateAbility: Ability;
  updateAbilityEffects: Ability;
  updateAbilityMessages: AbilityMessages;
  updateAbilityTargeting: AbilityTargeting;
  updateBoard: BoardDto;
  updateBoardMessage: BoardMessageDto;
  updateCharacter: CharacterDto;
  updateCharacterActivity: Scalars['Boolean']['output'];
  updateCharacterEffect: CharacterEffectDto;
  updateCharacterItem: CharacterItemDto;
  updateClass: ClassDto;
  updateClassCircle: ClassCircleDto;
  updateClassSkill: ClassSkillDto;
  updateEffect: Effect;
  updateEquipmentSet: EquipmentSetDto;
  /** Update a game configuration value */
  updateGameConfig: GameConfigDto;
  updateGrant: UserGrantDto;
  /** Update an existing help entry */
  updateHelpEntry: HelpEntryDto;
  /** Update a level definition */
  updateLevelDefinition: LevelDefinitionDto;
  /** Update a login message */
  updateLoginMessage: LoginMessageDto;
  updateMob: MobDto;
  updateMobReset: MobResetDto;
  updateMobResetEquipment: Scalars['Boolean']['output'];
  updateObject: ObjectDto;
  updateObjectReset: ObjectResetDto;
  updateProfile: User;
  updateRace: RaceDto;
  updateRaceSkill: RaceSkillDto;
  updateRoom: RoomDto;
  updateRoomPosition: RoomDto;
  updateShop: ShopDto;
  updateShopHours: ShopDto;
  updateShopInventory: ShopDto;
  /** Update an existing social command */
  updateSocial: SocialDto;
  /** Update a system text entry */
  updateSystemText: SystemTextDto;
  updateTrigger: TriggerDto;
  updateUser: User;
  updateUserPreferences: User;
  updateZone: ZoneDto;
  withdrawItem: Scalars['Boolean']['output'];
  withdrawWealth: Scalars['BigInt']['output'];
};

export type MutationAddMobResetEquipmentArgs = {
  maxInstances?: InputMaybe<Scalars['Int']['input']>;
  objectId: Scalars['Int']['input'];
  objectZoneId: Scalars['Int']['input'];
  probability?: InputMaybe<Scalars['Float']['input']>;
  resetId: Scalars['ID']['input'];
  wearLocation?: InputMaybe<WearFlag>;
};

export type MutationAssignSkillToClassArgs = {
  data: AssignSkillToClassInput;
};

export type MutationAssignSkillToRaceArgs = {
  data: AssignSkillToRaceInput;
};

export type MutationAttachTriggerArgs = {
  input: AttachTriggerInput;
};

export type MutationBanUserArgs = {
  input: BanUserInput;
};

export type MutationBatchUpdateRoomPositionsArgs = {
  input: BatchUpdateRoomPositionsInput;
};

export type MutationBroadcastMessageArgs = {
  message: Scalars['String']['input'];
  sender?: InputMaybe<Scalars['String']['input']>;
};

export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};

export type MutationCreateAbilityArgs = {
  data: CreateAbilityInput;
};

export type MutationCreateAbilityMessagesArgs = {
  data: CreateAbilityMessagesInput;
};

export type MutationCreateAbilitySavingThrowArgs = {
  data: CreateAbilitySavingThrowInput;
};

export type MutationCreateAbilityTargetingArgs = {
  data: CreateAbilityTargetingInput;
};

export type MutationCreateBoardArgs = {
  data: CreateBoardInput;
};

export type MutationCreateBoardMessageArgs = {
  data: CreateBoardMessageInput;
};

export type MutationCreateCharacterArgs = {
  data: CreateCharacterInput;
};

export type MutationCreateCharacterEffectArgs = {
  data: CreateCharacterEffectInput;
};

export type MutationCreateCharacterItemArgs = {
  data: CreateCharacterItemInput;
};

export type MutationCreateClassArgs = {
  data: CreateClassInput;
};

export type MutationCreateClassCircleArgs = {
  data: CreateClassCircleInput;
};

export type MutationCreateEffectArgs = {
  data: CreateEffectInput;
};

export type MutationCreateEquipmentSetArgs = {
  data: CreateEquipmentSetInput;
};

export type MutationCreateEquipmentSetItemArgs = {
  data: CreateEquipmentSetItemStandaloneInput;
};

export type MutationCreateGrantArgs = {
  data: CreateGrantInput;
};

export type MutationCreateHelpEntryArgs = {
  data: CreateHelpEntryInput;
};

export type MutationCreateLoginMessageArgs = {
  data: CreateLoginMessageInput;
};

export type MutationCreateMobArgs = {
  data: CreateMobInput;
};

export type MutationCreateMobEquipmentSetArgs = {
  data: CreateMobEquipmentSetInput;
};

export type MutationCreateMobResetArgs = {
  data: CreateMobResetInput;
};

export type MutationCreateObjectArgs = {
  data: CreateObjectInput;
};

export type MutationCreateObjectResetArgs = {
  data: CreateObjectResetInput;
};

export type MutationCreateRaceArgs = {
  data: CreateRaceInput;
};

export type MutationCreateRoomArgs = {
  data: CreateRoomInput;
};

export type MutationCreateRoomExitArgs = {
  data: CreateRoomExitInput;
};

export type MutationCreateShopArgs = {
  data: CreateShopInput;
};

export type MutationCreateSocialArgs = {
  data: CreateSocialInput;
};

export type MutationCreateSystemTextArgs = {
  data: CreateSystemTextInput;
};

export type MutationCreateTriggerArgs = {
  input: CreateTriggerInput;
};

export type MutationCreateZoneArgs = {
  data: CreateZoneInput;
};

export type MutationDeleteAbilityArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteAbilityMessagesArgs = {
  abilityId: Scalars['Int']['input'];
};

export type MutationDeleteAbilitySavingThrowArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteAbilityTargetingArgs = {
  abilityId: Scalars['Int']['input'];
};

export type MutationDeleteAccountMailArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteBoardArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteBoardMessageArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteCharacterArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteCharacterEffectArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteCharacterItemArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteClassArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteEffectArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteEquipmentSetArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteEquipmentSetItemArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteGrantArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteHelpEntryArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteLoginMessageArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteMobArgs = {
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type MutationDeleteMobEquipmentSetArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteMobResetArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteMobResetEquipmentArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteMobsArgs = {
  ids: Array<Scalars['Int']['input']>;
};

export type MutationDeleteObjectArgs = {
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type MutationDeleteObjectResetArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteObjectsArgs = {
  ids: Array<Scalars['Int']['input']>;
};

export type MutationDeletePlayerMailArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteRaceArgs = {
  race: Race;
};

export type MutationDeleteRoomArgs = {
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type MutationDeleteRoomExitArgs = {
  exitId: Scalars['Float']['input'];
};

export type MutationDeleteShopArgs = {
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type MutationDeleteSocialArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteSystemTextArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteTriggerArgs = {
  id: Scalars['Float']['input'];
};

export type MutationDeleteZoneArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDepositItemArgs = {
  characterId: Scalars['String']['input'];
  objectId: Scalars['Int']['input'];
  objectZoneId: Scalars['Int']['input'];
  quantity?: Scalars['Int']['input'];
};

export type MutationDepositWealthArgs = {
  amount: Scalars['BigInt']['input'];
  characterId: Scalars['String']['input'];
};

export type MutationDetachTriggerArgs = {
  triggerId: Scalars['Float']['input'];
};

export type MutationExecuteGameCommandArgs = {
  command: Scalars['String']['input'];
  executor?: InputMaybe<Scalars['String']['input']>;
};

export type MutationGrantZoneAccessArgs = {
  data: GrantZoneAccessInput;
};

export type MutationKickPlayerArgs = {
  playerName: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type MutationLinkCharacterArgs = {
  data: LinkCharacterInput;
};

export type MutationLoginArgs = {
  input: LoginInput;
};

export type MutationMarkAccountMailReadArgs = {
  id: Scalars['Int']['input'];
};

export type MutationMarkMailReadArgs = {
  id: Scalars['Int']['input'];
};

export type MutationMarkObjectRetrievedArgs = {
  characterId: Scalars['String']['input'];
  id: Scalars['Int']['input'];
  movedToAccountStorage?: Scalars['Boolean']['input'];
};

export type MutationMarkTriggerReviewedArgs = {
  triggerId: Scalars['Int']['input'];
};

export type MutationMarkWealthRetrievedArgs = {
  characterId: Scalars['String']['input'];
  id: Scalars['Int']['input'];
};

export type MutationRegisterArgs = {
  input: RegisterInput;
};

export type MutationRemoveClassCircleArgs = {
  id: Scalars['ID']['input'];
};

export type MutationRemoveClassSkillArgs = {
  id: Scalars['ID']['input'];
};

export type MutationRemoveExpiredEffectsArgs = {
  characterId?: InputMaybe<Scalars['ID']['input']>;
};

export type MutationRemoveRaceSkillArgs = {
  id: Scalars['ID']['input'];
};

export type MutationRequestPasswordResetArgs = {
  input: RequestPasswordResetInput;
};

export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};

export type MutationRevokeZoneAccessArgs = {
  userId: Scalars['String']['input'];
  zoneId: Scalars['Float']['input'];
};

export type MutationSendAccountMailArgs = {
  data: SendAccountMailInput;
};

export type MutationSendBroadcastArgs = {
  data: SendBroadcastInput;
};

export type MutationSendMailArgs = {
  data: SendPlayerMailInput;
};

export type MutationSetCharacterOfflineArgs = {
  characterId: Scalars['ID']['input'];
};

export type MutationSetCharacterOnlineArgs = {
  characterId: Scalars['ID']['input'];
};

export type MutationUnbanUserArgs = {
  input: UnbanUserInput;
};

export type MutationUnlinkCharacterArgs = {
  data: UnlinkCharacterInput;
};

export type MutationUpdateAbilityArgs = {
  data: UpdateAbilityInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateAbilityEffectsArgs = {
  abilityId: Scalars['Int']['input'];
  data: UpdateAbilityEffectsInput;
};

export type MutationUpdateAbilityMessagesArgs = {
  abilityId: Scalars['Int']['input'];
  data: UpdateAbilityMessagesInput;
};

export type MutationUpdateAbilityTargetingArgs = {
  abilityId: Scalars['Int']['input'];
  data: UpdateAbilityTargetingInput;
};

export type MutationUpdateBoardArgs = {
  data: UpdateBoardInput;
  id: Scalars['Int']['input'];
};

export type MutationUpdateBoardMessageArgs = {
  data: UpdateBoardMessageInput;
  editor?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
};

export type MutationUpdateCharacterArgs = {
  data: UpdateCharacterInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateCharacterActivityArgs = {
  characterId: Scalars['ID']['input'];
};

export type MutationUpdateCharacterEffectArgs = {
  data: UpdateCharacterEffectInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateCharacterItemArgs = {
  data: UpdateCharacterItemInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateClassArgs = {
  data: UpdateClassInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateClassCircleArgs = {
  data: UpdateClassCircleInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateClassSkillArgs = {
  data: UpdateClassSkillInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateEffectArgs = {
  data: UpdateEffectInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateEquipmentSetArgs = {
  data: UpdateEquipmentSetInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateGameConfigArgs = {
  category: Scalars['String']['input'];
  data: UpdateGameConfigInput;
  key: Scalars['String']['input'];
};

export type MutationUpdateGrantArgs = {
  data: UpdateGrantInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateHelpEntryArgs = {
  data: UpdateHelpEntryInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateLevelDefinitionArgs = {
  data: UpdateLevelDefinitionInput;
  level: Scalars['Int']['input'];
};

export type MutationUpdateLoginMessageArgs = {
  data: UpdateLoginMessageInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateMobArgs = {
  data: UpdateMobInput;
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type MutationUpdateMobResetArgs = {
  data: UpdateMobResetInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateMobResetEquipmentArgs = {
  id: Scalars['ID']['input'];
  maxInstances?: InputMaybe<Scalars['Int']['input']>;
  probability?: InputMaybe<Scalars['Float']['input']>;
  wearLocation?: InputMaybe<WearFlag>;
};

export type MutationUpdateObjectArgs = {
  data: UpdateObjectInput;
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type MutationUpdateObjectResetArgs = {
  data: UpdateObjectResetInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};

export type MutationUpdateRaceArgs = {
  data: UpdateRaceInput;
  race: Race;
};

export type MutationUpdateRaceSkillArgs = {
  data: UpdateRaceSkillInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateRoomArgs = {
  data: UpdateRoomInput;
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type MutationUpdateRoomPositionArgs = {
  id: Scalars['Int']['input'];
  position: UpdateRoomPositionInput;
  zoneId: Scalars['Int']['input'];
};

export type MutationUpdateShopArgs = {
  data: UpdateShopInput;
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type MutationUpdateShopHoursArgs = {
  data: UpdateShopHoursInput;
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type MutationUpdateShopInventoryArgs = {
  data: UpdateShopInventoryInput;
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type MutationUpdateSocialArgs = {
  data: UpdateSocialInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateSystemTextArgs = {
  data: UpdateSystemTextInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateTriggerArgs = {
  id: Scalars['Float']['input'];
  input: UpdateTriggerInput;
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type MutationUpdateUserPreferencesArgs = {
  input: UpdatePreferencesInput;
};

export type MutationUpdateZoneArgs = {
  data: UpdateZoneInput;
  id: Scalars['Int']['input'];
};

export type MutationWithdrawItemArgs = {
  accountItemId: Scalars['Int']['input'];
  characterId: Scalars['String']['input'];
};

export type MutationWithdrawWealthArgs = {
  amount: Scalars['BigInt']['input'];
  characterId: Scalars['String']['input'];
};

export type ObjectAffectDto = {
  __typename?: 'ObjectAffectDto';
  location: Scalars['String']['output'];
  modifier: Scalars['Int']['output'];
};

export type ObjectDto = {
  __typename?: 'ObjectDto';
  actionDescription?: Maybe<Scalars['String']['output']>;
  concealment: Scalars['Int']['output'];
  cost: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  decomposeTimer: Scalars['Int']['output'];
  effectFlags: Array<EffectFlag>;
  examineDescription: Scalars['String']['output'];
  flags: Array<ObjectFlag>;
  id: Scalars['Int']['output'];
  keywords: Array<Scalars['String']['output']>;
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  plainActionDescription?: Maybe<Scalars['String']['output']>;
  plainExamineDescription: Scalars['String']['output'];
  plainName: Scalars['String']['output'];
  plainRoomDescription: Scalars['String']['output'];
  roomDescription: Scalars['String']['output'];
  timer: Scalars['Int']['output'];
  type: ObjectType;
  updatedAt: Scalars['DateTime']['output'];
  values: Scalars['JSON']['output'];
  wearFlags: Array<WearFlag>;
  weight: Scalars['Float']['output'];
  zoneId: Scalars['Int']['output'];
};

export type ObjectFlag =
  | 'ANTI_ANTI_PALADIN'
  | 'ANTI_ARBOREAN'
  | 'ANTI_ASSASSIN'
  | 'ANTI_BARD'
  | 'ANTI_BERSERKER'
  | 'ANTI_CLERIC'
  | 'ANTI_COLOSSAL'
  | 'ANTI_CONJURER'
  | 'ANTI_CRYOMANCER'
  | 'ANTI_DIABOLIST'
  | 'ANTI_DRUID'
  | 'ANTI_EVIL'
  | 'ANTI_GARGANTUAN'
  | 'ANTI_GIANT'
  | 'ANTI_GOOD'
  | 'ANTI_HUGE'
  | 'ANTI_ILLUSIONIST'
  | 'ANTI_LARGE'
  | 'ANTI_MEDIUM'
  | 'ANTI_MERCENARY'
  | 'ANTI_MONK'
  | 'ANTI_MOUNTAINOUS'
  | 'ANTI_NECROMANCER'
  | 'ANTI_NEUTRAL'
  | 'ANTI_PALADIN'
  | 'ANTI_PRIEST'
  | 'ANTI_PYROMANCER'
  | 'ANTI_RANGER'
  | 'ANTI_ROGUE'
  | 'ANTI_SHAMAN'
  | 'ANTI_SMALL'
  | 'ANTI_SORCERER'
  | 'ANTI_THIEF'
  | 'ANTI_TINY'
  | 'ANTI_TITANIC'
  | 'ANTI_WARRIOR'
  | 'DECOMPOSING'
  | 'DWARVEN'
  | 'ELVEN'
  | 'FLOAT'
  | 'GLOW'
  | 'HUM'
  | 'INVISIBLE'
  | 'MAGIC'
  | 'NO_BURN'
  | 'NO_DROP'
  | 'NO_FALL'
  | 'NO_INVISIBLE'
  | 'NO_LOCATE'
  | 'NO_RENT'
  | 'NO_SELL'
  | 'PERMANENT'
  | 'WAS_DISARMED';

export type ObjectResetDto = {
  __typename?: 'ObjectResetDto';
  conditions: Array<SpawnConditionDto>;
  id: Scalars['String']['output'];
  max: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  object: ObjectDto;
  objectId: Scalars['Int']['output'];
  probability: Scalars['Float']['output'];
  roomId: Scalars['Int']['output'];
  zoneId: Scalars['Int']['output'];
};

export type ObjectSummaryDto = {
  __typename?: 'ObjectSummaryDto';
  cost?: Maybe<Scalars['Int']['output']>;
  effectFlags?: Maybe<Array<Scalars['String']['output']>>;
  examineDescription?: Maybe<Scalars['String']['output']>;
  flags?: Maybe<Array<Scalars['String']['output']>>;
  id: Scalars['Int']['output'];
  level?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  objectAffects?: Maybe<Array<ObjectAffectDto>>;
  type: Scalars['String']['output'];
  values?: Maybe<Scalars['JSON']['output']>;
  wearFlags?: Maybe<Array<Scalars['String']['output']>>;
  weight?: Maybe<Scalars['Float']['output']>;
  zoneId: Scalars['Int']['output'];
};

export type ObjectType =
  | 'ARMOR'
  | 'BOARD'
  | 'BOAT'
  | 'CONTAINER'
  | 'DRINKCONTAINER'
  | 'FIREWEAPON'
  | 'FOOD'
  | 'FOUNTAIN'
  | 'INSTRUMENT'
  | 'KEY'
  | 'LIGHT'
  | 'MISSILE'
  | 'MONEY'
  | 'NOTE'
  | 'NOTHING'
  | 'OTHER'
  | 'PEN'
  | 'PORTAL'
  | 'POTION'
  | 'ROPE'
  | 'SCROLL'
  | 'SPELLBOOK'
  | 'STAFF'
  | 'TOUCHSTONE'
  | 'TRAP'
  | 'TRASH'
  | 'TREASURE'
  | 'WALL'
  | 'WAND'
  | 'WEAPON'
  | 'WORN';

export type OnlineCharacterDto = {
  __typename?: 'OnlineCharacterDto';
  id: Scalars['ID']['output'];
  isOnline: Scalars['Boolean']['output'];
  lastLogin?: Maybe<Scalars['DateTime']['output']>;
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  playerClass?: Maybe<Scalars['String']['output']>;
  raceType?: Maybe<Scalars['String']['output']>;
  user: UserSummaryDto;
};

/** Information about an online player in FieryMUD */
export type OnlinePlayerType = {
  __typename?: 'OnlinePlayerType';
  class: Scalars['String']['output'];
  godLevel: Scalars['Int']['output'];
  isLinkdead: Scalars['Boolean']['output'];
  level: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  race: Scalars['String']['output'];
  roomId: Scalars['Int']['output'];
};

export type PasswordResetResponse = {
  __typename?: 'PasswordResetResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type PlayerMailCharacterDto = {
  __typename?: 'PlayerMailCharacterDto';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type PlayerMailDto = {
  __typename?: 'PlayerMailDto';
  attachedCopper: Scalars['Int']['output'];
  attachedGold: Scalars['Int']['output'];
  attachedObject?: Maybe<PlayerMailObjectDto>;
  attachedObjectId?: Maybe<Scalars['Int']['output']>;
  attachedObjectZoneId?: Maybe<Scalars['Int']['output']>;
  attachedPlatinum: Scalars['Int']['output'];
  attachedSilver: Scalars['Int']['output'];
  body: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  isDeleted: Scalars['Boolean']['output'];
  legacyRecipientId?: Maybe<Scalars['Int']['output']>;
  legacySenderId?: Maybe<Scalars['Int']['output']>;
  objectMovedToAccountStorage: Scalars['Boolean']['output'];
  objectRetrievalInfo?: Maybe<Scalars['String']['output']>;
  objectRetrievedAt?: Maybe<Scalars['DateTime']['output']>;
  objectRetrievedByCharacterId?: Maybe<Scalars['String']['output']>;
  readAt?: Maybe<Scalars['DateTime']['output']>;
  recipient?: Maybe<PlayerMailCharacterDto>;
  recipientCharacterId?: Maybe<Scalars['String']['output']>;
  sender?: Maybe<PlayerMailCharacterDto>;
  senderCharacterId?: Maybe<Scalars['String']['output']>;
  senderName: Scalars['String']['output'];
  sentAt: Scalars['DateTime']['output'];
  wealthRetrievalInfo?: Maybe<Scalars['String']['output']>;
  wealthRetrievedAt?: Maybe<Scalars['DateTime']['output']>;
  wealthRetrievedByCharacterId?: Maybe<Scalars['String']['output']>;
};

export type PlayerMailFilterInput = {
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  includeDeleted?: InputMaybe<Scalars['Boolean']['input']>;
  recipientCharacterId?: InputMaybe<Scalars['String']['input']>;
  searchBody?: InputMaybe<Scalars['String']['input']>;
  senderCharacterId?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type PlayerMailObjectDto = {
  __typename?: 'PlayerMailObjectDto';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  zoneId: Scalars['Int']['output'];
};

export type Position =
  | 'DEAD'
  | 'FIGHTING'
  | 'FLYING'
  | 'GHOST'
  | 'INCAPACITATED'
  | 'KNEELING'
  | 'MORTALLY_WOUNDED'
  | 'PRONE'
  | 'RESTING'
  | 'SITTING'
  | 'SLEEPING'
  | 'STANDING'
  | 'STUNNED';

export type Query = {
  __typename?: 'Query';
  abilities: Array<Ability>;
  abilitiesCount: Scalars['Int']['output'];
  ability: Ability;
  abilitySchool: AbilitySchool;
  abilitySchools: Array<AbilitySchool>;
  activeCharacterEffects: Array<CharacterEffectDto>;
  allAccountMail: Array<AccountMailDto>;
  /** Get all unique permission flags used across commands */
  availablePermissions: Array<Scalars['String']['output']>;
  banHistory: Array<BanRecord>;
  board?: Maybe<BoardDto>;
  boardMessage?: Maybe<BoardMessageDto>;
  boardMessages: Array<BoardMessageDto>;
  boardMessagesCount: Scalars['Int']['output'];
  boards: Array<BoardDto>;
  boardsCount: Scalars['Int']['output'];
  /** Get the FieryMUD bridge connection status */
  bridgeStatus: BridgeStatus;
  character: CharacterDto;
  characterEffect: CharacterEffectDto;
  characterEffects: Array<CharacterEffectDto>;
  characterItem: CharacterItemDto;
  characterItems: Array<CharacterItemDto>;
  characterLinkingInfo: CharacterLinkingInfoDto;
  characterSessionInfo: CharacterSessionInfoDto;
  characters: Array<CharacterDto>;
  charactersCount: Scalars['Int']['output'];
  class: ClassDto;
  classByName?: Maybe<ClassDto>;
  /** Get all spell circles for a class */
  classCirclesList: Array<ClassCircleDto>;
  /** Get all skills for a class */
  classSkills: Array<ClassSkillDto>;
  classes: Array<ClassDto>;
  classesCount: Scalars['Int']['output'];
  /** Get a single command by name */
  command: CommandDto;
  /** Get all command categories */
  commandCategories: Array<CommandCategory>;
  /** Get all command definitions */
  commands: Array<CommandDto>;
  /** Get commands by category */
  commandsByCategory: Array<CommandDto>;
  effect: Effect;
  effects: Array<Effect>;
  effectsCount: Scalars['Int']['output'];
  equipmentSet: EquipmentSetDto;
  equipmentSets: Array<EquipmentSetDto>;
  /** Get a single configuration entry */
  gameConfig: GameConfigDto;
  /** Get all distinct configuration categories */
  gameConfigCategories: Array<Scalars['String']['output']>;
  /** Get all game configuration entries */
  gameConfigs: Array<GameConfigDto>;
  /** Get configuration entries by category */
  gameConfigsByCategory: Array<GameConfigDto>;
  /** Check if FieryMUD admin API is connected */
  gameServerConnected: Scalars['Boolean']['output'];
  /** Get validation summary statistics */
  getValidationSummary: ValidationSummaryType;
  grant: UserGrantDto;
  grants: Array<UserGrantDto>;
  /** Get a help entry by keyword */
  helpByKeyword: HelpEntryDto;
  /** Get all distinct help entry categories */
  helpCategories: Array<Scalars['String']['output']>;
  /** Get all help entries with optional filtering */
  helpEntries: Array<HelpEntryDto>;
  /** Get total count of help entries */
  helpEntriesCount: Scalars['Int']['output'];
  /** Get a single help entry by ID */
  helpEntry: HelpEntryDto;
  /** Get all immortal-only commands */
  immortalCommands: Array<CommandDto>;
  /** Get immortal level definitions (100+) */
  immortalLevels: Array<LevelDefinitionDto>;
  /** Get a single level definition */
  levelDefinition: LevelDefinitionDto;
  /** Get all level definitions */
  levelDefinitions: Array<LevelDefinitionDto>;
  /** Get a single login message */
  loginMessage: LoginMessageDto;
  /** Get all login messages */
  loginMessages: Array<LoginMessageDto>;
  /** Get login messages by stage */
  loginMessagesByStage: Array<LoginMessageDto>;
  me: User;
  mob: MobDto;
  mobReset?: Maybe<MobResetDto>;
  mobResets: Array<MobResetDto>;
  mobs: Array<MobDto>;
  mobsByZone: Array<MobDto>;
  mobsCount: Scalars['Int']['output'];
  /** Get mortal level definitions (1-99) */
  mortalLevels: Array<LevelDefinitionDto>;
  myAccountMail: Array<AccountMailDto>;
  myAccountMailCount: Scalars['Int']['output'];
  myAccountStorage: AccountStorageDto;
  myAccountWealthDisplay: WealthDisplayDto;
  myCharacters: Array<CharacterDto>;
  myMail: Array<PlayerMailDto>;
  myMailCount: Scalars['Int']['output'];
  myOnlineCharacters: Array<OnlineCharacterDto>;
  myPermissions: UserPermissions;
  myZoneGrants: Array<ZoneGrantDto>;
  object: ObjectDto;
  objectReset?: Maybe<ObjectResetDto>;
  objectResetsByRoom: Array<ObjectResetDto>;
  objectResetsByZone: Array<ObjectResetDto>;
  objects: Array<ObjectDto>;
  objectsByType: Array<ObjectDto>;
  objectsByZone: Array<ObjectDto>;
  objectsCount: Scalars['Int']['output'];
  onlineCharacters: Array<OnlineCharacterDto>;
  /** Get list of online players in FieryMUD */
  onlinePlayers: Array<OnlinePlayerType>;
  playerMail?: Maybe<PlayerMailDto>;
  playerMailCount: Scalars['Int']['output'];
  playerMails: Array<PlayerMailDto>;
  race: RaceDto;
  /** Get all skills for a race */
  raceSkills: Array<RaceSkillDto>;
  races: Array<RaceDto>;
  racesCount: Scalars['Int']['output'];
  room: RoomDto;
  rooms: Array<RoomDto>;
  roomsByZone: Array<RoomDto>;
  roomsCount: Scalars['Int']['output'];
  /** Search help entries by keyword, title, or content */
  searchHelp: Array<HelpEntryDto>;
  searchMobs: Array<MobDto>;
  searchObjects: Array<ObjectDto>;
  /** Search socials by name pattern */
  searchSocials: Array<SocialDto>;
  /** Get server statistics and info from FieryMUD */
  serverStatus: ServerStatusType;
  shop: ShopDto;
  shopByKeeper: ShopDto;
  shops: Array<ShopDto>;
  shopsByZone: Array<ShopDto>;
  shopsCount: Scalars['Int']['output'];
  /** Get a single social by ID */
  social: SocialDto;
  /** Get a social by its command name */
  socialByName: SocialDto;
  /** Get all social commands */
  socials: Array<SocialDto>;
  /** Get total count of socials */
  socialsCount: Scalars['Int']['output'];
  /** Get a single system text entry by ID */
  systemText: SystemTextDto;
  /** Get system text by key */
  systemTextByKey: SystemTextDto;
  /** Get all system text entries */
  systemTexts: Array<SystemTextDto>;
  /** Get system text entries by category */
  systemTextsByCategory: Array<SystemTextDto>;
  trigger: TriggerDto;
  triggers: Array<TriggerDto>;
  triggersByAttachment: Array<TriggerDto>;
  triggersNeedingReview: Array<TriggerDto>;
  triggersNeedingReviewCount: Scalars['Int']['output'];
  user: User;
  userPermissions: UserPermissions;
  userZoneGrants: Array<ZoneGrantDto>;
  users: Array<User>;
  /** Get validation reports for all zones */
  validateAllZones: Array<ValidationReportType>;
  validateCharacterPassword: Scalars['Boolean']['output'];
  /** Get validation report for a specific zone */
  validateZone: ValidationReportType;
  zone: ZoneDto;
  zones: Array<ZoneDto>;
  zonesCount: Scalars['Int']['output'];
};

export type QueryAbilitiesArgs = {
  abilityType?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryAbilitiesCountArgs = {
  abilityType?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryAbilityArgs = {
  id: Scalars['ID']['input'];
};

export type QueryAbilitySchoolArgs = {
  id: Scalars['ID']['input'];
};

export type QueryActiveCharacterEffectsArgs = {
  characterId: Scalars['ID']['input'];
};

export type QueryAllAccountMailArgs = {
  filter?: InputMaybe<AccountMailFilterInput>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryBanHistoryArgs = {
  userId: Scalars['ID']['input'];
};

export type QueryBoardArgs = {
  alias?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryBoardMessageArgs = {
  id: Scalars['Int']['input'];
};

export type QueryBoardMessagesArgs = {
  boardId: Scalars['Int']['input'];
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryBoardMessagesCountArgs = {
  boardId?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryBoardsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryCharacterArgs = {
  id: Scalars['ID']['input'];
};

export type QueryCharacterEffectArgs = {
  id: Scalars['ID']['input'];
};

export type QueryCharacterEffectsArgs = {
  characterId: Scalars['ID']['input'];
};

export type QueryCharacterItemArgs = {
  id: Scalars['ID']['input'];
};

export type QueryCharacterItemsArgs = {
  characterId: Scalars['ID']['input'];
};

export type QueryCharacterLinkingInfoArgs = {
  characterName: Scalars['String']['input'];
};

export type QueryCharacterSessionInfoArgs = {
  characterId: Scalars['ID']['input'];
};

export type QueryCharactersArgs = {
  filter?: InputMaybe<CharacterFilterInput>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryCharactersCountArgs = {
  filter?: InputMaybe<CharacterFilterInput>;
};

export type QueryClassArgs = {
  id: Scalars['ID']['input'];
};

export type QueryClassByNameArgs = {
  name: Scalars['String']['input'];
};

export type QueryClassCirclesListArgs = {
  classId: Scalars['Int']['input'];
};

export type QueryClassSkillsArgs = {
  classId: Scalars['Int']['input'];
};

export type QueryClassesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryCommandArgs = {
  name: Scalars['String']['input'];
};

export type QueryCommandsByCategoryArgs = {
  category: CommandCategory;
};

export type QueryEffectArgs = {
  id: Scalars['ID']['input'];
};

export type QueryEffectsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryEffectsCountArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryEquipmentSetArgs = {
  id: Scalars['ID']['input'];
};

export type QueryGameConfigArgs = {
  category: Scalars['String']['input'];
  key: Scalars['String']['input'];
};

export type QueryGameConfigsByCategoryArgs = {
  category: Scalars['String']['input'];
};

export type QueryGrantArgs = {
  id: Scalars['ID']['input'];
};

export type QueryGrantsArgs = {
  resourceType?: InputMaybe<GrantResourceType>;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type QueryHelpByKeywordArgs = {
  keyword: Scalars['String']['input'];
};

export type QueryHelpEntriesArgs = {
  filter?: InputMaybe<HelpEntryFilterInput>;
};

export type QueryHelpEntriesCountArgs = {
  filter?: InputMaybe<HelpEntryFilterInput>;
};

export type QueryHelpEntryArgs = {
  id: Scalars['ID']['input'];
};

export type QueryLevelDefinitionArgs = {
  level: Scalars['Int']['input'];
};

export type QueryLoginMessageArgs = {
  id: Scalars['ID']['input'];
};

export type QueryLoginMessagesByStageArgs = {
  stage: LoginStage;
};

export type QueryMobArgs = {
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type QueryMobResetArgs = {
  id: Scalars['ID']['input'];
};

export type QueryMobResetsArgs = {
  mobId: Scalars['Int']['input'];
  mobZoneId: Scalars['Int']['input'];
};

export type QueryMobsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryMobsByZoneArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  zoneId: Scalars['Int']['input'];
};

export type QueryMyAccountMailArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryMyMailArgs = {
  characterId: Scalars['String']['input'];
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryMyMailCountArgs = {
  characterId: Scalars['String']['input'];
};

export type QueryObjectArgs = {
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type QueryObjectResetArgs = {
  id: Scalars['ID']['input'];
};

export type QueryObjectResetsByRoomArgs = {
  roomId: Scalars['Int']['input'];
  roomZoneId: Scalars['Int']['input'];
};

export type QueryObjectResetsByZoneArgs = {
  zoneId: Scalars['Int']['input'];
};

export type QueryObjectsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryObjectsByTypeArgs = {
  type: ObjectType;
};

export type QueryObjectsByZoneArgs = {
  zoneId: Scalars['Int']['input'];
};

export type QueryOnlineCharactersArgs = {
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type QueryPlayerMailArgs = {
  id: Scalars['Int']['input'];
};

export type QueryPlayerMailCountArgs = {
  filter?: InputMaybe<PlayerMailFilterInput>;
};

export type QueryPlayerMailsArgs = {
  filter?: InputMaybe<PlayerMailFilterInput>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryRaceArgs = {
  race: Race;
};

export type QueryRaceSkillsArgs = {
  race: Race;
};

export type QueryRoomArgs = {
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type QueryRoomsArgs = {
  lightweight?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryRoomsByZoneArgs = {
  lightweight?: InputMaybe<Scalars['Boolean']['input']>;
  zoneId: Scalars['Int']['input'];
};

export type QueryRoomsCountArgs = {
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type QuerySearchHelpArgs = {
  filter?: InputMaybe<HelpEntryFilterInput>;
  query: Scalars['String']['input'];
};

export type QuerySearchMobsArgs = {
  limit?: Scalars['Int']['input'];
  search: Scalars['String']['input'];
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type QuerySearchObjectsArgs = {
  limit?: Scalars['Int']['input'];
  search: Scalars['String']['input'];
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type QuerySearchSocialsArgs = {
  query: Scalars['String']['input'];
};

export type QueryShopArgs = {
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type QueryShopByKeeperArgs = {
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type QueryShopsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryShopsByZoneArgs = {
  zoneId: Scalars['Int']['input'];
};

export type QuerySocialArgs = {
  id: Scalars['ID']['input'];
};

export type QuerySocialByNameArgs = {
  name: Scalars['String']['input'];
};

export type QuerySystemTextArgs = {
  id: Scalars['ID']['input'];
};

export type QuerySystemTextByKeyArgs = {
  key: Scalars['String']['input'];
};

export type QuerySystemTextsByCategoryArgs = {
  category: Scalars['String']['input'];
};

export type QueryTriggerArgs = {
  id: Scalars['Float']['input'];
};

export type QueryTriggersByAttachmentArgs = {
  attachType: ScriptType;
  entityId: Scalars['Int']['input'];
};

export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};

export type QueryUserPermissionsArgs = {
  userId: Scalars['ID']['input'];
};

export type QueryUserZoneGrantsArgs = {
  userId: Scalars['String']['input'];
};

export type QueryValidateCharacterPasswordArgs = {
  characterName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type QueryValidateZoneArgs = {
  zoneId: Scalars['Int']['input'];
};

export type QueryZoneArgs = {
  id: Scalars['Int']['input'];
};

export type QueryZonesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type Race =
  | 'ANIMAL'
  | 'ARBOREAN'
  | 'BARBARIAN'
  | 'BROWNIE'
  | 'DEMON'
  | 'DRAGONBORN_ACID'
  | 'DRAGONBORN_FIRE'
  | 'DRAGONBORN_FROST'
  | 'DRAGONBORN_GAS'
  | 'DRAGONBORN_LIGHTNING'
  | 'DRAGON_ACID'
  | 'DRAGON_FIRE'
  | 'DRAGON_FROST'
  | 'DRAGON_GAS'
  | 'DRAGON_GENERAL'
  | 'DRAGON_LIGHTNING'
  | 'DROW'
  | 'DUERGAR'
  | 'DWARF'
  | 'ELF'
  | 'FAERIE_SEELIE'
  | 'FAERIE_UNSEELIE'
  | 'GIANT'
  | 'GNOME'
  | 'GOBLIN'
  | 'HALFLING'
  | 'HALF_ELF'
  | 'HUMAN'
  | 'HUMANOID'
  | 'NYMPH'
  | 'OGRE'
  | 'ORC'
  | 'OTHER'
  | 'PLANT'
  | 'SVERFNEBLIN'
  | 'TROLL';

export type RaceAlign = 'EVIL' | 'GOOD' | 'UNKNOWN';

export type RaceDto = {
  __typename?: 'RaceDto';
  bonusDamroll: Scalars['Int']['output'];
  bonusHitroll: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  defaultAlignment: Scalars['Int']['output'];
  defaultComposition: Composition;
  defaultLifeforce: LifeForce;
  defaultSize: Size;
  expFactor: Scalars['Int']['output'];
  focusBonus: Scalars['Int']['output'];
  hpFactor: Scalars['Int']['output'];
  humanoid: Scalars['Boolean']['output'];
  keywords: Scalars['String']['output'];
  magical: Scalars['Boolean']['output'];
  maxCharisma: Scalars['Int']['output'];
  maxConstitution: Scalars['Int']['output'];
  maxDexterity: Scalars['Int']['output'];
  maxIntelligence: Scalars['Int']['output'];
  maxStrength: Scalars['Int']['output'];
  maxWisdom: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  permanentEffects: Array<EffectFlag>;
  plainName: Scalars['String']['output'];
  playable: Scalars['Boolean']['output'];
  race: Race;
  raceAlign: RaceAlign;
  updatedAt: Scalars['DateTime']['output'];
};

export type RaceSkillDto = {
  __typename?: 'RaceSkillDto';
  bonus: Scalars['Int']['output'];
  category: SkillCategory;
  id: Scalars['ID']['output'];
  race: Race;
  /** Race name */
  raceName: Scalars['String']['output'];
  skillId: Scalars['Int']['output'];
  /** Skill name */
  skillName: Scalars['String']['output'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type RequestPasswordResetInput = {
  email: Scalars['String']['input'];
};

export type ResetMode = 'EMPTY' | 'NEVER' | 'NORMAL';

export type ResetPasswordInput = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type RoomDto = {
  __typename?: 'RoomDto';
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  exits: Array<RoomExitDto>;
  extraDescs: Array<RoomExtraDescriptionDto>;
  flags: Array<RoomFlag>;
  id: Scalars['Int']['output'];
  layoutX?: Maybe<Scalars['Int']['output']>;
  layoutY?: Maybe<Scalars['Int']['output']>;
  layoutZ?: Maybe<Scalars['Int']['output']>;
  mobs: Array<MobDto>;
  name: Scalars['String']['output'];
  objects: Array<ObjectDto>;
  /** @deprecated Use description instead */
  roomDescription: Scalars['String']['output'];
  sector: Sector;
  shops: Array<ShopDto>;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
  zoneId: Scalars['Int']['output'];
};

export type RoomExitDto = {
  __typename?: 'RoomExitDto';
  description?: Maybe<Scalars['String']['output']>;
  direction: Direction;
  flags: Array<ExitFlag>;
  id: Scalars['String']['output'];
  key?: Maybe<Scalars['String']['output']>;
  /** @deprecated Use keywords array instead */
  keyword?: Maybe<Scalars['String']['output']>;
  keywords: Array<Scalars['String']['output']>;
  roomId: Scalars['Int']['output'];
  roomZoneId: Scalars['Int']['output'];
  toRoomId?: Maybe<Scalars['Int']['output']>;
  toZoneId?: Maybe<Scalars['Int']['output']>;
};

export type RoomExtraDescriptionDto = {
  __typename?: 'RoomExtraDescriptionDto';
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  keywords: Array<Scalars['String']['output']>;
};

export type RoomFlag =
  | 'ALT_EXIT'
  | 'ALWAYS_LIT'
  | 'ARENA'
  | 'ATRIUM'
  | 'BFS_MARK'
  | 'CAMPSITE'
  | 'DARK'
  | 'DEATH'
  | 'EFFECTS_NEXT'
  | 'FERRY_DEST'
  | 'GODROOM'
  | 'GUILDHALL'
  | 'HOUSE'
  | 'HOUSECRASH'
  | 'INDOORS'
  | 'INN'
  | 'ISOLATED'
  | 'LARGE'
  | 'MEDIUM'
  | 'MEDIUM_LARGE'
  | 'MEDIUM_SMALL'
  | 'NO_MAGIC'
  | 'NO_MOB'
  | 'NO_RECALL'
  | 'NO_SCAN'
  | 'NO_SHIFT'
  | 'NO_SUMMON'
  | 'NO_TRACK'
  | 'NO_WELL'
  | 'OBSERVATORY'
  | 'OLC'
  | 'ONE_PERSON'
  | 'PEACEFUL'
  | 'PRIVATE'
  | 'SMALL'
  | 'SOUNDPROOF'
  | 'TEMPLE'
  | 'TUNNEL'
  | 'UNDERDARK'
  | 'VERY_SMALL'
  | 'WORLDMAP';

export type RoomReference = {
  __typename?: 'RoomReference';
  vnum: Scalars['Int']['output'];
  zoneId: Scalars['Int']['output'];
};

export type RoomReferenceInput = {
  vnum: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type RoomSummaryDto = {
  __typename?: 'RoomSummaryDto';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  zoneId: Scalars['Int']['output'];
};

export type SaveType =
  | 'BREATH'
  | 'PARALYSIS'
  | 'PETRIFICATION'
  | 'POISON'
  | 'ROD'
  | 'SPELL'
  | 'WAND';

export type ScriptType = 'MOB' | 'OBJECT' | 'WORLD';

export type Sector =
  | 'AIR'
  | 'AIRPLANE'
  | 'ASTRALPLANE'
  | 'AVERNUS'
  | 'BEACH'
  | 'CAVE'
  | 'CITY'
  | 'EARTHPLANE'
  | 'ETHEREALPLANE'
  | 'FIELD'
  | 'FIREPLANE'
  | 'FOREST'
  | 'GRASSLANDS'
  | 'HILLS'
  | 'MOUNTAIN'
  | 'ROAD'
  | 'RUINS'
  | 'SHALLOWS'
  | 'STRUCTURE'
  | 'SWAMP'
  | 'UNDERDARK'
  | 'UNDERWATER'
  | 'WATER';

export type SendAccountMailInput = {
  body: Scalars['String']['input'];
  recipientUserId: Scalars['String']['input'];
  subject: Scalars['String']['input'];
};

export type SendBroadcastInput = {
  body: Scalars['String']['input'];
  subject: Scalars['String']['input'];
};

export type SendPlayerMailInput = {
  attachedCopper?: Scalars['Int']['input'];
  attachedGold?: Scalars['Int']['input'];
  attachedObjectId?: InputMaybe<Scalars['Int']['input']>;
  attachedObjectZoneId?: InputMaybe<Scalars['Int']['input']>;
  attachedPlatinum?: Scalars['Int']['input'];
  attachedSilver?: Scalars['Int']['input'];
  body: Scalars['String']['input'];
  recipientCharacterId: Scalars['String']['input'];
  senderCharacterId: Scalars['String']['input'];
};

/** Server information from FieryMUD */
export type ServerInfoType = {
  __typename?: 'ServerInfoType';
  maintenanceMode: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  port: Scalars['Int']['output'];
  running: Scalars['Boolean']['output'];
  tlsPort: Scalars['Int']['output'];
};

/** Server statistics from FieryMUD */
export type ServerStatsType = {
  __typename?: 'ServerStatsType';
  commandsPerSecond: Scalars['Float']['output'];
  currentConnections: Scalars['Int']['output'];
  failedCommands: Scalars['Int']['output'];
  failedLogins: Scalars['Int']['output'];
  peakConnections: Scalars['Int']['output'];
  totalCommands: Scalars['Int']['output'];
  totalConnections: Scalars['Int']['output'];
  totalLogins: Scalars['Int']['output'];
  uptimeSeconds: Scalars['Int']['output'];
};

/** Full server status from FieryMUD */
export type ServerStatusType = {
  __typename?: 'ServerStatusType';
  server: ServerInfoType;
  stats: ServerStatsType;
};

export type ShopAcceptDto = {
  __typename?: 'ShopAcceptDto';
  id: Scalars['String']['output'];
  keywords?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type ShopDto = {
  __typename?: 'ShopDto';
  accepts: Array<ShopAcceptDto>;
  buyMessages: Array<Scalars['String']['output']>;
  buyProfit: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  doNotBuyMessages: Array<Scalars['String']['output']>;
  flags: Array<ShopFlag>;
  hours: Array<ShopHourDto>;
  id: Scalars['Int']['output'];
  items: Array<ShopItemDto>;
  keeper?: Maybe<KeeperDto>;
  keeperId?: Maybe<Scalars['Int']['output']>;
  missingCashMessages: Array<Scalars['String']['output']>;
  noSuchItemMessages: Array<Scalars['String']['output']>;
  sellMessages: Array<Scalars['String']['output']>;
  sellProfit: Scalars['Float']['output'];
  temper: Scalars['Int']['output'];
  tradesWithFlags: Array<ShopTradesWith>;
  updatedAt: Scalars['DateTime']['output'];
  zoneId: Scalars['Int']['output'];
};

export type ShopFlag =
  | 'USES_BANK'
  | 'WILL_BANK_MONEY'
  | 'WILL_FIGHT'
  | 'WILL_START_FIGHT';

export type ShopHourDto = {
  __typename?: 'ShopHourDto';
  close: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  open: Scalars['Int']['output'];
};

export type ShopHourInput = {
  close: Scalars['Int']['input'];
  open: Scalars['Int']['input'];
};

export type ShopItemDto = {
  __typename?: 'ShopItemDto';
  amount: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  object?: Maybe<ObjectSummaryDto>;
  objectId: Scalars['Int']['output'];
  objectZoneId: Scalars['Int']['output'];
};

export type ShopItemInput = {
  amount: Scalars['Int']['input'];
  objectId: Scalars['Int']['input'];
  objectZoneId: Scalars['Int']['input'];
};

export type ShopTradesWith =
  | 'ALIGNMENT'
  | 'CLASS'
  | 'RACE'
  | 'TRADE_NOCLERIC'
  | 'TRADE_NOEVIL'
  | 'TRADE_NOGOOD'
  | 'TRADE_NONEUTRAL'
  | 'TRADE_NOTHIEF'
  | 'TRADE_NOWARRIOR';

export type Size =
  | 'COLOSSAL'
  | 'GARGANTUAN'
  | 'GIANT'
  | 'HUGE'
  | 'LARGE'
  | 'MEDIUM'
  | 'MOUNTAINOUS'
  | 'SMALL'
  | 'TINY'
  | 'TITANIC';

export type SkillCategory =
  | 'FORBIDDEN'
  | 'PRIMARY'
  | 'RESTRICTED'
  | 'SECONDARY';

/** Social command (emote/action) */
export type SocialDto = {
  __typename?: 'SocialDto';
  /** Message to actor when targeting self */
  charAuto?: Maybe<Scalars['String']['output']>;
  /** Message to actor when target found */
  charFound?: Maybe<Scalars['String']['output']>;
  /** Message to actor when no target */
  charNoArg?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  /** Hide who initiated the action */
  hide: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  /** Minimum position for the target */
  minVictimPosition: Position;
  /** Command name (e.g., smile, bow, hug) */
  name: Scalars['String']['output'];
  /** Message when target not found */
  notFound?: Maybe<Scalars['String']['output']>;
  /** Message to room when actor targets self */
  othersAuto?: Maybe<Scalars['String']['output']>;
  /** Message to room (excluding target) when target found */
  othersFound?: Maybe<Scalars['String']['output']>;
  /** Message to room when no target */
  othersNoArg?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  /** Message to target */
  victFound?: Maybe<Scalars['String']['output']>;
};

export type SpawnConditionDto = {
  __typename?: 'SpawnConditionDto';
  id: Scalars['String']['output'];
  parameters: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type SpellSphere =
  | 'AIR'
  | 'DEATH'
  | 'DIVINATION'
  | 'EARTH'
  | 'ENCHANTMENT'
  | 'FIRE'
  | 'GENERIC'
  | 'HEALING'
  | 'PROTECTION'
  | 'SUMMONING'
  | 'WATER';

export type Stance =
  | 'ALERT'
  | 'DEAD'
  | 'FIGHTING'
  | 'INCAPACITATED'
  | 'MORT'
  | 'RESTING'
  | 'SLEEPING'
  | 'STUNNED';

export type Subscription = {
  __typename?: 'Subscription';
  /** Subscribe to admin alerts and system events */
  adminAlerts: GameEvent;
  /** Subscribe to all chat messages (gossip, shout, say, etc.) */
  chatMessages: GameEvent;
  /** Subscribe to all game events from FieryMUD */
  gameEvents: GameEvent;
  /** Subscribe to game events by category (player, chat, admin, world) */
  gameEventsByCategory: GameEvent;
  /** Subscribe to specific types of game events */
  gameEventsByTypes: GameEvent;
  /** Subscribe to player activity events (login, logout, death, level up) */
  playerActivity: GameEvent;
  /** Subscribe to events involving a specific player */
  playerEvents: GameEvent;
  /** Subscribe to world events (zone loads, resets, boss spawns) */
  worldEvents: GameEvent;
  /** Subscribe to events in a specific zone */
  zoneEvents: GameEvent;
};

export type SubscriptionGameEventsByCategoryArgs = {
  category: GameEventCategory;
};

export type SubscriptionGameEventsByTypesArgs = {
  types: Array<GameEventType>;
};

export type SubscriptionPlayerEventsArgs = {
  playerName: Scalars['String']['input'];
};

export type SubscriptionZoneEventsArgs = {
  zoneId: Scalars['Int']['input'];
};

/** Category of system text */
export type SystemTextCategory = 'COMBAT' | 'IMMORTAL' | 'LOGIN' | 'SYSTEM';

/** System text content (MOTD, news, credits, etc.) */
export type SystemTextDto = {
  __typename?: 'SystemTextDto';
  /** Text category */
  category: SystemTextCategory;
  /** Text content */
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  /** Whether this text is active */
  isActive: Scalars['Boolean']['output'];
  /** Unique key identifier */
  key: Scalars['String']['output'];
  /** Minimum level to view this text */
  minLevel: Scalars['Int']['output'];
  /** Display title */
  title?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type TargetScope =
  | 'AREA'
  | 'CHAIN'
  | 'CONE'
  | 'GROUP'
  | 'LINE'
  | 'ROOM'
  | 'SELF'
  | 'SINGLE';

export type TargetType =
  | 'ALLY_GROUP'
  | 'ALLY_NPC'
  | 'ALLY_PC'
  | 'CORPSE'
  | 'ENEMY_NPC'
  | 'ENEMY_PC'
  | 'OBJECT_INV'
  | 'OBJECT_WORLD'
  | 'SELF';

export type TriggerDto = {
  __typename?: 'TriggerDto';
  argList: Array<Scalars['String']['output']>;
  attachType: ScriptType;
  commands: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  flags: Array<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  legacyScript?: Maybe<Scalars['String']['output']>;
  legacyVnum?: Maybe<Scalars['Int']['output']>;
  mobId?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  needsReview: Scalars['Boolean']['output'];
  numArgs: Scalars['Int']['output'];
  objectId?: Maybe<Scalars['Int']['output']>;
  syntaxError?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['String']['output']>;
  variables: Scalars['String']['output'];
  zoneId?: Maybe<Scalars['Int']['output']>;
};

export type UnbanUserInput = {
  userId: Scalars['ID']['input'];
};

export type UnlinkCharacterInput = {
  characterId: Scalars['ID']['input'];
};

export type UpdateAbilityEffectsInput = {
  effects: Array<AbilityEffectItemInput>;
};

export type UpdateAbilityInput = {
  abilityType?: InputMaybe<Scalars['String']['input']>;
  castTimeRounds?: InputMaybe<Scalars['Int']['input']>;
  combatOk?: InputMaybe<Scalars['Boolean']['input']>;
  cooldownMs?: InputMaybe<Scalars['Int']['input']>;
  damageType?: InputMaybe<ElementType>;
  description?: InputMaybe<Scalars['String']['input']>;
  humanoidOnly?: InputMaybe<Scalars['Boolean']['input']>;
  inCombatOnly?: InputMaybe<Scalars['Boolean']['input']>;
  isArea?: InputMaybe<Scalars['Boolean']['input']>;
  luaScript?: InputMaybe<Scalars['String']['input']>;
  memorizationTime?: InputMaybe<Scalars['Int']['input']>;
  minPosition?: InputMaybe<Position>;
  name?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  pages?: InputMaybe<Scalars['Int']['input']>;
  questOnly?: InputMaybe<Scalars['Boolean']['input']>;
  schoolId?: InputMaybe<Scalars['Int']['input']>;
  sphere?: InputMaybe<SpellSphere>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  violent?: InputMaybe<Scalars['Boolean']['input']>;
};

export type UpdateAbilityMessagesInput = {
  failToCaster?: InputMaybe<Scalars['String']['input']>;
  failToRoom?: InputMaybe<Scalars['String']['input']>;
  failToVictim?: InputMaybe<Scalars['String']['input']>;
  lookMessage?: InputMaybe<Scalars['String']['input']>;
  startToCaster?: InputMaybe<Scalars['String']['input']>;
  startToRoom?: InputMaybe<Scalars['String']['input']>;
  startToVictim?: InputMaybe<Scalars['String']['input']>;
  successSelfRoom?: InputMaybe<Scalars['String']['input']>;
  successToCaster?: InputMaybe<Scalars['String']['input']>;
  successToRoom?: InputMaybe<Scalars['String']['input']>;
  successToSelf?: InputMaybe<Scalars['String']['input']>;
  successToVictim?: InputMaybe<Scalars['String']['input']>;
  wearoffToRoom?: InputMaybe<Scalars['String']['input']>;
  wearoffToTarget?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateAbilityTargetingInput = {
  maxTargets?: InputMaybe<Scalars['Int']['input']>;
  range?: InputMaybe<Scalars['Int']['input']>;
  requireLos?: InputMaybe<Scalars['Boolean']['input']>;
  scope?: InputMaybe<TargetScope>;
  scopePattern?: InputMaybe<Scalars['String']['input']>;
  validTargets?: InputMaybe<Array<TargetType>>;
};

export type UpdateBoardInput = {
  locked?: InputMaybe<Scalars['Boolean']['input']>;
  privileges?: InputMaybe<Scalars['JSON']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateBoardMessageInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  sticky?: InputMaybe<Scalars['Boolean']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCharacterEffectInput = {
  duration?: InputMaybe<Scalars['Int']['input']>;
  strength?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateCharacterInput = {
  alignment?: InputMaybe<Scalars['Int']['input']>;
  charisma?: InputMaybe<Scalars['Int']['input']>;
  constitution?: InputMaybe<Scalars['Int']['input']>;
  currentRoom?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dexterity?: InputMaybe<Scalars['Int']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  hitPoints?: InputMaybe<Scalars['Int']['input']>;
  hitPointsMax?: InputMaybe<Scalars['Int']['input']>;
  homeRoom?: InputMaybe<Scalars['Int']['input']>;
  intelligence?: InputMaybe<Scalars['Int']['input']>;
  invisLevel?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  luck?: InputMaybe<Scalars['Int']['input']>;
  movement?: InputMaybe<Scalars['Int']['input']>;
  movementMax?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  olcZones?: InputMaybe<Array<Scalars['Int']['input']>>;
  pageLength?: InputMaybe<Scalars['Int']['input']>;
  playerClass?: InputMaybe<Scalars['String']['input']>;
  playerFlags?: InputMaybe<Array<Scalars['String']['input']>>;
  privilegeFlags?: InputMaybe<Array<Scalars['String']['input']>>;
  prompt?: InputMaybe<Scalars['String']['input']>;
  raceType?: InputMaybe<Scalars['String']['input']>;
  saveRoom?: InputMaybe<Scalars['Int']['input']>;
  strength?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Int']['input']>;
  wisdom?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateCharacterItemInput = {
  charges?: InputMaybe<Scalars['Int']['input']>;
  condition?: InputMaybe<Scalars['Int']['input']>;
  containerId?: InputMaybe<Scalars['Int']['input']>;
  customLongDesc?: InputMaybe<Scalars['String']['input']>;
  customShortDesc?: InputMaybe<Scalars['String']['input']>;
  equippedLocation?: InputMaybe<Scalars['String']['input']>;
  instanceFlags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateClassCircleInput = {
  circle?: InputMaybe<Scalars['Int']['input']>;
  minLevel?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateClassInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  hitDice?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  primaryStat?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateClassSkillInput = {
  minLevel?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateEffectInput = {
  defaultParams?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  effectType?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  paramSchema?: InputMaybe<Scalars['JSON']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateEquipmentSetInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating a game configuration value */
export type UpdateGameConfigInput = {
  /** Updated description */
  description?: InputMaybe<Scalars['String']['input']>;
  /** New value for this configuration */
  value: Scalars['String']['input'];
};

export type UpdateGrantInput = {
  expiresAt?: InputMaybe<Scalars['DateTime']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  permissions?: InputMaybe<Array<GrantPermission>>;
};

/** Input for updating a help entry */
export type UpdateHelpEntryInput = {
  /** Category (e.g., spell, skill, command) */
  category?: InputMaybe<Scalars['String']['input']>;
  /** Class/circle requirements */
  classes?: InputMaybe<Scalars['JSON']['input']>;
  /** Full help text content */
  content?: InputMaybe<Scalars['String']['input']>;
  /** Duration description */
  duration?: InputMaybe<Scalars['String']['input']>;
  /** Keywords for looking up this help entry */
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Minimum player level to view */
  minLevel?: InputMaybe<Scalars['Int']['input']>;
  /** Spell sphere */
  sphere?: InputMaybe<Scalars['String']['input']>;
  /** Primary display title */
  title?: InputMaybe<Scalars['String']['input']>;
  /** Usage syntax */
  usage?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating a level definition */
export type UpdateLevelDefinitionInput = {
  /** Experience required */
  expRequired?: InputMaybe<Scalars['Int']['input']>;
  /** HP gained at this level */
  hpGain?: InputMaybe<Scalars['Int']['input']>;
  /** Display name for this level */
  name?: InputMaybe<Scalars['String']['input']>;
  /** Permissions for this level */
  permissions?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Stamina gained at this level */
  staminaGain?: InputMaybe<Scalars['Int']['input']>;
};

/** Input for updating a login message */
export type UpdateLoginMessageInput = {
  /** Whether this message is active */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Message content */
  message?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMobInput = {
  accuracy?: InputMaybe<Scalars['Int']['input']>;
  alignment?: InputMaybe<Scalars['Int']['input']>;
  armorClass?: InputMaybe<Scalars['Int']['input']>;
  armorRating?: InputMaybe<Scalars['Int']['input']>;
  attackPower?: InputMaybe<Scalars['Int']['input']>;
  charisma?: InputMaybe<Scalars['Int']['input']>;
  classId?: InputMaybe<Scalars['Int']['input']>;
  composition?: InputMaybe<Composition>;
  concealment?: InputMaybe<Scalars['Int']['input']>;
  constitution?: InputMaybe<Scalars['Int']['input']>;
  damageDice?: InputMaybe<Scalars['String']['input']>;
  damageReductionPercent?: InputMaybe<Scalars['Int']['input']>;
  damageType?: InputMaybe<DamageType>;
  dexterity?: InputMaybe<Scalars['Int']['input']>;
  effectFlags?: InputMaybe<Array<EffectFlag>>;
  evasion?: InputMaybe<Scalars['Int']['input']>;
  examineDescription?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Gender>;
  hardness?: InputMaybe<Scalars['Int']['input']>;
  hitRoll?: InputMaybe<Scalars['Int']['input']>;
  hpDice?: InputMaybe<Scalars['String']['input']>;
  intelligence?: InputMaybe<Scalars['Int']['input']>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  level?: InputMaybe<Scalars['Int']['input']>;
  lifeForce?: InputMaybe<LifeForce>;
  mobFlags?: InputMaybe<Array<MobFlag>>;
  name?: InputMaybe<Scalars['String']['input']>;
  penetrationFlat?: InputMaybe<Scalars['Int']['input']>;
  penetrationPercent?: InputMaybe<Scalars['Int']['input']>;
  perception?: InputMaybe<Scalars['Int']['input']>;
  position?: InputMaybe<Position>;
  race?: InputMaybe<Race>;
  resistanceAcid?: InputMaybe<Scalars['Int']['input']>;
  resistanceCold?: InputMaybe<Scalars['Int']['input']>;
  resistanceFire?: InputMaybe<Scalars['Int']['input']>;
  resistanceLightning?: InputMaybe<Scalars['Int']['input']>;
  resistancePoison?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<MobRole>;
  roomDescription?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Size>;
  soak?: InputMaybe<Scalars['Int']['input']>;
  spellPower?: InputMaybe<Scalars['Int']['input']>;
  stance?: InputMaybe<Stance>;
  strength?: InputMaybe<Scalars['Int']['input']>;
  wardPercent?: InputMaybe<Scalars['Int']['input']>;
  wealth?: InputMaybe<Scalars['Int']['input']>;
  wisdom?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateMobResetEquipmentInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  maxInstances?: InputMaybe<Scalars['Int']['input']>;
  objectId?: InputMaybe<Scalars['Int']['input']>;
  objectZoneId?: InputMaybe<Scalars['Int']['input']>;
  probability?: InputMaybe<Scalars['Float']['input']>;
  wearLocation?: InputMaybe<WearFlag>;
};

export type UpdateMobResetInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  equipment?: InputMaybe<Array<UpdateMobResetEquipmentInput>>;
  maxInstances?: InputMaybe<Scalars['Int']['input']>;
  probability?: InputMaybe<Scalars['Float']['input']>;
  roomId?: InputMaybe<Scalars['Int']['input']>;
  roomZoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateObjectInput = {
  actionDescription?: InputMaybe<Scalars['String']['input']>;
  concealment?: InputMaybe<Scalars['Int']['input']>;
  cost?: InputMaybe<Scalars['Int']['input']>;
  decomposeTimer?: InputMaybe<Scalars['Int']['input']>;
  effectFlags?: InputMaybe<Array<EffectFlag>>;
  examineDescription?: InputMaybe<Scalars['String']['input']>;
  flags?: InputMaybe<Array<ObjectFlag>>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  roomDescription?: InputMaybe<Scalars['String']['input']>;
  timer?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ObjectType>;
  values?: InputMaybe<Scalars['JSON']['input']>;
  wearFlags?: InputMaybe<Array<WearFlag>>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateObjectResetInput = {
  max?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  probability?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdatePreferencesInput = {
  /** List of favorite zone IDs */
  favoriteZones?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Recently visited rooms */
  recentRooms?: InputMaybe<Array<RoomReferenceInput>>;
  /** Recently visited zone IDs */
  recentZones?: InputMaybe<Array<Scalars['Int']['input']>>;
  /** Theme preference: light, dark, or system */
  theme?: InputMaybe<Scalars['String']['input']>;
  /** View mode preference: player or admin */
  viewMode?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfileInput = {
  email?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRaceInput = {
  bonusDamroll?: InputMaybe<Scalars['Int']['input']>;
  bonusHitroll?: InputMaybe<Scalars['Int']['input']>;
  defaultAlignment?: InputMaybe<Scalars['Int']['input']>;
  defaultComposition?: InputMaybe<Composition>;
  defaultLifeforce?: InputMaybe<LifeForce>;
  defaultSize?: InputMaybe<Size>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  expFactor?: InputMaybe<Scalars['Int']['input']>;
  focusBonus?: InputMaybe<Scalars['Int']['input']>;
  fullName?: InputMaybe<Scalars['String']['input']>;
  hpFactor?: InputMaybe<Scalars['Int']['input']>;
  humanoid?: InputMaybe<Scalars['Boolean']['input']>;
  keywords?: InputMaybe<Scalars['String']['input']>;
  magical?: InputMaybe<Scalars['Boolean']['input']>;
  maxCharisma?: InputMaybe<Scalars['Int']['input']>;
  maxConstitution?: InputMaybe<Scalars['Int']['input']>;
  maxDexterity?: InputMaybe<Scalars['Int']['input']>;
  maxIntelligence?: InputMaybe<Scalars['Int']['input']>;
  maxStrength?: InputMaybe<Scalars['Int']['input']>;
  maxWisdom?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  permanentEffects?: InputMaybe<Array<EffectFlag>>;
  plainName?: InputMaybe<Scalars['String']['input']>;
  playable?: InputMaybe<Scalars['Boolean']['input']>;
  raceAlign?: InputMaybe<RaceAlign>;
};

export type UpdateRaceSkillInput = {
  bonus?: InputMaybe<Scalars['Int']['input']>;
  category?: InputMaybe<SkillCategory>;
};

export type UpdateRoomInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  flags?: InputMaybe<Array<RoomFlag>>;
  layoutX?: InputMaybe<Scalars['Int']['input']>;
  layoutY?: InputMaybe<Scalars['Int']['input']>;
  layoutZ?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  roomDescription?: InputMaybe<Scalars['String']['input']>;
  sector?: InputMaybe<Sector>;
};

export type UpdateRoomPositionInput = {
  layoutX?: InputMaybe<Scalars['Int']['input']>;
  layoutY?: InputMaybe<Scalars['Int']['input']>;
  layoutZ?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateShopHoursInput = {
  hours: Array<ShopHourInput>;
};

export type UpdateShopInput = {
  buyMessages?: InputMaybe<Array<Scalars['String']['input']>>;
  buyProfit?: InputMaybe<Scalars['Float']['input']>;
  doNotBuyMessages?: InputMaybe<Array<Scalars['String']['input']>>;
  flags?: InputMaybe<Array<ShopFlag>>;
  keeperId?: InputMaybe<Scalars['Int']['input']>;
  missingCashMessages?: InputMaybe<Array<Scalars['String']['input']>>;
  noSuchItemMessages?: InputMaybe<Array<Scalars['String']['input']>>;
  sellMessages?: InputMaybe<Array<Scalars['String']['input']>>;
  sellProfit?: InputMaybe<Scalars['Float']['input']>;
  temper?: InputMaybe<Scalars['Int']['input']>;
  tradesWithFlags?: InputMaybe<Array<ShopTradesWith>>;
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateShopInventoryInput = {
  items: Array<ShopItemInput>;
};

/** Input for updating a social command */
export type UpdateSocialInput = {
  /** Message to actor when targeting self */
  charAuto?: InputMaybe<Scalars['String']['input']>;
  /** Message to actor when target found */
  charFound?: InputMaybe<Scalars['String']['input']>;
  /** Message to actor when no target */
  charNoArg?: InputMaybe<Scalars['String']['input']>;
  /** Hide who initiated the action */
  hide?: InputMaybe<Scalars['Boolean']['input']>;
  /** Minimum position for the target */
  minVictimPosition?: InputMaybe<Position>;
  /** Message when target not found */
  notFound?: InputMaybe<Scalars['String']['input']>;
  /** Message to room when actor targets self */
  othersAuto?: InputMaybe<Scalars['String']['input']>;
  /** Message to room (excluding target) when target found */
  othersFound?: InputMaybe<Scalars['String']['input']>;
  /** Message to room when no target */
  othersNoArg?: InputMaybe<Scalars['String']['input']>;
  /** Message to target */
  victFound?: InputMaybe<Scalars['String']['input']>;
};

/** Input for updating system text */
export type UpdateSystemTextInput = {
  /** Text category */
  category?: InputMaybe<SystemTextCategory>;
  /** Text content */
  content?: InputMaybe<Scalars['String']['input']>;
  /** Whether this text is active */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Minimum level to view */
  minLevel?: InputMaybe<Scalars['Int']['input']>;
  /** Display title */
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTriggerInput = {
  argList?: InputMaybe<Array<Scalars['String']['input']>>;
  attachType?: InputMaybe<ScriptType>;
  commands?: InputMaybe<Scalars['String']['input']>;
  mobId?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  numArgs?: InputMaybe<Scalars['Int']['input']>;
  objectId?: InputMaybe<Scalars['Int']['input']>;
  variables?: InputMaybe<Scalars['String']['input']>;
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateUserInput = {
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  role?: InputMaybe<UserRole>;
};

export type UpdateZoneInput = {
  climate?: InputMaybe<Climate>;
  hemisphere?: InputMaybe<Hemisphere>;
  lifespan?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  resetMode?: InputMaybe<ResetMode>;
  top?: InputMaybe<Scalars['Int']['input']>;
};

export type User = {
  __typename?: 'User';
  /** Ban records for this user */
  banRecords?: Maybe<Array<BanRecord>>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  /** Whether the user is currently banned */
  isBanned: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  /** User preferences for UI and navigation */
  preferences?: Maybe<UserPreferences>;
  role: UserRole;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

export type UserGrantDto = {
  __typename?: 'UserGrantDto';
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  grantedAt: Scalars['DateTime']['output'];
  grantedBy: Scalars['String']['output'];
  /** Username of the person who granted access */
  grantedByUsername: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  permissions: Array<GrantPermission>;
  resourceId: Scalars['String']['output'];
  resourceType: GrantResourceType;
  userId: Scalars['String']['output'];
  /** Username of the person who received the grant */
  username: Scalars['String']['output'];
};

export type UserPermissions = {
  __typename?: 'UserPermissions';
  canAccessDashboard: Scalars['Boolean']['output'];
  canManageUsers: Scalars['Boolean']['output'];
  canViewValidation: Scalars['Boolean']['output'];
  isBuilder: Scalars['Boolean']['output'];
  isCoder: Scalars['Boolean']['output'];
  isGod: Scalars['Boolean']['output'];
  isImmortal: Scalars['Boolean']['output'];
  isPlayer: Scalars['Boolean']['output'];
  maxCharacterLevel: Scalars['Float']['output'];
  role: UserRole;
};

export type UserPreferences = {
  __typename?: 'UserPreferences';
  /** List of favorite zone IDs */
  favoriteZones?: Maybe<Array<Scalars['Int']['output']>>;
  /** Recently visited rooms (max 10) */
  recentRooms?: Maybe<Array<RoomReference>>;
  /** Recently visited zone IDs (max 5) */
  recentZones?: Maybe<Array<Scalars['Int']['output']>>;
  /** Theme preference: light, dark, or system */
  theme?: Maybe<Scalars['String']['output']>;
  /** View mode preference: player or admin */
  viewMode?: Maybe<Scalars['String']['output']>;
};

/** User role in the MUD system */
export type UserRole =
  | 'BUILDER'
  | 'CODER'
  | 'GOD'
  | 'HEAD_BUILDER'
  | 'IMMORTAL'
  | 'PLAYER';

export type UserSummaryDto = {
  __typename?: 'UserSummaryDto';
  id: Scalars['ID']['output'];
  role: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

/** The category of validation issue */
export type ValidationCategory = 'CONSISTENCY' | 'INTEGRITY' | 'QUALITY';

/** The type of entity being validated */
export type ValidationEntity = 'MOB' | 'OBJECT' | 'ROOM' | 'SHOP' | 'ZONE';

export type ValidationIssue = {
  __typename?: 'ValidationIssue';
  category: ValidationCategory;
  description: Scalars['String']['output'];
  entity: ValidationEntity;
  entityId: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  severity: ValidationSeverity;
  suggestion?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: ValidationIssueType;
};

/** The type of validation issue */
export type ValidationIssueType = 'ERROR' | 'INFO' | 'WARNING';

export type ValidationReportType = {
  __typename?: 'ValidationReportType';
  errorCount: Scalars['Int']['output'];
  generatedAt: Scalars['DateTime']['output'];
  infoCount: Scalars['Int']['output'];
  issues: Array<ValidationIssue>;
  totalIssues: Scalars['Int']['output'];
  warningCount: Scalars['Int']['output'];
  zoneId: Scalars['Int']['output'];
  zoneName: Scalars['String']['output'];
};

/** The severity level of the validation issue */
export type ValidationSeverity = 'CRITICAL' | 'HIGH' | 'LOW' | 'MEDIUM';

export type ValidationSummaryType = {
  __typename?: 'ValidationSummaryType';
  errorCount: Scalars['Int']['output'];
  infoCount: Scalars['Int']['output'];
  totalIssues: Scalars['Int']['output'];
  totalZones: Scalars['Int']['output'];
  warningCount: Scalars['Int']['output'];
  zonesWithIssues: Scalars['Int']['output'];
};

export type WealthDisplayDto = {
  __typename?: 'WealthDisplayDto';
  copper: Scalars['Int']['output'];
  gold: Scalars['Int']['output'];
  platinum: Scalars['Int']['output'];
  silver: Scalars['Int']['output'];
  totalCopper: Scalars['BigInt']['output'];
};

export type WearFlag =
  | 'ABOUT'
  | 'ARMS'
  | 'BADGE'
  | 'BELT'
  | 'BODY'
  | 'EAR'
  | 'EYES'
  | 'FACE'
  | 'FEET'
  | 'FINGER'
  | 'HANDS'
  | 'HEAD'
  | 'HOLD'
  | 'HOVER'
  | 'LEGS'
  | 'NECK'
  | 'SHIELD'
  | 'TAKE'
  | 'TWO_HAND_WIELD'
  | 'WAIST'
  | 'WIELD'
  | 'WRIST';

export type ZoneCountsDto = {
  __typename?: 'ZoneCountsDto';
  mobs: Scalars['Int']['output'];
  objects: Scalars['Int']['output'];
  rooms: Scalars['Int']['output'];
  shops: Scalars['Int']['output'];
};

export type ZoneDto = {
  __typename?: 'ZoneDto';
  _count?: Maybe<ZoneCountsDto>;
  climate: Climate;
  createdAt: Scalars['DateTime']['output'];
  hemisphere: Hemisphere;
  id: Scalars['Int']['output'];
  lifespan: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  resetMode: ResetMode;
  rooms?: Maybe<Array<ZoneRoomDto>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ZoneGrantDto = {
  __typename?: 'ZoneGrantDto';
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  permissions: Array<GrantPermission>;
  zoneId: Scalars['ID']['output'];
  zoneName: Scalars['String']['output'];
};

export type ZoneRoomDto = {
  __typename?: 'ZoneRoomDto';
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  sector: Scalars['String']['output'];
};

export type GetGameConfigsQueryVariables = Exact<{ [key: string]: never }>;

export type GetGameConfigsQuery = {
  __typename?: 'Query';
  gameConfigCategories: Array<string>;
  gameConfigs: Array<{
    __typename?: 'GameConfigDto';
    id: string;
    category: string;
    key: string;
    value: string;
    valueType: ConfigValueType;
    description?: string | null;
    minValue?: string | null;
    maxValue?: string | null;
    isSecret: boolean;
    restartReq: boolean;
  }>;
};

export type UpdateGameConfigMutationVariables = Exact<{
  category: Scalars['String']['input'];
  key: Scalars['String']['input'];
  data: UpdateGameConfigInput;
}>;

export type UpdateGameConfigMutation = {
  __typename?: 'Mutation';
  updateGameConfig: { __typename?: 'GameConfigDto'; id: string; value: string };
};

export type GetLevelDefinitionsQueryVariables = Exact<{ [key: string]: never }>;

export type GetLevelDefinitionsQuery = {
  __typename?: 'Query';
  availablePermissions: Array<string>;
  levelDefinitions: Array<{
    __typename?: 'LevelDefinitionDto';
    level: number;
    name?: string | null;
    expRequired: number;
    hpGain: number;
    staminaGain: number;
    isImmortal: boolean;
    permissions: Array<string>;
  }>;
};

export type UpdateLevelDefinitionMutationVariables = Exact<{
  level: Scalars['Int']['input'];
  data: UpdateLevelDefinitionInput;
}>;

export type UpdateLevelDefinitionMutation = {
  __typename?: 'Mutation';
  updateLevelDefinition: {
    __typename?: 'LevelDefinitionDto';
    level: number;
    name?: string | null;
    expRequired: number;
    hpGain: number;
    staminaGain: number;
    permissions: Array<string>;
  };
};

export type GetSystemTextsQueryVariables = Exact<{ [key: string]: never }>;

export type GetSystemTextsQuery = {
  __typename?: 'Query';
  systemTexts: Array<{
    __typename?: 'SystemTextDto';
    id: string;
    key: string;
    category: SystemTextCategory;
    title?: string | null;
    content: string;
    minLevel: number;
    isActive: boolean;
  }>;
};

export type UpdateSystemTextMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateSystemTextInput;
}>;

export type UpdateSystemTextMutation = {
  __typename?: 'Mutation';
  updateSystemText: {
    __typename?: 'SystemTextDto';
    id: string;
    content: string;
    title?: string | null;
    isActive: boolean;
  };
};

export type GetLoginMessagesQueryVariables = Exact<{ [key: string]: never }>;

export type GetLoginMessagesQuery = {
  __typename?: 'Query';
  loginMessages: Array<{
    __typename?: 'LoginMessageDto';
    id: string;
    stage: LoginStage;
    variant: string;
    message: string;
    isActive: boolean;
  }>;
};

export type UpdateLoginMessageMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateLoginMessageInput;
}>;

export type UpdateLoginMessageMutation = {
  __typename?: 'Mutation';
  updateLoginMessage: {
    __typename?: 'LoginMessageDto';
    id: string;
    message: string;
    isActive: boolean;
  };
};

export type GetBoardPageQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type GetBoardPageQuery = {
  __typename?: 'Query';
  board?: {
    __typename?: 'BoardDto';
    id: number;
    alias: string;
    title: string;
    locked: boolean;
    privileges: any;
    messageCount?: number | null;
    messages?: Array<{
      __typename?: 'BoardMessageDto';
      id: number;
      poster: string;
      posterLevel: number;
      postedAt: any;
      subject: string;
      content: string;
      sticky: boolean;
      edits?: Array<{
        __typename?: 'BoardMessageEditDto';
        id: number;
        editor: string;
        editedAt: any;
      }> | null;
    }> | null;
  } | null;
};

export type CreateBoardMessagePageMutationVariables = Exact<{
  data: CreateBoardMessageInput;
}>;

export type CreateBoardMessagePageMutation = {
  __typename?: 'Mutation';
  createBoardMessage: {
    __typename?: 'BoardMessageDto';
    id: number;
    poster: string;
    subject: string;
    content: string;
    postedAt: any;
  };
};

export type UpdateBoardMessagePageMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  data: UpdateBoardMessageInput;
  editor?: InputMaybe<Scalars['String']['input']>;
}>;

export type UpdateBoardMessagePageMutation = {
  __typename?: 'Mutation';
  updateBoardMessage: {
    __typename?: 'BoardMessageDto';
    id: number;
    subject: string;
    content: string;
  };
};

export type DeleteBoardMessagePageMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type DeleteBoardMessagePageMutation = {
  __typename?: 'Mutation';
  deleteBoardMessage: { __typename?: 'BoardMessageDto'; id: number };
};

export type GetBoardsPageQueryVariables = Exact<{ [key: string]: never }>;

export type GetBoardsPageQuery = {
  __typename?: 'Query';
  boardsCount: number;
  boards: Array<{
    __typename?: 'BoardDto';
    id: number;
    alias: string;
    title: string;
    locked: boolean;
    messageCount?: number | null;
    createdAt: any;
    updatedAt: any;
  }>;
};

export type UpdateViewModeMutationVariables = Exact<{
  input: UpdatePreferencesInput;
}>;

export type UpdateViewModeMutation = {
  __typename?: 'Mutation';
  updateUserPreferences: {
    __typename?: 'User';
    id: string;
    preferences?: {
      __typename?: 'UserPreferences';
      viewMode?: string | null;
    } | null;
  };
};

export type GetHelpEntriesPageQueryVariables = Exact<{
  filter?: InputMaybe<HelpEntryFilterInput>;
}>;

export type GetHelpEntriesPageQuery = {
  __typename?: 'Query';
  helpEntriesCount: number;
  helpCategories: Array<string>;
  helpEntries: Array<{
    __typename?: 'HelpEntryDto';
    id: string;
    keywords: Array<string>;
    title: string;
    content: string;
    minLevel: number;
    category?: string | null;
    usage?: string | null;
    duration?: string | null;
    sphere?: string | null;
    classes?: any | null;
    sourceFile?: string | null;
    createdAt: any;
    updatedAt: any;
  }>;
};

export type SearchHelpPageQueryVariables = Exact<{
  query: Scalars['String']['input'];
  filter?: InputMaybe<HelpEntryFilterInput>;
}>;

export type SearchHelpPageQuery = {
  __typename?: 'Query';
  searchHelp: Array<{
    __typename?: 'HelpEntryDto';
    id: string;
    keywords: Array<string>;
    title: string;
    content: string;
    minLevel: number;
    category?: string | null;
    usage?: string | null;
    duration?: string | null;
    sphere?: string | null;
    classes?: any | null;
    sourceFile?: string | null;
  }>;
};

export type GetHelpByKeywordQueryVariables = Exact<{
  keyword: Scalars['String']['input'];
}>;

export type GetHelpByKeywordQuery = {
  __typename?: 'Query';
  helpByKeyword: {
    __typename?: 'HelpEntryDto';
    id: string;
    keywords: Array<string>;
    title: string;
    content: string;
    minLevel: number;
    category?: string | null;
    usage?: string | null;
    duration?: string | null;
    sphere?: string | null;
    classes?: any | null;
    sourceFile?: string | null;
  };
};

export type CreateHelpEntryPageMutationVariables = Exact<{
  data: CreateHelpEntryInput;
}>;

export type CreateHelpEntryPageMutation = {
  __typename?: 'Mutation';
  createHelpEntry: {
    __typename?: 'HelpEntryDto';
    id: string;
    keywords: Array<string>;
    title: string;
    content: string;
    category?: string | null;
  };
};

export type UpdateHelpEntryPageMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateHelpEntryInput;
}>;

export type UpdateHelpEntryPageMutation = {
  __typename?: 'Mutation';
  updateHelpEntry: {
    __typename?: 'HelpEntryDto';
    id: string;
    keywords: Array<string>;
    title: string;
    content: string;
    minLevel: number;
    category?: string | null;
    usage?: string | null;
    duration?: string | null;
    sphere?: string | null;
    classes?: any | null;
  };
};

export type DeleteHelpEntryPageMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteHelpEntryPageMutation = {
  __typename?: 'Mutation';
  deleteHelpEntry: boolean;
};

export type GetObjectInlineQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;

export type GetObjectInlineQuery = {
  __typename?: 'Query';
  object: {
    __typename?: 'ObjectDto';
    id: number;
    type: ObjectType;
    keywords: Array<string>;
    name: string;
    examineDescription: string;
    actionDescription?: string | null;
    weight: number;
    cost: number;
    timer: number;
    decomposeTimer: number;
    level: number;
    concealment: number;
    values: any;
    zoneId: number;
    flags: Array<ObjectFlag>;
    effectFlags: Array<EffectFlag>;
    wearFlags: Array<WearFlag>;
    createdAt: any;
    updatedAt: any;
  };
};

export type UpdateObjectInlineMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
  data: UpdateObjectInput;
}>;

export type UpdateObjectInlineMutation = {
  __typename?: 'Mutation';
  updateObject: {
    __typename?: 'ObjectDto';
    id: number;
    keywords: Array<string>;
    name: string;
    examineDescription: string;
  };
};

export type CreateObjectInlineMutationVariables = Exact<{
  data: CreateObjectInput;
}>;

export type CreateObjectInlineMutation = {
  __typename?: 'Mutation';
  createObject: {
    __typename?: 'ObjectDto';
    id: number;
    keywords: Array<string>;
    name: string;
  };
};

export type GetDashboardStatsQueryVariables = Exact<{ [key: string]: never }>;

export type GetDashboardStatsQuery = {
  __typename?: 'Query';
  zonesCount: number;
  roomsCount: number;
  mobsCount: number;
  objectsCount: number;
  shopsCount: number;
};

export type GetRacesInlineQueryVariables = Exact<{ [key: string]: never }>;

export type GetRacesInlineQuery = {
  __typename?: 'Query';
  racesCount: number;
  races: Array<{
    __typename?: 'RaceDto';
    race: Race;
    name: string;
    plainName: string;
    playable: boolean;
    humanoid: boolean;
    magical: boolean;
    defaultSize: Size;
    maxStrength: number;
    maxDexterity: number;
    maxIntelligence: number;
    maxWisdom: number;
    maxConstitution: number;
    maxCharisma: number;
    expFactor: number;
    hpFactor: number;
    permanentEffects: Array<EffectFlag>;
  }>;
};

export type GetRaceSkillsQueryVariables = Exact<{
  race: Race;
}>;

export type GetRaceSkillsQuery = {
  __typename?: 'Query';
  raceSkills: Array<{
    __typename?: 'RaceSkillDto';
    id: string;
    skillId: number;
    skillName: string;
    category: SkillCategory;
    bonus: number;
  }>;
};

export type UpdateRaceInlineMutationVariables = Exact<{
  race: Race;
  data: UpdateRaceInput;
}>;

export type UpdateRaceInlineMutation = {
  __typename?: 'Mutation';
  updateRace: {
    __typename?: 'RaceDto';
    race: Race;
    name: string;
    playable: boolean;
    humanoid: boolean;
    magical: boolean;
    defaultSize: Size;
    maxStrength: number;
    maxDexterity: number;
    maxIntelligence: number;
    maxWisdom: number;
    maxConstitution: number;
    maxCharisma: number;
    expFactor: number;
    hpFactor: number;
    permanentEffects: Array<EffectFlag>;
  };
};

export type GetTriggersForScriptsPageQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetTriggersForScriptsPageQuery = {
  __typename?: 'Query';
  triggers: Array<{
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    numArgs: number;
    argList: Array<string>;
    commands: string;
    zoneId?: number | null;
    mobId?: number | null;
    objectId?: number | null;
    flags: Array<string>;
    needsReview: boolean;
    syntaxError?: string | null;
    legacyVnum?: number | null;
    createdAt: any;
    updatedAt: any;
    createdBy?: string | null;
    updatedBy?: string | null;
  }>;
};

export type CreateTriggerFromScriptsPageMutationVariables = Exact<{
  input: CreateTriggerInput;
}>;

export type CreateTriggerFromScriptsPageMutation = {
  __typename?: 'Mutation';
  createTrigger: {
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    commands: string;
    zoneId?: number | null;
    mobId?: number | null;
    objectId?: number | null;
    needsReview: boolean;
  };
};

export type UpdateTriggerFromScriptsPageMutationVariables = Exact<{
  id: Scalars['Float']['input'];
  input: UpdateTriggerInput;
}>;

export type UpdateTriggerFromScriptsPageMutation = {
  __typename?: 'Mutation';
  updateTrigger: {
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    commands: string;
    zoneId?: number | null;
    mobId?: number | null;
    objectId?: number | null;
    needsReview: boolean;
  };
};

export type DeleteTriggerFromScriptsPageMutationVariables = Exact<{
  id: Scalars['Float']['input'];
}>;

export type DeleteTriggerFromScriptsPageMutation = {
  __typename?: 'Mutation';
  deleteTrigger: { __typename?: 'TriggerDto'; id: string };
};

export type MarkTriggerReviewedFromScriptsPageMutationVariables = Exact<{
  triggerId: Scalars['Int']['input'];
}>;

export type MarkTriggerReviewedFromScriptsPageMutation = {
  __typename?: 'Mutation';
  markTriggerReviewed: {
    __typename?: 'TriggerDto';
    id: string;
    needsReview: boolean;
  };
};

export type GetShopsInlineQueryVariables = Exact<{ [key: string]: never }>;

export type GetShopsInlineQuery = {
  __typename?: 'Query';
  shops: Array<{
    __typename?: 'ShopDto';
    id: number;
    buyProfit: number;
    sellProfit: number;
    temper: number;
    flags: Array<ShopFlag>;
    tradesWithFlags: Array<ShopTradesWith>;
    noSuchItemMessages: Array<string>;
    doNotBuyMessages: Array<string>;
    missingCashMessages: Array<string>;
    buyMessages: Array<string>;
    sellMessages: Array<string>;
    keeperId?: number | null;
    zoneId: number;
    createdAt: any;
    updatedAt: any;
    keeper?: {
      __typename?: 'KeeperDto';
      id: number;
      zoneId: number;
      name: string;
      keywords: Array<string>;
    } | null;
    items: Array<{
      __typename?: 'ShopItemDto';
      id: string;
      amount: number;
      objectId: number;
      object?: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        zoneId: number;
        name: string;
        type: string;
        cost?: number | null;
      } | null;
    }>;
    accepts: Array<{
      __typename?: 'ShopAcceptDto';
      id: string;
      type: string;
      keywords?: string | null;
    }>;
  }>;
};

export type GetShopsByZoneInlineQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;

export type GetShopsByZoneInlineQuery = {
  __typename?: 'Query';
  shopsByZone: Array<{
    __typename?: 'ShopDto';
    id: number;
    buyProfit: number;
    sellProfit: number;
    temper: number;
    flags: Array<ShopFlag>;
    tradesWithFlags: Array<ShopTradesWith>;
    noSuchItemMessages: Array<string>;
    doNotBuyMessages: Array<string>;
    missingCashMessages: Array<string>;
    buyMessages: Array<string>;
    sellMessages: Array<string>;
    keeperId?: number | null;
    zoneId: number;
    createdAt: any;
    updatedAt: any;
    keeper?: {
      __typename?: 'KeeperDto';
      id: number;
      zoneId: number;
      name: string;
      keywords: Array<string>;
    } | null;
    items: Array<{
      __typename?: 'ShopItemDto';
      id: string;
      amount: number;
      objectId: number;
      object?: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        zoneId: number;
        name: string;
        type: string;
        cost?: number | null;
      } | null;
    }>;
    accepts: Array<{
      __typename?: 'ShopAcceptDto';
      id: string;
      type: string;
      keywords?: string | null;
    }>;
  }>;
};

export type DeleteShopInlineMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;

export type DeleteShopInlineMutation = {
  __typename?: 'Mutation';
  deleteShop: { __typename?: 'ShopDto'; id: number };
};

export type GetSocialsPageQueryVariables = Exact<{ [key: string]: never }>;

export type GetSocialsPageQuery = {
  __typename?: 'Query';
  socialsCount: number;
  socials: Array<{
    __typename?: 'SocialDto';
    id: string;
    name: string;
    hide: boolean;
    minVictimPosition: Position;
    charNoArg?: string | null;
    othersNoArg?: string | null;
    charFound?: string | null;
    othersFound?: string | null;
    victFound?: string | null;
    notFound?: string | null;
    charAuto?: string | null;
    othersAuto?: string | null;
  }>;
};

export type CreateSocialPageMutationVariables = Exact<{
  data: CreateSocialInput;
}>;

export type CreateSocialPageMutation = {
  __typename?: 'Mutation';
  createSocial: {
    __typename?: 'SocialDto';
    id: string;
    name: string;
    hide: boolean;
    minVictimPosition: Position;
  };
};

export type UpdateSocialPageMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateSocialInput;
}>;

export type UpdateSocialPageMutation = {
  __typename?: 'Mutation';
  updateSocial: {
    __typename?: 'SocialDto';
    id: string;
    name: string;
    hide: boolean;
    minVictimPosition: Position;
    charNoArg?: string | null;
    othersNoArg?: string | null;
    charFound?: string | null;
    othersFound?: string | null;
    victFound?: string | null;
    notFound?: string | null;
    charAuto?: string | null;
    othersAuto?: string | null;
  };
};

export type DeleteSocialPageMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteSocialPageMutation = {
  __typename?: 'Mutation';
  deleteSocial: boolean;
};

export type UsersInlineQueryVariables = Exact<{ [key: string]: never }>;

export type UsersInlineQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'User';
    id: string;
    username: string;
    email: string;
    role: UserRole;
    isBanned: boolean;
    createdAt: any;
    lastLoginAt?: any | null;
    banRecords?: Array<{
      __typename?: 'BanRecord';
      id: string;
      reason: string;
      bannedAt: any;
      expiresAt?: any | null;
      admin?: { __typename?: 'AdminUser'; username: string } | null;
    }> | null;
  }>;
};

export type UpdateUserInlineMutationVariables = Exact<{
  input: UpdateUserInput;
}>;

export type UpdateUserInlineMutation = {
  __typename?: 'Mutation';
  updateUser: {
    __typename?: 'User';
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
};

export type BanUserInlineMutationVariables = Exact<{
  input: BanUserInput;
}>;

export type BanUserInlineMutation = {
  __typename?: 'Mutation';
  banUser: {
    __typename?: 'BanRecord';
    id: string;
    reason: string;
    bannedAt: any;
    userId: string;
  };
};

export type UnbanUserInlineMutationVariables = Exact<{
  input: UnbanUserInput;
}>;

export type UnbanUserInlineMutation = {
  __typename?: 'Mutation';
  unbanUser: {
    __typename?: 'BanRecord';
    id: string;
    unbannedAt?: any | null;
    userId: string;
  };
};

export type GetZonesDashboardQueryVariables = Exact<{ [key: string]: never }>;

export type GetZonesDashboardQuery = {
  __typename?: 'Query';
  roomsCount: number;
  zones: Array<{
    __typename?: 'ZoneDto';
    id: number;
    name: string;
    climate: Climate;
  }>;
};

export type RequestPasswordResetInlineMutationVariables = Exact<{
  input: RequestPasswordResetInput;
}>;

export type RequestPasswordResetInlineMutation = {
  __typename?: 'Mutation';
  requestPasswordReset: {
    __typename?: 'PasswordResetResponse';
    success: boolean;
    message: string;
  };
};

export type ChangePasswordInlineMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;

export type ChangePasswordInlineMutation = {
  __typename?: 'Mutation';
  changePassword: {
    __typename?: 'PasswordResetResponse';
    success: boolean;
    message: string;
  };
};

export type UpdateProfileInlineMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;

export type UpdateProfileInlineMutation = {
  __typename?: 'Mutation';
  updateProfile: {
    __typename?: 'User';
    id: string;
    username: string;
    email: string;
    role: UserRole;
    createdAt: any;
  };
};

export type GetProfileCharactersInlineQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetProfileCharactersInlineQuery = {
  __typename?: 'Query';
  myCharacters: Array<{
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
    raceType?: string | null;
    playerClass?: string | null;
    lastLogin?: any | null;
    isOnline: boolean;
  }>;
};

export type ResetPasswordInlineMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;

export type ResetPasswordInlineMutation = {
  __typename?: 'Mutation';
  resetPassword: {
    __typename?: 'PasswordResetResponse';
    success: boolean;
    message: string;
  };
};

export type GetTriggersInlineQueryVariables = Exact<{ [key: string]: never }>;

export type GetTriggersInlineQuery = {
  __typename?: 'Query';
  triggers: Array<{
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    numArgs: number;
    argList: Array<string>;
    commands: string;
    variables: string;
    mobId?: number | null;
    objectId?: number | null;
    zoneId?: number | null;
    createdAt: any;
    updatedAt: any;
  }>;
};

export type GetTriggersByAttachmentInlineQueryVariables = Exact<{
  attachType: ScriptType;
  entityId: Scalars['Int']['input'];
}>;

export type GetTriggersByAttachmentInlineQuery = {
  __typename?: 'Query';
  triggersByAttachment: Array<{
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    numArgs: number;
    argList: Array<string>;
    commands: string;
    variables: string;
    mobId?: number | null;
    objectId?: number | null;
    zoneId?: number | null;
    createdAt: any;
    updatedAt: any;
  }>;
};

export type CreateTriggerInlineMutationVariables = Exact<{
  input: CreateTriggerInput;
}>;

export type CreateTriggerInlineMutation = {
  __typename?: 'Mutation';
  createTrigger: {
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    commands: string;
    variables: string;
  };
};

export type UpdateTriggerInlineMutationVariables = Exact<{
  id: Scalars['Float']['input'];
  input: UpdateTriggerInput;
}>;

export type UpdateTriggerInlineMutation = {
  __typename?: 'Mutation';
  updateTrigger: {
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    commands: string;
    variables: string;
  };
};

export type DeleteTriggerInlineMutationVariables = Exact<{
  id: Scalars['Float']['input'];
}>;

export type DeleteTriggerInlineMutation = {
  __typename?: 'Mutation';
  deleteTrigger: { __typename?: 'TriggerDto'; id: string };
};

export type AttachTriggerInlineMutationVariables = Exact<{
  input: AttachTriggerInput;
}>;

export type AttachTriggerInlineMutation = {
  __typename?: 'Mutation';
  attachTrigger: {
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    mobId?: number | null;
    objectId?: number | null;
    zoneId?: number | null;
  };
};

export type DetachTriggerInlineMutationVariables = Exact<{
  triggerId: Scalars['Float']['input'];
}>;

export type DetachTriggerInlineMutation = {
  __typename?: 'Mutation';
  detachTrigger: { __typename?: 'TriggerDto'; id: string; name: string };
};

export type GetAllCharactersInlineQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<CharacterFilterInput>;
}>;

export type GetAllCharactersInlineQuery = {
  __typename?: 'Query';
  characters: Array<{
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
    raceType?: string | null;
    playerClass?: string | null;
    lastLogin?: any | null;
    isOnline: boolean;
    timePlayed: number;
    hitPoints: number;
    hitPointsMax: number;
    movement: number;
    movementMax: number;
    alignment: number;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    luck: number;
    experience: number;
    copper: number;
    silver: number;
    gold: number;
    platinum: number;
    description?: string | null;
    title?: string | null;
    currentRoom?: number | null;
  }>;
};

export type GetCharactersCountInlineQueryVariables = Exact<{
  filter?: InputMaybe<CharacterFilterInput>;
}>;

export type GetCharactersCountInlineQuery = {
  __typename?: 'Query';
  charactersCount: number;
};

export type CreateCharacterInlineMutationVariables = Exact<{
  data: CreateCharacterInput;
}>;

export type CreateCharacterInlineMutation = {
  __typename?: 'Mutation';
  createCharacter: {
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
    raceType?: string | null;
    playerClass?: string | null;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    luck: number;
  };
};

export type DeleteCharacterInlineMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteCharacterInlineMutation = {
  __typename?: 'Mutation';
  deleteCharacter: { __typename?: 'CharacterDto'; id: string; name: string };
};

export type GetCharacterDetailsInlineQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetCharacterDetailsInlineQuery = {
  __typename?: 'Query';
  character: {
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
    raceType?: string | null;
    playerClass?: string | null;
    lastLogin?: any | null;
    isOnline: boolean;
    timePlayed: number;
    hitPoints: number;
    hitPointsMax: number;
    movement: number;
    movementMax: number;
    alignment: number;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    luck: number;
    experience: number;
    skillPoints: number;
    copper: number;
    silver: number;
    gold: number;
    platinum: number;
    bankCopper: number;
    bankSilver: number;
    bankGold: number;
    bankPlatinum: number;
    description?: string | null;
    title?: string | null;
    currentRoom?: number | null;
    saveRoom?: number | null;
    homeRoom?: number | null;
    hunger: number;
    thirst: number;
    hitRoll: number;
    damageRoll: number;
    armorClass: number;
    playerFlags: Array<string>;
    effectFlags: Array<string>;
    privilegeFlags: Array<string>;
    invisLevel: number;
    birthTime: any;
    characterItems?: Array<{
      __typename?: 'CharacterItemDto';
      id: string;
      equippedLocation?: string | null;
      condition: number;
      charges: number;
      objects: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        zoneId: number;
        name: string;
        type: string;
        examineDescription?: string | null;
        weight?: number | null;
        cost?: number | null;
        level?: number | null;
        values?: any | null;
        flags?: Array<string> | null;
        effectFlags?: Array<string> | null;
        wearFlags?: Array<string> | null;
        objectAffects?: Array<{
          __typename?: 'ObjectAffectDto';
          location: string;
          modifier: number;
        }> | null;
      };
    }> | null;
    characterEffects?: Array<{
      __typename?: 'CharacterEffectDto';
      id: string;
      effectName: string;
      effectType?: string | null;
      duration?: number | null;
      strength: number;
      appliedAt: any;
      expiresAt?: any | null;
    }> | null;
  };
};

export type UpdateCharacterInlineMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateCharacterInput;
}>;

export type UpdateCharacterInlineMutation = {
  __typename?: 'Mutation';
  updateCharacter: {
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
    raceType?: string | null;
    playerClass?: string | null;
    description?: string | null;
    title?: string | null;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    luck: number;
    hitPoints: number;
    hitPointsMax: number;
    movement: number;
    movementMax: number;
    alignment: number;
  };
};

export type GetCharacterLinkingInfoInlineQueryVariables = Exact<{
  characterName: Scalars['String']['input'];
}>;

export type GetCharacterLinkingInfoInlineQuery = {
  __typename?: 'Query';
  characterLinkingInfo: {
    __typename?: 'CharacterLinkingInfoDto';
    id: string;
    name: string;
    level: number;
    race?: string | null;
    class?: string | null;
    lastLogin?: any | null;
    timePlayed: number;
    isOnline: boolean;
    isLinked: boolean;
    hasPassword: boolean;
  };
};

export type LinkCharacterInlineMutationVariables = Exact<{
  data: LinkCharacterInput;
}>;

export type LinkCharacterInlineMutation = {
  __typename?: 'Mutation';
  linkCharacter: {
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
    raceType?: string | null;
    playerClass?: string | null;
  };
};

export type ValidateCharacterPasswordInlineQueryVariables = Exact<{
  characterName: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type ValidateCharacterPasswordInlineQuery = {
  __typename?: 'Query';
  validateCharacterPassword: boolean;
};

export type GetCharacterSessionInfoPollingQueryVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;

export type GetCharacterSessionInfoPollingQuery = {
  __typename?: 'Query';
  characterSessionInfo: {
    __typename?: 'CharacterSessionInfoDto';
    id: string;
    name: string;
    isOnline: boolean;
    lastLogin?: any | null;
    totalTimePlayed: number;
    currentSessionTime: number;
  };
};

export type GetEquipmentSetsQueryVariables = Exact<{ [key: string]: never }>;

export type GetEquipmentSetsQuery = {
  __typename?: 'Query';
  equipmentSets: Array<{
    __typename?: 'EquipmentSetDto';
    id: string;
    name: string;
    description?: string | null;
    createdAt: any;
    updatedAt: any;
    items: Array<{
      __typename?: 'EquipmentSetItemDto';
      id: string;
      slot?: string | null;
      probability: number;
      object: {
        __typename?: 'ObjectDto';
        id: number;
        name: string;
        type: ObjectType;
        keywords: Array<string>;
      };
    }>;
  }>;
};

export type GetObjectsForEquipmentSetQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetObjectsForEquipmentSetQuery = {
  __typename?: 'Query';
  objects: Array<{
    __typename?: 'ObjectDto';
    id: number;
    name: string;
    type: ObjectType;
    keywords: Array<string>;
    wearFlags: Array<WearFlag>;
  }>;
};

export type CreateEquipmentSetMutationVariables = Exact<{
  data: CreateEquipmentSetInput;
}>;

export type CreateEquipmentSetMutation = {
  __typename?: 'Mutation';
  createEquipmentSet: {
    __typename?: 'EquipmentSetDto';
    id: string;
    name: string;
    description?: string | null;
    createdAt: any;
  };
};

export type UpdateEquipmentSetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateEquipmentSetInput;
}>;

export type UpdateEquipmentSetMutation = {
  __typename?: 'Mutation';
  updateEquipmentSet: {
    __typename?: 'EquipmentSetDto';
    id: string;
    name: string;
    description?: string | null;
    updatedAt: any;
  };
};

export type DeleteEquipmentSetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteEquipmentSetMutation = {
  __typename?: 'Mutation';
  deleteEquipmentSet: boolean;
};

export type AddEquipmentSetItemMutationVariables = Exact<{
  data: CreateEquipmentSetItemStandaloneInput;
}>;

export type AddEquipmentSetItemMutation = {
  __typename?: 'Mutation';
  createEquipmentSetItem: {
    __typename?: 'EquipmentSetItemDto';
    id: string;
    slot?: string | null;
    probability: number;
  };
};

export type RemoveEquipmentSetItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type RemoveEquipmentSetItemMutation = {
  __typename?: 'Mutation';
  deleteEquipmentSetItem: boolean;
};

export type GetMobResetsForMobQueryVariables = Exact<{
  mobId: Scalars['Int']['input'];
  mobZoneId: Scalars['Int']['input'];
}>;

export type GetMobResetsForMobQuery = {
  __typename?: 'Query';
  mobResets: Array<{
    __typename?: 'MobResetDto';
    id: string;
    maxInstances: number;
    probability: number;
    roomId: number;
    roomZoneId: number;
    mob?: {
      __typename?: 'MobSummaryDto';
      id: number;
      zoneId: number;
      name: string;
    } | null;
    equipment: Array<{
      __typename?: 'MobResetEquipmentDto';
      id: string;
      maxInstances: number;
      probability: number;
      wearLocation?: WearFlag | null;
      objectId: number;
      objectZoneId: number;
      object: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        zoneId: number;
        name: string;
        type: string;
      };
    }>;
  }>;
};

export type GetEquipmentSetsForMobQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetEquipmentSetsForMobQuery = {
  __typename?: 'Query';
  equipmentSets: Array<{
    __typename?: 'EquipmentSetDto';
    id: string;
    name: string;
    description?: string | null;
    createdAt: any;
    items: Array<{
      __typename?: 'EquipmentSetItemDto';
      id: string;
      slot?: string | null;
      probability: number;
      object: {
        __typename?: 'ObjectDto';
        id: number;
        zoneId: number;
        name: string;
        type: ObjectType;
      };
    }>;
  }>;
};

export type GetObjectsForMobQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetObjectsForMobQuery = {
  __typename?: 'Query';
  objects: Array<{
    __typename?: 'ObjectDto';
    id: number;
    name: string;
    type: ObjectType;
    keywords: Array<string>;
    wearFlags: Array<WearFlag>;
  }>;
};

export type CreateEquipmentSetForMobMutationVariables = Exact<{
  data: CreateEquipmentSetInput;
}>;

export type CreateEquipmentSetForMobMutation = {
  __typename?: 'Mutation';
  createEquipmentSet: {
    __typename?: 'EquipmentSetDto';
    id: string;
    name: string;
    description?: string | null;
  };
};

export type AddMobEquipmentSetMutationVariables = Exact<{
  data: CreateMobEquipmentSetInput;
}>;

export type AddMobEquipmentSetMutation = {
  __typename?: 'Mutation';
  createMobEquipmentSet: {
    __typename?: 'MobEquipmentSetDto';
    id: string;
    probability: number;
  };
};

export type RemoveMobEquipmentSetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type RemoveMobEquipmentSetMutation = {
  __typename?: 'Mutation';
  deleteMobEquipmentSet: boolean;
};

export type DeleteMobResetEquipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteMobResetEquipmentMutation = {
  __typename?: 'Mutation';
  deleteMobResetEquipment: boolean;
};

export type AddMobResetEquipmentMutationVariables = Exact<{
  resetId: Scalars['ID']['input'];
  objectZoneId: Scalars['Int']['input'];
  objectId: Scalars['Int']['input'];
  wearLocation?: InputMaybe<WearFlag>;
  maxInstances?: InputMaybe<Scalars['Int']['input']>;
  probability?: InputMaybe<Scalars['Float']['input']>;
}>;

export type AddMobResetEquipmentMutation = {
  __typename?: 'Mutation';
  addMobResetEquipment: {
    __typename?: 'MobResetDto';
    id: string;
    equipment: Array<{
      __typename?: 'MobResetEquipmentDto';
      id: string;
      objectId: number;
      objectZoneId: number;
      wearLocation?: WearFlag | null;
      maxInstances: number;
      probability: number;
      object: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        zoneId: number;
        name: string;
        type: string;
      };
    }>;
  };
};

export type UpdateMobResetEquipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  wearLocation?: InputMaybe<WearFlag>;
  maxInstances?: InputMaybe<Scalars['Int']['input']>;
  probability?: InputMaybe<Scalars['Float']['input']>;
}>;

export type UpdateMobResetEquipmentMutation = {
  __typename?: 'Mutation';
  updateMobResetEquipment: boolean;
};

export type GetCharacterNameForBreadcrumbQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetCharacterNameForBreadcrumbQuery = {
  __typename?: 'Query';
  character: { __typename?: 'CharacterDto'; id: string; name: string };
};

export type UpdateThemePreferenceMutationVariables = Exact<{
  input: UpdatePreferencesInput;
}>;

export type UpdateThemePreferenceMutation = {
  __typename?: 'Mutation';
  updateUserPreferences: {
    __typename?: 'User';
    id: string;
    preferences?: {
      __typename?: 'UserPreferences';
      theme?: string | null;
    } | null;
  };
};

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;

export type LoginMutation = {
  __typename?: 'Mutation';
  login: {
    __typename?: 'AuthPayload';
    accessToken: string;
    user: {
      __typename?: 'User';
      id: string;
      username: string;
      email: string;
      role: UserRole;
      createdAt: any;
    };
  };
};

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;

export type RegisterMutation = {
  __typename?: 'Mutation';
  register: {
    __typename?: 'AuthPayload';
    accessToken: string;
    user: {
      __typename?: 'User';
      id: string;
      username: string;
      email: string;
      role: UserRole;
      createdAt: any;
    };
  };
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  __typename?: 'Query';
  me: {
    __typename?: 'User';
    id: string;
    username: string;
    email: string;
    role: UserRole;
    createdAt: any;
  };
};

export type GetAbilitiesQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  abilityType?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetAbilitiesQuery = {
  __typename?: 'Query';
  abilitiesCount: number;
  abilities: Array<{
    __typename?: 'Ability';
    id: string;
    name: string;
    abilityType: string;
    description?: string | null;
    minPosition: Position;
    violent: boolean;
    castTimeRounds: number;
    cooldownMs: number;
    inCombatOnly: boolean;
    isArea: boolean;
    notes?: string | null;
    tags: Array<string>;
    school?: { __typename?: 'AbilitySchool'; id: string; name: string } | null;
    effects?: Array<{
      __typename?: 'AbilityEffect';
      effectId: string;
      effect: { __typename?: 'Effect'; id: string; name: string };
    }> | null;
  }>;
};

export type GetAbilityDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetAbilityDetailsQuery = {
  __typename?: 'Query';
  ability: {
    __typename?: 'Ability';
    id: string;
    name: string;
    abilityType: string;
    description?: string | null;
    minPosition: Position;
    violent: boolean;
    combatOk: boolean;
    castTimeRounds: number;
    cooldownMs: number;
    inCombatOnly: boolean;
    isArea: boolean;
    notes?: string | null;
    tags: Array<string>;
    luaScript?: string | null;
    sphere?: SpellSphere | null;
    damageType?: ElementType | null;
    pages?: number | null;
    memorizationTime: number;
    questOnly: boolean;
    humanoidOnly: boolean;
    school?: {
      __typename?: 'AbilitySchool';
      id: string;
      name: string;
      description?: string | null;
    } | null;
    effects?: Array<{
      __typename?: 'AbilityEffect';
      effectId: string;
      order: number;
      chancePct: number;
      trigger?: string | null;
      condition?: string | null;
      overrideParams?: any | null;
      effect: {
        __typename?: 'Effect';
        id: string;
        name: string;
        effectType: string;
        description?: string | null;
      };
    }> | null;
    savingThrows?: Array<{
      __typename?: 'AbilitySavingThrow';
      id: string;
      dcFormula: string;
      saveType: SaveType;
      onSaveAction: any;
    }> | null;
    targeting?: {
      __typename?: 'AbilityTargeting';
      range: number;
      maxTargets: number;
      requireLos: boolean;
      scope: TargetScope;
      scopePattern?: string | null;
      validTargets: Array<TargetType>;
    } | null;
    restrictions?: {
      __typename?: 'AbilityRestrictions';
      customRequirementLua?: string | null;
      requirements: Array<any>;
    } | null;
    messages?: {
      __typename?: 'AbilityMessages';
      startToCaster?: string | null;
      startToRoom?: string | null;
      startToVictim?: string | null;
      successToCaster?: string | null;
      successToRoom?: string | null;
      successToVictim?: string | null;
      successToSelf?: string | null;
      successSelfRoom?: string | null;
      failToCaster?: string | null;
      failToRoom?: string | null;
      failToVictim?: string | null;
      wearoffToRoom?: string | null;
      wearoffToTarget?: string | null;
      lookMessage?: string | null;
    } | null;
  };
};

export type GetAbilitySchoolsQueryVariables = Exact<{ [key: string]: never }>;

export type GetAbilitySchoolsQuery = {
  __typename?: 'Query';
  abilitySchools: Array<{
    __typename?: 'AbilitySchool';
    id: string;
    name: string;
    description?: string | null;
  }>;
};

export type CreateAbilityMutationVariables = Exact<{
  data: CreateAbilityInput;
}>;

export type CreateAbilityMutation = {
  __typename?: 'Mutation';
  createAbility: {
    __typename?: 'Ability';
    id: string;
    name: string;
    abilityType: string;
  };
};

export type UpdateAbilityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateAbilityInput;
}>;

export type UpdateAbilityMutation = {
  __typename?: 'Mutation';
  updateAbility: {
    __typename?: 'Ability';
    id: string;
    name: string;
    abilityType: string;
  };
};

export type DeleteAbilityMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteAbilityMutation = {
  __typename?: 'Mutation';
  deleteAbility: boolean;
};

export type UpdateAbilityEffectsMutationVariables = Exact<{
  abilityId: Scalars['Int']['input'];
  data: UpdateAbilityEffectsInput;
}>;

export type UpdateAbilityEffectsMutation = {
  __typename?: 'Mutation';
  updateAbilityEffects: {
    __typename?: 'Ability';
    id: string;
    name: string;
    effects?: Array<{
      __typename?: 'AbilityEffect';
      effectId: string;
      order: number;
      chancePct: number;
      trigger?: string | null;
      condition?: string | null;
      overrideParams?: any | null;
      effect: {
        __typename?: 'Effect';
        id: string;
        name: string;
        effectType: string;
        description?: string | null;
      };
    }> | null;
  };
};

export type UpdateAbilityMessagesMutationVariables = Exact<{
  abilityId: Scalars['Int']['input'];
  data: UpdateAbilityMessagesInput;
}>;

export type UpdateAbilityMessagesMutation = {
  __typename?: 'Mutation';
  updateAbilityMessages: {
    __typename?: 'AbilityMessages';
    startToCaster?: string | null;
    startToRoom?: string | null;
    startToVictim?: string | null;
    successToCaster?: string | null;
    successToRoom?: string | null;
    successToVictim?: string | null;
    successToSelf?: string | null;
    successSelfRoom?: string | null;
    failToCaster?: string | null;
    failToRoom?: string | null;
    failToVictim?: string | null;
    wearoffToRoom?: string | null;
    wearoffToTarget?: string | null;
    lookMessage?: string | null;
  };
};

export type AccountMailUserFieldsFragment = {
  __typename?: 'AccountMailUserDto';
  id: string;
  username: string;
  email: string;
};

export type AccountMailFieldsFragment = {
  __typename?: 'AccountMailDto';
  id: number;
  senderUserId: string;
  recipientUserId?: string | null;
  isBroadcast: boolean;
  subject: string;
  body: string;
  sentAt: any;
  readAt?: any | null;
  isDeleted: boolean;
  createdAt: any;
  senderName: string;
  sender?: {
    __typename?: 'AccountMailUserDto';
    id: string;
    username: string;
    email: string;
  } | null;
  recipient?: {
    __typename?: 'AccountMailUserDto';
    id: string;
    username: string;
    email: string;
  } | null;
};

export type GetMyAccountMailQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetMyAccountMailQuery = {
  __typename?: 'Query';
  myAccountMail: Array<{
    __typename?: 'AccountMailDto';
    id: number;
    senderUserId: string;
    recipientUserId?: string | null;
    isBroadcast: boolean;
    subject: string;
    body: string;
    sentAt: any;
    readAt?: any | null;
    isDeleted: boolean;
    createdAt: any;
    senderName: string;
    sender?: {
      __typename?: 'AccountMailUserDto';
      id: string;
      username: string;
      email: string;
    } | null;
    recipient?: {
      __typename?: 'AccountMailUserDto';
      id: string;
      username: string;
      email: string;
    } | null;
  }>;
};

export type GetMyAccountMailCountQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetMyAccountMailCountQuery = {
  __typename?: 'Query';
  myAccountMailCount: number;
};

export type GetAllAccountMailQueryVariables = Exact<{
  filter?: InputMaybe<AccountMailFilterInput>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetAllAccountMailQuery = {
  __typename?: 'Query';
  allAccountMail: Array<{
    __typename?: 'AccountMailDto';
    id: number;
    senderUserId: string;
    recipientUserId?: string | null;
    isBroadcast: boolean;
    subject: string;
    body: string;
    sentAt: any;
    readAt?: any | null;
    isDeleted: boolean;
    createdAt: any;
    senderName: string;
    sender?: {
      __typename?: 'AccountMailUserDto';
      id: string;
      username: string;
      email: string;
    } | null;
    recipient?: {
      __typename?: 'AccountMailUserDto';
      id: string;
      username: string;
      email: string;
    } | null;
  }>;
};

export type SendAccountMailMutationVariables = Exact<{
  data: SendAccountMailInput;
}>;

export type SendAccountMailMutation = {
  __typename?: 'Mutation';
  sendAccountMail: {
    __typename?: 'AccountMailDto';
    id: number;
    senderUserId: string;
    recipientUserId?: string | null;
    isBroadcast: boolean;
    subject: string;
    body: string;
    sentAt: any;
    readAt?: any | null;
    isDeleted: boolean;
    createdAt: any;
    senderName: string;
    sender?: {
      __typename?: 'AccountMailUserDto';
      id: string;
      username: string;
      email: string;
    } | null;
    recipient?: {
      __typename?: 'AccountMailUserDto';
      id: string;
      username: string;
      email: string;
    } | null;
  };
};

export type SendBroadcastMutationVariables = Exact<{
  data: SendBroadcastInput;
}>;

export type SendBroadcastMutation = {
  __typename?: 'Mutation';
  sendBroadcast: number;
};

export type MarkAccountMailReadMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type MarkAccountMailReadMutation = {
  __typename?: 'Mutation';
  markAccountMailRead: {
    __typename?: 'AccountMailDto';
    id: number;
    readAt?: any | null;
  };
};

export type DeleteAccountMailMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type DeleteAccountMailMutation = {
  __typename?: 'Mutation';
  deleteAccountMail: {
    __typename?: 'AccountMailDto';
    id: number;
    isDeleted: boolean;
  };
};

export type AccountItemObjectFieldsFragment = {
  __typename?: 'AccountItemObjectDto';
  zoneId: number;
  id: number;
  name: string;
  type?: string | null;
};

export type AccountItemCharacterFieldsFragment = {
  __typename?: 'AccountItemCharacterDto';
  id: string;
  name: string;
};

export type AccountItemFieldsFragment = {
  __typename?: 'AccountItemDto';
  id: number;
  slot: number;
  objectZoneId: number;
  objectId: number;
  quantity: number;
  customData?: string | null;
  storedAt: any;
  storedByCharacterId?: string | null;
  object: {
    __typename?: 'AccountItemObjectDto';
    zoneId: number;
    id: number;
    name: string;
    type?: string | null;
  };
  storedByCharacter?: {
    __typename?: 'AccountItemCharacterDto';
    id: string;
    name: string;
  } | null;
};

export type AccountStorageFieldsFragment = {
  __typename?: 'AccountStorageDto';
  accountWealth: any;
  items: Array<{
    __typename?: 'AccountItemDto';
    id: number;
    slot: number;
    objectZoneId: number;
    objectId: number;
    quantity: number;
    customData?: string | null;
    storedAt: any;
    storedByCharacterId?: string | null;
    object: {
      __typename?: 'AccountItemObjectDto';
      zoneId: number;
      id: number;
      name: string;
      type?: string | null;
    };
    storedByCharacter?: {
      __typename?: 'AccountItemCharacterDto';
      id: string;
      name: string;
    } | null;
  }>;
};

export type WealthDisplayFieldsFragment = {
  __typename?: 'WealthDisplayDto';
  totalCopper: any;
  platinum: number;
  gold: number;
  silver: number;
  copper: number;
};

export type GetMyAccountStorageQueryVariables = Exact<{ [key: string]: never }>;

export type GetMyAccountStorageQuery = {
  __typename?: 'Query';
  myAccountStorage: {
    __typename?: 'AccountStorageDto';
    accountWealth: any;
    items: Array<{
      __typename?: 'AccountItemDto';
      id: number;
      slot: number;
      objectZoneId: number;
      objectId: number;
      quantity: number;
      customData?: string | null;
      storedAt: any;
      storedByCharacterId?: string | null;
      object: {
        __typename?: 'AccountItemObjectDto';
        zoneId: number;
        id: number;
        name: string;
        type?: string | null;
      };
      storedByCharacter?: {
        __typename?: 'AccountItemCharacterDto';
        id: string;
        name: string;
      } | null;
    }>;
  };
};

export type GetMyAccountWealthDisplayQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetMyAccountWealthDisplayQuery = {
  __typename?: 'Query';
  myAccountWealthDisplay: {
    __typename?: 'WealthDisplayDto';
    totalCopper: any;
    platinum: number;
    gold: number;
    silver: number;
    copper: number;
  };
};

export type DepositWealthMutationVariables = Exact<{
  characterId: Scalars['String']['input'];
  amount: Scalars['BigInt']['input'];
}>;

export type DepositWealthMutation = {
  __typename?: 'Mutation';
  depositWealth: any;
};

export type DepositItemMutationVariables = Exact<{
  characterId: Scalars['String']['input'];
  objectZoneId: Scalars['Int']['input'];
  objectId: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
}>;

export type DepositItemMutation = {
  __typename?: 'Mutation';
  depositItem: {
    __typename?: 'AccountItemDto';
    id: number;
    slot: number;
    objectZoneId: number;
    objectId: number;
    quantity: number;
    customData?: string | null;
    storedAt: any;
    storedByCharacterId?: string | null;
    object: {
      __typename?: 'AccountItemObjectDto';
      zoneId: number;
      id: number;
      name: string;
      type?: string | null;
    };
    storedByCharacter?: {
      __typename?: 'AccountItemCharacterDto';
      id: string;
      name: string;
    } | null;
  };
};

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;

export type RequestPasswordResetMutation = {
  __typename?: 'Mutation';
  requestPasswordReset: {
    __typename?: 'PasswordResetResponse';
    success: boolean;
    message: string;
  };
};

export type ResetPasswordMutationVariables = Exact<{
  token: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;

export type ResetPasswordMutation = {
  __typename?: 'Mutation';
  resetPassword: {
    __typename?: 'PasswordResetResponse';
    success: boolean;
    message: string;
  };
};

export type ChangePasswordMutationVariables = Exact<{
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;

export type ChangePasswordMutation = {
  __typename?: 'Mutation';
  changePassword: {
    __typename?: 'PasswordResetResponse';
    success: boolean;
    message: string;
  };
};

export type UpdateProfileMutationVariables = Exact<{
  email?: InputMaybe<Scalars['String']['input']>;
}>;

export type UpdateProfileMutation = {
  __typename?: 'Mutation';
  updateProfile: {
    __typename?: 'User';
    id: string;
    email: string;
    username: string;
  };
};

export type CharacterCardFieldsFragment = {
  __typename?: 'CharacterDto';
  id: string;
  name: string;
  level: number;
  raceType?: string | null;
  playerClass?: string | null;
  lastLogin?: any | null;
  isOnline: boolean;
  timePlayed: number;
  hitPoints: number;
  hitPointsMax: number;
  movement: number;
  movementMax: number;
  alignment: number;
  strength: number;
  intelligence: number;
  wisdom: number;
  dexterity: number;
  constitution: number;
  charisma: number;
  luck: number;
  experience: number;
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
  description?: string | null;
  title?: string | null;
  currentRoom?: number | null;
};

export type GetMyCharactersQueryVariables = Exact<{ [key: string]: never }>;

export type GetMyCharactersQuery = {
  __typename?: 'Query';
  myCharacters: Array<{
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
    raceType?: string | null;
    playerClass?: string | null;
    lastLogin?: any | null;
    isOnline: boolean;
    timePlayed: number;
    hitPoints: number;
    hitPointsMax: number;
    movement: number;
    movementMax: number;
    alignment: number;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    luck: number;
    experience: number;
    copper: number;
    silver: number;
    gold: number;
    platinum: number;
    description?: string | null;
    title?: string | null;
    currentRoom?: number | null;
  }>;
};

export type GetCharacterDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetCharacterDetailsQuery = {
  __typename?: 'Query';
  character: {
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
    description?: string | null;
    raceType?: string | null;
    playerClass?: string | null;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    hitPoints: number;
    hitPointsMax: number;
    movement: number;
    movementMax: number;
    alignment: number;
  };
};

export type GetCharacterSessionInfoQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetCharacterSessionInfoQuery = {
  __typename?: 'Query';
  characterSessionInfo: {
    __typename?: 'CharacterSessionInfoDto';
    id: string;
    name: string;
    isOnline: boolean;
    currentSessionTime: number;
    totalTimePlayed: number;
    lastLogin?: any | null;
  };
};

export type GetCharacterLinkingInfoQueryVariables = Exact<{
  characterName: Scalars['String']['input'];
}>;

export type GetCharacterLinkingInfoQuery = {
  __typename?: 'Query';
  characterLinkingInfo: {
    __typename?: 'CharacterLinkingInfoDto';
    id: string;
    name: string;
    level: number;
    race?: string | null;
    hasPassword: boolean;
    isLinked: boolean;
    timePlayed: number;
    lastLogin?: any | null;
  };
};

export type CreateCharacterMutationVariables = Exact<{
  data: CreateCharacterInput;
}>;

export type CreateCharacterMutation = {
  __typename?: 'Mutation';
  createCharacter: {
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
    raceType?: string | null;
  };
};

export type LinkCharacterMutationVariables = Exact<{
  data: LinkCharacterInput;
}>;

export type LinkCharacterMutation = {
  __typename?: 'Mutation';
  linkCharacter: {
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
  };
};

export type ValidateCharacterPasswordQueryVariables = Exact<{
  characterName: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;

export type ValidateCharacterPasswordQuery = {
  __typename?: 'Query';
  validateCharacterPassword: boolean;
};

export type UpdateCharacterMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateCharacterInput;
}>;

export type UpdateCharacterMutation = {
  __typename?: 'Mutation';
  updateCharacter: {
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
    raceType?: string | null;
    playerClass?: string | null;
    description?: string | null;
    title?: string | null;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    luck: number;
    hitPoints: number;
    hitPointsMax: number;
    movement: number;
    movementMax: number;
    alignment: number;
  };
};

export type DeleteCharacterMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteCharacterMutation = {
  __typename?: 'Mutation';
  deleteCharacter: { __typename?: 'CharacterDto'; id: string; name: string };
};

export type GetAllCharactersQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  filter?: InputMaybe<CharacterFilterInput>;
}>;

export type GetAllCharactersQuery = {
  __typename?: 'Query';
  characters: Array<{
    __typename?: 'CharacterDto';
    id: string;
    name: string;
    level: number;
    raceType?: string | null;
    playerClass?: string | null;
    lastLogin?: any | null;
    isOnline: boolean;
    timePlayed: number;
    hitPoints: number;
    hitPointsMax: number;
    movement: number;
    movementMax: number;
    alignment: number;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    luck: number;
    experience: number;
    copper: number;
    silver: number;
    gold: number;
    platinum: number;
    description?: string | null;
    title?: string | null;
    currentRoom?: number | null;
  }>;
};

export type GetCharactersCountQueryVariables = Exact<{
  filter?: InputMaybe<CharacterFilterInput>;
}>;

export type GetCharactersCountQuery = {
  __typename?: 'Query';
  charactersCount: number;
};

export type GetClassesQueryVariables = Exact<{ [key: string]: never }>;

export type GetClassesQuery = {
  __typename?: 'Query';
  classes: Array<{
    __typename?: 'ClassDto';
    id: string;
    name: string;
    plainName: string;
    description?: string | null;
    hitDice: string;
    primaryStat?: string | null;
  }>;
};

export type GetClassSkillsQueryVariables = Exact<{
  classId: Scalars['Int']['input'];
}>;

export type GetClassSkillsQuery = {
  __typename?: 'Query';
  classSkills: Array<{
    __typename?: 'ClassSkillDto';
    id: string;
    classId: number;
    skillId: number;
    skillName: string;
    category?: SkillCategory | null;
    minLevel: number;
    maxLevel?: number | null;
  }>;
};

export type GetAllAbilitiesQueryVariables = Exact<{
  abilityType?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetAllAbilitiesQuery = {
  __typename?: 'Query';
  abilities: Array<{ __typename?: 'Ability'; id: string; name: string }>;
};

export type GetClassCirclesQueryVariables = Exact<{
  classId: Scalars['Int']['input'];
}>;

export type GetClassCirclesQuery = {
  __typename?: 'Query';
  classCirclesList: Array<{
    __typename?: 'ClassCircleDto';
    id: string;
    classId: number;
    circle: number;
    minLevel: number;
    spells: Array<{
      __typename?: 'CircleSpellDto';
      id: string;
      spellId: number;
      spellName: string;
      minLevel?: number | null;
      proficiencyGain?: number | null;
    }>;
  }>;
};

export type UpdateClassMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateClassInput;
}>;

export type UpdateClassMutation = {
  __typename?: 'Mutation';
  updateClass: {
    __typename?: 'ClassDto';
    id: string;
    name: string;
    plainName: string;
    description?: string | null;
    hitDice: string;
    primaryStat?: string | null;
  };
};

export type AssignSkillToClassMutationVariables = Exact<{
  data: AssignSkillToClassInput;
}>;

export type AssignSkillToClassMutation = {
  __typename?: 'Mutation';
  assignSkillToClass: {
    __typename?: 'ClassSkillDto';
    id: string;
    skillId: number;
    skillName: string;
    category?: SkillCategory | null;
    minLevel: number;
    maxLevel?: number | null;
  };
};

export type RemoveClassSkillMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type RemoveClassSkillMutation = {
  __typename?: 'Mutation';
  removeClassSkill: boolean;
};

export type CreateClassCircleMutationVariables = Exact<{
  data: CreateClassCircleInput;
}>;

export type CreateClassCircleMutation = {
  __typename?: 'Mutation';
  createClassCircle: {
    __typename?: 'ClassCircleDto';
    id: string;
    circle: number;
    minLevel: number;
  };
};

export type RemoveClassCircleMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type RemoveClassCircleMutation = {
  __typename?: 'Mutation';
  removeClassCircle: boolean;
};

export type GetEffectEditorOptionsQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetEffectEditorOptionsQuery = {
  __typename?: 'Query';
  zones: Array<{ __typename?: 'ZoneDto'; id: number; name: string }>;
  effects: Array<{
    __typename?: 'Effect';
    id: string;
    name: string;
    effectType: string;
    paramSchema?: any | null;
  }>;
  mobs: Array<{
    __typename?: 'MobDto';
    id: number;
    zoneId: number;
    plainName: string;
  }>;
  objects: Array<{
    __typename?: 'ObjectDto';
    id: number;
    zoneId: number;
    plainName: string;
  }>;
  triggers: Array<{
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    zoneId?: number | null;
  }>;
};

export type GetEffectsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetEffectsQuery = {
  __typename?: 'Query';
  effects: Array<{
    __typename?: 'Effect';
    id: string;
    name: string;
    effectType: string;
    description?: string | null;
    tags: Array<string>;
    defaultParams: any;
    paramSchema?: any | null;
  }>;
};

export type GetEffectsCountQueryVariables = Exact<{
  search?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetEffectsCountQuery = {
  __typename?: 'Query';
  effectsCount: number;
};

export type GetEffectQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetEffectQuery = {
  __typename?: 'Query';
  effect: {
    __typename?: 'Effect';
    id: string;
    name: string;
    effectType: string;
    description?: string | null;
    tags: Array<string>;
    defaultParams: any;
    paramSchema?: any | null;
  };
};

export type CreateEffectMutationVariables = Exact<{
  data: CreateEffectInput;
}>;

export type CreateEffectMutation = {
  __typename?: 'Mutation';
  createEffect: {
    __typename?: 'Effect';
    id: string;
    name: string;
    effectType: string;
    description?: string | null;
    tags: Array<string>;
    defaultParams: any;
    paramSchema?: any | null;
  };
};

export type UpdateEffectMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateEffectInput;
}>;

export type UpdateEffectMutation = {
  __typename?: 'Mutation';
  updateEffect: {
    __typename?: 'Effect';
    id: string;
    name: string;
    effectType: string;
    description?: string | null;
    tags: Array<string>;
    defaultParams: any;
    paramSchema?: any | null;
  };
};

export type DeleteEffectMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteEffectMutation = {
  __typename?: 'Mutation';
  deleteEffect: boolean;
};

export type GetOnlinePlayersQueryVariables = Exact<{ [key: string]: never }>;

export type GetOnlinePlayersQuery = {
  __typename?: 'Query';
  onlinePlayers: Array<{
    __typename?: 'OnlinePlayerType';
    name: string;
    level: number;
    class: string;
    race: string;
    roomId: number;
    godLevel: number;
    isLinkdead: boolean;
  }>;
};

export type GetServerStatusQueryVariables = Exact<{ [key: string]: never }>;

export type GetServerStatusQuery = {
  __typename?: 'Query';
  serverStatus: {
    __typename?: 'ServerStatusType';
    stats: {
      __typename?: 'ServerStatsType';
      uptimeSeconds: number;
      totalConnections: number;
      currentConnections: number;
      peakConnections: number;
      totalCommands: number;
      failedCommands: number;
      totalLogins: number;
      failedLogins: number;
      commandsPerSecond: number;
    };
    server: {
      __typename?: 'ServerInfoType';
      name: string;
      port: number;
      tlsPort: number;
      maintenanceMode: boolean;
      running: boolean;
    };
  };
};

export type IsGameServerConnectedQueryVariables = Exact<{
  [key: string]: never;
}>;

export type IsGameServerConnectedQuery = {
  __typename?: 'Query';
  gameServerConnected: boolean;
};

export type ExecuteGameCommandMutationVariables = Exact<{
  command: Scalars['String']['input'];
  executor?: InputMaybe<Scalars['String']['input']>;
}>;

export type ExecuteGameCommandMutation = {
  __typename?: 'Mutation';
  executeGameCommand: {
    __typename?: 'CommandResultType';
    success: boolean;
    message: string;
    executor?: string | null;
    note?: string | null;
  };
};

export type BroadcastMessageMutationVariables = Exact<{
  message: Scalars['String']['input'];
  sender?: InputMaybe<Scalars['String']['input']>;
}>;

export type BroadcastMessageMutation = {
  __typename?: 'Mutation';
  broadcastMessage: {
    __typename?: 'BroadcastResultType';
    success: boolean;
    message: string;
    recipientCount: number;
  };
};

export type KickPlayerMutationVariables = Exact<{
  playerName: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
}>;

export type KickPlayerMutation = {
  __typename?: 'Mutation';
  kickPlayer: {
    __typename?: 'KickResultType';
    success: boolean;
    message: string;
    reason: string;
  };
};

export type GameEventsSubscriptionVariables = Exact<{ [key: string]: never }>;

export type GameEventsSubscription = {
  __typename?: 'Subscription';
  gameEvents: {
    __typename?: 'GameEvent';
    type: GameEventType;
    timestamp: any;
    playerName?: string | null;
    zoneId?: number | null;
    roomVnum?: number | null;
    message: string;
    targetPlayer?: string | null;
    metadata?: any | null;
  };
};

export type ChatMessagesSubscriptionVariables = Exact<{ [key: string]: never }>;

export type ChatMessagesSubscription = {
  __typename?: 'Subscription';
  chatMessages: {
    __typename?: 'GameEvent';
    type: GameEventType;
    timestamp: any;
    playerName?: string | null;
    message: string;
    metadata?: any | null;
  };
};

export type PlayerActivitySubscriptionVariables = Exact<{
  [key: string]: never;
}>;

export type PlayerActivitySubscription = {
  __typename?: 'Subscription';
  playerActivity: {
    __typename?: 'GameEvent';
    type: GameEventType;
    timestamp: any;
    playerName?: string | null;
    zoneId?: number | null;
    message: string;
    metadata?: any | null;
  };
};

export type AdminAlertsSubscriptionVariables = Exact<{ [key: string]: never }>;

export type AdminAlertsSubscription = {
  __typename?: 'Subscription';
  adminAlerts: {
    __typename?: 'GameEvent';
    type: GameEventType;
    timestamp: any;
    message: string;
    metadata?: any | null;
  };
};

export type WorldEventsSubscriptionVariables = Exact<{ [key: string]: never }>;

export type WorldEventsSubscription = {
  __typename?: 'Subscription';
  worldEvents: {
    __typename?: 'GameEvent';
    type: GameEventType;
    timestamp: any;
    zoneId?: number | null;
    roomVnum?: number | null;
    message: string;
    metadata?: any | null;
  };
};

export type UpdateMobMutationVariables = Exact<{
  zoneId: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  data: UpdateMobInput;
}>;

export type UpdateMobMutation = {
  __typename?: 'Mutation';
  updateMob: {
    __typename?: 'MobDto';
    id: number;
    zoneId: number;
    keywords: Array<string>;
    name: string;
    roomDescription: string;
    examineDescription: string;
    level: number;
    alignment: number;
    hitRoll: number;
    armorClass: number;
    hpDice: string;
    damageDice: string;
    damageType: DamageType;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    perception: number;
    concealment: number;
    race: Race;
    gender: Gender;
    size: Size;
    lifeForce: LifeForce;
    composition: Composition;
    mobFlags: Array<MobFlag>;
    effectFlags: Array<EffectFlag>;
    position: Position;
    stance: Stance;
  };
};

export type CreateMobMutationVariables = Exact<{
  data: CreateMobInput;
}>;

export type CreateMobMutation = {
  __typename?: 'Mutation';
  createMob: {
    __typename?: 'MobDto';
    id: number;
    zoneId: number;
    keywords: Array<string>;
    name: string;
    roomDescription: string;
    examineDescription: string;
    level: number;
    alignment: number;
    hitRoll: number;
    armorClass: number;
    hpDice: string;
    damageDice: string;
    damageType: DamageType;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    perception: number;
    concealment: number;
    race: Race;
    gender: Gender;
    size: Size;
    lifeForce: LifeForce;
    composition: Composition;
    mobFlags: Array<MobFlag>;
    effectFlags: Array<EffectFlag>;
    position: Position;
    stance: Stance;
  };
};

export type DeleteMobMutationVariables = Exact<{
  zoneId: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
}>;

export type DeleteMobMutation = {
  __typename?: 'Mutation';
  deleteMob: { __typename?: 'MobDto'; id: number; zoneId: number };
};

export type ObjectSummaryFragment = {
  __typename?: 'ObjectDto';
  id: number;
  name: string;
  type: ObjectType;
  level: number;
  weight: number;
  cost: number;
  zoneId: number;
  keywords: Array<string>;
  values: any;
};

export type ObjectDetailsFragment = {
  __typename?: 'ObjectDto';
  examineDescription: string;
  roomDescription: string;
  actionDescription?: string | null;
  concealment: number;
  timer: number;
  decomposeTimer: number;
  flags: Array<ObjectFlag>;
  effectFlags: Array<EffectFlag>;
  wearFlags: Array<WearFlag>;
  createdAt: any;
  updatedAt: any;
  id: number;
  name: string;
  type: ObjectType;
  level: number;
  weight: number;
  cost: number;
  zoneId: number;
  keywords: Array<string>;
  values: any;
};

export type GetObjectsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetObjectsQuery = {
  __typename?: 'Query';
  objectsCount: number;
  objects: Array<{
    __typename?: 'ObjectDto';
    id: number;
    name: string;
    type: ObjectType;
    level: number;
    weight: number;
    cost: number;
    zoneId: number;
    keywords: Array<string>;
    values: any;
  }>;
};

export type GetObjectsByZoneQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;

export type GetObjectsByZoneQuery = {
  __typename?: 'Query';
  objectsByZone: Array<{
    __typename?: 'ObjectDto';
    id: number;
    name: string;
    type: ObjectType;
    level: number;
    weight: number;
    cost: number;
    zoneId: number;
    keywords: Array<string>;
    values: any;
  }>;
};

export type GetObjectQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;

export type GetObjectQuery = {
  __typename?: 'Query';
  object: {
    __typename?: 'ObjectDto';
    examineDescription: string;
    roomDescription: string;
    actionDescription?: string | null;
    concealment: number;
    timer: number;
    decomposeTimer: number;
    flags: Array<ObjectFlag>;
    effectFlags: Array<EffectFlag>;
    wearFlags: Array<WearFlag>;
    createdAt: any;
    updatedAt: any;
    id: number;
    name: string;
    type: ObjectType;
    level: number;
    weight: number;
    cost: number;
    zoneId: number;
    keywords: Array<string>;
    values: any;
  };
};

export type SearchObjectsQueryVariables = Exact<{
  search: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  zoneId?: InputMaybe<Scalars['Int']['input']>;
}>;

export type SearchObjectsQuery = {
  __typename?: 'Query';
  searchObjects: Array<{
    __typename?: 'ObjectDto';
    id: number;
    zoneId: number;
    name: string;
    plainName: string;
    type: ObjectType;
    level: number;
  }>;
};

export type CreateObjectMutationVariables = Exact<{
  data: CreateObjectInput;
}>;

export type CreateObjectMutation = {
  __typename?: 'Mutation';
  createObject: {
    __typename?: 'ObjectDto';
    id: number;
    name: string;
    type: ObjectType;
    level: number;
    weight: number;
    cost: number;
    zoneId: number;
    keywords: Array<string>;
    values: any;
  };
};

export type UpdateObjectMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
  data: UpdateObjectInput;
}>;

export type UpdateObjectMutation = {
  __typename?: 'Mutation';
  updateObject: {
    __typename?: 'ObjectDto';
    id: number;
    name: string;
    type: ObjectType;
    level: number;
    weight: number;
    cost: number;
    zoneId: number;
    keywords: Array<string>;
    values: any;
  };
};

export type DeleteObjectMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;

export type DeleteObjectMutation = {
  __typename?: 'Mutation';
  deleteObject: { __typename?: 'ObjectDto'; id: number };
};

export type DeleteObjectsMutationVariables = Exact<{
  ids: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
}>;

export type DeleteObjectsMutation = {
  __typename?: 'Mutation';
  deleteObjects: number;
};

export type PlayerMailCharacterFieldsFragment = {
  __typename?: 'PlayerMailCharacterDto';
  id: string;
  name: string;
};

export type PlayerMailObjectFieldsFragment = {
  __typename?: 'PlayerMailObjectDto';
  zoneId: number;
  id: number;
  name: string;
};

export type PlayerMailFieldsFragment = {
  __typename?: 'PlayerMailDto';
  id: number;
  legacySenderId?: number | null;
  legacyRecipientId?: number | null;
  senderCharacterId?: string | null;
  recipientCharacterId?: string | null;
  body: string;
  sentAt: any;
  readAt?: any | null;
  attachedCopper: number;
  attachedSilver: number;
  attachedGold: number;
  attachedPlatinum: number;
  attachedObjectZoneId?: number | null;
  attachedObjectId?: number | null;
  wealthRetrievedAt?: any | null;
  wealthRetrievedByCharacterId?: string | null;
  objectRetrievedAt?: any | null;
  objectRetrievedByCharacterId?: string | null;
  objectMovedToAccountStorage: boolean;
  isDeleted: boolean;
  createdAt: any;
  senderName: string;
  wealthRetrievalInfo?: string | null;
  objectRetrievalInfo?: string | null;
  sender?: {
    __typename?: 'PlayerMailCharacterDto';
    id: string;
    name: string;
  } | null;
  recipient?: {
    __typename?: 'PlayerMailCharacterDto';
    id: string;
    name: string;
  } | null;
  attachedObject?: {
    __typename?: 'PlayerMailObjectDto';
    zoneId: number;
    id: number;
    name: string;
  } | null;
};

export type GetMyMailQueryVariables = Exact<{
  characterId: Scalars['String']['input'];
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetMyMailQuery = {
  __typename?: 'Query';
  myMail: Array<{
    __typename?: 'PlayerMailDto';
    id: number;
    legacySenderId?: number | null;
    legacyRecipientId?: number | null;
    senderCharacterId?: string | null;
    recipientCharacterId?: string | null;
    body: string;
    sentAt: any;
    readAt?: any | null;
    attachedCopper: number;
    attachedSilver: number;
    attachedGold: number;
    attachedPlatinum: number;
    attachedObjectZoneId?: number | null;
    attachedObjectId?: number | null;
    wealthRetrievedAt?: any | null;
    wealthRetrievedByCharacterId?: string | null;
    objectRetrievedAt?: any | null;
    objectRetrievedByCharacterId?: string | null;
    objectMovedToAccountStorage: boolean;
    isDeleted: boolean;
    createdAt: any;
    senderName: string;
    wealthRetrievalInfo?: string | null;
    objectRetrievalInfo?: string | null;
    sender?: {
      __typename?: 'PlayerMailCharacterDto';
      id: string;
      name: string;
    } | null;
    recipient?: {
      __typename?: 'PlayerMailCharacterDto';
      id: string;
      name: string;
    } | null;
    attachedObject?: {
      __typename?: 'PlayerMailObjectDto';
      zoneId: number;
      id: number;
      name: string;
    } | null;
  }>;
};

export type GetMyMailCountQueryVariables = Exact<{
  characterId: Scalars['String']['input'];
}>;

export type GetMyMailCountQuery = { __typename?: 'Query'; myMailCount: number };

export type GetPlayerMailByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type GetPlayerMailByIdQuery = {
  __typename?: 'Query';
  playerMail?: {
    __typename?: 'PlayerMailDto';
    id: number;
    legacySenderId?: number | null;
    legacyRecipientId?: number | null;
    senderCharacterId?: string | null;
    recipientCharacterId?: string | null;
    body: string;
    sentAt: any;
    readAt?: any | null;
    attachedCopper: number;
    attachedSilver: number;
    attachedGold: number;
    attachedPlatinum: number;
    attachedObjectZoneId?: number | null;
    attachedObjectId?: number | null;
    wealthRetrievedAt?: any | null;
    wealthRetrievedByCharacterId?: string | null;
    objectRetrievedAt?: any | null;
    objectRetrievedByCharacterId?: string | null;
    objectMovedToAccountStorage: boolean;
    isDeleted: boolean;
    createdAt: any;
    senderName: string;
    wealthRetrievalInfo?: string | null;
    objectRetrievalInfo?: string | null;
    sender?: {
      __typename?: 'PlayerMailCharacterDto';
      id: string;
      name: string;
    } | null;
    recipient?: {
      __typename?: 'PlayerMailCharacterDto';
      id: string;
      name: string;
    } | null;
    attachedObject?: {
      __typename?: 'PlayerMailObjectDto';
      zoneId: number;
      id: number;
      name: string;
    } | null;
  } | null;
};

export type GetAllPlayerMailsQueryVariables = Exact<{
  filter?: InputMaybe<PlayerMailFilterInput>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetAllPlayerMailsQuery = {
  __typename?: 'Query';
  playerMails: Array<{
    __typename?: 'PlayerMailDto';
    id: number;
    legacySenderId?: number | null;
    legacyRecipientId?: number | null;
    senderCharacterId?: string | null;
    recipientCharacterId?: string | null;
    body: string;
    sentAt: any;
    readAt?: any | null;
    attachedCopper: number;
    attachedSilver: number;
    attachedGold: number;
    attachedPlatinum: number;
    attachedObjectZoneId?: number | null;
    attachedObjectId?: number | null;
    wealthRetrievedAt?: any | null;
    wealthRetrievedByCharacterId?: string | null;
    objectRetrievedAt?: any | null;
    objectRetrievedByCharacterId?: string | null;
    objectMovedToAccountStorage: boolean;
    isDeleted: boolean;
    createdAt: any;
    senderName: string;
    wealthRetrievalInfo?: string | null;
    objectRetrievalInfo?: string | null;
    sender?: {
      __typename?: 'PlayerMailCharacterDto';
      id: string;
      name: string;
    } | null;
    recipient?: {
      __typename?: 'PlayerMailCharacterDto';
      id: string;
      name: string;
    } | null;
    attachedObject?: {
      __typename?: 'PlayerMailObjectDto';
      zoneId: number;
      id: number;
      name: string;
    } | null;
  }>;
};

export type GetPlayerMailCountQueryVariables = Exact<{
  filter?: InputMaybe<PlayerMailFilterInput>;
}>;

export type GetPlayerMailCountQuery = {
  __typename?: 'Query';
  playerMailCount: number;
};

export type SendPlayerMailMutationVariables = Exact<{
  data: SendPlayerMailInput;
}>;

export type SendPlayerMailMutation = {
  __typename?: 'Mutation';
  sendMail: {
    __typename?: 'PlayerMailDto';
    id: number;
    legacySenderId?: number | null;
    legacyRecipientId?: number | null;
    senderCharacterId?: string | null;
    recipientCharacterId?: string | null;
    body: string;
    sentAt: any;
    readAt?: any | null;
    attachedCopper: number;
    attachedSilver: number;
    attachedGold: number;
    attachedPlatinum: number;
    attachedObjectZoneId?: number | null;
    attachedObjectId?: number | null;
    wealthRetrievedAt?: any | null;
    wealthRetrievedByCharacterId?: string | null;
    objectRetrievedAt?: any | null;
    objectRetrievedByCharacterId?: string | null;
    objectMovedToAccountStorage: boolean;
    isDeleted: boolean;
    createdAt: any;
    senderName: string;
    wealthRetrievalInfo?: string | null;
    objectRetrievalInfo?: string | null;
    sender?: {
      __typename?: 'PlayerMailCharacterDto';
      id: string;
      name: string;
    } | null;
    recipient?: {
      __typename?: 'PlayerMailCharacterDto';
      id: string;
      name: string;
    } | null;
    attachedObject?: {
      __typename?: 'PlayerMailObjectDto';
      zoneId: number;
      id: number;
      name: string;
    } | null;
  };
};

export type MarkPlayerMailReadMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type MarkPlayerMailReadMutation = {
  __typename?: 'Mutation';
  markMailRead: {
    __typename?: 'PlayerMailDto';
    id: number;
    readAt?: any | null;
  };
};

export type MarkWealthRetrievedMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  characterId: Scalars['String']['input'];
}>;

export type MarkWealthRetrievedMutation = {
  __typename?: 'Mutation';
  markWealthRetrieved: {
    __typename?: 'PlayerMailDto';
    id: number;
    wealthRetrievedAt?: any | null;
    wealthRetrievedByCharacterId?: string | null;
    wealthRetrievalInfo?: string | null;
  };
};

export type MarkObjectRetrievedMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  characterId: Scalars['String']['input'];
  movedToAccountStorage: Scalars['Boolean']['input'];
}>;

export type MarkObjectRetrievedMutation = {
  __typename?: 'Mutation';
  markObjectRetrieved: {
    __typename?: 'PlayerMailDto';
    id: number;
    objectRetrievedAt?: any | null;
    objectRetrievedByCharacterId?: string | null;
    objectMovedToAccountStorage: boolean;
    objectRetrievalInfo?: string | null;
  };
};

export type DeletePlayerMailMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type DeletePlayerMailMutation = {
  __typename?: 'Mutation';
  deletePlayerMail: {
    __typename?: 'PlayerMailDto';
    id: number;
    isDeleted: boolean;
  };
};

export type GetMobQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;

export type GetMobQuery = {
  __typename?: 'Query';
  mob: {
    __typename?: 'MobDto';
    id: number;
    zoneId: number;
    keywords: Array<string>;
    name: string;
    roomDescription: string;
    examineDescription: string;
    level: number;
    role: MobRole;
    alignment: number;
    hitRoll: number;
    armorClass: number;
    accuracy: number;
    attackPower: number;
    spellPower: number;
    penetrationFlat: number;
    penetrationPercent: number;
    evasion: number;
    armorRating: number;
    damageReductionPercent: number;
    soak: number;
    hardness: number;
    wardPercent: number;
    resistanceFire: number;
    resistanceCold: number;
    resistanceLightning: number;
    resistanceAcid: number;
    resistancePoison: number;
    hpDice: string;
    damageDice: string;
    damageType: DamageType;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    perception: number;
    concealment: number;
    race: Race;
    gender: Gender;
    size: Size;
    lifeForce: LifeForce;
    composition: Composition;
    mobFlags: Array<MobFlag>;
    effectFlags: Array<EffectFlag>;
    position: Position;
    stance: Stance;
    createdAt: any;
    updatedAt: any;
  };
};

export type GetMobsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetMobsQuery = {
  __typename?: 'Query';
  mobs: Array<{
    __typename?: 'MobDto';
    id: number;
    zoneId: number;
    keywords: Array<string>;
    name: string;
    roomDescription: string;
    examineDescription: string;
    level: number;
    alignment: number;
    race: Race;
    hitRoll: number;
    armorClass: number;
    damageType: DamageType;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    lifeForce: LifeForce;
    hpDice: string;
    damageDice: string;
    mobFlags: Array<MobFlag>;
    effectFlags: Array<EffectFlag>;
  }>;
};

export type GetMobsByZoneQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;

export type GetMobsByZoneQuery = {
  __typename?: 'Query';
  mobsByZone: Array<{
    __typename?: 'MobDto';
    id: number;
    zoneId: number;
    keywords: Array<string>;
    name: string;
    roomDescription: string;
    examineDescription: string;
    level: number;
    alignment: number;
    race: Race;
    hitRoll: number;
    armorClass: number;
    damageType: DamageType;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    wealth?: number | null;
    hpDice: string;
    damageDice: string;
    mobFlags: Array<MobFlag>;
    effectFlags: Array<EffectFlag>;
    lifeForce: LifeForce;
  }>;
};

export type SearchMobsQueryVariables = Exact<{
  search: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  zoneId?: InputMaybe<Scalars['Int']['input']>;
}>;

export type SearchMobsQuery = {
  __typename?: 'Query';
  searchMobs: Array<{
    __typename?: 'MobDto';
    id: number;
    zoneId: number;
    name: string;
    plainName: string;
    roomDescription: string;
    level: number;
    race: Race;
  }>;
};

export type GetRacesQueryVariables = Exact<{ [key: string]: never }>;

export type GetRacesQuery = {
  __typename?: 'Query';
  races: Array<{
    __typename?: 'RaceDto';
    race: Race;
    name: string;
    plainName: string;
    playable: boolean;
    humanoid: boolean;
    magical: boolean;
  }>;
};

export type UpdateRaceMutationVariables = Exact<{
  race: Race;
  data: UpdateRaceInput;
}>;

export type UpdateRaceMutation = {
  __typename?: 'Mutation';
  updateRace: {
    __typename?: 'RaceDto';
    race: Race;
    name: string;
    plainName: string;
    playable: boolean;
    humanoid: boolean;
    magical: boolean;
  };
};

export type GetShopEditorQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;

export type GetShopEditorQuery = {
  __typename?: 'Query';
  shop: {
    __typename?: 'ShopDto';
    id: number;
    buyProfit: number;
    sellProfit: number;
    temper: number;
    noSuchItemMessages: Array<string>;
    doNotBuyMessages: Array<string>;
    missingCashMessages: Array<string>;
    buyMessages: Array<string>;
    sellMessages: Array<string>;
    keeperId?: number | null;
    zoneId: number;
    flags: Array<ShopFlag>;
    tradesWithFlags: Array<ShopTradesWith>;
    keeper?: {
      __typename?: 'KeeperDto';
      id: number;
      name: string;
      zoneId: number;
    } | null;
    items: Array<{
      __typename?: 'ShopItemDto';
      id: string;
      amount: number;
      objectId: number;
      objectZoneId: number;
      object?: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        name: string;
        type: string;
        cost?: number | null;
      } | null;
    }>;
    accepts: Array<{
      __typename?: 'ShopAcceptDto';
      id: string;
      type: string;
      keywords?: string | null;
    }>;
    hours: Array<{
      __typename?: 'ShopHourDto';
      id: string;
      open: number;
      close: number;
    }>;
  };
};

export type UpdateShopEditorMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
  data: UpdateShopInput;
}>;

export type UpdateShopEditorMutation = {
  __typename?: 'Mutation';
  updateShop: {
    __typename?: 'ShopDto';
    id: number;
    buyProfit: number;
    sellProfit: number;
  };
};

export type CreateShopEditorMutationVariables = Exact<{
  data: CreateShopInput;
}>;

export type CreateShopEditorMutation = {
  __typename?: 'Mutation';
  createShop: {
    __typename?: 'ShopDto';
    id: number;
    buyProfit: number;
    sellProfit: number;
  };
};

export type UpdateShopInventoryEditorMutationVariables = Exact<{
  zoneId: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  items: Array<ShopItemInput> | ShopItemInput;
}>;

export type UpdateShopInventoryEditorMutation = {
  __typename?: 'Mutation';
  updateShopInventory: {
    __typename?: 'ShopDto';
    id: number;
    items: Array<{
      __typename?: 'ShopItemDto';
      id: string;
      amount: number;
      objectId: number;
      objectZoneId: number;
      object?: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        name: string;
        type: string;
        cost?: number | null;
      } | null;
    }>;
  };
};

export type UpdateShopHoursEditorMutationVariables = Exact<{
  zoneId: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  hours: Array<ShopHourInput> | ShopHourInput;
}>;

export type UpdateShopHoursEditorMutation = {
  __typename?: 'Mutation';
  updateShopHours: {
    __typename?: 'ShopDto';
    id: number;
    hours: Array<{
      __typename?: 'ShopHourDto';
      id: string;
      open: number;
      close: number;
    }>;
  };
};

export type GetAvailableObjectsQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;

export type GetAvailableObjectsQuery = {
  __typename?: 'Query';
  objectsByZone: Array<{
    __typename?: 'ObjectDto';
    id: number;
    keywords: Array<string>;
    name: string;
    type: ObjectType;
    cost: number;
    zoneId: number;
  }>;
};

export type GetAvailableMobsQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;

export type GetAvailableMobsQuery = {
  __typename?: 'Query';
  mobsByZone: Array<{
    __typename?: 'MobDto';
    id: number;
    keywords: Array<string>;
    name: string;
    zoneId: number;
  }>;
};

export type GetZonesEditorQueryVariables = Exact<{ [key: string]: never }>;

export type GetZonesEditorQuery = {
  __typename?: 'Query';
  zones: Array<{ __typename?: 'ZoneDto'; id: number; name: string }>;
};

export type GetShopsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetShopsQuery = {
  __typename?: 'Query';
  shopsCount: number;
  shops: Array<{
    __typename?: 'ShopDto';
    id: number;
    zoneId: number;
    temper: number;
    sellProfit: number;
    buyProfit: number;
  }>;
};

export type GetShopsByZoneQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;

export type GetShopsByZoneQuery = {
  __typename?: 'Query';
  shopsByZone: Array<{
    __typename?: 'ShopDto';
    id: number;
    zoneId: number;
    temper: number;
    sellProfit: number;
    buyProfit: number;
  }>;
};

export type GetShopQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;

export type GetShopQuery = {
  __typename?: 'Query';
  shop: {
    __typename?: 'ShopDto';
    id: number;
    zoneId: number;
    keeperId?: number | null;
    buyMessages: Array<string>;
    sellMessages: Array<string>;
    missingCashMessages: Array<string>;
  };
};

export type CreateShopMutationVariables = Exact<{
  data: CreateShopInput;
}>;

export type CreateShopMutation = {
  __typename?: 'Mutation';
  createShop: { __typename?: 'ShopDto'; id: number; zoneId: number };
};

export type UpdateShopMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
  data: UpdateShopInput;
}>;

export type UpdateShopMutation = {
  __typename?: 'Mutation';
  updateShop: { __typename?: 'ShopDto'; id: number; zoneId: number };
};

export type DeleteShopMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;

export type DeleteShopMutation = {
  __typename?: 'Mutation';
  deleteShop: { __typename?: 'ShopDto'; id: number };
};

export type GetSocialsQueryVariables = Exact<{ [key: string]: never }>;

export type GetSocialsQuery = {
  __typename?: 'Query';
  socialsCount: number;
  socials: Array<{
    __typename?: 'SocialDto';
    id: string;
    name: string;
    hide: boolean;
    minVictimPosition: Position;
    charNoArg?: string | null;
    othersNoArg?: string | null;
    charFound?: string | null;
    othersFound?: string | null;
    victFound?: string | null;
    notFound?: string | null;
    charAuto?: string | null;
    othersAuto?: string | null;
  }>;
};

export type GetSocialQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type GetSocialQuery = {
  __typename?: 'Query';
  social: {
    __typename?: 'SocialDto';
    id: string;
    name: string;
    hide: boolean;
    minVictimPosition: Position;
    charNoArg?: string | null;
    othersNoArg?: string | null;
    charFound?: string | null;
    othersFound?: string | null;
    victFound?: string | null;
    notFound?: string | null;
    charAuto?: string | null;
    othersAuto?: string | null;
    createdAt: any;
    updatedAt: any;
  };
};

export type SearchSocialsQueryVariables = Exact<{
  query: Scalars['String']['input'];
}>;

export type SearchSocialsQuery = {
  __typename?: 'Query';
  searchSocials: Array<{
    __typename?: 'SocialDto';
    id: string;
    name: string;
    hide: boolean;
    minVictimPosition: Position;
    charNoArg?: string | null;
    othersNoArg?: string | null;
  }>;
};

export type CreateSocialMutationVariables = Exact<{
  data: CreateSocialInput;
}>;

export type CreateSocialMutation = {
  __typename?: 'Mutation';
  createSocial: {
    __typename?: 'SocialDto';
    id: string;
    name: string;
    hide: boolean;
    minVictimPosition: Position;
  };
};

export type UpdateSocialMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateSocialInput;
}>;

export type UpdateSocialMutation = {
  __typename?: 'Mutation';
  updateSocial: {
    __typename?: 'SocialDto';
    id: string;
    name: string;
    hide: boolean;
    minVictimPosition: Position;
    charNoArg?: string | null;
    othersNoArg?: string | null;
    charFound?: string | null;
    othersFound?: string | null;
    victFound?: string | null;
    notFound?: string | null;
    charAuto?: string | null;
    othersAuto?: string | null;
  };
};

export type DeleteSocialMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteSocialMutation = {
  __typename?: 'Mutation';
  deleteSocial: boolean;
};

export type TriggerFieldsFragment = {
  __typename?: 'TriggerDto';
  id: string;
  name: string;
  attachType: ScriptType;
  numArgs: number;
  argList: Array<string>;
  commands: string;
  zoneId?: number | null;
  mobId?: number | null;
  objectId?: number | null;
  variables: string;
  flags: Array<string>;
  needsReview: boolean;
  syntaxError?: string | null;
  legacyVnum?: number | null;
  legacyScript?: string | null;
  createdAt: any;
  updatedAt: any;
  createdBy?: string | null;
  updatedBy?: string | null;
};

export type GetTriggersQueryVariables = Exact<{ [key: string]: never }>;

export type GetTriggersQuery = {
  __typename?: 'Query';
  triggers: Array<{
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    numArgs: number;
    argList: Array<string>;
    commands: string;
    zoneId?: number | null;
    mobId?: number | null;
    objectId?: number | null;
    variables: string;
    flags: Array<string>;
    needsReview: boolean;
    syntaxError?: string | null;
    legacyVnum?: number | null;
    legacyScript?: string | null;
    createdAt: any;
    updatedAt: any;
    createdBy?: string | null;
    updatedBy?: string | null;
  }>;
};

export type GetTriggersNeedingReviewQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetTriggersNeedingReviewQuery = {
  __typename?: 'Query';
  triggersNeedingReview: Array<{
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    numArgs: number;
    argList: Array<string>;
    commands: string;
    zoneId?: number | null;
    mobId?: number | null;
    objectId?: number | null;
    variables: string;
    flags: Array<string>;
    needsReview: boolean;
    syntaxError?: string | null;
    legacyVnum?: number | null;
    legacyScript?: string | null;
    createdAt: any;
    updatedAt: any;
    createdBy?: string | null;
    updatedBy?: string | null;
  }>;
};

export type GetTriggersNeedingReviewCountQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetTriggersNeedingReviewCountQuery = {
  __typename?: 'Query';
  triggersNeedingReviewCount: number;
};

export type GetTriggerQueryVariables = Exact<{
  id: Scalars['Float']['input'];
}>;

export type GetTriggerQuery = {
  __typename?: 'Query';
  trigger: {
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    numArgs: number;
    argList: Array<string>;
    commands: string;
    zoneId?: number | null;
    mobId?: number | null;
    objectId?: number | null;
    variables: string;
    flags: Array<string>;
    needsReview: boolean;
    syntaxError?: string | null;
    legacyVnum?: number | null;
    legacyScript?: string | null;
    createdAt: any;
    updatedAt: any;
    createdBy?: string | null;
    updatedBy?: string | null;
  };
};

export type GetTriggersByAttachmentQueryVariables = Exact<{
  attachType: ScriptType;
  entityId: Scalars['Int']['input'];
}>;

export type GetTriggersByAttachmentQuery = {
  __typename?: 'Query';
  triggersByAttachment: Array<{
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    numArgs: number;
    argList: Array<string>;
    commands: string;
    zoneId?: number | null;
    mobId?: number | null;
    objectId?: number | null;
    variables: string;
    flags: Array<string>;
    needsReview: boolean;
    syntaxError?: string | null;
    legacyVnum?: number | null;
    legacyScript?: string | null;
    createdAt: any;
    updatedAt: any;
    createdBy?: string | null;
    updatedBy?: string | null;
  }>;
};

export type CreateTriggerMutationVariables = Exact<{
  input: CreateTriggerInput;
}>;

export type CreateTriggerMutation = {
  __typename?: 'Mutation';
  createTrigger: {
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    numArgs: number;
    argList: Array<string>;
    commands: string;
    zoneId?: number | null;
    mobId?: number | null;
    objectId?: number | null;
    variables: string;
    flags: Array<string>;
    needsReview: boolean;
    syntaxError?: string | null;
    legacyVnum?: number | null;
    legacyScript?: string | null;
    createdAt: any;
    updatedAt: any;
    createdBy?: string | null;
    updatedBy?: string | null;
  };
};

export type UpdateTriggerMutationVariables = Exact<{
  id: Scalars['Float']['input'];
  input: UpdateTriggerInput;
}>;

export type UpdateTriggerMutation = {
  __typename?: 'Mutation';
  updateTrigger: {
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    numArgs: number;
    argList: Array<string>;
    commands: string;
    zoneId?: number | null;
    mobId?: number | null;
    objectId?: number | null;
    variables: string;
    flags: Array<string>;
    needsReview: boolean;
    syntaxError?: string | null;
    legacyVnum?: number | null;
    legacyScript?: string | null;
    createdAt: any;
    updatedAt: any;
    createdBy?: string | null;
    updatedBy?: string | null;
  };
};

export type DeleteTriggerMutationVariables = Exact<{
  id: Scalars['Float']['input'];
}>;

export type DeleteTriggerMutation = {
  __typename?: 'Mutation';
  deleteTrigger: { __typename?: 'TriggerDto'; id: string };
};

export type AttachTriggerMutationVariables = Exact<{
  input: AttachTriggerInput;
}>;

export type AttachTriggerMutation = {
  __typename?: 'Mutation';
  attachTrigger: {
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    numArgs: number;
    argList: Array<string>;
    commands: string;
    zoneId?: number | null;
    mobId?: number | null;
    objectId?: number | null;
    variables: string;
    flags: Array<string>;
    needsReview: boolean;
    syntaxError?: string | null;
    legacyVnum?: number | null;
    legacyScript?: string | null;
    createdAt: any;
    updatedAt: any;
    createdBy?: string | null;
    updatedBy?: string | null;
  };
};

export type DetachTriggerMutationVariables = Exact<{
  triggerId: Scalars['Float']['input'];
}>;

export type DetachTriggerMutation = {
  __typename?: 'Mutation';
  detachTrigger: { __typename?: 'TriggerDto'; id: string };
};

export type MarkTriggerReviewedMutationVariables = Exact<{
  triggerId: Scalars['Int']['input'];
}>;

export type MarkTriggerReviewedMutation = {
  __typename?: 'Mutation';
  markTriggerReviewed: {
    __typename?: 'TriggerDto';
    id: string;
    name: string;
    attachType: ScriptType;
    numArgs: number;
    argList: Array<string>;
    commands: string;
    zoneId?: number | null;
    mobId?: number | null;
    objectId?: number | null;
    variables: string;
    flags: Array<string>;
    needsReview: boolean;
    syntaxError?: string | null;
    legacyVnum?: number | null;
    legacyScript?: string | null;
    createdAt: any;
    updatedAt: any;
    createdBy?: string | null;
    updatedBy?: string | null;
  };
};

export type UsersQueryVariables = Exact<{ [key: string]: never }>;

export type UsersQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'User';
    id: string;
    username: string;
    role: UserRole;
    lastLoginAt?: any | null;
    isBanned: boolean;
  }>;
  myPermissions: {
    __typename?: 'UserPermissions';
    isGod: boolean;
    isCoder: boolean;
    isBuilder: boolean;
    canManageUsers: boolean;
  };
};

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  role?: InputMaybe<UserRole>;
}>;

export type UpdateUserMutation = {
  __typename?: 'Mutation';
  updateUser: {
    __typename?: 'User';
    id: string;
    username: string;
    role: UserRole;
  };
};

export type BanUserMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
  expiresAt?: InputMaybe<Scalars['String']['input']>;
}>;

export type BanUserMutation = {
  __typename?: 'Mutation';
  banUser: {
    __typename?: 'BanRecord';
    id: string;
    userId: string;
    reason: string;
    bannedAt: any;
    expiresAt?: any | null;
    active: boolean;
  };
};

export type UnbanUserMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;

export type UnbanUserMutation = {
  __typename?: 'Mutation';
  unbanUser: {
    __typename?: 'BanRecord';
    id: string;
    userId: string;
    active: boolean;
    unbannedAt?: any | null;
  };
};

export type GetZonesQueryVariables = Exact<{ [key: string]: never }>;

export type GetZonesQuery = {
  __typename?: 'Query';
  zones: Array<{
    __typename?: 'ZoneDto';
    id: number;
    name: string;
    climate: Climate;
    lifespan: number;
    resetMode: ResetMode;
  }>;
};

export type GetZonesForSelectorQueryVariables = Exact<{ [key: string]: never }>;

export type GetZonesForSelectorQuery = {
  __typename?: 'Query';
  zones: Array<{ __typename?: 'ZoneDto'; id: number; name: string }>;
};

export type OnlineCharactersQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['ID']['input']>;
}>;

export type OnlineCharactersQuery = {
  __typename?: 'Query';
  onlineCharacters: Array<{
    __typename?: 'OnlineCharacterDto';
    id: string;
    name: string;
    level: number;
    lastLogin?: any | null;
    isOnline: boolean;
    raceType?: string | null;
    playerClass?: string | null;
    user: {
      __typename?: 'UserSummaryDto';
      id: string;
      username: string;
      role: string;
    };
  }>;
};

export type MyOnlineCharactersQueryVariables = Exact<{ [key: string]: never }>;

export type MyOnlineCharactersQuery = {
  __typename?: 'Query';
  myOnlineCharacters: Array<{
    __typename?: 'OnlineCharacterDto';
    id: string;
    name: string;
    level: number;
    lastLogin?: any | null;
    isOnline: boolean;
    raceType?: string | null;
    playerClass?: string | null;
    user: {
      __typename?: 'UserSummaryDto';
      id: string;
      username: string;
      role: string;
    };
  }>;
};

export type CharacterSessionInfoQueryVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;

export type CharacterSessionInfoQuery = {
  __typename?: 'Query';
  characterSessionInfo: {
    __typename?: 'CharacterSessionInfoDto';
    id: string;
    name: string;
    isOnline: boolean;
    lastLogin?: any | null;
    totalTimePlayed: number;
    currentSessionTime: number;
  };
};

export type SetCharacterOnlineMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;

export type SetCharacterOnlineMutation = {
  __typename?: 'Mutation';
  setCharacterOnline: boolean;
};

export type SetCharacterOfflineMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;

export type SetCharacterOfflineMutation = {
  __typename?: 'Mutation';
  setCharacterOffline: boolean;
};

export type UpdateCharacterActivityMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;

export type UpdateCharacterActivityMutation = {
  __typename?: 'Mutation';
  updateCharacterActivity: boolean;
};

export type MyPermissionsQueryVariables = Exact<{ [key: string]: never }>;

export type MyPermissionsQuery = {
  __typename?: 'Query';
  myPermissions: {
    __typename?: 'UserPermissions';
    isPlayer: boolean;
    isImmortal: boolean;
    isBuilder: boolean;
    isCoder: boolean;
    isGod: boolean;
    canAccessDashboard: boolean;
    canManageUsers: boolean;
    canViewValidation: boolean;
    maxCharacterLevel: number;
    role: UserRole;
  };
};

export const AccountMailUserFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountMailUserFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountMailUserDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AccountMailUserFieldsFragment, unknown>;
export const AccountMailFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountMailFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountMailDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderUserId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'recipientUserId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isBroadcast' } },
          { kind: 'Field', name: { kind: 'Name', value: 'subject' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sentAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'readAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isDeleted' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sender' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountMailUserFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipient' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountMailUserFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountMailUserFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountMailUserDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AccountMailFieldsFragment, unknown>;
export const AccountItemObjectFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemObjectFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AccountItemObjectFieldsFragment, unknown>;
export const AccountItemCharacterFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemCharacterFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemCharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AccountItemCharacterFieldsFragment, unknown>;
export const AccountItemFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slot' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectZoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'quantity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'customData' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storedByCharacterId' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'object' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountItemObjectFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storedByCharacter' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountItemCharacterFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemObjectFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemCharacterFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemCharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AccountItemFieldsFragment, unknown>;
export const AccountStorageFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountStorageFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountStorageDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'accountWealth' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'items' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountItemFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemObjectFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemCharacterFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemCharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slot' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectZoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'quantity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'customData' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storedByCharacterId' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'object' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountItemObjectFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storedByCharacter' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountItemCharacterFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AccountStorageFieldsFragment, unknown>;
export const WealthDisplayFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'WealthDisplayFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'WealthDisplayDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'totalCopper' } },
          { kind: 'Field', name: { kind: 'Name', value: 'platinum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gold' } },
          { kind: 'Field', name: { kind: 'Name', value: 'silver' } },
          { kind: 'Field', name: { kind: 'Name', value: 'copper' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<WealthDisplayFieldsFragment, unknown>;
export const CharacterCardFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CharacterCardFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
          { kind: 'Field', name: { kind: 'Name', value: 'timePlayed' } },
          { kind: 'Field', name: { kind: 'Name', value: 'hitPoints' } },
          { kind: 'Field', name: { kind: 'Name', value: 'hitPointsMax' } },
          { kind: 'Field', name: { kind: 'Name', value: 'movement' } },
          { kind: 'Field', name: { kind: 'Name', value: 'movementMax' } },
          { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
          { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
          { kind: 'Field', name: { kind: 'Name', value: 'intelligence' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'constitution' } },
          { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
          { kind: 'Field', name: { kind: 'Name', value: 'luck' } },
          { kind: 'Field', name: { kind: 'Name', value: 'experience' } },
          { kind: 'Field', name: { kind: 'Name', value: 'copper' } },
          { kind: 'Field', name: { kind: 'Name', value: 'silver' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gold' } },
          { kind: 'Field', name: { kind: 'Name', value: 'platinum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'currentRoom' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CharacterCardFieldsFragment, unknown>;
export const ObjectSummaryFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ObjectSummary' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'ObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weight' } },
          { kind: 'Field', name: { kind: 'Name', value: 'cost' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
          { kind: 'Field', name: { kind: 'Name', value: 'values' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ObjectSummaryFragment, unknown>;
export const ObjectDetailsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ObjectDetails' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'ObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'FragmentSpread',
            name: { kind: 'Name', value: 'ObjectSummary' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'examineDescription' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'roomDescription' } },
          { kind: 'Field', name: { kind: 'Name', value: 'actionDescription' } },
          { kind: 'Field', name: { kind: 'Name', value: 'concealment' } },
          { kind: 'Field', name: { kind: 'Name', value: 'timer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'decomposeTimer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'effectFlags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wearFlags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ObjectSummary' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'ObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weight' } },
          { kind: 'Field', name: { kind: 'Name', value: 'cost' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
          { kind: 'Field', name: { kind: 'Name', value: 'values' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ObjectDetailsFragment, unknown>;
export const PlayerMailCharacterFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailCharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PlayerMailCharacterFieldsFragment, unknown>;
export const PlayerMailObjectFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailObjectFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PlayerMailObjectFieldsFragment, unknown>;
export const PlayerMailFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacySenderId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyRecipientId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderCharacterId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipientCharacterId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sentAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'readAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedCopper' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedSilver' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedGold' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedPlatinum' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachedObjectZoneId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedObjectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wealthRetrievedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'wealthRetrievedByCharacterId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'objectRetrievedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectRetrievedByCharacterId' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectMovedToAccountStorage' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'isDeleted' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'wealthRetrievalInfo' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectRetrievalInfo' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sender' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipient' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachedObject' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailObjectFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailCharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailObjectFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PlayerMailFieldsFragment, unknown>;
export const TriggerFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TriggerFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'TriggerDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
          { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
          { kind: 'Field', name: { kind: 'Name', value: 'syntaxError' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyVnum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyScript' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedBy' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<TriggerFieldsFragment, unknown>;
export const GetGameConfigsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetGameConfigs' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'gameConfigs' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'category' } },
                { kind: 'Field', name: { kind: 'Name', value: 'key' } },
                { kind: 'Field', name: { kind: 'Name', value: 'value' } },
                { kind: 'Field', name: { kind: 'Name', value: 'valueType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxValue' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isSecret' } },
                { kind: 'Field', name: { kind: 'Name', value: 'restartReq' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'gameConfigCategories' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetGameConfigsQuery, GetGameConfigsQueryVariables>;
export const UpdateGameConfigDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateGameConfig' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'category' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'key' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateGameConfigInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateGameConfig' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'category' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'category' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'key' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'key' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'value' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateGameConfigMutation,
  UpdateGameConfigMutationVariables
>;
export const GetLevelDefinitionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetLevelDefinitions' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'levelDefinitions' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'expRequired' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hpGain' } },
                { kind: 'Field', name: { kind: 'Name', value: 'staminaGain' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isImmortal' } },
                { kind: 'Field', name: { kind: 'Name', value: 'permissions' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'availablePermissions' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetLevelDefinitionsQuery,
  GetLevelDefinitionsQueryVariables
>;
export const UpdateLevelDefinitionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateLevelDefinition' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'level' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateLevelDefinitionInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateLevelDefinition' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'level' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'level' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'expRequired' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hpGain' } },
                { kind: 'Field', name: { kind: 'Name', value: 'staminaGain' } },
                { kind: 'Field', name: { kind: 'Name', value: 'permissions' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateLevelDefinitionMutation,
  UpdateLevelDefinitionMutationVariables
>;
export const GetSystemTextsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetSystemTexts' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'systemTexts' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'key' } },
                { kind: 'Field', name: { kind: 'Name', value: 'category' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minLevel' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetSystemTextsQuery, GetSystemTextsQueryVariables>;
export const UpdateSystemTextDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateSystemText' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateSystemTextInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateSystemText' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSystemTextMutation,
  UpdateSystemTextMutationVariables
>;
export const GetLoginMessagesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetLoginMessages' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'loginMessages' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stage' } },
                { kind: 'Field', name: { kind: 'Name', value: 'variant' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetLoginMessagesQuery,
  GetLoginMessagesQueryVariables
>;
export const UpdateLoginMessageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateLoginMessage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateLoginMessageInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateLoginMessage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isActive' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateLoginMessageMutation,
  UpdateLoginMessageMutationVariables
>;
export const GetBoardPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetBoardPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'board' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alias' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'locked' } },
                { kind: 'Field', name: { kind: 'Name', value: 'privileges' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'messageCount' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'messages' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'poster' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'posterLevel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'postedAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'subject' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'content' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'sticky' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'edits' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'editor' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'editedAt' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetBoardPageQuery, GetBoardPageQueryVariables>;
export const CreateBoardMessagePageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateBoardMessagePage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateBoardMessageInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createBoardMessage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'poster' } },
                { kind: 'Field', name: { kind: 'Name', value: 'subject' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'postedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateBoardMessagePageMutation,
  CreateBoardMessagePageMutationVariables
>;
export const UpdateBoardMessagePageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateBoardMessagePage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateBoardMessageInput' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'editor' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateBoardMessage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'editor' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'editor' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'subject' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateBoardMessagePageMutation,
  UpdateBoardMessagePageMutationVariables
>;
export const DeleteBoardMessagePageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteBoardMessagePage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteBoardMessage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteBoardMessagePageMutation,
  DeleteBoardMessagePageMutationVariables
>;
export const GetBoardsPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetBoardsPage' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'boards' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alias' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'locked' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'messageCount' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'boardsCount' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetBoardsPageQuery, GetBoardsPageQueryVariables>;
export const UpdateViewModeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateViewMode' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdatePreferencesInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateUserPreferences' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'preferences' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'viewMode' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateViewModeMutation,
  UpdateViewModeMutationVariables
>;
export const GetHelpEntriesPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetHelpEntriesPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'HelpEntryFilterInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'helpEntries' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minLevel' } },
                { kind: 'Field', name: { kind: 'Name', value: 'category' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usage' } },
                { kind: 'Field', name: { kind: 'Name', value: 'duration' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sphere' } },
                { kind: 'Field', name: { kind: 'Name', value: 'classes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sourceFile' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'helpEntriesCount' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
            ],
          },
          { kind: 'Field', name: { kind: 'Name', value: 'helpCategories' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetHelpEntriesPageQuery,
  GetHelpEntriesPageQueryVariables
>;
export const SearchHelpPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchHelpPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'query' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'HelpEntryFilterInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchHelp' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'query' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'query' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minLevel' } },
                { kind: 'Field', name: { kind: 'Name', value: 'category' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usage' } },
                { kind: 'Field', name: { kind: 'Name', value: 'duration' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sphere' } },
                { kind: 'Field', name: { kind: 'Name', value: 'classes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sourceFile' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchHelpPageQuery, SearchHelpPageQueryVariables>;
export const GetHelpByKeywordDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetHelpByKeyword' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'keyword' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'helpByKeyword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'keyword' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'keyword' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minLevel' } },
                { kind: 'Field', name: { kind: 'Name', value: 'category' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usage' } },
                { kind: 'Field', name: { kind: 'Name', value: 'duration' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sphere' } },
                { kind: 'Field', name: { kind: 'Name', value: 'classes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sourceFile' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetHelpByKeywordQuery,
  GetHelpByKeywordQueryVariables
>;
export const CreateHelpEntryPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateHelpEntryPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateHelpEntryInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createHelpEntry' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'category' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateHelpEntryPageMutation,
  CreateHelpEntryPageMutationVariables
>;
export const UpdateHelpEntryPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateHelpEntryPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateHelpEntryInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateHelpEntry' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'content' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minLevel' } },
                { kind: 'Field', name: { kind: 'Name', value: 'category' } },
                { kind: 'Field', name: { kind: 'Name', value: 'usage' } },
                { kind: 'Field', name: { kind: 'Name', value: 'duration' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sphere' } },
                { kind: 'Field', name: { kind: 'Name', value: 'classes' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateHelpEntryPageMutation,
  UpdateHelpEntryPageMutationVariables
>;
export const DeleteHelpEntryPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteHelpEntryPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteHelpEntry' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteHelpEntryPageMutation,
  DeleteHelpEntryPageMutationVariables
>;
export const GetObjectInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetObjectInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'object' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'examineDescription' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'actionDescription' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'weight' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timer' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'decomposeTimer' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'concealment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'values' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'wearFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetObjectInlineQuery,
  GetObjectInlineQueryVariables
>;
export const UpdateObjectInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateObjectInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateObjectInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateObject' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'examineDescription' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateObjectInlineMutation,
  UpdateObjectInlineMutationVariables
>;
export const CreateObjectInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateObjectInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateObjectInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createObject' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateObjectInlineMutation,
  CreateObjectInlineMutationVariables
>;
export const GetDashboardStatsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetDashboardStats' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zonesCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'roomsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mobsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectsCount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'shopsCount' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetDashboardStatsQuery,
  GetDashboardStatsQueryVariables
>;
export const GetRacesInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetRacesInline' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'races' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'plainName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playable' } },
                { kind: 'Field', name: { kind: 'Name', value: 'humanoid' } },
                { kind: 'Field', name: { kind: 'Name', value: 'magical' } },
                { kind: 'Field', name: { kind: 'Name', value: 'defaultSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxStrength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maxDexterity' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maxIntelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'maxWisdom' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maxConstitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'maxCharisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'expFactor' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hpFactor' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'permanentEffects' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'racesCount' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetRacesInlineQuery, GetRacesInlineQueryVariables>;
export const GetRaceSkillsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetRaceSkills' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'race' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Race' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'raceSkills' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'race' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'race' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skillId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skillName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'category' } },
                { kind: 'Field', name: { kind: 'Name', value: 'bonus' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetRaceSkillsQuery, GetRaceSkillsQueryVariables>;
export const UpdateRaceInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateRaceInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'race' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Race' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateRaceInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateRace' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'race' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'race' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playable' } },
                { kind: 'Field', name: { kind: 'Name', value: 'humanoid' } },
                { kind: 'Field', name: { kind: 'Name', value: 'magical' } },
                { kind: 'Field', name: { kind: 'Name', value: 'defaultSize' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxStrength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maxDexterity' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maxIntelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'maxWisdom' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maxConstitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'maxCharisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'expFactor' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hpFactor' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'permanentEffects' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateRaceInlineMutation,
  UpdateRaceInlineMutationVariables
>;
export const GetTriggersForScriptsPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTriggersForScriptsPage' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'triggers' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
                { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
                { kind: 'Field', name: { kind: 'Name', value: 'syntaxError' } },
                { kind: 'Field', name: { kind: 'Name', value: 'legacyVnum' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedBy' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTriggersForScriptsPageQuery,
  GetTriggersForScriptsPageQueryVariables
>;
export const CreateTriggerFromScriptsPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateTriggerFromScriptsPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateTriggerInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateTriggerFromScriptsPageMutation,
  CreateTriggerFromScriptsPageMutationVariables
>;
export const UpdateTriggerFromScriptsPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateTriggerFromScriptsPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateTriggerInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateTriggerFromScriptsPageMutation,
  UpdateTriggerFromScriptsPageMutationVariables
>;
export const DeleteTriggerFromScriptsPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteTriggerFromScriptsPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteTriggerFromScriptsPageMutation,
  DeleteTriggerFromScriptsPageMutationVariables
>;
export const MarkTriggerReviewedFromScriptsPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkTriggerReviewedFromScriptsPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'triggerId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markTriggerReviewed' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'triggerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'triggerId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkTriggerReviewedFromScriptsPageMutation,
  MarkTriggerReviewedFromScriptsPageMutationVariables
>;
export const GetShopsInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetShopsInline' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'shops' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'buyProfit' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sellProfit' } },
                { kind: 'Field', name: { kind: 'Name', value: 'temper' } },
                { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tradesWithFlags' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'noSuchItemMessages' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'doNotBuyMessages' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'missingCashMessages' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'buyMessages' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sellMessages' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'keeperId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'keeper' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'zoneId' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'keywords' },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'amount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'objectId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'object' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'zoneId' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'type' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'cost' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'accepts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'keywords' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetShopsInlineQuery, GetShopsInlineQueryVariables>;
export const GetShopsByZoneInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetShopsByZoneInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'shopsByZone' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'buyProfit' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sellProfit' } },
                { kind: 'Field', name: { kind: 'Name', value: 'temper' } },
                { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tradesWithFlags' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'noSuchItemMessages' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'doNotBuyMessages' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'missingCashMessages' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'buyMessages' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sellMessages' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'keeperId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'keeper' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'zoneId' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'keywords' },
                      },
                    ],
                  },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'amount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'objectId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'object' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'zoneId' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'type' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'cost' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'accepts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'keywords' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetShopsByZoneInlineQuery,
  GetShopsByZoneInlineQueryVariables
>;
export const DeleteShopInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteShopInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteShop' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteShopInlineMutation,
  DeleteShopInlineMutationVariables
>;
export const GetSocialsPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetSocialsPage' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'socials' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hide' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'minVictimPosition' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charNoArg' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersNoArg' } },
                { kind: 'Field', name: { kind: 'Name', value: 'charFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'victFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'charAuto' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersAuto' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'socialsCount' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetSocialsPageQuery, GetSocialsPageQueryVariables>;
export const CreateSocialPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateSocialPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateSocialInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createSocial' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hide' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'minVictimPosition' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateSocialPageMutation,
  CreateSocialPageMutationVariables
>;
export const UpdateSocialPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateSocialPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateSocialInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateSocial' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hide' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'minVictimPosition' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charNoArg' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersNoArg' } },
                { kind: 'Field', name: { kind: 'Name', value: 'charFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'victFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'charAuto' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersAuto' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSocialPageMutation,
  UpdateSocialPageMutationVariables
>;
export const DeleteSocialPageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteSocialPage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteSocial' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteSocialPageMutation,
  DeleteSocialPageMutationVariables
>;
export const UsersInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'UsersInline' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'users' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isBanned' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLoginAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'banRecords' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'reason' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'bannedAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'expiresAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'admin' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'username' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UsersInlineQuery, UsersInlineQueryVariables>;
export const UpdateUserInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateUserInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateUserInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateUserInlineMutation,
  UpdateUserInlineMutationVariables
>;
export const BanUserInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'BanUserInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'BanUserInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'banUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'reason' } },
                { kind: 'Field', name: { kind: 'Name', value: 'bannedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  BanUserInlineMutation,
  BanUserInlineMutationVariables
>;
export const UnbanUserInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UnbanUserInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UnbanUserInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'unbanUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'unbannedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UnbanUserInlineMutation,
  UnbanUserInlineMutationVariables
>;
export const GetZonesDashboardDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetZonesDashboard' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'zones' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'climate' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'roomsCount' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetZonesDashboardQuery,
  GetZonesDashboardQueryVariables
>;
export const RequestPasswordResetInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RequestPasswordResetInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'RequestPasswordResetInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'requestPasswordReset' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RequestPasswordResetInlineMutation,
  RequestPasswordResetInlineMutationVariables
>;
export const ChangePasswordInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ChangePasswordInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ChangePasswordInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'changePassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChangePasswordInlineMutation,
  ChangePasswordInlineMutationVariables
>;
export const UpdateProfileInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateProfileInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateProfileInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateProfileInlineMutation,
  UpdateProfileInlineMutationVariables
>;
export const GetProfileCharactersInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetProfileCharactersInline' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myCharacters' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetProfileCharactersInlineQuery,
  GetProfileCharactersInlineQueryVariables
>;
export const ResetPasswordInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ResetPasswordInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ResetPasswordInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resetPassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ResetPasswordInlineMutation,
  ResetPasswordInlineMutationVariables
>;
export const GetTriggersInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTriggersInline' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'triggers' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
                { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
                { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTriggersInlineQuery,
  GetTriggersInlineQueryVariables
>;
export const GetTriggersByAttachmentInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTriggersByAttachmentInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'attachType' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ScriptType' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'entityId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'triggersByAttachment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'attachType' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'attachType' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'entityId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'entityId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
                { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
                { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTriggersByAttachmentInlineQuery,
  GetTriggersByAttachmentInlineQueryVariables
>;
export const CreateTriggerInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateTriggerInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateTriggerInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
                { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateTriggerInlineMutation,
  CreateTriggerInlineMutationVariables
>;
export const UpdateTriggerInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateTriggerInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateTriggerInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
                { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateTriggerInlineMutation,
  UpdateTriggerInlineMutationVariables
>;
export const DeleteTriggerInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteTriggerInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteTriggerInlineMutation,
  DeleteTriggerInlineMutationVariables
>;
export const AttachTriggerInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AttachTriggerInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'AttachTriggerInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AttachTriggerInlineMutation,
  AttachTriggerInlineMutationVariables
>;
export const DetachTriggerInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DetachTriggerInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'triggerId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'detachTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'triggerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'triggerId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DetachTriggerInlineMutation,
  DetachTriggerInlineMutationVariables
>;
export const GetAllCharactersInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllCharactersInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'CharacterFilterInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'characters' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timePlayed' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitPoints' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hitPointsMax' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'movement' } },
                { kind: 'Field', name: { kind: 'Name', value: 'movementMax' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'intelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'constitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'luck' } },
                { kind: 'Field', name: { kind: 'Name', value: 'experience' } },
                { kind: 'Field', name: { kind: 'Name', value: 'copper' } },
                { kind: 'Field', name: { kind: 'Name', value: 'silver' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gold' } },
                { kind: 'Field', name: { kind: 'Name', value: 'platinum' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'currentRoom' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllCharactersInlineQuery,
  GetAllCharactersInlineQueryVariables
>;
export const GetCharactersCountInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCharactersCountInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'CharacterFilterInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'charactersCount' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCharactersCountInlineQuery,
  GetCharactersCountInlineQueryVariables
>;
export const CreateCharacterInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateCharacterInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateCharacterInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createCharacter' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'intelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'constitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'luck' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateCharacterInlineMutation,
  CreateCharacterInlineMutationVariables
>;
export const DeleteCharacterInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteCharacterInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteCharacter' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteCharacterInlineMutation,
  DeleteCharacterInlineMutationVariables
>;
export const GetCharacterDetailsInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCharacterDetailsInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'character' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timePlayed' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitPoints' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hitPointsMax' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'movement' } },
                { kind: 'Field', name: { kind: 'Name', value: 'movementMax' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'intelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'constitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'luck' } },
                { kind: 'Field', name: { kind: 'Name', value: 'experience' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skillPoints' } },
                { kind: 'Field', name: { kind: 'Name', value: 'copper' } },
                { kind: 'Field', name: { kind: 'Name', value: 'silver' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gold' } },
                { kind: 'Field', name: { kind: 'Name', value: 'platinum' } },
                { kind: 'Field', name: { kind: 'Name', value: 'bankCopper' } },
                { kind: 'Field', name: { kind: 'Name', value: 'bankSilver' } },
                { kind: 'Field', name: { kind: 'Name', value: 'bankGold' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'bankPlatinum' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'currentRoom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'saveRoom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'homeRoom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hunger' } },
                { kind: 'Field', name: { kind: 'Name', value: 'thirst' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitRoll' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageRoll' } },
                { kind: 'Field', name: { kind: 'Name', value: 'armorClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectFlags' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'privilegeFlags' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'invisLevel' } },
                { kind: 'Field', name: { kind: 'Name', value: 'birthTime' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'characterItems' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'equippedLocation' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'condition' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'charges' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'objects' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'zoneId' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'type' },
                            },
                            {
                              kind: 'Field',
                              name: {
                                kind: 'Name',
                                value: 'examineDescription',
                              },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'weight' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'cost' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'level' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'values' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'flags' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'effectFlags' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'wearFlags' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'objectAffects' },
                              selectionSet: {
                                kind: 'SelectionSet',
                                selections: [
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'location' },
                                  },
                                  {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: 'modifier' },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'characterEffects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectType' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'duration' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'strength' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'appliedAt' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'expiresAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCharacterDetailsInlineQuery,
  GetCharacterDetailsInlineQueryVariables
>;
export const UpdateCharacterInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCharacterInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateCharacterInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCharacter' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'intelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'constitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'luck' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitPoints' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hitPointsMax' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'movement' } },
                { kind: 'Field', name: { kind: 'Name', value: 'movementMax' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateCharacterInlineMutation,
  UpdateCharacterInlineMutationVariables
>;
export const GetCharacterLinkingInfoInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCharacterLinkingInfoInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterName' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'characterLinkingInfo' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterName' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterName' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'class' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timePlayed' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isLinked' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hasPassword' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCharacterLinkingInfoInlineQuery,
  GetCharacterLinkingInfoInlineQueryVariables
>;
export const LinkCharacterInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'LinkCharacterInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'LinkCharacterInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'linkCharacter' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  LinkCharacterInlineMutation,
  LinkCharacterInlineMutationVariables
>;
export const ValidateCharacterPasswordInlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ValidateCharacterPasswordInline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterName' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'password' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'validateCharacterPassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterName' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterName' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'password' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'password' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ValidateCharacterPasswordInlineQuery,
  ValidateCharacterPasswordInlineQueryVariables
>;
export const GetCharacterSessionInfoPollingDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCharacterSessionInfoPolling' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'characterSessionInfo' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'totalTimePlayed' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'currentSessionTime' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCharacterSessionInfoPollingQuery,
  GetCharacterSessionInfoPollingQueryVariables
>;
export const GetEquipmentSetsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetEquipmentSets' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equipmentSets' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slot' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'probability' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'object' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'type' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'keywords' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetEquipmentSetsQuery,
  GetEquipmentSetsQueryVariables
>;
export const GetObjectsForEquipmentSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetObjectsForEquipmentSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objects' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'wearFlags' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetObjectsForEquipmentSetQuery,
  GetObjectsForEquipmentSetQueryVariables
>;
export const CreateEquipmentSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateEquipmentSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateEquipmentSetInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createEquipmentSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateEquipmentSetMutation,
  CreateEquipmentSetMutationVariables
>;
export const UpdateEquipmentSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateEquipmentSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateEquipmentSetInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateEquipmentSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateEquipmentSetMutation,
  UpdateEquipmentSetMutationVariables
>;
export const DeleteEquipmentSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteEquipmentSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteEquipmentSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteEquipmentSetMutation,
  DeleteEquipmentSetMutationVariables
>;
export const AddEquipmentSetItemDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AddEquipmentSetItem' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'CreateEquipmentSetItemStandaloneInput',
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createEquipmentSetItem' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'slot' } },
                { kind: 'Field', name: { kind: 'Name', value: 'probability' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AddEquipmentSetItemMutation,
  AddEquipmentSetItemMutationVariables
>;
export const RemoveEquipmentSetItemDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RemoveEquipmentSetItem' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteEquipmentSetItem' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveEquipmentSetItemMutation,
  RemoveEquipmentSetItemMutationVariables
>;
export const GetMobResetsForMobDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMobResetsForMob' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'mobId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'mobZoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'mobResets' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'mobId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'mobId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'mobZoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'mobZoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maxInstances' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'probability' } },
                { kind: 'Field', name: { kind: 'Name', value: 'roomId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'roomZoneId' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'mob' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'zoneId' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'equipment' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxInstances' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'probability' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'wearLocation' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'objectId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'objectZoneId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'object' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'zoneId' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'type' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMobResetsForMobQuery,
  GetMobResetsForMobQueryVariables
>;
export const GetEquipmentSetsForMobDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetEquipmentSetsForMob' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'equipmentSets' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'slot' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'probability' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'object' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'zoneId' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'type' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetEquipmentSetsForMobQuery,
  GetEquipmentSetsForMobQueryVariables
>;
export const GetObjectsForMobDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetObjectsForMob' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objects' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'wearFlags' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetObjectsForMobQuery,
  GetObjectsForMobQueryVariables
>;
export const CreateEquipmentSetForMobDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateEquipmentSetForMob' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateEquipmentSetInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createEquipmentSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateEquipmentSetForMobMutation,
  CreateEquipmentSetForMobMutationVariables
>;
export const AddMobEquipmentSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AddMobEquipmentSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateMobEquipmentSetInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createMobEquipmentSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'probability' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AddMobEquipmentSetMutation,
  AddMobEquipmentSetMutationVariables
>;
export const RemoveMobEquipmentSetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RemoveMobEquipmentSet' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteMobEquipmentSet' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveMobEquipmentSetMutation,
  RemoveMobEquipmentSetMutationVariables
>;
export const DeleteMobResetEquipmentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteMobResetEquipment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteMobResetEquipment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteMobResetEquipmentMutation,
  DeleteMobResetEquipmentMutationVariables
>;
export const AddMobResetEquipmentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AddMobResetEquipment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'resetId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'objectZoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'objectId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'wearLocation' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'WearFlag' },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'maxInstances' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'probability' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'addMobResetEquipment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'resetId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'resetId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'objectZoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'objectZoneId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'objectId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'objectId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'wearLocation' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'wearLocation' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'maxInstances' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'maxInstances' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'probability' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'probability' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'equipment' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'objectId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'objectZoneId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'wearLocation' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxInstances' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'probability' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'object' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'zoneId' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'type' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AddMobResetEquipmentMutation,
  AddMobResetEquipmentMutationVariables
>;
export const UpdateMobResetEquipmentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateMobResetEquipment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'wearLocation' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'WearFlag' },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'maxInstances' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'probability' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateMobResetEquipment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'wearLocation' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'wearLocation' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'maxInstances' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'maxInstances' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'probability' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'probability' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateMobResetEquipmentMutation,
  UpdateMobResetEquipmentMutationVariables
>;
export const GetCharacterNameForBreadcrumbDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCharacterNameForBreadcrumb' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'character' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCharacterNameForBreadcrumbQuery,
  GetCharacterNameForBreadcrumbQueryVariables
>;
export const UpdateThemePreferenceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateThemePreference' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdatePreferencesInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateUserPreferences' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'preferences' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'theme' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateThemePreferenceMutation,
  UpdateThemePreferenceMutationVariables
>;
export const LoginDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Login' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'LoginInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'login' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'accessToken' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'username' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Register' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'RegisterInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'register' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'accessToken' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'username' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'createdAt' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const MeDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Me' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'me' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const GetAbilitiesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAbilities' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'abilityType' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'search' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'abilities' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'abilityType' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'abilityType' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'search' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'search' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'abilityType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minPosition' } },
                { kind: 'Field', name: { kind: 'Name', value: 'violent' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'castTimeRounds' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'cooldownMs' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'inCombatOnly' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'isArea' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tags' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'school' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'effects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effect' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'abilitiesCount' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'abilityType' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'abilityType' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'search' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'search' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetAbilitiesQuery, GetAbilitiesQueryVariables>;
export const GetAbilityDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAbilityDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'ability' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'abilityType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minPosition' } },
                { kind: 'Field', name: { kind: 'Name', value: 'violent' } },
                { kind: 'Field', name: { kind: 'Name', value: 'combatOk' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'castTimeRounds' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'cooldownMs' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'inCombatOnly' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'isArea' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notes' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'luaScript' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sphere' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'pages' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'memorizationTime' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'questOnly' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'humanoidOnly' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'school' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'description' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'effects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectId' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'chancePct' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'trigger' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'condition' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'overrideParams' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effect' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'effectType' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'savingThrows' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'dcFormula' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'saveType' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'onSaveAction' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'targeting' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'range' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maxTargets' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'requireLos' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'scope' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'scopePattern' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'validTargets' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'restrictions' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'customRequirementLua' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'requirements' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'messages' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'startToCaster' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'startToRoom' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'startToVictim' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'successToCaster' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'successToRoom' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'successToVictim' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'successToSelf' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'successSelfRoom' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'failToCaster' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'failToRoom' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'failToVictim' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'wearoffToRoom' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'wearoffToTarget' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'lookMessage' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAbilityDetailsQuery,
  GetAbilityDetailsQueryVariables
>;
export const GetAbilitySchoolsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAbilitySchools' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'abilitySchools' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAbilitySchoolsQuery,
  GetAbilitySchoolsQueryVariables
>;
export const CreateAbilityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateAbility' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateAbilityInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createAbility' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'abilityType' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateAbilityMutation,
  CreateAbilityMutationVariables
>;
export const UpdateAbilityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateAbility' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateAbilityInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateAbility' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'abilityType' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateAbilityMutation,
  UpdateAbilityMutationVariables
>;
export const DeleteAbilityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteAbility' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteAbility' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteAbilityMutation,
  DeleteAbilityMutationVariables
>;
export const UpdateAbilityEffectsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateAbilityEffects' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'abilityId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateAbilityEffectsInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateAbilityEffects' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'abilityId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'abilityId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'effects' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effectId' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'order' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'chancePct' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'trigger' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'condition' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'overrideParams' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'effect' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'effectType' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'description' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateAbilityEffectsMutation,
  UpdateAbilityEffectsMutationVariables
>;
export const UpdateAbilityMessagesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateAbilityMessages' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'abilityId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateAbilityMessagesInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateAbilityMessages' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'abilityId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'abilityId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'startToCaster' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'startToRoom' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'startToVictim' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'successToCaster' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'successToRoom' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'successToVictim' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'successToSelf' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'successSelfRoom' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'failToCaster' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'failToRoom' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'failToVictim' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'wearoffToRoom' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'wearoffToTarget' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'lookMessage' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateAbilityMessagesMutation,
  UpdateAbilityMessagesMutationVariables
>;
export const GetMyAccountMailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMyAccountMail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myAccountMail' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountMailFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountMailUserFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountMailUserDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountMailFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountMailDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderUserId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'recipientUserId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isBroadcast' } },
          { kind: 'Field', name: { kind: 'Name', value: 'subject' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sentAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'readAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isDeleted' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sender' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountMailUserFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipient' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountMailUserFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMyAccountMailQuery,
  GetMyAccountMailQueryVariables
>;
export const GetMyAccountMailCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMyAccountMailCount' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myAccountMailCount' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMyAccountMailCountQuery,
  GetMyAccountMailCountQueryVariables
>;
export const GetAllAccountMailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllAccountMail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'AccountMailFilterInput' },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'allAccountMail' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountMailFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountMailUserFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountMailUserDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountMailFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountMailDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderUserId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'recipientUserId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isBroadcast' } },
          { kind: 'Field', name: { kind: 'Name', value: 'subject' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sentAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'readAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isDeleted' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sender' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountMailUserFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipient' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountMailUserFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllAccountMailQuery,
  GetAllAccountMailQueryVariables
>;
export const SendAccountMailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SendAccountMail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SendAccountMailInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sendAccountMail' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountMailFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountMailUserFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountMailUserDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'username' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountMailFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountMailDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderUserId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'recipientUserId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isBroadcast' } },
          { kind: 'Field', name: { kind: 'Name', value: 'subject' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sentAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'readAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isDeleted' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sender' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountMailUserFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipient' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountMailUserFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SendAccountMailMutation,
  SendAccountMailMutationVariables
>;
export const SendBroadcastDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SendBroadcast' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SendBroadcastInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sendBroadcast' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SendBroadcastMutation,
  SendBroadcastMutationVariables
>;
export const MarkAccountMailReadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkAccountMailRead' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markAccountMailRead' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'readAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkAccountMailReadMutation,
  MarkAccountMailReadMutationVariables
>;
export const DeleteAccountMailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteAccountMail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteAccountMail' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isDeleted' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteAccountMailMutation,
  DeleteAccountMailMutationVariables
>;
export const GetMyAccountStorageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMyAccountStorage' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myAccountStorage' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountStorageFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemObjectFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemCharacterFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemCharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slot' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectZoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'quantity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'customData' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storedByCharacterId' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'object' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountItemObjectFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storedByCharacter' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountItemCharacterFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountStorageFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountStorageDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'accountWealth' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'items' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountItemFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMyAccountStorageQuery,
  GetMyAccountStorageQueryVariables
>;
export const GetMyAccountWealthDisplayDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMyAccountWealthDisplay' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myAccountWealthDisplay' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'WealthDisplayFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'WealthDisplayFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'WealthDisplayDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'totalCopper' } },
          { kind: 'Field', name: { kind: 'Name', value: 'platinum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gold' } },
          { kind: 'Field', name: { kind: 'Name', value: 'silver' } },
          { kind: 'Field', name: { kind: 'Name', value: 'copper' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMyAccountWealthDisplayQuery,
  GetMyAccountWealthDisplayQueryVariables
>;
export const DepositWealthDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DepositWealth' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterId' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'amount' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'BigInt' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'depositWealth' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'amount' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'amount' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DepositWealthMutation,
  DepositWealthMutationVariables
>;
export const DepositItemDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DepositItem' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterId' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'objectZoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'objectId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'quantity' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'depositItem' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'objectZoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'objectZoneId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'objectId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'objectId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'quantity' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'quantity' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountItemFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemObjectFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemCharacterFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemCharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountItemFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'AccountItemDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'slot' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectZoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'quantity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'customData' } },
          { kind: 'Field', name: { kind: 'Name', value: 'storedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storedByCharacterId' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'object' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountItemObjectFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'storedByCharacter' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'AccountItemCharacterFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DepositItemMutation, DepositItemMutationVariables>;
export const RequestPasswordResetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RequestPasswordReset' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'email' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'requestPasswordReset' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'email' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'email' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RequestPasswordResetMutation,
  RequestPasswordResetMutationVariables
>;
export const ResetPasswordDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ResetPassword' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'token' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'newPassword' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resetPassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'token' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'token' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'newPassword' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'newPassword' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;
export const ChangePasswordDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ChangePassword' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'currentPassword' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'newPassword' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'changePassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'currentPassword' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'currentPassword' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'newPassword' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'newPassword' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChangePasswordMutation,
  ChangePasswordMutationVariables
>;
export const UpdateProfileDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateProfile' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'email' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateProfile' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'email' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'email' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateProfileMutation,
  UpdateProfileMutationVariables
>;
export const GetMyCharactersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMyCharacters' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myCharacters' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'CharacterCardFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CharacterCardFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
          { kind: 'Field', name: { kind: 'Name', value: 'timePlayed' } },
          { kind: 'Field', name: { kind: 'Name', value: 'hitPoints' } },
          { kind: 'Field', name: { kind: 'Name', value: 'hitPointsMax' } },
          { kind: 'Field', name: { kind: 'Name', value: 'movement' } },
          { kind: 'Field', name: { kind: 'Name', value: 'movementMax' } },
          { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
          { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
          { kind: 'Field', name: { kind: 'Name', value: 'intelligence' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'constitution' } },
          { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
          { kind: 'Field', name: { kind: 'Name', value: 'luck' } },
          { kind: 'Field', name: { kind: 'Name', value: 'experience' } },
          { kind: 'Field', name: { kind: 'Name', value: 'copper' } },
          { kind: 'Field', name: { kind: 'Name', value: 'silver' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gold' } },
          { kind: 'Field', name: { kind: 'Name', value: 'platinum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'currentRoom' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetMyCharactersQuery,
  GetMyCharactersQueryVariables
>;
export const GetCharacterDetailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCharacterDetails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'character' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'constitution' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'intelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitPoints' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hitPointsMax' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'movement' } },
                { kind: 'Field', name: { kind: 'Name', value: 'movementMax' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCharacterDetailsQuery,
  GetCharacterDetailsQueryVariables
>;
export const GetCharacterSessionInfoDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCharacterSessionInfo' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'characterSessionInfo' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'currentSessionTime' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'totalTimePlayed' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCharacterSessionInfoQuery,
  GetCharacterSessionInfoQueryVariables
>;
export const GetCharacterLinkingInfoDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCharacterLinkingInfo' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterName' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'characterLinkingInfo' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterName' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterName' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hasPassword' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isLinked' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timePlayed' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCharacterLinkingInfoQuery,
  GetCharacterLinkingInfoQueryVariables
>;
export const CreateCharacterDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateCharacter' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateCharacterInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createCharacter' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateCharacterMutation,
  CreateCharacterMutationVariables
>;
export const LinkCharacterDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'LinkCharacter' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'LinkCharacterInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'linkCharacter' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  LinkCharacterMutation,
  LinkCharacterMutationVariables
>;
export const ValidateCharacterPasswordDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'ValidateCharacterPassword' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterName' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'password' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'validateCharacterPassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterName' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterName' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'password' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'password' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ValidateCharacterPasswordQuery,
  ValidateCharacterPasswordQueryVariables
>;
export const UpdateCharacterDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCharacter' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateCharacterInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCharacter' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'intelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'constitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'luck' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitPoints' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hitPointsMax' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'movement' } },
                { kind: 'Field', name: { kind: 'Name', value: 'movementMax' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateCharacterMutation,
  UpdateCharacterMutationVariables
>;
export const DeleteCharacterDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteCharacter' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteCharacter' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteCharacterMutation,
  DeleteCharacterMutationVariables
>;
export const GetAllCharactersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllCharacters' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'CharacterFilterInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'characters' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'CharacterCardFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'CharacterCardFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'CharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
          { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
          { kind: 'Field', name: { kind: 'Name', value: 'timePlayed' } },
          { kind: 'Field', name: { kind: 'Name', value: 'hitPoints' } },
          { kind: 'Field', name: { kind: 'Name', value: 'hitPointsMax' } },
          { kind: 'Field', name: { kind: 'Name', value: 'movement' } },
          { kind: 'Field', name: { kind: 'Name', value: 'movementMax' } },
          { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
          { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
          { kind: 'Field', name: { kind: 'Name', value: 'intelligence' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
          { kind: 'Field', name: { kind: 'Name', value: 'constitution' } },
          { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
          { kind: 'Field', name: { kind: 'Name', value: 'luck' } },
          { kind: 'Field', name: { kind: 'Name', value: 'experience' } },
          { kind: 'Field', name: { kind: 'Name', value: 'copper' } },
          { kind: 'Field', name: { kind: 'Name', value: 'silver' } },
          { kind: 'Field', name: { kind: 'Name', value: 'gold' } },
          { kind: 'Field', name: { kind: 'Name', value: 'platinum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'description' } },
          { kind: 'Field', name: { kind: 'Name', value: 'title' } },
          { kind: 'Field', name: { kind: 'Name', value: 'currentRoom' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllCharactersQuery,
  GetAllCharactersQueryVariables
>;
export const GetCharactersCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetCharactersCount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'CharacterFilterInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'charactersCount' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetCharactersCountQuery,
  GetCharactersCountQueryVariables
>;
export const GetClassesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetClasses' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'classes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'plainName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'primaryStat' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetClassesQuery, GetClassesQueryVariables>;
export const GetClassSkillsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetClassSkills' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'classId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'classSkills' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'classId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'classId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'classId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skillId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skillName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'category' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minLevel' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxLevel' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetClassSkillsQuery, GetClassSkillsQueryVariables>;
export const GetAllAbilitiesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllAbilities' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'abilityType' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'abilities' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'abilityType' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'abilityType' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllAbilitiesQuery,
  GetAllAbilitiesQueryVariables
>;
export const GetClassCirclesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetClassCircles' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'classId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'classCirclesList' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'classId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'classId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'classId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'circle' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minLevel' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'spells' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'spellId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'spellName' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'minLevel' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'proficiencyGain' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetClassCirclesQuery,
  GetClassCirclesQueryVariables
>;
export const UpdateClassDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateClass' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateClassInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateClass' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'plainName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'primaryStat' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateClassMutation, UpdateClassMutationVariables>;
export const AssignSkillToClassDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AssignSkillToClass' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'AssignSkillToClassInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'assignSkillToClass' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skillId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'skillName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'category' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minLevel' } },
                { kind: 'Field', name: { kind: 'Name', value: 'maxLevel' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AssignSkillToClassMutation,
  AssignSkillToClassMutationVariables
>;
export const RemoveClassSkillDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RemoveClassSkill' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'removeClassSkill' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveClassSkillMutation,
  RemoveClassSkillMutationVariables
>;
export const CreateClassCircleDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateClassCircle' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateClassCircleInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createClassCircle' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'circle' } },
                { kind: 'Field', name: { kind: 'Name', value: 'minLevel' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateClassCircleMutation,
  CreateClassCircleMutationVariables
>;
export const RemoveClassCircleDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RemoveClassCircle' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'removeClassCircle' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  RemoveClassCircleMutation,
  RemoveClassCircleMutationVariables
>;
export const GetEffectEditorOptionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetEffectEditorOptions' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'zones' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'effects' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: { kind: 'IntValue', value: '1000' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'paramSchema' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'mobs' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: { kind: 'IntValue', value: '1000' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'plainName' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objects' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: { kind: 'IntValue', value: '1000' },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'plainName' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'triggers' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetEffectEditorOptionsQuery,
  GetEffectEditorOptionsQueryVariables
>;
export const GetEffectsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetEffects' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'search' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'effects' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'search' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'search' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tags' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'defaultParams' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'paramSchema' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetEffectsQuery, GetEffectsQueryVariables>;
export const GetEffectsCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetEffectsCount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'search' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'effectsCount' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'search' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'search' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetEffectsCountQuery,
  GetEffectsCountQueryVariables
>;
export const GetEffectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetEffect' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'effect' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tags' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'defaultParams' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'paramSchema' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetEffectQuery, GetEffectQueryVariables>;
export const CreateEffectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateEffect' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateEffectInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createEffect' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tags' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'defaultParams' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'paramSchema' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateEffectMutation,
  CreateEffectMutationVariables
>;
export const UpdateEffectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateEffect' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateEffectInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateEffect' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'description' } },
                { kind: 'Field', name: { kind: 'Name', value: 'tags' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'defaultParams' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'paramSchema' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateEffectMutation,
  UpdateEffectMutationVariables
>;
export const DeleteEffectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteEffect' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteEffect' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteEffectMutation,
  DeleteEffectMutationVariables
>;
export const GetOnlinePlayersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetOnlinePlayers' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'onlinePlayers' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'class' } },
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'roomId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'godLevel' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isLinkdead' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetOnlinePlayersQuery,
  GetOnlinePlayersQueryVariables
>;
export const GetServerStatusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetServerStatus' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'serverStatus' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'stats' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'uptimeSeconds' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'totalConnections' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'currentConnections' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'peakConnections' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'totalCommands' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'failedCommands' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'totalLogins' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'failedLogins' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'commandsPerSecond' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'server' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'port' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'tlsPort' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'maintenanceMode' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'running' },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetServerStatusQuery,
  GetServerStatusQueryVariables
>;
export const IsGameServerConnectedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'IsGameServerConnected' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'gameServerConnected' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  IsGameServerConnectedQuery,
  IsGameServerConnectedQueryVariables
>;
export const ExecuteGameCommandDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ExecuteGameCommand' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'command' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'executor' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'executeGameCommand' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'command' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'command' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'executor' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'executor' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'executor' } },
                { kind: 'Field', name: { kind: 'Name', value: 'note' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ExecuteGameCommandMutation,
  ExecuteGameCommandMutationVariables
>;
export const BroadcastMessageDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'BroadcastMessage' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'message' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'sender' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'broadcastMessage' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'message' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'message' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'sender' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'sender' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'recipientCount' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  BroadcastMessageMutation,
  BroadcastMessageMutationVariables
>;
export const KickPlayerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'KickPlayer' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'playerName' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'reason' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'kickPlayer' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'playerName' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'playerName' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'reason' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'reason' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'success' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'reason' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<KickPlayerMutation, KickPlayerMutationVariables>;
export const GameEventsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'GameEvents' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'gameEvents' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'roomVnum' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'targetPlayer' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GameEventsSubscription,
  GameEventsSubscriptionVariables
>;
export const ChatMessagesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'ChatMessages' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'chatMessages' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ChatMessagesSubscription,
  ChatMessagesSubscriptionVariables
>;
export const PlayerActivityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'PlayerActivity' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'playerActivity' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  PlayerActivitySubscription,
  PlayerActivitySubscriptionVariables
>;
export const AdminAlertsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'AdminAlerts' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'adminAlerts' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AdminAlertsSubscription,
  AdminAlertsSubscriptionVariables
>;
export const WorldEventsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'WorldEvents' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'worldEvents' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'timestamp' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'roomVnum' } },
                { kind: 'Field', name: { kind: 'Name', value: 'message' } },
                { kind: 'Field', name: { kind: 'Name', value: 'metadata' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  WorldEventsSubscription,
  WorldEventsSubscriptionVariables
>;
export const UpdateMobDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateMob' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateMobInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateMob' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'roomDescription' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'examineDescription' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitRoll' } },
                { kind: 'Field', name: { kind: 'Name', value: 'armorClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hpDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'intelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'constitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'perception' } },
                { kind: 'Field', name: { kind: 'Name', value: 'concealment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
                { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lifeForce' } },
                { kind: 'Field', name: { kind: 'Name', value: 'composition' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stance' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateMobMutation, UpdateMobMutationVariables>;
export const CreateMobDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateMob' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateMobInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createMob' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'roomDescription' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'examineDescription' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitRoll' } },
                { kind: 'Field', name: { kind: 'Name', value: 'armorClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hpDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'intelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'constitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'perception' } },
                { kind: 'Field', name: { kind: 'Name', value: 'concealment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
                { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lifeForce' } },
                { kind: 'Field', name: { kind: 'Name', value: 'composition' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stance' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateMobMutation, CreateMobMutationVariables>;
export const DeleteMobDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteMob' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteMob' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteMobMutation, DeleteMobMutationVariables>;
export const GetObjectsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetObjects' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objects' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'ObjectSummary' },
                },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'objectsCount' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ObjectSummary' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'ObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weight' } },
          { kind: 'Field', name: { kind: 'Name', value: 'cost' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
          { kind: 'Field', name: { kind: 'Name', value: 'values' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetObjectsQuery, GetObjectsQueryVariables>;
export const GetObjectsByZoneDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetObjectsByZone' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectsByZone' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'ObjectSummary' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ObjectSummary' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'ObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weight' } },
          { kind: 'Field', name: { kind: 'Name', value: 'cost' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
          { kind: 'Field', name: { kind: 'Name', value: 'values' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetObjectsByZoneQuery,
  GetObjectsByZoneQueryVariables
>;
export const GetObjectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetObject' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'object' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'ObjectDetails' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ObjectSummary' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'ObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weight' } },
          { kind: 'Field', name: { kind: 'Name', value: 'cost' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
          { kind: 'Field', name: { kind: 'Name', value: 'values' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ObjectDetails' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'ObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'FragmentSpread',
            name: { kind: 'Name', value: 'ObjectSummary' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'examineDescription' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'roomDescription' } },
          { kind: 'Field', name: { kind: 'Name', value: 'actionDescription' } },
          { kind: 'Field', name: { kind: 'Name', value: 'concealment' } },
          { kind: 'Field', name: { kind: 'Name', value: 'timer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'decomposeTimer' } },
          { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'effectFlags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wearFlags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetObjectQuery, GetObjectQueryVariables>;
export const SearchObjectsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchObjects' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'search' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchObjects' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'search' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'search' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'plainName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchObjectsQuery, SearchObjectsQueryVariables>;
export const CreateObjectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateObject' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateObjectInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createObject' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'ObjectSummary' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ObjectSummary' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'ObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weight' } },
          { kind: 'Field', name: { kind: 'Name', value: 'cost' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
          { kind: 'Field', name: { kind: 'Name', value: 'values' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateObjectMutation,
  CreateObjectMutationVariables
>;
export const UpdateObjectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateObject' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateObjectInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateObject' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'ObjectSummary' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'ObjectSummary' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'ObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'level' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weight' } },
          { kind: 'Field', name: { kind: 'Name', value: 'cost' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
          { kind: 'Field', name: { kind: 'Name', value: 'values' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateObjectMutation,
  UpdateObjectMutationVariables
>;
export const DeleteObjectDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteObject' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteObject' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteObjectMutation,
  DeleteObjectMutationVariables
>;
export const DeleteObjectsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteObjects' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ids' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'Int' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteObjects' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ids' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'ids' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteObjectsMutation,
  DeleteObjectsMutationVariables
>;
export const GetMyMailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMyMail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterId' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myMail' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailCharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailObjectFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacySenderId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyRecipientId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderCharacterId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipientCharacterId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sentAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'readAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedCopper' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedSilver' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedGold' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedPlatinum' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachedObjectZoneId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedObjectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wealthRetrievedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'wealthRetrievedByCharacterId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'objectRetrievedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectRetrievedByCharacterId' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectMovedToAccountStorage' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'isDeleted' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'wealthRetrievalInfo' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectRetrievalInfo' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sender' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipient' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachedObject' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailObjectFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetMyMailQuery, GetMyMailQueryVariables>;
export const GetMyMailCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMyMailCount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterId' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myMailCount' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterId' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetMyMailCountQuery, GetMyMailCountQueryVariables>;
export const GetPlayerMailByIdDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetPlayerMailById' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'playerMail' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailCharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailObjectFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacySenderId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyRecipientId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderCharacterId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipientCharacterId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sentAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'readAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedCopper' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedSilver' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedGold' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedPlatinum' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachedObjectZoneId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedObjectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wealthRetrievedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'wealthRetrievedByCharacterId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'objectRetrievedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectRetrievedByCharacterId' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectMovedToAccountStorage' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'isDeleted' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'wealthRetrievalInfo' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectRetrievalInfo' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sender' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipient' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachedObject' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailObjectFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPlayerMailByIdQuery,
  GetPlayerMailByIdQueryVariables
>;
export const GetAllPlayerMailsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAllPlayerMails' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'PlayerMailFilterInput' },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'playerMails' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailCharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailObjectFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacySenderId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyRecipientId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderCharacterId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipientCharacterId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sentAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'readAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedCopper' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedSilver' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedGold' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedPlatinum' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachedObjectZoneId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedObjectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wealthRetrievedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'wealthRetrievedByCharacterId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'objectRetrievedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectRetrievedByCharacterId' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectMovedToAccountStorage' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'isDeleted' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'wealthRetrievalInfo' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectRetrievalInfo' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sender' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipient' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachedObject' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailObjectFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAllPlayerMailsQuery,
  GetAllPlayerMailsQueryVariables
>;
export const GetPlayerMailCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetPlayerMailCount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'filter' },
          },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'PlayerMailFilterInput' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'playerMailCount' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'filter' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'filter' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPlayerMailCountQuery,
  GetPlayerMailCountQueryVariables
>;
export const SendPlayerMailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SendPlayerMail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'SendPlayerMailInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sendMail' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailCharacterDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailObjectFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailObjectDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PlayerMailFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'PlayerMailDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacySenderId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyRecipientId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderCharacterId' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipientCharacterId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'sentAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'readAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedCopper' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedSilver' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedGold' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedPlatinum' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachedObjectZoneId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'attachedObjectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'wealthRetrievedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'wealthRetrievedByCharacterId' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'objectRetrievedAt' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectRetrievedByCharacterId' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectMovedToAccountStorage' },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'isDeleted' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'senderName' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'wealthRetrievalInfo' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectRetrievalInfo' },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'sender' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recipient' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailCharacterFields' },
                },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachedObject' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'PlayerMailObjectFields' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SendPlayerMailMutation,
  SendPlayerMailMutationVariables
>;
export const MarkPlayerMailReadDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkPlayerMailRead' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markMailRead' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'readAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkPlayerMailReadMutation,
  MarkPlayerMailReadMutationVariables
>;
export const MarkWealthRetrievedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkWealthRetrieved' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterId' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markWealthRetrieved' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'wealthRetrievedAt' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'wealthRetrievedByCharacterId' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'wealthRetrievalInfo' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkWealthRetrievedMutation,
  MarkWealthRetrievedMutationVariables
>;
export const MarkObjectRetrievedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkObjectRetrieved' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterId' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'movedToAccountStorage' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'Boolean' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markObjectRetrieved' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'movedToAccountStorage' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'movedToAccountStorage' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'objectRetrievedAt' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'objectRetrievedByCharacterId' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'objectMovedToAccountStorage' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'objectRetrievalInfo' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkObjectRetrievedMutation,
  MarkObjectRetrievedMutationVariables
>;
export const DeletePlayerMailDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeletePlayerMail' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deletePlayerMail' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isDeleted' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeletePlayerMailMutation,
  DeletePlayerMailMutationVariables
>;
export const GetMobDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMob' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'mob' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'roomDescription' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'examineDescription' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitRoll' } },
                { kind: 'Field', name: { kind: 'Name', value: 'armorClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'accuracy' } },
                { kind: 'Field', name: { kind: 'Name', value: 'attackPower' } },
                { kind: 'Field', name: { kind: 'Name', value: 'spellPower' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'penetrationFlat' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'penetrationPercent' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'evasion' } },
                { kind: 'Field', name: { kind: 'Name', value: 'armorRating' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'damageReductionPercent' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'soak' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hardness' } },
                { kind: 'Field', name: { kind: 'Name', value: 'wardPercent' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resistanceFire' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resistanceCold' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resistanceLightning' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resistanceAcid' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'resistancePoison' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'hpDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'intelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'constitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'perception' } },
                { kind: 'Field', name: { kind: 'Name', value: 'concealment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'gender' } },
                { kind: 'Field', name: { kind: 'Name', value: 'size' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lifeForce' } },
                { kind: 'Field', name: { kind: 'Name', value: 'composition' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'position' } },
                { kind: 'Field', name: { kind: 'Name', value: 'stance' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetMobQuery, GetMobQueryVariables>;
export const GetMobsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMobs' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'mobs' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'roomDescription' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'examineDescription' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitRoll' } },
                { kind: 'Field', name: { kind: 'Name', value: 'armorClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'intelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'constitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lifeForce' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hpDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectFlags' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetMobsQuery, GetMobsQueryVariables>;
export const GetMobsByZoneDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetMobsByZone' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'mobsByZone' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'roomDescription' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'examineDescription' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'alignment' } },
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hitRoll' } },
                { kind: 'Field', name: { kind: 'Name', value: 'armorClass' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'strength' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'intelligence' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'wisdom' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dexterity' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'constitution' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charisma' } },
                { kind: 'Field', name: { kind: 'Name', value: 'wealth' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hpDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'damageDice' } },
                { kind: 'Field', name: { kind: 'Name', value: 'mobFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'effectFlags' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lifeForce' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetMobsByZoneQuery, GetMobsByZoneQueryVariables>;
export const SearchMobsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchMobs' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'search' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'limit' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchMobs' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'search' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'search' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'limit' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'limit' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'plainName' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'roomDescription' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchMobsQuery, SearchMobsQueryVariables>;
export const GetRacesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetRaces' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'races' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'plainName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playable' } },
                { kind: 'Field', name: { kind: 'Name', value: 'humanoid' } },
                { kind: 'Field', name: { kind: 'Name', value: 'magical' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetRacesQuery, GetRacesQueryVariables>;
export const UpdateRaceDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateRace' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'race' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Race' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateRaceInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateRace' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'race' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'race' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'race' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'plainName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playable' } },
                { kind: 'Field', name: { kind: 'Name', value: 'humanoid' } },
                { kind: 'Field', name: { kind: 'Name', value: 'magical' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateRaceMutation, UpdateRaceMutationVariables>;
export const GetShopEditorDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetShopEditor' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'shop' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'buyProfit' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sellProfit' } },
                { kind: 'Field', name: { kind: 'Name', value: 'temper' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'noSuchItemMessages' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'doNotBuyMessages' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'missingCashMessages' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'buyMessages' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sellMessages' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'keeperId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'tradesWithFlags' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'keeper' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'zoneId' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'amount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'objectId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'objectZoneId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'object' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'type' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'cost' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'accepts' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'keywords' },
                      },
                    ],
                  },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hours' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'open' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'close' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetShopEditorQuery, GetShopEditorQueryVariables>;
export const UpdateShopEditorDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateShopEditor' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateShopInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateShop' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'buyProfit' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sellProfit' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateShopEditorMutation,
  UpdateShopEditorMutationVariables
>;
export const CreateShopEditorDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateShopEditor' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateShopInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createShop' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'buyProfit' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sellProfit' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateShopEditorMutation,
  CreateShopEditorMutationVariables
>;
export const UpdateShopInventoryEditorDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateShopInventoryEditor' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'items' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'ShopItemInput' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateShopInventory' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'items' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'items' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'items' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'amount' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'objectId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'objectZoneId' },
                      },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'object' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'id' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'name' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'type' },
                            },
                            {
                              kind: 'Field',
                              name: { kind: 'Name', value: 'cost' },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateShopInventoryEditorMutation,
  UpdateShopInventoryEditorMutationVariables
>;
export const UpdateShopHoursEditorDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateShopHoursEditor' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'hours' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'ShopHourInput' },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateShopHours' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'hours' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'hours' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'hours' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'open' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'close' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateShopHoursEditorMutation,
  UpdateShopHoursEditorMutationVariables
>;
export const GetAvailableObjectsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAvailableObjects' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'objectsByZone' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'type' } },
                { kind: 'Field', name: { kind: 'Name', value: 'cost' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAvailableObjectsQuery,
  GetAvailableObjectsQueryVariables
>;
export const GetAvailableMobsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetAvailableMobs' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'mobsByZone' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keywords' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetAvailableMobsQuery,
  GetAvailableMobsQueryVariables
>;
export const GetZonesEditorDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetZonesEditor' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'zones' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetZonesEditorQuery, GetZonesEditorQueryVariables>;
export const GetShopsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetShops' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'skip' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'take' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'shops' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'skip' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'skip' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'take' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'take' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'temper' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sellProfit' } },
                { kind: 'Field', name: { kind: 'Name', value: 'buyProfit' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'shopsCount' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetShopsQuery, GetShopsQueryVariables>;
export const GetShopsByZoneDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetShopsByZone' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'shopsByZone' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'temper' } },
                { kind: 'Field', name: { kind: 'Name', value: 'sellProfit' } },
                { kind: 'Field', name: { kind: 'Name', value: 'buyProfit' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetShopsByZoneQuery, GetShopsByZoneQueryVariables>;
export const GetShopDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetShop' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'shop' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'keeperId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'buyMessages' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'sellMessages' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'missingCashMessages' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetShopQuery, GetShopQueryVariables>;
export const CreateShopDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateShop' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateShopInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createShop' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateShopMutation, CreateShopMutationVariables>;
export const UpdateShopDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateShop' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateShopInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateShop' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateShopMutation, UpdateShopMutationVariables>;
export const DeleteShopDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteShop' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'zoneId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteShop' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'zoneId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'zoneId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeleteShopMutation, DeleteShopMutationVariables>;
export const GetSocialsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetSocials' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'socials' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hide' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'minVictimPosition' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charNoArg' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersNoArg' } },
                { kind: 'Field', name: { kind: 'Name', value: 'charFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'victFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'charAuto' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersAuto' } },
              ],
            },
          },
          { kind: 'Field', name: { kind: 'Name', value: 'socialsCount' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetSocialsQuery, GetSocialsQueryVariables>;
export const GetSocialDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetSocial' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'social' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hide' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'minVictimPosition' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charNoArg' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersNoArg' } },
                { kind: 'Field', name: { kind: 'Name', value: 'charFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'victFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'charAuto' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersAuto' } },
                { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetSocialQuery, GetSocialQueryVariables>;
export const SearchSocialsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'SearchSocials' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'query' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'searchSocials' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'query' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'query' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hide' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'minVictimPosition' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charNoArg' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersNoArg' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<SearchSocialsQuery, SearchSocialsQueryVariables>;
export const CreateSocialDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateSocial' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateSocialInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createSocial' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hide' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'minVictimPosition' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateSocialMutation,
  CreateSocialMutationVariables
>;
export const UpdateSocialDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateSocial' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'data' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateSocialInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateSocial' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'data' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'data' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'hide' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'minVictimPosition' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'charNoArg' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersNoArg' } },
                { kind: 'Field', name: { kind: 'Name', value: 'charFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'victFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'notFound' } },
                { kind: 'Field', name: { kind: 'Name', value: 'charAuto' } },
                { kind: 'Field', name: { kind: 'Name', value: 'othersAuto' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateSocialMutation,
  UpdateSocialMutationVariables
>;
export const DeleteSocialDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteSocial' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteSocial' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteSocialMutation,
  DeleteSocialMutationVariables
>;
export const GetTriggersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTriggers' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'triggers' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TriggerFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TriggerFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'TriggerDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
          { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
          { kind: 'Field', name: { kind: 'Name', value: 'syntaxError' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyVnum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyScript' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedBy' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetTriggersQuery, GetTriggersQueryVariables>;
export const GetTriggersNeedingReviewDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTriggersNeedingReview' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'triggersNeedingReview' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TriggerFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TriggerFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'TriggerDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
          { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
          { kind: 'Field', name: { kind: 'Name', value: 'syntaxError' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyVnum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyScript' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedBy' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTriggersNeedingReviewQuery,
  GetTriggersNeedingReviewQueryVariables
>;
export const GetTriggersNeedingReviewCountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTriggersNeedingReviewCount' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'triggersNeedingReviewCount' },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTriggersNeedingReviewCountQuery,
  GetTriggersNeedingReviewCountQueryVariables
>;
export const GetTriggerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTrigger' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'trigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TriggerFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TriggerFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'TriggerDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
          { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
          { kind: 'Field', name: { kind: 'Name', value: 'syntaxError' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyVnum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyScript' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedBy' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetTriggerQuery, GetTriggerQueryVariables>;
export const GetTriggersByAttachmentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetTriggersByAttachment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'attachType' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'ScriptType' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'entityId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'triggersByAttachment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'attachType' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'attachType' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'entityId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'entityId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TriggerFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TriggerFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'TriggerDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
          { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
          { kind: 'Field', name: { kind: 'Name', value: 'syntaxError' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyVnum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyScript' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedBy' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetTriggersByAttachmentQuery,
  GetTriggersByAttachmentQueryVariables
>;
export const CreateTriggerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateTrigger' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateTriggerInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TriggerFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TriggerFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'TriggerDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
          { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
          { kind: 'Field', name: { kind: 'Name', value: 'syntaxError' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyVnum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyScript' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedBy' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateTriggerMutation,
  CreateTriggerMutationVariables
>;
export const UpdateTriggerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateTrigger' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateTriggerInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TriggerFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TriggerFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'TriggerDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
          { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
          { kind: 'Field', name: { kind: 'Name', value: 'syntaxError' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyVnum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyScript' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedBy' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateTriggerMutation,
  UpdateTriggerMutationVariables
>;
export const DeleteTriggerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteTrigger' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'id' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DeleteTriggerMutation,
  DeleteTriggerMutationVariables
>;
export const AttachTriggerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'AttachTrigger' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'input' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'AttachTriggerInput' },
            },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'attachTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'input' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TriggerFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TriggerFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'TriggerDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
          { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
          { kind: 'Field', name: { kind: 'Name', value: 'syntaxError' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyVnum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyScript' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedBy' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  AttachTriggerMutation,
  AttachTriggerMutationVariables
>;
export const DetachTriggerDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DetachTrigger' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'triggerId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Float' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'detachTrigger' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'triggerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'triggerId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  DetachTriggerMutation,
  DetachTriggerMutationVariables
>;
export const MarkTriggerReviewedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkTriggerReviewed' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'triggerId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Int' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markTriggerReviewed' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'triggerId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'triggerId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'FragmentSpread',
                  name: { kind: 'Name', value: 'TriggerFields' },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'TriggerFields' },
      typeCondition: {
        kind: 'NamedType',
        name: { kind: 'Name', value: 'TriggerDto' },
      },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'attachType' } },
          { kind: 'Field', name: { kind: 'Name', value: 'numArgs' } },
          { kind: 'Field', name: { kind: 'Name', value: 'argList' } },
          { kind: 'Field', name: { kind: 'Name', value: 'commands' } },
          { kind: 'Field', name: { kind: 'Name', value: 'zoneId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'mobId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'objectId' } },
          { kind: 'Field', name: { kind: 'Name', value: 'variables' } },
          { kind: 'Field', name: { kind: 'Name', value: 'flags' } },
          { kind: 'Field', name: { kind: 'Name', value: 'needsReview' } },
          { kind: 'Field', name: { kind: 'Name', value: 'syntaxError' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyVnum' } },
          { kind: 'Field', name: { kind: 'Name', value: 'legacyScript' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdBy' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedBy' } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MarkTriggerReviewedMutation,
  MarkTriggerReviewedMutationVariables
>;
export const UsersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Users' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'users' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLoginAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isBanned' } },
              ],
            },
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myPermissions' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'isGod' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isCoder' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isBuilder' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'canManageUsers' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const UpdateUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'role' } },
          type: {
            kind: 'NamedType',
            name: { kind: 'Name', value: 'UserRole' },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'id' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'id' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'role' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'role' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'username' } },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const BanUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'BanUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'userId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'reason' },
          },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'String' },
            },
          },
        },
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'expiresAt' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'banUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'userId' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'userId' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'reason' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'reason' },
                      },
                    },
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'expiresAt' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'expiresAt' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'reason' } },
                { kind: 'Field', name: { kind: 'Name', value: 'bannedAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'expiresAt' } },
                { kind: 'Field', name: { kind: 'Name', value: 'active' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BanUserMutation, BanUserMutationVariables>;
export const UnbanUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UnbanUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'userId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'unbanUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: {
                  kind: 'ObjectValue',
                  fields: [
                    {
                      kind: 'ObjectField',
                      name: { kind: 'Name', value: 'userId' },
                      value: {
                        kind: 'Variable',
                        name: { kind: 'Name', value: 'userId' },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'userId' } },
                { kind: 'Field', name: { kind: 'Name', value: 'active' } },
                { kind: 'Field', name: { kind: 'Name', value: 'unbannedAt' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UnbanUserMutation, UnbanUserMutationVariables>;
export const GetZonesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetZones' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'zones' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'climate' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lifespan' } },
                { kind: 'Field', name: { kind: 'Name', value: 'resetMode' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetZonesQuery, GetZonesQueryVariables>;
export const GetZonesForSelectorDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'GetZonesForSelector' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'zones' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetZonesForSelectorQuery,
  GetZonesForSelectorQueryVariables
>;
export const OnlineCharactersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'OnlineCharacters' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'userId' },
          },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'onlineCharacters' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'userId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'userId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
                { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'username' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  OnlineCharactersQuery,
  OnlineCharactersQueryVariables
>;
export const MyOnlineCharactersDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'MyOnlineCharacters' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myOnlineCharacters' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'level' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
                { kind: 'Field', name: { kind: 'Name', value: 'raceType' } },
                { kind: 'Field', name: { kind: 'Name', value: 'playerClass' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'username' },
                      },
                      { kind: 'Field', name: { kind: 'Name', value: 'role' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  MyOnlineCharactersQuery,
  MyOnlineCharactersQueryVariables
>;
export const CharacterSessionInfoDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CharacterSessionInfo' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'characterSessionInfo' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterId' },
                },
              },
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'name' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isOnline' } },
                { kind: 'Field', name: { kind: 'Name', value: 'lastLogin' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'totalTimePlayed' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'currentSessionTime' },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CharacterSessionInfoQuery,
  CharacterSessionInfoQueryVariables
>;
export const SetCharacterOnlineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SetCharacterOnline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setCharacterOnline' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterId' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetCharacterOnlineMutation,
  SetCharacterOnlineMutationVariables
>;
export const SetCharacterOfflineDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SetCharacterOffline' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setCharacterOffline' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterId' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  SetCharacterOfflineMutation,
  SetCharacterOfflineMutationVariables
>;
export const UpdateCharacterActivityDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCharacterActivity' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: { kind: 'Name', value: 'characterId' },
          },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } },
          },
        },
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCharacterActivity' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'characterId' },
                value: {
                  kind: 'Variable',
                  name: { kind: 'Name', value: 'characterId' },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateCharacterActivityMutation,
  UpdateCharacterActivityMutationVariables
>;
export const MyPermissionsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'MyPermissions' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'myPermissions' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'isPlayer' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isImmortal' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isBuilder' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isCoder' } },
                { kind: 'Field', name: { kind: 'Name', value: 'isGod' } },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'canAccessDashboard' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'canManageUsers' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'canViewValidation' },
                },
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'maxCharacterLevel' },
                },
                { kind: 'Field', name: { kind: 'Name', value: 'role' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MyPermissionsQuery, MyPermissionsQueryVariables>;
