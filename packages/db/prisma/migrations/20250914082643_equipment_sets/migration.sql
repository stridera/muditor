/*
  Warnings:

  - You are about to drop the `mob_carrying` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mob_equipped` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."mob_carrying" DROP CONSTRAINT "mob_carrying_objectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."mob_carrying" DROP CONSTRAINT "mob_carrying_resetId_fkey";

-- DropForeignKey
ALTER TABLE "public"."mob_equipped" DROP CONSTRAINT "mob_equipped_objectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."mob_equipped" DROP CONSTRAINT "mob_equipped_resetId_fkey";

-- AlterTable
ALTER TABLE "public"."mob_resets" ADD COLUMN     "probability" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- DropTable
DROP TABLE "public"."mob_carrying";

-- DropTable
DROP TABLE "public"."mob_equipped";

-- CreateTable
CREATE TABLE "public"."equipment_sets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."equipment_set_items" (
    "id" TEXT NOT NULL,
    "equipmentSetId" TEXT NOT NULL,
    "objectId" INTEGER NOT NULL,
    "slot" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "equipment_set_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mob_equipment_sets" (
    "id" TEXT NOT NULL,
    "mobResetId" TEXT NOT NULL,
    "equipmentSetId" TEXT NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "mob_equipment_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."object_resets" (
    "id" TEXT NOT NULL,
    "max" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT,
    "objectId" INTEGER NOT NULL,
    "roomId" INTEGER NOT NULL,
    "zoneId" INTEGER NOT NULL,
    "probability" DOUBLE PRECISION NOT NULL DEFAULT 1.0,

    CONSTRAINT "object_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."spawn_conditions" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "mobResetId" TEXT,
    "objectResetId" TEXT,

    CONSTRAINT "spawn_conditions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "equipment_set_items_equipmentSetId_slot_key" ON "public"."equipment_set_items"("equipmentSetId", "slot");

-- CreateIndex
CREATE UNIQUE INDEX "mob_equipment_sets_mobResetId_equipmentSetId_key" ON "public"."mob_equipment_sets"("mobResetId", "equipmentSetId");

-- AddForeignKey
ALTER TABLE "public"."equipment_set_items" ADD CONSTRAINT "equipment_set_items_equipmentSetId_fkey" FOREIGN KEY ("equipmentSetId") REFERENCES "public"."equipment_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."equipment_set_items" ADD CONSTRAINT "equipment_set_items_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_equipment_sets" ADD CONSTRAINT "mob_equipment_sets_mobResetId_fkey" FOREIGN KEY ("mobResetId") REFERENCES "public"."mob_resets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mob_equipment_sets" ADD CONSTRAINT "mob_equipment_sets_equipmentSetId_fkey" FOREIGN KEY ("equipmentSetId") REFERENCES "public"."equipment_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."object_resets" ADD CONSTRAINT "object_resets_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "public"."objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."object_resets" ADD CONSTRAINT "object_resets_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "public"."rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."object_resets" ADD CONSTRAINT "object_resets_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spawn_conditions" ADD CONSTRAINT "spawn_conditions_mobResetId_fkey" FOREIGN KEY ("mobResetId") REFERENCES "public"."mob_resets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."spawn_conditions" ADD CONSTRAINT "spawn_conditions_objectResetId_fkey" FOREIGN KEY ("objectResetId") REFERENCES "public"."object_resets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
