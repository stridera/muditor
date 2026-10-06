import { USER_ROLES, roleAtLeast, roleRank, rolePosterLevel } from '../roles';

describe('roles', () => {
  it('lists roles in ascending order matching the Prisma enum', () => {
    expect([...USER_ROLES]).toEqual([
      'PLAYER',
      'IMMORTAL',
      'BUILDER',
      'HEAD_BUILDER',
      'CODER',
      'IMPLEMENTOR',
    ]);
  });

  describe('roleAtLeast', () => {
    USER_ROLES.forEach((role, roleIdx) => {
      USER_ROLES.forEach((required, requiredIdx) => {
        const expected = roleIdx >= requiredIdx;
        it(`${role} ${expected ? 'satisfies' : 'does not satisfy'} ${required}`, () => {
          expect(roleAtLeast(role, required)).toBe(expected);
        });
      });
    });

    it('admits IMPLEMENTOR when PLAYER is required (regression)', () => {
      expect(roleAtLeast('IMPLEMENTOR', 'PLAYER')).toBe(true);
    });

    it('rejects missing and unknown roles', () => {
      expect(roleAtLeast(undefined, 'PLAYER')).toBe(false);
      expect(roleAtLeast(null, 'PLAYER')).toBe(false);
      expect(roleAtLeast('GOD', 'PLAYER')).toBe(false);
      expect(roleAtLeast('implementor', 'PLAYER')).toBe(false);
    });
  });

  it('roleRank returns -1 for unknown roles', () => {
    expect(roleRank('nope')).toBe(-1);
    expect(roleRank('PLAYER')).toBe(0);
  });

  it('rolePosterLevel is increasing and defaults to 1', () => {
    const levels = USER_ROLES.map(r => rolePosterLevel(r));
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
    expect(rolePosterLevel(undefined)).toBe(1);
  });
});
