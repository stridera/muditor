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

describe('stat-roll', () => {
  it('rolls 3d6 for every rolled attribute', () => {
    for (let i = 0; i < 50; i++) {
      const values = rollStatValues();
      expect(values).toHaveLength(ROLLED_STATS.length);
      for (const v of values) {
        expect(v).toBeGreaterThanOrEqual(3);
        expect(v).toBeLessThanOrEqual(18);
      }
    }
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
    const { token } = issueStatRoll('u1', [3, 3, 3, 3, 3, 3, 3]);
    const [body, mac] = token.split('.') as [string, string];
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    payload.v = [18, 18, 18, 18, 18, 18, 18];
    const forgedBody = Buffer.from(JSON.stringify(payload)).toString(
      'base64url'
    );
    expect(() => verifyStatRoll(`${forgedBody}.${mac}`, 'u1')).toThrow(
      BadRequestException
    );
  });

  it('isAssignmentOfRoll accepts permutations only', () => {
    const roll = [15, 12, 9, 14, 11, 16, 8];
    expect(isAssignmentOfRoll(block(roll), roll)).toBe(true);
    expect(isAssignmentOfRoll(block([8, 16, 11, 14, 9, 12, 15]), roll)).toBe(
      true
    );
    expect(isAssignmentOfRoll(block([18, 12, 9, 14, 11, 16, 8]), roll)).toBe(
      false
    );
    // Duplicating a high value while dropping another is not a permutation.
    expect(isAssignmentOfRoll(block([16, 16, 9, 14, 11, 12, 8]), roll)).toBe(
      false
    );
  });

  it('clampToRaceCaps lowers only the stats above a race cap', () => {
    const caps = {
      strength: 76,
      intelligence: 12,
      wisdom: 76,
      dexterity: 76,
      constitution: 76,
      charisma: 76,
    };
    const clamped = clampToRaceCaps(block([10, 18, 9, 14, 11, 12, 18]), caps);
    expect(clamped.intelligence).toBe(12);
    expect(clamped.strength).toBe(10);
    // Luck has no race cap.
    expect(clamped.luck).toBe(18);
    // Default caps (76) never touch a 3d6 roll.
    expect(
      clampToRaceCaps(block([18, 18, 18, 18, 18, 18, 18]), {
        strength: 76,
        intelligence: 76,
        wisdom: 76,
        dexterity: 76,
        constitution: 76,
        charisma: 76,
      })
    ).toEqual(block([18, 18, 18, 18, 18, 18, 18]));
  });
});
