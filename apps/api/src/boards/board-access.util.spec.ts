import { UserRole } from '@muditor/db';
import { canReadBoard } from './board-access.util';

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
