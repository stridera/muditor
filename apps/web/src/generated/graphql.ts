import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
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

export enum Climate {
  Alpine = 'ALPINE',
  Arctic = 'ARCTIC',
  Arid = 'ARID',
  None = 'NONE',
  Oceanic = 'OCEANIC',
  Semiarid = 'SEMIARID',
  Subarctic = 'SUBARCTIC',
  Subtropical = 'SUBTROPICAL',
  Temperate = 'TEMPERATE',
  Tropical = 'TROPICAL'
}

export enum Composition {
  Air = 'AIR',
  Bone = 'BONE',
  Earth = 'EARTH',
  Ether = 'ETHER',
  Fire = 'FIRE',
  Flesh = 'FLESH',
  Ice = 'ICE',
  Lava = 'LAVA',
  Metal = 'METAL',
  Mist = 'MIST',
  Plant = 'PLANT',
  Stone = 'STONE',
  Water = 'WATER'
}

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
  description: Scalars['String']['input'];
  dexterity?: Scalars['Int']['input'];
  effectFlags?: Array<EffectFlag>;
  gender?: Gender;
  hitRoll?: Scalars['Int']['input'];
  hpDice?: Scalars['String']['input'];
  id: Scalars['Int']['input'];
  intelligence?: Scalars['Int']['input'];
  keywords: Array<Scalars['String']['input']>;
  level?: Scalars['Int']['input'];
  lifeForce?: LifeForce;
  longDesc: Scalars['String']['input'];
  mobFlags?: Array<MobFlag>;
  perception?: Scalars['Int']['input'];
  position?: Position;
  race?: Race;
  shortDesc: Scalars['String']['input'];
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
  description: Scalars['String']['input'];
  effectFlags?: Array<EffectFlag>;
  flags?: Array<ObjectFlag>;
  id: Scalars['Int']['input'];
  keywords: Array<Scalars['String']['input']>;
  level?: Scalars['Int']['input'];
  shortDesc: Scalars['String']['input'];
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
  description: Scalars['String']['input'];
  flags?: Array<RoomFlag>;
  id: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  sector?: Sector;
  zoneId: Scalars['Int']['input'];
};

export type CreateShopInput = {
  buyProfit?: Scalars['Float']['input'];
  doNotBuy?: InputMaybe<Scalars['String']['input']>;
  flags?: Array<ShopFlag>;
  id: Scalars['Int']['input'];
  keeperId?: InputMaybe<Scalars['Int']['input']>;
  messageBuy?: InputMaybe<Scalars['String']['input']>;
  messageSell?: InputMaybe<Scalars['String']['input']>;
  missingCash1?: InputMaybe<Scalars['String']['input']>;
  missingCash2?: InputMaybe<Scalars['String']['input']>;
  noSuchItem1?: InputMaybe<Scalars['String']['input']>;
  noSuchItem2?: InputMaybe<Scalars['String']['input']>;
  sellProfit?: Scalars['Float']['input'];
  temper1?: Scalars['Int']['input'];
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

export enum DamageType {
  Acid = 'ACID',
  Align = 'ALIGN',
  Bite = 'BITE',
  Blast = 'BLAST',
  Bludgeon = 'BLUDGEON',
  Claw = 'CLAW',
  Cold = 'COLD',
  Crush = 'CRUSH',
  Fire = 'FIRE',
  Hit = 'HIT',
  Maul = 'MAUL',
  Pierce = 'PIERCE',
  Poison = 'POISON',
  Pound = 'POUND',
  Punch = 'PUNCH',
  Shock = 'SHOCK',
  Slash = 'SLASH',
  Stab = 'STAB',
  Sting = 'STING',
  Thrash = 'THRASH',
  Whip = 'WHIP'
}

export enum Direction {
  Down = 'DOWN',
  East = 'EAST',
  North = 'NORTH',
  South = 'SOUTH',
  Up = 'UP',
  West = 'WEST'
}

export enum EffectFlag {
  AcidWeapon = 'ACID_WEAPON',
  Animated = 'ANIMATED',
  Aware = 'AWARE',
  Berserk = 'BERSERK',
  Bless = 'BLESS',
  Blind = 'BLIND',
  Blur = 'BLUR',
  Camouflaged = 'CAMOUFLAGED',
  Charm = 'CHARM',
  Coldshield = 'COLDSHIELD',
  Confusion = 'CONFUSION',
  Curse = 'CURSE',
  DetectAlign = 'DETECT_ALIGN',
  DetectInvis = 'DETECT_INVIS',
  DetectMagic = 'DETECT_MAGIC',
  DetectPoison = 'DETECT_POISON',
  Disease = 'DISEASE',
  Displacement = 'DISPLACEMENT',
  Enlarge = 'ENLARGE',
  Exposed = 'EXPOSED',
  Familiarity = 'FAMILIARITY',
  Farsee = 'FARSEE',
  Fear = 'FEAR',
  FeatherFall = 'FEATHER_FALL',
  Fireshield = 'FIRESHIELD',
  FireWeapon = 'FIRE_WEAPON',
  Fly = 'FLY',
  Glory = 'GLORY',
  GreaterDisplacement = 'GREATER_DISPLACEMENT',
  Harness = 'HARNESS',
  Haste = 'HASTE',
  Hex = 'HEX',
  HurtThroat = 'HURT_THROAT',
  IceWeapon = 'ICE_WEAPON',
  Immobilized = 'IMMOBILIZED',
  Infravision = 'INFRAVISION',
  Insanity = 'INSANITY',
  Invisible = 'INVISIBLE',
  Light = 'LIGHT',
  MajorGlobe = 'MAJOR_GLOBE',
  MajorParalysis = 'MAJOR_PARALYSIS',
  Mesmerized = 'MESMERIZED',
  MinorGlobe = 'MINOR_GLOBE',
  MinorParalysis = 'MINOR_PARALYSIS',
  Misdirecting = 'MISDIRECTING',
  Misdirection = 'MISDIRECTION',
  NegateAir = 'NEGATE_AIR',
  NegateCold = 'NEGATE_COLD',
  NegateEarth = 'NEGATE_EARTH',
  NegateHeat = 'NEGATE_HEAT',
  NoTrack = 'NO_TRACK',
  OnFire = 'ON_FIRE',
  Poison = 'POISON',
  PoisonWeapon = 'POISON_WEAPON',
  ProtectAir = 'PROTECT_AIR',
  ProtectCold = 'PROTECT_COLD',
  ProtectEarth = 'PROTECT_EARTH',
  ProtectEvil = 'PROTECT_EVIL',
  ProtectFire = 'PROTECT_FIRE',
  ProtectGood = 'PROTECT_GOOD',
  RadiantWeapon = 'RADIANT_WEAPON',
  RayOfEnfeeblement = 'RAY_OF_ENFEEBLEMENT',
  Reduce = 'REDUCE',
  RemoteAggro = 'REMOTE_AGGRO',
  Sanctuary = 'SANCTUARY',
  SenseLife = 'SENSE_LIFE',
  Shadowing = 'SHADOWING',
  ShockWeapon = 'SHOCK_WEAPON',
  Silence = 'SILENCE',
  Sleep = 'SLEEP',
  Sneak = 'SNEAK',
  SongOfRest = 'SONG_OF_REST',
  Soulshield = 'SOULSHIELD',
  SpiritBear = 'SPIRIT_BEAR',
  SpiritWolf = 'SPIRIT_WOLF',
  Stealth = 'STEALTH',
  StoneSkin = 'STONE_SKIN',
  Tamed = 'TAMED',
  Tongues = 'TONGUES',
  Ultravision = 'ULTRAVISION',
  Unused = 'UNUSED',
  VampiricTouch = 'VAMPIRIC_TOUCH',
  Vitality = 'VITALITY',
  Waterbreath = 'WATERBREATH',
  Waterwalk = 'WATERWALK',
  Wrath = 'WRATH'
}

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

export enum ExitFlag {
  Closed = 'CLOSED',
  Hidden = 'HIDDEN',
  IsDoor = 'IS_DOOR',
  Locked = 'LOCKED',
  Pickproof = 'PICKPROOF'
}

export enum Gender {
  Female = 'FEMALE',
  Male = 'MALE',
  Neutral = 'NEUTRAL',
  NonBinary = 'NON_BINARY'
}

export enum Hemisphere {
  Northeast = 'NORTHEAST',
  Northwest = 'NORTHWEST',
  Southeast = 'SOUTHEAST',
  Southwest = 'SOUTHWEST'
}

export type KeeperDto = {
  __typename?: 'KeeperDto';
  id: Scalars['Int']['output'];
  keywords: Array<Scalars['String']['output']>;
  shortDesc: Scalars['String']['output'];
  zoneId: Scalars['Int']['output'];
};

export enum LifeForce {
  Celestial = 'CELESTIAL',
  Demonic = 'DEMONIC',
  Elemental = 'ELEMENTAL',
  Life = 'LIFE',
  Magic = 'MAGIC',
  Undead = 'UNDEAD'
}

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
  description: Scalars['String']['output'];
  dexterity: Scalars['Int']['output'];
  effectFlags: Array<EffectFlag>;
  gender: Gender;
  hitRoll: Scalars['Int']['output'];
  hpDice: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  intelligence: Scalars['Int']['output'];
  keywords: Array<Scalars['String']['output']>;
  level: Scalars['Int']['output'];
  lifeForce: LifeForce;
  longDesc: Scalars['String']['output'];
  mobFlags: Array<MobFlag>;
  perception: Scalars['Int']['output'];
  position: Position;
  race: Race;
  shortDesc: Scalars['String']['output'];
  size: Size;
  stance: Stance;
  strength: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  wealth: Scalars['Int']['output'];
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

export enum MobFlag {
  Aggressive = 'AGGRESSIVE',
  AggroEvil = 'AGGRO_EVIL',
  AggroGood = 'AGGRO_GOOD',
  AggroNeutral = 'AGGRO_NEUTRAL',
  AntiPaladin = 'ANTI_PALADIN',
  Aquatic = 'AQUATIC',
  Assassin = 'ASSASSIN',
  Aware = 'AWARE',
  Berserker = 'BERSERKER',
  Blur = 'BLUR',
  Cleric = 'CLERIC',
  Conjurer = 'CONJURER',
  Diabolist = 'DIABOLIST',
  Druid = 'DRUID',
  FastTrack = 'FAST_TRACK',
  Haste = 'HASTE',
  HatesSun = 'HATES_SUN',
  Helper = 'HELPER',
  Illusion = 'ILLUSION',
  IsNpc = 'IS_NPC',
  Memory = 'MEMORY',
  Mercenary = 'MERCENARY',
  Monk = 'MONK',
  Mount = 'MOUNT',
  Mountable = 'MOUNTABLE',
  Necromancer = 'NECROMANCER',
  NoBash = 'NO_BASH',
  NoBlind = 'NO_BLIND',
  NoCharm = 'NO_CHARM',
  NoClassAi = 'NO_CLASS_AI',
  NoEqRestrict = 'NO_EQ_RESTRICT',
  NoKill = 'NO_KILL',
  NoPoison = 'NO_POISON',
  NoSilence = 'NO_SILENCE',
  NoSleep = 'NO_SLEEP',
  NoSummon = 'NO_SUMMON',
  NoVicious = 'NO_VICIOUS',
  Paladin = 'PALADIN',
  Peaceful = 'PEACEFUL',
  Peacekeeper = 'PEACEKEEPER',
  PoisonBite = 'POISON_BITE',
  Protector = 'PROTECTOR',
  Ranger = 'RANGER',
  Scavenger = 'SCAVENGER',
  Sentinel = 'SENTINEL',
  Shaman = 'SHAMAN',
  SlowTrack = 'SLOW_TRACK',
  Sorcerer = 'SORCERER',
  Spec = 'SPEC',
  StaySect = 'STAY_SECT',
  StayZone = 'STAY_ZONE',
  SummonedMount = 'SUMMONED_MOUNT',
  Teacher = 'TEACHER',
  Thief = 'THIEF',
  Track = 'TRACK',
  Warrior = 'WARRIOR',
  Wimpy = 'WIMPY'
}

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
  shortDesc: Scalars['String']['output'];
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
  description: Scalars['String']['output'];
  effectFlags: Array<EffectFlag>;
  flags: Array<ObjectFlag>;
  id: Scalars['Int']['output'];
  keywords: Array<Scalars['String']['output']>;
  level: Scalars['Int']['output'];
  shortDesc: Scalars['String']['output'];
  timer: Scalars['Int']['output'];
  type: ObjectType;
  updatedAt: Scalars['DateTime']['output'];
  values: Scalars['JSON']['output'];
  wearFlags: Array<WearFlag>;
  weight: Scalars['Float']['output'];
  zoneId: Scalars['Int']['output'];
};

export enum ObjectFlag {
  AntiAntiPaladin = 'ANTI_ANTI_PALADIN',
  AntiArborean = 'ANTI_ARBOREAN',
  AntiAssassin = 'ANTI_ASSASSIN',
  AntiBard = 'ANTI_BARD',
  AntiBerserker = 'ANTI_BERSERKER',
  AntiCleric = 'ANTI_CLERIC',
  AntiColossal = 'ANTI_COLOSSAL',
  AntiConjurer = 'ANTI_CONJURER',
  AntiCryomancer = 'ANTI_CRYOMANCER',
  AntiDiabolist = 'ANTI_DIABOLIST',
  AntiDruid = 'ANTI_DRUID',
  AntiEvil = 'ANTI_EVIL',
  AntiGargantuan = 'ANTI_GARGANTUAN',
  AntiGiant = 'ANTI_GIANT',
  AntiGood = 'ANTI_GOOD',
  AntiHuge = 'ANTI_HUGE',
  AntiIllusionist = 'ANTI_ILLUSIONIST',
  AntiLarge = 'ANTI_LARGE',
  AntiMedium = 'ANTI_MEDIUM',
  AntiMercenary = 'ANTI_MERCENARY',
  AntiMonk = 'ANTI_MONK',
  AntiMountainous = 'ANTI_MOUNTAINOUS',
  AntiNecromancer = 'ANTI_NECROMANCER',
  AntiNeutral = 'ANTI_NEUTRAL',
  AntiPaladin = 'ANTI_PALADIN',
  AntiPriest = 'ANTI_PRIEST',
  AntiPyromancer = 'ANTI_PYROMANCER',
  AntiRanger = 'ANTI_RANGER',
  AntiRogue = 'ANTI_ROGUE',
  AntiShaman = 'ANTI_SHAMAN',
  AntiSmall = 'ANTI_SMALL',
  AntiSorcerer = 'ANTI_SORCERER',
  AntiThief = 'ANTI_THIEF',
  AntiTiny = 'ANTI_TINY',
  AntiTitanic = 'ANTI_TITANIC',
  AntiWarrior = 'ANTI_WARRIOR',
  Decomposing = 'DECOMPOSING',
  Dwarven = 'DWARVEN',
  Elven = 'ELVEN',
  Float = 'FLOAT',
  Glow = 'GLOW',
  Hum = 'HUM',
  Invisible = 'INVISIBLE',
  Magic = 'MAGIC',
  NoBurn = 'NO_BURN',
  NoDrop = 'NO_DROP',
  NoFall = 'NO_FALL',
  NoInvisible = 'NO_INVISIBLE',
  NoLocate = 'NO_LOCATE',
  NoRent = 'NO_RENT',
  NoSell = 'NO_SELL',
  Permanent = 'PERMANENT',
  WasDisarmed = 'WAS_DISARMED'
}

export type ObjectSummaryDto = {
  __typename?: 'ObjectSummaryDto';
  cost?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  shortDesc: Scalars['String']['output'];
  type: Scalars['String']['output'];
  zoneId: Scalars['Int']['output'];
};

export enum ObjectType {
  Armor = 'ARMOR',
  Board = 'BOARD',
  Boat = 'BOAT',
  Container = 'CONTAINER',
  Drinkcontainer = 'DRINKCONTAINER',
  Fireweapon = 'FIREWEAPON',
  Food = 'FOOD',
  Fountain = 'FOUNTAIN',
  Instrument = 'INSTRUMENT',
  Key = 'KEY',
  Light = 'LIGHT',
  Missile = 'MISSILE',
  Money = 'MONEY',
  Note = 'NOTE',
  Nothing = 'NOTHING',
  Other = 'OTHER',
  Pen = 'PEN',
  Portal = 'PORTAL',
  Potion = 'POTION',
  Rope = 'ROPE',
  Scroll = 'SCROLL',
  Spellbook = 'SPELLBOOK',
  Staff = 'STAFF',
  Touchstone = 'TOUCHSTONE',
  Trap = 'TRAP',
  Trash = 'TRASH',
  Treasure = 'TREASURE',
  Wall = 'WALL',
  Wand = 'WAND',
  Weapon = 'WEAPON',
  Worn = 'WORN'
}

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

export enum Position {
  Flying = 'FLYING',
  Kneeling = 'KNEELING',
  Prone = 'PRONE',
  Sitting = 'SITTING',
  Standing = 'STANDING'
}

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

export enum Race {
  Animal = 'ANIMAL',
  Arborean = 'ARBOREAN',
  Barbarian = 'BARBARIAN',
  Brownie = 'BROWNIE',
  Demon = 'DEMON',
  DragonbornAcid = 'DRAGONBORN_ACID',
  DragonbornFire = 'DRAGONBORN_FIRE',
  DragonbornFrost = 'DRAGONBORN_FROST',
  DragonbornGas = 'DRAGONBORN_GAS',
  DragonbornLightning = 'DRAGONBORN_LIGHTNING',
  DragonAcid = 'DRAGON_ACID',
  DragonFire = 'DRAGON_FIRE',
  DragonFrost = 'DRAGON_FROST',
  DragonGas = 'DRAGON_GAS',
  DragonGeneral = 'DRAGON_GENERAL',
  DragonLightning = 'DRAGON_LIGHTNING',
  Drow = 'DROW',
  Duergar = 'DUERGAR',
  Dwarf = 'DWARF',
  Elf = 'ELF',
  FaerieSeelie = 'FAERIE_SEELIE',
  FaerieUnseelie = 'FAERIE_UNSEELIE',
  Giant = 'GIANT',
  Gnome = 'GNOME',
  Goblin = 'GOBLIN',
  Halfling = 'HALFLING',
  HalfElf = 'HALF_ELF',
  Human = 'HUMAN',
  Humanoid = 'HUMANOID',
  Nymph = 'NYMPH',
  Ogre = 'OGRE',
  Orc = 'ORC',
  Other = 'OTHER',
  Plant = 'PLANT',
  Sverfneblin = 'SVERFNEBLIN',
  Troll = 'TROLL'
}

export type RegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type RequestPasswordResetInput = {
  email: Scalars['String']['input'];
};

export enum ResetMode {
  Empty = 'EMPTY',
  Never = 'NEVER',
  Normal = 'NORMAL'
}

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

export enum RoomFlag {
  AltExit = 'ALT_EXIT',
  AlwaysLit = 'ALWAYS_LIT',
  Arena = 'ARENA',
  Atrium = 'ATRIUM',
  BfsMark = 'BFS_MARK',
  Dark = 'DARK',
  Death = 'DEATH',
  EffectsNext = 'EFFECTS_NEXT',
  FerryDest = 'FERRY_DEST',
  Godroom = 'GODROOM',
  Guildhall = 'GUILDHALL',
  House = 'HOUSE',
  Housecrash = 'HOUSECRASH',
  Indoors = 'INDOORS',
  Isolated = 'ISOLATED',
  Large = 'LARGE',
  Medium = 'MEDIUM',
  MediumLarge = 'MEDIUM_LARGE',
  MediumSmall = 'MEDIUM_SMALL',
  NoMagic = 'NO_MAGIC',
  NoMob = 'NO_MOB',
  NoRecall = 'NO_RECALL',
  NoScan = 'NO_SCAN',
  NoShift = 'NO_SHIFT',
  NoSummon = 'NO_SUMMON',
  NoTrack = 'NO_TRACK',
  NoWell = 'NO_WELL',
  Observatory = 'OBSERVATORY',
  Olc = 'OLC',
  OnePerson = 'ONE_PERSON',
  Peaceful = 'PEACEFUL',
  Private = 'PRIVATE',
  Small = 'SMALL',
  Soundproof = 'SOUNDPROOF',
  Tunnel = 'TUNNEL',
  Underdark = 'UNDERDARK',
  VerySmall = 'VERY_SMALL',
  Worldmap = 'WORLDMAP'
}

export type RoomSummaryDto = {
  __typename?: 'RoomSummaryDto';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  zoneId: Scalars['Int']['output'];
};

export enum ScriptType {
  Mob = 'MOB',
  Object = 'OBJECT',
  World = 'WORLD'
}

export enum Sector {
  Air = 'AIR',
  Airplane = 'AIRPLANE',
  Astralplane = 'ASTRALPLANE',
  Avernus = 'AVERNUS',
  Beach = 'BEACH',
  Cave = 'CAVE',
  City = 'CITY',
  Earthplane = 'EARTHPLANE',
  Etherealplane = 'ETHEREALPLANE',
  Field = 'FIELD',
  Fireplane = 'FIREPLANE',
  Forest = 'FOREST',
  Grasslands = 'GRASSLANDS',
  Hills = 'HILLS',
  Mountain = 'MOUNTAIN',
  Road = 'ROAD',
  Ruins = 'RUINS',
  Shallows = 'SHALLOWS',
  Structure = 'STRUCTURE',
  Swamp = 'SWAMP',
  Underdark = 'UNDERDARK',
  Underwater = 'UNDERWATER',
  Water = 'WATER'
}

export type ShopAcceptDto = {
  __typename?: 'ShopAcceptDto';
  id: Scalars['String']['output'];
  keywords?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type ShopDto = {
  __typename?: 'ShopDto';
  accepts: Array<ShopAcceptDto>;
  buyProfit: Scalars['Float']['output'];
  createdAt: Scalars['DateTime']['output'];
  doNotBuy?: Maybe<Scalars['String']['output']>;
  flags: Array<ShopFlag>;
  hours: Array<ShopHourDto>;
  id: Scalars['Int']['output'];
  items: Array<ShopItemDto>;
  keeper?: Maybe<KeeperDto>;
  keeperId?: Maybe<Scalars['Int']['output']>;
  messageBuy?: Maybe<Scalars['String']['output']>;
  messageSell?: Maybe<Scalars['String']['output']>;
  missingCash1?: Maybe<Scalars['String']['output']>;
  missingCash2?: Maybe<Scalars['String']['output']>;
  noSuchItem1?: Maybe<Scalars['String']['output']>;
  noSuchItem2?: Maybe<Scalars['String']['output']>;
  sellProfit: Scalars['Float']['output'];
  temper1: Scalars['Int']['output'];
  tradesWithFlags: Array<ShopTradesWith>;
  updatedAt: Scalars['DateTime']['output'];
  zoneId: Scalars['Int']['output'];
};

export enum ShopFlag {
  UsesBank = 'USES_BANK',
  WillBankMoney = 'WILL_BANK_MONEY',
  WillFight = 'WILL_FIGHT',
  WillStartFight = 'WILL_START_FIGHT'
}

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

export enum ShopTradesWith {
  Alignment = 'ALIGNMENT',
  Class = 'CLASS',
  Race = 'RACE',
  TradeNocleric = 'TRADE_NOCLERIC',
  TradeNoevil = 'TRADE_NOEVIL',
  TradeNogood = 'TRADE_NOGOOD',
  TradeNoneutral = 'TRADE_NONEUTRAL',
  TradeNothief = 'TRADE_NOTHIEF',
  TradeNowarrior = 'TRADE_NOWARRIOR'
}

export enum Size {
  Colossal = 'COLOSSAL',
  Gargantuan = 'GARGANTUAN',
  Giant = 'GIANT',
  Huge = 'HUGE',
  Large = 'LARGE',
  Medium = 'MEDIUM',
  Mountainous = 'MOUNTAINOUS',
  Small = 'SMALL',
  Tiny = 'TINY',
  Titanic = 'TITANIC'
}

export enum Stance {
  Alert = 'ALERT',
  Dead = 'DEAD',
  Fighting = 'FIGHTING',
  Incapacitated = 'INCAPACITATED',
  Mort = 'MORT',
  Resting = 'RESTING',
  Sleeping = 'SLEEPING',
  Stunned = 'STUNNED'
}

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
  description?: InputMaybe<Scalars['String']['input']>;
  dexterity?: InputMaybe<Scalars['Int']['input']>;
  effectFlags?: InputMaybe<Array<EffectFlag>>;
  gender?: InputMaybe<Gender>;
  hitRoll?: InputMaybe<Scalars['Int']['input']>;
  hpDice?: InputMaybe<Scalars['String']['input']>;
  intelligence?: InputMaybe<Scalars['Int']['input']>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  level?: InputMaybe<Scalars['Int']['input']>;
  lifeForce?: InputMaybe<LifeForce>;
  longDesc?: InputMaybe<Scalars['String']['input']>;
  mobFlags?: InputMaybe<Array<MobFlag>>;
  perception?: InputMaybe<Scalars['Int']['input']>;
  position?: InputMaybe<Position>;
  race?: InputMaybe<Race>;
  shortDesc?: InputMaybe<Scalars['String']['input']>;
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
  description?: InputMaybe<Scalars['String']['input']>;
  effectFlags?: InputMaybe<Array<EffectFlag>>;
  flags?: InputMaybe<Array<ObjectFlag>>;
  keywords?: InputMaybe<Array<Scalars['String']['input']>>;
  level?: InputMaybe<Scalars['Int']['input']>;
  shortDesc?: InputMaybe<Scalars['String']['input']>;
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
  description?: InputMaybe<Scalars['String']['input']>;
  flags?: InputMaybe<Array<RoomFlag>>;
  layoutX?: InputMaybe<Scalars['Int']['input']>;
  layoutY?: InputMaybe<Scalars['Int']['input']>;
  layoutZ?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sector?: InputMaybe<Sector>;
};

export type UpdateRoomPositionInput = {
  layoutX?: InputMaybe<Scalars['Int']['input']>;
  layoutY?: InputMaybe<Scalars['Int']['input']>;
  layoutZ?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateShopInput = {
  buyProfit?: InputMaybe<Scalars['Float']['input']>;
  doNotBuy?: InputMaybe<Scalars['String']['input']>;
  flags?: InputMaybe<Array<ShopFlag>>;
  keeperId?: InputMaybe<Scalars['Int']['input']>;
  messageBuy?: InputMaybe<Scalars['String']['input']>;
  messageSell?: InputMaybe<Scalars['String']['input']>;
  missingCash1?: InputMaybe<Scalars['String']['input']>;
  missingCash2?: InputMaybe<Scalars['String']['input']>;
  noSuchItem1?: InputMaybe<Scalars['String']['input']>;
  noSuchItem2?: InputMaybe<Scalars['String']['input']>;
  sellProfit?: InputMaybe<Scalars['Float']['input']>;
  temper1?: InputMaybe<Scalars['Int']['input']>;
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
export enum UserRole {
  Builder = 'BUILDER',
  Coder = 'CODER',
  God = 'GOD',
  Immortal = 'IMMORTAL',
  Player = 'PLAYER'
}

export type UserSummaryDto = {
  __typename?: 'UserSummaryDto';
  id: Scalars['ID']['output'];
  role: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

/** The category of validation issue */
export enum ValidationCategory {
  Consistency = 'CONSISTENCY',
  Integrity = 'INTEGRITY',
  Quality = 'QUALITY'
}

/** The type of entity being validated */
export enum ValidationEntity {
  Mob = 'MOB',
  Object = 'OBJECT',
  Room = 'ROOM',
  Shop = 'SHOP',
  Zone = 'ZONE'
}

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
export enum ValidationIssueType {
  Error = 'ERROR',
  Info = 'INFO',
  Warning = 'WARNING'
}

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
export enum ValidationSeverity {
  Critical = 'CRITICAL',
  High = 'HIGH',
  Low = 'LOW',
  Medium = 'MEDIUM'
}

export type ValidationSummaryType = {
  __typename?: 'ValidationSummaryType';
  errorCount: Scalars['Int']['output'];
  infoCount: Scalars['Int']['output'];
  totalIssues: Scalars['Int']['output'];
  totalZones: Scalars['Int']['output'];
  warningCount: Scalars['Int']['output'];
  zonesWithIssues: Scalars['Int']['output'];
};

export enum WearFlag {
  About = 'ABOUT',
  Arms = 'ARMS',
  Badge = 'BADGE',
  Belt = 'BELT',
  Body = 'BODY',
  Ear = 'EAR',
  Eyes = 'EYES',
  Face = 'FACE',
  Feet = 'FEET',
  Finger = 'FINGER',
  Hands = 'HANDS',
  Head = 'HEAD',
  Hold = 'HOLD',
  Hover = 'HOVER',
  Legs = 'LEGS',
  Neck = 'NECK',
  Shield = 'SHIELD',
  Take = 'TAKE',
  TwoHandWield = 'TWO_HAND_WIELD',
  Waist = 'WAIST',
  Wield = 'WIELD',
  Wrist = 'WRIST'
}

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

export type GetMobQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
}>;


export type GetMobQuery = { __typename?: 'Query', mob: { __typename?: 'MobDto', id: number, zoneId: number, keywords: Array<string>, shortDesc: string, longDesc: string, description: string, level: number, alignment: number, hitRoll: number, armorClass: number, hpDice: string, damageDice: string, damageType: DamageType, strength: number, intelligence: number, wisdom: number, dexterity: number, constitution: number, charisma: number, perception: number, concealment: number, race: Race, position: Position, gender: Gender, size: Size, lifeForce: LifeForce, composition: Composition, stance: Stance, createdAt: any, updatedAt: any } };

export type UpdateMobMutationVariables = Exact<{
  zoneId: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  data: UpdateMobInput;
}>;


export type UpdateMobMutation = { __typename?: 'Mutation', updateMob: { __typename?: 'MobDto', id: number, keywords: Array<string>, shortDesc: string, longDesc: string, description: string } };

export type CreateMobMutationVariables = Exact<{
  data: CreateMobInput;
}>;


export type CreateMobMutation = { __typename?: 'Mutation', createMob: { __typename?: 'MobDto', id: number, keywords: Array<string>, shortDesc: string } };

export type GetObjectQueryVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
}>;


export type GetObjectQuery = { __typename?: 'Query', object: { __typename?: 'ObjectDto', id: number, type: ObjectType, keywords: Array<string>, shortDesc: string, description: string, actionDesc?: string | null, weight: number, cost: number, timer: number, decomposeTimer: number, level: number, concealment: number, values: any, zoneId: number, flags: Array<ObjectFlag>, effectFlags: Array<EffectFlag>, wearFlags: Array<WearFlag>, createdAt: any, updatedAt: any } };

export type UpdateObjectMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
  data: UpdateObjectInput;
}>;


export type UpdateObjectMutation = { __typename?: 'Mutation', updateObject: { __typename?: 'ObjectDto', id: number, keywords: Array<string>, shortDesc: string, description: string } };

export type CreateObjectMutationVariables = Exact<{
  data: CreateObjectInput;
}>;


export type CreateObjectMutation = { __typename?: 'Mutation', createObject: { __typename?: 'ObjectDto', id: number, keywords: Array<string>, shortDesc: string } };

export type GetObjectsDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type GetObjectsDashboardQuery = { __typename?: 'Query', objects: Array<{ __typename?: 'ObjectDto', id: number, type: ObjectType, keywords: Array<string>, shortDesc: string, level: number, weight: number, cost: number, zoneId: number, values: any }> };

export type GetObjectsByZoneDashboardQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;


export type GetObjectsByZoneDashboardQuery = { __typename?: 'Query', objectsByZone: Array<{ __typename?: 'ObjectDto', id: number, type: ObjectType, keywords: Array<string>, shortDesc: string, level: number, weight: number, cost: number, zoneId: number, values: any }> };

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


export type GetShopQuery = { __typename?: 'Query', shop: { __typename?: 'ShopDto', id: number, buyProfit: number, sellProfit: number, temper1: number, noSuchItem1?: string | null, noSuchItem2?: string | null, doNotBuy?: string | null, missingCash1?: string | null, missingCash2?: string | null, messageBuy?: string | null, messageSell?: string | null, keeperId?: number | null, zoneId: number, flags: Array<ShopFlag>, tradesWithFlags: Array<ShopTradesWith>, createdAt: any, updatedAt: any, items: Array<{ __typename?: 'ShopItemDto', id: string, amount: number, objectId: number, object?: { __typename?: 'ObjectSummaryDto', id: number, shortDesc: string, type: string, cost?: number | null } | null }>, accepts: Array<{ __typename?: 'ShopAcceptDto', id: string, type: string, keywords?: string | null }>, hours: Array<{ __typename?: 'ShopHourDto', id: string, open: number, close: number }> } };

export type GetAvailableObjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAvailableObjectsQuery = { __typename?: 'Query', objects: Array<{ __typename?: 'ObjectDto', id: number, keywords: Array<string>, shortDesc: string, type: ObjectType, cost: number, zoneId: number }> };

export type GetAvailableMobsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAvailableMobsQuery = { __typename?: 'Query', mobs: Array<{ __typename?: 'MobDto', id: number, keywords: Array<string>, shortDesc: string, zoneId: number }> };

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


export type GetShopsQuery = { __typename?: 'Query', shops: Array<{ __typename?: 'ShopDto', id: number, buyProfit: number, sellProfit: number, temper1: number, flags: Array<ShopFlag>, tradesWithFlags: Array<ShopTradesWith>, noSuchItem1?: string | null, noSuchItem2?: string | null, doNotBuy?: string | null, missingCash1?: string | null, missingCash2?: string | null, messageBuy?: string | null, messageSell?: string | null, keeperId?: number | null, zoneId: number, createdAt: any, updatedAt: any, keeper?: { __typename?: 'KeeperDto', id: number, zoneId: number, shortDesc: string, keywords: Array<string> } | null, items: Array<{ __typename?: 'ShopItemDto', id: string, amount: number, objectId: number, object?: { __typename?: 'ObjectSummaryDto', id: number, zoneId: number, shortDesc: string, type: string, cost?: number | null } | null }>, accepts: Array<{ __typename?: 'ShopAcceptDto', id: string, type: string, keywords?: string | null }> }> };

export type GetShopsByZoneQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;


export type GetShopsByZoneQuery = { __typename?: 'Query', shopsByZone: Array<{ __typename?: 'ShopDto', id: number, buyProfit: number, sellProfit: number, temper1: number, flags: Array<ShopFlag>, tradesWithFlags: Array<ShopTradesWith>, noSuchItem1?: string | null, noSuchItem2?: string | null, doNotBuy?: string | null, missingCash1?: string | null, missingCash2?: string | null, messageBuy?: string | null, messageSell?: string | null, keeperId?: number | null, zoneId: number, createdAt: any, updatedAt: any, keeper?: { __typename?: 'KeeperDto', id: number, zoneId: number, shortDesc: string, keywords: Array<string> } | null, items: Array<{ __typename?: 'ShopItemDto', id: string, amount: number, objectId: number, object?: { __typename?: 'ObjectSummaryDto', id: number, zoneId: number, shortDesc: string, type: string, cost?: number | null } | null }>, accepts: Array<{ __typename?: 'ShopAcceptDto', id: string, type: string, keywords?: string | null }> }> };

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


export type GetRoomsByZoneQuery = { __typename?: 'Query', roomsByZone: Array<{ __typename?: 'RoomDto', id: number, name: string, description: string, layoutX?: number | null, layoutY?: number | null, layoutZ?: number | null, exits: Array<{ __typename?: 'RoomExitDto', direction: Direction, destination?: number | null }> }> };

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


export type GetCharacterDetailsQuery = { __typename?: 'Query', character: { __typename?: 'CharacterDto', id: string, name: string, level: number, raceType?: string | null, playerClass?: string | null, lastLogin?: any | null, isOnline: boolean, timePlayed: number, hitPoints: number, hitPointsMax: number, movement: number, movementMax: number, alignment: number, strength: number, intelligence: number, wisdom: number, dexterity: number, constitution: number, charisma: number, luck: number, experience: number, skillPoints: number, copper: number, silver: number, gold: number, platinum: number, bankCopper: number, bankSilver: number, bankGold: number, bankPlatinum: number, description?: string | null, title?: string | null, currentRoom?: number | null, saveRoom?: number | null, homeRoom?: number | null, hunger: number, thirst: number, hitRoll: number, damageRoll: number, armorClass: number, playerFlags: Array<string>, effectFlags: Array<string>, privilegeFlags: Array<string>, invisLevel: number, birthTime: any, items: Array<{ __typename?: 'CharacterItemDto', id: string, equippedLocation?: string | null, condition: number, charges: number, objectPrototype: { __typename?: 'ObjectSummaryDto', id: number, shortDesc: string, type: string } }>, effects: Array<{ __typename?: 'CharacterEffectDto', id: string, effectName: string, effectType?: string | null, duration?: number | null, strength: number, appliedAt: any, expiresAt?: any | null }> } };

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


export type GetEquipmentSetsQuery = { __typename?: 'Query', equipmentSets: Array<{ __typename?: 'EquipmentSetDto', id: string, name: string, description?: string | null, createdAt: any, updatedAt: any, items: Array<{ __typename?: 'EquipmentSetItemDto', id: string, slot?: string | null, probability: number, object: { __typename?: 'ObjectDto', id: number, shortDesc: string, type: ObjectType, keywords: Array<string> } }> }> };

export type GetObjectsForEquipmentSetQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetObjectsForEquipmentSetQuery = { __typename?: 'Query', objects: Array<{ __typename?: 'ObjectDto', id: number, shortDesc: string, type: ObjectType, keywords: Array<string>, wearFlags: Array<WearFlag> }> };

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


export type GetMobResetsLegacyQuery = { __typename?: 'Query', mobResets: Array<{ __typename?: 'MobResetDto', id: string, maxInstances: number, probability: number, roomId: number, roomZoneId: number, mob?: { __typename?: 'MobSummaryDto', id: number, shortDesc: string } | null, equipment: Array<{ __typename?: 'MobResetEquipmentDto', id: string, maxInstances: number, probability: number, wearLocation?: WearFlag | null, objectId: number, objectZoneId: number, object: { __typename?: 'ObjectSummaryDto', id: number, shortDesc: string, type: string } }> }> };

export type GetObjectsLegacyQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetObjectsLegacyQuery = { __typename?: 'Query', objects: Array<{ __typename?: 'ObjectDto', id: number, shortDesc: string, type: ObjectType, keywords: Array<string>, wearFlags: Array<WearFlag> }> };

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


export type GetMobResetsForMobQuery = { __typename?: 'Query', mobResets: Array<{ __typename?: 'MobResetDto', id: string, maxInstances: number, probability: number, roomId: number, roomZoneId: number, mob?: { __typename?: 'MobSummaryDto', id: number, shortDesc: string } | null, equipment: Array<{ __typename?: 'MobResetEquipmentDto', id: string, maxInstances: number, probability: number, wearLocation?: WearFlag | null, objectId: number, objectZoneId: number, object: { __typename?: 'ObjectSummaryDto', id: number, shortDesc: string, type: string } }> }> };

export type GetEquipmentSetsForMobQueryVariables = Exact<{ [key: string]: never; }>;


export type GetEquipmentSetsForMobQuery = { __typename?: 'Query', equipmentSets: Array<{ __typename?: 'EquipmentSetDto', id: string, name: string, description?: string | null, createdAt: any, items: Array<{ __typename?: 'EquipmentSetItemDto', id: string, slot?: string | null, probability: number, object: { __typename?: 'ObjectDto', id: number, shortDesc: string, type: ObjectType } }> }> };

export type GetObjectsForMobQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetObjectsForMobQuery = { __typename?: 'Query', objects: Array<{ __typename?: 'ObjectDto', id: number, shortDesc: string, type: ObjectType, keywords: Array<string>, wearFlags: Array<WearFlag> }> };

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


export const GetMyCharactersDocument = gql`
    query GetMyCharacters {
  myCharacters {
    id
    name
    level
    raceType
    playerClass
    lastLogin
    isOnline
    timePlayed
    hitPoints
    hitPointsMax
    movement
    movementMax
    alignment
    strength
    intelligence
    wisdom
    dexterity
    constitution
    charisma
    luck
    experience
    copper
    silver
    gold
    platinum
    description
    title
    currentRoom
  }
}
    `;

/**
 * __useGetMyCharactersQuery__
 *
 * To run a query within a React component, call `useGetMyCharactersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMyCharactersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMyCharactersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMyCharactersQuery(baseOptions?: Apollo.QueryHookOptions<GetMyCharactersQuery, GetMyCharactersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMyCharactersQuery, GetMyCharactersQueryVariables>(GetMyCharactersDocument, options);
      }
export function useGetMyCharactersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMyCharactersQuery, GetMyCharactersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMyCharactersQuery, GetMyCharactersQueryVariables>(GetMyCharactersDocument, options);
        }
export function useGetMyCharactersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMyCharactersQuery, GetMyCharactersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMyCharactersQuery, GetMyCharactersQueryVariables>(GetMyCharactersDocument, options);
        }
export type GetMyCharactersQueryHookResult = ReturnType<typeof useGetMyCharactersQuery>;
export type GetMyCharactersLazyQueryHookResult = ReturnType<typeof useGetMyCharactersLazyQuery>;
export type GetMyCharactersSuspenseQueryHookResult = ReturnType<typeof useGetMyCharactersSuspenseQuery>;
export type GetMyCharactersQueryResult = Apollo.QueryResult<GetMyCharactersQuery, GetMyCharactersQueryVariables>;
export const GetMobDocument = gql`
    query GetMob($zoneId: Int!, $id: Int!) {
  mob(zoneId: $zoneId, id: $id) {
    id
    zoneId
    keywords
    shortDesc
    longDesc
    description
    level
    alignment
    hitRoll
    armorClass
    hpDice
    damageDice
    damageType
    strength
    intelligence
    wisdom
    dexterity
    constitution
    charisma
    perception
    concealment
    race
    position
    gender
    size
    lifeForce
    composition
    stance
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetMobQuery__
 *
 * To run a query within a React component, call `useGetMobQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMobQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMobQuery({
 *   variables: {
 *      zoneId: // value for 'zoneId'
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetMobQuery(baseOptions: Apollo.QueryHookOptions<GetMobQuery, GetMobQueryVariables> & ({ variables: GetMobQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMobQuery, GetMobQueryVariables>(GetMobDocument, options);
      }
export function useGetMobLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMobQuery, GetMobQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMobQuery, GetMobQueryVariables>(GetMobDocument, options);
        }
export function useGetMobSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMobQuery, GetMobQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMobQuery, GetMobQueryVariables>(GetMobDocument, options);
        }
export type GetMobQueryHookResult = ReturnType<typeof useGetMobQuery>;
export type GetMobLazyQueryHookResult = ReturnType<typeof useGetMobLazyQuery>;
export type GetMobSuspenseQueryHookResult = ReturnType<typeof useGetMobSuspenseQuery>;
export type GetMobQueryResult = Apollo.QueryResult<GetMobQuery, GetMobQueryVariables>;
export const UpdateMobDocument = gql`
    mutation UpdateMob($zoneId: Int!, $id: Int!, $data: UpdateMobInput!) {
  updateMob(zoneId: $zoneId, id: $id, data: $data) {
    id
    keywords
    shortDesc
    longDesc
    description
  }
}
    `;
export type UpdateMobMutationFn = Apollo.MutationFunction<UpdateMobMutation, UpdateMobMutationVariables>;

/**
 * __useUpdateMobMutation__
 *
 * To run a mutation, you first call `useUpdateMobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMobMutation, { data, loading, error }] = useUpdateMobMutation({
 *   variables: {
 *      zoneId: // value for 'zoneId'
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateMobMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMobMutation, UpdateMobMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMobMutation, UpdateMobMutationVariables>(UpdateMobDocument, options);
      }
export type UpdateMobMutationHookResult = ReturnType<typeof useUpdateMobMutation>;
export type UpdateMobMutationResult = Apollo.MutationResult<UpdateMobMutation>;
export type UpdateMobMutationOptions = Apollo.BaseMutationOptions<UpdateMobMutation, UpdateMobMutationVariables>;
export const CreateMobDocument = gql`
    mutation CreateMob($data: CreateMobInput!) {
  createMob(data: $data) {
    id
    keywords
    shortDesc
  }
}
    `;
export type CreateMobMutationFn = Apollo.MutationFunction<CreateMobMutation, CreateMobMutationVariables>;

/**
 * __useCreateMobMutation__
 *
 * To run a mutation, you first call `useCreateMobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMobMutation, { data, loading, error }] = useCreateMobMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateMobMutation(baseOptions?: Apollo.MutationHookOptions<CreateMobMutation, CreateMobMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateMobMutation, CreateMobMutationVariables>(CreateMobDocument, options);
      }
export type CreateMobMutationHookResult = ReturnType<typeof useCreateMobMutation>;
export type CreateMobMutationResult = Apollo.MutationResult<CreateMobMutation>;
export type CreateMobMutationOptions = Apollo.BaseMutationOptions<CreateMobMutation, CreateMobMutationVariables>;
export const GetObjectDocument = gql`
    query GetObject($id: Int!, $zoneId: Int!) {
  object(id: $id, zoneId: $zoneId) {
    id
    type
    keywords
    shortDesc
    description
    actionDesc
    weight
    cost
    timer
    decomposeTimer
    level
    concealment
    values
    zoneId
    flags
    effectFlags
    wearFlags
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetObjectQuery__
 *
 * To run a query within a React component, call `useGetObjectQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetObjectQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetObjectQuery({
 *   variables: {
 *      id: // value for 'id'
 *      zoneId: // value for 'zoneId'
 *   },
 * });
 */
export function useGetObjectQuery(baseOptions: Apollo.QueryHookOptions<GetObjectQuery, GetObjectQueryVariables> & ({ variables: GetObjectQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetObjectQuery, GetObjectQueryVariables>(GetObjectDocument, options);
      }
export function useGetObjectLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetObjectQuery, GetObjectQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetObjectQuery, GetObjectQueryVariables>(GetObjectDocument, options);
        }
export function useGetObjectSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetObjectQuery, GetObjectQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetObjectQuery, GetObjectQueryVariables>(GetObjectDocument, options);
        }
export type GetObjectQueryHookResult = ReturnType<typeof useGetObjectQuery>;
export type GetObjectLazyQueryHookResult = ReturnType<typeof useGetObjectLazyQuery>;
export type GetObjectSuspenseQueryHookResult = ReturnType<typeof useGetObjectSuspenseQuery>;
export type GetObjectQueryResult = Apollo.QueryResult<GetObjectQuery, GetObjectQueryVariables>;
export const UpdateObjectDocument = gql`
    mutation UpdateObject($id: Int!, $zoneId: Int!, $data: UpdateObjectInput!) {
  updateObject(id: $id, zoneId: $zoneId, data: $data) {
    id
    keywords
    shortDesc
    description
  }
}
    `;
export type UpdateObjectMutationFn = Apollo.MutationFunction<UpdateObjectMutation, UpdateObjectMutationVariables>;

/**
 * __useUpdateObjectMutation__
 *
 * To run a mutation, you first call `useUpdateObjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateObjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateObjectMutation, { data, loading, error }] = useUpdateObjectMutation({
 *   variables: {
 *      id: // value for 'id'
 *      zoneId: // value for 'zoneId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateObjectMutation(baseOptions?: Apollo.MutationHookOptions<UpdateObjectMutation, UpdateObjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateObjectMutation, UpdateObjectMutationVariables>(UpdateObjectDocument, options);
      }
export type UpdateObjectMutationHookResult = ReturnType<typeof useUpdateObjectMutation>;
export type UpdateObjectMutationResult = Apollo.MutationResult<UpdateObjectMutation>;
export type UpdateObjectMutationOptions = Apollo.BaseMutationOptions<UpdateObjectMutation, UpdateObjectMutationVariables>;
export const CreateObjectDocument = gql`
    mutation CreateObject($data: CreateObjectInput!) {
  createObject(data: $data) {
    id
    keywords
    shortDesc
  }
}
    `;
export type CreateObjectMutationFn = Apollo.MutationFunction<CreateObjectMutation, CreateObjectMutationVariables>;

/**
 * __useCreateObjectMutation__
 *
 * To run a mutation, you first call `useCreateObjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateObjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createObjectMutation, { data, loading, error }] = useCreateObjectMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateObjectMutation(baseOptions?: Apollo.MutationHookOptions<CreateObjectMutation, CreateObjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateObjectMutation, CreateObjectMutationVariables>(CreateObjectDocument, options);
      }
export type CreateObjectMutationHookResult = ReturnType<typeof useCreateObjectMutation>;
export type CreateObjectMutationResult = Apollo.MutationResult<CreateObjectMutation>;
export type CreateObjectMutationOptions = Apollo.BaseMutationOptions<CreateObjectMutation, CreateObjectMutationVariables>;
export const GetObjectsDashboardDocument = gql`
    query GetObjectsDashboard {
  objects(take: 100) {
    id
    type
    keywords
    shortDesc
    level
    weight
    cost
    zoneId
    values
  }
}
    `;

/**
 * __useGetObjectsDashboardQuery__
 *
 * To run a query within a React component, call `useGetObjectsDashboardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetObjectsDashboardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetObjectsDashboardQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetObjectsDashboardQuery(baseOptions?: Apollo.QueryHookOptions<GetObjectsDashboardQuery, GetObjectsDashboardQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetObjectsDashboardQuery, GetObjectsDashboardQueryVariables>(GetObjectsDashboardDocument, options);
      }
export function useGetObjectsDashboardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetObjectsDashboardQuery, GetObjectsDashboardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetObjectsDashboardQuery, GetObjectsDashboardQueryVariables>(GetObjectsDashboardDocument, options);
        }
export function useGetObjectsDashboardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetObjectsDashboardQuery, GetObjectsDashboardQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetObjectsDashboardQuery, GetObjectsDashboardQueryVariables>(GetObjectsDashboardDocument, options);
        }
export type GetObjectsDashboardQueryHookResult = ReturnType<typeof useGetObjectsDashboardQuery>;
export type GetObjectsDashboardLazyQueryHookResult = ReturnType<typeof useGetObjectsDashboardLazyQuery>;
export type GetObjectsDashboardSuspenseQueryHookResult = ReturnType<typeof useGetObjectsDashboardSuspenseQuery>;
export type GetObjectsDashboardQueryResult = Apollo.QueryResult<GetObjectsDashboardQuery, GetObjectsDashboardQueryVariables>;
export const GetObjectsByZoneDashboardDocument = gql`
    query GetObjectsByZoneDashboard($zoneId: Int!) {
  objectsByZone(zoneId: $zoneId) {
    id
    type
    keywords
    shortDesc
    level
    weight
    cost
    zoneId
    values
  }
}
    `;

/**
 * __useGetObjectsByZoneDashboardQuery__
 *
 * To run a query within a React component, call `useGetObjectsByZoneDashboardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetObjectsByZoneDashboardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetObjectsByZoneDashboardQuery({
 *   variables: {
 *      zoneId: // value for 'zoneId'
 *   },
 * });
 */
export function useGetObjectsByZoneDashboardQuery(baseOptions: Apollo.QueryHookOptions<GetObjectsByZoneDashboardQuery, GetObjectsByZoneDashboardQueryVariables> & ({ variables: GetObjectsByZoneDashboardQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetObjectsByZoneDashboardQuery, GetObjectsByZoneDashboardQueryVariables>(GetObjectsByZoneDashboardDocument, options);
      }
export function useGetObjectsByZoneDashboardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetObjectsByZoneDashboardQuery, GetObjectsByZoneDashboardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetObjectsByZoneDashboardQuery, GetObjectsByZoneDashboardQueryVariables>(GetObjectsByZoneDashboardDocument, options);
        }
export function useGetObjectsByZoneDashboardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetObjectsByZoneDashboardQuery, GetObjectsByZoneDashboardQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetObjectsByZoneDashboardQuery, GetObjectsByZoneDashboardQueryVariables>(GetObjectsByZoneDashboardDocument, options);
        }
export type GetObjectsByZoneDashboardQueryHookResult = ReturnType<typeof useGetObjectsByZoneDashboardQuery>;
export type GetObjectsByZoneDashboardLazyQueryHookResult = ReturnType<typeof useGetObjectsByZoneDashboardLazyQuery>;
export type GetObjectsByZoneDashboardSuspenseQueryHookResult = ReturnType<typeof useGetObjectsByZoneDashboardSuspenseQuery>;
export type GetObjectsByZoneDashboardQueryResult = Apollo.QueryResult<GetObjectsByZoneDashboardQuery, GetObjectsByZoneDashboardQueryVariables>;
export const DeleteObjectDocument = gql`
    mutation DeleteObject($id: Int!, $zoneId: Int!) {
  deleteObject(id: $id, zoneId: $zoneId) {
    id
  }
}
    `;
export type DeleteObjectMutationFn = Apollo.MutationFunction<DeleteObjectMutation, DeleteObjectMutationVariables>;

/**
 * __useDeleteObjectMutation__
 *
 * To run a mutation, you first call `useDeleteObjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteObjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteObjectMutation, { data, loading, error }] = useDeleteObjectMutation({
 *   variables: {
 *      id: // value for 'id'
 *      zoneId: // value for 'zoneId'
 *   },
 * });
 */
export function useDeleteObjectMutation(baseOptions?: Apollo.MutationHookOptions<DeleteObjectMutation, DeleteObjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteObjectMutation, DeleteObjectMutationVariables>(DeleteObjectDocument, options);
      }
export type DeleteObjectMutationHookResult = ReturnType<typeof useDeleteObjectMutation>;
export type DeleteObjectMutationResult = Apollo.MutationResult<DeleteObjectMutation>;
export type DeleteObjectMutationOptions = Apollo.BaseMutationOptions<DeleteObjectMutation, DeleteObjectMutationVariables>;
export const DeleteObjectsDocument = gql`
    mutation DeleteObjects($ids: [Int!]!) {
  deleteObjects(ids: $ids)
}
    `;
export type DeleteObjectsMutationFn = Apollo.MutationFunction<DeleteObjectsMutation, DeleteObjectsMutationVariables>;

/**
 * __useDeleteObjectsMutation__
 *
 * To run a mutation, you first call `useDeleteObjectsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteObjectsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteObjectsMutation, { data, loading, error }] = useDeleteObjectsMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteObjectsMutation(baseOptions?: Apollo.MutationHookOptions<DeleteObjectsMutation, DeleteObjectsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteObjectsMutation, DeleteObjectsMutationVariables>(DeleteObjectsDocument, options);
      }
export type DeleteObjectsMutationHookResult = ReturnType<typeof useDeleteObjectsMutation>;
export type DeleteObjectsMutationResult = Apollo.MutationResult<DeleteObjectsMutation>;
export type DeleteObjectsMutationOptions = Apollo.BaseMutationOptions<DeleteObjectsMutation, DeleteObjectsMutationVariables>;
export const GetDashboardStatsDocument = gql`
    query GetDashboardStats {
  zonesCount
  roomsCount
  mobsCount
  objectsCount
  shopsCount
}
    `;

/**
 * __useGetDashboardStatsQuery__
 *
 * To run a query within a React component, call `useGetDashboardStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDashboardStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDashboardStatsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetDashboardStatsQuery(baseOptions?: Apollo.QueryHookOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>(GetDashboardStatsDocument, options);
      }
export function useGetDashboardStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>(GetDashboardStatsDocument, options);
        }
export function useGetDashboardStatsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>(GetDashboardStatsDocument, options);
        }
export type GetDashboardStatsQueryHookResult = ReturnType<typeof useGetDashboardStatsQuery>;
export type GetDashboardStatsLazyQueryHookResult = ReturnType<typeof useGetDashboardStatsLazyQuery>;
export type GetDashboardStatsSuspenseQueryHookResult = ReturnType<typeof useGetDashboardStatsSuspenseQuery>;
export type GetDashboardStatsQueryResult = Apollo.QueryResult<GetDashboardStatsQuery, GetDashboardStatsQueryVariables>;
export const GetShopDocument = gql`
    query GetShop($id: Int!, $zoneId: Int!) {
  shop(id: $id, zoneId: $zoneId) {
    id
    buyProfit
    sellProfit
    temper1
    noSuchItem1
    noSuchItem2
    doNotBuy
    missingCash1
    missingCash2
    messageBuy
    messageSell
    keeperId
    zoneId
    flags
    tradesWithFlags
    createdAt
    updatedAt
    items {
      id
      amount
      objectId
      object {
        id
        shortDesc
        type
        cost
      }
    }
    accepts {
      id
      type
      keywords
    }
    hours {
      id
      open
      close
    }
  }
}
    `;

/**
 * __useGetShopQuery__
 *
 * To run a query within a React component, call `useGetShopQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetShopQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetShopQuery({
 *   variables: {
 *      id: // value for 'id'
 *      zoneId: // value for 'zoneId'
 *   },
 * });
 */
export function useGetShopQuery(baseOptions: Apollo.QueryHookOptions<GetShopQuery, GetShopQueryVariables> & ({ variables: GetShopQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetShopQuery, GetShopQueryVariables>(GetShopDocument, options);
      }
export function useGetShopLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetShopQuery, GetShopQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetShopQuery, GetShopQueryVariables>(GetShopDocument, options);
        }
export function useGetShopSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetShopQuery, GetShopQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetShopQuery, GetShopQueryVariables>(GetShopDocument, options);
        }
export type GetShopQueryHookResult = ReturnType<typeof useGetShopQuery>;
export type GetShopLazyQueryHookResult = ReturnType<typeof useGetShopLazyQuery>;
export type GetShopSuspenseQueryHookResult = ReturnType<typeof useGetShopSuspenseQuery>;
export type GetShopQueryResult = Apollo.QueryResult<GetShopQuery, GetShopQueryVariables>;
export const GetAvailableObjectsDocument = gql`
    query GetAvailableObjects {
  objects {
    id
    keywords
    shortDesc
    type
    cost
    zoneId
  }
}
    `;

/**
 * __useGetAvailableObjectsQuery__
 *
 * To run a query within a React component, call `useGetAvailableObjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAvailableObjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAvailableObjectsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAvailableObjectsQuery(baseOptions?: Apollo.QueryHookOptions<GetAvailableObjectsQuery, GetAvailableObjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAvailableObjectsQuery, GetAvailableObjectsQueryVariables>(GetAvailableObjectsDocument, options);
      }
export function useGetAvailableObjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAvailableObjectsQuery, GetAvailableObjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAvailableObjectsQuery, GetAvailableObjectsQueryVariables>(GetAvailableObjectsDocument, options);
        }
export function useGetAvailableObjectsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAvailableObjectsQuery, GetAvailableObjectsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAvailableObjectsQuery, GetAvailableObjectsQueryVariables>(GetAvailableObjectsDocument, options);
        }
export type GetAvailableObjectsQueryHookResult = ReturnType<typeof useGetAvailableObjectsQuery>;
export type GetAvailableObjectsLazyQueryHookResult = ReturnType<typeof useGetAvailableObjectsLazyQuery>;
export type GetAvailableObjectsSuspenseQueryHookResult = ReturnType<typeof useGetAvailableObjectsSuspenseQuery>;
export type GetAvailableObjectsQueryResult = Apollo.QueryResult<GetAvailableObjectsQuery, GetAvailableObjectsQueryVariables>;
export const GetAvailableMobsDocument = gql`
    query GetAvailableMobs {
  mobs {
    id
    keywords
    shortDesc
    zoneId
  }
}
    `;

/**
 * __useGetAvailableMobsQuery__
 *
 * To run a query within a React component, call `useGetAvailableMobsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAvailableMobsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAvailableMobsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAvailableMobsQuery(baseOptions?: Apollo.QueryHookOptions<GetAvailableMobsQuery, GetAvailableMobsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAvailableMobsQuery, GetAvailableMobsQueryVariables>(GetAvailableMobsDocument, options);
      }
export function useGetAvailableMobsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAvailableMobsQuery, GetAvailableMobsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAvailableMobsQuery, GetAvailableMobsQueryVariables>(GetAvailableMobsDocument, options);
        }
export function useGetAvailableMobsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAvailableMobsQuery, GetAvailableMobsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAvailableMobsQuery, GetAvailableMobsQueryVariables>(GetAvailableMobsDocument, options);
        }
export type GetAvailableMobsQueryHookResult = ReturnType<typeof useGetAvailableMobsQuery>;
export type GetAvailableMobsLazyQueryHookResult = ReturnType<typeof useGetAvailableMobsLazyQuery>;
export type GetAvailableMobsSuspenseQueryHookResult = ReturnType<typeof useGetAvailableMobsSuspenseQuery>;
export type GetAvailableMobsQueryResult = Apollo.QueryResult<GetAvailableMobsQuery, GetAvailableMobsQueryVariables>;
export const UpdateShopDocument = gql`
    mutation UpdateShop($id: Int!, $zoneId: Int!, $data: UpdateShopInput!) {
  updateShop(id: $id, zoneId: $zoneId, data: $data) {
    id
    buyProfit
    sellProfit
  }
}
    `;
export type UpdateShopMutationFn = Apollo.MutationFunction<UpdateShopMutation, UpdateShopMutationVariables>;

/**
 * __useUpdateShopMutation__
 *
 * To run a mutation, you first call `useUpdateShopMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateShopMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateShopMutation, { data, loading, error }] = useUpdateShopMutation({
 *   variables: {
 *      id: // value for 'id'
 *      zoneId: // value for 'zoneId'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateShopMutation(baseOptions?: Apollo.MutationHookOptions<UpdateShopMutation, UpdateShopMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateShopMutation, UpdateShopMutationVariables>(UpdateShopDocument, options);
      }
export type UpdateShopMutationHookResult = ReturnType<typeof useUpdateShopMutation>;
export type UpdateShopMutationResult = Apollo.MutationResult<UpdateShopMutation>;
export type UpdateShopMutationOptions = Apollo.BaseMutationOptions<UpdateShopMutation, UpdateShopMutationVariables>;
export const CreateShopDocument = gql`
    mutation CreateShop($data: CreateShopInput!) {
  createShop(data: $data) {
    id
    buyProfit
    sellProfit
  }
}
    `;
export type CreateShopMutationFn = Apollo.MutationFunction<CreateShopMutation, CreateShopMutationVariables>;

/**
 * __useCreateShopMutation__
 *
 * To run a mutation, you first call `useCreateShopMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateShopMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createShopMutation, { data, loading, error }] = useCreateShopMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateShopMutation(baseOptions?: Apollo.MutationHookOptions<CreateShopMutation, CreateShopMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateShopMutation, CreateShopMutationVariables>(CreateShopDocument, options);
      }
export type CreateShopMutationHookResult = ReturnType<typeof useCreateShopMutation>;
export type CreateShopMutationResult = Apollo.MutationResult<CreateShopMutation>;
export type CreateShopMutationOptions = Apollo.BaseMutationOptions<CreateShopMutation, CreateShopMutationVariables>;
export const GetShopsDocument = gql`
    query GetShops {
  shops {
    id
    buyProfit
    sellProfit
    temper1
    flags
    tradesWithFlags
    noSuchItem1
    noSuchItem2
    doNotBuy
    missingCash1
    missingCash2
    messageBuy
    messageSell
    keeperId
    keeper {
      id
      zoneId
      shortDesc
      keywords
    }
    zoneId
    createdAt
    updatedAt
    items {
      id
      amount
      objectId
      object {
        id
        zoneId
        shortDesc
        type
        cost
      }
    }
    accepts {
      id
      type
      keywords
    }
  }
}
    `;

/**
 * __useGetShopsQuery__
 *
 * To run a query within a React component, call `useGetShopsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetShopsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetShopsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetShopsQuery(baseOptions?: Apollo.QueryHookOptions<GetShopsQuery, GetShopsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetShopsQuery, GetShopsQueryVariables>(GetShopsDocument, options);
      }
export function useGetShopsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetShopsQuery, GetShopsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetShopsQuery, GetShopsQueryVariables>(GetShopsDocument, options);
        }
export function useGetShopsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetShopsQuery, GetShopsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetShopsQuery, GetShopsQueryVariables>(GetShopsDocument, options);
        }
export type GetShopsQueryHookResult = ReturnType<typeof useGetShopsQuery>;
export type GetShopsLazyQueryHookResult = ReturnType<typeof useGetShopsLazyQuery>;
export type GetShopsSuspenseQueryHookResult = ReturnType<typeof useGetShopsSuspenseQuery>;
export type GetShopsQueryResult = Apollo.QueryResult<GetShopsQuery, GetShopsQueryVariables>;
export const GetShopsByZoneDocument = gql`
    query GetShopsByZone($zoneId: Int!) {
  shopsByZone(zoneId: $zoneId) {
    id
    buyProfit
    sellProfit
    temper1
    flags
    tradesWithFlags
    noSuchItem1
    noSuchItem2
    doNotBuy
    missingCash1
    missingCash2
    messageBuy
    messageSell
    keeperId
    keeper {
      id
      zoneId
      shortDesc
      keywords
    }
    zoneId
    createdAt
    updatedAt
    items {
      id
      amount
      objectId
      object {
        id
        zoneId
        shortDesc
        type
        cost
      }
    }
    accepts {
      id
      type
      keywords
    }
  }
}
    `;

/**
 * __useGetShopsByZoneQuery__
 *
 * To run a query within a React component, call `useGetShopsByZoneQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetShopsByZoneQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetShopsByZoneQuery({
 *   variables: {
 *      zoneId: // value for 'zoneId'
 *   },
 * });
 */
export function useGetShopsByZoneQuery(baseOptions: Apollo.QueryHookOptions<GetShopsByZoneQuery, GetShopsByZoneQueryVariables> & ({ variables: GetShopsByZoneQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetShopsByZoneQuery, GetShopsByZoneQueryVariables>(GetShopsByZoneDocument, options);
      }
export function useGetShopsByZoneLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetShopsByZoneQuery, GetShopsByZoneQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetShopsByZoneQuery, GetShopsByZoneQueryVariables>(GetShopsByZoneDocument, options);
        }
export function useGetShopsByZoneSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetShopsByZoneQuery, GetShopsByZoneQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetShopsByZoneQuery, GetShopsByZoneQueryVariables>(GetShopsByZoneDocument, options);
        }
export type GetShopsByZoneQueryHookResult = ReturnType<typeof useGetShopsByZoneQuery>;
export type GetShopsByZoneLazyQueryHookResult = ReturnType<typeof useGetShopsByZoneLazyQuery>;
export type GetShopsByZoneSuspenseQueryHookResult = ReturnType<typeof useGetShopsByZoneSuspenseQuery>;
export type GetShopsByZoneQueryResult = Apollo.QueryResult<GetShopsByZoneQuery, GetShopsByZoneQueryVariables>;
export const DeleteShopDocument = gql`
    mutation DeleteShop($id: Int!, $zoneId: Int!) {
  deleteShop(id: $id, zoneId: $zoneId) {
    id
  }
}
    `;
export type DeleteShopMutationFn = Apollo.MutationFunction<DeleteShopMutation, DeleteShopMutationVariables>;

/**
 * __useDeleteShopMutation__
 *
 * To run a mutation, you first call `useDeleteShopMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteShopMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteShopMutation, { data, loading, error }] = useDeleteShopMutation({
 *   variables: {
 *      id: // value for 'id'
 *      zoneId: // value for 'zoneId'
 *   },
 * });
 */
export function useDeleteShopMutation(baseOptions?: Apollo.MutationHookOptions<DeleteShopMutation, DeleteShopMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteShopMutation, DeleteShopMutationVariables>(DeleteShopDocument, options);
      }
export type DeleteShopMutationHookResult = ReturnType<typeof useDeleteShopMutation>;
export type DeleteShopMutationResult = Apollo.MutationResult<DeleteShopMutation>;
export type DeleteShopMutationOptions = Apollo.BaseMutationOptions<DeleteShopMutation, DeleteShopMutationVariables>;
export const UsersDocument = gql`
    query Users {
  users {
    id
    username
    email
    role
    isBanned
    createdAt
    lastLoginAt
    banRecords {
      id
      reason
      bannedAt
      expiresAt
      admin {
        username
      }
    }
  }
}
    `;

/**
 * __useUsersQuery__
 *
 * To run a query within a React component, call `useUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useUsersQuery(baseOptions?: Apollo.QueryHookOptions<UsersQuery, UsersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
      }
export function useUsersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
        }
export function useUsersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<UsersQuery, UsersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<UsersQuery, UsersQueryVariables>(UsersDocument, options);
        }
export type UsersQueryHookResult = ReturnType<typeof useUsersQuery>;
export type UsersLazyQueryHookResult = ReturnType<typeof useUsersLazyQuery>;
export type UsersSuspenseQueryHookResult = ReturnType<typeof useUsersSuspenseQuery>;
export type UsersQueryResult = Apollo.QueryResult<UsersQuery, UsersQueryVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    username
    email
    role
  }
}
    `;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const BanUserDocument = gql`
    mutation BanUser($input: BanUserInput!) {
  banUser(input: $input) {
    id
    reason
    bannedAt
    userId
  }
}
    `;
export type BanUserMutationFn = Apollo.MutationFunction<BanUserMutation, BanUserMutationVariables>;

/**
 * __useBanUserMutation__
 *
 * To run a mutation, you first call `useBanUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBanUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [banUserMutation, { data, loading, error }] = useBanUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBanUserMutation(baseOptions?: Apollo.MutationHookOptions<BanUserMutation, BanUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<BanUserMutation, BanUserMutationVariables>(BanUserDocument, options);
      }
export type BanUserMutationHookResult = ReturnType<typeof useBanUserMutation>;
export type BanUserMutationResult = Apollo.MutationResult<BanUserMutation>;
export type BanUserMutationOptions = Apollo.BaseMutationOptions<BanUserMutation, BanUserMutationVariables>;
export const UnbanUserDocument = gql`
    mutation UnbanUser($input: UnbanUserInput!) {
  unbanUser(input: $input) {
    id
    unbannedAt
    userId
  }
}
    `;
export type UnbanUserMutationFn = Apollo.MutationFunction<UnbanUserMutation, UnbanUserMutationVariables>;

/**
 * __useUnbanUserMutation__
 *
 * To run a mutation, you first call `useUnbanUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnbanUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unbanUserMutation, { data, loading, error }] = useUnbanUserMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUnbanUserMutation(baseOptions?: Apollo.MutationHookOptions<UnbanUserMutation, UnbanUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnbanUserMutation, UnbanUserMutationVariables>(UnbanUserDocument, options);
      }
export type UnbanUserMutationHookResult = ReturnType<typeof useUnbanUserMutation>;
export type UnbanUserMutationResult = Apollo.MutationResult<UnbanUserMutation>;
export type UnbanUserMutationOptions = Apollo.BaseMutationOptions<UnbanUserMutation, UnbanUserMutationVariables>;
export const GetZonesDocument = gql`
    query GetZones {
  zones {
    id
    name
    climate
  }
}
    `;

/**
 * __useGetZonesQuery__
 *
 * To run a query within a React component, call `useGetZonesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetZonesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetZonesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetZonesQuery(baseOptions?: Apollo.QueryHookOptions<GetZonesQuery, GetZonesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetZonesQuery, GetZonesQueryVariables>(GetZonesDocument, options);
      }
export function useGetZonesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetZonesQuery, GetZonesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetZonesQuery, GetZonesQueryVariables>(GetZonesDocument, options);
        }
export function useGetZonesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetZonesQuery, GetZonesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetZonesQuery, GetZonesQueryVariables>(GetZonesDocument, options);
        }
export type GetZonesQueryHookResult = ReturnType<typeof useGetZonesQuery>;
export type GetZonesLazyQueryHookResult = ReturnType<typeof useGetZonesLazyQuery>;
export type GetZonesSuspenseQueryHookResult = ReturnType<typeof useGetZonesSuspenseQuery>;
export type GetZonesQueryResult = Apollo.QueryResult<GetZonesQuery, GetZonesQueryVariables>;
export const GetRoomsByZoneDocument = gql`
    query GetRoomsByZone($zoneId: Int!) {
  roomsByZone(zoneId: $zoneId) {
    id
    name
    description
    layoutX
    layoutY
    layoutZ
    exits {
      direction
      destination
    }
  }
}
    `;

/**
 * __useGetRoomsByZoneQuery__
 *
 * To run a query within a React component, call `useGetRoomsByZoneQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoomsByZoneQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoomsByZoneQuery({
 *   variables: {
 *      zoneId: // value for 'zoneId'
 *   },
 * });
 */
export function useGetRoomsByZoneQuery(baseOptions: Apollo.QueryHookOptions<GetRoomsByZoneQuery, GetRoomsByZoneQueryVariables> & ({ variables: GetRoomsByZoneQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRoomsByZoneQuery, GetRoomsByZoneQueryVariables>(GetRoomsByZoneDocument, options);
      }
export function useGetRoomsByZoneLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRoomsByZoneQuery, GetRoomsByZoneQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRoomsByZoneQuery, GetRoomsByZoneQueryVariables>(GetRoomsByZoneDocument, options);
        }
export function useGetRoomsByZoneSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetRoomsByZoneQuery, GetRoomsByZoneQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetRoomsByZoneQuery, GetRoomsByZoneQueryVariables>(GetRoomsByZoneDocument, options);
        }
export type GetRoomsByZoneQueryHookResult = ReturnType<typeof useGetRoomsByZoneQuery>;
export type GetRoomsByZoneLazyQueryHookResult = ReturnType<typeof useGetRoomsByZoneLazyQuery>;
export type GetRoomsByZoneSuspenseQueryHookResult = ReturnType<typeof useGetRoomsByZoneSuspenseQuery>;
export type GetRoomsByZoneQueryResult = Apollo.QueryResult<GetRoomsByZoneQuery, GetRoomsByZoneQueryVariables>;
export const GetZonesDashboardDocument = gql`
    query GetZonesDashboard {
  zones {
    id
    name
    climate
  }
  roomsCount
}
    `;

/**
 * __useGetZonesDashboardQuery__
 *
 * To run a query within a React component, call `useGetZonesDashboardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetZonesDashboardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetZonesDashboardQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetZonesDashboardQuery(baseOptions?: Apollo.QueryHookOptions<GetZonesDashboardQuery, GetZonesDashboardQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetZonesDashboardQuery, GetZonesDashboardQueryVariables>(GetZonesDashboardDocument, options);
      }
export function useGetZonesDashboardLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetZonesDashboardQuery, GetZonesDashboardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetZonesDashboardQuery, GetZonesDashboardQueryVariables>(GetZonesDashboardDocument, options);
        }
export function useGetZonesDashboardSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetZonesDashboardQuery, GetZonesDashboardQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetZonesDashboardQuery, GetZonesDashboardQueryVariables>(GetZonesDashboardDocument, options);
        }
export type GetZonesDashboardQueryHookResult = ReturnType<typeof useGetZonesDashboardQuery>;
export type GetZonesDashboardLazyQueryHookResult = ReturnType<typeof useGetZonesDashboardLazyQuery>;
export type GetZonesDashboardSuspenseQueryHookResult = ReturnType<typeof useGetZonesDashboardSuspenseQuery>;
export type GetZonesDashboardQueryResult = Apollo.QueryResult<GetZonesDashboardQuery, GetZonesDashboardQueryVariables>;
export const RequestPasswordResetDocument = gql`
    mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
  requestPasswordReset(input: $input) {
    success
    message
  }
}
    `;
export type RequestPasswordResetMutationFn = Apollo.MutationFunction<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;

/**
 * __useRequestPasswordResetMutation__
 *
 * To run a mutation, you first call `useRequestPasswordResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestPasswordResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestPasswordResetMutation, { data, loading, error }] = useRequestPasswordResetMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRequestPasswordResetMutation(baseOptions?: Apollo.MutationHookOptions<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>(RequestPasswordResetDocument, options);
      }
export type RequestPasswordResetMutationHookResult = ReturnType<typeof useRequestPasswordResetMutation>;
export type RequestPasswordResetMutationResult = Apollo.MutationResult<RequestPasswordResetMutation>;
export type RequestPasswordResetMutationOptions = Apollo.BaseMutationOptions<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;
export const ChangePasswordDocument = gql`
    mutation ChangePassword($input: ChangePasswordInput!) {
  changePassword(input: $input) {
    success
    message
  }
}
    `;
export type ChangePasswordMutationFn = Apollo.MutationFunction<ChangePasswordMutation, ChangePasswordMutationVariables>;

/**
 * __useChangePasswordMutation__
 *
 * To run a mutation, you first call `useChangePasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePasswordMutation, { data, loading, error }] = useChangePasswordMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useChangePasswordMutation(baseOptions?: Apollo.MutationHookOptions<ChangePasswordMutation, ChangePasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument, options);
      }
export type ChangePasswordMutationHookResult = ReturnType<typeof useChangePasswordMutation>;
export type ChangePasswordMutationResult = Apollo.MutationResult<ChangePasswordMutation>;
export type ChangePasswordMutationOptions = Apollo.BaseMutationOptions<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const UpdateProfileDocument = gql`
    mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
    username
    email
    role
    createdAt
  }
}
    `;
export type UpdateProfileMutationFn = Apollo.MutationFunction<UpdateProfileMutation, UpdateProfileMutationVariables>;

/**
 * __useUpdateProfileMutation__
 *
 * To run a mutation, you first call `useUpdateProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProfileMutation, { data, loading, error }] = useUpdateProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProfileMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProfileMutation, UpdateProfileMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(UpdateProfileDocument, options);
      }
export type UpdateProfileMutationHookResult = ReturnType<typeof useUpdateProfileMutation>;
export type UpdateProfileMutationResult = Apollo.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions = Apollo.BaseMutationOptions<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const ResetPasswordDocument = gql`
    mutation ResetPassword($input: ResetPasswordInput!) {
  resetPassword(input: $input) {
    success
    message
  }
}
    `;
export type ResetPasswordMutationFn = Apollo.MutationFunction<ResetPasswordMutation, ResetPasswordMutationVariables>;

/**
 * __useResetPasswordMutation__
 *
 * To run a mutation, you first call `useResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordMutation, { data, loading, error }] = useResetPasswordMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useResetPasswordMutation(baseOptions?: Apollo.MutationHookOptions<ResetPasswordMutation, ResetPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(ResetPasswordDocument, options);
      }
export type ResetPasswordMutationHookResult = ReturnType<typeof useResetPasswordMutation>;
export type ResetPasswordMutationResult = Apollo.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = Apollo.BaseMutationOptions<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const GetTriggersDocument = gql`
    query GetTriggers {
  triggers {
    id
    name
    attachType
    numArgs
    argList
    commands
    variables
    mobId
    objectId
    zoneId
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetTriggersQuery__
 *
 * To run a query within a React component, call `useGetTriggersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTriggersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTriggersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTriggersQuery(baseOptions?: Apollo.QueryHookOptions<GetTriggersQuery, GetTriggersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTriggersQuery, GetTriggersQueryVariables>(GetTriggersDocument, options);
      }
export function useGetTriggersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTriggersQuery, GetTriggersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTriggersQuery, GetTriggersQueryVariables>(GetTriggersDocument, options);
        }
export function useGetTriggersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTriggersQuery, GetTriggersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTriggersQuery, GetTriggersQueryVariables>(GetTriggersDocument, options);
        }
export type GetTriggersQueryHookResult = ReturnType<typeof useGetTriggersQuery>;
export type GetTriggersLazyQueryHookResult = ReturnType<typeof useGetTriggersLazyQuery>;
export type GetTriggersSuspenseQueryHookResult = ReturnType<typeof useGetTriggersSuspenseQuery>;
export type GetTriggersQueryResult = Apollo.QueryResult<GetTriggersQuery, GetTriggersQueryVariables>;
export const GetTriggersByAttachmentDocument = gql`
    query GetTriggersByAttachment($attachType: ScriptType!, $entityId: Int!) {
  triggersByAttachment(attachType: $attachType, entityId: $entityId) {
    id
    name
    attachType
    numArgs
    argList
    commands
    variables
    mobId
    objectId
    zoneId
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetTriggersByAttachmentQuery__
 *
 * To run a query within a React component, call `useGetTriggersByAttachmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTriggersByAttachmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTriggersByAttachmentQuery({
 *   variables: {
 *      attachType: // value for 'attachType'
 *      entityId: // value for 'entityId'
 *   },
 * });
 */
export function useGetTriggersByAttachmentQuery(baseOptions: Apollo.QueryHookOptions<GetTriggersByAttachmentQuery, GetTriggersByAttachmentQueryVariables> & ({ variables: GetTriggersByAttachmentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTriggersByAttachmentQuery, GetTriggersByAttachmentQueryVariables>(GetTriggersByAttachmentDocument, options);
      }
export function useGetTriggersByAttachmentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTriggersByAttachmentQuery, GetTriggersByAttachmentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTriggersByAttachmentQuery, GetTriggersByAttachmentQueryVariables>(GetTriggersByAttachmentDocument, options);
        }
export function useGetTriggersByAttachmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTriggersByAttachmentQuery, GetTriggersByAttachmentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTriggersByAttachmentQuery, GetTriggersByAttachmentQueryVariables>(GetTriggersByAttachmentDocument, options);
        }
export type GetTriggersByAttachmentQueryHookResult = ReturnType<typeof useGetTriggersByAttachmentQuery>;
export type GetTriggersByAttachmentLazyQueryHookResult = ReturnType<typeof useGetTriggersByAttachmentLazyQuery>;
export type GetTriggersByAttachmentSuspenseQueryHookResult = ReturnType<typeof useGetTriggersByAttachmentSuspenseQuery>;
export type GetTriggersByAttachmentQueryResult = Apollo.QueryResult<GetTriggersByAttachmentQuery, GetTriggersByAttachmentQueryVariables>;
export const CreateTriggerDocument = gql`
    mutation CreateTrigger($input: CreateTriggerInput!) {
  createTrigger(input: $input) {
    id
    name
    attachType
    commands
    variables
  }
}
    `;
export type CreateTriggerMutationFn = Apollo.MutationFunction<CreateTriggerMutation, CreateTriggerMutationVariables>;

/**
 * __useCreateTriggerMutation__
 *
 * To run a mutation, you first call `useCreateTriggerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTriggerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTriggerMutation, { data, loading, error }] = useCreateTriggerMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTriggerMutation(baseOptions?: Apollo.MutationHookOptions<CreateTriggerMutation, CreateTriggerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTriggerMutation, CreateTriggerMutationVariables>(CreateTriggerDocument, options);
      }
export type CreateTriggerMutationHookResult = ReturnType<typeof useCreateTriggerMutation>;
export type CreateTriggerMutationResult = Apollo.MutationResult<CreateTriggerMutation>;
export type CreateTriggerMutationOptions = Apollo.BaseMutationOptions<CreateTriggerMutation, CreateTriggerMutationVariables>;
export const UpdateTriggerDocument = gql`
    mutation UpdateTrigger($id: Float!, $input: UpdateTriggerInput!) {
  updateTrigger(id: $id, input: $input) {
    id
    name
    attachType
    commands
    variables
  }
}
    `;
export type UpdateTriggerMutationFn = Apollo.MutationFunction<UpdateTriggerMutation, UpdateTriggerMutationVariables>;

/**
 * __useUpdateTriggerMutation__
 *
 * To run a mutation, you first call `useUpdateTriggerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTriggerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTriggerMutation, { data, loading, error }] = useUpdateTriggerMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTriggerMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTriggerMutation, UpdateTriggerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTriggerMutation, UpdateTriggerMutationVariables>(UpdateTriggerDocument, options);
      }
export type UpdateTriggerMutationHookResult = ReturnType<typeof useUpdateTriggerMutation>;
export type UpdateTriggerMutationResult = Apollo.MutationResult<UpdateTriggerMutation>;
export type UpdateTriggerMutationOptions = Apollo.BaseMutationOptions<UpdateTriggerMutation, UpdateTriggerMutationVariables>;
export const DeleteTriggerDocument = gql`
    mutation DeleteTrigger($id: Float!) {
  deleteTrigger(id: $id) {
    id
  }
}
    `;
export type DeleteTriggerMutationFn = Apollo.MutationFunction<DeleteTriggerMutation, DeleteTriggerMutationVariables>;

/**
 * __useDeleteTriggerMutation__
 *
 * To run a mutation, you first call `useDeleteTriggerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTriggerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTriggerMutation, { data, loading, error }] = useDeleteTriggerMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTriggerMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTriggerMutation, DeleteTriggerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTriggerMutation, DeleteTriggerMutationVariables>(DeleteTriggerDocument, options);
      }
export type DeleteTriggerMutationHookResult = ReturnType<typeof useDeleteTriggerMutation>;
export type DeleteTriggerMutationResult = Apollo.MutationResult<DeleteTriggerMutation>;
export type DeleteTriggerMutationOptions = Apollo.BaseMutationOptions<DeleteTriggerMutation, DeleteTriggerMutationVariables>;
export const AttachTriggerDocument = gql`
    mutation AttachTrigger($input: AttachTriggerInput!) {
  attachTrigger(input: $input) {
    id
    name
    mobId
    objectId
    zoneId
  }
}
    `;
export type AttachTriggerMutationFn = Apollo.MutationFunction<AttachTriggerMutation, AttachTriggerMutationVariables>;

/**
 * __useAttachTriggerMutation__
 *
 * To run a mutation, you first call `useAttachTriggerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAttachTriggerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [attachTriggerMutation, { data, loading, error }] = useAttachTriggerMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAttachTriggerMutation(baseOptions?: Apollo.MutationHookOptions<AttachTriggerMutation, AttachTriggerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AttachTriggerMutation, AttachTriggerMutationVariables>(AttachTriggerDocument, options);
      }
export type AttachTriggerMutationHookResult = ReturnType<typeof useAttachTriggerMutation>;
export type AttachTriggerMutationResult = Apollo.MutationResult<AttachTriggerMutation>;
export type AttachTriggerMutationOptions = Apollo.BaseMutationOptions<AttachTriggerMutation, AttachTriggerMutationVariables>;
export const DetachTriggerDocument = gql`
    mutation DetachTrigger($triggerId: Float!) {
  detachTrigger(triggerId: $triggerId) {
    id
    name
  }
}
    `;
export type DetachTriggerMutationFn = Apollo.MutationFunction<DetachTriggerMutation, DetachTriggerMutationVariables>;

/**
 * __useDetachTriggerMutation__
 *
 * To run a mutation, you first call `useDetachTriggerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDetachTriggerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [detachTriggerMutation, { data, loading, error }] = useDetachTriggerMutation({
 *   variables: {
 *      triggerId: // value for 'triggerId'
 *   },
 * });
 */
export function useDetachTriggerMutation(baseOptions?: Apollo.MutationHookOptions<DetachTriggerMutation, DetachTriggerMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DetachTriggerMutation, DetachTriggerMutationVariables>(DetachTriggerDocument, options);
      }
export type DetachTriggerMutationHookResult = ReturnType<typeof useDetachTriggerMutation>;
export type DetachTriggerMutationResult = Apollo.MutationResult<DetachTriggerMutation>;
export type DetachTriggerMutationOptions = Apollo.BaseMutationOptions<DetachTriggerMutation, DetachTriggerMutationVariables>;
export const GetZonesForSelectorDocument = gql`
    query GetZonesForSelector {
  zones {
    id
    name
  }
}
    `;

/**
 * __useGetZonesForSelectorQuery__
 *
 * To run a query within a React component, call `useGetZonesForSelectorQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetZonesForSelectorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetZonesForSelectorQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetZonesForSelectorQuery(baseOptions?: Apollo.QueryHookOptions<GetZonesForSelectorQuery, GetZonesForSelectorQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetZonesForSelectorQuery, GetZonesForSelectorQueryVariables>(GetZonesForSelectorDocument, options);
      }
export function useGetZonesForSelectorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetZonesForSelectorQuery, GetZonesForSelectorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetZonesForSelectorQuery, GetZonesForSelectorQueryVariables>(GetZonesForSelectorDocument, options);
        }
export function useGetZonesForSelectorSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetZonesForSelectorQuery, GetZonesForSelectorQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetZonesForSelectorQuery, GetZonesForSelectorQueryVariables>(GetZonesForSelectorDocument, options);
        }
export type GetZonesForSelectorQueryHookResult = ReturnType<typeof useGetZonesForSelectorQuery>;
export type GetZonesForSelectorLazyQueryHookResult = ReturnType<typeof useGetZonesForSelectorLazyQuery>;
export type GetZonesForSelectorSuspenseQueryHookResult = ReturnType<typeof useGetZonesForSelectorSuspenseQuery>;
export type GetZonesForSelectorQueryResult = Apollo.QueryResult<GetZonesForSelectorQuery, GetZonesForSelectorQueryVariables>;
export const CreateCharacterDocument = gql`
    mutation CreateCharacter($data: CreateCharacterInput!) {
  createCharacter(data: $data) {
    id
    name
    level
    raceType
    playerClass
    strength
    intelligence
    wisdom
    dexterity
    constitution
    charisma
    luck
  }
}
    `;
export type CreateCharacterMutationFn = Apollo.MutationFunction<CreateCharacterMutation, CreateCharacterMutationVariables>;

/**
 * __useCreateCharacterMutation__
 *
 * To run a mutation, you first call `useCreateCharacterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCharacterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCharacterMutation, { data, loading, error }] = useCreateCharacterMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateCharacterMutation(baseOptions?: Apollo.MutationHookOptions<CreateCharacterMutation, CreateCharacterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCharacterMutation, CreateCharacterMutationVariables>(CreateCharacterDocument, options);
      }
export type CreateCharacterMutationHookResult = ReturnType<typeof useCreateCharacterMutation>;
export type CreateCharacterMutationResult = Apollo.MutationResult<CreateCharacterMutation>;
export type CreateCharacterMutationOptions = Apollo.BaseMutationOptions<CreateCharacterMutation, CreateCharacterMutationVariables>;
export const GetCharacterDetailsDocument = gql`
    query GetCharacterDetails($id: ID!) {
  character(id: $id) {
    id
    name
    level
    raceType
    playerClass
    lastLogin
    isOnline
    timePlayed
    hitPoints
    hitPointsMax
    movement
    movementMax
    alignment
    strength
    intelligence
    wisdom
    dexterity
    constitution
    charisma
    luck
    experience
    skillPoints
    copper
    silver
    gold
    platinum
    bankCopper
    bankSilver
    bankGold
    bankPlatinum
    description
    title
    currentRoom
    saveRoom
    homeRoom
    hunger
    thirst
    hitRoll
    damageRoll
    armorClass
    playerFlags
    effectFlags
    privilegeFlags
    invisLevel
    birthTime
    items {
      id
      equippedLocation
      condition
      charges
      objectPrototype {
        id
        shortDesc
        type
      }
    }
    effects {
      id
      effectName
      effectType
      duration
      strength
      appliedAt
      expiresAt
    }
  }
}
    `;

/**
 * __useGetCharacterDetailsQuery__
 *
 * To run a query within a React component, call `useGetCharacterDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCharacterDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCharacterDetailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCharacterDetailsQuery(baseOptions: Apollo.QueryHookOptions<GetCharacterDetailsQuery, GetCharacterDetailsQueryVariables> & ({ variables: GetCharacterDetailsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCharacterDetailsQuery, GetCharacterDetailsQueryVariables>(GetCharacterDetailsDocument, options);
      }
export function useGetCharacterDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCharacterDetailsQuery, GetCharacterDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCharacterDetailsQuery, GetCharacterDetailsQueryVariables>(GetCharacterDetailsDocument, options);
        }
export function useGetCharacterDetailsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCharacterDetailsQuery, GetCharacterDetailsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCharacterDetailsQuery, GetCharacterDetailsQueryVariables>(GetCharacterDetailsDocument, options);
        }
export type GetCharacterDetailsQueryHookResult = ReturnType<typeof useGetCharacterDetailsQuery>;
export type GetCharacterDetailsLazyQueryHookResult = ReturnType<typeof useGetCharacterDetailsLazyQuery>;
export type GetCharacterDetailsSuspenseQueryHookResult = ReturnType<typeof useGetCharacterDetailsSuspenseQuery>;
export type GetCharacterDetailsQueryResult = Apollo.QueryResult<GetCharacterDetailsQuery, GetCharacterDetailsQueryVariables>;
export const GetCharacterSessionInfoDocument = gql`
    query GetCharacterSessionInfo($characterId: ID!) {
  characterSessionInfo(characterId: $characterId) {
    id
    name
    isOnline
    lastLogin
    totalTimePlayed
    currentSessionTime
  }
}
    `;

/**
 * __useGetCharacterSessionInfoQuery__
 *
 * To run a query within a React component, call `useGetCharacterSessionInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCharacterSessionInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCharacterSessionInfoQuery({
 *   variables: {
 *      characterId: // value for 'characterId'
 *   },
 * });
 */
export function useGetCharacterSessionInfoQuery(baseOptions: Apollo.QueryHookOptions<GetCharacterSessionInfoQuery, GetCharacterSessionInfoQueryVariables> & ({ variables: GetCharacterSessionInfoQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCharacterSessionInfoQuery, GetCharacterSessionInfoQueryVariables>(GetCharacterSessionInfoDocument, options);
      }
export function useGetCharacterSessionInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCharacterSessionInfoQuery, GetCharacterSessionInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCharacterSessionInfoQuery, GetCharacterSessionInfoQueryVariables>(GetCharacterSessionInfoDocument, options);
        }
export function useGetCharacterSessionInfoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCharacterSessionInfoQuery, GetCharacterSessionInfoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCharacterSessionInfoQuery, GetCharacterSessionInfoQueryVariables>(GetCharacterSessionInfoDocument, options);
        }
export type GetCharacterSessionInfoQueryHookResult = ReturnType<typeof useGetCharacterSessionInfoQuery>;
export type GetCharacterSessionInfoLazyQueryHookResult = ReturnType<typeof useGetCharacterSessionInfoLazyQuery>;
export type GetCharacterSessionInfoSuspenseQueryHookResult = ReturnType<typeof useGetCharacterSessionInfoSuspenseQuery>;
export type GetCharacterSessionInfoQueryResult = Apollo.QueryResult<GetCharacterSessionInfoQuery, GetCharacterSessionInfoQueryVariables>;
export const GetCharacterLinkingInfoDocument = gql`
    query GetCharacterLinkingInfo($characterName: String!) {
  characterLinkingInfo(characterName: $characterName) {
    id
    name
    level
    race
    class
    lastLogin
    timePlayed
    isOnline
    isLinked
    hasPassword
  }
}
    `;

/**
 * __useGetCharacterLinkingInfoQuery__
 *
 * To run a query within a React component, call `useGetCharacterLinkingInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCharacterLinkingInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCharacterLinkingInfoQuery({
 *   variables: {
 *      characterName: // value for 'characterName'
 *   },
 * });
 */
export function useGetCharacterLinkingInfoQuery(baseOptions: Apollo.QueryHookOptions<GetCharacterLinkingInfoQuery, GetCharacterLinkingInfoQueryVariables> & ({ variables: GetCharacterLinkingInfoQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCharacterLinkingInfoQuery, GetCharacterLinkingInfoQueryVariables>(GetCharacterLinkingInfoDocument, options);
      }
export function useGetCharacterLinkingInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCharacterLinkingInfoQuery, GetCharacterLinkingInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCharacterLinkingInfoQuery, GetCharacterLinkingInfoQueryVariables>(GetCharacterLinkingInfoDocument, options);
        }
export function useGetCharacterLinkingInfoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCharacterLinkingInfoQuery, GetCharacterLinkingInfoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCharacterLinkingInfoQuery, GetCharacterLinkingInfoQueryVariables>(GetCharacterLinkingInfoDocument, options);
        }
export type GetCharacterLinkingInfoQueryHookResult = ReturnType<typeof useGetCharacterLinkingInfoQuery>;
export type GetCharacterLinkingInfoLazyQueryHookResult = ReturnType<typeof useGetCharacterLinkingInfoLazyQuery>;
export type GetCharacterLinkingInfoSuspenseQueryHookResult = ReturnType<typeof useGetCharacterLinkingInfoSuspenseQuery>;
export type GetCharacterLinkingInfoQueryResult = Apollo.QueryResult<GetCharacterLinkingInfoQuery, GetCharacterLinkingInfoQueryVariables>;
export const LinkCharacterDocument = gql`
    mutation LinkCharacter($data: LinkCharacterInput!) {
  linkCharacter(data: $data) {
    id
    name
    level
    raceType
    playerClass
  }
}
    `;
export type LinkCharacterMutationFn = Apollo.MutationFunction<LinkCharacterMutation, LinkCharacterMutationVariables>;

/**
 * __useLinkCharacterMutation__
 *
 * To run a mutation, you first call `useLinkCharacterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLinkCharacterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [linkCharacterMutation, { data, loading, error }] = useLinkCharacterMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useLinkCharacterMutation(baseOptions?: Apollo.MutationHookOptions<LinkCharacterMutation, LinkCharacterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LinkCharacterMutation, LinkCharacterMutationVariables>(LinkCharacterDocument, options);
      }
export type LinkCharacterMutationHookResult = ReturnType<typeof useLinkCharacterMutation>;
export type LinkCharacterMutationResult = Apollo.MutationResult<LinkCharacterMutation>;
export type LinkCharacterMutationOptions = Apollo.BaseMutationOptions<LinkCharacterMutation, LinkCharacterMutationVariables>;
export const ValidateCharacterPasswordDocument = gql`
    query ValidateCharacterPassword($characterName: String!, $password: String!) {
  validateCharacterPassword(characterName: $characterName, password: $password)
}
    `;

/**
 * __useValidateCharacterPasswordQuery__
 *
 * To run a query within a React component, call `useValidateCharacterPasswordQuery` and pass it any options that fit your needs.
 * When your component renders, `useValidateCharacterPasswordQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useValidateCharacterPasswordQuery({
 *   variables: {
 *      characterName: // value for 'characterName'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useValidateCharacterPasswordQuery(baseOptions: Apollo.QueryHookOptions<ValidateCharacterPasswordQuery, ValidateCharacterPasswordQueryVariables> & ({ variables: ValidateCharacterPasswordQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ValidateCharacterPasswordQuery, ValidateCharacterPasswordQueryVariables>(ValidateCharacterPasswordDocument, options);
      }
export function useValidateCharacterPasswordLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ValidateCharacterPasswordQuery, ValidateCharacterPasswordQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ValidateCharacterPasswordQuery, ValidateCharacterPasswordQueryVariables>(ValidateCharacterPasswordDocument, options);
        }
export function useValidateCharacterPasswordSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<ValidateCharacterPasswordQuery, ValidateCharacterPasswordQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<ValidateCharacterPasswordQuery, ValidateCharacterPasswordQueryVariables>(ValidateCharacterPasswordDocument, options);
        }
export type ValidateCharacterPasswordQueryHookResult = ReturnType<typeof useValidateCharacterPasswordQuery>;
export type ValidateCharacterPasswordLazyQueryHookResult = ReturnType<typeof useValidateCharacterPasswordLazyQuery>;
export type ValidateCharacterPasswordSuspenseQueryHookResult = ReturnType<typeof useValidateCharacterPasswordSuspenseQuery>;
export type ValidateCharacterPasswordQueryResult = Apollo.QueryResult<ValidateCharacterPasswordQuery, ValidateCharacterPasswordQueryVariables>;
export const GetEquipmentSetsDocument = gql`
    query GetEquipmentSets {
  equipmentSets {
    id
    name
    description
    createdAt
    updatedAt
    items {
      id
      slot
      probability
      object {
        id
        shortDesc
        type
        keywords
      }
    }
  }
}
    `;

/**
 * __useGetEquipmentSetsQuery__
 *
 * To run a query within a React component, call `useGetEquipmentSetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEquipmentSetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEquipmentSetsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetEquipmentSetsQuery(baseOptions?: Apollo.QueryHookOptions<GetEquipmentSetsQuery, GetEquipmentSetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEquipmentSetsQuery, GetEquipmentSetsQueryVariables>(GetEquipmentSetsDocument, options);
      }
export function useGetEquipmentSetsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEquipmentSetsQuery, GetEquipmentSetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEquipmentSetsQuery, GetEquipmentSetsQueryVariables>(GetEquipmentSetsDocument, options);
        }
export function useGetEquipmentSetsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEquipmentSetsQuery, GetEquipmentSetsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEquipmentSetsQuery, GetEquipmentSetsQueryVariables>(GetEquipmentSetsDocument, options);
        }
export type GetEquipmentSetsQueryHookResult = ReturnType<typeof useGetEquipmentSetsQuery>;
export type GetEquipmentSetsLazyQueryHookResult = ReturnType<typeof useGetEquipmentSetsLazyQuery>;
export type GetEquipmentSetsSuspenseQueryHookResult = ReturnType<typeof useGetEquipmentSetsSuspenseQuery>;
export type GetEquipmentSetsQueryResult = Apollo.QueryResult<GetEquipmentSetsQuery, GetEquipmentSetsQueryVariables>;
export const GetObjectsForEquipmentSetDocument = gql`
    query GetObjectsForEquipmentSet($skip: Int, $take: Int) {
  objects(skip: $skip, take: $take) {
    id
    shortDesc
    type
    keywords
    wearFlags
  }
}
    `;

/**
 * __useGetObjectsForEquipmentSetQuery__
 *
 * To run a query within a React component, call `useGetObjectsForEquipmentSetQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetObjectsForEquipmentSetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetObjectsForEquipmentSetQuery({
 *   variables: {
 *      skip: // value for 'skip'
 *      take: // value for 'take'
 *   },
 * });
 */
export function useGetObjectsForEquipmentSetQuery(baseOptions?: Apollo.QueryHookOptions<GetObjectsForEquipmentSetQuery, GetObjectsForEquipmentSetQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetObjectsForEquipmentSetQuery, GetObjectsForEquipmentSetQueryVariables>(GetObjectsForEquipmentSetDocument, options);
      }
export function useGetObjectsForEquipmentSetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetObjectsForEquipmentSetQuery, GetObjectsForEquipmentSetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetObjectsForEquipmentSetQuery, GetObjectsForEquipmentSetQueryVariables>(GetObjectsForEquipmentSetDocument, options);
        }
export function useGetObjectsForEquipmentSetSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetObjectsForEquipmentSetQuery, GetObjectsForEquipmentSetQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetObjectsForEquipmentSetQuery, GetObjectsForEquipmentSetQueryVariables>(GetObjectsForEquipmentSetDocument, options);
        }
export type GetObjectsForEquipmentSetQueryHookResult = ReturnType<typeof useGetObjectsForEquipmentSetQuery>;
export type GetObjectsForEquipmentSetLazyQueryHookResult = ReturnType<typeof useGetObjectsForEquipmentSetLazyQuery>;
export type GetObjectsForEquipmentSetSuspenseQueryHookResult = ReturnType<typeof useGetObjectsForEquipmentSetSuspenseQuery>;
export type GetObjectsForEquipmentSetQueryResult = Apollo.QueryResult<GetObjectsForEquipmentSetQuery, GetObjectsForEquipmentSetQueryVariables>;
export const CreateEquipmentSetDocument = gql`
    mutation CreateEquipmentSet($data: CreateEquipmentSetInput!) {
  createEquipmentSet(data: $data) {
    id
    name
    description
    createdAt
  }
}
    `;
export type CreateEquipmentSetMutationFn = Apollo.MutationFunction<CreateEquipmentSetMutation, CreateEquipmentSetMutationVariables>;

/**
 * __useCreateEquipmentSetMutation__
 *
 * To run a mutation, you first call `useCreateEquipmentSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEquipmentSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEquipmentSetMutation, { data, loading, error }] = useCreateEquipmentSetMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateEquipmentSetMutation(baseOptions?: Apollo.MutationHookOptions<CreateEquipmentSetMutation, CreateEquipmentSetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateEquipmentSetMutation, CreateEquipmentSetMutationVariables>(CreateEquipmentSetDocument, options);
      }
export type CreateEquipmentSetMutationHookResult = ReturnType<typeof useCreateEquipmentSetMutation>;
export type CreateEquipmentSetMutationResult = Apollo.MutationResult<CreateEquipmentSetMutation>;
export type CreateEquipmentSetMutationOptions = Apollo.BaseMutationOptions<CreateEquipmentSetMutation, CreateEquipmentSetMutationVariables>;
export const UpdateEquipmentSetDocument = gql`
    mutation UpdateEquipmentSet($id: ID!, $data: UpdateEquipmentSetInput!) {
  updateEquipmentSet(id: $id, data: $data) {
    id
    name
    description
    updatedAt
  }
}
    `;
export type UpdateEquipmentSetMutationFn = Apollo.MutationFunction<UpdateEquipmentSetMutation, UpdateEquipmentSetMutationVariables>;

/**
 * __useUpdateEquipmentSetMutation__
 *
 * To run a mutation, you first call `useUpdateEquipmentSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEquipmentSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEquipmentSetMutation, { data, loading, error }] = useUpdateEquipmentSetMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateEquipmentSetMutation(baseOptions?: Apollo.MutationHookOptions<UpdateEquipmentSetMutation, UpdateEquipmentSetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateEquipmentSetMutation, UpdateEquipmentSetMutationVariables>(UpdateEquipmentSetDocument, options);
      }
export type UpdateEquipmentSetMutationHookResult = ReturnType<typeof useUpdateEquipmentSetMutation>;
export type UpdateEquipmentSetMutationResult = Apollo.MutationResult<UpdateEquipmentSetMutation>;
export type UpdateEquipmentSetMutationOptions = Apollo.BaseMutationOptions<UpdateEquipmentSetMutation, UpdateEquipmentSetMutationVariables>;
export const DeleteEquipmentSetDocument = gql`
    mutation DeleteEquipmentSet($id: ID!) {
  deleteEquipmentSet(id: $id)
}
    `;
export type DeleteEquipmentSetMutationFn = Apollo.MutationFunction<DeleteEquipmentSetMutation, DeleteEquipmentSetMutationVariables>;

/**
 * __useDeleteEquipmentSetMutation__
 *
 * To run a mutation, you first call `useDeleteEquipmentSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteEquipmentSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteEquipmentSetMutation, { data, loading, error }] = useDeleteEquipmentSetMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteEquipmentSetMutation(baseOptions?: Apollo.MutationHookOptions<DeleteEquipmentSetMutation, DeleteEquipmentSetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteEquipmentSetMutation, DeleteEquipmentSetMutationVariables>(DeleteEquipmentSetDocument, options);
      }
export type DeleteEquipmentSetMutationHookResult = ReturnType<typeof useDeleteEquipmentSetMutation>;
export type DeleteEquipmentSetMutationResult = Apollo.MutationResult<DeleteEquipmentSetMutation>;
export type DeleteEquipmentSetMutationOptions = Apollo.BaseMutationOptions<DeleteEquipmentSetMutation, DeleteEquipmentSetMutationVariables>;
export const AddEquipmentSetItemDocument = gql`
    mutation AddEquipmentSetItem($data: CreateEquipmentSetItemStandaloneInput!) {
  createEquipmentSetItem(data: $data) {
    id
    slot
    probability
  }
}
    `;
export type AddEquipmentSetItemMutationFn = Apollo.MutationFunction<AddEquipmentSetItemMutation, AddEquipmentSetItemMutationVariables>;

/**
 * __useAddEquipmentSetItemMutation__
 *
 * To run a mutation, you first call `useAddEquipmentSetItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddEquipmentSetItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addEquipmentSetItemMutation, { data, loading, error }] = useAddEquipmentSetItemMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useAddEquipmentSetItemMutation(baseOptions?: Apollo.MutationHookOptions<AddEquipmentSetItemMutation, AddEquipmentSetItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddEquipmentSetItemMutation, AddEquipmentSetItemMutationVariables>(AddEquipmentSetItemDocument, options);
      }
export type AddEquipmentSetItemMutationHookResult = ReturnType<typeof useAddEquipmentSetItemMutation>;
export type AddEquipmentSetItemMutationResult = Apollo.MutationResult<AddEquipmentSetItemMutation>;
export type AddEquipmentSetItemMutationOptions = Apollo.BaseMutationOptions<AddEquipmentSetItemMutation, AddEquipmentSetItemMutationVariables>;
export const RemoveEquipmentSetItemDocument = gql`
    mutation RemoveEquipmentSetItem($id: ID!) {
  deleteEquipmentSetItem(id: $id)
}
    `;
export type RemoveEquipmentSetItemMutationFn = Apollo.MutationFunction<RemoveEquipmentSetItemMutation, RemoveEquipmentSetItemMutationVariables>;

/**
 * __useRemoveEquipmentSetItemMutation__
 *
 * To run a mutation, you first call `useRemoveEquipmentSetItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveEquipmentSetItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeEquipmentSetItemMutation, { data, loading, error }] = useRemoveEquipmentSetItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemoveEquipmentSetItemMutation(baseOptions?: Apollo.MutationHookOptions<RemoveEquipmentSetItemMutation, RemoveEquipmentSetItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveEquipmentSetItemMutation, RemoveEquipmentSetItemMutationVariables>(RemoveEquipmentSetItemDocument, options);
      }
export type RemoveEquipmentSetItemMutationHookResult = ReturnType<typeof useRemoveEquipmentSetItemMutation>;
export type RemoveEquipmentSetItemMutationResult = Apollo.MutationResult<RemoveEquipmentSetItemMutation>;
export type RemoveEquipmentSetItemMutationOptions = Apollo.BaseMutationOptions<RemoveEquipmentSetItemMutation, RemoveEquipmentSetItemMutationVariables>;
export const GetMobResetsLegacyDocument = gql`
    query GetMobResetsLegacy($mobId: Int!, $mobZoneId: Int!) {
  mobResets(mobId: $mobId, mobZoneId: $mobZoneId) {
    id
    maxInstances
    probability
    roomId
    roomZoneId
    mob {
      id
      shortDesc
    }
    equipment {
      id
      maxInstances
      probability
      wearLocation
      objectId
      objectZoneId
      object {
        id
        shortDesc
        type
      }
    }
  }
}
    `;

/**
 * __useGetMobResetsLegacyQuery__
 *
 * To run a query within a React component, call `useGetMobResetsLegacyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMobResetsLegacyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMobResetsLegacyQuery({
 *   variables: {
 *      mobId: // value for 'mobId'
 *      mobZoneId: // value for 'mobZoneId'
 *   },
 * });
 */
export function useGetMobResetsLegacyQuery(baseOptions: Apollo.QueryHookOptions<GetMobResetsLegacyQuery, GetMobResetsLegacyQueryVariables> & ({ variables: GetMobResetsLegacyQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMobResetsLegacyQuery, GetMobResetsLegacyQueryVariables>(GetMobResetsLegacyDocument, options);
      }
export function useGetMobResetsLegacyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMobResetsLegacyQuery, GetMobResetsLegacyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMobResetsLegacyQuery, GetMobResetsLegacyQueryVariables>(GetMobResetsLegacyDocument, options);
        }
export function useGetMobResetsLegacySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMobResetsLegacyQuery, GetMobResetsLegacyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMobResetsLegacyQuery, GetMobResetsLegacyQueryVariables>(GetMobResetsLegacyDocument, options);
        }
export type GetMobResetsLegacyQueryHookResult = ReturnType<typeof useGetMobResetsLegacyQuery>;
export type GetMobResetsLegacyLazyQueryHookResult = ReturnType<typeof useGetMobResetsLegacyLazyQuery>;
export type GetMobResetsLegacySuspenseQueryHookResult = ReturnType<typeof useGetMobResetsLegacySuspenseQuery>;
export type GetMobResetsLegacyQueryResult = Apollo.QueryResult<GetMobResetsLegacyQuery, GetMobResetsLegacyQueryVariables>;
export const GetObjectsLegacyDocument = gql`
    query GetObjectsLegacy($skip: Int, $take: Int) {
  objects(skip: $skip, take: $take) {
    id
    shortDesc
    type
    keywords
    wearFlags
  }
}
    `;

/**
 * __useGetObjectsLegacyQuery__
 *
 * To run a query within a React component, call `useGetObjectsLegacyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetObjectsLegacyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetObjectsLegacyQuery({
 *   variables: {
 *      skip: // value for 'skip'
 *      take: // value for 'take'
 *   },
 * });
 */
export function useGetObjectsLegacyQuery(baseOptions?: Apollo.QueryHookOptions<GetObjectsLegacyQuery, GetObjectsLegacyQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetObjectsLegacyQuery, GetObjectsLegacyQueryVariables>(GetObjectsLegacyDocument, options);
      }
export function useGetObjectsLegacyLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetObjectsLegacyQuery, GetObjectsLegacyQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetObjectsLegacyQuery, GetObjectsLegacyQueryVariables>(GetObjectsLegacyDocument, options);
        }
export function useGetObjectsLegacySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetObjectsLegacyQuery, GetObjectsLegacyQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetObjectsLegacyQuery, GetObjectsLegacyQueryVariables>(GetObjectsLegacyDocument, options);
        }
export type GetObjectsLegacyQueryHookResult = ReturnType<typeof useGetObjectsLegacyQuery>;
export type GetObjectsLegacyLazyQueryHookResult = ReturnType<typeof useGetObjectsLegacyLazyQuery>;
export type GetObjectsLegacySuspenseQueryHookResult = ReturnType<typeof useGetObjectsLegacySuspenseQuery>;
export type GetObjectsLegacyQueryResult = Apollo.QueryResult<GetObjectsLegacyQuery, GetObjectsLegacyQueryVariables>;
export const CreateMobResetDocument = gql`
    mutation CreateMobReset($data: CreateMobResetInput!) {
  createMobReset(data: $data) {
    id
    maxInstances
    probability
    roomId
  }
}
    `;
export type CreateMobResetMutationFn = Apollo.MutationFunction<CreateMobResetMutation, CreateMobResetMutationVariables>;

/**
 * __useCreateMobResetMutation__
 *
 * To run a mutation, you first call `useCreateMobResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateMobResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createMobResetMutation, { data, loading, error }] = useCreateMobResetMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateMobResetMutation(baseOptions?: Apollo.MutationHookOptions<CreateMobResetMutation, CreateMobResetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateMobResetMutation, CreateMobResetMutationVariables>(CreateMobResetDocument, options);
      }
export type CreateMobResetMutationHookResult = ReturnType<typeof useCreateMobResetMutation>;
export type CreateMobResetMutationResult = Apollo.MutationResult<CreateMobResetMutation>;
export type CreateMobResetMutationOptions = Apollo.BaseMutationOptions<CreateMobResetMutation, CreateMobResetMutationVariables>;
export const UpdateMobResetDocument = gql`
    mutation UpdateMobReset($id: ID!, $data: UpdateMobResetInput!) {
  updateMobReset(id: $id, data: $data) {
    id
    maxInstances
    probability
    roomId
  }
}
    `;
export type UpdateMobResetMutationFn = Apollo.MutationFunction<UpdateMobResetMutation, UpdateMobResetMutationVariables>;

/**
 * __useUpdateMobResetMutation__
 *
 * To run a mutation, you first call `useUpdateMobResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMobResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMobResetMutation, { data, loading, error }] = useUpdateMobResetMutation({
 *   variables: {
 *      id: // value for 'id'
 *      data: // value for 'data'
 *   },
 * });
 */
export function useUpdateMobResetMutation(baseOptions?: Apollo.MutationHookOptions<UpdateMobResetMutation, UpdateMobResetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateMobResetMutation, UpdateMobResetMutationVariables>(UpdateMobResetDocument, options);
      }
export type UpdateMobResetMutationHookResult = ReturnType<typeof useUpdateMobResetMutation>;
export type UpdateMobResetMutationResult = Apollo.MutationResult<UpdateMobResetMutation>;
export type UpdateMobResetMutationOptions = Apollo.BaseMutationOptions<UpdateMobResetMutation, UpdateMobResetMutationVariables>;
export const DeleteMobResetDocument = gql`
    mutation DeleteMobReset($id: ID!) {
  deleteMobReset(id: $id)
}
    `;
export type DeleteMobResetMutationFn = Apollo.MutationFunction<DeleteMobResetMutation, DeleteMobResetMutationVariables>;

/**
 * __useDeleteMobResetMutation__
 *
 * To run a mutation, you first call `useDeleteMobResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMobResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMobResetMutation, { data, loading, error }] = useDeleteMobResetMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteMobResetMutation(baseOptions?: Apollo.MutationHookOptions<DeleteMobResetMutation, DeleteMobResetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteMobResetMutation, DeleteMobResetMutationVariables>(DeleteMobResetDocument, options);
      }
export type DeleteMobResetMutationHookResult = ReturnType<typeof useDeleteMobResetMutation>;
export type DeleteMobResetMutationResult = Apollo.MutationResult<DeleteMobResetMutation>;
export type DeleteMobResetMutationOptions = Apollo.BaseMutationOptions<DeleteMobResetMutation, DeleteMobResetMutationVariables>;
export const DeleteMobResetEquipmentDocument = gql`
    mutation DeleteMobResetEquipment($id: ID!) {
  deleteMobResetEquipment(id: $id)
}
    `;
export type DeleteMobResetEquipmentMutationFn = Apollo.MutationFunction<DeleteMobResetEquipmentMutation, DeleteMobResetEquipmentMutationVariables>;

/**
 * __useDeleteMobResetEquipmentMutation__
 *
 * To run a mutation, you first call `useDeleteMobResetEquipmentMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteMobResetEquipmentMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteMobResetEquipmentMutation, { data, loading, error }] = useDeleteMobResetEquipmentMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteMobResetEquipmentMutation(baseOptions?: Apollo.MutationHookOptions<DeleteMobResetEquipmentMutation, DeleteMobResetEquipmentMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteMobResetEquipmentMutation, DeleteMobResetEquipmentMutationVariables>(DeleteMobResetEquipmentDocument, options);
      }
export type DeleteMobResetEquipmentMutationHookResult = ReturnType<typeof useDeleteMobResetEquipmentMutation>;
export type DeleteMobResetEquipmentMutationResult = Apollo.MutationResult<DeleteMobResetEquipmentMutation>;
export type DeleteMobResetEquipmentMutationOptions = Apollo.BaseMutationOptions<DeleteMobResetEquipmentMutation, DeleteMobResetEquipmentMutationVariables>;
export const GetMobResetsForMobDocument = gql`
    query GetMobResetsForMob($mobId: Int!, $mobZoneId: Int!) {
  mobResets(mobId: $mobId, mobZoneId: $mobZoneId) {
    id
    maxInstances
    probability
    roomId
    roomZoneId
    mob {
      id
      shortDesc
    }
    equipment {
      id
      maxInstances
      probability
      wearLocation
      objectId
      objectZoneId
      object {
        id
        shortDesc
        type
      }
    }
  }
}
    `;

/**
 * __useGetMobResetsForMobQuery__
 *
 * To run a query within a React component, call `useGetMobResetsForMobQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMobResetsForMobQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMobResetsForMobQuery({
 *   variables: {
 *      mobId: // value for 'mobId'
 *      mobZoneId: // value for 'mobZoneId'
 *   },
 * });
 */
export function useGetMobResetsForMobQuery(baseOptions: Apollo.QueryHookOptions<GetMobResetsForMobQuery, GetMobResetsForMobQueryVariables> & ({ variables: GetMobResetsForMobQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMobResetsForMobQuery, GetMobResetsForMobQueryVariables>(GetMobResetsForMobDocument, options);
      }
export function useGetMobResetsForMobLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMobResetsForMobQuery, GetMobResetsForMobQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMobResetsForMobQuery, GetMobResetsForMobQueryVariables>(GetMobResetsForMobDocument, options);
        }
export function useGetMobResetsForMobSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMobResetsForMobQuery, GetMobResetsForMobQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMobResetsForMobQuery, GetMobResetsForMobQueryVariables>(GetMobResetsForMobDocument, options);
        }
export type GetMobResetsForMobQueryHookResult = ReturnType<typeof useGetMobResetsForMobQuery>;
export type GetMobResetsForMobLazyQueryHookResult = ReturnType<typeof useGetMobResetsForMobLazyQuery>;
export type GetMobResetsForMobSuspenseQueryHookResult = ReturnType<typeof useGetMobResetsForMobSuspenseQuery>;
export type GetMobResetsForMobQueryResult = Apollo.QueryResult<GetMobResetsForMobQuery, GetMobResetsForMobQueryVariables>;
export const GetEquipmentSetsForMobDocument = gql`
    query GetEquipmentSetsForMob {
  equipmentSets {
    id
    name
    description
    createdAt
    items {
      id
      slot
      probability
      object {
        id
        shortDesc
        type
      }
    }
  }
}
    `;

/**
 * __useGetEquipmentSetsForMobQuery__
 *
 * To run a query within a React component, call `useGetEquipmentSetsForMobQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEquipmentSetsForMobQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEquipmentSetsForMobQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetEquipmentSetsForMobQuery(baseOptions?: Apollo.QueryHookOptions<GetEquipmentSetsForMobQuery, GetEquipmentSetsForMobQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEquipmentSetsForMobQuery, GetEquipmentSetsForMobQueryVariables>(GetEquipmentSetsForMobDocument, options);
      }
export function useGetEquipmentSetsForMobLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEquipmentSetsForMobQuery, GetEquipmentSetsForMobQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEquipmentSetsForMobQuery, GetEquipmentSetsForMobQueryVariables>(GetEquipmentSetsForMobDocument, options);
        }
export function useGetEquipmentSetsForMobSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEquipmentSetsForMobQuery, GetEquipmentSetsForMobQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEquipmentSetsForMobQuery, GetEquipmentSetsForMobQueryVariables>(GetEquipmentSetsForMobDocument, options);
        }
export type GetEquipmentSetsForMobQueryHookResult = ReturnType<typeof useGetEquipmentSetsForMobQuery>;
export type GetEquipmentSetsForMobLazyQueryHookResult = ReturnType<typeof useGetEquipmentSetsForMobLazyQuery>;
export type GetEquipmentSetsForMobSuspenseQueryHookResult = ReturnType<typeof useGetEquipmentSetsForMobSuspenseQuery>;
export type GetEquipmentSetsForMobQueryResult = Apollo.QueryResult<GetEquipmentSetsForMobQuery, GetEquipmentSetsForMobQueryVariables>;
export const GetObjectsForMobDocument = gql`
    query GetObjectsForMob($skip: Int, $take: Int) {
  objects(skip: $skip, take: $take) {
    id
    shortDesc
    type
    keywords
    wearFlags
  }
}
    `;

/**
 * __useGetObjectsForMobQuery__
 *
 * To run a query within a React component, call `useGetObjectsForMobQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetObjectsForMobQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetObjectsForMobQuery({
 *   variables: {
 *      skip: // value for 'skip'
 *      take: // value for 'take'
 *   },
 * });
 */
export function useGetObjectsForMobQuery(baseOptions?: Apollo.QueryHookOptions<GetObjectsForMobQuery, GetObjectsForMobQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetObjectsForMobQuery, GetObjectsForMobQueryVariables>(GetObjectsForMobDocument, options);
      }
export function useGetObjectsForMobLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetObjectsForMobQuery, GetObjectsForMobQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetObjectsForMobQuery, GetObjectsForMobQueryVariables>(GetObjectsForMobDocument, options);
        }
export function useGetObjectsForMobSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetObjectsForMobQuery, GetObjectsForMobQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetObjectsForMobQuery, GetObjectsForMobQueryVariables>(GetObjectsForMobDocument, options);
        }
export type GetObjectsForMobQueryHookResult = ReturnType<typeof useGetObjectsForMobQuery>;
export type GetObjectsForMobLazyQueryHookResult = ReturnType<typeof useGetObjectsForMobLazyQuery>;
export type GetObjectsForMobSuspenseQueryHookResult = ReturnType<typeof useGetObjectsForMobSuspenseQuery>;
export type GetObjectsForMobQueryResult = Apollo.QueryResult<GetObjectsForMobQuery, GetObjectsForMobQueryVariables>;
export const CreateEquipmentSetForMobDocument = gql`
    mutation CreateEquipmentSetForMob($data: CreateEquipmentSetInput!) {
  createEquipmentSet(data: $data) {
    id
    name
    description
  }
}
    `;
export type CreateEquipmentSetForMobMutationFn = Apollo.MutationFunction<CreateEquipmentSetForMobMutation, CreateEquipmentSetForMobMutationVariables>;

/**
 * __useCreateEquipmentSetForMobMutation__
 *
 * To run a mutation, you first call `useCreateEquipmentSetForMobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEquipmentSetForMobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEquipmentSetForMobMutation, { data, loading, error }] = useCreateEquipmentSetForMobMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useCreateEquipmentSetForMobMutation(baseOptions?: Apollo.MutationHookOptions<CreateEquipmentSetForMobMutation, CreateEquipmentSetForMobMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateEquipmentSetForMobMutation, CreateEquipmentSetForMobMutationVariables>(CreateEquipmentSetForMobDocument, options);
      }
export type CreateEquipmentSetForMobMutationHookResult = ReturnType<typeof useCreateEquipmentSetForMobMutation>;
export type CreateEquipmentSetForMobMutationResult = Apollo.MutationResult<CreateEquipmentSetForMobMutation>;
export type CreateEquipmentSetForMobMutationOptions = Apollo.BaseMutationOptions<CreateEquipmentSetForMobMutation, CreateEquipmentSetForMobMutationVariables>;
export const AddMobEquipmentSetDocument = gql`
    mutation AddMobEquipmentSet($data: CreateMobEquipmentSetInput!) {
  createMobEquipmentSet(data: $data) {
    id
    probability
  }
}
    `;
export type AddMobEquipmentSetMutationFn = Apollo.MutationFunction<AddMobEquipmentSetMutation, AddMobEquipmentSetMutationVariables>;

/**
 * __useAddMobEquipmentSetMutation__
 *
 * To run a mutation, you first call `useAddMobEquipmentSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMobEquipmentSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMobEquipmentSetMutation, { data, loading, error }] = useAddMobEquipmentSetMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useAddMobEquipmentSetMutation(baseOptions?: Apollo.MutationHookOptions<AddMobEquipmentSetMutation, AddMobEquipmentSetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddMobEquipmentSetMutation, AddMobEquipmentSetMutationVariables>(AddMobEquipmentSetDocument, options);
      }
export type AddMobEquipmentSetMutationHookResult = ReturnType<typeof useAddMobEquipmentSetMutation>;
export type AddMobEquipmentSetMutationResult = Apollo.MutationResult<AddMobEquipmentSetMutation>;
export type AddMobEquipmentSetMutationOptions = Apollo.BaseMutationOptions<AddMobEquipmentSetMutation, AddMobEquipmentSetMutationVariables>;
export const RemoveMobEquipmentSetDocument = gql`
    mutation RemoveMobEquipmentSet($id: ID!) {
  deleteMobEquipmentSet(id: $id)
}
    `;
export type RemoveMobEquipmentSetMutationFn = Apollo.MutationFunction<RemoveMobEquipmentSetMutation, RemoveMobEquipmentSetMutationVariables>;

/**
 * __useRemoveMobEquipmentSetMutation__
 *
 * To run a mutation, you first call `useRemoveMobEquipmentSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMobEquipmentSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMobEquipmentSetMutation, { data, loading, error }] = useRemoveMobEquipmentSetMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemoveMobEquipmentSetMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMobEquipmentSetMutation, RemoveMobEquipmentSetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveMobEquipmentSetMutation, RemoveMobEquipmentSetMutationVariables>(RemoveMobEquipmentSetDocument, options);
      }
export type RemoveMobEquipmentSetMutationHookResult = ReturnType<typeof useRemoveMobEquipmentSetMutation>;
export type RemoveMobEquipmentSetMutationResult = Apollo.MutationResult<RemoveMobEquipmentSetMutation>;
export type RemoveMobEquipmentSetMutationOptions = Apollo.BaseMutationOptions<RemoveMobEquipmentSetMutation, RemoveMobEquipmentSetMutationVariables>;
export const LoginDocument = gql`
    mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    user {
      id
      username
      email
      role
      createdAt
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = gql`
    mutation Register($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    user {
      id
      username
      email
      role
      createdAt
    }
  }
}
    `;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const MeDocument = gql`
    query Me {
  me {
    id
    username
    email
    role
    createdAt
  }
}
    `;

/**
 * __useMeQuery__
 *
 * To run a query within a React component, call `useMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useMeQuery(baseOptions?: Apollo.QueryHookOptions<MeQuery, MeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MeQuery, MeQueryVariables>(MeDocument, options);
      }
export function useMeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export function useMeSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MeQuery, MeQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MeQuery, MeQueryVariables>(MeDocument, options);
        }
export type MeQueryHookResult = ReturnType<typeof useMeQuery>;
export type MeLazyQueryHookResult = ReturnType<typeof useMeLazyQuery>;
export type MeSuspenseQueryHookResult = ReturnType<typeof useMeSuspenseQuery>;
export type MeQueryResult = Apollo.QueryResult<MeQuery, MeQueryVariables>;
export const OnlineCharactersDocument = gql`
    query OnlineCharacters($userId: ID) {
  onlineCharacters(userId: $userId) {
    id
    name
    level
    lastLogin
    isOnline
    raceType
    playerClass
    user {
      id
      username
      role
    }
  }
}
    `;

/**
 * __useOnlineCharactersQuery__
 *
 * To run a query within a React component, call `useOnlineCharactersQuery` and pass it any options that fit your needs.
 * When your component renders, `useOnlineCharactersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnlineCharactersQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useOnlineCharactersQuery(baseOptions?: Apollo.QueryHookOptions<OnlineCharactersQuery, OnlineCharactersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OnlineCharactersQuery, OnlineCharactersQueryVariables>(OnlineCharactersDocument, options);
      }
export function useOnlineCharactersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OnlineCharactersQuery, OnlineCharactersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OnlineCharactersQuery, OnlineCharactersQueryVariables>(OnlineCharactersDocument, options);
        }
export function useOnlineCharactersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<OnlineCharactersQuery, OnlineCharactersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<OnlineCharactersQuery, OnlineCharactersQueryVariables>(OnlineCharactersDocument, options);
        }
export type OnlineCharactersQueryHookResult = ReturnType<typeof useOnlineCharactersQuery>;
export type OnlineCharactersLazyQueryHookResult = ReturnType<typeof useOnlineCharactersLazyQuery>;
export type OnlineCharactersSuspenseQueryHookResult = ReturnType<typeof useOnlineCharactersSuspenseQuery>;
export type OnlineCharactersQueryResult = Apollo.QueryResult<OnlineCharactersQuery, OnlineCharactersQueryVariables>;
export const MyOnlineCharactersDocument = gql`
    query MyOnlineCharacters {
  myOnlineCharacters {
    id
    name
    level
    lastLogin
    isOnline
    raceType
    playerClass
    user {
      id
      username
      role
    }
  }
}
    `;

/**
 * __useMyOnlineCharactersQuery__
 *
 * To run a query within a React component, call `useMyOnlineCharactersQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyOnlineCharactersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyOnlineCharactersQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyOnlineCharactersQuery(baseOptions?: Apollo.QueryHookOptions<MyOnlineCharactersQuery, MyOnlineCharactersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyOnlineCharactersQuery, MyOnlineCharactersQueryVariables>(MyOnlineCharactersDocument, options);
      }
export function useMyOnlineCharactersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyOnlineCharactersQuery, MyOnlineCharactersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyOnlineCharactersQuery, MyOnlineCharactersQueryVariables>(MyOnlineCharactersDocument, options);
        }
export function useMyOnlineCharactersSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyOnlineCharactersQuery, MyOnlineCharactersQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyOnlineCharactersQuery, MyOnlineCharactersQueryVariables>(MyOnlineCharactersDocument, options);
        }
export type MyOnlineCharactersQueryHookResult = ReturnType<typeof useMyOnlineCharactersQuery>;
export type MyOnlineCharactersLazyQueryHookResult = ReturnType<typeof useMyOnlineCharactersLazyQuery>;
export type MyOnlineCharactersSuspenseQueryHookResult = ReturnType<typeof useMyOnlineCharactersSuspenseQuery>;
export type MyOnlineCharactersQueryResult = Apollo.QueryResult<MyOnlineCharactersQuery, MyOnlineCharactersQueryVariables>;
export const CharacterSessionInfoDocument = gql`
    query CharacterSessionInfo($characterId: ID!) {
  characterSessionInfo(characterId: $characterId) {
    id
    name
    isOnline
    lastLogin
    totalTimePlayed
    currentSessionTime
  }
}
    `;

/**
 * __useCharacterSessionInfoQuery__
 *
 * To run a query within a React component, call `useCharacterSessionInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useCharacterSessionInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCharacterSessionInfoQuery({
 *   variables: {
 *      characterId: // value for 'characterId'
 *   },
 * });
 */
export function useCharacterSessionInfoQuery(baseOptions: Apollo.QueryHookOptions<CharacterSessionInfoQuery, CharacterSessionInfoQueryVariables> & ({ variables: CharacterSessionInfoQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CharacterSessionInfoQuery, CharacterSessionInfoQueryVariables>(CharacterSessionInfoDocument, options);
      }
export function useCharacterSessionInfoLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CharacterSessionInfoQuery, CharacterSessionInfoQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CharacterSessionInfoQuery, CharacterSessionInfoQueryVariables>(CharacterSessionInfoDocument, options);
        }
export function useCharacterSessionInfoSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CharacterSessionInfoQuery, CharacterSessionInfoQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<CharacterSessionInfoQuery, CharacterSessionInfoQueryVariables>(CharacterSessionInfoDocument, options);
        }
export type CharacterSessionInfoQueryHookResult = ReturnType<typeof useCharacterSessionInfoQuery>;
export type CharacterSessionInfoLazyQueryHookResult = ReturnType<typeof useCharacterSessionInfoLazyQuery>;
export type CharacterSessionInfoSuspenseQueryHookResult = ReturnType<typeof useCharacterSessionInfoSuspenseQuery>;
export type CharacterSessionInfoQueryResult = Apollo.QueryResult<CharacterSessionInfoQuery, CharacterSessionInfoQueryVariables>;
export const SetCharacterOnlineDocument = gql`
    mutation SetCharacterOnline($characterId: ID!) {
  setCharacterOnline(characterId: $characterId)
}
    `;
export type SetCharacterOnlineMutationFn = Apollo.MutationFunction<SetCharacterOnlineMutation, SetCharacterOnlineMutationVariables>;

/**
 * __useSetCharacterOnlineMutation__
 *
 * To run a mutation, you first call `useSetCharacterOnlineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetCharacterOnlineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setCharacterOnlineMutation, { data, loading, error }] = useSetCharacterOnlineMutation({
 *   variables: {
 *      characterId: // value for 'characterId'
 *   },
 * });
 */
export function useSetCharacterOnlineMutation(baseOptions?: Apollo.MutationHookOptions<SetCharacterOnlineMutation, SetCharacterOnlineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetCharacterOnlineMutation, SetCharacterOnlineMutationVariables>(SetCharacterOnlineDocument, options);
      }
export type SetCharacterOnlineMutationHookResult = ReturnType<typeof useSetCharacterOnlineMutation>;
export type SetCharacterOnlineMutationResult = Apollo.MutationResult<SetCharacterOnlineMutation>;
export type SetCharacterOnlineMutationOptions = Apollo.BaseMutationOptions<SetCharacterOnlineMutation, SetCharacterOnlineMutationVariables>;
export const SetCharacterOfflineDocument = gql`
    mutation SetCharacterOffline($characterId: ID!) {
  setCharacterOffline(characterId: $characterId)
}
    `;
export type SetCharacterOfflineMutationFn = Apollo.MutationFunction<SetCharacterOfflineMutation, SetCharacterOfflineMutationVariables>;

/**
 * __useSetCharacterOfflineMutation__
 *
 * To run a mutation, you first call `useSetCharacterOfflineMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetCharacterOfflineMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setCharacterOfflineMutation, { data, loading, error }] = useSetCharacterOfflineMutation({
 *   variables: {
 *      characterId: // value for 'characterId'
 *   },
 * });
 */
export function useSetCharacterOfflineMutation(baseOptions?: Apollo.MutationHookOptions<SetCharacterOfflineMutation, SetCharacterOfflineMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SetCharacterOfflineMutation, SetCharacterOfflineMutationVariables>(SetCharacterOfflineDocument, options);
      }
export type SetCharacterOfflineMutationHookResult = ReturnType<typeof useSetCharacterOfflineMutation>;
export type SetCharacterOfflineMutationResult = Apollo.MutationResult<SetCharacterOfflineMutation>;
export type SetCharacterOfflineMutationOptions = Apollo.BaseMutationOptions<SetCharacterOfflineMutation, SetCharacterOfflineMutationVariables>;
export const UpdateCharacterActivityDocument = gql`
    mutation UpdateCharacterActivity($characterId: ID!) {
  updateCharacterActivity(characterId: $characterId)
}
    `;
export type UpdateCharacterActivityMutationFn = Apollo.MutationFunction<UpdateCharacterActivityMutation, UpdateCharacterActivityMutationVariables>;

/**
 * __useUpdateCharacterActivityMutation__
 *
 * To run a mutation, you first call `useUpdateCharacterActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCharacterActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCharacterActivityMutation, { data, loading, error }] = useUpdateCharacterActivityMutation({
 *   variables: {
 *      characterId: // value for 'characterId'
 *   },
 * });
 */
export function useUpdateCharacterActivityMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCharacterActivityMutation, UpdateCharacterActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCharacterActivityMutation, UpdateCharacterActivityMutationVariables>(UpdateCharacterActivityDocument, options);
      }
export type UpdateCharacterActivityMutationHookResult = ReturnType<typeof useUpdateCharacterActivityMutation>;
export type UpdateCharacterActivityMutationResult = Apollo.MutationResult<UpdateCharacterActivityMutation>;
export type UpdateCharacterActivityMutationOptions = Apollo.BaseMutationOptions<UpdateCharacterActivityMutation, UpdateCharacterActivityMutationVariables>;
export const MyPermissionsDocument = gql`
    query MyPermissions {
  myPermissions {
    isPlayer
    isImmortal
    isBuilder
    isCoder
    isGod
    canAccessDashboard
    canManageUsers
    canViewValidation
    maxCharacterLevel
    role
  }
}
    `;

/**
 * __useMyPermissionsQuery__
 *
 * To run a query within a React component, call `useMyPermissionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyPermissionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyPermissionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useMyPermissionsQuery(baseOptions?: Apollo.QueryHookOptions<MyPermissionsQuery, MyPermissionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<MyPermissionsQuery, MyPermissionsQueryVariables>(MyPermissionsDocument, options);
      }
export function useMyPermissionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<MyPermissionsQuery, MyPermissionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<MyPermissionsQuery, MyPermissionsQueryVariables>(MyPermissionsDocument, options);
        }
export function useMyPermissionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<MyPermissionsQuery, MyPermissionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<MyPermissionsQuery, MyPermissionsQueryVariables>(MyPermissionsDocument, options);
        }
export type MyPermissionsQueryHookResult = ReturnType<typeof useMyPermissionsQuery>;
export type MyPermissionsLazyQueryHookResult = ReturnType<typeof useMyPermissionsLazyQuery>;
export type MyPermissionsSuspenseQueryHookResult = ReturnType<typeof useMyPermissionsSuspenseQuery>;
export type MyPermissionsQueryResult = Apollo.QueryResult<MyPermissionsQuery, MyPermissionsQueryVariables>;