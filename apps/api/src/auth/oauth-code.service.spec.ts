import { UnauthorizedException } from '@nestjs/common';
import { OAUTH_CODE_TTL_MS, OAuthCodeService } from './oauth-code.service';

const STATE = 'abcdefghijklmnop0123456789';

describe('OAuthCodeService', () => {
  let service: OAuthCodeService;

  beforeEach(() => {
    service = new OAuthCodeService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('redeems a code for the token when the state matches', () => {
    const code = service.issue('jwt-1', STATE);
    expect(code.length).toBeGreaterThanOrEqual(32);
    expect(service.redeem(code, STATE)).toBe('jwt-1');
  });

  it('is single use', () => {
    const code = service.issue('jwt-1', STATE);
    service.redeem(code, STATE);
    expect(() => service.redeem(code, STATE)).toThrow(UnauthorizedException);
  });

  it('rejects a mismatched state (login CSRF) and burns the code', () => {
    const code = service.issue('jwt-1', STATE);
    expect(() => service.redeem(code, 'zzzzzzzzzzzzzzzzzzzz')).toThrow(
      UnauthorizedException
    );
    expect(() => service.redeem(code, STATE)).toThrow(UnauthorizedException);
  });

  it('rejects unknown codes', () => {
    expect(() => service.redeem('nope', STATE)).toThrow(UnauthorizedException);
  });

  it('rejects codes after the 60 s TTL', () => {
    jest.useFakeTimers();
    const code = service.issue('jwt-1', STATE);
    jest.advanceTimersByTime(OAUTH_CODE_TTL_MS + 1);
    expect(() => service.redeem(code, STATE)).toThrow(UnauthorizedException);
  });

  it('issues distinct codes', () => {
    expect(service.issue('a', STATE)).not.toBe(service.issue('a', STATE));
  });
});
