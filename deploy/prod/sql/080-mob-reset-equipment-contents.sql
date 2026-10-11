-- MobResetEquipmentContents: objects that spawn inside a container a mob carries or wears
-- (legacy `G`/`E` followed by `P`, e.g. the key inside the cocoon some mob carries).
--
-- Table shape matches `model MobResetEquipmentContents` in packages/db/prisma/schema.prisma (same DDL Prisma
-- emits), so a later `prisma db push` reports no drift. Additive only. Rows come from
-- fierylib/data/sql/2026-10-11-mob-gear-contents.sql (or a fresh fierylib import).
--
-- Idempotent: CREATE ... IF NOT EXISTS, and each foreign key is added only when missing.

CREATE TABLE IF NOT EXISTS "MobResetEquipmentContents" (
    "id" SERIAL NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "parent_content_id" INTEGER,
    "object_zone_id" INTEGER NOT NULL,
    "object_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "max_instances" INTEGER NOT NULL DEFAULT 1,
    "comment" TEXT,

    CONSTRAINT "MobResetEquipmentContents_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MobResetEquipmentContents_equipment_id_fkey') THEN
        ALTER TABLE "MobResetEquipmentContents" ADD CONSTRAINT "MobResetEquipmentContents_equipment_id_fkey"
            FOREIGN KEY ("equipment_id") REFERENCES "MobResetEquipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MobResetEquipmentContents_parent_content_id_fkey') THEN
        ALTER TABLE "MobResetEquipmentContents" ADD CONSTRAINT "MobResetEquipmentContents_parent_content_id_fkey"
            FOREIGN KEY ("parent_content_id") REFERENCES "MobResetEquipmentContents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MobResetEquipmentContents_object_zone_id_object_id_fkey') THEN
        ALTER TABLE "MobResetEquipmentContents" ADD CONSTRAINT "MobResetEquipmentContents_object_zone_id_object_id_fkey"
            FOREIGN KEY ("object_zone_id", "object_id") REFERENCES "Objects"("zone_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
