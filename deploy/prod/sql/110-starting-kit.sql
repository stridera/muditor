-- StartingKit: what a new character is handed in their pack at creation (legacy give_newbie_eq: a common pack plus
-- per-class gear). Additive table only; the rows come from fierylib/data/sql/2026-10-12-starting-kit.sql (or
-- `fierylib seed starting-kit`). Until the rows exist the game starts new characters with an empty pack.
--
-- Table shape matches `model StartingKit` in packages/db/prisma/schema.prisma (same DDL Prisma emits), so a later
-- `prisma db push` reports no drift. The game reads the table at boot and logs an ERROR (booting with no starting
-- kit) if it is missing, so run this before deploying the build.
--
-- Idempotent: CREATE ... IF NOT EXISTS for the table and the unique index, and the foreign key is added only when
-- missing.

CREATE TABLE IF NOT EXISTS "StartingKit" (
    "id" SERIAL NOT NULL,
    "class_id" INTEGER,
    "object_zone_id" INTEGER NOT NULL,
    "object_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "StartingKit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "StartingKit_class_id_object_zone_id_object_id_key"
    ON "StartingKit"("class_id", "object_zone_id", "object_id");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'StartingKit_class_id_fkey') THEN
        ALTER TABLE "StartingKit" ADD CONSTRAINT "StartingKit_class_id_fkey"
            FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;
