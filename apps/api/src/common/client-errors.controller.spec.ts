import {
  BadRequestException,
  HttpException,
  PayloadTooLargeException,
  ValidationPipe,
  type ExecutionContext,
} from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import {
  CLIENT_ERROR_LIMIT,
  CLIENT_ERROR_MAX_BYTES,
  ClientErrorDto,
  ClientErrorsController,
  ClientErrorsGuard,
} from './client-errors.controller';
import type { LoggingService } from './logging/logging.service';
import { InMemoryTtlCounter } from './ttl-counter';

const validBody = {
  message: 'Cannot read properties of undefined',
  stack: 'TypeError: x\n    at foo (bar.js:1:1)',
  route: '/dashboard/zones/new',
  kind: 'window' as const,
  userAgent: 'jest',
};

function ctx(req: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

describe('ClientErrorsController', () => {
  it('logs the report at WARN with the [client-error] prefix and the user when a token is valid', async () => {
    const logging = { logWarn: jest.fn().mockResolvedValue(undefined) };
    const jwt = {
      verify: jest.fn().mockReturnValue({ sub: 'u-5', role: 'BUILDER' }),
    };
    const controller = new ClientErrorsController(
      logging as unknown as LoggingService,
      jwt as unknown as JwtService
    );
    await controller.report(
      validBody as ClientErrorDto,
      {
        headers: { authorization: 'Bearer tok' },
      } as never
    );

    const [line, context] = logging.logWarn.mock.calls[0];
    expect(context).toBe('ClientErrors');
    expect(line).toContain('[client-error]');
    expect(line).toContain('kind=window');
    expect(line).toContain('route=/dashboard/zones/new');
    expect(line).toContain('user=u-5/BUILDER');
    expect(line).not.toContain('\n');
  });

  it('redacts echoed values from reported GraphQL error messages', async () => {
    const logging = { logWarn: jest.fn().mockResolvedValue(undefined) };
    const controller = new ClientErrorsController(
      logging as unknown as LoggingService,
      { verify: jest.fn() } as unknown as JwtService
    );
    await controller.report(
      {
        ...validBody,
        kind: 'apollo',
        message:
          'GraphQL error [BAD_USER_INPUT]: Variable "$i" got invalid value { password: "hunter2-secret" }; Field "identifier" of required type "String!" was not provided.',
      } as ClientErrorDto,
      { headers: {} } as never
    );
    expect(logging.logWarn.mock.calls[0][0]).not.toContain('hunter2-secret');
  });

  it('is anonymous without or with an invalid token', async () => {
    const logging = { logWarn: jest.fn().mockResolvedValue(undefined) };
    const jwt = {
      verify: jest.fn(() => {
        throw new Error('bad');
      }),
    };
    const controller = new ClientErrorsController(
      logging as unknown as LoggingService,
      jwt as unknown as JwtService
    );
    await controller.report(
      validBody as ClientErrorDto,
      { headers: {} } as never
    );
    await controller.report(
      validBody as ClientErrorDto,
      {
        headers: { authorization: 'Bearer nope' },
      } as never
    );
    expect(logging.logWarn.mock.calls[0][0]).toContain('user=anonymous');
    expect(logging.logWarn.mock.calls[1][0]).toContain('user=anonymous');
  });
});

describe('ClientErrorDto validation', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const validate = (body: unknown) =>
    pipe.transform(body, { type: 'body', metatype: ClientErrorDto });

  it('accepts a valid report', async () => {
    await expect(validate(validBody)).resolves.toBeInstanceOf(ClientErrorDto);
  });

  it('rejects an unknown kind, a missing route and an oversized message', async () => {
    await expect(
      validate({ ...validBody, kind: 'other' })
    ).rejects.toBeInstanceOf(BadRequestException);
    const { route: _route, ...noRoute } = validBody;
    await expect(validate(noRoute)).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      validate({ ...validBody, message: 'x'.repeat(2001) })
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('ClientErrorsGuard', () => {
  it('rejects bodies over 16 KB with 413 (declared and actual size)', async () => {
    const guard = new ClientErrorsGuard();
    const big = { ...validBody, message: 'x'.repeat(CLIENT_ERROR_MAX_BYTES) };
    await expect(
      guard.canActivate(ctx({ ip: '1.1.1.1', headers: {}, body: big }))
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
    await expect(
      guard.canActivate(
        ctx({
          ip: '1.1.1.2',
          headers: { 'content-length': String(CLIENT_ERROR_MAX_BYTES + 1) },
          body: validBody,
        })
      )
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
    await expect(
      guard.canActivate(ctx({ ip: '1.1.1.3', headers: {}, body: validBody }))
    ).resolves.toBe(true);
  });

  it('rate-limits per IP to 30 per minute and recovers after the window', async () => {
    let now = 1_000_000;
    const guard = new ClientErrorsGuard();
    guard.counter = new InMemoryTtlCounter(() => now);
    const req = (ip: string) => ctx({ ip, headers: {}, body: validBody });

    for (let i = 0; i < CLIENT_ERROR_LIMIT; i++) {
      await expect(guard.canActivate(req('9.9.9.9'))).resolves.toBe(true);
    }
    const err = await guard
      .canActivate(req('9.9.9.9'))
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(429);

    // another IP is unaffected
    await expect(guard.canActivate(req('8.8.8.8'))).resolves.toBe(true);

    now += 61_000;
    await expect(guard.canActivate(req('9.9.9.9'))).resolves.toBe(true);
  });
});
