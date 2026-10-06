import { UserRole, type Users } from '@muditor/db';
import { UsersService } from './users.service';

// Role-hierarchy flags must be "at or above" checks. A BUILDER is also an
// immortal; exact-match checks previously denied builders dashboard access.
describe('UsersService role flags', () => {
  const svc = new UsersService({} as never);
  const as = (role: UserRole) => ({ role }) as unknown as Users;

  it.each([
    [UserRole.PLAYER, false, false, false, false],
    [UserRole.IMMORTAL, true, false, false, false],
    [UserRole.BUILDER, true, true, false, false],
    [UserRole.HEAD_BUILDER, true, true, false, false],
    [UserRole.CODER, true, true, true, false],
    [UserRole.IMPLEMENTOR, true, true, true, true],
  ])('%s', (role, imm, bld, cod, impl) => {
    const u = as(role);
    expect(svc.isImmortal(u)).toBe(imm);
    expect(svc.isBuilder(u)).toBe(bld);
    expect(svc.isCoder(u)).toBe(cod);
    expect(svc.isImplementor(u)).toBe(impl);
    expect(svc.canAccessDashboard(u)).toBe(imm);
  });
});
