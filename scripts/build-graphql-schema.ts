#!/usr/bin/env tsx
// NOTE: This script intentionally uses dynamic imports and loose typing to avoid
// cross-project TS resolution issues. We limit explicit types instead of disabling TS globally.
/**
 * build-graphql-schema.ts
 *
 * Programmatically boot the NestJS AppModule, force GraphQL schema generation
 * at build/preflight time, and emit the SDL + hash to disk. This detects:
 *   - UndefinedTypeError (missing explicit @Args type)
 *   - Circular reference / metadata reflection problems
 *   - Failure to register enums before resolvers
 *   - Accidental breaking schema changes (via hash diff in CI if desired)
 *
 * Output:
 *   - ./apps/api/schema.generated.graphql (SDL)
 *   - ./apps/api/schema.generated.hash (sha256 of SDL)
 *
 * Exit code non‑zero on any failure so CI halts early.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
// Lazy import types inside build() to avoid monorepo root lint/type resolution noise.
// Use unknown instead of any to satisfy lint; we only pass through to Nest APIs.
type INestApplication = unknown; // Minimal surface required (only .init()/.close() invoked).
let Test: { createTestingModule: (...args: any[]) => any } | undefined;
// NOTE: Script is executed from monorepo root; use relative path into API app.
// We intentionally use dynamic import fallbacks so that if dependencies are missing
// (e.g., running in a workspace context without API dev deps) we fail with a clear message.
// Defer Nest & GraphQL imports to a function so TypeScript project references don't
// need to include this script file (avoids TS complaints when run outside API context).
async function loadNestArtifacts() {
  const [
    { AppModule },
    { GraphQLSchemaHost },
    { JwtAuthGuard },
    { GraphQLJwtAuthGuard },
  ] = await Promise.all([
    import('../apps/api/src/app.module'),
    import('@nestjs/graphql'),
    import('../apps/api/src/auth/guards/jwt-auth.guard'),
    import('../apps/api/src/auth/guards/graphql-jwt-auth.guard'),
  ]);
  return { AppModule, GraphQLSchemaHost, JwtAuthGuard, GraphQLJwtAuthGuard };
}

async function build() {
  let app: INestApplication | undefined;
  try {
    const { AppModule, GraphQLSchemaHost, JwtAuthGuard, GraphQLJwtAuthGuard } =
      await loadNestArtifacts();
    if (!Test) {
      const nestTesting = await import('@nestjs/testing');
      Test = nestTesting.Test;
    }
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(GraphQLJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    const schemaHost = app.get(GraphQLSchemaHost, { strict: false });
    if (!schemaHost) {
      throw new Error(
        'GraphQLSchemaHost not resolved – is GraphQLModule configured?'
      );
    }
    const schema = schemaHost.schema;
    if (!schema) {
      throw new Error('GraphQL schema not created after app.init()');
    }

    // Dynamically import printSchema to avoid pulling large lib before needed
    const { printSchema } = await import('graphql');
    const sdl = printSchema(schema);
    const hash = createHash('sha256').update(sdl).digest('hex');

    const outDir = path.join(process.cwd(), 'apps', 'api');
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    const sdlPath = path.join(outDir, 'schema.generated.graphql');
    const hashPath = path.join(outDir, 'schema.generated.hash');
    writeFileSync(sdlPath, sdl, 'utf8');
    writeFileSync(hashPath, hash + '\n', 'utf8');

    process.stdout.write(
      `✅ GraphQL schema generated (${sdl.split('\n').length} lines)\n`
    );
    process.stdout.write(`🔐 SHA256: ${hash}\n`);
  } catch (err) {
    process.stderr.write('❌ Failed to build GraphQL schema preflight.\n');
    process.stderr.write((err as Error)?.stack + '\n');
    process.exit(1);
  } finally {
    if (app) await app.close();
  }
}

build();
