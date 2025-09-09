-- Migration: Add character enhancements for item instances and additional character features
-- Based on CHARACTER.md analysis and new game features

-- Add missing fields to existing Character table
ALTER TABLE "characters" 
ADD COLUMN IF NOT EXISTS "password_hash" TEXT,
ADD COLUMN IF NOT EXISTS "race_type" TEXT DEFAULT 'human',
ADD COLUMN IF NOT EXISTS "gender" TEXT DEFAULT 'neutral',
ADD COLUMN IF NOT EXISTS "player_class" TEXT,
ADD COLUMN IF NOT EXISTS "height" INTEGER,
ADD COLUMN IF NOT EXISTS "weight" INTEGER,
ADD COLUMN IF NOT EXISTS "base_size" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "current_size" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "luck" INTEGER DEFAULT 13,
ADD COLUMN IF NOT EXISTS "hit_roll" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "damage_roll" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "armor_class" INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS "bank_copper" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "bank_silver" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "bank_gold" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "bank_platinum" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "current_room" INTEGER,
ADD COLUMN IF NOT EXISTS "save_room" INTEGER,
ADD COLUMN IF NOT EXISTS "home_room" INTEGER,
ADD COLUMN IF NOT EXISTS "last_login" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "time_played" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "is_online" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "hunger" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "thirst" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "title" TEXT,
ADD COLUMN IF NOT EXISTS "prompt" TEXT DEFAULT '<%h/%Hhp %v/%Vmv>',
ADD COLUMN IF NOT EXISTS "page_length" INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS "player_flags" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "effect_flags" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "privilege_flags" TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "olc_zones" INTEGER[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "invis_level" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "birth_time" TIMESTAMP DEFAULT NOW();

-- Add constraints (PostgreSQL doesn't support IF NOT EXISTS for constraints)
DO $$
BEGIN
  -- Add level constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_level' AND table_name = 'characters'
  ) THEN
    ALTER TABLE "characters" ADD CONSTRAINT "check_level" CHECK (level >= 1 AND level <= 999);
  END IF;
  
  -- Add alignment constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_alignment' AND table_name = 'characters'
  ) THEN
    ALTER TABLE "characters" ADD CONSTRAINT "check_alignment" CHECK (alignment >= -1000 AND alignment <= 1000);
  END IF;
  
  -- Add stats constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_stats' AND table_name = 'characters'
  ) THEN
    ALTER TABLE "characters" ADD CONSTRAINT "check_stats" CHECK (
      strength >= 1 AND strength <= 25 AND
      intelligence >= 1 AND intelligence <= 25 AND
      wisdom >= 1 AND wisdom <= 25 AND
      dexterity >= 1 AND dexterity <= 25 AND
      constitution >= 1 AND constitution <= 25 AND
      charisma >= 1 AND charisma <= 25 AND
      luck >= 1 AND luck <= 25
    );
  END IF;
  
  -- Add hunger/thirst constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_hunger_thirst' AND table_name = 'characters'
  ) THEN
    ALTER TABLE "characters" ADD CONSTRAINT "check_hunger_thirst" CHECK (hunger >= 0 AND hunger <= 100 AND thirst >= 0 AND thirst <= 100);
  END IF;
END $$;

-- Character Item Instances table (for the prototype vs instance system)
CREATE TABLE IF NOT EXISTS "character_items" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "character_id" TEXT NOT NULL REFERENCES "characters"("id") ON DELETE CASCADE,
  "object_prototype_id" INTEGER NOT NULL REFERENCES "objects"("id") ON DELETE CASCADE,
  "container_id" TEXT REFERENCES "character_items"("id") ON DELETE SET NULL,
  "equipped_location" TEXT, -- 'wielded', 'worn_head', 'held', etc.
  "condition" INTEGER DEFAULT 100 CHECK (condition >= 0 AND condition <= 100),
  "charges" INTEGER DEFAULT -1, -- -1 means unlimited, 0+ for consumables
  "instance_flags" TEXT[] DEFAULT '{}', -- 'blessed', 'cursed', 'glowing', etc.
  "custom_short_desc" TEXT, -- if item has been customized
  "custom_long_desc" TEXT,
  "custom_values" JSONB DEFAULT '{}', -- flexible storage for item-specific data
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Character Active Effects table (buffs/debuffs)
CREATE TABLE IF NOT EXISTS "character_effects" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "character_id" TEXT NOT NULL REFERENCES "characters"("id") ON DELETE CASCADE,
  "effect_name" TEXT NOT NULL,
  "effect_type" TEXT, -- 'spell', 'poison', 'disease', etc.
  "duration" INTEGER, -- seconds remaining, -1 for permanent
  "strength" INTEGER DEFAULT 1, -- effect strength/level
  "modifier_data" JSONB DEFAULT '{}', -- flexible storage for effect-specific data
  "source_type" TEXT, -- 'spell', 'item', 'room', etc.
  "source_id" INTEGER, -- reference to source object/spell/etc.
  "applied_at" TIMESTAMP DEFAULT NOW(),
  "expires_at" TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_character_items_character_id" ON "character_items"("character_id");
CREATE INDEX IF NOT EXISTS "idx_character_items_object_id" ON "character_items"("object_prototype_id");
CREATE INDEX IF NOT EXISTS "idx_character_items_container_id" ON "character_items"("container_id");
CREATE INDEX IF NOT EXISTS "idx_character_items_equipped" ON "character_items"("equipped_location") WHERE "equipped_location" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_character_effects_character_id" ON "character_effects"("character_id");
CREATE INDEX IF NOT EXISTS "idx_character_effects_expires_at" ON "character_effects"("expires_at") WHERE "expires_at" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_character_effects_active" ON "character_effects"("character_id") WHERE "duration" != 0;

CREATE INDEX IF NOT EXISTS "idx_characters_online" ON "characters"("is_online") WHERE "is_online" = true;
CREATE INDEX IF NOT EXISTS "idx_characters_level" ON "characters"("level");
CREATE INDEX IF NOT EXISTS "idx_characters_user_id" ON "characters"("userId");

-- Update the updated_at trigger for character_items
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_character_items_updated_at'
  ) THEN
    CREATE TRIGGER update_character_items_updated_at 
      BEFORE UPDATE ON "character_items" 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Comment the tables
COMMENT ON TABLE "character_items" IS 'Character item instances - separate from object prototypes to track individual item state';
COMMENT ON TABLE "character_effects" IS 'Active character effects like spells, poisons, diseases with duration tracking';

COMMENT ON COLUMN "character_items"."condition" IS 'Item durability/condition from 0-100';
COMMENT ON COLUMN "character_items"."charges" IS 'Remaining charges for consumables, -1 for unlimited';
COMMENT ON COLUMN "character_items"."instance_flags" IS 'Item-specific flags like blessed, cursed, glowing';
COMMENT ON COLUMN "character_effects"."duration" IS 'Seconds remaining, -1 for permanent effects';
COMMENT ON COLUMN "characters"."player_flags" IS 'Character state flags like pk, afk, linkdead';
COMMENT ON COLUMN "characters"."privilege_flags" IS 'Admin privileges like builder, wiz';
COMMENT ON COLUMN "characters"."olc_zones" IS 'Zones this character can edit (for builders)';