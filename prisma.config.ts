import dotenv from 'dotenv';
import { defineConfig } from 'prisma';

// Load .env for PRISMA_SCHEMA_PATH
dotenv.config();

export default defineConfig({
  schema:
    process.env.PRISMA_SCHEMA_PATH || './packages/db/prisma/schema.prisma',
});
