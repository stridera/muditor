import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

// Load env first so PRISMA_SCHEMA_PATH is available
// packages/db -> repo root (two levels up)
const repoRoot = path.resolve(__dirname, '../..');
const rootEnv = path.join(repoRoot, '.env');
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv, override: false });
}

// Resolve schema path - use PRISMA_SCHEMA_PATH from env if set, otherwise default
const schema = process.env.PRISMA_SCHEMA_PATH
  ? path.resolve(repoRoot, process.env.PRISMA_SCHEMA_PATH)
  : path.resolve(__dirname, 'prisma', 'schema.prisma');

export default defineConfig({
  schema,
  migrations: {
    seed: 'bun ./src/seed/index.ts',
  },
  datasource: {
    url: env('DATABASE_URL') ?? 'postgresql://dummy:dummy@localhost:5432/dummy',
  },
});
