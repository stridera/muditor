/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type AdminUser = {
  __typename?: 'AdminUser';
  id: Scalars['ID']['output'];
  role: UserRole;
  username: Scalars['String']['output'];
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
  effects: Array<CharacterEffectDto>;
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
  items: Array<CharacterItemDto>;
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

export type CharacterItemDto = {
  __typename?: 'CharacterItemDto';
  character: CharacterDto;
  characterId: Scalars['String']['output'];
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
  objectPrototype: ObjectSummaryDto;
  objectPrototypeId: Scalars['Int']['output'];
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

export type CreateMobEquipmentSetInput = {
  equipmentSetId: Scalars['String']['input'];
  mobResetId: Scalars['String']['input'];
  probability?: Scalars['Float']['input'];
};

export type CreateMobInput = {
  alignment?: Scalars['Int']['input'];
  armorClass?: Scalars['Int']['input'];
  charisma?: Scalars['Int']['input'];
  classId?: InputMaybe<Scalars['Int']['input']>;
  composition?: Composition;
  concealment?: Scalars['Int']['input'];
  constitution?: Scalars['Int']['input'];
  damageDice?: Scalars['String']['input'];
  damageType?: DamageType;
  dexterity?: Scalars['Int']['input'];
  effectFlags?: Array<EffectFlag>;
  examineDescription: Scalars['String']['input'];
  gender?: Gender;
  hitRoll?: Scalars['Int']['input'];
  hpDice?: Scalars['String']['input'];
  id: Scalars['Int']['input'];
  intelligence?: Scalars['Int']['input'];
  keywords: Array<Scalars['String']['input']>;
  level?: Scalars['Int']['input'];
  lifeForce?: LifeForce;
  mobFlags?: Array<MobFlag>;
  name: Scalars['String']['input'];
  perception?: Scalars['Int']['input'];
  position?: Position;
  race?: Race;
  roomDescription: Scalars['String']['input'];
  size?: Size;
  stance?: Stance;
  strength?: Scalars['Int']['input'];
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
  actionDesc?: InputMaybe<Scalars['String']['input']>;
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
  timer?: Scalars['Int']['input'];
  type?: ObjectType;
  values?: InputMaybe<Scalars['JSON']['input']>;
  wearFlags?: Array<WearFlag>;
  weight?: Scalars['Float']['input'];
  zoneId: Scalars['Int']['input'];
};

export type CreateRoomExitInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  destination?: InputMaybe<Scalars['Int']['input']>;
  direction: Direction;
  key?: InputMaybe<Scalars['String']['input']>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  roomId: Scalars['Int']['input'];
  roomZoneId: Scalars['Int']['input'];
  toRoomId?: InputMaybe<Scalars['Int']['input']>;
  toZoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type CreateRoomInput = {
  flags?: Array<RoomFlag>;
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  roomDescription: Scalars['String']['input'];
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
  | 'FIRE'
  | 'HIT'
  | 'MAUL'
  | 'PIERCE'
  | 'POISON'
  | 'POUND'
  | 'PUNCH'
  | 'SHOCK'
  | 'SLASH'
  | 'STAB'
  | 'STING'
  | 'THRASH'
  | 'WHIP';

export type Direction =
  | 'DOWN'
  | 'EAST'
  | 'NORTH'
  | 'SOUTH'
  | 'UP'
  | 'WEST';

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

export type ExitFlag =
  | 'CLOSED'
  | 'HIDDEN'
  | 'IS_DOOR'
  | 'LOCKED'
  | 'PICKPROOF';

export type Gender =
  | 'FEMALE'
  | 'MALE'
  | 'NEUTRAL'
  | 'NON_BINARY';

export type Hemisphere =
  | 'NORTHEAST'
  | 'NORTHWEST'
  | 'SOUTHEAST'
  | 'SOUTHWEST';

export type KeeperDto = {
  __typename?: 'KeeperDto';
  id: Scalars['Int']['output'];
  keywords: Array<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  zoneId: Scalars['Int']['output'];
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

export type MobDto = {
  __typename?: 'MobDto';
  alignment: Scalars['Int']['output'];
  armorClass: Scalars['Int']['output'];
  charisma: Scalars['Int']['output'];
  classId?: Maybe<Scalars['Int']['output']>;
  composition: Composition;
  concealment: Scalars['Int']['output'];
  constitution: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  damageDice: Scalars['String']['output'];
  damageType: DamageType;
  dexterity: Scalars['Int']['output'];
  effectFlags: Array<EffectFlag>;
  examineDescription: Scalars['String']['output'];
  gender: Gender;
  hitRoll: Scalars['Int']['output'];
  hpDice: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  intelligence: Scalars['Int']['output'];
  keywords: Array<Scalars['String']['output']>;
  level: Scalars['Int']['output'];
  lifeForce: LifeForce;
  mobFlags: Array<MobFlag>;
  name: Scalars['String']['output'];
  perception: Scalars['Int']['output'];
  position: Position;
  race: Race;
  roomDescription: Scalars['String']['output'];
  size: Size;
  stance: Stance;
  strength: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
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
  | 'PROTECTOR'
  | 'RANGER'
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

export type MobSummaryDto = {
  __typename?: 'MobSummaryDto';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  zoneId: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  attachTrigger: TriggerDto;
  banUser: BanRecord;
  batchUpdateRoomPositions: BatchUpdateResult;
  changePassword: PasswordResetResponse;
  createCharacter: CharacterDto;
  createCharacterEffect: CharacterEffectDto;
  createCharacterItem: CharacterItemDto;
  createEquipmentSet: EquipmentSetDto;
  createEquipmentSetItem: EquipmentSetItemDto;
  createMob: MobDto;
  createMobEquipmentSet: MobEquipmentSetDto;
  createMobReset: MobResetDto;
  createObject: ObjectDto;
  createRoom: RoomDto;
  createRoomExit: RoomExitDto;
  createShop: ShopDto;
  createTrigger: TriggerDto;
  createZone: ZoneDto;
  deleteCharacter: CharacterDto;
  deleteCharacterEffect: Scalars['Boolean']['output'];
  deleteCharacterItem: Scalars['Boolean']['output'];
  deleteEquipmentSet: Scalars['Boolean']['output'];
  deleteEquipmentSetItem: Scalars['Boolean']['output'];
  deleteMob: MobDto;
  deleteMobEquipmentSet: Scalars['Boolean']['output'];
  deleteMobReset: Scalars['Boolean']['output'];
  deleteMobResetEquipment: Scalars['Boolean']['output'];
  deleteMobs: Scalars['Int']['output'];
  deleteObject: ObjectDto;
  deleteObjects: Scalars['Int']['output'];
  deleteRoom: RoomDto;
  deleteRoomExit: RoomExitDto;
  deleteShop: ShopDto;
  deleteTrigger: TriggerDto;
  deleteZone: ZoneDto;
  detachTrigger: TriggerDto;
  /** Link an existing game character to your user account */
  linkCharacter: CharacterDto;
  login: AuthPayload;
  refreshToken: Scalars['String']['output'];
  register: AuthPayload;
  /** Remove expired effects for a character or all characters */
  removeExpiredEffects: Scalars['Int']['output'];
  requestPasswordReset: PasswordResetResponse;
  resetPassword: PasswordResetResponse;
  setCharacterOffline: Scalars['Boolean']['output'];
  setCharacterOnline: Scalars['Boolean']['output'];
  unbanUser: BanRecord;
  /** Unlink a character from your user account */
  unlinkCharacter: Scalars['Boolean']['output'];
  updateCharacter: CharacterDto;
  updateCharacterActivity: Scalars['Boolean']['output'];
  updateCharacterEffect: CharacterEffectDto;
  updateCharacterItem: CharacterItemDto;
  updateEquipmentSet: EquipmentSetDto;
  updateMob: MobDto;
  updateMobReset: MobResetDto;
  updateObject: ObjectDto;
  updateProfile: User;
  updateRoom: RoomDto;
  updateRoomPosition: RoomDto;
  updateShop: ShopDto;
  updateTrigger: TriggerDto;
  updateUser: User;
  updateZone: ZoneDto;
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


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
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


export type MutationCreateEquipmentSetArgs = {
  data: CreateEquipmentSetInput;
};


export type MutationCreateEquipmentSetItemArgs = {
  data: CreateEquipmentSetItemStandaloneInput;
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


export type MutationCreateRoomArgs = {
  data: CreateRoomInput;
};


export type MutationCreateRoomExitArgs = {
  data: CreateRoomExitInput;
};


export type MutationCreateShopArgs = {
  data: CreateShopInput;
};


export type MutationCreateTriggerArgs = {
  input: CreateTriggerInput;
};


export type MutationCreateZoneArgs = {
  data: CreateZoneInput;
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


export type MutationDeleteEquipmentSetArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteEquipmentSetItemArgs = {
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


export type MutationDeleteObjectsArgs = {
  ids: Array<Scalars['Int']['input']>;
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


export type MutationDeleteTriggerArgs = {
  id: Scalars['Float']['input'];
};


export type MutationDeleteZoneArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDetachTriggerArgs = {
  triggerId: Scalars['Float']['input'];
};


export type MutationLinkCharacterArgs = {
  data: LinkCharacterInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRemoveExpiredEffectsArgs = {
  characterId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationRequestPasswordResetArgs = {
  input: RequestPasswordResetInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
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


export type MutationUpdateEquipmentSetArgs = {
  data: UpdateEquipmentSetInput;
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


export type MutationUpdateObjectArgs = {
  data: UpdateObjectInput;
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
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


export type MutationUpdateTriggerArgs = {
  id: Scalars['Float']['input'];
  input: UpdateTriggerInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationUpdateZoneArgs = {
  data: UpdateZoneInput;
  id: Scalars['Int']['input'];
};

export type ObjectDto = {
  __typename?: 'ObjectDto';
  actionDesc?: Maybe<Scalars['String']['output']>;
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

export type ObjectSummaryDto = {
  __typename?: 'ObjectSummaryDto';
  cost?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  type: Scalars['String']['output'];
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

export type PasswordResetResponse = {
  __typename?: 'PasswordResetResponse';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type Position =
  | 'FLYING'
  | 'KNEELING'
  | 'PRONE'
  | 'SITTING'
  | 'STANDING';

export type Query = {
  __typename?: 'Query';
  activeCharacterEffects: Array<CharacterEffectDto>;
  banHistory: Array<BanRecord>;
  character: CharacterDto;
  characterEffect: CharacterEffectDto;
  characterEffects: Array<CharacterEffectDto>;
  characterItem: CharacterItemDto;
  characterItems: Array<CharacterItemDto>;
  characterLinkingInfo: CharacterLinkingInfoDto;
  characterSessionInfo: CharacterSessionInfoDto;
  characters: Array<CharacterDto>;
  charactersCount: Scalars['Int']['output'];
  equipmentSet: EquipmentSetDto;
  equipmentSets: Array<EquipmentSetDto>;
  /** Get validation summary statistics */
  getValidationSummary: ValidationSummaryType;
  me: User;
  mob: MobDto;
  mobReset?: Maybe<MobResetDto>;
  mobResets: Array<MobResetDto>;
  mobs: Array<MobDto>;
  mobsByZone: Array<MobDto>;
  mobsCount: Scalars['Int']['output'];
  myCharacters: Array<CharacterDto>;
  myOnlineCharacters: Array<OnlineCharacterDto>;
  myPermissions: UserPermissions;
  object: ObjectDto;
  objects: Array<ObjectDto>;
  objectsByType: Array<ObjectDto>;
  objectsByZone: Array<ObjectDto>;
  objectsCount: Scalars['Int']['output'];
  onlineCharacters: Array<OnlineCharacterDto>;
  room: RoomDto;
  rooms: Array<RoomDto>;
  roomsByZone: Array<RoomDto>;
  roomsCount: Scalars['Int']['output'];
  shop: ShopDto;
  shopByKeeper: ShopDto;
  shops: Array<ShopDto>;
  shopsByZone: Array<ShopDto>;
  shopsCount: Scalars['Int']['output'];
  trigger: TriggerDto;
  triggers: Array<TriggerDto>;
  triggersByAttachment: Array<TriggerDto>;
  user: User;
  userPermissions: UserPermissions;
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


export type QueryActiveCharacterEffectsArgs = {
  characterId: Scalars['ID']['input'];
};


export type QueryBanHistoryArgs = {
  userId: Scalars['ID']['input'];
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
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryEquipmentSetArgs = {
  id: Scalars['ID']['input'];
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
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMobsByZoneArgs = {
  zoneId: Scalars['Int']['input'];
};


export type QueryObjectArgs = {
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};


export type QueryObjectsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryObjectsByTypeArgs = {
  type: Scalars['String']['input'];
};


export type QueryObjectsByZoneArgs = {
  zoneId: Scalars['Int']['input'];
};


export type QueryOnlineCharactersArgs = {
  userId?: InputMaybe<Scalars['ID']['input']>;
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

export type RegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type RequestPasswordResetInput = {
  email: Scalars['String']['input'];
};

export type ResetMode =
  | 'EMPTY'
  | 'NEVER'
  | 'NORMAL';

export type ResetPasswordInput = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type RoomDto = {
  __typename?: 'RoomDto';
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
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
  destination?: Maybe<Scalars['Int']['output']>;
  direction: Direction;
  flags: Array<ExitFlag>;
  id: Scalars['String']['output'];
  key?: Maybe<Scalars['String']['output']>;
  keywords?: Maybe<Array<Scalars['String']['output']>>;
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
  | 'DARK'
  | 'DEATH'
  | 'EFFECTS_NEXT'
  | 'FERRY_DEST'
  | 'GODROOM'
  | 'GUILDHALL'
  | 'HOUSE'
  | 'HOUSECRASH'
  | 'INDOORS'
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
  | 'TUNNEL'
  | 'UNDERDARK'
  | 'VERY_SMALL'
  | 'WORLDMAP';

export type RoomSummaryDto = {
  __typename?: 'RoomSummaryDto';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  zoneId: Scalars['Int']['output'];
};

export type ScriptType =
  | 'MOB'
  | 'OBJECT'
  | 'WORLD';

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

export type ShopItemDto = {
  __typename?: 'ShopItemDto';
  amount: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  object?: Maybe<ObjectSummaryDto>;
  objectId: Scalars['Int']['output'];
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

export type Stance =
  | 'ALERT'
  | 'DEAD'
  | 'FIGHTING'
  | 'INCAPACITATED'
  | 'MORT'
  | 'RESTING'
  | 'SLEEPING'
  | 'STUNNED';

export type TriggerDto = {
  __typename?: 'TriggerDto';
  argList: Array<Scalars['String']['output']>;
  attachType: ScriptType;
  commands: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  mobId?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  numArgs: Scalars['Int']['output'];
  objectId?: Maybe<Scalars['Int']['output']>;
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

export type UpdateEquipmentSetInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMobInput = {
  alignment?: InputMaybe<Scalars['Int']['input']>;
  armorClass?: InputMaybe<Scalars['Int']['input']>;
  charisma?: InputMaybe<Scalars['Int']['input']>;
  classId?: InputMaybe<Scalars['Int']['input']>;
  composition?: InputMaybe<Composition>;
  concealment?: InputMaybe<Scalars['Int']['input']>;
  constitution?: InputMaybe<Scalars['Int']['input']>;
  damageDice?: InputMaybe<Scalars['String']['input']>;
  damageType?: InputMaybe<DamageType>;
  dexterity?: InputMaybe<Scalars['Int']['input']>;
  effectFlags?: InputMaybe<Array<EffectFlag>>;
  examineDescription?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Gender>;
  hitRoll?: InputMaybe<Scalars['Int']['input']>;
  hpDice?: InputMaybe<Scalars['String']['input']>;
  intelligence?: InputMaybe<Scalars['Int']['input']>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  level?: InputMaybe<Scalars['Int']['input']>;
  lifeForce?: InputMaybe<LifeForce>;
  mobFlags?: InputMaybe<Array<MobFlag>>;
  name?: InputMaybe<Scalars['String']['input']>;
  perception?: InputMaybe<Scalars['Int']['input']>;
  position?: InputMaybe<Position>;
  race?: InputMaybe<Race>;
  roomDescription?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Size>;
  stance?: InputMaybe<Stance>;
  strength?: InputMaybe<Scalars['Int']['input']>;
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
  actionDesc?: InputMaybe<Scalars['String']['input']>;
  concealment?: InputMaybe<Scalars['Int']['input']>;
  cost?: InputMaybe<Scalars['Int']['input']>;
  decomposeTimer?: InputMaybe<Scalars['Int']['input']>;
  effectFlags?: InputMaybe<Array<EffectFlag>>;
  examineDescription?: InputMaybe<Scalars['String']['input']>;
  flags?: InputMaybe<Array<ObjectFlag>>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  level?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  timer?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<ObjectType>;
  values?: InputMaybe<Scalars['JSON']['input']>;
  wearFlags?: InputMaybe<Array<WearFlag>>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateProfileInput = {
  email?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRoomInput = {
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
  role: UserRole;
  updatedAt: Scalars['DateTime']['output'];
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

/** User role in the MUD system */
export type UserRole =
  | 'BUILDER'
  | 'CODER'
  | 'GOD'
  | 'IMMORTAL'
  | 'PLAYER';

export type UserSummaryDto = {
  __typename?: 'UserSummaryDto';
  id: Scalars['ID']['output'];
  role: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

/** The category of validation issue */
export type ValidationCategory =
  | 'CONSISTENCY'
  | 'INTEGRITY'
  | 'QUALITY';

/** The type of entity being validated */
export type ValidationEntity =
  | 'MOB'
  | 'OBJECT'
  | 'ROOM'
  | 'SHOP'
  | 'ZONE';

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
export type ValidationIssueType =
  | 'ERROR'
  | 'INFO'
  | 'WARNING';

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
export type ValidationSeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'LOW'
  | 'MEDIUM';

export type ValidationSummaryType = {
  __typename?: 'ValidationSummaryType';
  errorCount: Scalars['Int']['output'];
  infoCount: Scalars['Int']['output'];
  totalIssues: Scalars['Int']['output'];
  totalZones: Scalars['Int']['output'];
  warningCount: Scalars['Int']['output'];
  zonesWithIssues: Scalars['Int']['output'];
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

export type ZoneRoomDto = {
  __typename?: 'ZoneRoomDto';
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  sector: Scalars['String']['output'];
};

export type GetMyCharactersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyCharactersQuery = { __typename?: 'Query', myCharacters: Array<{ __typename?: 'CharacterDto', id: string, name: string, level: number, raceType?: string | null, playerClass?: string | null, lastLogin?: any | null, isOnline: boolean, timePlayed: number, hitPoints: number, hitPointsMax: number, movement: number, movementMax: number, alignment: number, strength: number, intelligence: number, wisdom: number, dexterity: number, constitution: number, charisma: number, luck: number, experience: number, copper: number, silver: number, gold: number, platinum: number, description?: string | null, title?: string | null, currentRoom?: number | null }> };

export type GetObjectQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;


export type GetObjectQuery = { __typename?: 'Query', object: { __typename?: 'ObjectDto', id: number, type: ObjectType, keywords: Array<string>, name: string, examineDescription: string, actionDesc?: string | null, weight: number, cost: number, timer: number, decomposeTimer: number, level: number, concealment: number, values: any, zoneId: number, flags: Array<ObjectFlag>, effectFlags: Array<EffectFlag>, wearFlags: Array<WearFlag>, createdAt: any, updatedAt: any } };

export type UpdateObjectMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
  data: UpdateObjectInput;
}>;


export type UpdateObjectMutation = { __typename?: 'Mutation', updateObject: { __typename?: 'ObjectDto', id: number, keywords: Array<string>, name: string, examineDescription: string } };

export type CreateObjectMutationVariables = Exact<{
  data: CreateObjectInput;
}>;


export type CreateObjectMutation = { __typename?: 'Mutation', createObject: { __typename?: 'ObjectDto', id: number, keywords: Array<string>, name: string } };

export type GetObjectsDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type GetObjectsDashboardQuery = { __typename?: 'Query', objects: Array<{ __typename?: 'ObjectDto', id: number, type: ObjectType, keywords: Array<string>, name: string, level: number, weight: number, cost: number, zoneId: number, values: any }> };

export type GetObjectsByZoneDashboardQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;


export type GetObjectsByZoneDashboardQuery = { __typename?: 'Query', objectsByZone: Array<{ __typename?: 'ObjectDto', id: number, type: ObjectType, keywords: Array<string>, name: string, level: number, weight: number, cost: number, zoneId: number, values: any }> };

export type DeleteObjectMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;


export type DeleteObjectMutation = { __typename?: 'Mutation', deleteObject: { __typename?: 'ObjectDto', id: number } };

export type DeleteObjectsMutationVariables = Exact<{
  ids: Array<Scalars['Int']['input']> | Scalars['Int']['input'];
}>;


export type DeleteObjectsMutation = { __typename?: 'Mutation', deleteObjects: number };

export type GetDashboardStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetDashboardStatsQuery = { __typename?: 'Query', zonesCount: number, roomsCount: number, mobsCount: number, objectsCount: number, shopsCount: number };

export type GetShopQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;


export type GetShopQuery = { __typename?: 'Query', shop: { __typename?: 'ShopDto', id: number, buyProfit: number, sellProfit: number, temper: number, noSuchItemMessages: Array<string>, doNotBuyMessages: Array<string>, missingCashMessages: Array<string>, buyMessages: Array<string>, sellMessages: Array<string>, keeperId?: number | null, zoneId: number, flags: Array<ShopFlag>, tradesWithFlags: Array<ShopTradesWith>, createdAt: any, updatedAt: any, items: Array<{ __typename?: 'ShopItemDto', id: string, amount: number, objectId: number, object?: { __typename?: 'ObjectSummaryDto', id: number, name: string, type: string, cost?: number | null } | null }>, accepts: Array<{ __typename?: 'ShopAcceptDto', id: string, type: string, keywords?: string | null }>, hours: Array<{ __typename?: 'ShopHourDto', id: string, open: number, close: number }> } };

export type GetAvailableObjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAvailableObjectsQuery = { __typename?: 'Query', objects: Array<{ __typename?: 'ObjectDto', id: number, keywords: Array<string>, name: string, type: ObjectType, cost: number, zoneId: number }> };

export type GetAvailableMobsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAvailableMobsQuery = { __typename?: 'Query', mobs: Array<{ __typename?: 'MobDto', id: number, keywords: Array<string>, name: string, zoneId: number }> };

export type UpdateShopMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
  data: UpdateShopInput;
}>;


export type UpdateShopMutation = { __typename?: 'Mutation', updateShop: { __typename?: 'ShopDto', id: number, buyProfit: number, sellProfit: number } };

export type CreateShopMutationVariables = Exact<{
  data: CreateShopInput;
}>;


export type CreateShopMutation = { __typename?: 'Mutation', createShop: { __typename?: 'ShopDto', id: number, buyProfit: number, sellProfit: number } };

export type GetShopsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetShopsQuery = { __typename?: 'Query', shops: Array<{ __typename?: 'ShopDto', id: number, buyProfit: number, sellProfit: number, temper: number, flags: Array<ShopFlag>, tradesWithFlags: Array<ShopTradesWith>, noSuchItemMessages: Array<string>, doNotBuyMessages: Array<string>, missingCashMessages: Array<string>, buyMessages: Array<string>, sellMessages: Array<string>, keeperId?: number | null, zoneId: number, createdAt: any, updatedAt: any, keeper?: { __typename?: 'KeeperDto', id: number, zoneId: number, name: string, keywords: Array<string> } | null, items: Array<{ __typename?: 'ShopItemDto', id: string, amount: number, objectId: number, object?: { __typename?: 'ObjectSummaryDto', id: number, zoneId: number, name: string, type: string, cost?: number | null } | null }>, accepts: Array<{ __typename?: 'ShopAcceptDto', id: string, type: string, keywords?: string | null }> }> };

export type GetShopsByZoneQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;


export type GetShopsByZoneQuery = { __typename?: 'Query', shopsByZone: Array<{ __typename?: 'ShopDto', id: number, buyProfit: number, sellProfit: number, temper: number, flags: Array<ShopFlag>, tradesWithFlags: Array<ShopTradesWith>, noSuchItemMessages: Array<string>, doNotBuyMessages: Array<string>, missingCashMessages: Array<string>, buyMessages: Array<string>, sellMessages: Array<string>, keeperId?: number | null, zoneId: number, createdAt: any, updatedAt: any, keeper?: { __typename?: 'KeeperDto', id: number, zoneId: number, name: string, keywords: Array<string> } | null, items: Array<{ __typename?: 'ShopItemDto', id: string, amount: number, objectId: number, object?: { __typename?: 'ObjectSummaryDto', id: number, zoneId: number, name: string, type: string, cost?: number | null } | null }>, accepts: Array<{ __typename?: 'ShopAcceptDto', id: string, type: string, keywords?: string | null }> }> };

export type DeleteShopMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;


export type DeleteShopMutation = { __typename?: 'Mutation', deleteShop: { __typename?: 'ShopDto', id: number } };

export type UsersQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersQuery = { __typename?: 'Query', users: Array<{ __typename?: 'User', id: string, username: string, email: string, role: UserRole, isBanned: boolean, createdAt: any, lastLoginAt?: any | null, banRecords?: Array<{ __typename?: 'BanRecord', id: string, reason: string, bannedAt: any, expiresAt?: any | null, admin?: { __typename?: 'AdminUser', username: string } | null }> | null }> };

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser: { __typename?: 'User', id: string, username: string, email: string, role: UserRole } };

export type BanUserMutationVariables = Exact<{
  input: BanUserInput;
}>;


export type BanUserMutation = { __typename?: 'Mutation', banUser: { __typename?: 'BanRecord', id: string, reason: string, bannedAt: any, userId: string } };

export type UnbanUserMutationVariables = Exact<{
  input: UnbanUserInput;
}>;


export type UnbanUserMutation = { __typename?: 'Mutation', unbanUser: { __typename?: 'BanRecord', id: string, unbannedAt?: any | null, userId: string } };

export type GetZonesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetZonesQuery = { __typename?: 'Query', zones: Array<{ __typename?: 'ZoneDto', id: number, name: string, climate: Climate }> };

export type GetRoomsByZoneQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;


export type GetRoomsByZoneQuery = { __typename?: 'Query', roomsByZone: Array<{ __typename?: 'RoomDto', id: number, name: string, roomDescription: string, layoutX?: number | null, layoutY?: number | null, layoutZ?: number | null, exits: Array<{ __typename?: 'RoomExitDto', direction: Direction, destination?: number | null }> }> };

export type GetZonesDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type GetZonesDashboardQuery = { __typename?: 'Query', roomsCount: number, zones: Array<{ __typename?: 'ZoneDto', id: number, name: string, climate: Climate }> };

export type RequestPasswordResetMutationVariables = Exact<{
  input: RequestPasswordResetInput;
}>;


export type RequestPasswordResetMutation = { __typename?: 'Mutation', requestPasswordReset: { __typename?: 'PasswordResetResponse', success: boolean, message: string } };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword: { __typename?: 'PasswordResetResponse', success: boolean, message: string } };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile: { __typename?: 'User', id: string, username: string, email: string, role: UserRole, createdAt: any } };

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword: { __typename?: 'PasswordResetResponse', success: boolean, message: string } };

export type GetTriggersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTriggersQuery = { __typename?: 'Query', triggers: Array<{ __typename?: 'TriggerDto', id: string, name: string, attachType: ScriptType, numArgs: number, argList: Array<string>, commands: string, variables: string, mobId?: number | null, objectId?: number | null, zoneId?: number | null, createdAt: any, updatedAt: any }> };

export type GetTriggersByAttachmentQueryVariables = Exact<{
  attachType: ScriptType;
  entityId: Scalars['Int']['input'];
}>;


export type GetTriggersByAttachmentQuery = { __typename?: 'Query', triggersByAttachment: Array<{ __typename?: 'TriggerDto', id: string, name: string, attachType: ScriptType, numArgs: number, argList: Array<string>, commands: string, variables: string, mobId?: number | null, objectId?: number | null, zoneId?: number | null, createdAt: any, updatedAt: any }> };

export type CreateTriggerMutationVariables = Exact<{
  input: CreateTriggerInput;
}>;


export type CreateTriggerMutation = { __typename?: 'Mutation', createTrigger: { __typename?: 'TriggerDto', id: string, name: string, attachType: ScriptType, commands: string, variables: string } };

export type UpdateTriggerMutationVariables = Exact<{
  id: Scalars['Float']['input'];
  input: UpdateTriggerInput;
}>;


export type UpdateTriggerMutation = { __typename?: 'Mutation', updateTrigger: { __typename?: 'TriggerDto', id: string, name: string, attachType: ScriptType, commands: string, variables: string } };

export type DeleteTriggerMutationVariables = Exact<{
  id: Scalars['Float']['input'];
}>;


export type DeleteTriggerMutation = { __typename?: 'Mutation', deleteTrigger: { __typename?: 'TriggerDto', id: string } };

export type AttachTriggerMutationVariables = Exact<{
  input: AttachTriggerInput;
}>;


export type AttachTriggerMutation = { __typename?: 'Mutation', attachTrigger: { __typename?: 'TriggerDto', id: string, name: string, mobId?: number | null, objectId?: number | null, zoneId?: number | null } };

export type DetachTriggerMutationVariables = Exact<{
  triggerId: Scalars['Float']['input'];
}>;


export type DetachTriggerMutation = { __typename?: 'Mutation', detachTrigger: { __typename?: 'TriggerDto', id: string, name: string } };

export type GetZonesForSelectorQueryVariables = Exact<{ [key: string]: never; }>;


export type GetZonesForSelectorQuery = { __typename?: 'Query', zones: Array<{ __typename?: 'ZoneDto', id: number, name: string }> };

export type CreateCharacterMutationVariables = Exact<{
  data: CreateCharacterInput;
}>;


export type CreateCharacterMutation = { __typename?: 'Mutation', createCharacter: { __typename?: 'CharacterDto', id: string, name: string, level: number, raceType?: string | null, playerClass?: string | null, strength: number, intelligence: number, wisdom: number, dexterity: number, constitution: number, charisma: number, luck: number } };

export type GetCharacterDetailsQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetCharacterDetailsQuery = { __typename?: 'Query', character: { __typename?: 'CharacterDto', id: string, name: string, level: number, raceType?: string | null, playerClass?: string | null, lastLogin?: any | null, isOnline: boolean, timePlayed: number, hitPoints: number, hitPointsMax: number, movement: number, movementMax: number, alignment: number, strength: number, intelligence: number, wisdom: number, dexterity: number, constitution: number, charisma: number, luck: number, experience: number, skillPoints: number, copper: number, silver: number, gold: number, platinum: number, bankCopper: number, bankSilver: number, bankGold: number, bankPlatinum: number, description?: string | null, title?: string | null, currentRoom?: number | null, saveRoom?: number | null, homeRoom?: number | null, hunger: number, thirst: number, hitRoll: number, damageRoll: number, armorClass: number, playerFlags: Array<string>, effectFlags: Array<string>, privilegeFlags: Array<string>, invisLevel: number, birthTime: any, items: Array<{ __typename?: 'CharacterItemDto', id: string, equippedLocation?: string | null, condition: number, charges: number, objectPrototype: { __typename?: 'ObjectSummaryDto', id: number, name: string, type: string } }>, effects: Array<{ __typename?: 'CharacterEffectDto', id: string, effectName: string, effectType?: string | null, duration?: number | null, strength: number, appliedAt: any, expiresAt?: any | null }> } };

export type GetCharacterSessionInfoQueryVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;


export type GetCharacterSessionInfoQuery = { __typename?: 'Query', characterSessionInfo: { __typename?: 'CharacterSessionInfoDto', id: string, name: string, isOnline: boolean, lastLogin?: any | null, totalTimePlayed: number, currentSessionTime: number } };

export type GetCharacterLinkingInfoQueryVariables = Exact<{
  characterName: Scalars['String']['input'];
}>;


export type GetCharacterLinkingInfoQuery = { __typename?: 'Query', characterLinkingInfo: { __typename?: 'CharacterLinkingInfoDto', id: string, name: string, level: number, race?: string | null, class?: string | null, lastLogin?: any | null, timePlayed: number, isOnline: boolean, isLinked: boolean, hasPassword: boolean } };

export type LinkCharacterMutationVariables = Exact<{
  data: LinkCharacterInput;
}>;


export type LinkCharacterMutation = { __typename?: 'Mutation', linkCharacter: { __typename?: 'CharacterDto', id: string, name: string, level: number, raceType?: string | null, playerClass?: string | null } };

export type ValidateCharacterPasswordQueryVariables = Exact<{
  characterName: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type ValidateCharacterPasswordQuery = { __typename?: 'Query', validateCharacterPassword: boolean };

export type GetEquipmentSetsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEquipmentSetsQuery = { __typename?: 'Query', equipmentSets: Array<{ __typename?: 'EquipmentSetDto', id: string, name: string, description?: string | null, createdAt: any, updatedAt: any, items: Array<{ __typename?: 'EquipmentSetItemDto', id: string, slot?: string | null, probability: number, object: { __typename?: 'ObjectDto', id: number, name: string, type: ObjectType, keywords: Array<string> } }> }> };

export type GetObjectsForEquipmentSetQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetObjectsForEquipmentSetQuery = { __typename?: 'Query', objects: Array<{ __typename?: 'ObjectDto', id: number, name: string, type: ObjectType, keywords: Array<string>, wearFlags: Array<WearFlag> }> };

export type CreateEquipmentSetMutationVariables = Exact<{
  data: CreateEquipmentSetInput;
}>;


export type CreateEquipmentSetMutation = { __typename?: 'Mutation', createEquipmentSet: { __typename?: 'EquipmentSetDto', id: string, name: string, description?: string | null, createdAt: any } };

export type UpdateEquipmentSetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateEquipmentSetInput;
}>;


export type UpdateEquipmentSetMutation = { __typename?: 'Mutation', updateEquipmentSet: { __typename?: 'EquipmentSetDto', id: string, name: string, description?: string | null, updatedAt: any } };

export type DeleteEquipmentSetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteEquipmentSetMutation = { __typename?: 'Mutation', deleteEquipmentSet: boolean };

export type AddEquipmentSetItemMutationVariables = Exact<{
  data: CreateEquipmentSetItemStandaloneInput;
}>;


export type AddEquipmentSetItemMutation = { __typename?: 'Mutation', createEquipmentSetItem: { __typename?: 'EquipmentSetItemDto', id: string, slot?: string | null, probability: number } };

export type RemoveEquipmentSetItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RemoveEquipmentSetItemMutation = { __typename?: 'Mutation', deleteEquipmentSetItem: boolean };

export type GetMobResetsLegacyQueryVariables = Exact<{
  mobId: Scalars['Int']['input'];
  mobZoneId: Scalars['Int']['input'];
}>;


export type GetMobResetsLegacyQuery = { __typename?: 'Query', mobResets: Array<{ __typename?: 'MobResetDto', id: string, maxInstances: number, probability: number, roomId: number, roomZoneId: number, mob?: { __typename?: 'MobSummaryDto', id: number, name: string } | null, equipment: Array<{ __typename?: 'MobResetEquipmentDto', id: string, maxInstances: number, probability: number, wearLocation?: WearFlag | null, objectId: number, objectZoneId: number, object: { __typename?: 'ObjectSummaryDto', id: number, name: string, type: string } }> }> };

export type GetObjectsLegacyQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetObjectsLegacyQuery = { __typename?: 'Query', objects: Array<{ __typename?: 'ObjectDto', id: number, name: string, type: ObjectType, keywords: Array<string>, wearFlags: Array<WearFlag> }> };

export type CreateMobResetMutationVariables = Exact<{
  data: CreateMobResetInput;
}>;


export type CreateMobResetMutation = { __typename?: 'Mutation', createMobReset: { __typename?: 'MobResetDto', id: string, maxInstances: number, probability: number, roomId: number } };

export type UpdateMobResetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateMobResetInput;
}>;


export type UpdateMobResetMutation = { __typename?: 'Mutation', updateMobReset: { __typename?: 'MobResetDto', id: string, maxInstances: number, probability: number, roomId: number } };

export type DeleteMobResetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteMobResetMutation = { __typename?: 'Mutation', deleteMobReset: boolean };

export type DeleteMobResetEquipmentMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteMobResetEquipmentMutation = { __typename?: 'Mutation', deleteMobResetEquipment: boolean };

export type GetMobResetsForMobQueryVariables = Exact<{
  mobId: Scalars['Int']['input'];
  mobZoneId: Scalars['Int']['input'];
}>;


export type GetMobResetsForMobQuery = { __typename?: 'Query', mobResets: Array<{ __typename?: 'MobResetDto', id: string, maxInstances: number, probability: number, roomId: number, roomZoneId: number, mob?: { __typename?: 'MobSummaryDto', id: number, name: string } | null, equipment: Array<{ __typename?: 'MobResetEquipmentDto', id: string, maxInstances: number, probability: number, wearLocation?: WearFlag | null, objectId: number, objectZoneId: number, object: { __typename?: 'ObjectSummaryDto', id: number, name: string, type: string } }> }> };

export type GetEquipmentSetsForMobQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEquipmentSetsForMobQuery = { __typename?: 'Query', equipmentSets: Array<{ __typename?: 'EquipmentSetDto', id: string, name: string, description?: string | null, createdAt: any, items: Array<{ __typename?: 'EquipmentSetItemDto', id: string, slot?: string | null, probability: number, object: { __typename?: 'ObjectDto', id: number, name: string, type: ObjectType } }> }> };

export type GetObjectsForMobQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetObjectsForMobQuery = { __typename?: 'Query', objects: Array<{ __typename?: 'ObjectDto', id: number, name: string, type: ObjectType, keywords: Array<string>, wearFlags: Array<WearFlag> }> };

export type CreateEquipmentSetForMobMutationVariables = Exact<{
  data: CreateEquipmentSetInput;
}>;


export type CreateEquipmentSetForMobMutation = { __typename?: 'Mutation', createEquipmentSet: { __typename?: 'EquipmentSetDto', id: string, name: string, description?: string | null } };

export type AddMobEquipmentSetMutationVariables = Exact<{
  data: CreateMobEquipmentSetInput;
}>;


export type AddMobEquipmentSetMutation = { __typename?: 'Mutation', createMobEquipmentSet: { __typename?: 'MobEquipmentSetDto', id: string, probability: number } };

export type RemoveMobEquipmentSetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RemoveMobEquipmentSetMutation = { __typename?: 'Mutation', deleteMobEquipmentSet: boolean };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', accessToken: string, user: { __typename?: 'User', id: string, username: string, email: string, role: UserRole, createdAt: any } } };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register: { __typename?: 'AuthPayload', accessToken: string, user: { __typename?: 'User', id: string, username: string, email: string, role: UserRole, createdAt: any } } };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me: { __typename?: 'User', id: string, username: string, email: string, role: UserRole, createdAt: any } };

export type UpdateMobMutationVariables = Exact<{
  zoneId: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  data: UpdateMobInput;
}>;


export type UpdateMobMutation = { __typename?: 'Mutation', updateMob: { __typename?: 'MobDto', id: number, zoneId: number, keywords: Array<string>, name: string, roomDescription: string, examineDescription: string, level: number, alignment: number, hitRoll: number, armorClass: number, hpDice: string, damageDice: string, damageType: DamageType, strength: number, intelligence: number, wisdom: number, dexterity: number, constitution: number, charisma: number, perception: number, concealment: number, race: Race, gender: Gender, size: Size, lifeForce: LifeForce, composition: Composition, mobFlags: Array<MobFlag>, effectFlags: Array<EffectFlag>, position: Position, stance: Stance } };

export type CreateMobMutationVariables = Exact<{
  data: CreateMobInput;
}>;


export type CreateMobMutation = { __typename?: 'Mutation', createMob: { __typename?: 'MobDto', id: number, zoneId: number, keywords: Array<string>, name: string, roomDescription: string, examineDescription: string, level: number, alignment: number, hitRoll: number, armorClass: number, hpDice: string, damageDice: string, damageType: DamageType, strength: number, intelligence: number, wisdom: number, dexterity: number, constitution: number, charisma: number, perception: number, concealment: number, race: Race, gender: Gender, size: Size, lifeForce: LifeForce, composition: Composition, mobFlags: Array<MobFlag>, effectFlags: Array<EffectFlag>, position: Position, stance: Stance } };

export type DeleteMobMutationVariables = Exact<{
  zoneId: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
}>;


export type DeleteMobMutation = { __typename?: 'Mutation', deleteMob: { __typename?: 'MobDto', id: number, zoneId: number } };

export type GetMobQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;


export type GetMobQuery = { __typename?: 'Query', mob: { __typename?: 'MobDto', id: number, zoneId: number, keywords: Array<string>, name: string, roomDescription: string, examineDescription: string, level: number, alignment: number, hitRoll: number, armorClass: number, hpDice: string, damageDice: string, damageType: DamageType, strength: number, intelligence: number, wisdom: number, dexterity: number, constitution: number, charisma: number, perception: number, concealment: number, race: Race, gender: Gender, size: Size, lifeForce: LifeForce, composition: Composition, mobFlags: Array<MobFlag>, effectFlags: Array<EffectFlag>, position: Position, stance: Stance, createdAt: any, updatedAt: any } };

export type GetMobsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetMobsQuery = { __typename?: 'Query', mobs: Array<{ __typename?: 'MobDto', id: number, zoneId: number, keywords: Array<string>, name: string, roomDescription: string, examineDescription: string, level: number, alignment: number, race: Race, hitRoll: number, armorClass: number, damageType: DamageType, strength: number, intelligence: number, wisdom: number, dexterity: number, constitution: number, charisma: number, lifeForce: LifeForce, hpDice: string, damageDice: string, mobFlags: Array<MobFlag>, effectFlags: Array<EffectFlag> }> };

export type GetMobsByZoneQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;


export type GetMobsByZoneQuery = { __typename?: 'Query', mobsByZone: Array<{ __typename?: 'MobDto', id: number, zoneId: number, keywords: Array<string>, name: string, roomDescription: string, examineDescription: string, level: number, alignment: number, race: Race, hitRoll: number, armorClass: number, damageType: DamageType, strength: number, intelligence: number, wisdom: number, dexterity: number, constitution: number, charisma: number, wealth?: number | null, hpDice: string, damageDice: string, mobFlags: Array<MobFlag>, effectFlags: Array<EffectFlag>, lifeForce: LifeForce }> };

export type OnlineCharactersQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type OnlineCharactersQuery = { __typename?: 'Query', onlineCharacters: Array<{ __typename?: 'OnlineCharacterDto', id: string, name: string, level: number, lastLogin?: any | null, isOnline: boolean, raceType?: string | null, playerClass?: string | null, user: { __typename?: 'UserSummaryDto', id: string, username: string, role: string } }> };

export type MyOnlineCharactersQueryVariables = Exact<{ [key: string]: never; }>;


export type MyOnlineCharactersQuery = { __typename?: 'Query', myOnlineCharacters: Array<{ __typename?: 'OnlineCharacterDto', id: string, name: string, level: number, lastLogin?: any | null, isOnline: boolean, raceType?: string | null, playerClass?: string | null, user: { __typename?: 'UserSummaryDto', id: string, username: string, role: string } }> };

export type CharacterSessionInfoQueryVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;


export type CharacterSessionInfoQuery = { __typename?: 'Query', characterSessionInfo: { __typename?: 'CharacterSessionInfoDto', id: string, name: string, isOnline: boolean, lastLogin?: any | null, totalTimePlayed: number, currentSessionTime: number } };

export type SetCharacterOnlineMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;


export type SetCharacterOnlineMutation = { __typename?: 'Mutation', setCharacterOnline: boolean };

export type SetCharacterOfflineMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;


export type SetCharacterOfflineMutation = { __typename?: 'Mutation', setCharacterOffline: boolean };

export type UpdateCharacterActivityMutationVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;


export type UpdateCharacterActivityMutation = { __typename?: 'Mutation', updateCharacterActivity: boolean };

export type MyPermissionsQueryVariables = Exact<{ [key: string]: never; }>;


export type MyPermissionsQuery = { __typename?: 'Query', myPermissions: { __typename?: 'UserPermissions', isPlayer: boolean, isImmortal: boolean, isBuilder: boolean, isCoder: boolean, isGod: boolean, canAccessDashboard: boolean, canManageUsers: boolean, canViewValidation: boolean, maxCharacterLevel: number, role: UserRole } };


export const GetMyCharactersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMyCharacters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myCharacters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"raceType"}},{"kind":"Field","name":{"kind":"Name","value":"playerClass"}},{"kind":"Field","name":{"kind":"Name","value":"lastLogin"}},{"kind":"Field","name":{"kind":"Name","value":"isOnline"}},{"kind":"Field","name":{"kind":"Name","value":"timePlayed"}},{"kind":"Field","name":{"kind":"Name","value":"hitPoints"}},{"kind":"Field","name":{"kind":"Name","value":"hitPointsMax"}},{"kind":"Field","name":{"kind":"Name","value":"movement"}},{"kind":"Field","name":{"kind":"Name","value":"movementMax"}},{"kind":"Field","name":{"kind":"Name","value":"alignment"}},{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"intelligence"}},{"kind":"Field","name":{"kind":"Name","value":"wisdom"}},{"kind":"Field","name":{"kind":"Name","value":"dexterity"}},{"kind":"Field","name":{"kind":"Name","value":"constitution"}},{"kind":"Field","name":{"kind":"Name","value":"charisma"}},{"kind":"Field","name":{"kind":"Name","value":"luck"}},{"kind":"Field","name":{"kind":"Name","value":"experience"}},{"kind":"Field","name":{"kind":"Name","value":"copper"}},{"kind":"Field","name":{"kind":"Name","value":"silver"}},{"kind":"Field","name":{"kind":"Name","value":"gold"}},{"kind":"Field","name":{"kind":"Name","value":"platinum"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"currentRoom"}}]}}]}}]} as unknown as DocumentNode<GetMyCharactersQuery, GetMyCharactersQueryVariables>;
export const GetObjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetObject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"object"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"examineDescription"}},{"kind":"Field","name":{"kind":"Name","value":"actionDesc"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"timer"}},{"kind":"Field","name":{"kind":"Name","value":"decomposeTimer"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"concealment"}},{"kind":"Field","name":{"kind":"Name","value":"values"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"flags"}},{"kind":"Field","name":{"kind":"Name","value":"effectFlags"}},{"kind":"Field","name":{"kind":"Name","value":"wearFlags"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetObjectQuery, GetObjectQueryVariables>;
export const UpdateObjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateObject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateObjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"examineDescription"}}]}}]}}]} as unknown as DocumentNode<UpdateObjectMutation, UpdateObjectMutationVariables>;
export const CreateObjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateObject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateObjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CreateObjectMutation, CreateObjectMutationVariables>;
export const GetObjectsDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetObjectsDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"IntValue","value":"100"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}}]}}]} as unknown as DocumentNode<GetObjectsDashboardQuery, GetObjectsDashboardQueryVariables>;
export const GetObjectsByZoneDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetObjectsByZoneDashboard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objectsByZone"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"weight"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}}]}}]} as unknown as DocumentNode<GetObjectsByZoneDashboardQuery, GetObjectsByZoneDashboardQueryVariables>;
export const DeleteObjectDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteObject"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteObjectMutation, DeleteObjectMutationVariables>;
export const DeleteObjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteObjects"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"ids"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteObjects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"ids"},"value":{"kind":"Variable","name":{"kind":"Name","value":"ids"}}}]}]}}]} as unknown as DocumentNode<DeleteObjectsMutation, DeleteObjectsMutationVariables>;
export const GetDashboardStatsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetDashboardStats"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"zonesCount"}},{"kind":"Field","name":{"kind":"Name","value":"roomsCount"}},{"kind":"Field","name":{"kind":"Name","value":"mobsCount"}},{"kind":"Field","name":{"kind":"Name","value":"objectsCount"}},{"kind":"Field","name":{"kind":"Name","value":"shopsCount"}}]}}]} as unknown as DocumentNode<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>;
export const GetShopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetShop"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"buyProfit"}},{"kind":"Field","name":{"kind":"Name","value":"sellProfit"}},{"kind":"Field","name":{"kind":"Name","value":"temper"}},{"kind":"Field","name":{"kind":"Name","value":"noSuchItemMessages"}},{"kind":"Field","name":{"kind":"Name","value":"doNotBuyMessages"}},{"kind":"Field","name":{"kind":"Name","value":"missingCashMessages"}},{"kind":"Field","name":{"kind":"Name","value":"buyMessages"}},{"kind":"Field","name":{"kind":"Name","value":"sellMessages"}},{"kind":"Field","name":{"kind":"Name","value":"keeperId"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"flags"}},{"kind":"Field","name":{"kind":"Name","value":"tradesWithFlags"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"object"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"accepts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hours"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"open"}},{"kind":"Field","name":{"kind":"Name","value":"close"}}]}}]}}]}}]} as unknown as DocumentNode<GetShopQuery, GetShopQueryVariables>;
export const GetAvailableObjectsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAvailableObjects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}}]}}]}}]} as unknown as DocumentNode<GetAvailableObjectsQuery, GetAvailableObjectsQueryVariables>;
export const GetAvailableMobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAvailableMobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}}]}}]}}]} as unknown as DocumentNode<GetAvailableMobsQuery, GetAvailableMobsQueryVariables>;
export const UpdateShopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateShop"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateShopInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateShop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"buyProfit"}},{"kind":"Field","name":{"kind":"Name","value":"sellProfit"}}]}}]}}]} as unknown as DocumentNode<UpdateShopMutation, UpdateShopMutationVariables>;
export const CreateShopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateShop"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateShopInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createShop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"buyProfit"}},{"kind":"Field","name":{"kind":"Name","value":"sellProfit"}}]}}]}}]} as unknown as DocumentNode<CreateShopMutation, CreateShopMutationVariables>;
export const GetShopsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetShops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"buyProfit"}},{"kind":"Field","name":{"kind":"Name","value":"sellProfit"}},{"kind":"Field","name":{"kind":"Name","value":"temper"}},{"kind":"Field","name":{"kind":"Name","value":"flags"}},{"kind":"Field","name":{"kind":"Name","value":"tradesWithFlags"}},{"kind":"Field","name":{"kind":"Name","value":"noSuchItemMessages"}},{"kind":"Field","name":{"kind":"Name","value":"doNotBuyMessages"}},{"kind":"Field","name":{"kind":"Name","value":"missingCashMessages"}},{"kind":"Field","name":{"kind":"Name","value":"buyMessages"}},{"kind":"Field","name":{"kind":"Name","value":"sellMessages"}},{"kind":"Field","name":{"kind":"Name","value":"keeperId"}},{"kind":"Field","name":{"kind":"Name","value":"keeper"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}}]}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"object"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"accepts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}}]}}]}}]}}]} as unknown as DocumentNode<GetShopsQuery, GetShopsQueryVariables>;
export const GetShopsByZoneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetShopsByZone"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"shopsByZone"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"buyProfit"}},{"kind":"Field","name":{"kind":"Name","value":"sellProfit"}},{"kind":"Field","name":{"kind":"Name","value":"temper"}},{"kind":"Field","name":{"kind":"Name","value":"flags"}},{"kind":"Field","name":{"kind":"Name","value":"tradesWithFlags"}},{"kind":"Field","name":{"kind":"Name","value":"noSuchItemMessages"}},{"kind":"Field","name":{"kind":"Name","value":"doNotBuyMessages"}},{"kind":"Field","name":{"kind":"Name","value":"missingCashMessages"}},{"kind":"Field","name":{"kind":"Name","value":"buyMessages"}},{"kind":"Field","name":{"kind":"Name","value":"sellMessages"}},{"kind":"Field","name":{"kind":"Name","value":"keeperId"}},{"kind":"Field","name":{"kind":"Name","value":"keeper"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}}]}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"object"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"cost"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"accepts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}}]}}]}}]}}]} as unknown as DocumentNode<GetShopsByZoneQuery, GetShopsByZoneQueryVariables>;
export const DeleteShopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteShop"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteShop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteShopMutation, DeleteShopMutationVariables>;
export const UsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isBanned"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"lastLoginAt"}},{"kind":"Field","name":{"kind":"Name","value":"banRecords"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"bannedAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}},{"kind":"Field","name":{"kind":"Name","value":"admin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"username"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const UpdateUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
export const BanUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BanUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BanUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"banUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"bannedAt"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]}}]} as unknown as DocumentNode<BanUserMutation, BanUserMutationVariables>;
export const UnbanUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnbanUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UnbanUserInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unbanUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"unbannedAt"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}}]}}]}}]} as unknown as DocumentNode<UnbanUserMutation, UnbanUserMutationVariables>;
export const GetZonesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetZones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"zones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"climate"}}]}}]}}]} as unknown as DocumentNode<GetZonesQuery, GetZonesQueryVariables>;
export const GetRoomsByZoneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRoomsByZone"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"roomsByZone"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roomDescription"}},{"kind":"Field","name":{"kind":"Name","value":"layoutX"}},{"kind":"Field","name":{"kind":"Name","value":"layoutY"}},{"kind":"Field","name":{"kind":"Name","value":"layoutZ"}},{"kind":"Field","name":{"kind":"Name","value":"exits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"destination"}}]}}]}}]}}]} as unknown as DocumentNode<GetRoomsByZoneQuery, GetRoomsByZoneQueryVariables>;
export const GetZonesDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetZonesDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"zones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"climate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"roomsCount"}}]}}]} as unknown as DocumentNode<GetZonesDashboardQuery, GetZonesDashboardQueryVariables>;
export const RequestPasswordResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RequestPasswordReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RequestPasswordResetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"requestPasswordReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const GetTriggersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTriggers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"triggers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"attachType"}},{"kind":"Field","name":{"kind":"Name","value":"numArgs"}},{"kind":"Field","name":{"kind":"Name","value":"argList"}},{"kind":"Field","name":{"kind":"Name","value":"commands"}},{"kind":"Field","name":{"kind":"Name","value":"variables"}},{"kind":"Field","name":{"kind":"Name","value":"mobId"}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetTriggersQuery, GetTriggersQueryVariables>;
export const GetTriggersByAttachmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTriggersByAttachment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"attachType"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ScriptType"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"entityId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"triggersByAttachment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"attachType"},"value":{"kind":"Variable","name":{"kind":"Name","value":"attachType"}}},{"kind":"Argument","name":{"kind":"Name","value":"entityId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"entityId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"attachType"}},{"kind":"Field","name":{"kind":"Name","value":"numArgs"}},{"kind":"Field","name":{"kind":"Name","value":"argList"}},{"kind":"Field","name":{"kind":"Name","value":"commands"}},{"kind":"Field","name":{"kind":"Name","value":"variables"}},{"kind":"Field","name":{"kind":"Name","value":"mobId"}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetTriggersByAttachmentQuery, GetTriggersByAttachmentQueryVariables>;
export const CreateTriggerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTrigger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTriggerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTrigger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"attachType"}},{"kind":"Field","name":{"kind":"Name","value":"commands"}},{"kind":"Field","name":{"kind":"Name","value":"variables"}}]}}]}}]} as unknown as DocumentNode<CreateTriggerMutation, CreateTriggerMutationVariables>;
export const UpdateTriggerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTrigger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTriggerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTrigger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"attachType"}},{"kind":"Field","name":{"kind":"Name","value":"commands"}},{"kind":"Field","name":{"kind":"Name","value":"variables"}}]}}]}}]} as unknown as DocumentNode<UpdateTriggerMutation, UpdateTriggerMutationVariables>;
export const DeleteTriggerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteTrigger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteTrigger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteTriggerMutation, DeleteTriggerMutationVariables>;
export const AttachTriggerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AttachTrigger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AttachTriggerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attachTrigger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"mobId"}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}}]}}]}}]} as unknown as DocumentNode<AttachTriggerMutation, AttachTriggerMutationVariables>;
export const DetachTriggerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DetachTrigger"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"triggerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Float"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"detachTrigger"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"triggerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"triggerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<DetachTriggerMutation, DetachTriggerMutationVariables>;
export const GetZonesForSelectorDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetZonesForSelector"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"zones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<GetZonesForSelectorQuery, GetZonesForSelectorQueryVariables>;
export const CreateCharacterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCharacter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCharacterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCharacter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"raceType"}},{"kind":"Field","name":{"kind":"Name","value":"playerClass"}},{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"intelligence"}},{"kind":"Field","name":{"kind":"Name","value":"wisdom"}},{"kind":"Field","name":{"kind":"Name","value":"dexterity"}},{"kind":"Field","name":{"kind":"Name","value":"constitution"}},{"kind":"Field","name":{"kind":"Name","value":"charisma"}},{"kind":"Field","name":{"kind":"Name","value":"luck"}}]}}]}}]} as unknown as DocumentNode<CreateCharacterMutation, CreateCharacterMutationVariables>;
export const GetCharacterDetailsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacterDetails"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"character"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"raceType"}},{"kind":"Field","name":{"kind":"Name","value":"playerClass"}},{"kind":"Field","name":{"kind":"Name","value":"lastLogin"}},{"kind":"Field","name":{"kind":"Name","value":"isOnline"}},{"kind":"Field","name":{"kind":"Name","value":"timePlayed"}},{"kind":"Field","name":{"kind":"Name","value":"hitPoints"}},{"kind":"Field","name":{"kind":"Name","value":"hitPointsMax"}},{"kind":"Field","name":{"kind":"Name","value":"movement"}},{"kind":"Field","name":{"kind":"Name","value":"movementMax"}},{"kind":"Field","name":{"kind":"Name","value":"alignment"}},{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"intelligence"}},{"kind":"Field","name":{"kind":"Name","value":"wisdom"}},{"kind":"Field","name":{"kind":"Name","value":"dexterity"}},{"kind":"Field","name":{"kind":"Name","value":"constitution"}},{"kind":"Field","name":{"kind":"Name","value":"charisma"}},{"kind":"Field","name":{"kind":"Name","value":"luck"}},{"kind":"Field","name":{"kind":"Name","value":"experience"}},{"kind":"Field","name":{"kind":"Name","value":"skillPoints"}},{"kind":"Field","name":{"kind":"Name","value":"copper"}},{"kind":"Field","name":{"kind":"Name","value":"silver"}},{"kind":"Field","name":{"kind":"Name","value":"gold"}},{"kind":"Field","name":{"kind":"Name","value":"platinum"}},{"kind":"Field","name":{"kind":"Name","value":"bankCopper"}},{"kind":"Field","name":{"kind":"Name","value":"bankSilver"}},{"kind":"Field","name":{"kind":"Name","value":"bankGold"}},{"kind":"Field","name":{"kind":"Name","value":"bankPlatinum"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"currentRoom"}},{"kind":"Field","name":{"kind":"Name","value":"saveRoom"}},{"kind":"Field","name":{"kind":"Name","value":"homeRoom"}},{"kind":"Field","name":{"kind":"Name","value":"hunger"}},{"kind":"Field","name":{"kind":"Name","value":"thirst"}},{"kind":"Field","name":{"kind":"Name","value":"hitRoll"}},{"kind":"Field","name":{"kind":"Name","value":"damageRoll"}},{"kind":"Field","name":{"kind":"Name","value":"armorClass"}},{"kind":"Field","name":{"kind":"Name","value":"playerFlags"}},{"kind":"Field","name":{"kind":"Name","value":"effectFlags"}},{"kind":"Field","name":{"kind":"Name","value":"privilegeFlags"}},{"kind":"Field","name":{"kind":"Name","value":"invisLevel"}},{"kind":"Field","name":{"kind":"Name","value":"birthTime"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"equippedLocation"}},{"kind":"Field","name":{"kind":"Name","value":"condition"}},{"kind":"Field","name":{"kind":"Name","value":"charges"}},{"kind":"Field","name":{"kind":"Name","value":"objectPrototype"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"effects"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"effectName"}},{"kind":"Field","name":{"kind":"Name","value":"effectType"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"appliedAt"}},{"kind":"Field","name":{"kind":"Name","value":"expiresAt"}}]}}]}}]}}]} as unknown as DocumentNode<GetCharacterDetailsQuery, GetCharacterDetailsQueryVariables>;
export const GetCharacterSessionInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacterSessionInfo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterSessionInfo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"characterId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isOnline"}},{"kind":"Field","name":{"kind":"Name","value":"lastLogin"}},{"kind":"Field","name":{"kind":"Name","value":"totalTimePlayed"}},{"kind":"Field","name":{"kind":"Name","value":"currentSessionTime"}}]}}]}}]} as unknown as DocumentNode<GetCharacterSessionInfoQuery, GetCharacterSessionInfoQueryVariables>;
export const GetCharacterLinkingInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCharacterLinkingInfo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterLinkingInfo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"characterName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterName"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"race"}},{"kind":"Field","name":{"kind":"Name","value":"class"}},{"kind":"Field","name":{"kind":"Name","value":"lastLogin"}},{"kind":"Field","name":{"kind":"Name","value":"timePlayed"}},{"kind":"Field","name":{"kind":"Name","value":"isOnline"}},{"kind":"Field","name":{"kind":"Name","value":"isLinked"}},{"kind":"Field","name":{"kind":"Name","value":"hasPassword"}}]}}]}}]} as unknown as DocumentNode<GetCharacterLinkingInfoQuery, GetCharacterLinkingInfoQueryVariables>;
export const LinkCharacterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"LinkCharacter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LinkCharacterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"linkCharacter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"raceType"}},{"kind":"Field","name":{"kind":"Name","value":"playerClass"}}]}}]}}]} as unknown as DocumentNode<LinkCharacterMutation, LinkCharacterMutationVariables>;
export const ValidateCharacterPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ValidateCharacterPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"validateCharacterPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"characterName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterName"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}]}]}}]} as unknown as DocumentNode<ValidateCharacterPasswordQuery, ValidateCharacterPasswordQueryVariables>;
export const GetEquipmentSetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEquipmentSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"equipmentSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slot"}},{"kind":"Field","name":{"kind":"Name","value":"probability"}},{"kind":"Field","name":{"kind":"Name","value":"object"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetEquipmentSetsQuery, GetEquipmentSetsQueryVariables>;
export const GetObjectsForEquipmentSetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetObjectsForEquipmentSet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"wearFlags"}}]}}]}}]} as unknown as DocumentNode<GetObjectsForEquipmentSetQuery, GetObjectsForEquipmentSetQueryVariables>;
export const CreateEquipmentSetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEquipmentSet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEquipmentSetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEquipmentSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateEquipmentSetMutation, CreateEquipmentSetMutationVariables>;
export const UpdateEquipmentSetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateEquipmentSet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateEquipmentSetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEquipmentSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateEquipmentSetMutation, UpdateEquipmentSetMutationVariables>;
export const DeleteEquipmentSetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteEquipmentSet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteEquipmentSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteEquipmentSetMutation, DeleteEquipmentSetMutationVariables>;
export const AddEquipmentSetItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddEquipmentSetItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEquipmentSetItemStandaloneInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEquipmentSetItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slot"}},{"kind":"Field","name":{"kind":"Name","value":"probability"}}]}}]}}]} as unknown as DocumentNode<AddEquipmentSetItemMutation, AddEquipmentSetItemMutationVariables>;
export const RemoveEquipmentSetItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveEquipmentSetItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteEquipmentSetItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RemoveEquipmentSetItemMutation, RemoveEquipmentSetItemMutationVariables>;
export const GetMobResetsLegacyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMobResetsLegacy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mobZoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mobResets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"mobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mobId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mobZoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mobZoneId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxInstances"}},{"kind":"Field","name":{"kind":"Name","value":"probability"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"roomZoneId"}},{"kind":"Field","name":{"kind":"Name","value":"mob"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"equipment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxInstances"}},{"kind":"Field","name":{"kind":"Name","value":"probability"}},{"kind":"Field","name":{"kind":"Name","value":"wearLocation"}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectZoneId"}},{"kind":"Field","name":{"kind":"Name","value":"object"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetMobResetsLegacyQuery, GetMobResetsLegacyQueryVariables>;
export const GetObjectsLegacyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetObjectsLegacy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"wearFlags"}}]}}]}}]} as unknown as DocumentNode<GetObjectsLegacyQuery, GetObjectsLegacyQueryVariables>;
export const CreateMobResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMobReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMobResetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMobReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxInstances"}},{"kind":"Field","name":{"kind":"Name","value":"probability"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}}]}}]}}]} as unknown as DocumentNode<CreateMobResetMutation, CreateMobResetMutationVariables>;
export const UpdateMobResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMobReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMobResetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMobReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxInstances"}},{"kind":"Field","name":{"kind":"Name","value":"probability"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}}]}}]}}]} as unknown as DocumentNode<UpdateMobResetMutation, UpdateMobResetMutationVariables>;
export const DeleteMobResetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMobReset"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMobReset"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMobResetMutation, DeleteMobResetMutationVariables>;
export const DeleteMobResetEquipmentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMobResetEquipment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMobResetEquipment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteMobResetEquipmentMutation, DeleteMobResetEquipmentMutationVariables>;
export const GetMobResetsForMobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMobResetsForMob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mobId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"mobZoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mobResets"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"mobId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mobId"}}},{"kind":"Argument","name":{"kind":"Name","value":"mobZoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"mobZoneId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxInstances"}},{"kind":"Field","name":{"kind":"Name","value":"probability"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"roomZoneId"}},{"kind":"Field","name":{"kind":"Name","value":"mob"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"equipment"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"maxInstances"}},{"kind":"Field","name":{"kind":"Name","value":"probability"}},{"kind":"Field","name":{"kind":"Name","value":"wearLocation"}},{"kind":"Field","name":{"kind":"Name","value":"objectId"}},{"kind":"Field","name":{"kind":"Name","value":"objectZoneId"}},{"kind":"Field","name":{"kind":"Name","value":"object"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetMobResetsForMobQuery, GetMobResetsForMobQueryVariables>;
export const GetEquipmentSetsForMobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetEquipmentSetsForMob"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"equipmentSets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slot"}},{"kind":"Field","name":{"kind":"Name","value":"probability"}},{"kind":"Field","name":{"kind":"Name","value":"object"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetEquipmentSetsForMobQuery, GetEquipmentSetsForMobQueryVariables>;
export const GetObjectsForMobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetObjectsForMob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"wearFlags"}}]}}]}}]} as unknown as DocumentNode<GetObjectsForMobQuery, GetObjectsForMobQueryVariables>;
export const CreateEquipmentSetForMobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEquipmentSetForMob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateEquipmentSetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEquipmentSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<CreateEquipmentSetForMobMutation, CreateEquipmentSetForMobMutationVariables>;
export const AddMobEquipmentSetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddMobEquipmentSet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMobEquipmentSetInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMobEquipmentSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"probability"}}]}}]}}]} as unknown as DocumentNode<AddMobEquipmentSetMutation, AddMobEquipmentSetMutationVariables>;
export const RemoveMobEquipmentSetDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveMobEquipmentSet"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMobEquipmentSet"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<RemoveMobEquipmentSetMutation, RemoveMobEquipmentSetMutationVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const UpdateMobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateMob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateMobInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateMob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roomDescription"}},{"kind":"Field","name":{"kind":"Name","value":"examineDescription"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"alignment"}},{"kind":"Field","name":{"kind":"Name","value":"hitRoll"}},{"kind":"Field","name":{"kind":"Name","value":"armorClass"}},{"kind":"Field","name":{"kind":"Name","value":"hpDice"}},{"kind":"Field","name":{"kind":"Name","value":"damageDice"}},{"kind":"Field","name":{"kind":"Name","value":"damageType"}},{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"intelligence"}},{"kind":"Field","name":{"kind":"Name","value":"wisdom"}},{"kind":"Field","name":{"kind":"Name","value":"dexterity"}},{"kind":"Field","name":{"kind":"Name","value":"constitution"}},{"kind":"Field","name":{"kind":"Name","value":"charisma"}},{"kind":"Field","name":{"kind":"Name","value":"perception"}},{"kind":"Field","name":{"kind":"Name","value":"concealment"}},{"kind":"Field","name":{"kind":"Name","value":"race"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"lifeForce"}},{"kind":"Field","name":{"kind":"Name","value":"composition"}},{"kind":"Field","name":{"kind":"Name","value":"mobFlags"}},{"kind":"Field","name":{"kind":"Name","value":"effectFlags"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"stance"}}]}}]}}]} as unknown as DocumentNode<UpdateMobMutation, UpdateMobMutationVariables>;
export const CreateMobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateMob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"data"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateMobInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createMob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"data"},"value":{"kind":"Variable","name":{"kind":"Name","value":"data"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roomDescription"}},{"kind":"Field","name":{"kind":"Name","value":"examineDescription"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"alignment"}},{"kind":"Field","name":{"kind":"Name","value":"hitRoll"}},{"kind":"Field","name":{"kind":"Name","value":"armorClass"}},{"kind":"Field","name":{"kind":"Name","value":"hpDice"}},{"kind":"Field","name":{"kind":"Name","value":"damageDice"}},{"kind":"Field","name":{"kind":"Name","value":"damageType"}},{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"intelligence"}},{"kind":"Field","name":{"kind":"Name","value":"wisdom"}},{"kind":"Field","name":{"kind":"Name","value":"dexterity"}},{"kind":"Field","name":{"kind":"Name","value":"constitution"}},{"kind":"Field","name":{"kind":"Name","value":"charisma"}},{"kind":"Field","name":{"kind":"Name","value":"perception"}},{"kind":"Field","name":{"kind":"Name","value":"concealment"}},{"kind":"Field","name":{"kind":"Name","value":"race"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"lifeForce"}},{"kind":"Field","name":{"kind":"Name","value":"composition"}},{"kind":"Field","name":{"kind":"Name","value":"mobFlags"}},{"kind":"Field","name":{"kind":"Name","value":"effectFlags"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"stance"}}]}}]}}]} as unknown as DocumentNode<CreateMobMutation, CreateMobMutationVariables>;
export const DeleteMobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}},{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}}]}}]}}]} as unknown as DocumentNode<DeleteMobMutation, DeleteMobMutationVariables>;
export const GetMobDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMob"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mob"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roomDescription"}},{"kind":"Field","name":{"kind":"Name","value":"examineDescription"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"alignment"}},{"kind":"Field","name":{"kind":"Name","value":"hitRoll"}},{"kind":"Field","name":{"kind":"Name","value":"armorClass"}},{"kind":"Field","name":{"kind":"Name","value":"hpDice"}},{"kind":"Field","name":{"kind":"Name","value":"damageDice"}},{"kind":"Field","name":{"kind":"Name","value":"damageType"}},{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"intelligence"}},{"kind":"Field","name":{"kind":"Name","value":"wisdom"}},{"kind":"Field","name":{"kind":"Name","value":"dexterity"}},{"kind":"Field","name":{"kind":"Name","value":"constitution"}},{"kind":"Field","name":{"kind":"Name","value":"charisma"}},{"kind":"Field","name":{"kind":"Name","value":"perception"}},{"kind":"Field","name":{"kind":"Name","value":"concealment"}},{"kind":"Field","name":{"kind":"Name","value":"race"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"lifeForce"}},{"kind":"Field","name":{"kind":"Name","value":"composition"}},{"kind":"Field","name":{"kind":"Name","value":"mobFlags"}},{"kind":"Field","name":{"kind":"Name","value":"effectFlags"}},{"kind":"Field","name":{"kind":"Name","value":"position"}},{"kind":"Field","name":{"kind":"Name","value":"stance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetMobQuery, GetMobQueryVariables>;
export const GetMobsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMobs"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"take"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mobs"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"take"},"value":{"kind":"Variable","name":{"kind":"Name","value":"take"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roomDescription"}},{"kind":"Field","name":{"kind":"Name","value":"examineDescription"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"alignment"}},{"kind":"Field","name":{"kind":"Name","value":"race"}},{"kind":"Field","name":{"kind":"Name","value":"hitRoll"}},{"kind":"Field","name":{"kind":"Name","value":"armorClass"}},{"kind":"Field","name":{"kind":"Name","value":"damageType"}},{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"intelligence"}},{"kind":"Field","name":{"kind":"Name","value":"wisdom"}},{"kind":"Field","name":{"kind":"Name","value":"dexterity"}},{"kind":"Field","name":{"kind":"Name","value":"constitution"}},{"kind":"Field","name":{"kind":"Name","value":"charisma"}},{"kind":"Field","name":{"kind":"Name","value":"lifeForce"}},{"kind":"Field","name":{"kind":"Name","value":"hpDice"}},{"kind":"Field","name":{"kind":"Name","value":"damageDice"}},{"kind":"Field","name":{"kind":"Name","value":"mobFlags"}},{"kind":"Field","name":{"kind":"Name","value":"effectFlags"}}]}}]}}]} as unknown as DocumentNode<GetMobsQuery, GetMobsQueryVariables>;
export const GetMobsByZoneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMobsByZone"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mobsByZone"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"zoneId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"zoneId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"zoneId"}},{"kind":"Field","name":{"kind":"Name","value":"keywords"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roomDescription"}},{"kind":"Field","name":{"kind":"Name","value":"examineDescription"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"alignment"}},{"kind":"Field","name":{"kind":"Name","value":"race"}},{"kind":"Field","name":{"kind":"Name","value":"hitRoll"}},{"kind":"Field","name":{"kind":"Name","value":"armorClass"}},{"kind":"Field","name":{"kind":"Name","value":"damageType"}},{"kind":"Field","name":{"kind":"Name","value":"strength"}},{"kind":"Field","name":{"kind":"Name","value":"intelligence"}},{"kind":"Field","name":{"kind":"Name","value":"wisdom"}},{"kind":"Field","name":{"kind":"Name","value":"dexterity"}},{"kind":"Field","name":{"kind":"Name","value":"constitution"}},{"kind":"Field","name":{"kind":"Name","value":"charisma"}},{"kind":"Field","name":{"kind":"Name","value":"wealth"}},{"kind":"Field","name":{"kind":"Name","value":"hpDice"}},{"kind":"Field","name":{"kind":"Name","value":"damageDice"}},{"kind":"Field","name":{"kind":"Name","value":"mobFlags"}},{"kind":"Field","name":{"kind":"Name","value":"effectFlags"}},{"kind":"Field","name":{"kind":"Name","value":"lifeForce"}}]}}]}}]} as unknown as DocumentNode<GetMobsByZoneQuery, GetMobsByZoneQueryVariables>;
export const OnlineCharactersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OnlineCharacters"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"onlineCharacters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"lastLogin"}},{"kind":"Field","name":{"kind":"Name","value":"isOnline"}},{"kind":"Field","name":{"kind":"Name","value":"raceType"}},{"kind":"Field","name":{"kind":"Name","value":"playerClass"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<OnlineCharactersQuery, OnlineCharactersQueryVariables>;
export const MyOnlineCharactersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyOnlineCharacters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOnlineCharacters"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"lastLogin"}},{"kind":"Field","name":{"kind":"Name","value":"isOnline"}},{"kind":"Field","name":{"kind":"Name","value":"raceType"}},{"kind":"Field","name":{"kind":"Name","value":"playerClass"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"username"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<MyOnlineCharactersQuery, MyOnlineCharactersQueryVariables>;
export const CharacterSessionInfoDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CharacterSessionInfo"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characterSessionInfo"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"characterId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"isOnline"}},{"kind":"Field","name":{"kind":"Name","value":"lastLogin"}},{"kind":"Field","name":{"kind":"Name","value":"totalTimePlayed"}},{"kind":"Field","name":{"kind":"Name","value":"currentSessionTime"}}]}}]}}]} as unknown as DocumentNode<CharacterSessionInfoQuery, CharacterSessionInfoQueryVariables>;
export const SetCharacterOnlineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetCharacterOnline"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setCharacterOnline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"characterId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}}}]}]}}]} as unknown as DocumentNode<SetCharacterOnlineMutation, SetCharacterOnlineMutationVariables>;
export const SetCharacterOfflineDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetCharacterOffline"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setCharacterOffline"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"characterId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}}}]}]}}]} as unknown as DocumentNode<SetCharacterOfflineMutation, SetCharacterOfflineMutationVariables>;
export const UpdateCharacterActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCharacterActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCharacterActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"characterId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"characterId"}}}]}]}}]} as unknown as DocumentNode<UpdateCharacterActivityMutation, UpdateCharacterActivityMutationVariables>;
export const MyPermissionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyPermissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myPermissions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"isPlayer"}},{"kind":"Field","name":{"kind":"Name","value":"isImmortal"}},{"kind":"Field","name":{"kind":"Name","value":"isBuilder"}},{"kind":"Field","name":{"kind":"Name","value":"isCoder"}},{"kind":"Field","name":{"kind":"Name","value":"isGod"}},{"kind":"Field","name":{"kind":"Name","value":"canAccessDashboard"}},{"kind":"Field","name":{"kind":"Name","value":"canManageUsers"}},{"kind":"Field","name":{"kind":"Name","value":"canViewValidation"}},{"kind":"Field","name":{"kind":"Name","value":"maxCharacterLevel"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<MyPermissionsQuery, MyPermissionsQueryVariables>;