-- DropIndex
DROP INDEX "public"."equipment_set_items_equipmentSetId_slot_key";

-- AlterTable
ALTER TABLE "public"."equipment_set_items" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "slot" DROP NOT NULL;
