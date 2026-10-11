import { BadRequestException } from '@nestjs/common';
import {
  ROLLED_STATS,
  STAT_ROLL_TTL_SECONDS,
  clampToRaceCaps,
  isAssignmentOfRoll,
  issueStatRoll,
  rollStatValues,
  verifyStatRoll,
  type StatBlock,
} from './stat-roll';

process.env.JWT_SECRET = 'test-secret-for-stat-rolls';

const block = (values: number[]): StatBlock =>
  Object.fromEntries(ROLLED_STATS.map((k, i) => [k, values[i]])) as StatBlock;

const ROLL = [75, 60, 46, 82, 68, 90];

/** Deterministic randomInt: always the same face. */
const always =
  (face: number | ((lo: number, hi: number) => number)) =>
  (lo: number, hi: number) =>
    typeof face === 'number' ? Math.min(Math.max(face, lo), hi) : face(lo, hi);

describe('stat-roll', () => {
  it('rolls the legacy 0..100 natural stats (not 3d6)', () => {
    for (let i = 0; i < 500; i++) {
      const values = rollStatValues();
      expect(values).toHaveLength(ROLLED_STATS.length);
      for (const v of values) {
        expect(v).toBeGreaterThanOrEqual(30);
        expect(v).toBeLessThanOrEqual(100);
      }
      // Legacy floor: the total is topped up to more than 450.
      expect(values.reduce((a, b) => a + b, 0)).toBeGreaterThan(450);
    }
  });

  it('gives an average new character a positive bonus, as in game', () => {
    // CoreStats::bonus = clamp((score - 50) / 5, -10, 10), truncating.
    const bonus = (n: number) =>
      Math.max(-10, Math.min(10, Math.trunc((n - 50) / 5)));
    let sum = 0;
    let count = 0;
    for (let i = 0; i < 500; i++) {
      for (const v of rollStatValues()) {
        sum += bonus(v);
        count++;
      }
    }
    expect(sum / count).toBeGreaterThan(1);
  });

  it('matches the legacy extremes (parity with fierymud-rs stat_roll.rs)', () => {
    // Best dice: 2 * (5 * 10) = 100 on every stat.
    expect(rollStatValues(always(10))).toEqual([100, 100, 100, 100, 100, 100]);
    // Worst dice: 2 * 5 * 3 = 30 each (total 180) is topped up above 450.
    let n = 0;
    const worst = rollStatValues((lo, hi) =>
      lo === 3 && hi === 10 ? 3 : lo + (n++ % (hi - lo + 1))
    );
    expect(worst.reduce((a, b) => a + b, 0)).toBeGreaterThan(450);
    expect(Math.max(...worst)).toBeLessThanOrEqual(100);
    expect(Math.min(...worst)).toBeGreaterThanOrEqual(30);
  });

  it('round-trips a token for the same user', () => {
    const { token, values } = issueStatRoll('u1');
    expect(verifyStatRoll(token, 'u1')).toEqual(values);
  });

  it('rejects another user, malformed, and expired tokens', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const { token } = issueStatRoll('u1', undefined, now);
    expect(() => verifyStatRoll(token, 'u2', now)).toThrow(BadRequestException);
    expect(() => verifyStatRoll('garbage', 'u1', now)).toThrow(
      BadRequestException
    );
    const later = new Date(now.getTime() + (STAT_ROLL_TTL_SECONDS + 1) * 1000);
    expect(() => verifyStatRoll(token, 'u1', later)).toThrow(/expired/);
  });

  it('is not an access token: payload tampering breaks the signature', () => {
    const { token } = issueStatRoll('u1', [30, 30, 30, 30, 30, 30]);
    const [body, mac] = token.split('.') as [string, string];
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    payload.v = [100, 100, 100, 100, 100, 100];
    const forgedBody = Buffer.from(JSON.stringify(payload)).toString(
      'base64url'
    );
    expect(() => verifyStatRoll(`${forgedBody}.${mac}`, 'u1')).toThrow(
      BadRequestException
    );
  });

  it('isAssignmentOfRoll accepts permutations only', () => {
    expect(isAssignmentOfRoll(block(ROLL), ROLL)).toBe(true);
    expect(isAssignmentOfRoll(block([90, 68, 82, 46, 60, 75]), ROLL)).toBe(
      true
    );
    expect(isAssignmentOfRoll(block([100, 60, 46, 82, 68, 90]), ROLL)).toBe(
      false
    );
    // Duplicating a high value while dropping another is not a permutation.
    expect(isAssignmentOfRoll(block([90, 90, 46, 82, 68, 60]), ROLL)).toBe(
      false
    );
  });

  it('clampToRaceCaps lowers only the stats above a race cap', () => {
    const caps = {
      strength: 100,
      intelligence: 64,
      wisdom: 100,
      dexterity: 100,
      constitution: 100,
      charisma: 100,
    };
    const clamped = clampToRaceCaps(block([75, 90, 46, 82, 68, 60]), caps);
    expect(clamped.intelligence).toBe(64);
    expect(clamped.strength).toBe(75);
    // A cap of 100 never touches a legacy-scale roll.
    expect(clampToRaceCaps(block([100, 99, 98, 97, 96, 95]), caps)).toEqual(
      block([100, 64, 98, 97, 96, 95])
    );
  });
});
