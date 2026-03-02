/**
 * Complete MUD Lua API surface definition.
 *
 * Source of truth: fierymud/src/scripting/ C++ bindings.
 * Used by the linter to detect undefined globals and invalid member accesses.
 */

// ---------------------------------------------------------------------------
// Global functions available in every trigger
// ---------------------------------------------------------------------------

export const GLOBAL_FUNCTIONS = new Set([
  // Probability & randomness
  'dice',
  'random',
  'percent_chance',
  // Logging
  'echo',
  'log_debug',
  'log_warn',
  'log_error',
  // Time
  'timestamp',
  'mud_time',
  // Control flow
  'wait',
  // Room lookup
  'get_room',
  // Trigger execution
  'run_room_trigger',
  // Direction helpers
  'reverse_direction',
  'direction_name',
]);

// ---------------------------------------------------------------------------
// Namespaces (tables with known methods)
// ---------------------------------------------------------------------------

export const NAMESPACE_MEMBERS: Record<string, Set<string>> = {
  world: new Set([
    'find_player',
    'find_mobile',
    'count_mobiles',
    'count_objects',
    'destroy',
  ]),
  combat: new Set(['engage', 'rescue', 'disengage', 'is_fighting']),
  effects: new Set(['apply', 'remove', 'has', 'duration']),
  spells: new Set(['cast', 'exists']),
  skills: new Set(['execute', 'exists', 'get_level', 'set_level']),
  quest: new Set([
    'start',
    'complete',
    'abandon',
    'status',
    'has_quest',
    'is_available',
    'is_completed',
    'advance_objective',
    'set_variable',
    'get_variable',
  ]),
  zone: new Set(['echo', 'reset']),
  timers: new Set(['after', 'cancel']),
  vars: new Set(['set', 'get', 'has', 'clear', 'all']),
  objects: new Set(['template']),
  mobiles: new Set(['template']),
};

export const NAMESPACE_NAMES = new Set(Object.keys(NAMESPACE_MEMBERS));

// ---------------------------------------------------------------------------
// Enum tables (accessed as Enum.Value)
// ---------------------------------------------------------------------------

export const ENUM_MEMBERS: Record<string, Set<string>> = {
  Position: new Set([
    'Dead',
    'Ghost',
    'MortallyWounded',
    'Incapacitated',
    'Stunned',
    'Sleeping',
    'Resting',
    'Sitting',
    'Prone',
    'Fighting',
    'Standing',
    'Flying',
  ]),
  Direction: new Set([
    'North',
    'East',
    'South',
    'West',
    'Up',
    'Down',
    'Northeast',
    'Northwest',
    'Southeast',
    'Southwest',
    'In',
    'Out',
    'Portal',
  ]),
  SectorType: new Set([
    'Inside',
    'City',
    'Field',
    'Forest',
    'Hills',
    'Mountains',
    'WaterSwim',
    'WaterNoswim',
    'Underwater',
    'Flying',
    'Desert',
    'Swamp',
    'Beach',
    'Road',
    'Underground',
    'Lava',
    'Ice',
    'Astral',
    'Fire',
    'Lightning',
    'Spirit',
    'Badlands',
    'Void',
  ]),
  ObjectType: new Set([
    'Light',
    'Scroll',
    'Wand',
    'Staff',
    'Weapon',
    'Fireweapon',
    'Missile',
    'Treasure',
    'Armor',
    'Potion',
    'Worn',
    'Other',
    'Container',
    'Note',
    'Drinkcontainer',
    'Key',
    'Food',
    'Money',
    'Fountain',
    'Portal',
    'Spellbook',
    'Corpse',
  ]),
  EquipSlot: new Set([
    'None',
    'Light',
    'FingerR',
    'FingerL',
    'Neck1',
    'Neck2',
    'Body',
    'Head',
    'Legs',
    'Feet',
    'Hands',
    'Arms',
    'Shield',
    'About',
    'Waist',
    'WristR',
    'WristL',
    'Wield',
    'Hold',
    'Wield2',
  ]),
  ObjectFlag: new Set([
    'Glow',
    'Hum',
    'Temporary',
    'NoDonate',
    'Invisible',
    'Magic',
    'NoDrop',
    'Bless',
    'AntiGood',
    'AntiEvil',
    'AntiNeutral',
    'NoSell',
    'Cursed',
    'TwoHanded',
    'Poison',
  ]),
  ActorFlag: new Set([
    'Blind',
    'Invisible',
    'DetectInvis',
    'DetectMagic',
    'SenseLife',
    'Sanctuary',
    'Poison',
    'Flying',
    'Sneak',
    'Hide',
    'Charm',
    'Haste',
    'Slow',
    'Berserk',
    'Paralyzed',
  ]),
  MobTrait: new Set([
    'Illusion',
    'Animated',
    'PlayerPhantasm',
    'Aquatic',
    'Mount',
    'Summoned',
    'Pet',
  ]),
  MobBehavior: new Set([
    'Sentinel',
    'StayZone',
    'Scavenger',
    'Track',
    'SlowTrack',
    'FastTrack',
    'Wimpy',
    'Aware',
    'Helper',
    'Protector',
    'Peacekeeper',
    'NoBash',
    'NoSummon',
    'NoVicious',
    'Memory',
    'Teacher',
    'Meditate',
    'NoScript',
    'NoClassAi',
    'Peaceful',
    'NoKill',
  ]),
  MobProfession: new Set([
    'Banker',
    'Shopkeeper',
    'Receptionist',
    'Postmaster',
    'Guildmaster',
    'Trainer',
  ]),
  Effect: new Set([
    'Invisible',
    'Sanctuary',
    'Bless',
    'Armor',
    'Shield',
    'Stoneskin',
    'Haste',
    'Slow',
    'Fly',
    'Flying',
    'Levitate',
    'Infravision',
    'DetectInvis',
    'DetectMagic',
    'DetectAlign',
    'SenseLife',
    'Waterwalk',
    'WaterBreathing',
    'Blind',
    'Poison',
    'Curse',
    'Paralyzed',
    'Sleep',
    'Charm',
    'Berserk',
    'Sneak',
    'Hide',
    'ProtectionEvil',
    'ProtectionGood',
    'FireShield',
    'ColdShield',
    'HeatResistance',
    'ColdResistance',
  ]),
};

export const ENUM_NAMES = new Set(Object.keys(ENUM_MEMBERS));

// ---------------------------------------------------------------------------
// Context variables injected before trigger execution
// ---------------------------------------------------------------------------

export const CONTEXT_VARIABLES = new Set([
  'self',
  'actor',
  'target',
  'object',
  'room',
  'cmd',
  'arg',
  'speech',
  'direction',
  'amount',
  'damage',
  'globals',
  'vars',
  '__trigger_zone_id',
  '__trigger_id',
  '__trigger_name',
]);

// ---------------------------------------------------------------------------
// Lua builtins
// ---------------------------------------------------------------------------

export const LUA_BUILTINS = new Set([
  // Standard libraries
  'string',
  'table',
  'math',
  'coroutine',
  'os',
  'io',
  'debug',
  // Global functions
  'print',
  'type',
  'tonumber',
  'tostring',
  'pairs',
  'ipairs',
  'next',
  'select',
  'unpack',
  'error',
  'pcall',
  'xpcall',
  'assert',
  'rawlen',
  'rawget',
  'rawset',
  'rawequal',
  'setmetatable',
  'getmetatable',
  'require',
  'dofile',
  'loadfile',
  'load',
  'loadstring',
  // Constants
  '_VERSION',
  '_G',
]);

/** Members of Lua standard library tables that should not be flagged */
export const LUA_LIBRARY_MEMBERS: Record<string, Set<string>> = {
  string: new Set([
    'byte',
    'char',
    'find',
    'format',
    'gmatch',
    'gsub',
    'len',
    'lower',
    'match',
    'rep',
    'reverse',
    'sub',
    'upper',
    'dump',
  ]),
  table: new Set([
    'concat',
    'insert',
    'move',
    'pack',
    'remove',
    'sort',
    'unpack',
    'maxn',
  ]),
  math: new Set([
    'abs',
    'acos',
    'asin',
    'atan',
    'atan2',
    'ceil',
    'cos',
    'deg',
    'exp',
    'floor',
    'fmod',
    'huge',
    'log',
    'max',
    'maxinteger',
    'min',
    'mininteger',
    'modf',
    'pi',
    'rad',
    'random',
    'randomseed',
    'sin',
    'sqrt',
    'tan',
    'tointeger',
    'type',
  ]),
  coroutine: new Set([
    'create',
    'isyieldable',
    'resume',
    'running',
    'status',
    'wrap',
    'yield',
  ]),
  os: new Set(['clock', 'date', 'difftime', 'time']),
};

// ---------------------------------------------------------------------------
// Usertype properties and methods
// ---------------------------------------------------------------------------

/** Actor (player/mobile) properties — read via `.` */
export const ACTOR_PROPERTIES = new Set([
  'zone_id',
  'local_id',
  'name',
  'display_name',
  'level',
  'hp',
  'max_hp',
  'mana',
  'max_mana',
  'stamina',
  'max_stamina',
  'move',
  'max_move',
  'alignment',
  'wealth',
  'strength',
  'dexterity',
  'intelligence',
  'wisdom',
  'constitution',
  'charisma',
  'position',
  'position_name',
  'room',
  'is_npc',
  'is_player',
  'is_fighting',
  'is_alive',
  'can_act',
  'is_afk',
  'gender',
  'race',
  'size',
  'subject',
  'object',
  'possessive',
  // NPC properties
  'is_aggressive',
  'is_shopkeeper',
  'is_banker',
  'is_teacher',
  'prototype_id',
  'description',
  'damage_dice_num',
  'damage_dice_size',
  // Player properties
  'is_god',
  'is_online',
  'is_linkdead',
  'class',
  'title',
  'in_clan',
  'clan_name',
  'clan_rank',
  'is_brief',
  'is_autoloot',
  'is_pk_enabled',
  'master',
  'has_master',
]);

/** Actor methods — called via `:` */
export const ACTOR_METHODS = new Set([
  'send',
  'say',
  'emote',
  'whisper',
  'damage',
  'heal',
  'engage',
  'rescue',
  'disengage',
  'cast',
  'has_item',
  'item_count',
  'has_item_id',
  'has_equipped',
  'get_worn',
  'spawn_object',
  'destroy_item',
  'give_wealth',
  'take_wealth',
  'has_wealth',
  'has_effect',
  'has_effect_named',
  'get_has_spell',
  'has_flag',
  'has_trait',
  'has_behavior',
  'has_profession',
  'follow',
  'stop_following',
  'teleport',
  'move',
  'command',
  'is_god',
  // Legacy quest bindings
  'start_quest',
  'get_quest_stage',
  'advance_quest',
  'complete_quest',
  'get_has_completed',
  'set_quest_var',
  'get_quest_var',
]);

/** Room properties — read via `.` */
export const ROOM_PROPERTIES = new Set([
  'name',
  'id',
  'zone_id',
  'local_id',
  'sector',
  'sector_name',
  'base_light_level',
  'effective_light',
  'capacity',
  'is_dark',
  'is_peaceful',
  'allows_magic',
  'allows_recall',
  'allows_summon',
  'allows_teleport',
  'is_death_trap',
  'is_full',
  'entry_restriction',
  'has_entry_restriction',
  'actors',
  'actor_count',
  'objects',
  'object_count',
  'exits',
]);

/** Room methods — called via `:` */
export const ROOM_METHODS = new Set([
  'has_exit',
  'exit_is_open',
  'exit_is_locked',
  'get_exit_room',
  'exit',
  'dir',
  'find_actor',
  'find_actors',
  'find_object',
  'find_objects',
  'send',
  'send_except',
  'send_to_adjacent',
  'spawn_mobile',
  'spawn_object',
  'purge',
  'at',
]);

/** Object properties — read via `.` */
export const OBJECT_PROPERTIES = new Set([
  'name',
  'display_name',
  'short_desc',
  'shortdesc',
  'id',
  'zone_id',
  'local_id',
  'type',
  'equip_slot',
  'weight',
  'base_weight',
  'value',
  'level',
  'is_weapon',
  'is_armor',
  'is_container',
  'is_light_source',
  'is_wearable',
  'is_magic_item',
  'is_potion',
  'is_scroll',
  'is_wand',
  'is_staff',
  'spell_level',
  'damage_dice_num',
  'damage_dice_size',
  'damage_bonus',
  'average_damage',
  // Container
  'capacity',
  'item_count',
  'is_empty',
  'is_full',
  'is_closed',
  'is_locked',
  'items',
]);

/** Object methods — called via `:` */
export const OBJECT_METHODS = new Set([
  'is_type',
  'has_flag',
  'find_item',
  'has_item',
]);

/** Exit properties — read via `.` */
export const EXIT_PROPERTIES = new Set([
  'description',
  'name',
  'direction',
  'room',
  'destination',
  'has_door',
  'is_closed',
  'is_locked',
  'is_pickproof',
  'is_hidden',
  'is_passable',
]);

/** Exit methods — called via `:` */
export const EXIT_METHODS = new Set([
  'is_valid',
  'open',
  'close',
  'lock',
  'unlock',
  'set_state',
  'set_destination',
]);

// ---------------------------------------------------------------------------
// Context variable → usertype mapping
// ---------------------------------------------------------------------------

export type UsertypeName = 'actor' | 'room' | 'object' | 'exit';

/** Maps context variable names to their usertype for member validation */
export const CONTEXT_VAR_TYPES: Record<string, UsertypeName> = {
  self: 'actor', // can also be room/object, but actor is the common case
  actor: 'actor',
  target: 'actor',
  room: 'room',
  object: 'object',
};

/** Lookup tables for property/method validation per usertype */
export const USERTYPE_PROPERTIES: Record<UsertypeName, Set<string>> = {
  actor: ACTOR_PROPERTIES,
  room: ROOM_PROPERTIES,
  object: OBJECT_PROPERTIES,
  exit: EXIT_PROPERTIES,
};

export const USERTYPE_METHODS: Record<UsertypeName, Set<string>> = {
  actor: ACTOR_METHODS,
  room: ROOM_METHODS,
  object: OBJECT_METHODS,
  exit: EXIT_METHODS,
};

// ---------------------------------------------------------------------------
// Combined set of all known globals (for undefined-global rule)
// ---------------------------------------------------------------------------

export function getAllKnownGlobals(): Set<string> {
  const all = new Set<string>();
  for (const g of GLOBAL_FUNCTIONS) all.add(g);
  for (const g of NAMESPACE_NAMES) all.add(g);
  for (const g of ENUM_NAMES) all.add(g);
  for (const g of CONTEXT_VARIABLES) all.add(g);
  for (const g of LUA_BUILTINS) all.add(g);
  return all;
}
