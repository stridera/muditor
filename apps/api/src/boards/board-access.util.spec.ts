import { UserRole } from '@muditor/db';
import {
  BoardPrivilege,
  canReadBoard,
  hasBoardPrivilege,
} from './board-access.util';

describe('canReadBoard', () => {
  const player = { role: UserRole.PLAYER };
  const immortal = { role: UserRole.IMMORTAL };

  it('lets anyone, including anonymous callers, read a board listing READ', () => {
    expect(canReadBoard([0, 1, 2, 3, 4, 5, 6, 7], null)).toBe(true);
    expect(canReadBoard([0], player)).toBe(true);
    expect(canReadBoard([{ privilege: 'READ' }], null)).toBe(true);
  });

  it('hides boards without READ from anonymous callers and players', () => {
    expect(canReadBoard([], null)).toBe(false);
    expect(canReadBoard([], player)).toBe(false);
    expect(canReadBoard([1, 2], player)).toBe(false);
    expect(canReadBoard('garbage', player)).toBe(false);
    expect(canReadBoard(undefined, null)).toBe(false);
  });

  it('lets IMMORTAL+ read every board', () => {
    expect(canReadBoard([], immortal)).toBe(true);
    expect(canReadBoard(null, { role: UserRole.CODER })).toBe(true);
  });

  it('honours a minRole on a READ rule', () => {
    const rule = [{ privilege: 0, minRole: UserRole.BUILDER }];
    expect(canReadBoard(rule, player)).toBe(false);
    expect(canReadBoard(rule, null)).toBe(false);
    expect(canReadBoard(rule, { role: UserRole.BUILDER })).toBe(true);
  });
});

describe('legacy level rules', () => {
  const player = { role: UserRole.PLAYER };
  const read = (lo: number, hi = 105) => [
    { privilege: 'Read', level: lo, maxLevel: hi },
  ];

  it('treats level 0-105 (wof1/wof2) and level 1+ (archive) as public', () => {
    expect(canReadBoard(read(0), null)).toBe(true);
    expect(canReadBoard(read(1), null)).toBe(true);
    expect(canReadBoard(read(1), player)).toBe(true);
  });

  it('maps staff levels to roles', () => {
    expect(canReadBoard(read(100), player)).toBe(false);
    expect(canReadBoard(read(100), null)).toBe(false);
    expect(canReadBoard(read(100), { role: UserRole.IMMORTAL })).toBe(true);
    // level 101 -> BUILDER, 104 -> CODER
    const rule = [{ privilege: 1, minLevel: 104 }];
    const write = (role: UserRole) =>
      hasBoardPrivilege(rule, BoardPrivilege.WRITE_NEW, { role });
    expect(write(UserRole.BUILDER)).toBe(false);
    expect(write(UserRole.CODER)).toBe(true);
  });

  it('ignores rules for other privileges and unevaluable raw rules', () => {
    const privs = [
      { privilege: 'WriteNew', level: 0 },
      { privilege: 'Read', rule: '2 4 1' },
    ];
    expect(hasBoardPrivilege(privs, BoardPrivilege.READ, player)).toBe(false);
    expect(hasBoardPrivilege(privs, BoardPrivilege.WRITE_NEW, player)).toBe(
      true
    );
    expect(hasBoardPrivilege(privs, BoardPrivilege.WRITE_STICKY, player)).toBe(
      false
    );
    expect(
      hasBoardPrivilege(privs, BoardPrivilege.READ, { role: UserRole.CODER })
    ).toBe(true);
  });
});

describe('level rules 2-99', () => {
  const rule = [{ privilege: 'Read', level: 30, maxLevel: 60 }];
  const as = (
    characterLevels?: number[],
    role: UserRole = UserRole.PLAYER
  ) => ({
    role,
    characterLevels,
  });

  it('is not open to every logged-in account', () => {
    expect(canReadBoard(rule, as([]))).toBe(false);
    expect(canReadBoard(rule, as(undefined))).toBe(false);
    expect(canReadBoard(rule, { role: UserRole.PLAYER })).toBe(false);
    expect(canReadBoard(rule, null)).toBe(false);
  });

  it('needs one linked character in [level, maxLevel]', () => {
    expect(canReadBoard(rule, as([29]))).toBe(false);
    expect(canReadBoard(rule, as([61]))).toBe(false);
    expect(canReadBoard(rule, as([1, 30]))).toBe(true);
    expect(canReadBoard(rule, as([60]))).toBe(true);
    // no single character in range even though min and max are both covered
    expect(canReadBoard(rule, as([20, 70]))).toBe(false);
  });

  it('treats a missing maxLevel as unbounded', () => {
    expect(canReadBoard([{ privilege: 'Read', level: 30 }], as([99]))).toBe(
      true
    );
  });

  it('lets staff through regardless of their characters', () => {
    expect(canReadBoard(rule, as([], UserRole.IMMORTAL))).toBe(true);
    expect(
      hasBoardPrivilege(
        [{ privilege: 'WriteNew', level: 30, maxLevel: 60 }],
        BoardPrivilege.WRITE_NEW,
        as([100], UserRole.IMMORTAL)
      )
    ).toBe(true);
  });
});
