import type { INestApplication } from '@nestjs/common';
import { GraphQLSchemaBuilderModule } from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Early GraphQL Schema Build Test
 *
 * Purpose: Catch decorator / metadata / enum reflection errors (UndefinedTypeError, etc.)
 * BEFORE running the full API or visiting the frontend. This gives fast feedback when
 * a resolver argument is missing an explicit type annotation.
 *
 * What it does:
 *  - Bootstraps the Nest application minimal modules (AppModule already imports GraphQLModule)
 *  - Overrides auth guards so schema builds in isolation
 *  - Triggers app.init() causing GraphQL schema factory to run
 *  - Fails the test immediately if schema generation throws
 */
describe('GraphQL Schema Build (preflight)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, GraphQLSchemaBuilderModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(GraphQLJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should build the GraphQL schema and expose schema host', async () => {
    // If an UndefinedTypeError occurs it will surface in init(); we capture & rethrow with clearer context.
    try {
      await app.init();
    } catch (err: unknown) {
      // Common failure modes include missing explicit type in @Args decorator.
      // Provide actionable hint.
      const message =
        `GraphQL schema build failed: ${(err as Error)?.message}\n` +
        'Hint: Ensure every @Args() using enums or implicit types supplies { type: () => MyEnumOrScalar }.';
      throw new Error(message);
    }
    // Basic sanity: ensure schema file was emitted or internal schema exists.
    // Access internal graphQLModule ref if needed in future expansions.
    expect(app).toBeDefined();
    const host = app.get('GraphQLSchemaHost') as { schema?: unknown };
    // host may be resolved via token; ensure schema exists
    expect(host).toBeDefined();
    const schema = host?.schema;
    expect(schema).toBeDefined();
  });
});
