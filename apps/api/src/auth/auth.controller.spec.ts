import type { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';
import { OAuthCodeService } from './oauth-code.service';
import type { GoogleProfile } from './strategies/google.strategy';

const STATE = 'abcdefghijklmnop0123456789';
const FRONTEND = 'http://web.test';
const profile: GoogleProfile = {
  googleId: 'g1',
  email: 'a@b.c',
  emailVerified: true,
  displayName: 'A',
};

describe('AuthController.googleCallback', () => {
  let oauthCodes: OAuthCodeService;
  let handleGoogleLogin: jest.Mock;
  let controller: AuthController;
  let res: { redirect: jest.Mock };

  const call = (state: unknown) =>
    controller.googleCallback(
      { user: profile, query: { state } } as unknown as Request,
      res as unknown as Response
    );
  const redirected = () => new URL(res.redirect.mock.calls[0][0] as string);

  beforeEach(() => {
    oauthCodes = new OAuthCodeService();
    handleGoogleLogin = jest.fn();
    controller = new AuthController(
      { handleGoogleLogin } as unknown as AuthService,
      oauthCodes,
      { get: () => FRONTEND } as unknown as ConfigService
    );
    res = { redirect: jest.fn() };
  });

  it('redirects a returning user with a one-time code, never the JWT', async () => {
    handleGoogleLogin.mockResolvedValue({ accessToken: 'SESSION.JWT' });
    await call(STATE);
    const url = redirected();
    expect(url.pathname).toBe('/auth/google/callback');
    expect(url.searchParams.get('token')).toBeNull();
    expect(url.toString()).not.toContain('SESSION.JWT');
    expect(oauthCodes.redeem(url.searchParams.get('code')!, STATE)).toBe(
      'SESSION.JWT'
    );
  });

  it('redirects a new user with a pending-registration code, never the pending JWT', async () => {
    handleGoogleLogin.mockResolvedValue({
      needsUsername: true,
      pendingToken: 'PENDING.JWT',
    });
    await call(STATE);
    const url = redirected();
    expect(url.pathname).toBe('/auth/google/choose-display-name');
    expect(url.searchParams.get('token')).toBeNull();
    expect(url.toString()).not.toContain('PENDING.JWT');
    const code = url.searchParams.get('code')!;
    expect(() => oauthCodes.redeem(code, STATE, 'login')).toThrow();
  });

  it('pending code redeems with the same state', async () => {
    handleGoogleLogin.mockResolvedValue({
      needsUsername: true,
      pendingToken: 'PENDING.JWT',
    });
    await call(STATE);
    const code = redirected().searchParams.get('code')!;
    expect(oauthCodes.redeem(code, STATE, 'pending-registration')).toBe(
      'PENDING.JWT'
    );
  });

  it.each([undefined, 'short', 'bad state with spaces!!'])(
    'rejects state %s before touching accounts',
    async state => {
      handleGoogleLogin.mockResolvedValue({ accessToken: 'x' });
      await call(state);
      expect(handleGoogleLogin).not.toHaveBeenCalled();
      expect(redirected().pathname).toBe('/login');
    }
  );
});
