import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, timingSafeEqual } from 'crypto';

export const OAUTH_CODE_TTL_MS = 60_000;
const MAX_PENDING_CODES = 1000;

/** Shape the web client must send as the OAuth `state` (and later exchange). */
export const OAUTH_STATE_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

/**
 * What a code stands for. A code can only be redeemed as the kind it was
 * issued as, so a pending-registration code can never yield a session JWT.
 */
export type OAuthCodeKind = 'login' | 'pending-registration';

interface PendingCode {
  kind: OAuthCodeKind;
  accessToken: string; // JWT, or the pending-registration JWT for that kind
  state: string;
  expiresAt: number;
}

/**
 * One-time codes that stand in for the JWT in the post-OAuth redirect URL, so
 * the token never lands in proxy/access logs or browser history.
 *
 * In-memory on purpose: the API is a single process (the in-memory
 * AuthRateLimitGuard makes the same assumption) and codes live only 60 s.
 * Move this to the DB before running more than one API instance.
 *
 * Each code is bound to the browser-generated `state` that started the flow,
 * so a code minted for an attacker's Google session cannot be redeemed by a
 * victim's browser (login CSRF): the victim's sessionStorage holds a different
 * state.
 */
@Injectable()
export class OAuthCodeService {
  private readonly codes = new Map<string, PendingCode>();

  issue(
    accessToken: string,
    state: string,
    kind: OAuthCodeKind = 'login'
  ): string {
    this.sweep();
    if (this.codes.size >= MAX_PENDING_CODES) {
      // Drop the oldest entry (Map preserves insertion order).
      const oldest = this.codes.keys().next().value;
      if (oldest !== undefined) this.codes.delete(oldest);
    }
    const code = randomBytes(32).toString('base64url');
    this.codes.set(code, {
      kind,
      accessToken,
      state,
      expiresAt: Date.now() + OAUTH_CODE_TTL_MS,
    });
    return code;
  }

  /** Single use: the code is removed on the first attempt, right or wrong. */
  redeem(code: string, state: string, kind: OAuthCodeKind = 'login'): string {
    this.sweep();
    const entry = this.codes.get(code);
    this.codes.delete(code);
    if (!entry || entry.kind !== kind || entry.expiresAt < Date.now()) {
      throw new UnauthorizedException('Invalid or expired sign-in code');
    }
    const a = Buffer.from(entry.state);
    const b = Buffer.from(state);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid or expired sign-in code');
    }
    return entry.accessToken;
  }

  private sweep(): void {
    const now = Date.now();
    for (const [code, entry] of this.codes) {
      if (entry.expiresAt < now) this.codes.delete(code);
    }
  }
}
