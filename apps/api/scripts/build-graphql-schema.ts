#!/usr/bin/env tsx
/**
 * Build-time GraphQL schema generation.
 * Run: pnpm build:schema
 */
import type { INestApplication } from '@nestjs/common';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { printSchema } from 'graphql';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { AppModule } from '../src/app.module';
import { GraphQLJwtAuthGuard } from '../src/auth/guards/graphql-jwt-auth.guard';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';

async function main() {
  let app: INestApplication | undefined;
  try {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(GraphQLJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    const host = app.get(GraphQLSchemaHost);
    const schema = host.schema;
    if (!schema) {
      throw new Error('GraphQL schema not initialized after app.init()');
    }
    const sdl = printSchema(schema);
    const hash = createHash('sha256').update(sdl).digest('hex');
    const outDir = path.join(process.cwd(), 'apps', 'api');
    writeFileSync(path.join(outDir, 'schema.generated.graphql'), sdl, 'utf8');
    writeFileSync(
      path.join(outDir, 'schema.generated.hash'),
      hash + '\n',
      'utf8'
    );
    process.stdout.write(
      `✅ Schema generated (${sdl.split('\n').length} lines)\n`
    );
    process.stdout.write(`🔐 Hash: ${hash}\n`);
  } catch (e) {
    process.stderr.write('❌ Schema build failed\n');
    process.stderr.write((e as Error).message + '\n');
    process.exit(1);
  } finally {
    if (app) await app.close();
  }
}

main();
