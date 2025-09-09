-- Add 3D layout coordinates for zone editor
-- This migration adds layoutX, layoutY, and layoutZ fields to the rooms table

-- Add layout_x column (nullable float)
ALTER TABLE "rooms" ADD COLUMN "layout_x" DOUBLE PRECISION;

-- Add layout_y column (nullable float) 
ALTER TABLE "rooms" ADD COLUMN "layout_y" DOUBLE PRECISION;

-- Add layout_z column (float with default 0)
ALTER TABLE "rooms" ADD COLUMN "layout_z" DOUBLE PRECISION DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN "rooms"."layout_x" IS '3D layout X coordinate for zone editor';
COMMENT ON COLUMN "rooms"."layout_y" IS '3D layout Y coordinate for zone editor';
COMMENT ON COLUMN "rooms"."layout_z" IS '3D layout Z coordinate (depth) for zone editor';