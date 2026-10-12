-- Zones.mobs_sleep_at_night + MobBehavior SLEEPS_AT_NIGHT / AWAKE_AT_NIGHT: opt-in night sleep for mobs (fierymud-rs #132).
--
-- Mobs no longer fall asleep at night by default. A builder switches it on per zone (zone editor checkbox) and can
-- override single mobs with the SLEEPS_AT_NIGHT (sleeps even in an off zone) and AWAKE_AT_NIGHT (stays up in an on
-- zone) behaviors. Nothing is seeded on: every zone starts off.
--
-- Matches `mobsSleepAtNight Boolean @default(false) @map("mobs_sleep_at_night")` on model Zones and the two new
-- MobBehavior values in packages/db/prisma/schema.prisma (what `prisma db push` creates), so a later push reports no
-- drift. The game reads the column at boot and logs an ERROR (treating every zone as off) if it is missing; an
-- unknown behavior value in a mob row would fail the mob load, so run this before deploying the build.
--
-- Idempotent and additive. ALTER TYPE ... ADD VALUE cannot run inside a transaction block, so run this file with
-- plain psql (autocommit), not `psql -1`.

ALTER TABLE "Zones" ADD COLUMN IF NOT EXISTS mobs_sleep_at_night BOOLEAN NOT NULL DEFAULT false;

ALTER TYPE "MobBehavior" ADD VALUE IF NOT EXISTS 'SLEEPS_AT_NIGHT';
ALTER TYPE "MobBehavior" ADD VALUE IF NOT EXISTS 'AWAKE_AT_NIGHT';
