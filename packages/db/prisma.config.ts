import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Resolve schema absolutely so running `prisma` from repo root or this package works.
const schema = path.resolve(__dirname, 'prisma', 'schema.prisma');

// Load only the repository root .env file explicitly because Prisma skips auto-loading when using prisma.config.ts.
// packages/db -> repo root (two levels up)
const repoRoot = path.resolve(__dirname, '../..');
const rootEnv = path.join(repoRoot, '.env');
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv, override: true });
}

if (!process.env.DATABASE_URL) {
  // Throw a descriptive error early so Prisma doesn't emit a generic P1012 later.
  throw new Error(
    'DATABASE_URL not set. Ensure it exists in the root .env file.'
  );
}

export default defineConfig({
  schema,
  migrations: {
    seed: 'tsx ./src/seed/index.ts',
  },
});
