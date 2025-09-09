/*
  Warnings:

  - You are about to drop the column `mana` on the `characters` table. All the data in the column will be lost.
  - You are about to drop the column `manaMax` on the `characters` table. All the data in the column will be lost.
  - Made the column `strength` on table `character_effects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `modifier_data` on table `character_effects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `applied_at` on table `character_effects` required. This step will fail if there are existing NULL values in that column.
  - Made the column `condition` on table `character_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `charges` on table `character_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `custom_values` on table `character_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `character_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `character_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `race_type` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `base_size` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `current_size` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `luck` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hit_roll` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `damage_roll` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `armor_class` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bank_copper` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bank_silver` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bank_gold` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `bank_platinum` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `time_played` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_online` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hunger` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `thirst` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `prompt` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `page_length` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `invis_level` on table `characters` required. This step will fail if there are existing NULL values in that column.
  - Made the column `birth_time` on table `characters` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "character_effects" DROP CONSTRAINT "character_effects_character_id_fkey";

-- DropForeignKey
ALTER TABLE "character_items" DROP CONSTRAINT "character_items_character_id_fkey";

-- DropForeignKey
ALTER TABLE "character_items" DROP CONSTRAINT "character_items_container_id_fkey";

-- DropForeignKey
ALTER TABLE "character_items" DROP CONSTRAINT "character_items_object_prototype_id_fkey";

-- DropIndex
DROP INDEX "idx_character_effects_character_id";

-- DropIndex
DROP INDEX "idx_character_items_character_id";

-- DropIndex
DROP INDEX "idx_character_items_container_id";

-- DropIndex
DROP INDEX "idx_character_items_object_id";

-- DropIndex
DROP INDEX "idx_characters_level";

-- DropIndex
DROP INDEX "idx_characters_user_id";

-- DropIndex
DROP INDEX "idx_mobs_vnum";

-- DropIndex
DROP INDEX "idx_mobs_zone_vnum";

-- DropIndex
DROP INDEX "idx_objects_vnum";

-- DropIndex
DROP INDEX "idx_objects_zone_vnum";

-- DropIndex
DROP INDEX "idx_rooms_vnum";

-- DropIndex
DROP INDEX "idx_rooms_zone_vnum";

-- DropIndex
DROP INDEX "idx_shops_vnum";

-- DropIndex
DROP INDEX "idx_shops_zone_vnum";

-- AlterTable
ALTER TABLE "character_effects" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "strength" SET NOT NULL,
ALTER COLUMN "modifier_data" SET NOT NULL,
ALTER COLUMN "applied_at" SET NOT NULL,
ALTER COLUMN "applied_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "character_items" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "condition" SET NOT NULL,
ALTER COLUMN "charges" SET NOT NULL,
ALTER COLUMN "custom_values" SET NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "characters" DROP COLUMN "mana",
DROP COLUMN "manaMax",
ALTER COLUMN "race_type" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "base_size" SET NOT NULL,
ALTER COLUMN "current_size" SET NOT NULL,
ALTER COLUMN "luck" SET NOT NULL,
ALTER COLUMN "hit_roll" SET NOT NULL,
ALTER COLUMN "damage_roll" SET NOT NULL,
ALTER COLUMN "armor_class" SET NOT NULL,
ALTER COLUMN "bank_copper" SET NOT NULL,
ALTER COLUMN "bank_silver" SET NOT NULL,
ALTER COLUMN "bank_gold" SET NOT NULL,
ALTER COLUMN "bank_platinum" SET NOT NULL,
ALTER COLUMN "last_login" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "time_played" SET NOT NULL,
ALTER COLUMN "is_online" SET NOT NULL,
ALTER COLUMN "hunger" SET NOT NULL,
ALTER COLUMN "thirst" SET NOT NULL,
ALTER COLUMN "prompt" SET NOT NULL,
ALTER COLUMN "page_length" SET NOT NULL,
ALTER COLUMN "invis_level" SET NOT NULL,
ALTER COLUMN "birth_time" SET NOT NULL,
ALTER COLUMN "birth_time" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "character_items" ADD CONSTRAINT "character_items_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_items" ADD CONSTRAINT "character_items_object_prototype_id_fkey" FOREIGN KEY ("object_prototype_id") REFERENCES "objects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_items" ADD CONSTRAINT "character_items_container_id_fkey" FOREIGN KEY ("container_id") REFERENCES "character_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "character_effects" ADD CONSTRAINT "character_effects_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "mobs_zone_vnum_unique" RENAME TO "mobs_zoneId_vnum_key";

-- RenameIndex
ALTER INDEX "objects_zone_vnum_unique" RENAME TO "objects_zoneId_vnum_key";

-- RenameIndex
ALTER INDEX "rooms_zone_vnum_unique" RENAME TO "rooms_zoneId_vnum_key";

-- RenameIndex
ALTER INDEX "shops_zone_vnum_unique" RENAME TO "shops_zoneId_vnum_key";
