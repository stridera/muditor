import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { getJwtSecret } from '../auth/jwt-secret';

/**
 * Server-issued stat rolls for character creation.
 *
 * Players do not choose their stats: the server rolls 3d6 per attribute (the
 * same roll the in-game creation flow uses) and signs the result into an
 * opaque token bound to the requesting user. The player may only assign the
 * rolled values to attributes (any permutation); createCharacter verifies the
 * submitted stats against the token. Staff may bypass this entirely.
 */

/** Attributes that receive a rolled value, in roll order. */
export const ROLLED_STATS = [
  'strength',
  'intelligence',
  'wisdom',
  'dexterity',
  'constitution',
  'charisma',
  'luck',
] as const;
export type RolledStat = (typeof ROLLED_STATS)[number];
export type StatBlock = Record<RolledStat, number>;

export const STAT_ROLL_TTL_SECONDS = 60 * 60;

interface StatRollPayload {
  /** Purpose tag so a roll token can never be mistaken for another token. */
  p: 'stat-roll';
  u: string;
  v: number[];
  /** Expiry, epoch seconds. */
  e: number;
}

export interface IssuedStatRoll {
  token: string;
  values: number[];
  expiresAt: Date;
}

// Domain-separated key: the auth JWT secret is never used directly, so a roll
// token cannot be replayed as (or forged into) an access token.
function rollKey(): Buffer {
  return crypto
    .createHmac('sha256', getJwtSecret())
    .update('muditor:stat-roll:v1')
    .digest();
}

function sign(body: string): string {
  return crypto
    .createHmac('sha256', rollKey())
    .update(body)
    .digest('base64url');
}

/** One 3d6 roll per rolled attribute. */
export function rollStatValues(): number[] {
  return ROLLED_STATS.map(
    () =>
      crypto.randomInt(1, 7) + crypto.randomInt(1, 7) + crypto.randomInt(1, 7)
  );
}

export function issueStatRoll(
  userId: string,
  values: number[] = rollStatValues(),
  now: Date = new Date()
): IssuedStatRoll {
  const e = Math.floor(now.getTime() / 1000) + STAT_ROLL_TTL_SECONDS;
  const payload: StatRollPayload = { p: 'stat-roll', u: userId, v: values, e };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return {
    token: `${body}.${sign(body)}`,
    values,
    expiresAt: new Date(e * 1000),
  };
}

/** Returns the rolled values, or throws BadRequestException. */
export function verifyStatRoll(
  token: string,
  userId: string,
  now: Date = new Date()
): number[] {
  const invalid = () => new BadRequestException('Invalid stat roll');
  const [body, mac, extra] = token.split('.');
  if (!body || !mac || extra !== undefined) throw invalid();

  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(mac);
  if (
    expected.length !== actual.length ||
    !crypto.timingSafeEqual(expected, actual)
  ) {
    throw invalid();
  }

  let payload: StatRollPayload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    throw invalid();
  }
  if (
    payload.p !== 'stat-roll' ||
    payload.u !== userId ||
    !Array.isArray(payload.v) ||
    payload.v.length !== ROLLED_STATS.length
  ) {
    throw invalid();
  }
  if (payload.e * 1000 < now.getTime()) {
    throw new BadRequestException('Stat roll expired; roll again');
  }
  return payload.v;
}

/** True when `stats` is a permutation of the rolled `values`. */
export function isAssignmentOfRoll(
  stats: StatBlock,
  values: number[]
): boolean {
  const assigned = ROLLED_STATS.map(key => stats[key]).sort((a, b) => a - b);
  const rolled = [...values].sort((a, b) => a - b);
  return assigned.every((v, i) => v === rolled[i]);
}
