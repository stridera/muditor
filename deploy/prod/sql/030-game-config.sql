-- Idempotent: prod-only GameConfig rows. Unique key is (category, key); existing values are kept.
INSERT INTO "GameConfig" ("category", "key", "value", "value_type", "description", "is_secret", "restart_req", "created_at", "updated_at")
VALUES (
  'security', 'website_url', 'https://muditor.fierymud.org', 'STRING',
  'Public website URL printed at the telnet login prompt',
  false, false, now(), now()
)
ON CONFLICT ("category", "key") DO NOTHING;
