-- Users.email_verified / Users.token_version (muditor auth gaps).
--
-- email_verified: Google OAuth must only auto-link to an existing account whose email has been proven. Accounts
-- created in the game, or by the website register form, carry an address nobody has verified (prod has no email
-- transport), so they default to false. Backfill: an account counts as verified when it was created through, or
-- linked to, Google with a matching address (google_links.google_email = email; Google only hands back verified
-- addresses to the sign-in flow that creates the link) or when preferences.emailVerified is explicitly true.
-- Everyone else stays false. There is no other verification flow to honour.
-- token_version: bumped on password/email/role change, ban and delete; stamped into the JWT. Missing claim = 0.
--
-- Idempotent: the columns are added IF NOT EXISTS (so this is safe before or after `bun run db:push`, which
-- creates the same columns from schema.prisma), and the UPDATE only flips false -> true, so a second run changes
-- 0 rows. It never clears a flag.

ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS token_version integer NOT NULL DEFAULT 0;

UPDATE "Users" u
SET email_verified = true
WHERE u.email_verified = false
  AND u.deleted_at IS NULL
  AND (
    EXISTS (
      SELECT 1 FROM google_links g
      WHERE g.user_id = u.id
        AND lower(g.google_email) = lower(u.email)
    )
    OR u.preferences->>'emailVerified' = 'true'
  );
