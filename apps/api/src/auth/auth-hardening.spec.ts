import {
  HttpException,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { RateLimit } from '../bridge/rate-limit.guard';
import { AuthRateLimitGuard } from './guards/auth-rate-limit.guard';
import { GraphQLJwtAuthGuard } from './guards/graphql-jwt-auth.guard';
import { getJwtSecret, jwtModuleOptionsFactory } from './jwt-secret';
import { JwtStrategy } from './strategies/jwt.strategy';
import type { AuthService } from './auth.service';
import type { DatabaseService } from '../database/database.service';

// Resolve the GraphQL context by faking the Nest execution context type.
function gqlContext(
  req: Record<string, unknown>,
  handler: () => unknown = () => undefined
): ExecutionContext {
  return {
    getType: () => 'graphql',
    getArgs: () => [{}, {}, { req }, {}],
    getArgByIndex: (i: number) => [{}, {}, { req }, {}][i],
    getHandler: () => handler,
    getClass: () => class Dummy {},
  } as unknown as ExecutionContext;
}

describe('JWT secret handling', () => {
  const original = process.env.JWT_SECRET;
  afterEach(() => {
    if (original === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = original;
  });

  it('getJwtSecret throws when JWT_SECRET is unset or blank', () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow(/JWT_SECRET/);
    process.env.JWT_SECRET = '   ';
    expect(() => getJwtSecret()).toThrow(/JWT_SECRET/);
  });

  it('JwtModule initialisation throws when JWT_SECRET is unset', async () => {
    delete process.env.JWT_SECRET;
    await expect(
      Test.createTestingModule({
        imports: [
          JwtModule.registerAsync({
            useFactory: jwtModuleOptionsFactory,
            global: true,
          }),
        ],
      }).compile()
    ).rejects.toThrow(/JWT_SECRET/);
  });

  it('JwtStrategy construction throws when JWT_SECRET is unset', () => {
    delete process.env.JWT_SECRET;
    expect(() => new JwtStrategy({} as AuthService)).toThrow(/JWT_SECRET/);
  });

  it('uses the configured secret when present', () => {
    process.env.JWT_SECRET = 'abc123';
    expect(jwtModuleOptionsFactory().secret).toBe('abc123');
  });
});

describe('GraphQLJwtAuthGuard ban check', () => {
  const user = {
    id: 'u1',
    displayName: 'Bob',
    email: 'b@x',
    role: 'PLAYER',
  };

  function build(activeBan: unknown, foundUser: unknown = user) {
    const db = {
      users: { findUnique: jest.fn().mockResolvedValue(foundUser) },
      banRecords: { findFirst: jest.fn().mockResolvedValue(activeBan) },
    } as unknown as DatabaseService;
    const jwt = {
      verify: jest.fn().mockReturnValue({ sub: 'u1' }),
    } as unknown as JwtService;
    return { guard: new GraphQLJwtAuthGuard(jwt, db), db };
  }

  it('rejects a banned user with a valid token', async () => {
    const { guard, db } = build({ id: 1 });
    const req = { headers: { authorization: 'Bearer tok' } };
    await expect(guard.canActivate(gqlContext(req))).rejects.toThrow(
      'Account is banned'
    );
    expect(req).not.toHaveProperty('user');
    expect(db.banRecords.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'u1', active: true }),
      })
    );
  });

  it('allows an unbanned user and attaches req.user', async () => {
    const { guard } = build(null);
    const req: Record<string, unknown> = {
      headers: { authorization: 'Bearer tok' },
    };
    await expect(guard.canActivate(gqlContext(req))).resolves.toBe(true);
    expect(req.user).toEqual(user);
  });

  it('rejects a soft-deleted account that still holds a valid token', async () => {
    const { guard } = build(null, { ...user, deletedAt: new Date() });
    const req: Record<string, unknown> = {
      headers: { authorization: 'Bearer tok' },
    };
    await expect(guard.canActivate(gqlContext(req))).rejects.toBeInstanceOf(
      UnauthorizedException
    );
    expect(req).not.toHaveProperty('user');
  });

  it('allows an account whose deletedAt is null', async () => {
    const { guard } = build(null, { ...user, deletedAt: null });
    await expect(
      guard.canActivate(
        gqlContext({ headers: { authorization: 'Bearer tok' } })
      )
    ).resolves.toBe(true);
  });

  it('still rejects missing / unknown users as Unauthorized', async () => {
    const { guard } = build(null, null);
    await expect(
      guard.canActivate(gqlContext({ headers: { authorization: 'Bearer t' } }))
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      guard.canActivate(gqlContext({ headers: {} }))
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

describe('AuthRateLimitGuard', () => {
  class Target {
    @RateLimit({ limit: 10, windowSeconds: 60, keyPrefix: 'auth:test' })
    login() {
      return undefined;
    }
  }
  const handler = Target.prototype.login;

  it('allows 10 attempts per minute per IP and rejects the 11th', () => {
    const guard = new AuthRateLimitGuard(new Reflector());
    const ctx = gqlContext({ ip: '203.0.113.5' }, handler);
    for (let i = 0; i < 10; i++) {
      expect(guard.canActivate(ctx)).toBe(true);
    }
    try {
      guard.canActivate(ctx);
      throw new Error('expected rate limit to trigger');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      expect((err as HttpException).getStatus()).toBe(429);
    }
  });

  it('tracks IPs independently', () => {
    const guard = new AuthRateLimitGuard(new Reflector());
    for (let i = 0; i < 10; i++) {
      guard.canActivate(gqlContext({ ip: '198.51.100.1' }, handler));
    }
    expect(() =>
      guard.canActivate(gqlContext({ ip: '198.51.100.1' }, handler))
    ).toThrow(HttpException);
    expect(guard.canActivate(gqlContext({ ip: '198.51.100.2' }, handler))).toBe(
      true
    );
  });

  it('resets after the window elapses', () => {
    jest.useFakeTimers();
    try {
      const guard = new AuthRateLimitGuard(new Reflector());
      const ctx = gqlContext({ ip: '192.0.2.9' }, handler);
      for (let i = 0; i < 10; i++) guard.canActivate(ctx);
      expect(() => guard.canActivate(ctx)).toThrow(HttpException);
      jest.setSystemTime(Date.now() + 61_000);
      expect(guard.canActivate(ctx)).toBe(true);
    } finally {
      jest.useRealTimers();
    }
  });
});
