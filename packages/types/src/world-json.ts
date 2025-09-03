// Types for parsing FieryMUD world JSON files
// Based on docs/WORLD_JSON_FORMAT.md

// ============================================================================
// Top-Level World File Structure
// ============================================================================

export interface WorldFile {
  zone: ZoneJson;
  mobs: MobJson[];
  objects: ObjectJson[];
  rooms: RoomJson[];
  shops: ShopJson[];
  triggers: TriggerJson[];
}

// ============================================================================
// Zone Definition
// ============================================================================

export interface ZoneJson {
  id: string;
  name: string;
  top: number;
  lifespan: number;
  reset_mode: ResetMode;
  hemisphere: Hemisphere;
  climate: Climate;
  resets: ZoneResets;
}

export interface ZoneResets {
  mob?: MobResetJson[];
}

export interface MobResetJson {
  id: number;
  max: number;
  room: number;
  name: string;
  carrying?: MobCarryingJson[];
  equipped?: MobEquippedJson[];
}

export interface MobCarryingJson {
  id: number;
  max: number;
  name: string;
}

export interface MobEquippedJson {
  id: number;
  max: number;
  location: string;
  name: string;
}

// ============================================================================
// Mob Definition
// ============================================================================

export interface MobJson {
  id: number;
  keywords?: string; // Legacy field
  name_list?: string; // Alternative field name
  short_desc?: string; // Legacy field
  short_description?: string; // Alternative field name
  long_desc?: string; // Legacy field
  long_description?: string; // Alternative field name
  desc?: string; // Legacy field
  description?: string; // Alternative field name
  mob_class: string;
  mob_flags: MobFlag[];
  effect_flags: EffectFlag[];
  alignment: number;
  level: number;
  hp_dice: DiceExpression;
  move: number;
  ac: number;
  hit_roll: number;
  damage_dice: DiceExpression;
  money: Currency;
  position: Position;
  default_position: Position;
  gender: Gender;
  race: Race;
  race_align: number;
  size: Size;
  stats: MobStats;
  perception: number;
  concealment: number;
  life_force: LifeForce;
  composition: Composition;
  stance: Stance;
  damage_type: DamageType;
}

export interface MobStats {
  strength: number;
  intelligence: number;
  wisdom: number;
  dexterity: number;
  constitution: number;
  charisma: number;
}

export interface DiceExpression {
  num: number;
  size: number;
  bonus: number;
}

export interface Currency {
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
}

// ============================================================================
// Object Definition
// ============================================================================

export interface ObjectJson {
  id: string;
  type: ObjectType;
  keywords?: string; // Legacy field
  name_list?: string; // Alternative field name
  short_desc?: string; // Legacy field
  short_description?: string; // Alternative field name
  description: string;
  action_description?: string;
  extra_descriptions?: ExtraDescription[] | Record<string, string>;
  values: Record<string, string | number>;
  flags: ObjectFlag[];
  weight: string | number;
  cost: string | number;
  timer: string | number;
  decompose_timer: string | number;
  level: string | number;
  effect_flags: EffectFlag[];
  wear_flags: WearFlag[];
  concealment: number;
  affects: ObjectAffect[];
  applies?: Record<string, any>;
  spells: any[];
  triggers: any[];
  script_variables?: Record<string, any>;
  effects: any[];
}

export interface ExtraDescription {
  keyword: string;
  desc: string;
}

export interface ObjectAffect {
  location: string;
  modifier: number;
}

// ============================================================================
// Room Definition
// ============================================================================

export interface RoomJson {
  id: string;
  name: string;
  description: string;
  sector: Sector;
  flags: RoomFlag[];
  exits: Record<Direction, RoomExitJson>;
  extra_descriptions?: Record<string, string>;
}

export interface RoomExitJson {
  description?: string;
  keyword?: string;
  key: string;
  destination: string;
}

// ============================================================================
// Shop Definition
// ============================================================================

export interface ShopJson {
  id: number;
  selling: Record<string, number>;
  buy_profit: number;
  sell_profit: number;
  accepts: ShopAcceptJson[];
  no_such_item1?: string;
  no_such_item2?: string;
  do_not_buy?: string;
  missing_cash1?: string;
  missing_cash2?: string;
  message_buy?: string;
  message_sell?: string;
  temper1: number;
  flags: ShopFlag[];
  keeper: number;
  trades_with: ShopTradesWith[];
  rooms: number[];
  hours: ShopHourJson[];
}

export interface ShopAcceptJson {
  type: string;
  keywords: string;
}

export interface ShopHourJson {
  open: number;
  close: number;
}

// ============================================================================
// Trigger Definition
// ============================================================================

export interface TriggerJson {
  id: string;
  name: string;
  attach_type: ScriptType;
  flags: TriggerFlag[];
  number_of_arguments: string;
  argument_list: string;
  commands: string;
}

// ============================================================================
// Enums
// ============================================================================

export enum ResetMode {
  NEVER = 'Never',
  EMPTY = 'Empty',
  NORMAL = 'Normal',
}

export enum Hemisphere {
  NORTHWEST = 'NORTHWEST',
  NORTHEAST = 'NORTHEAST',
  SOUTHWEST = 'SOUTHWEST',
  SOUTHEAST = 'SOUTHEAST',
}

export enum Climate {
  NONE = 'NONE',
  SEMIARID = 'SEMIARID',
  ARID = 'ARID',
  OCEANIC = 'OCEANIC',
  TEMPERATE = 'TEMPERATE',
  SUBTROPICAL = 'SUBTROPICAL',
  TROPICAL = 'TROPICAL',
  SUBARCTIC = 'SUBARCTIC',
  ARCTIC = 'ARCTIC',
  ALPINE = 'ALPINE',
}

export enum MobFlag {
  SPEC = 'SPEC',
  SENTINEL = 'SENTINEL',
  SCAVENGER = 'SCAVENGER',
  ISNPC = 'ISNPC',
  AWARE = 'AWARE',
  AGGRESSIVE = 'AGGRESSIVE',
  STAY_ZONE = 'STAY_ZONE',
  WIMPY = 'WIMPY',
  AGGRO_EVIL = 'AGGRO_EVIL',
  AGGRO_GOOD = 'AGGRO_GOOD',
  AGGRO_NEUTRAL = 'AGGRO_NEUTRAL',
  MEMORY = 'MEMORY',
  HELPER = 'HELPER',
  NO_CHARM = 'NO_CHARM',
  NO_SUMMOM = 'NO_SUMMOM',
  NO_SLEEP = 'NO_SLEEP',
  NO_BASH = 'NO_BASH',
  NO_BLIND = 'NO_BLIND',
  MOUNT = 'MOUNT',
  STAY_SECT = 'STAY_SECT',
  HATES_SUN = 'HATES_SUN',
  NO_KILL = 'NO_KILL',
  TRACK = 'TRACK',
  ILLUSION = 'ILLUSION',
  POISON_BITE = 'POISON_BITE',
  THIEF = 'THIEF',
  WARRIOR = 'WARRIOR',
  SORCERER = 'SORCERER',
  CLERIC = 'CLERIC',
  PALADIN = 'PALADIN',
  ANTI_PALADIN = 'ANTI_PALADIN',
  RANGER = 'RANGER',
  DRUID = 'DRUID',
  SHAMAN = 'SHAMAN',
  ASSASSIN = 'ASSASSIN',
  MERCENARY = 'MERCENARY',
  NECROMANCER = 'NECROMANCER',
  CONJURER = 'CONJURER',
  MONK = 'MONK',
  BERSERKER = 'BERSERKER',
  DIABOLIST = 'DIABOLIST',
  TEACHER = 'TEACHER',
}

export enum EffectFlag {
  BLIND = 'BLIND',
  INVISIBLE = 'INVISIBLE',
  DETECT_ALIGN = 'DETECT_ALIGN',
  DETECT_INVIS = 'DETECT_INVIS',
  DETECT_MAGIC = 'DETECT_MAGIC',
  SENSE_LIFE = 'SENSE_LIFE',
  WATERWALK = 'WATERWALK',
  SANCTUARY = 'SANCTUARY',
  GROUP = 'GROUP',
  CURSE = 'CURSE',
  INFRAVISION = 'INFRAVISION',
  POISON = 'POISON',
  PROTECT_EVIL = 'PROTECT_EVIL',
  PROTECT_GOOD = 'PROTECT_GOOD',
  SLEEP = 'SLEEP',
  NO_TRACK = 'NO_TRACK',
  SNEAK = 'SNEAK',
  HIDE = 'HIDE',
  CHARM = 'CHARM',
  FLYING = 'FLYING',
  WATERBREATH = 'WATERBREATH',
  ANGELIC_AURA = 'ANGELIC_AURA',
  ETHEREAL = 'ETHEREAL',
  MAGICONLY = 'MAGICONLY',
  NEXTPARTIAL = 'NEXTPARTIAL',
  NEXTNOATTACK = 'NEXTNOATTACK',
  SPELL_TURNING = 'SPELL_TURNING',
  COMPREHEND_LANG = 'COMPREHEND_LANG',
  FIRESHIELD = 'FIRESHIELD',
  DEATH_FIELD = 'DEATH_FIELD',
  MAJOR_PARALYSIS = 'MAJOR_PARALYSIS',
  MINOR_PARALYSIS = 'MINOR_PARALYSIS',
  DRAGON_RIDE = 'DRAGON_RIDE',
  COSMIC_TRAVEL = 'COSMIC_TRAVEL',
  MENTAL_BARRIER = 'MENTAL_BARRIER',
  VITALITY = 'VITALITY',
  HASTE = 'HASTE',
  SLOW = 'SLOW',
  CONFUSION = 'CONFUSION',
  MIST_WALK = 'MIST_WALK',
  BURNING_HANDS = 'BURNING_HANDS',
  FAERIE_FIRE = 'FAERIE_FIRE',
  DARKNESS = 'DARKNESS',
  INVISIBLE_STALKER = 'INVISIBLE_STALKER',
  FEBLEMIND = 'FEBLEMIND',
  FLUORESCENCE = 'FLUORESCENCE',
  RESTLESS = 'RESTLESS',
  ASH_EYES = 'ASH_EYES',
  DILATE_PUPILS = 'DILATE_PUPILS',
  FLAME_SHROUD = 'FLAME_SHROUD',
  BARKSKIN = 'BARKSKIN',
  ULTRA_DAMAGE = 'ULTRA_DAMAGE',
  SHILLELAGH = 'SHILLELAGH',
  SUN_RAY = 'SUN_RAY',
  WITHER_LIMB = 'WITHER_LIMB',
  PETRIFY = 'PETRIFY',
  DISEASE = 'DISEASE',
  PLAGUE = 'PLAGUE',
  SCOURGE = 'SCOURGE',
  VAMPIRIC_DRAIN = 'VAMPIRIC_DRAIN',
  MOON_BEAM = 'MOON_BEAM',
  TORNADO = 'TORNADO',
  EARTHMAW = 'EARTHMAW',
  CYCLONE = 'CYCLONE',
  FLOOD = 'FLOOD',
  METEOR = 'METEOR',
  FIRESTORM = 'FIRESTORM',
  SILENCE = 'SILENCE',
  CALM = 'CALM',
  ENTANGLE = 'ENTANGLE',
  ANIMAL_KIN = 'ANIMAL_KIN',
}

export enum Position {
  PRONE = 'PRONE',
  SITTING = 'SITTING',
  KNEELING = 'KNEELING',
  STANDING = 'STANDING',
  FLYING = 'FLYING',
}

export enum Gender {
  NEUTRAL = 'NEUTRAL',
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
}

export enum Race {
  HUMAN = 'HUMAN',
  ELF = 'ELF',
  GNOME = 'GNOME',
  DWARF = 'DWARF',
  TROLL = 'TROLL',
  DROW = 'DROW',
  DUERGAR = 'DUERGAR',
  OGRE = 'OGRE',
  ORC = 'ORC',
  HALF_ELF = 'HALF_ELF',
  BARBARIAN = 'BARBARIAN',
  HALFLING = 'HALFLING',
  PLANT = 'PLANT',
  HUMANOID = 'HUMANOID',
  ANIMAL = 'ANIMAL',
  DRAGON_GENERAL = 'DRAGON_GENERAL',
  GIANT = 'GIANT',
  OTHER = 'OTHER',
  GOBLIN = 'GOBLIN',
  DEMON = 'DEMON',
  BROWNIE = 'BROWNIE',
  DRAGON_FIRE = 'DRAGON_FIRE',
  DRAGON_FROST = 'DRAGON_FROST',
  DRAGON_ACID = 'DRAGON_ACID',
  DRAGON_LIGHTNING = 'DRAGON_LIGHTNING',
  DRAGON_GAS = 'DRAGON_GAS',
  DRAGONBORN_FIRE = 'DRAGONBORN_FIRE',
  DRAGONBORN_FROST = 'DRAGONBORN_FROST',
  DRAGONBORN_ACID = 'DRAGONBORN_ACID',
  DRAGONBORN_LIGHTNING = 'DRAGONBORN_LIGHTNING',
  DRAGONBORN_GAS = 'DRAGONBORN_GAS',
  SVERFNEBLIN = 'SVERFNEBLIN',
  FAERIE_SEELIE = 'FAERIE_SEELIE',
  FAERIE_UNSEELIE = 'FAERIE_UNSEELIE',
  NYMPH = 'NYMPH',
  ARBOREAN = 'ARBOREAN',
}

export enum Size {
  TINY = 'TINY',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  HUGE = 'HUGE',
  GIANT = 'GIANT',
  GARGANTUAN = 'GARGANTUAN',
  COLOSSAL = 'COLOSSAL',
  TITANIC = 'TITANIC',
  MOUNTAINOUS = 'MOUNTAINOUS',
}

export enum LifeForce {
  LIFE = 'LIFE',
  UNDEAD = 'UNDEAD',
  MAGIC = 'MAGIC',
  CELESTIAL = 'CELESTIAL',
  DEMONIC = 'DEMONIC',
  ELEMENTAL = 'ELEMENTAL',
}

export enum Composition {
  FLESH = 'FLESH',
  EARTH = 'EARTH',
  AIR = 'AIR',
  FIRE = 'FIRE',
  WATER = 'WATER',
  ICE = 'ICE',
  MIST = 'MIST',
  ETHER = 'ETHER',
  METAL = 'METAL',
  STONE = 'STONE',
  BONE = 'BONE',
  LAVA = 'LAVA',
  PLANT = 'PLANT',
}

export enum Stance {
  DEAD = 'DEAD',
  MORT = 'MORT',
  INCAPACITATED = 'INCAPACITATED',
  STUNNED = 'STUNNED',
  SLEEPING = 'SLEEPING',
  RESTING = 'RESTING',
  ALERT = 'ALERT',
  FIGHTING = 'FIGHTING',
}

export enum DamageType {
  HIT = 'HIT',
  STING = 'STING',
  WHIP = 'WHIP',
  SLASH = 'SLASH',
  BITE = 'BITE',
  BLUDGEON = 'BLUDGEON',
  CRUSH = 'CRUSH',
  POUND = 'POUND',
  CLAW = 'CLAW',
  MAUL = 'MAUL',
  THRASH = 'THRASH',
  PIERCE = 'PIERCE',
  BLAST = 'BLAST',
  PUNCH = 'PUNCH',
  STAB = 'STAB',
  FIRE = 'FIRE',
  COLD = 'COLD',
  ACID = 'ACID',
  SHOCK = 'SHOCK',
  POISON = 'POISON',
  ALIGN = 'ALIGN',
}

export enum ObjectType {
  NOTHING = 'NOTHING',
  LIGHT = 'LIGHT',
  SCROLL = 'SCROLL',
  WAND = 'WAND',
  STAFF = 'STAFF',
  WEAPON = 'WEAPON',
  FIREWEAPON = 'FIREWEAPON',
  MISSILE = 'MISSILE',
  TREASURE = 'TREASURE',
  ARMOR = 'ARMOR',
  POTION = 'POTION',
  WORN = 'WORN',
  OTHER = 'OTHER',
  TRASH = 'TRASH',
  TRAP = 'TRAP',
  CONTAINER = 'CONTAINER',
  NOTE = 'NOTE',
  DRINKCONTAINER = 'DRINKCONTAINER',
  DRINKCON = 'DRINKCON', // Alias for DRINKCONTAINER
  KEY = 'KEY',
  FOOD = 'FOOD',
  MONEY = 'MONEY',
  PEN = 'PEN',
  BOAT = 'BOAT',
  FOUNTAIN = 'FOUNTAIN',
  PORTAL = 'PORTAL',
  ROPE = 'ROPE',
  SPELLBOOK = 'SPELLBOOK',
  WALL = 'WALL',
  TOUCHSTONE = 'TOUCHSTONE',
  BOARD = 'BOARD',
  INSTRUMENT = 'INSTRUMENT',
}

export enum ObjectFlag {
  GLOW = 'GLOW',
  HUM = 'HUM',
  NO_RENT = 'NO_RENT',
  ANTI_BERSERKER = 'ANTI_BERSERKER',
  NO_INVISIBLE = 'NO_INVISIBLE',
  INVISIBLE = 'INVISIBLE',
  MAGIC = 'MAGIC',
  NO_DROP = 'NO_DROP',
  PERMANENT = 'PERMANENT',
  ANTI_GOOD = 'ANTI_GOOD',
  ANTI_EVIL = 'ANTI_EVIL',
  ANTI_NEUTRAL = 'ANTI_NEUTRAL',
  ANTI_SORCERER = 'ANTI_SORCERER',
  ANTI_CLERIC = 'ANTI_CLERIC',
  ANTI_ROGUE = 'ANTI_ROGUE',
  ANTI_WARRIOR = 'ANTI_WARRIOR',
  NO_SELL = 'NO_SELL',
  ANTI_PALADIN = 'ANTI_PALADIN',
  ANTI_ANTI_PALADIN = 'ANTI_ANTI_PALADIN',
  ANTI_RANGER = 'ANTI_RANGER',
  ANTI_DRUID = 'ANTI_DRUID',
  ANTI_SHAMAN = 'ANTI_SHAMAN',
  ANTI_ASSASSIN = 'ANTI_ASSASSIN',
  ANTI_MERCENARY = 'ANTI_MERCENARY',
  ANTI_NECROMANCER = 'ANTI_NECROMANCER',
  ANTI_CONJURER = 'ANTI_CONJURER',
  NO_BURN = 'NO_BURN',
  NO_LOCATE = 'NO_LOCATE',
  DECOMPOSING = 'DECOMPOSING',
  FLOAT = 'FLOAT',
  NO_FALL = 'NO_FALL',
  WAS_DISARMED = 'WAS_DISARMED',
  ANTI_MONK = 'ANTI_MONK',
  ANTI_BARD = 'ANTI_BARD',
  ELVEN = 'ELVEN',
  DWARVEN = 'DWARVEN',
  ANTI_THIEF = 'ANTI_THIEF',
  ANTI_PYROMANCER = 'ANTI_PYROMANCER',
  ANTI_CRYOMANCER = 'ANTI_CRYOMANCER',
  ANTI_ILLUSIONIST = 'ANTI_ILLUSIONIST',
  ANTI_PRIEST = 'ANTI_PRIEST',
  ANTI_DIABOLIST = 'ANTI_DIABOLIST',
  ANTI_TINY = 'ANTI_TINY',
  ANTI_SMALL = 'ANTI_SMALL',
  ANTI_MEDIUM = 'ANTI_MEDIUM',
  ANTI_LARGE = 'ANTI_LARGE',
  ANTI_HUGE = 'ANTI_HUGE',
  ANTI_GIANT = 'ANTI_GIANT',
  ANTI_GARGANTUAN = 'ANTI_GARGANTUAN',
  ANTI_COLOSSAL = 'ANTI_COLOSSAL',
  ANTI_TITANIC = 'ANTI_TITANIC',
  ANTI_MOUNTAINOUS = 'ANTI_MOUNTAINOUS',
  ANTI_ARBOREAN = 'ANTI_ARBOREAN',
}

export enum WearFlag {
  TAKE = 'TAKE',
  FINGER = 'FINGER',
  NECK = 'NECK',
  BODY = 'BODY',
  HEAD = 'HEAD',
  LEGS = 'LEGS',
  FEET = 'FEET',
  HANDS = 'HANDS',
  ARMS = 'ARMS',
  SHIELD = 'SHIELD',
  ABOUT = 'ABOUT',
  WAIST = 'WAIST',
  WRIST = 'WRIST',
  WIELD = 'WIELD',
  HOLD = 'HOLD',
  TWO_HAND_WIELD = 'TWO_HAND_WIELD',
  EYES = 'EYES',
  FACE = 'FACE',
  EAR = 'EAR',
  BADGE = 'BADGE',
  BELT = 'BELT',
  HOVER = 'HOVER',
}

export enum Sector {
  STRUCTURE = 'STRUCTURE',
  CITY = 'CITY',
  FIELD = 'FIELD',
  FOREST = 'FOREST',
  HILLS = 'HILLS',
  MOUNTAIN = 'MOUNTAIN',
  SHALLOWS = 'SHALLOWS',
  WATER = 'WATER',
  UNDERWATER = 'UNDERWATER',
  AIR = 'AIR',
  ROAD = 'ROAD',
  GRASSLANDS = 'GRASSLANDS',
  CAVE = 'CAVE',
  RUINS = 'RUINS',
  SWAMP = 'SWAMP',
  BEACH = 'BEACH',
  UNDERDARK = 'UNDERDARK',
  ASTRALPLANE = 'ASTRALPLANE',
  AIRPLANE = 'AIRPLANE',
  FIREPLANE = 'FIREPLANE',
  EARTHPLANE = 'EARTHPLANE',
  ETHEREALPLANE = 'ETHEREALPLANE',
  AVERNUS = 'AVERNUS',
}

export enum RoomFlag {
  DARK = 'DARK',
  DEATH = 'DEATH',
  NOMOB = 'NOMOB',
  INDOORS = 'INDOORS',
  PEACEFUL = 'PEACEFUL',
  SOUNDPROOF = 'SOUNDPROOF',
  NOTRACK = 'NOTRACK',
  NOMAGIC = 'NOMAGIC',
  TUNNEL = 'TUNNEL',
  PRIVATE = 'PRIVATE',
  GODROOM = 'GODROOM',
  HOUSE = 'HOUSE',
  HOUSECRASH = 'HOUSECRASH',
  ATRIUM = 'ATRIUM',
  OLC = 'OLC',
  BFS_MARK = 'BFS_MARK',
  WORLDMAP = 'WORLDMAP',
  FERRY_DEST = 'FERRY_DEST',
  ISOLATED = 'ISOLATED',
  ARENA = 'ARENA',
  LARGE = 'LARGE',
  MEDIUM_LARGE = 'MEDIUM_LARGE',
  MEDIUM = 'MEDIUM',
  MEDIUM_SMALL = 'MEDIUM_SMALL',
  SMALL = 'SMALL',
  VERY_SMALL = 'VERY_SMALL',
  ONE_PERSON = 'ONE_PERSON',
  EFFECTS_NEXT = 'EFFECTS_NEXT',
}

export enum Direction {
  NORTH = 'North',
  EAST = 'East',
  SOUTH = 'South',
  WEST = 'West',
  UP = 'Up',
  DOWN = 'Down',
}

export enum ScriptType {
  MOB = 'Mob',
  OBJECT = 'Object',
  WORLD = 'World',
}

export enum TriggerFlag {
  GLOBAL = 'Global',
  RANDOM = 'Random',
  COMMAND = 'Command',
  SPEECH = 'Speech',
  ACT = 'Act',
  DEATH = 'Death',
  DEATH_TRIGGER = 'DEATH_TRIGGER', // Alias
  GREET = 'Greet',
  GREET_ALL = 'GreetAll',
  ENTRY = 'Entry',
  RECEIVE = 'Receive',
  FIGHT = 'Fight',
  HIT_PRCNT = 'HitPrcnt',
  BRIBE = 'Bribe',
  LOAD = 'Load',
  MEMORY = 'Memory',
  CAST = 'Cast',
  LEAVE = 'Leave',
  DOOR = 'Door',
  TIME = 'Time',
  AUTO = 'Auto',
}

export enum ShopFlag {
  WILL_FIGHT = 'WILL_FIGHT',
  USES_BANK = 'USES_BANK',
  WILL_BUY_SAME_ITEM = 'WILL_BUY_SAME_ITEM',
}

export enum ShopTradesWith {
  TRADES_WITH_ANYONE = 'TRADES_WITH_ANYONE',
  ALIGNMENT = 'ALIGNMENT',
  RACE = 'RACE',
  CLASS = 'CLASS',
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ValidationError {
  path: string;
  message: string;
  value?: any;
}

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
}