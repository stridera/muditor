-- Characters: case-insensitive unique character names.
--
-- "Characters_name_key" only makes name unique case-sensitively, so "Bob" and "bob" could both be created
-- (and the login lookup, which is case-insensitive, would then be ambiguous). This adds a unique index on
-- lower(name). Prisma cannot express expression indexes, so the index lives only in SQL (see the comment on
-- model Characters in schema.prisma).
--
-- Idempotent (IF NOT EXISTS). If this fails on a database that already has case-duplicate names, resolve them
-- first: SELECT lower(name), count(*) FROM "Characters" GROUP BY 1 HAVING count(*) > 1;

CREATE UNIQUE INDEX IF NOT EXISTS characters_name_lower_key ON "Characters" (lower(name));
