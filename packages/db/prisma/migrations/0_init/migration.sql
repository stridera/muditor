-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('PLAYER', 'IMMORTAL', 'BUILDER', 'CODER', 'GOD');

-- CreateEnum
CREATE TYPE "public"."ResetMode" AS ENUM ('NEVER', 'EMPTY', 'NORMAL');

-- CreateEnum
CREATE TYPE "public"."Hemisphere" AS ENUM ('NORTHWEST', 'NORTHEAST', 'SOUTHWEST', 'SOUTHEAST');

-- CreateEnum
CREATE TYPE "public"."Climate" AS ENUM ('NONE', 'SEMIARID', 'ARID', 'OCEANIC', 'TEMPERATE', 'SUBTROPICAL', 'TROPICAL', 'SUBARCTIC', 'ARCTIC', 'ALPINE');

-- CreateEnum
CREATE TYPE "public"."Sector" AS ENUM ('STRUCTURE', 'CITY', 'FIELD', 'FOREST', 'HILLS', 'MOUNTAIN', 'SHALLOWS', 'WATER', 'UNDERWATER', 'AIR', 'ROAD', 'GRASSLANDS', 'CAVE', 'RUINS', 'SWAMP', 'BEACH', 'UNDERDARK', 'ASTRALPLANE', 'AIRPLANE', 'FIREPLANE', 'EARTHPLANE', 'ETHEREALPLANE', 'AVERNUS');

-- CreateEnum
CREATE TYPE "public"."Direction" AS ENUM ('NORTH', 'EAST', 'SOUTH', 'WEST', 'UP', 'DOWN');

-- CreateEnum
CREATE TYPE "public"."ObjectType" AS ENUM ('NOTHING', 'LIGHT', 'SCROLL', 'WAND', 'STAFF', 'WEAPON', 'FIREWEAPON', 'MISSILE', 'TREASURE', 'ARMOR', 'POTION', 'WORN', 'OTHER', 'TRASH', 'TRAP', 'CONTAINER', 'NOTE', 'DRINKCONTAINER', 'KEY', 'FOOD', 'MONEY', 'PEN', 'BOAT', 'FOUNTAIN', 'PORTAL', 'ROPE', 'SPELLBOOK', 'WALL', 'TOUCHSTONE', 'BOARD', 'INSTRUMENT');

-- CreateEnum
CREATE TYPE "public"."ScriptType" AS ENUM ('MOB', 'OBJECT', 'WORLD');

-- CreateEnum
CREATE TYPE "public"."MobFlag" AS ENUM ('SPEC', 'SENTINEL', 'SCAVENGER', 'ISNPC', 'AWARE', 'AGGRESSIVE', 'STAY_ZONE', 'WIMPY', 'AGGRO_EVIL', 'AGGRO_GOOD', 'AGGRO_NEUTRAL', 'MEMORY', 'HELPER', 'NO_CHARM', 'NO_SUMMON', 'NO_SLEEP', 'NO_BASH', 'NO_BLIND', 'MOUNT', 'STAY_SECT', 'HATES_SUN', 'NO_KILL', 'TRACK', 'ILLUSION', 'POISON_BITE', 'THIEF', 'WARRIOR', 'SORCERER', 'CLERIC', 'PALADIN', 'ANTI_PALADIN', 'RANGER', 'DRUID', 'SHAMAN', 'ASSASSIN', 'MERCENARY', 'NECROMANCER', 'CONJURER', 'MONK', 'BERSERKER', 'DIABOLIST', 'SLOW_TRACK', 'NOSILENCE', 'PEACEFUL', 'PROTECTOR', 'PEACEKEEPER', 'HASTE', 'BLUR', 'TEACHER', 'MOUNTABLE', 'NOVICIOUS', 'NO_CLASS_AI', 'FAST_TRACK', 'AQUATIC', 'NO_EQ_RESTRICT', 'SUMMONED_MOUNT', 'NOPOISON');

-- CreateEnum
CREATE TYPE "public"."EffectFlag" AS ENUM ('BLIND', 'INVISIBLE', 'DETECT_ALIGN', 'DETECT_INVIS', 'DETECT_MAGIC', 'SENSE_LIFE', 'WATERWALK', 'SANCTUARY', 'GROUP', 'CURSE', 'INFRAVISION', 'POISON', 'PROTECT_EVIL', 'PROTECT_GOOD', 'SLEEP', 'NO_TRACK', 'SNEAK', 'HIDE', 'CHARM', 'FLYING', 'WATERBREATH', 'ANGELIC_AURA', 'ETHEREAL', 'MAGICONLY', 'NEXTPARTIAL', 'NEXTNOATTACK', 'SPELL_TURNING', 'COMPREHEND_LANG', 'FIRESHIELD', 'DEATH_FIELD', 'MAJOR_PARALYSIS', 'MINOR_PARALYSIS', 'DRAGON_RIDE', 'COSMIC_TRAVEL', 'MENTAL_BARRIER', 'VITALITY', 'HASTE', 'SLOW', 'CONFUSION', 'MIST_WALK', 'BURNING_HANDS', 'FAERIE_FIRE', 'DARKNESS', 'INVISIBLE_STALKER', 'FEBLEMIND', 'FLUORESCENCE', 'RESTLESS', 'ASH_EYES', 'DILATE_PUPILS', 'FLAME_SHROUD', 'BARKSKIN', 'ULTRA_DAMAGE', 'SHILLELAGH', 'SUN_RAY', 'WITHER_LIMB', 'PETRIFY', 'DISEASE', 'PLAGUE', 'SCOURGE', 'VAMPIRIC_DRAIN', 'MOON_BEAM', 'TORNADO', 'EARTHMAW', 'CYCLONE', 'FLOOD', 'METEOR', 'FIRESTORM', 'SILENCE', 'CALM', 'ENTANGLE', 'ANIMAL_KIN', 'BLUR', 'ULTRAVISION', 'LIGHT', 'PROT_COLD', 'PROT_AIR', 'PROT_FIRE', 'PROT_EARTH', 'FARSEE', 'STONE_SKIN', 'DETECT_POISON', 'SOULSHIELD', 'TAMED', 'GLORY', 'STEALTH', 'NEGATE_HEAT', 'NEGATE_EARTH', 'NEGATE_COLD', 'NEGATE_AIR', 'MAJOR_GLOBE', 'INSANITY', 'COLDSHIELD', 'CAMOUFLAGED', 'UNUSED', 'REMOTE_AGGR', 'MESMERIZED', 'HARNESS', 'FAMILIARITY', 'DISPLACEMENT', 'BLESS', 'AWARE');

-- CreateEnum
CREATE TYPE "public"."RoomFlag" AS ENUM ('DARK', 'DEATH', 'NOMOB', 'INDOORS', 'PEACEFUL', 'SOUNDPROOF', 'NOTRACK', 'NOMAGIC', 'TUNNEL', 'PRIVATE', 'GODROOM', 'HOUSE', 'HOUSECRASH', 'ATRIUM', 'OLC', 'BFS_MARK', 'WORLDMAP', 'FERRY_DEST', 'ISOLATED', 'ARENA', 'LARGE', 'MEDIUM_LARGE', 'MEDIUM', 'MEDIUM_SMALL', 'SMALL', 'VERY_SMALL', 'ONE_PERSON', 'EFFECTS_NEXT', 'ALWAYSLIT', 'GUILDHALL', 'NOWELL', 'NOSUMMON', 'NOSCAN', 'UNDERDARK', 'NOSHIFT', 'NORECALL', 'ALT_EXIT', 'OBSERVATORY');

-- CreateEnum
CREATE TYPE "public"."TriggerFlag" AS ENUM ('GLOBAL', 'RANDOM', 'COMMAND', 'SPEECH', 'ACT', 'DEATH', 'GREET', 'GREET_ALL', 'ENTRY', 'RECEIVE', 'FIGHT', 'HIT_PERCENT', 'BRIBE', 'LOAD', 'MEMORY', 'CAST', 'LEAVE', 'DOOR', 'TIME', 'AUTO', 'SPEECH_TO', 'LOOK');

-- CreateEnum
CREATE TYPE "public"."ShopFlag" AS ENUM ('WILL_FIGHT', 'USES_BANK', 'WILL_BANK_MONEY', 'WILL_START_FIGHT');

-- CreateEnum
CREATE TYPE "public"."ShopTradesWith" AS ENUM ('ALIGNMENT', 'RACE', 'CLASS', 'TRADE_NOGOOD', 'TRADE_NOEVIL', 'TRADE_NONEUTRAL', 'TRADE_NOCLERIC', 'TRADE_NOTHIEF', 'TRADE_NOWARRIOR');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('NEUTRAL', 'MALE', 'FEMALE', 'NON_BINARY');

-- CreateEnum
CREATE TYPE "public"."Race" AS ENUM ('HUMAN', 'ELF', 'GNOME', 'DWARF', 'TROLL', 'DROW', 'DUERGAR', 'OGRE', 'ORC', 'HALF_ELF', 'BARBARIAN', 'HALFLING', 'PLANT', 'HUMANOID', 'ANIMAL', 'DRAGON_GENERAL', 'GIANT', 'OTHER', 'GOBLIN', 'DEMON', 'BROWNIE', 'DRAGON_FIRE', 'DRAGON_FROST', 'DRAGON_ACID', 'DRAGON_LIGHTNING', 'DRAGON_GAS', 'DRAGONBORN_FIRE', 'DRAGONBORN_FROST', 'DRAGONBORN_ACID', 'DRAGONBORN_LIGHTNING', 'DRAGONBORN_GAS', 'SVERFNEBLIN', 'FAERIE_SEELIE', 'FAERIE_UNSEELIE', 'NYMPH', 'ARBOREAN');

-- CreateEnum
CREATE TYPE "public"."Position" AS ENUM ('PRONE', 'SITTING', 'KNEELING', 'STANDING', 'FLYING');

-- CreateEnum
CREATE TYPE "public"."LifeForce" AS ENUM ('LIFE', 'UNDEAD', 'MAGIC', 'CELESTIAL', 'DEMONIC', 'ELEMENTAL');

-- CreateEnum
CREATE TYPE "public"."Composition" AS ENUM ('FLESH', 'EARTH', 'AIR', 'FIRE', 'WATER', 'ICE', 'MIST', 'ETHER', 'METAL', 'STONE', 'BONE', 'LAVA', 'PLANT');

-- CreateEnum
CREATE TYPE "public"."Stance" AS ENUM ('DEAD', 'MORT', 'INCAPACITATED', 'STUNNED', 'SLEEPING', 'RESTING', 'ALERT', 'FIGHTING');

-- CreateEnum
CREATE TYPE "public"."DamageType" AS ENUM ('HIT', 'STING', 'WHIP', 'SLASH', 'BITE', 'BLUDGEON', 'CRUSH', 'POUND', 'CLAW', 'MAUL', 'THRASH', 'PIERCE', 'BLAST', 'PUNCH', 'STAB', 'FIRE', 'COLD', 'ACID', 'SHOCK', 'POISON', 'ALIGN');

-- CreateEnum
CREATE TYPE "public"."Size" AS ENUM ('TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE', 'GIANT', 'GARGANTUAN', 'COLOSSAL', 'TITANIC', 'MOUNTAINOUS');

-- CreateEnum
CREATE TYPE "public"."ObjectFlag" AS ENUM ('GLOW', 'HUM', 'NO_RENT', 'ANTI_BERSERKER', 'NO_INVISIBLE', 'INVISIBLE', 'MAGIC', 'NO_DROP', 'PERMANENT', 'ANTI_GOOD', 'ANTI_EVIL', 'ANTI_NEUTRAL', 'ANTI_SORCERER', 'ANTI_CLERIC', 'ANTI_ROGUE', 'ANTI_WARRIOR', 'NO_SELL', 'ANTI_PALADIN', 'ANTI_ANTI_PALADIN', 'ANTI_RANGER', 'ANTI_DRUID', 'ANTI_SHAMAN', 'ANTI_ASSASSIN', 'ANTI_MERCENARY', 'ANTI_NECROMANCER', 'ANTI_CONJURER', 'NO_BURN', 'NO_LOCATE', 'DECOMPOSING', 'FLOAT', 'NO_FALL', 'WAS_DISARMED', 'ANTI_MONK', 'ANTI_BARD', 'ELVEN', 'DWARVEN', 'ANTI_THIEF', 'ANTI_PYROMANCER', 'ANTI_CRYOMANCER', 'ANTI_ILLUSIONIST', 'ANTI_PRIEST', 'ANTI_DIABOLIST', 'ANTI_TINY', 'ANTI_SMALL', 'ANTI_MEDIUM', 'ANTI_LARGE', 'ANTI_HUGE', 'ANTI_GIANT', 'ANTI_GARGANTUAN', 'ANTI_COLOSSAL', 'ANTI_TITANIC', 'ANTI_MOUNTAINOUS', 'ANTI_ARBOREAN');

-- CreateEnum
CREATE TYPE "public"."WearFlag" AS ENUM ('TAKE', 'FINGER', 'NECK', 'BODY', 'HEAD', 'LEGS', 'FEET', 'HANDS', 'ARMS', 'SHIELD', 'ABOUT', 'WAIST', 'WRIST', 'WIELD', 'HOLD', 'TWO_HAND_WIELD', 'EYES', 'FACE', 'EAR', 'BADGE', 'BELT', 'HOVER');

-- CreateEnum
CREATE TYPE "public"."TargetScope" AS ENUM ('SINGLE', 'ROOM', 'GROUP', 'AREA', 'CHAIN', 'CONE', 'LINE');

-- CreateEnum
CREATE TYPE "public"."SpellRange" AS ENUM ('SELF', 'TOUCH', 'ROOM', 'ADJACENT_ROOM', 'WORLD');

-- CreateEnum
CREATE TYPE "public"."SaveType" AS ENUM ('SPELL', 'POISON', 'BREATH', 'PARALYSIS', 'WAND');

-- CreateEnum
CREATE TYPE "public"."SaveResult" AS ENUM ('NONE', 'HALF', 'NEGATE', 'REDUCE25', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."EffectType" AS ENUM ('DAMAGE', 'HEAL', 'STAT_MOD', 'AFFECT_FLAG', 'DISPEL', 'TELEPORT', 'SUMMON', 'CREATE_OBJECT', 'RESOURCE', 'OBJ_AFFECT', 'ROOM_AFFECT', 'CLEANSE', 'REMOVE_CURSE', 'SCRIPT');

-- CreateEnum
CREATE TYPE "public"."EffectTrigger" AS ENUM ('ON_CAST', 'ON_HIT', 'ON_KILL', 'ON_SAVE', 'ON_FAIL');

-- CreateEnum
CREATE TYPE "public"."StackingRule" AS ENUM ('REFRESH', 'STACK', 'IGNORE', 'MAX_ONLY');

-- CreateEnum
CREATE TYPE "public"."SkillType" AS ENUM ('WEAPON', 'COMBAT', 'MAGIC', 'STEALTH', 'SOCIAL', 'CRAFTING', 'SURVIVAL', 'KNOWLEDGE', 'UTILITY');

-- CreateEnum
CREATE TYPE "public"."SkillCategory" AS ENUM ('PRIMARY', 'SECONDARY', 'RESTRICTED', 'FORBIDDEN');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'PLAYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "last_failed_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "alignment" INTEGER NOT NULL DEFAULT 0,
    "strength" INTEGER NOT NULL DEFAULT 13,
    "intelligence" INTEGER NOT NULL DEFAULT 13,
    "wisdom" INTEGER NOT NULL DEFAULT 13,
    "dexterity" INTEGER NOT NULL DEFAULT 13,
    "constitution" INTEGER NOT NULL DEFAULT 13,
    "charisma" INTEGER NOT NULL DEFAULT 13,
    "luck" INTEGER NOT NULL DEFAULT 13,
    "hitPoints" INTEGER NOT NULL DEFAULT 100,
    "movement" INTEGER NOT NULL DEFAULT 100,
    "hitPointsMax" INTEGER NOT NULL DEFAULT 100,
    "movementMax" INTEGER NOT NULL DEFAULT 100,
    "copper" INTEGER NOT NULL DEFAULT 0,
    "silver" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "platinum" INTEGER NOT NULL DEFAULT 0,
    "bank_copper" INTEGER NOT NULL DEFAULT 0,
    "bank_silver" INTEGER NOT NULL DEFAULT 0,
    "bank_gold" INTEGER NOT NULL DEFAULT 0,
    "bank_platinum" INTEGER NOT NULL DEFAULT 0,
    "total_wealth" INTEGER NOT NULL DEFAULT 0,
    "average_stats" INTEGER NOT NULL DEFAULT 13,
    "password_hash" TEXT,
    "race_type" TEXT NOT NULL DEFAULT 'human',
    "race" "public"."Race" NOT NULL DEFAULT 'HUMAN',
    "gender" TEXT NOT NULL DEFAULT 'neutral',
    "player_class" TEXT,
    "height" INTEGER,
    "weight" INTEGER,
    "base_size" INTEGER NOT NULL DEFAULT 0,
    "current_size" INTEGER NOT NULL DEFAULT 0,
    "hit_roll" INTEGER NOT NULL DEFAULT 0,
    "damage_roll" INTEGER NOT NULL DEFAULT 0,
    "armor_class" INTEGER NOT NULL DEFAULT 10,
    "current_room" INTEGER,
    "save_room" INTEGER,
    "home_room" INTEGER,
    "last_login" TIMESTAMP(3),
    "time_played" INTEGER NOT NULL DEFAULT 0,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "hunger" INTEGER NOT NULL DEFAULT 0,
    "thirst" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "title" TEXT,
    "prompt" TEXT NOT NULL DEFAULT '<%h/%Hhp %v/%Vmv>',
    "page_length" INTEGER NOT NULL DEFAULT 25,
    "player_flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "effect_flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "privilege_flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "olc_zones" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "invis_level" INTEGER NOT NULL DEFAULT 0,
    "birth_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classId" INTEGER,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "skillPoints" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."zones" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lifespan" INTEGER NOT NULL DEFAULT 30,
    "resetMode" "public"."ResetMode" NOT NULL DEFAULT 'NORMAL',
    "hemisphere" "public"."Hemisphere" NOT NULL DEFAULT 'NORTHWEST',
    "climate" "public"."Climate" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rooms" (
    "id" INTEGER NOT NULL,
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sector" "public"."Sector" NOT NULL DEFAULT 'STRUCTURE',
    "zoneId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "flags" "public"."RoomFlag"[],
    "layout_x" INTEGER,
    "layout_y" INTEGER,
    "layout_z" INTEGER DEFAULT 0,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."room_exits" (
    "id" TEXT NOT NULL,
    "direction" "public"."Direction" NOT NULL,
    "description" TEXT,
    "keyword" TEXT,
    "key" TEXT,
    "destination" INTEGER,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "room_exits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."room_extra_descriptions" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "room_extra_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mobs" (
    "id" INTEGER NOT NULL,
    "id" INTEGER NOT NULL,
    "keywords" TEXT NOT NULL,
    "mobClass" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "longDesc" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "alignment" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "armorClass" INTEGER NOT NULL DEFAULT 0,
    "hitRoll" INTEGER NOT NULL DEFAULT 0,
    "move" INTEGER NOT NULL DEFAULT 0,
    "hpDiceNum" INTEGER NOT NULL DEFAULT 0,
    "hpDiceSize" INTEGER NOT NULL DEFAULT 0,
    "hpDiceBonus" INTEGER NOT NULL DEFAULT 0,
    "damageDiceNum" INTEGER NOT NULL DEFAULT 0,
    "damageDiceSize" INTEGER NOT NULL DEFAULT 0,
    "damageDiceBonus" INTEGER NOT NULL DEFAULT 0,
    "copper" INTEGER NOT NULL DEFAULT 0,
    "silver" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "platinum" INTEGER NOT NULL DEFAULT 0,
    "raceAlign" INTEGER NOT NULL DEFAULT 0,
    "total_wealth" INTEGER NOT NULL DEFAULT 0,
    "average_stats" INTEGER NOT NULL DEFAULT 13,
    "estimated_hp" INTEGER NOT NULL DEFAULT 0,
    "strength" INTEGER NOT NULL DEFAULT 13,
    "intelligence" INTEGER NOT NULL DEFAULT 13,
    "wisdom" INTEGER NOT NULL DEFAULT 13,
    "dexterity" INTEGER NOT NULL DEFAULT 13,
    "constitution" INTEGER NOT NULL DEFAULT 13,
    "charisma" INTEGER NOT NULL DEFAULT 13,
    "perception" INTEGER NOT NULL DEFAULT 0,
    "concealment" INTEGER NOT NULL DEFAULT 0,
    "zoneId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "classId" INTEGER,
    "race" "public"."Race" NOT NULL DEFAULT 'HUMANOID',
    "mobFlags" "public"."MobFlag"[],
    "effectFlags" "public"."EffectFlag"[],
    "position" "public"."Position" NOT NULL DEFAULT 'STANDING',
    "defaultPosition" "public"."Position" NOT NULL DEFAULT 'STANDING',
    "gender" "public"."Gender" NOT NULL DEFAULT 'NEUTRAL',
    "size" "public"."Size" NOT NULL DEFAULT 'MEDIUM',
    "lifeForce" "public"."LifeForce" NOT NULL DEFAULT 'LIFE',
    "composition" "public"."Composition" NOT NULL DEFAULT 'FLESH',
    "stance" "public"."Stance" NOT NULL DEFAULT 'ALERT',
    "damageType" "public"."DamageType" NOT NULL DEFAULT 'HIT',

    CONSTRAINT "mobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mob_skills" (
    "id" SERIAL NOT NULL,
    "mobId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "mob_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mob_spells" (
    "id" SERIAL NOT NULL,
    "mobId" INTEGER NOT NULL,
    "spellId" INTEGER NOT NULL,
    "circle" INTEGER NOT NULL DEFAULT 1,
    "known" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "mob_spells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mob_resets" (
    "id" TEXT NOT NULL,
    "max" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT,
    "mobId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "zoneId" INTEGER NOT NULL,

    CONSTRAINT "mob_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mob_carrying" (
    "id" TEXT NOT NULL,
    "max" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT,
    "resetId" TEXT NOT NULL,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "mob_carrying_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mob_equipped" (
    "id" TEXT NOT NULL,
    "max" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT NOT NULL,
    "name" TEXT,
    "resetId" TEXT NOT NULL,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "mob_equipped_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."objects" (
    "id" INTEGER NOT NULL,
    "id" INTEGER NOT NULL,
    "type" "public"."ObjectType" NOT NULL DEFAULT 'NOTHING',
    "keywords" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actionDesc" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "timer" INTEGER NOT NULL DEFAULT 0,
    "decomposeTimer" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "concealment" INTEGER NOT NULL DEFAULT 0,
    "values" JSONB NOT NULL DEFAULT '{}',
    "zoneId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "flags" "public"."ObjectFlag"[],
    "effectFlags" "public"."EffectFlag"[],
    "wearFlags" "public"."WearFlag"[],

    CONSTRAINT "objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."object_extra_descriptions" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "object_extra_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."object_affects" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "modifier" INTEGER NOT NULL,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "object_affects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."object_spells" (
    "id" TEXT NOT NULL,
    "spell" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "object_spells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shops" (
    "id" INTEGER NOT NULL,
    "id" INTEGER NOT NULL,
    "buyProfit" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "sellProfit" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "temper1" INTEGER NOT NULL DEFAULT 0,
    "noSuchItem1" TEXT,
    "noSuchItem2" TEXT,
    "doNotBuy" TEXT,
    "missingCash1" TEXT,
    "missingCash2" TEXT,
    "messageBuy" TEXT,
    "messageSell" TEXT,
    "keeperId" INTEGER,
    "zoneId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "flags" "public"."ShopFlag"[],
    "tradesWithFlags" "public"."ShopTradesWith"[],

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shop_items" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "shopId" INTEGER NOT NULL,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "shop_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shop_accepts" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "keywords" TEXT,
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "shop_accepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shop_rooms" (
    "id" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "shop_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shop_hours" (
    "id" TEXT NOT NULL,
    "open" INTEGER NOT NULL,
    "close" INTEGER NOT NULL,
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "shop_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."triggers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "attachType" "public"."ScriptType" NOT NULL,
    "numArgs" INTEGER NOT NULL DEFAULT 0,
    "argList" TEXT,
    "commands" TEXT NOT NULL,
    "zoneId" INTEGER,
    "mobId" INTEGER,
    "objectId" INTEGER,
    "variables" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "flags" "public"."TriggerFlag"[],

    CONSTRAINT "triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."classes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "hitDice" TEXT NOT NULL DEFAULT '1d8',
    "primaryStat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spells" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" INTEGER,
    "minPosition" "public"."Position" NOT NULL DEFAULT 'STANDING',
    "violent" BOOLEAN NOT NULL DEFAULT false,
    "castTimeRounds" INTEGER NOT NULL DEFAULT 1,
    "cooldownMs" INTEGER NOT NULL DEFAULT 0,
    "inCombatOnly" BOOLEAN NOT NULL DEFAULT false,
    "isArea" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spell_schools" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "spell_schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spell_class_circles" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "circle" INTEGER NOT NULL,
    "minLevel" INTEGER,
    "proficiencyGain" INTEGER,

    CONSTRAINT "spell_class_circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spell_targeting" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "allowedTargetsMask" INTEGER NOT NULL,
    "targetScope" "public"."TargetScope" NOT NULL DEFAULT 'SINGLE',
    "maxTargets" INTEGER NOT NULL DEFAULT 1,
    "range" "public"."SpellRange" NOT NULL DEFAULT 'ROOM',
    "requireLos" BOOLEAN NOT NULL DEFAULT false,
    "filtersMask" INTEGER,

    CONSTRAINT "spell_targeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spell_saving_throws" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "saveType" "public"."SaveType" NOT NULL DEFAULT 'SPELL',
    "onSave" "public"."SaveResult" NOT NULL DEFAULT 'NEGATE',
    "dcFormula" TEXT NOT NULL,
    "saveModifierMask" INTEGER,

    CONSTRAINT "spell_saving_throws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spell_messages" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "startToCaster" TEXT,
    "startToVictim" TEXT,
    "startToRoom" TEXT,
    "successToCaster" TEXT,
    "successToVictim" TEXT,
    "successToRoom" TEXT,
    "failToCaster" TEXT,
    "failToVictim" TEXT,
    "failToRoom" TEXT,
    "wearoffToTarget" TEXT,
    "wearoffToRoom" TEXT,

    CONSTRAINT "spell_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spell_components" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "objectId" INTEGER NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "spell_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spell_restrictions" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "indoorsOnly" BOOLEAN NOT NULL DEFAULT false,
    "outdoorsOnly" BOOLEAN NOT NULL DEFAULT false,
    "noSafeRooms" BOOLEAN NOT NULL DEFAULT false,
    "noTeleportFlagsMask" INTEGER,
    "terrainMask" INTEGER,
    "disallowStatesMask" INTEGER,

    CONSTRAINT "spell_restrictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spell_effects" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "effectType" "public"."EffectType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "chancePct" INTEGER NOT NULL DEFAULT 100,
    "trigger" "public"."EffectTrigger" DEFAULT 'ON_CAST',
    "durationFormula" TEXT,
    "stackingRule" "public"."StackingRule" NOT NULL DEFAULT 'REFRESH',
    "conditionFilter" JSONB,
    "params" JSONB NOT NULL,

    CONSTRAINT "spell_effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."skills" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."SkillType" NOT NULL,
    "category" "public"."SkillCategory" NOT NULL DEFAULT 'SECONDARY',
    "maxLevel" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."class_skills" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "category" "public"."SkillCategory" NOT NULL DEFAULT 'SECONDARY',
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "maxLevel" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "class_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."race_skills" (
    "id" SERIAL NOT NULL,
    "race" "public"."Race" NOT NULL,
    "skillId" INTEGER NOT NULL,
    "category" "public"."SkillCategory" NOT NULL DEFAULT 'SECONDARY',
    "bonus" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "race_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."character_skills" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "skillId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),

    CONSTRAINT "character_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."character_spells" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "spellId" INTEGER NOT NULL,
    "known" BOOLEAN NOT NULL DEFAULT false,
    "proficiency" INTEGER NOT NULL DEFAULT 0,
    "lastCast" TIMESTAMP(3),

    CONSTRAINT "character_spells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."change_logs" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB NOT NULL DEFAULT '{}',
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,

    CONSTRAINT "change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ban_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bannedBy" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "bannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "unbannedAt" TIMESTAMP(3),
    "unbannedBy" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ban_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."character_items" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "object_prototype_id" INTEGER NOT NULL,
    "container_id" TEXT,
    "equipped_location" TEXT,
    "condition" INTEGER NOT NULL DEFAULT 100,
    "charges" INTEGER NOT NULL DEFAULT -1,
    "instance_flags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "custom_short_desc" TEXT,
    "custom_long_desc" TEXT,
    "custom_values" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "character_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."character_effects" (
    "id" TEXT NOT NULL,
    "character_id" TEXT NOT NULL,
    "effect_name" TEXT NOT NULL,
    "effect_type" TEXT,
    "duration" INTEGER,
    "strength" INTEGER NOT NULL DEFAULT 1,
    "modifier_data" JSONB NOT NULL DEFAULT '{}',
    "source_type" TEXT,
    "source_id" INTEGER,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "character_effects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "characters_name_key" ON "public"."characters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_zoneId_id_key" ON "public"."rooms"("zoneId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "room_exits_roomId_direction_key" ON "public"."room_exits"("roomId", "direction");

-- CreateIndex
CREATE UNIQUE INDEX "mobs_zoneId_id_key" ON "public"."mobs"("zoneId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "mob_skills_mobId_skillId_key" ON "public"."mob_skills"("mobId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "mob_spells_mobId_spellId_key" ON "public"."mob_spells"("mobId", "spellId");

-- CreateIndex
CREATE UNIQUE INDEX "objects_zoneId_id_key" ON "public"."objects"("zoneId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "shops_zoneId_id_key" ON "public"."shops"("zoneId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "shop_items_shopId_objectId_key" ON "public"."shop_items"("shopId", "objectId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_rooms_shopId_roomId_key" ON "public"."shop_rooms"("shopId", "roomId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_key" ON "public"."classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "spells_name_key" ON "public"."spells"("name");

-- CreateIndex
CREATE UNIQUE INDEX "spell_schools_name_key" ON "public"."spell_schools"("name");

-- CreateIndex
CREATE UNIQUE INDEX "spell_class_circles_spellId_classId_key" ON "public"."spell_class_circles"("spellId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "spell_targeting_spellId_key" ON "public"."spell_targeting"("spellId");

-- CreateIndex
CREATE UNIQUE INDEX "spell_messages_spellId_key" ON "public"."spell_messages"("spellId");

-- CreateIndex
CREATE UNIQUE INDEX "spell_restrictions_spellId_key" ON "public"."spell_restrictions"("spellId");

-- CreateIndex
CREATE INDEX "spell_effects_spellId_order_idx" ON "public"."spell_effects"("spellId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "public"."skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "class_skills_classId_skillId_key" ON "public"."class_skills"("classId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "race_skills_race_skillId_key" ON "public"."race_skills"("race", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "character_skills_characterId_skillId_key" ON "public"."character_skills"("characterId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "character_spells_characterId_spellId_key" ON "public"."character_spells"("characterId", "spellId");

-- CreateIndex
CREATE INDEX "change_logs_entityType_entityId_idx" ON "public"."change_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "change_logs_userId_timestamp_idx" ON "public"."change_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "change_logs_timestamp_idx" ON "public"."change_logs"("timestamp");

-- CreateIndex
CREATE INDEX "ban_records_userId_idx" ON "public"."ban_records"("userId");

-- CreateIndex
CREATE INDEX "ban_records_bannedBy_idx" ON "public"."ban_records"("bannedBy");

-- CreateIndex
CREATE INDEX "ban_records_active_idx" ON "public"."ban_records"("active");

-- CreateIndex
CREATE INDEX "ban_records_bannedAt_idx" ON "public"."ban_records"("bannedAt");

-- AddForeignKey
ALTER TABLE "public"."characters" ADD CONSTRAINT "characters_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."characters" ADD CONSTRAINT "characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."rooms" ADD CONSTRAINT "rooms_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room_exits" ADD CONSTRAINT "room_exits_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."room_extra_descriptions" ADD CONSTRAINT "room_extra_descriptions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mobs" ADD CONSTRAINT "mobs_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mobs" ADD CONSTRAINT "mobs_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_skills" ADD CONSTRAINT "mob_skills_mobId_fkey" FOREIGN KEY ("mobId") REFERENCES "public"."mobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_skills" ADD CONSTRAINT "mob_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_spells" ADD CONSTRAINT "mob_spells_mobId_fkey" FOREIGN KEY ("mobId") REFERENCES "public"."mobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_spells" ADD CONSTRAINT "mob_spells_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "public"."spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_resets" ADD CONSTRAINT "mob_resets_mobId_fkey" FOREIGN KEY ("mobId") REFERENCES "public"."mobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_resets" ADD CONSTRAINT "mob_resets_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_resets" ADD CONSTRAINT "mob_resets_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_carrying" ADD CONSTRAINT "mob_carrying_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_carrying" ADD CONSTRAINT "mob_carrying_resetId_fkey" FOREIGN KEY ("resetId") REFERENCES "public"."mob_resets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_equipped" ADD CONSTRAINT "mob_equipped_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_equipped" ADD CONSTRAINT "mob_equipped_resetId_fkey" FOREIGN KEY ("resetId") REFERENCES "public"."mob_resets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."objects" ADD CONSTRAINT "objects_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."object_extra_descriptions" ADD CONSTRAINT "object_extra_descriptions_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."object_affects" ADD CONSTRAINT "object_affects_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."object_spells" ADD CONSTRAINT "object_spells_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_keeperId_fkey" FOREIGN KEY ("keeperId") REFERENCES "public"."mobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shops" ADD CONSTRAINT "shops_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shop_items" ADD CONSTRAINT "shop_items_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shop_items" ADD CONSTRAINT "shop_items_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shop_accepts" ADD CONSTRAINT "shop_accepts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shop_rooms" ADD CONSTRAINT "shop_rooms_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shop_hours" ADD CONSTRAINT "shop_hours_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "public"."shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."triggers" ADD CONSTRAINT "triggers_mobId_fkey" FOREIGN KEY ("mobId") REFERENCES "public"."mobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."triggers" ADD CONSTRAINT "triggers_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."triggers" ADD CONSTRAINT "triggers_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spells" ADD CONSTRAINT "spells_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "public"."spell_schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spell_class_circles" ADD CONSTRAINT "spell_class_circles_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spell_class_circles" ADD CONSTRAINT "spell_class_circles_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "public"."spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spell_targeting" ADD CONSTRAINT "spell_targeting_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "public"."spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spell_saving_throws" ADD CONSTRAINT "spell_saving_throws_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "public"."spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spell_messages" ADD CONSTRAINT "spell_messages_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "public"."spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spell_components" ADD CONSTRAINT "spell_components_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "public"."spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spell_restrictions" ADD CONSTRAINT "spell_restrictions_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "public"."spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spell_effects" ADD CONSTRAINT "spell_effects_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "public"."spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_skills" ADD CONSTRAINT "class_skills_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_skills" ADD CONSTRAINT "class_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."race_skills" ADD CONSTRAINT "race_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_skills" ADD CONSTRAINT "character_skills_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_skills" ADD CONSTRAINT "character_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_spells" ADD CONSTRAINT "character_spells_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_spells" ADD CONSTRAINT "character_spells_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "public"."spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."change_logs" ADD CONSTRAINT "change_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ban_records" ADD CONSTRAINT "ban_records_bannedBy_fkey" FOREIGN KEY ("bannedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ban_records" ADD CONSTRAINT "ban_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_items" ADD CONSTRAINT "character_items_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_items" ADD CONSTRAINT "character_items_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "public"."character_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_items" ADD CONSTRAINT "character_items_object_prototype_id_fkey" FOREIGN KEY ("object_prototype_id") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."character_effects" ADD CONSTRAINT "character_effects_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

