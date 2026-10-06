import { UserRole } from '@muditor/db';
import { RoleCalculatorService } from './role-calculator.service';

describe('RoleCalculatorService.updateUserRole (escalation rule)', () => {
  const db = {
    characters: { findMany: jest.fn() },
    users: { findUnique: jest.fn(), update: jest.fn() },
  };
  let service: RoleCalculatorService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new RoleCalculatorService(db as never);
  });

  it('does not promote on unlink-style recalculation (default)', async () => {
    db.characters.findMany.mockResolvedValue([{ level: 105 }]);
    db.users.findUnique.mockResolvedValue({ role: UserRole.IMMORTAL });
    expect(await service.updateUserRole('u1')).toBe(UserRole.IMMORTAL);
    expect(db.users.update).not.toHaveBeenCalled();
  });

  it('lowers a role automatically', async () => {
    db.characters.findMany.mockResolvedValue([{ level: 50 }]);
    db.users.findUnique.mockResolvedValue({ role: UserRole.BUILDER });
    expect(await service.updateUserRole('u1')).toBe(UserRole.PLAYER);
    expect(db.users.update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { role: UserRole.PLAYER },
    });
  });

  it('raises only when allowRaise is set (character link)', async () => {
    db.characters.findMany.mockResolvedValue([{ level: 103 }]);
    db.users.findUnique.mockResolvedValue({ role: UserRole.PLAYER });
    expect(await service.updateUserRole('u1', { allowRaise: true })).toBe(
      UserRole.HEAD_BUILDER
    );
    expect(db.users.update).toHaveBeenCalledTimes(1);
  });
});
