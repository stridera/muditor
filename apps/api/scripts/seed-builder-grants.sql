-- Idempotent: grant every BUILDER a WRITE grant on every existing zone.
-- user_grants has no wildcard convention (resource_id is a concrete zone id),
-- so this creates one row per builder x zone. Existing rows are left untouched.
-- granted_by is the first IMPLEMENTOR account (required FK).
-- Run: psql -U strider -d fierydev -f apps/api/scripts/seed-builder-grants.sql
INSERT INTO user_grants (user_id, resource_type, resource_id, permissions, granted_by, notes)
SELECT u.id, 'ZONE', z.id::text, ARRAY['WRITE']::"GrantPermission"[],
       (SELECT id FROM "Users" WHERE role = 'IMPLEMENTOR' ORDER BY id LIMIT 1),
       'Seeded: default builder zone access'
FROM "Users" u
CROSS JOIN "Zones" z
WHERE u.role = 'BUILDER'
  AND EXISTS (SELECT 1 FROM "Users" WHERE role = 'IMPLEMENTOR')
ON CONFLICT (user_id, resource_type, resource_id) DO NOTHING;
