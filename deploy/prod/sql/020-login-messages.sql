-- Idempotent: PLAIN_TELNET_NOTICE login message (shown on the unencrypted telnet port).
-- Unique key is (stage, variant); an existing row (e.g. edited by a builder) is never overwritten.
INSERT INTO "LoginMessage" ("stage", "variant", "message", "is_active", "created_at", "updated_at")
VALUES (
  'PLAIN_TELNET_NOTICE', 'default',
  $msg$This connection is not encrypted. For a secure connection use the TLS port {tls_port}. To log in without sending a password, type `code` at the password prompt and approve it on the website.$msg$,
  true, now(), now()
)
ON CONFLICT ("stage", "variant") DO NOTHING;
