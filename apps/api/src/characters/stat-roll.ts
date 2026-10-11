import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { getJwtSecret } from '../auth/jwt-secret';

/**
 * Server-issued stat rolls for character creation.
 *
 * Players do not choose their stats: the server rolls them and signs the
 * result into an opaque token bound to the requesting user. The player may
 * only assign the rolled values to attributes (any permutation);
 * createCharacter verifies the submitted stats against the token. Staff may
 * bypass this entirely.
 *
 * Stats live on the game's 0..100 scale (`CoreStats::bonus` in fierymud-rs is
 * `(score - 50) / 5`; legacy-imported characters carry natural scores of
 * 30..100 and fierylib imports them unchanged). The roll is therefore the
 * legacy `roll_natural_abils` (fierymud_legacy/src/chars.cpp), NOT 3d6, which
 * would leave every new character with a -8..-10 bonus on every stat. The
 * in-game flow rolls the same way: fierymud-rs
 * `crates/mud-world/src/stat_roll.rs`. Keep the two in step.
 */

/** Attributes that receive a rolled value, in roll order. */
export const ROLLED_STATS = [
  'strength',
  'intelligence',
  'wisdom',
  'dexterity',
  'constitution',
  'charisma',
] as const;
export type RolledStat = (typeof ROLLED_STATS)[number];
export type StatBlock = Record<RolledStat, number>;

/** Top of the stat scale. */
export const STAT_SCALE_MAX = 100;

/**
 * Luck is not rolled: the game never reads it and every character (legacy
 * imports included) holds the schema default, so new characters do too.
 */
export const STARTING_LUCK = 13;

/** Legacy floor: the six rolled values are topped up until they sum above this. */
const MIN_TOTAL_EXCLUSIVE = 450;
/** Legacy only adds +5 to a stat that is at or below this value. */
const BONUS_STEP_CEILING = 95;

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

/** Inclusive integer in [lo, hi]; injectable so tests can be deterministic. */
export type RandomInt = (lo: number, hi: number) => number;

const cryptoRandomInt: RandomInt = (lo, hi) => crypto.randomInt(lo, hi + 1);

/**
 * Port of legacy `roll_natural_abils`: each stat is 2 * (best 5 of 6 rolls of
 * d3..d10), range 30..100. If the six sum to 450 or less, +5 goes to random
 * stats (never above 100) until the sum exceeds 450. The values come back in
 * random order (legacy assigned them by class priority; there is no class
 * priority table in the DB yet, and the player reassigns them anyway).
 */
export function rollStatValues(
  randomInt: RandomInt = cryptoRandomInt
): number[] {
  const values = ROLLED_STATS.map(() => {
    const dice = Array.from({ length: 6 }, () => randomInt(3, 10));
    const total = dice.reduce((sum, d) => sum + d, 0) - Math.min(...dice);
    return total * 2;
  });
  let total = values.reduce((sum, v) => sum + v, 0);
  while (total <= MIN_TOTAL_EXCLUSIVE) {
    const j = randomInt(0, values.length - 1);
    if (values[j]! <= BONUS_STEP_CEILING) {
      values[j]! += 5;
      total += 5;
    }
  }
  for (let i = values.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [values[i], values[j]] = [values[j]!, values[i]!];
  }
  return values;
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

/**
 * Races columns holding the per-attribute caps. These
 * are the same `Races.max_*` columns the game reads at character creation
 * (fierymud-rs `roll_starting_stats` via `RaceCatalog::stat_cap`).
 */
export const RACE_CAP_COLUMNS = {
  strength: 'maxStrength',
  intelligence: 'maxIntelligence',
  wisdom: 'maxWisdom',
  dexterity: 'maxDexterity',
  constitution: 'maxConstitution',
  charisma: 'maxCharisma',
} as const;

export type RaceStatCaps = Record<keyof typeof RACE_CAP_COLUMNS, number>;

/** Pick the six cap columns off a Races row. */
export function raceStatCaps(
  race: Record<(typeof RACE_CAP_COLUMNS)[keyof typeof RACE_CAP_COLUMNS], number>
): RaceStatCaps {
  return {
    strength: race.maxStrength,
    intelligence: race.maxIntelligence,
    wisdom: race.maxWisdom,
    dexterity: race.maxDexterity,
    constitution: race.maxConstitution,
    charisma: race.maxCharisma,
  };
}

/**
 * Clamp each capped attribute to the race's cap (`min(value, cap)`), exactly
 * as the game does to freshly rolled stats at creation. Attributes without a cap
 * pass through.
 */
export function clampToRaceCaps<T extends Partial<StatBlock>>(
  stats: T,
  caps: RaceStatCaps
): T {
  const out = { ...stats };
  for (const key of Object.keys(caps) as (keyof RaceStatCaps)[]) {
    const value = out[key];
    if (typeof value === 'number') {
      (out as Partial<StatBlock>)[key] = Math.min(
        value,
        caps[key],
        STAT_SCALE_MAX
      );
    }
  }
  return out;
}
