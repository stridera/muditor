import type { INestApplication } from '@nestjs/common';
import type { AddressInfo } from 'net';
import { Test } from '@nestjs/testing';

/**
 * Boot test: a broken GraphQL schema (e.g. a resolver importing a dropped Prisma
 * enum) must fail here instead of leaving a process that looks alive but never
 * binds its port. Creates the full AppModule, listens on an ephemeral port, and
 * asserts the port is really bound and the GraphQL endpoint answers.
 */
describe('API boot', () => {
  let app: INestApplication;
  const originalSecret = process.env.JWT_SECRET;

  beforeAll(async () => {
    process.env.JWT_SECRET = originalSecret || 'test-jwt-secret-for-boot-spec';
    // Required after env setup: auth.module reads JWT_SECRET during init.
    const { AppModule } = await import('../app.module');
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
  });

  afterAll(async () => {
    if (app) {
      await Promise.race([
        app.close(),
        new Promise(resolve => {
          setTimeout(resolve, 2000);
        }),
      ]);
    }
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });

  it('binds a port and serves GraphQL', async () => {
    await app.listen(0, '127.0.0.1');
    const address = app.getHttpServer().address() as AddressInfo | null;
    expect(address).not.toBeNull();
    expect(address!.port).toBeGreaterThan(0);

    const res = await fetch(`http://127.0.0.1:${address!.port}/graphql`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'apollo-require-preflight': 'true',
      },
      body: JSON.stringify({ query: '{ __typename }' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { data?: { __typename?: string } };
    expect(body.data?.__typename).toBe('Query');
  });
});
