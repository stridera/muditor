-- Convert layout coordinates from FLOAT to INTEGER for grid-based MUD world building
-- This migration converts the layout coordinate fields to integers for cleaner grid-based positioning

-- Convert layout_x to integer (rounds existing float values)
ALTER TABLE "rooms" ALTER COLUMN "layout_x" TYPE INTEGER USING ROUND("layout_x");

-- Convert layout_y to integer (rounds existing float values)  
ALTER TABLE "rooms" ALTER COLUMN "layout_y" TYPE INTEGER USING ROUND("layout_y");

-- Convert layout_z to integer (rounds existing float values)
ALTER TABLE "rooms" ALTER COLUMN "layout_z" TYPE INTEGER USING ROUND("layout_z");

-- Update comments for clarity
COMMENT ON COLUMN "rooms"."layout_x" IS 'Grid X coordinate for zone editor (integer-based)';
COMMENT ON COLUMN "rooms"."layout_y" IS 'Grid Y coordinate for zone editor (integer-based)';  
COMMENT ON COLUMN "rooms"."layout_z" IS 'Grid Z coordinate (depth/level) for zone editor (integer-based)';