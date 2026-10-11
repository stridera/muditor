import { BadRequestException, type ExecutionContext } from '@nestjs/common';
import { GoogleAuthGuard } from './google-auth.guard';

const ctx = (path: string, query: Record<string, unknown>) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ path, query }) }),
  }) as unknown as ExecutionContext;

describe('GoogleAuthGuard', () => {
  const guard = new GoogleAuthGuard();

  it('forwards a well-formed state to the authorization request', () => {
    const state = 'abcdefghijklmnop0123';
    expect(
      guard.getAuthenticateOptions(ctx('/api/auth/google', { state }))
    ).toEqual({ state });
  });

  it.each([undefined, '', 'short', 'has space has space!', 'a'.repeat(129)])(
    'rejects a missing or malformed state (%s)',
    state => {
      expect(() =>
        guard.getAuthenticateOptions(ctx('/api/auth/google', { state }))
      ).toThrow(BadRequestException);
    }
  );

  it('does not re-validate on the callback', () => {
    expect(
      guard.getAuthenticateOptions(
        ctx('/api/auth/google/callback', { code: 'x', state: 'g' })
      )
    ).toBeUndefined();
  });
});
