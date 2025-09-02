/*
  Warnings:

  - You are about to drop the column `class` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `race` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `race` on the `mobs` table. All the data in the column will be lost.
  - The `mobFlags` column on the `mobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `effectFlags` column on the `mobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `position` column on the `mobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `defaultPosition` column on the `mobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `gender` column on the `mobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `size` column on the `mobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lifeForce` column on the `mobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `composition` column on the `mobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `stance` column on the `mobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `damageType` column on the `mobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flags` column on the `objects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `effectFlags` column on the `objects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `wearFlags` column on the `objects` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flags` column on the `rooms` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flags` column on the `shops` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tradesWithFlags` column on the `shops` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `flags` column on the `triggers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MobFlag" AS ENUM ('SPEC', 'SENTINEL', 'SCAVENGER', 'ISNPC', 'AWARE', 'AGGRESSIVE', 'STAY_ZONE', 'WIMPY', 'AGGRO_EVIL', 'AGGRO_GOOD', 'AGGRO_NEUTRAL', 'MEMORY', 'HELPER', 'NO_CHARM', 'NO_SUMMOM', 'NO_SLEEP', 'NO_BASH', 'NO_BLIND', 'MOUNT', 'STAY_SECT', 'HATES_SUN', 'NO_KILL', 'TRACK', 'ILLUSION', 'POISON_BITE', 'THIEF', 'WARRIOR', 'SORCERER', 'CLERIC', 'PALADIN', 'ANTI_PALADIN', 'RANGER', 'DRUID', 'SHAMAN', 'ASSASSIN', 'MERCENARY', 'NECROMANCER', 'CONJURER', 'MONK', 'BERSERKER', 'DIABOLIST');

-- CreateEnum
CREATE TYPE "EffectFlag" AS ENUM ('BLIND', 'INVISIBLE', 'DETECT_ALIGN', 'DETECT_INVIS', 'DETECT_MAGIC', 'SENSE_LIFE', 'WATERWALK', 'SANCTUARY', 'GROUP', 'CURSE', 'INFRAVISION', 'POISON', 'PROTECT_EVIL', 'PROTECT_GOOD', 'SLEEP', 'NO_TRACK', 'SNEAK', 'HIDE', 'CHARM', 'FLYING', 'WATERBREATH', 'ANGELIC_AURA', 'ETHEREAL', 'MAGICONLY', 'NEXTPARTIAL', 'NEXTNOATTACK', 'SPELL_TURNING', 'COMPREHEND_LANG', 'FIRESHIELD', 'DEATH_FIELD', 'MAJOR_PARALYSIS', 'MINOR_PARALYSIS', 'DRAGON_RIDE', 'COSMIC_TRAVEL', 'MENTAL_BARRIER', 'VITALITY', 'HASTE', 'SLOW', 'CONFUSION', 'MIST_WALK', 'BURNING_HANDS', 'FAERIE_FIRE', 'DARKNESS', 'INVISIBLE_STALKER', 'FEBLEMIND', 'FLUORESCENCE', 'RESTLESS', 'ASH_EYES', 'DILATE_PUPILS', 'FLAME_SHROUD', 'BARKSKIN', 'ULTRA_DAMAGE', 'SHILLELAGH', 'SUN_RAY', 'WITHER_LIMB', 'PETRIFY', 'DISEASE', 'PLAGUE', 'SCOURGE', 'VAMPIRIC_DRAIN', 'MOON_BEAM', 'TORNADO', 'EARTHMAW', 'CYCLONE', 'FLOOD', 'METEOR', 'FIRESTORM', 'SILENCE', 'CALM', 'ENTANGLE', 'ANIMAL_KIN');

-- CreateEnum
CREATE TYPE "RoomFlag" AS ENUM ('DARK', 'DEATH', 'NOMOB', 'INDOORS', 'PEACEFUL', 'SOUNDPROOF', 'NOTRACK', 'NOMAGIC', 'TUNNEL', 'PRIVATE', 'GODROOM', 'HOUSE', 'HOUSECRASH', 'ATRIUM', 'OLC', 'BFS_MARK', 'WORLDMAP', 'FERRY_DEST', 'ISOLATED', 'ARENA', 'LARGE', 'MEDIUM_LARGE', 'MEDIUM', 'MEDIUM_SMALL', 'SMALL', 'VERY_SMALL', 'ONE_PERSON', 'EFFECTS_NEXT');

-- CreateEnum
CREATE TYPE "TriggerFlag" AS ENUM ('Global', 'Random', 'Command', 'Speech', 'Act', 'Death', 'Greet', 'GreetAll', 'Entry', 'Receive', 'Fight', 'HitPrcnt', 'Bribe', 'Load', 'Memory', 'Cast', 'Leave', 'Door', 'Time', 'Auto');

-- CreateEnum
CREATE TYPE "ShopFlag" AS ENUM ('WILL_FIGHT', 'USES_BANK');

-- CreateEnum
CREATE TYPE "ShopTradesWith" AS ENUM ('ALIGNMENT', 'RACE', 'CLASS');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('NEUTRAL', 'MALE', 'FEMALE', 'NON_BINARY');

-- CreateEnum
CREATE TYPE "Race" AS ENUM ('HUMAN', 'ELF', 'GNOME', 'DWARF', 'TROLL', 'DROW', 'DUERGAR', 'OGRE', 'ORC', 'HALF_ELF', 'BARBARIAN', 'HALFLING', 'PLANT', 'HUMANOID', 'ANIMAL', 'DRAGON_GENERAL', 'GIANT', 'OTHER', 'GOBLIN', 'DEMON', 'BROWNIE', 'DRAGON_FIRE', 'DRAGON_FROST', 'DRAGON_ACID', 'DRAGON_LIGHTNING', 'DRAGON_GAS', 'DRAGONBORN_FIRE', 'DRAGONBORN_FROST', 'DRAGONBORN_ACID', 'DRAGONBORN_LIGHTNING', 'DRAGONBORN_GAS', 'SVERFNEBLIN', 'FAERIE_SEELIE', 'FAERIE_UNSEELIE', 'NYMPH', 'ARBOREAN');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('PRONE', 'SITTING', 'KNEELING', 'STANDING', 'FLYING');

-- CreateEnum
CREATE TYPE "LifeForce" AS ENUM ('LIFE', 'UNDEAD', 'MAGIC', 'CELESTIAL', 'DEMONIC', 'ELEMENTAL');

-- CreateEnum
CREATE TYPE "Composition" AS ENUM ('FLESH', 'EARTH', 'AIR', 'FIRE', 'WATER', 'ICE', 'MIST', 'ETHER', 'METAL', 'STONE', 'BONE', 'LAVA', 'PLANT');

-- CreateEnum
CREATE TYPE "Stance" AS ENUM ('DEAD', 'MORT', 'INCAPACITATED', 'STUNNED', 'SLEEPING', 'RESTING', 'ALERT', 'FIGHTING');

-- CreateEnum
CREATE TYPE "DamageType" AS ENUM ('HIT', 'STING', 'WHIP', 'SLASH', 'BITE', 'BLUDGEON', 'CRUSH', 'POUND', 'CLAW', 'MAUL', 'THRASH', 'PIERCE', 'BLAST', 'PUNCH', 'STAB', 'FIRE', 'COLD', 'ACID', 'SHOCK', 'POISON', 'ALIGN');

-- CreateEnum
CREATE TYPE "Size" AS ENUM ('TINY', 'SMALL', 'MEDIUM', 'LARGE', 'HUGE', 'GIANT', 'GARGANTUAN', 'COLOSSAL', 'TITANIC', 'MOUNTAINOUS');

-- CreateEnum
CREATE TYPE "ObjectFlag" AS ENUM ('GLOW', 'HUM', 'NO_RENT', 'ANTI_BERSERKER', 'NO_INVISIBLE', 'INVISIBLE', 'MAGIC', 'NO_DROP', 'PERMANENT', 'ANTI_GOOD', 'ANTI_EVIL', 'ANTI_NEUTRAL', 'ANTI_SORCERER', 'ANTI_CLERIC', 'ANTI_ROGUE', 'ANTI_WARRIOR', 'NO_SELL', 'ANTI_PALADIN', 'ANTI_ANTI_PALADIN', 'ANTI_RANGER', 'ANTI_DRUID', 'ANTI_SHAMAN', 'ANTI_ASSASSIN', 'ANTI_MERCENARY', 'ANTI_NECROMANCER', 'ANTI_CONJURER', 'NO_BURN', 'NO_LOCATE', 'DECOMPOSING', 'FLOAT', 'NO_FALL', 'WAS_DISARMED', 'ANTI_MONK', 'ANTI_BARD', 'ELVEN', 'DWARVEN', 'ANTI_THIEF', 'ANTI_PYROMANCER', 'ANTI_CRYOMANCER', 'ANTI_ILLUSIONIST', 'ANTI_PRIEST', 'ANTI_DIABOLIST', 'ANTI_TINY', 'ANTI_SMALL', 'ANTI_MEDIUM', 'ANTI_LARGE', 'ANTI_HUGE', 'ANTI_GIANT', 'ANTI_GARGANTUAN', 'ANTI_COLOSSAL', 'ANTI_TITANIC', 'ANTI_MOUNTAINOUS', 'ANTI_ARBOREAN');

-- CreateEnum
CREATE TYPE "WearFlag" AS ENUM ('TAKE', 'FINGER', 'NECK', 'BODY', 'HEAD', 'LEGS', 'FEET', 'HANDS', 'ARMS', 'SHIELD', 'ABOUT', 'WAIST', 'WRIST', 'WIELD', 'HOLD', 'TWO_HAND_WIELD', 'EYES', 'FACE', 'EAR', 'BADGE', 'BELT', 'HOVER');

-- CreateEnum
CREATE TYPE "TargetScope" AS ENUM ('SINGLE', 'ROOM', 'GROUP', 'AREA', 'CHAIN', 'CONE', 'LINE');

-- CreateEnum
CREATE TYPE "SpellRange" AS ENUM ('SELF', 'TOUCH', 'ROOM', 'ADJACENT_ROOM', 'WORLD');

-- CreateEnum
CREATE TYPE "SaveType" AS ENUM ('SPELL', 'POISON', 'BREATH', 'PARALYSIS', 'WAND');

-- CreateEnum
CREATE TYPE "SaveResult" AS ENUM ('NONE', 'HALF', 'NEGATE', 'REDUCE25', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EffectType" AS ENUM ('DAMAGE', 'HEAL', 'STAT_MOD', 'AFFECT_FLAG', 'DISPEL', 'TELEPORT', 'SUMMON', 'CREATE_OBJECT', 'RESOURCE', 'OBJ_AFFECT', 'ROOM_AFFECT', 'CLEANSE', 'REMOVE_CURSE', 'SCRIPT');

-- CreateEnum
CREATE TYPE "EffectTrigger" AS ENUM ('ON_CAST', 'ON_HIT', 'ON_KILL', 'ON_SAVE', 'ON_FAIL');

-- CreateEnum
CREATE TYPE "StackingRule" AS ENUM ('REFRESH', 'STACK', 'IGNORE', 'MAX_ONLY');

-- CreateEnum
CREATE TYPE "SkillType" AS ENUM ('WEAPON', 'COMBAT', 'MAGIC', 'STEALTH', 'SOCIAL', 'CRAFTING', 'SURVIVAL', 'KNOWLEDGE', 'UTILITY');

-- CreateEnum
CREATE TYPE "SkillCategory" AS ENUM ('PRIMARY', 'SECONDARY', 'RESTRICTED', 'FORBIDDEN');

-- AlterTable
ALTER TABLE "characters" DROP COLUMN "class",
DROP COLUMN "race",
ADD COLUMN     "classId" INTEGER,
ADD COLUMN     "raceId" INTEGER,
ADD COLUMN     "race_legacy" "Race" DEFAULT 'HUMAN';

-- AlterTable
ALTER TABLE "mobs" DROP COLUMN "race",
ADD COLUMN     "classId" INTEGER,
ADD COLUMN     "raceId" INTEGER,
ADD COLUMN     "race_legacy" "Race" DEFAULT 'HUMAN',
DROP COLUMN "mobFlags",
ADD COLUMN     "mobFlags" "MobFlag"[],
DROP COLUMN "effectFlags",
ADD COLUMN     "effectFlags" "EffectFlag"[],
DROP COLUMN "position",
ADD COLUMN     "position" "Position" NOT NULL DEFAULT 'STANDING',
DROP COLUMN "defaultPosition",
ADD COLUMN     "defaultPosition" "Position" NOT NULL DEFAULT 'STANDING',
DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'NEUTRAL',
DROP COLUMN "size",
ADD COLUMN     "size" "Size" NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "lifeForce",
ADD COLUMN     "lifeForce" "LifeForce" NOT NULL DEFAULT 'LIFE',
DROP COLUMN "composition",
ADD COLUMN     "composition" "Composition" NOT NULL DEFAULT 'FLESH',
DROP COLUMN "stance",
ADD COLUMN     "stance" "Stance" NOT NULL DEFAULT 'ALERT',
DROP COLUMN "damageType",
ADD COLUMN     "damageType" "DamageType" NOT NULL DEFAULT 'HIT';

-- AlterTable
ALTER TABLE "objects" DROP COLUMN "flags",
ADD COLUMN     "flags" "ObjectFlag"[],
DROP COLUMN "effectFlags",
ADD COLUMN     "effectFlags" "EffectFlag"[],
DROP COLUMN "wearFlags",
ADD COLUMN     "wearFlags" "WearFlag"[];

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "flags",
ADD COLUMN     "flags" "RoomFlag"[];

-- AlterTable
ALTER TABLE "shops" DROP COLUMN "flags",
ADD COLUMN     "flags" "ShopFlag"[],
DROP COLUMN "tradesWithFlags",
ADD COLUMN     "tradesWithFlags" "ShopTradesWith"[];

-- AlterTable
ALTER TABLE "triggers" DROP COLUMN "flags",
ADD COLUMN     "flags" "TriggerFlag"[];

-- CreateTable
CREATE TABLE "mob_skills" (
    "id" SERIAL NOT NULL,
    "mobId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "mob_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mob_spells" (
    "id" SERIAL NOT NULL,
    "mobId" INTEGER NOT NULL,
    "spellId" INTEGER NOT NULL,
    "circle" INTEGER NOT NULL DEFAULT 1,
    "known" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "mob_spells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "races" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "size" "Size" NOT NULL DEFAULT 'MEDIUM',
    "lifespan" INTEGER,
    "statBonuses" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
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
CREATE TABLE "spells" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" INTEGER,
    "minPosition" "Position" NOT NULL DEFAULT 'STANDING',
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
CREATE TABLE "spell_schools" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "spell_schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spell_class_circles" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,
    "circle" INTEGER NOT NULL,
    "minLevel" INTEGER,
    "proficiencyGain" INTEGER,

    CONSTRAINT "spell_class_circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spell_targeting" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "allowedTargetsMask" INTEGER NOT NULL,
    "targetScope" "TargetScope" NOT NULL DEFAULT 'SINGLE',
    "maxTargets" INTEGER NOT NULL DEFAULT 1,
    "range" "SpellRange" NOT NULL DEFAULT 'ROOM',
    "requireLos" BOOLEAN NOT NULL DEFAULT false,
    "filtersMask" INTEGER,

    CONSTRAINT "spell_targeting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spell_saving_throws" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "saveType" "SaveType" NOT NULL DEFAULT 'SPELL',
    "onSave" "SaveResult" NOT NULL DEFAULT 'NEGATE',
    "dcFormula" TEXT NOT NULL,
    "saveModifierMask" INTEGER,

    CONSTRAINT "spell_saving_throws_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spell_messages" (
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
CREATE TABLE "spell_components" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "objectId" INTEGER NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "required" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "spell_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spell_restrictions" (
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
CREATE TABLE "spell_effects" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "effectType" "EffectType" NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "chancePct" INTEGER NOT NULL DEFAULT 100,
    "trigger" "EffectTrigger" DEFAULT 'ON_CAST',
    "durationFormula" TEXT,
    "stackingRule" "StackingRule" NOT NULL DEFAULT 'REFRESH',
    "conditionFilter" JSONB,
    "params" JSONB NOT NULL,

    CONSTRAINT "spell_effects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "SkillType" NOT NULL,
    "category" "SkillCategory" NOT NULL DEFAULT 'SECONDARY',
    "maxLevel" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_skills" (
    "id" SERIAL NOT NULL,
    "classId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "category" "SkillCategory" NOT NULL DEFAULT 'SECONDARY',
    "minLevel" INTEGER NOT NULL DEFAULT 1,
    "maxLevel" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "class_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "race_skills" (
    "id" SERIAL NOT NULL,
    "raceId" INTEGER NOT NULL,
    "skillId" INTEGER NOT NULL,
    "category" "SkillCategory" NOT NULL DEFAULT 'SECONDARY',
    "bonus" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "race_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_skills" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "skillId" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),

    CONSTRAINT "character_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "character_spells" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "spellId" INTEGER NOT NULL,
    "known" BOOLEAN NOT NULL DEFAULT false,
    "proficiency" INTEGER NOT NULL DEFAULT 0,
    "lastCast" TIMESTAMP(3),

    CONSTRAINT "character_spells_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mob_skills_mobId_skillId_key" ON "mob_skills"("mobId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "mob_spells_mobId_spellId_key" ON "mob_spells"("mobId", "spellId");

-- CreateIndex
CREATE UNIQUE INDEX "races_name_key" ON "races"("name");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "spells_name_key" ON "spells"("name");

-- CreateIndex
CREATE UNIQUE INDEX "spell_schools_name_key" ON "spell_schools"("name");

-- CreateIndex
CREATE UNIQUE INDEX "spell_class_circles_spellId_classId_key" ON "spell_class_circles"("spellId", "classId");

-- CreateIndex
CREATE UNIQUE INDEX "spell_targeting_spellId_key" ON "spell_targeting"("spellId");

-- CreateIndex
CREATE UNIQUE INDEX "spell_messages_spellId_key" ON "spell_messages"("spellId");

-- CreateIndex
CREATE UNIQUE INDEX "spell_restrictions_spellId_key" ON "spell_restrictions"("spellId");

-- CreateIndex
CREATE INDEX "spell_effects_spellId_order_idx" ON "spell_effects"("spellId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "class_skills_classId_skillId_key" ON "class_skills"("classId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "race_skills_raceId_skillId_key" ON "race_skills"("raceId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "character_skills_characterId_skillId_key" ON "character_skills"("characterId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "character_spells_characterId_spellId_key" ON "character_spells"("characterId", "spellId");

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "races"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobs" ADD CONSTRAINT "mobs_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "races"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobs" ADD CONSTRAINT "mobs_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mob_skills" ADD CONSTRAINT "mob_skills_mobId_fkey" FOREIGN KEY ("mobId") REFERENCES "mobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mob_skills" ADD CONSTRAINT "mob_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mob_spells" ADD CONSTRAINT "mob_spells_mobId_fkey" FOREIGN KEY ("mobId") REFERENCES "mobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mob_spells" ADD CONSTRAINT "mob_spells_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spells" ADD CONSTRAINT "spells_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "spell_schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_class_circles" ADD CONSTRAINT "spell_class_circles_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_class_circles" ADD CONSTRAINT "spell_class_circles_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_targeting" ADD CONSTRAINT "spell_targeting_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_saving_throws" ADD CONSTRAINT "spell_saving_throws_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_messages" ADD CONSTRAINT "spell_messages_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_components" ADD CONSTRAINT "spell_components_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_restrictions" ADD CONSTRAINT "spell_restrictions_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spell_effects" ADD CONSTRAINT "spell_effects_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_skills" ADD CONSTRAINT "class_skills_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_skills" ADD CONSTRAINT "class_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_skills" ADD CONSTRAINT "race_skills_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "races"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "race_skills" ADD CONSTRAINT "race_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_spells" ADD CONSTRAINT "character_spells_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_spells" ADD CONSTRAINT "character_spells_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "spells"("id") ON DELETE CASCADE ON UPDATE CASCADE;
