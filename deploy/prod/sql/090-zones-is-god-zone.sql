-- Zones.is_god_zone: staff-only zones (God zones).
--
-- A god zone is hidden from mortals (game commands, GMCP, public website, world map), grants no exploration
-- achievements and is never a random teleport destination. Builders with HEAD_BUILDER or above set it in the zone
-- editor; fierylib marks the obvious legacy staff zones (data/sql/2026-10-07-god-zones.sql).
--
-- Matches `isGodZone Boolean @default(false) @map("is_god_zone")` on model Zones in packages/db/prisma/schema.prisma
-- (the same column `prisma db push` creates), so a later push reports no drift. The game reads the column at
-- boot and logs an ERROR (treating every zone as non-god) if it is missing.
--
-- Idempotent and additive: ADD COLUMN IF NOT EXISTS, no data is touched.

ALTER TABLE "Zones" ADD COLUMN IF NOT EXISTS is_god_zone BOOLEAN NOT NULL DEFAULT false;
