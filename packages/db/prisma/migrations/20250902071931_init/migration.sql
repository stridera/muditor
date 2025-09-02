-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'IMMORTAL', 'CODER', 'GOD');

-- CreateEnum
CREATE TYPE "ResetMode" AS ENUM ('NEVER', 'EMPTY', 'NORMAL');

-- CreateEnum
CREATE TYPE "Hemisphere" AS ENUM ('NORTHWEST', 'NORTHEAST', 'SOUTHWEST', 'SOUTHEAST');

-- CreateEnum
CREATE TYPE "Climate" AS ENUM ('NONE', 'SEMIARID', 'ARID', 'OCEANIC', 'TEMPERATE', 'SUBTROPICAL', 'TROPICAL', 'SUBARCTIC', 'ARCTIC', 'ALPINE');

-- CreateEnum
CREATE TYPE "Sector" AS ENUM ('STRUCTURE', 'CITY', 'FIELD', 'FOREST', 'HILLS', 'MOUNTAIN', 'SHALLOWS', 'WATER', 'UNDERWATER', 'AIR', 'ROAD', 'GRASSLANDS', 'CAVE', 'RUINS', 'SWAMP', 'BEACH', 'UNDERDARK', 'ASTRALPLANE', 'AIRPLANE', 'FIREPLANE', 'EARTHPLANE', 'ETHEREALPLANE', 'AVERNUS');

-- CreateEnum
CREATE TYPE "Direction" AS ENUM ('NORTH', 'EAST', 'SOUTH', 'WEST', 'UP', 'DOWN');

-- CreateEnum
CREATE TYPE "ObjectType" AS ENUM ('NOTHING', 'LIGHT', 'SCROLL', 'WAND', 'STAFF', 'WEAPON', 'FIREWEAPON', 'MISSILE', 'TREASURE', 'ARMOR', 'POTION', 'WORN', 'OTHER', 'TRASH', 'TRAP', 'CONTAINER', 'NOTE', 'DRINKCONTAINER', 'KEY', 'FOOD', 'MONEY', 'PEN', 'BOAT', 'FOUNTAIN', 'PORTAL', 'ROPE', 'SPELLBOOK', 'WALL', 'TOUCHSTONE', 'BOARD', 'INSTRUMENT');

-- CreateEnum
CREATE TYPE "ScriptType" AS ENUM ('MOB', 'OBJECT', 'WORLD');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "godLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "characters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "race" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "alignment" INTEGER NOT NULL DEFAULT 0,
    "strength" INTEGER NOT NULL DEFAULT 13,
    "intelligence" INTEGER NOT NULL DEFAULT 13,
    "wisdom" INTEGER NOT NULL DEFAULT 13,
    "dexterity" INTEGER NOT NULL DEFAULT 13,
    "constitution" INTEGER NOT NULL DEFAULT 13,
    "charisma" INTEGER NOT NULL DEFAULT 13,
    "hitPoints" INTEGER NOT NULL DEFAULT 100,
    "mana" INTEGER NOT NULL DEFAULT 100,
    "movement" INTEGER NOT NULL DEFAULT 100,
    "copper" INTEGER NOT NULL DEFAULT 0,
    "silver" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "platinum" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "characters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "top" INTEGER NOT NULL,
    "lifespan" INTEGER NOT NULL DEFAULT 30,
    "resetMode" "ResetMode" NOT NULL DEFAULT 'NORMAL',
    "hemisphere" "Hemisphere" NOT NULL DEFAULT 'NORTHWEST',
    "climate" "Climate" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sector" "Sector" NOT NULL DEFAULT 'STRUCTURE',
    "flags" TEXT[],
    "zoneId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_exits" (
    "id" TEXT NOT NULL,
    "direction" "Direction" NOT NULL,
    "description" TEXT,
    "keyword" TEXT,
    "key" TEXT,
    "destination" INTEGER,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "room_exits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "room_extra_descriptions" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,

    CONSTRAINT "room_extra_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mobs" (
    "id" INTEGER NOT NULL,
    "keywords" TEXT NOT NULL,
    "mobClass" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "longDesc" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "mobFlags" TEXT[],
    "effectFlags" TEXT[],
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
    "position" INTEGER NOT NULL DEFAULT 3,
    "defaultPosition" INTEGER NOT NULL DEFAULT 3,
    "gender" INTEGER NOT NULL DEFAULT 0,
    "race" INTEGER NOT NULL DEFAULT 0,
    "raceAlign" INTEGER NOT NULL DEFAULT 0,
    "size" INTEGER NOT NULL DEFAULT 2,
    "strength" INTEGER NOT NULL DEFAULT 13,
    "intelligence" INTEGER NOT NULL DEFAULT 13,
    "wisdom" INTEGER NOT NULL DEFAULT 13,
    "dexterity" INTEGER NOT NULL DEFAULT 13,
    "constitution" INTEGER NOT NULL DEFAULT 13,
    "charisma" INTEGER NOT NULL DEFAULT 13,
    "perception" INTEGER NOT NULL DEFAULT 0,
    "concealment" INTEGER NOT NULL DEFAULT 0,
    "lifeForce" TEXT NOT NULL DEFAULT 'Life',
    "composition" TEXT NOT NULL DEFAULT 'Flesh',
    "stance" TEXT NOT NULL DEFAULT 'Alert',
    "damageType" TEXT NOT NULL DEFAULT 'HIT',
    "zoneId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "mobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mob_resets" (
    "id" TEXT NOT NULL,
    "max" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT,
    "mobId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "zoneId" INTEGER NOT NULL,

    CONSTRAINT "mob_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mob_carrying" (
    "id" TEXT NOT NULL,
    "max" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT,
    "resetId" TEXT NOT NULL,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "mob_carrying_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mob_equipped" (
    "id" TEXT NOT NULL,
    "max" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT NOT NULL,
    "name" TEXT,
    "resetId" TEXT NOT NULL,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "mob_equipped_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "objects" (
    "id" INTEGER NOT NULL,
    "type" "ObjectType" NOT NULL DEFAULT 'NOTHING',
    "keywords" TEXT NOT NULL,
    "shortDesc" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actionDesc" TEXT,
    "flags" TEXT[],
    "effectFlags" TEXT[],
    "wearFlags" TEXT[],
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
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "object_extra_descriptions" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "object_extra_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "object_affects" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "modifier" INTEGER NOT NULL,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "object_affects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "object_spells" (
    "id" TEXT NOT NULL,
    "spell" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "object_spells_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" INTEGER NOT NULL,
    "buyProfit" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "sellProfit" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "temper1" INTEGER NOT NULL DEFAULT 0,
    "flags" TEXT[],
    "tradesWithFlags" TEXT[],
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

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_items" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "shopId" INTEGER NOT NULL,
    "objectId" INTEGER NOT NULL,

    CONSTRAINT "shop_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_accepts" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "keywords" TEXT,
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "shop_accepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_rooms" (
    "id" TEXT NOT NULL,
    "roomId" INTEGER NOT NULL,
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "shop_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_hours" (
    "id" TEXT NOT NULL,
    "open" INTEGER NOT NULL,
    "close" INTEGER NOT NULL,
    "shopId" INTEGER NOT NULL,

    CONSTRAINT "shop_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "triggers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "attachType" "ScriptType" NOT NULL,
    "flags" TEXT[],
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

    CONSTRAINT "triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "characters_name_key" ON "characters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "room_exits_roomId_direction_key" ON "room_exits"("roomId", "direction");

-- CreateIndex
CREATE UNIQUE INDEX "shop_items_shopId_objectId_key" ON "shop_items"("shopId", "objectId");

-- CreateIndex
CREATE UNIQUE INDEX "shop_rooms_shopId_roomId_key" ON "shop_rooms"("shopId", "roomId");

-- AddForeignKey
ALTER TABLE "characters" ADD CONSTRAINT "characters_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_exits" ADD CONSTRAINT "room_exits_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "room_extra_descriptions" ADD CONSTRAINT "room_extra_descriptions_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mobs" ADD CONSTRAINT "mobs_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mob_resets" ADD CONSTRAINT "mob_resets_mobId_fkey" FOREIGN KEY ("mobId") REFERENCES "mobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mob_resets" ADD CONSTRAINT "mob_resets_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mob_resets" ADD CONSTRAINT "mob_resets_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mob_carrying" ADD CONSTRAINT "mob_carrying_resetId_fkey" FOREIGN KEY ("resetId") REFERENCES "mob_resets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mob_carrying" ADD CONSTRAINT "mob_carrying_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mob_equipped" ADD CONSTRAINT "mob_equipped_resetId_fkey" FOREIGN KEY ("resetId") REFERENCES "mob_resets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mob_equipped" ADD CONSTRAINT "mob_equipped_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objects" ADD CONSTRAINT "objects_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_extra_descriptions" ADD CONSTRAINT "object_extra_descriptions_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_affects" ADD CONSTRAINT "object_affects_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "object_spells" ADD CONSTRAINT "object_spells_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_keeperId_fkey" FOREIGN KEY ("keeperId") REFERENCES "mobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_items" ADD CONSTRAINT "shop_items_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_items" ADD CONSTRAINT "shop_items_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_accepts" ADD CONSTRAINT "shop_accepts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_rooms" ADD CONSTRAINT "shop_rooms_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_hours" ADD CONSTRAINT "shop_hours_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triggers" ADD CONSTRAINT "triggers_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triggers" ADD CONSTRAINT "triggers_mobId_fkey" FOREIGN KEY ("mobId") REFERENCES "mobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triggers" ADD CONSTRAINT "triggers_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
