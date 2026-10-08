-- Idempotent: PLAIN_TELNET_NOTICE login message (shown on the unencrypted telnet port).
-- Unique key is (stage, variant); an existing row (e.g. edited by a builder) is never overwritten.
-- One sentence per line (the old one-paragraph text is migrated by fierylib/data/sql/2026-10-08-login-notice-linebreaks.sql).
INSERT INTO "LoginMessage" ("stage", "variant", "message", "is_active", "created_at", "updated_at")
VALUES (
  'PLAIN_TELNET_NOTICE', 'default',
  E'This connection is not encrypted.\r\nFor a secure connection use the TLS port {tls_port}.\r\nTo log in without sending a password, type `code` at the password prompt and approve it on the website.\r\n',
  true, now(), now()
)
ON CONFLICT ("stage", "variant") DO NOTHING;
