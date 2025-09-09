-- Migration: Add vnum (virtual number) system for zone-local entity identification
-- This allows unlimited items/rooms/mobs per zone using zone_id + vnum composite keys

-- Add vnum columns to all zone entities
ALTER TABLE "objects" ADD COLUMN IF NOT EXISTS "vnum" INTEGER;
ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "vnum" INTEGER;
ALTER TABLE "mobs" ADD COLUMN IF NOT EXISTS "vnum" INTEGER;
ALTER TABLE "shops" ADD COLUMN IF NOT EXISTS "vnum" INTEGER;

-- For existing data, derive vnum from current ID system
-- This assumes current IDs follow a zone-based pattern
-- Use GREATEST to ensure vnum is always at least 1
UPDATE "objects" SET "vnum" = GREATEST("id" % 10000, 1) WHERE "vnum" IS NULL;
UPDATE "rooms" SET "vnum" = GREATEST("id" % 10000, 1) WHERE "vnum" IS NULL;
UPDATE "mobs" SET "vnum" = GREATEST("id" % 10000, 1) WHERE "vnum" IS NULL;
UPDATE "shops" SET "vnum" = GREATEST("id" % 10000, 1) WHERE "vnum" IS NULL;

-- Make vnum NOT NULL after populating
ALTER TABLE "objects" ALTER COLUMN "vnum" SET NOT NULL;
ALTER TABLE "rooms" ALTER COLUMN "vnum" SET NOT NULL;
ALTER TABLE "mobs" ALTER COLUMN "vnum" SET NOT NULL;
ALTER TABLE "shops" ALTER COLUMN "vnum" SET NOT NULL;

-- Create unique composite constraints (zone_id + vnum must be unique)
ALTER TABLE "objects" ADD CONSTRAINT "objects_zone_vnum_unique" UNIQUE ("zoneId", "vnum");
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_zone_vnum_unique" UNIQUE ("zoneId", "vnum");
ALTER TABLE "mobs" ADD CONSTRAINT "mobs_zone_vnum_unique" UNIQUE ("zoneId", "vnum");
ALTER TABLE "shops" ADD CONSTRAINT "shops_zone_vnum_unique" UNIQUE ("zoneId", "vnum");

-- Create multi-column indexes for efficient zone-based queries
CREATE INDEX IF NOT EXISTS "idx_objects_zone_vnum" ON "objects"("zoneId", "vnum");
CREATE INDEX IF NOT EXISTS "idx_rooms_zone_vnum" ON "rooms"("zoneId", "vnum");
CREATE INDEX IF NOT EXISTS "idx_mobs_zone_vnum" ON "mobs"("zoneId", "vnum");
CREATE INDEX IF NOT EXISTS "idx_shops_zone_vnum" ON "shops"("zoneId", "vnum");

-- Create indexes for vnum-only queries within zones
CREATE INDEX IF NOT EXISTS "idx_objects_vnum" ON "objects"("vnum");
CREATE INDEX IF NOT EXISTS "idx_rooms_vnum" ON "rooms"("vnum");
CREATE INDEX IF NOT EXISTS "idx_mobs_vnum" ON "mobs"("vnum");
CREATE INDEX IF NOT EXISTS "idx_shops_vnum" ON "shops"("vnum");

-- Add check constraints to ensure vnums are positive
ALTER TABLE "objects" ADD CONSTRAINT "check_objects_vnum_positive" CHECK ("vnum" > 0);
ALTER TABLE "rooms" ADD CONSTRAINT "check_rooms_vnum_positive" CHECK ("vnum" > 0);
ALTER TABLE "mobs" ADD CONSTRAINT "check_mobs_vnum_positive" CHECK ("vnum" > 0);
ALTER TABLE "shops" ADD CONSTRAINT "check_shops_vnum_positive" CHECK ("vnum" > 0);

-- Comments for documentation
COMMENT ON COLUMN "objects"."vnum" IS 'Virtual number - unique identifier within the zone (zone_id + vnum = unique)';
COMMENT ON COLUMN "rooms"."vnum" IS 'Virtual number - unique identifier within the zone (zone_id + vnum = unique)';
COMMENT ON COLUMN "mobs"."vnum" IS 'Virtual number - unique identifier within the zone (zone_id + vnum = unique)';
COMMENT ON COLUMN "shops"."vnum" IS 'Virtual number - unique identifier within the zone (zone_id + vnum = unique)';

-- Triggers can be added later if needed for auto-incrementing vnums within zones