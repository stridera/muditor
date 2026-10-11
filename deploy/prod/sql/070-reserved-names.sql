-- ReservedNames: words refused as character names (staff/system voices and generic mob words).
--
-- Table shape matches `model ReservedNames` in packages/db/prisma/schema.prisma, so a later `prisma db push`
-- reports no drift. The command-grammar words (all/self/me/everyone/someone/something/here) are not rows: they are
-- fixed in the game's code. Names are stored lowercase; the game compares case-insensitively.
--
-- Idempotent: CREATE ... IF NOT EXISTS, and seed rows use ON CONFLICT DO NOTHING (a row a builder edited or
-- removed-and-re-added is never overwritten; a removed seed row would come back on re-run, so run this once).
-- Mirrored by fierylib/data/sql/2026-10-10-reserved-names.sql.

CREATE TABLE IF NOT EXISTS "ReservedNames" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReservedNames_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ReservedNames_name_key" ON "ReservedNames"("name");

INSERT INTO "ReservedNames" ("name", "reason") VALUES
  ('admin', 'Staff or system voice'),
  ('administrator', 'Staff or system voice'),
  ('builder', 'Staff or system voice'),
  ('god', 'Staff or system voice'),
  ('gods', 'Staff or system voice'),
  ('immortal', 'Staff or system voice'),
  ('implementor', 'Staff or system voice'),
  ('moderator', 'Staff or system voice'),
  ('server', 'Staff or system voice'),
  ('staff', 'Staff or system voice'),
  ('system', 'Staff or system voice'),
  ('beggar', 'Generic mob word'),
  ('citizen', 'Generic mob word'),
  ('cityguard', 'Generic mob word'),
  ('corpse', 'Generic mob word'),
  ('guard', 'Generic mob word'),
  ('guardian', 'Generic mob word'),
  ('guardsman', 'Generic mob word'),
  ('merchant', 'Generic mob word'),
  ('mob', 'Generic mob word'),
  ('npc', 'Generic mob word'),
  ('shopkeeper', 'Generic mob word')
ON CONFLICT ("name") DO NOTHING;
