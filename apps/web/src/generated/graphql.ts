export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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
  DateTime: { input: any; output: any };
  JSON: { input: any; output: any };
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
  triggerId: Scalars['String']['input'];
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
  containerId?: Maybe<Scalars['String']['output']>;
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
  | 'TROPICAL'
  | '%future added value';

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
  | 'WATER'
  | '%future added value';

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
  containerId?: InputMaybe<Scalars['String']['input']>;
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

export type CreateMobCarryingInput = {
  max?: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  objectId: Scalars['Int']['input'];
};

export type CreateMobEquipmentSetInput = {
  equipmentSetId: Scalars['String']['input'];
  mobResetId: Scalars['String']['input'];
  probability?: Scalars['Float']['input'];
};

export type CreateMobEquippedInput = {
  location: Scalars['String']['input'];
  max?: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  objectId: Scalars['Int']['input'];
};

export type CreateMobInput = {
  alignment?: Scalars['Int']['input'];
  armorClass?: Scalars['Int']['input'];
  charisma?: Scalars['Int']['input'];
  composition?: Composition;
  concealment?: Scalars['Int']['input'];
  constitution?: Scalars['Int']['input'];
  copper?: Scalars['Int']['input'];
  damageDiceBonus?: Scalars['Int']['input'];
  damageDiceNum?: Scalars['Int']['input'];
  damageDiceSize?: Scalars['Int']['input'];
  damageType?: DamageType;
  defaultPosition?: Position;
  desc: Scalars['String']['input'];
  dexterity?: Scalars['Int']['input'];
  effectFlags?: Array<EffectFlag>;
  estimatedHp?: Scalars['Int']['input'];
  gender?: Gender;
  gold?: Scalars['Int']['input'];
  hitRoll?: Scalars['Int']['input'];
  hpDiceBonus?: Scalars['Int']['input'];
  hpDiceNum?: Scalars['Int']['input'];
  hpDiceSize?: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  intelligence?: Scalars['Int']['input'];
  keywords: Scalars['String']['input'];
  level?: Scalars['Int']['input'];
  lifeForce?: LifeForce;
  longDesc: Scalars['String']['input'];
  mobClass: Scalars['String']['input'];
  mobFlags?: Array<MobFlag>;
  move?: Scalars['Int']['input'];
  perception?: Scalars['Int']['input'];
  platinum?: Scalars['Int']['input'];
  position?: Position;
  race?: InputMaybe<Race>;
  raceAlign?: Scalars['Int']['input'];
  shortDesc: Scalars['String']['input'];
  silver?: Scalars['Int']['input'];
  size?: Size;
  stance?: Stance;
  strength?: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  wisdom?: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type CreateMobResetInput = {
  carrying?: Array<CreateMobCarryingInput>;
  equipped?: Array<CreateMobEquippedInput>;
  max?: Scalars['Int']['input'];
  mobId: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  roomId: Scalars['Int']['input'];
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
  keywords: Scalars['String']['input'];
  level?: Scalars['Int']['input'];
  shortDesc: Scalars['String']['input'];
  timer?: Scalars['Int']['input'];
  type?: ObjectType;
  values?: InputMaybe<Scalars['JSON']['input']>;
  id: Scalars['Int']['input'];
  wearFlags?: Array<WearFlag>;
  weight?: Scalars['Float']['input'];
  zoneId: Scalars['Int']['input'];
};

export type CreateRoomExitInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  destination?: InputMaybe<Scalars['Int']['input']>;
  direction: Direction;
  key?: InputMaybe<Scalars['String']['input']>;
  keyword?: InputMaybe<Scalars['String']['input']>;
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
  id: Scalars['Int']['input'];
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
  id: Scalars['Int']['input'];
  zoneId: Scalars['Int']['input'];
};

export type CreateTriggerInput = {
  argList?: InputMaybe<Scalars['String']['input']>;
  attachType: ScriptType;
  commands: Scalars['String']['input'];
  flags?: Array<TriggerFlag>;
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
  | 'WHIP'
  | '%future added value';

export type Direction =
  | 'DOWN'
  | 'EAST'
  | 'NORTH'
  | 'SOUTH'
  | 'UP'
  | 'WEST'
  | '%future added value';

export type EffectFlag =
  | 'ANGELIC_AURA'
  | 'ANIMAL_KIN'
  | 'ASH_EYES'
  | 'AWARE'
  | 'BARKSKIN'
  | 'BLESS'
  | 'BLIND'
  | 'BLUR'
  | 'BURNING_HANDS'
  | 'CALM'
  | 'CAMOUFLAGED'
  | 'CHARM'
  | 'COLDSHIELD'
  | 'COMPREHEND_LANG'
  | 'CONFUSION'
  | 'COSMIC_TRAVEL'
  | 'CURSE'
  | 'CYCLONE'
  | 'DARKNESS'
  | 'DEATH_FIELD'
  | 'DETECT_ALIGN'
  | 'DETECT_INVIS'
  | 'DETECT_MAGIC'
  | 'DETECT_POISON'
  | 'DILATE_PUPILS'
  | 'DISEASE'
  | 'DISPLACEMENT'
  | 'DRAGON_RIDE'
  | 'EARTHMAW'
  | 'ENTANGLE'
  | 'ETHEREAL'
  | 'FAERIE_FIRE'
  | 'FAMILIARITY'
  | 'FARSEE'
  | 'FEBLEMIND'
  | 'FIRESHIELD'
  | 'FIRESTORM'
  | 'FLAME_SHROUD'
  | 'FLOOD'
  | 'FLUORESCENCE'
  | 'FLYING'
  | 'GLORY'
  | 'GROUP'
  | 'HARNESS'
  | 'HASTE'
  | 'HIDE'
  | 'INFRAVISION'
  | 'INSANITY'
  | 'INVISIBLE'
  | 'INVISIBLE_STALKER'
  | 'LIGHT'
  | 'MAGICONLY'
  | 'MAJOR_GLOBE'
  | 'MAJOR_PARALYSIS'
  | 'MENTAL_BARRIER'
  | 'MESMERIZED'
  | 'METEOR'
  | 'MINOR_PARALYSIS'
  | 'MIST_WALK'
  | 'MOON_BEAM'
  | 'NEGATE_AIR'
  | 'NEGATE_COLD'
  | 'NEGATE_EARTH'
  | 'NEGATE_HEAT'
  | 'NEXTNOATTACK'
  | 'NEXTPARTIAL'
  | 'NO_TRACK'
  | 'PETRIFY'
  | 'PLAGUE'
  | 'POISON'
  | 'PROTECT_EVIL'
  | 'PROTECT_GOOD'
  | 'PROT_AIR'
  | 'PROT_COLD'
  | 'PROT_EARTH'
  | 'PROT_FIRE'
  | 'REMOTE_AGGR'
  | 'RESTLESS'
  | 'SANCTUARY'
  | 'SCOURGE'
  | 'SENSE_LIFE'
  | 'SHILLELAGH'
  | 'SILENCE'
  | 'SLEEP'
  | 'SLOW'
  | 'SNEAK'
  | 'SOULSHIELD'
  | 'SPELL_TURNING'
  | 'STEALTH'
  | 'STONE_SKIN'
  | 'SUN_RAY'
  | 'TAMED'
  | 'TORNADO'
  | 'ULTRAVISION'
  | 'ULTRA_DAMAGE'
  | 'UNUSED'
  | 'VAMPIRIC_DRAIN'
  | 'VITALITY'
  | 'WATERBREATH'
  | 'WATERWALK'
  | 'WITHER_LIMB'
  | '%future added value';

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

export type Gender =
  | 'FEMALE'
  | 'MALE'
  | 'NEUTRAL'
  | 'NON_BINARY'
  | '%future added value';

export type Hemisphere =
  | 'NORTHEAST'
  | 'NORTHWEST'
  | 'SOUTHEAST'
  | 'SOUTHWEST'
  | '%future added value';

export type LifeForce =
  | 'CELESTIAL'
  | 'DEMONIC'
  | 'ELEMENTAL'
  | 'LIFE'
  | 'MAGIC'
  | 'UNDEAD'
  | '%future added value';

export type LinkCharacterInput = {
  characterName: Scalars['String']['input'];
  characterPassword: Scalars['String']['input'];
};

export type LoginInput = {
  identifier: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type MobCarryingDto = {
  __typename?: 'MobCarryingDto';
  id: Scalars['ID']['output'];
  max: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** The object being carried */
  object: ObjectSummaryDto;
  objectId: Scalars['Int']['output'];
};

export type MobDto = {
  __typename?: 'MobDto';
  alignment: Scalars['Int']['output'];
  armorClass: Scalars['Int']['output'];
  charisma: Scalars['Int']['output'];
  composition: Composition;
  concealment: Scalars['Int']['output'];
  constitution: Scalars['Int']['output'];
  copper: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  damageDiceBonus: Scalars['Int']['output'];
  damageDiceNum: Scalars['Int']['output'];
  damageDiceSize: Scalars['Int']['output'];
  damageType: DamageType;
  defaultPosition: Position;
  desc: Scalars['String']['output'];
  dexterity: Scalars['Int']['output'];
  effectFlags: Array<EffectFlag>;
  estimatedHp: Scalars['Int']['output'];
  gender: Gender;
  gold: Scalars['Int']['output'];
  hitRoll: Scalars['Int']['output'];
  hpDiceBonus: Scalars['Int']['output'];
  hpDiceNum: Scalars['Int']['output'];
  hpDiceSize: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  intelligence: Scalars['Int']['output'];
  keywords: Scalars['String']['output'];
  level: Scalars['Int']['output'];
  lifeForce: LifeForce;
  longDesc: Scalars['String']['output'];
  mobClass: Scalars['String']['output'];
  mobFlags: Array<MobFlag>;
  move: Scalars['Int']['output'];
  perception: Scalars['Int']['output'];
  platinum: Scalars['Int']['output'];
  position: Position;
  race?: Maybe<Race>;
  raceAlign: Scalars['Int']['output'];
  shortDesc: Scalars['String']['output'];
  silver: Scalars['Int']['output'];
  size: Size;
  stance: Stance;
  strength: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
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

export type MobEquippedDto = {
  __typename?: 'MobEquippedDto';
  id: Scalars['ID']['output'];
  location: Scalars['String']['output'];
  max: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  /** The object being equipped */
  object: ObjectSummaryDto;
  objectId: Scalars['Int']['output'];
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
  | 'ISNPC'
  | 'MEMORY'
  | 'MERCENARY'
  | 'MONK'
  | 'MOUNT'
  | 'MOUNTABLE'
  | 'NECROMANCER'
  | 'NOPOISON'
  | 'NOSILENCE'
  | 'NOVICIOUS'
  | 'NO_BASH'
  | 'NO_BLIND'
  | 'NO_CHARM'
  | 'NO_CLASS_AI'
  | 'NO_EQ_RESTRICT'
  | 'NO_KILL'
  | 'NO_SLEEP'
  | 'NO_SUMMON'
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
  | 'WIMPY'
  | '%future added value';

export type MobResetDto = {
  __typename?: 'MobResetDto';
  carrying: Array<MobCarryingDto>;
  equipped: Array<MobEquippedDto>;
  id: Scalars['ID']['output'];
  max: Scalars['Int']['output'];
  mobId: Scalars['Int']['output'];
  name?: Maybe<Scalars['String']['output']>;
  roomId: Scalars['Int']['output'];
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
  deleteMobCarrying: Scalars['Boolean']['output'];
  deleteMobEquipmentSet: Scalars['Boolean']['output'];
  deleteMobEquipped: Scalars['Boolean']['output'];
  deleteMobReset: Scalars['Boolean']['output'];
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
};

export type MutationDeleteMobCarryingArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteMobEquipmentSetArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteMobEquippedArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteMobResetArgs = {
  id: Scalars['ID']['input'];
};

export type MutationDeleteMobsArgs = {
  ids: Array<Scalars['Int']['input']>;
};

export type MutationDeleteObjectArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteObjectsArgs = {
  ids: Array<Scalars['Int']['input']>;
};

export type MutationDeleteRoomArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteRoomExitArgs = {
  exitId: Scalars['String']['input'];
};

export type MutationDeleteShopArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDeleteTriggerArgs = {
  id: Scalars['String']['input'];
};

export type MutationDeleteZoneArgs = {
  id: Scalars['Int']['input'];
};

export type MutationDetachTriggerArgs = {
  triggerId: Scalars['String']['input'];
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
};

export type MutationUpdateMobResetArgs = {
  data: UpdateMobResetInput;
  id: Scalars['ID']['input'];
};

export type MutationUpdateObjectArgs = {
  data: UpdateObjectInput;
  id: Scalars['Int']['input'];
};

export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};

export type MutationUpdateRoomArgs = {
  data: UpdateRoomInput;
  id: Scalars['Int']['input'];
};

export type MutationUpdateRoomPositionArgs = {
  id: Scalars['Int']['input'];
  position: UpdateRoomPositionInput;
};

export type MutationUpdateShopArgs = {
  data: UpdateShopInput;
  id: Scalars['Int']['input'];
};

export type MutationUpdateTriggerArgs = {
  id: Scalars['String']['input'];
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
  keywords: Scalars['String']['output'];
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
  | 'WAS_DISARMED'
  | '%future added value';

export type ObjectSummaryDto = {
  __typename?: 'ObjectSummaryDto';
  id: Scalars['Int']['output'];
  shortDesc: Scalars['String']['output'];
  type: Scalars['String']['output'];
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
  | 'WORN'
  | '%future added value';

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
  | 'STANDING'
  | '%future added value';

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
};

export type QueryMobResetArgs = {
  id: Scalars['ID']['input'];
};

export type QueryMobResetsArgs = {
  mobId: Scalars['Int']['input'];
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
};

export type QueryRoomsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryRoomsByZoneArgs = {
  zoneId: Scalars['Int']['input'];
};

export type QueryRoomsCountArgs = {
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryShopArgs = {
  id: Scalars['Int']['input'];
};

export type QueryShopByKeeperArgs = {
  keeperId: Scalars['Int']['input'];
};

export type QueryShopsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryShopsByZoneArgs = {
  zoneId: Scalars['Int']['input'];
};

export type QueryTriggerArgs = {
  id: Scalars['String']['input'];
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
  | 'TROLL'
  | '%future added value';

export type RegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type RequestPasswordResetInput = {
  email: Scalars['String']['input'];
};

export type ResetMode = 'EMPTY' | 'NEVER' | 'NORMAL' | '%future added value';

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
  id: Scalars['String']['output'];
  key?: Maybe<Scalars['String']['output']>;
  keyword?: Maybe<Scalars['String']['output']>;
  toRoomId?: Maybe<Scalars['Int']['output']>;
  toZoneId?: Maybe<Scalars['Int']['output']>;
};

export type RoomExtraDescriptionDto = {
  __typename?: 'RoomExtraDescriptionDto';
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  keyword: Scalars['String']['output'];
};

export type RoomFlag =
  | 'ALT_EXIT'
  | 'ALWAYSLIT'
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
  | 'NOMAGIC'
  | 'NOMOB'
  | 'NORECALL'
  | 'NOSCAN'
  | 'NOSHIFT'
  | 'NOSUMMON'
  | 'NOTRACK'
  | 'NOWELL'
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
  | 'WORLDMAP'
  | '%future added value';

export type ScriptType = 'MOB' | 'OBJECT' | 'WORLD' | '%future added value';

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
  | 'WATER'
  | '%future added value';

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

export type ShopFlag =
  | 'USES_BANK'
  | 'WILL_BANK_MONEY'
  | 'WILL_FIGHT'
  | 'WILL_START_FIGHT'
  | '%future added value';

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
  object?: Maybe<ObjectDto>;
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
  | 'TRADE_NOWARRIOR'
  | '%future added value';

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
  | 'TITANIC'
  | '%future added value';

export type Stance =
  | 'ALERT'
  | 'DEAD'
  | 'FIGHTING'
  | 'INCAPACITATED'
  | 'MORT'
  | 'RESTING'
  | 'SLEEPING'
  | 'STUNNED'
  | '%future added value';

export type TriggerDto = {
  __typename?: 'TriggerDto';
  argList?: Maybe<Scalars['String']['output']>;
  attachType: ScriptType;
  commands: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['String']['output']>;
  flags: Array<TriggerFlag>;
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

export type TriggerFlag =
  | 'ACT'
  | 'AUTO'
  | 'BRIBE'
  | 'CAST'
  | 'COMMAND'
  | 'DEATH'
  | 'DOOR'
  | 'ENTRY'
  | 'FIGHT'
  | 'GLOBAL'
  | 'GREET'
  | 'GREET_ALL'
  | 'HIT_PERCENT'
  | 'LEAVE'
  | 'LOAD'
  | 'LOOK'
  | 'MEMORY'
  | 'RANDOM'
  | 'RECEIVE'
  | 'SPEECH'
  | 'SPEECH_TO'
  | 'TIME'
  | '%future added value';

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
  containerId?: InputMaybe<Scalars['String']['input']>;
  customLongDesc?: InputMaybe<Scalars['String']['input']>;
  customShortDesc?: InputMaybe<Scalars['String']['input']>;
  equippedLocation?: InputMaybe<Scalars['String']['input']>;
  instanceFlags?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateEquipmentSetInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMobCarryingInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  max?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  objectId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateMobEquippedInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  max?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  objectId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateMobInput = {
  alignment?: InputMaybe<Scalars['Int']['input']>;
  armorClass?: InputMaybe<Scalars['Int']['input']>;
  charisma?: InputMaybe<Scalars['Int']['input']>;
  composition?: InputMaybe<Composition>;
  concealment?: InputMaybe<Scalars['Int']['input']>;
  constitution?: InputMaybe<Scalars['Int']['input']>;
  copper?: InputMaybe<Scalars['Int']['input']>;
  damageDiceBonus?: InputMaybe<Scalars['Int']['input']>;
  damageDiceNum?: InputMaybe<Scalars['Int']['input']>;
  damageDiceSize?: InputMaybe<Scalars['Int']['input']>;
  damageType?: InputMaybe<DamageType>;
  defaultPosition?: InputMaybe<Position>;
  desc?: InputMaybe<Scalars['String']['input']>;
  dexterity?: InputMaybe<Scalars['Int']['input']>;
  effectFlags?: InputMaybe<Array<EffectFlag>>;
  estimatedHp?: InputMaybe<Scalars['Int']['input']>;
  gender?: InputMaybe<Gender>;
  gold?: InputMaybe<Scalars['Int']['input']>;
  hitRoll?: InputMaybe<Scalars['Int']['input']>;
  hpDiceBonus?: InputMaybe<Scalars['Int']['input']>;
  hpDiceNum?: InputMaybe<Scalars['Int']['input']>;
  hpDiceSize?: InputMaybe<Scalars['Int']['input']>;
  intelligence?: InputMaybe<Scalars['Int']['input']>;
  keywords?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  lifeForce?: InputMaybe<LifeForce>;
  longDesc?: InputMaybe<Scalars['String']['input']>;
  mobClass?: InputMaybe<Scalars['String']['input']>;
  mobFlags?: InputMaybe<Array<MobFlag>>;
  move?: InputMaybe<Scalars['Int']['input']>;
  perception?: InputMaybe<Scalars['Int']['input']>;
  platinum?: InputMaybe<Scalars['Int']['input']>;
  position?: InputMaybe<Position>;
  race?: InputMaybe<Race>;
  raceAlign?: InputMaybe<Scalars['Int']['input']>;
  shortDesc?: InputMaybe<Scalars['String']['input']>;
  silver?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Size>;
  stance?: InputMaybe<Stance>;
  strength?: InputMaybe<Scalars['Int']['input']>;
  wisdom?: InputMaybe<Scalars['Int']['input']>;
  zoneId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateMobResetInput = {
  carrying?: InputMaybe<Array<UpdateMobCarryingInput>>;
  equipped?: InputMaybe<Array<UpdateMobEquippedInput>>;
  max?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  roomId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateObjectInput = {
  actionDesc?: InputMaybe<Scalars['String']['input']>;
  concealment?: InputMaybe<Scalars['Int']['input']>;
  cost?: InputMaybe<Scalars['Int']['input']>;
  decomposeTimer?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  effectFlags?: InputMaybe<Array<EffectFlag>>;
  flags?: InputMaybe<Array<ObjectFlag>>;
  keywords?: InputMaybe<Scalars['String']['input']>;
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
  argList?: InputMaybe<Scalars['String']['input']>;
  attachType?: InputMaybe<ScriptType>;
  commands?: InputMaybe<Scalars['String']['input']>;
  flags?: InputMaybe<Array<TriggerFlag>>;
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
  | 'PLAYER'
  | '%future added value';

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
  | 'QUALITY'
  | '%future added value';

/** The type of entity being validated */
export type ValidationEntity =
  | 'MOB'
  | 'OBJECT'
  | 'ROOM'
  | 'SHOP'
  | 'ZONE'
  | '%future added value';

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
  | 'WARNING'
  | '%future added value';

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
  | 'MEDIUM'
  | '%future added value';

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
  | 'WRIST'
  | '%future added value';

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

export type GetMobQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type GetMobQuery = {
  __typename?: 'Query';
  mob: {
    __typename?: 'MobDto';
    id: number;
    keywords: string;
    mobClass: string;
    shortDesc: string;
    longDesc: string;
    desc: string;
    alignment: number;
    level: number;
    armorClass: number;
    hitRoll: number;
    move: number;
    hpDiceNum: number;
    hpDiceSize: number;
    hpDiceBonus: number;
    damageDiceNum: number;
    damageDiceSize: number;
    damageDiceBonus: number;
    copper: number;
    silver: number;
    gold: number;
    platinum: number;
    raceAlign: number;
    strength: number;
    intelligence: number;
    wisdom: number;
    dexterity: number;
    constitution: number;
    charisma: number;
    perception: number;
    concealment: number;
    zoneId: number;
    race?: Race | null;
    mobFlags: Array<MobFlag>;
    effectFlags: Array<EffectFlag>;
    position: Position;
    defaultPosition: Position;
    gender: Gender;
    size: Size;
    lifeForce: LifeForce;
    composition: Composition;
    stance: Stance;
    damageType: DamageType;
    createdAt: any;
    updatedAt: any;
  };
};

export type UpdateMobMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  data: UpdateMobInput;
}>;

export type UpdateMobMutation = {
  __typename?: 'Mutation';
  updateMob: {
    __typename?: 'MobDto';
    id: number;
    keywords: string;
    shortDesc: string;
    longDesc: string;
    desc: string;
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
    keywords: string;
    shortDesc: string;
  };
};

export type GetObjectQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type GetObjectQuery = {
  __typename?: 'Query';
  object: {
    __typename?: 'ObjectDto';
    id: number;
    type: ObjectType;
    keywords: string;
    shortDesc: string;
    description: string;
    actionDesc?: string | null;
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

export type UpdateObjectMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  data: UpdateObjectInput;
}>;

export type UpdateObjectMutation = {
  __typename?: 'Mutation';
  updateObject: {
    __typename?: 'ObjectDto';
    id: number;
    keywords: string;
    shortDesc: string;
    description: string;
  };
};

export type CreateObjectMutationVariables = Exact<{
  data: CreateObjectInput;
}>;

export type CreateObjectMutation = {
  __typename?: 'Mutation';
  createObject: {
    __typename?: 'ObjectDto';
    id: number;
    keywords: string;
    shortDesc: string;
  };
};

export type GetObjectsDashboardQueryVariables = Exact<{ [key: string]: never }>;

export type GetObjectsDashboardQuery = {
  __typename?: 'Query';
  objects: Array<{
    __typename?: 'ObjectDto';
    id: number;
    type: ObjectType;
    keywords: string;
    shortDesc: string;
    level: number;
    weight: number;
    cost: number;
    zoneId: number;
    values: any;
  }>;
};

export type GetObjectsByZoneDashboardQueryVariables = Exact<{
  zoneId: Scalars['Int']['input'];
}>;

export type GetObjectsByZoneDashboardQuery = {
  __typename?: 'Query';
  objectsByZone: Array<{
    __typename?: 'ObjectDto';
    id: number;
    type: ObjectType;
    keywords: string;
    shortDesc: string;
    level: number;
    weight: number;
    cost: number;
    zoneId: number;
    values: any;
  }>;
};

export type DeleteObjectMutationVariables = Exact<{
  id: Scalars['Int']['input'];
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

export type GetDashboardStatsQueryVariables = Exact<{ [key: string]: never }>;

export type GetDashboardStatsQuery = {
  __typename?: 'Query';
  zonesCount: number;
  roomsCount: number;
  mobsCount: number;
  objectsCount: number;
  shopsCount: number;
};

export type GetShopQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type GetShopQuery = {
  __typename?: 'Query';
  shop: {
    __typename?: 'ShopDto';
    id: number;
    buyProfit: number;
    sellProfit: number;
    temper1: number;
    noSuchItem1?: string | null;
    noSuchItem2?: string | null;
    doNotBuy?: string | null;
    missingCash1?: string | null;
    missingCash2?: string | null;
    messageBuy?: string | null;
    messageSell?: string | null;
    keeperId?: number | null;
    zoneId: number;
    flags: Array<ShopFlag>;
    tradesWithFlags: Array<ShopTradesWith>;
    createdAt: any;
    updatedAt: any;
    items: Array<{
      __typename?: 'ShopItemDto';
      id: string;
      amount: number;
      objectId: number;
      object?: {
        __typename?: 'ObjectDto';
        id: number;
        shortDesc: string;
        type: ObjectType;
        cost: number;
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

export type GetAvailableObjectsQueryVariables = Exact<{ [key: string]: never }>;

export type GetAvailableObjectsQuery = {
  __typename?: 'Query';
  objects: Array<{
    __typename?: 'ObjectDto';
    id: number;
    keywords: string;
    shortDesc: string;
    type: ObjectType;
    cost: number;
    zoneId: number;
  }>;
};

export type GetAvailableMobsQueryVariables = Exact<{ [key: string]: never }>;

export type GetAvailableMobsQuery = {
  __typename?: 'Query';
  mobs: Array<{
    __typename?: 'MobDto';
    id: number;
    keywords: string;
    shortDesc: string;
    zoneId: number;
  }>;
};

export type UpdateShopMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  data: UpdateShopInput;
}>;

export type UpdateShopMutation = {
  __typename?: 'Mutation';
  updateShop: {
    __typename?: 'ShopDto';
    id: number;
    buyProfit: number;
    sellProfit: number;
  };
};

export type CreateShopMutationVariables = Exact<{
  data: CreateShopInput;
}>;

export type CreateShopMutation = {
  __typename?: 'Mutation';
  createShop: {
    __typename?: 'ShopDto';
    id: number;
    buyProfit: number;
    sellProfit: number;
  };
};

export type GetShopsQueryVariables = Exact<{ [key: string]: never }>;

export type GetShopsQuery = {
  __typename?: 'Query';
  shops: Array<{
    __typename?: 'ShopDto';
    id: number;
    buyProfit: number;
    sellProfit: number;
    temper1: number;
    flags: Array<ShopFlag>;
    tradesWithFlags: Array<ShopTradesWith>;
    noSuchItem1?: string | null;
    noSuchItem2?: string | null;
    doNotBuy?: string | null;
    missingCash1?: string | null;
    missingCash2?: string | null;
    messageBuy?: string | null;
    messageSell?: string | null;
    keeperId?: number | null;
    zoneId: number;
    createdAt: any;
    updatedAt: any;
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
    buyProfit: number;
    sellProfit: number;
    temper1: number;
    flags: Array<ShopFlag>;
    tradesWithFlags: Array<ShopTradesWith>;
    noSuchItem1?: string | null;
    noSuchItem2?: string | null;
    doNotBuy?: string | null;
    missingCash1?: string | null;
    missingCash2?: string | null;
    messageBuy?: string | null;
    messageSell?: string | null;
    keeperId?: number | null;
    zoneId: number;
    createdAt: any;
    updatedAt: any;
  }>;
};

export type DeleteShopMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;

export type DeleteShopMutation = {
  __typename?: 'Mutation';
  deleteShop: { __typename?: 'ShopDto'; id: number };
};

export type UsersQueryVariables = Exact<{ [key: string]: never }>;

export type UsersQuery = {
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

export type UpdateUserMutationVariables = Exact<{
  input: UpdateUserInput;
}>;

export type UpdateUserMutation = {
  __typename?: 'Mutation';
  updateUser: {
    __typename?: 'User';
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
};

export type BanUserMutationVariables = Exact<{
  input: BanUserInput;
}>;

export type BanUserMutation = {
  __typename?: 'Mutation';
  banUser: {
    __typename?: 'BanRecord';
    id: string;
    reason: string;
    bannedAt: any;
    userId: string;
  };
};

export type UnbanUserMutationVariables = Exact<{
  input: UnbanUserInput;
}>;

export type UnbanUserMutation = {
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
  zones: Array<{
    __typename?: 'ZoneDto';
    id: number;
    name: string;
    climate: Climate;
  }>;
};

export type RequestPasswordResetMutationVariables = Exact<{
  input: RequestPasswordResetInput;
}>;

export type RequestPasswordResetMutation = {
  __typename?: 'Mutation';
  requestPasswordReset: {
    __typename?: 'PasswordResetResponse';
    success: boolean;
    message: string;
  };
};

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
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
  input: UpdateProfileInput;
}>;

export type UpdateProfileMutation = {
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

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;

export type ResetPasswordMutation = {
  __typename?: 'Mutation';
  resetPassword: {
    __typename?: 'PasswordResetResponse';
    success: boolean;
    message: string;
  };
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
    argList?: string | null;
    commands: string;
    variables: string;
    flags: Array<TriggerFlag>;
    mobId?: number | null;
    objectId?: number | null;
    zoneId?: number | null;
    createdAt: any;
    updatedAt: any;
  }>;
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
    argList?: string | null;
    commands: string;
    variables: string;
    flags: Array<TriggerFlag>;
    mobId?: number | null;
    objectId?: number | null;
    zoneId?: number | null;
    createdAt: any;
    updatedAt: any;
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
    commands: string;
    variables: string;
  };
};

export type UpdateTriggerMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: UpdateTriggerInput;
}>;

export type UpdateTriggerMutation = {
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

export type DeleteTriggerMutationVariables = Exact<{
  id: Scalars['String']['input'];
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
    mobId?: number | null;
    objectId?: number | null;
    zoneId?: number | null;
  };
};

export type DetachTriggerMutationVariables = Exact<{
  triggerId: Scalars['String']['input'];
}>;

export type DetachTriggerMutation = {
  __typename?: 'Mutation';
  detachTrigger: { __typename?: 'TriggerDto'; id: string; name: string };
};

export type GetZonesForSelectorQueryVariables = Exact<{ [key: string]: never }>;

export type GetZonesForSelectorQuery = {
  __typename?: 'Query';
  zones: Array<{ __typename?: 'ZoneDto'; id: number; name: string }>;
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
    items: Array<{
      __typename?: 'CharacterItemDto';
      id: string;
      equippedLocation?: string | null;
      condition: number;
      charges: number;
      objectPrototype: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        shortDesc: string;
        type: string;
      };
    }>;
    effects: Array<{
      __typename?: 'CharacterEffectDto';
      id: string;
      effectName: string;
      effectType?: string | null;
      duration?: number | null;
      strength: number;
      appliedAt: any;
      expiresAt?: any | null;
    }>;
  };
};

export type GetCharacterSessionInfoQueryVariables = Exact<{
  characterId: Scalars['ID']['input'];
}>;

export type GetCharacterSessionInfoQuery = {
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
    class?: string | null;
    lastLogin?: any | null;
    timePlayed: number;
    isOnline: boolean;
    isLinked: boolean;
    hasPassword: boolean;
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
    raceType?: string | null;
    playerClass?: string | null;
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
        shortDesc: string;
        type: ObjectType;
        keywords: string;
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
    shortDesc: string;
    type: ObjectType;
    keywords: string;
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

export type GetMobResetsLegacyQueryVariables = Exact<{
  mobId: Scalars['Int']['input'];
}>;

export type GetMobResetsLegacyQuery = {
  __typename?: 'Query';
  mobResets: Array<{
    __typename?: 'MobResetDto';
    id: string;
    max: number;
    name?: string | null;
    roomId: number;
    carrying: Array<{
      __typename?: 'MobCarryingDto';
      id: string;
      max: number;
      name?: string | null;
      objectId: number;
      object: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        shortDesc: string;
        type: string;
      };
    }>;
    equipped: Array<{
      __typename?: 'MobEquippedDto';
      id: string;
      max: number;
      location: string;
      name?: string | null;
      objectId: number;
      object: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        shortDesc: string;
        type: string;
      };
    }>;
  }>;
};

export type GetObjectsLegacyQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetObjectsLegacyQuery = {
  __typename?: 'Query';
  objects: Array<{
    __typename?: 'ObjectDto';
    id: number;
    shortDesc: string;
    type: ObjectType;
    keywords: string;
    wearFlags: Array<WearFlag>;
  }>;
};

export type CreateMobResetMutationVariables = Exact<{
  data: CreateMobResetInput;
}>;

export type CreateMobResetMutation = {
  __typename?: 'Mutation';
  createMobReset: {
    __typename?: 'MobResetDto';
    id: string;
    max: number;
    name?: string | null;
    roomId: number;
  };
};

export type UpdateMobResetMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  data: UpdateMobResetInput;
}>;

export type UpdateMobResetMutation = {
  __typename?: 'Mutation';
  updateMobReset: {
    __typename?: 'MobResetDto';
    id: string;
    max: number;
    name?: string | null;
    roomId: number;
  };
};

export type DeleteMobCarryingMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteMobCarryingMutation = {
  __typename?: 'Mutation';
  deleteMobCarrying: boolean;
};

export type DeleteMobEquippedMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;

export type DeleteMobEquippedMutation = {
  __typename?: 'Mutation';
  deleteMobEquipped: boolean;
};

export type GetMobResetsForMobQueryVariables = Exact<{
  mobId: Scalars['Int']['input'];
}>;

export type GetMobResetsForMobQuery = {
  __typename?: 'Query';
  mobResets: Array<{
    __typename?: 'MobResetDto';
    id: string;
    max: number;
    name?: string | null;
    roomId: number;
    carrying: Array<{
      __typename?: 'MobCarryingDto';
      id: string;
      max: number;
      name?: string | null;
      objectId: number;
      object: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        shortDesc: string;
        type: string;
      };
    }>;
    equipped: Array<{
      __typename?: 'MobEquippedDto';
      id: string;
      max: number;
      location: string;
      name?: string | null;
      objectId: number;
      object: {
        __typename?: 'ObjectSummaryDto';
        id: number;
        shortDesc: string;
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
        shortDesc: string;
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
    shortDesc: string;
    type: ObjectType;
    keywords: string;
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
