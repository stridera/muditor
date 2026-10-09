import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '@muditor/db';
import { UsersService } from './users.service';

describe('UsersService ban/unban rank rules', () => {
  const users: Record<string, { id: string; role: UserRole }> = {};
  let bans: Array<Record<string, unknown>>;
  let db: Record<string, any>;
  let service: UsersService;

  const add = (id: string, role: UserRole) => (users[id] = { id, role });

  beforeEach(() => {
    for (const k of Object.keys(users)) delete users[k];
    add('impl', UserRole.IMPLEMENTOR);
    add('impl2', UserRole.IMPLEMENTOR);
    add('coder', UserRole.CODER);
    add('builder', UserRole.BUILDER);
    add('imm', UserRole.IMMORTAL);
    add('imm2', UserRole.IMMORTAL);
    add('player', UserRole.PLAYER);
    bans = [];
    db = {
      users: {
        findUnique: jest.fn(async ({ where }) => users[where.id] ?? null),
      },
      banRecords: {
        findFirst: jest.fn(
          async ({ where }) =>
            bans.find(b => b.userId === where.userId && b.active) ?? null
        ),
        create: jest.fn(async ({ data }) => {
          const rec = {
            ...data,
            active: true,
            user: users[data.userId],
            bannedByUser: users[data.bannedBy],
          };
          bans.push(rec);
          return rec;
        }),
        update: jest.fn(async ({ where, data }) => {
          const rec = bans.find(b => b.id === where.id)!;
          Object.assign(rec, data);
          return rec;
        }),
      },
    };
    service = new UsersService(db as never);
  });

  const ban = (actor: string, target: string) =>
    service.banUser({ userId: target, reason: 'r' }, actor);

  describe('banUser', () => {
    it('denies an IMMORTAL banning an IMPLEMENTOR, a CODER or an equal rank', async () => {
      await expect(ban('imm', 'impl')).rejects.toBeInstanceOf(
        ForbiddenException
      );
      await expect(ban('imm', 'coder')).rejects.toBeInstanceOf(
        ForbiddenException
      );
      await expect(ban('imm', 'imm2')).rejects.toBeInstanceOf(
        ForbiddenException
      );
      expect(db.banRecords.create).not.toHaveBeenCalled();
    });

    it('allows banning a strictly lower rank', async () => {
      await ban('imm', 'player');
      await ban('coder', 'builder');
      await ban('impl', 'coder');
      expect(db.banRecords.create).toHaveBeenCalledTimes(3);
    });

    it('denies an IMPLEMENTOR banning another IMPLEMENTOR (strictly above)', async () => {
      await expect(ban('impl', 'impl2')).rejects.toBeInstanceOf(
        ForbiddenException
      );
    });
  });

  describe('unbanUser', () => {
    it('denies lifting a ban on a user of equal or higher rank', async () => {
      bans.push({ id: 'b1', userId: 'imm2', bannedBy: 'impl', active: true });
      await expect(service.unbanUser('imm2', 'imm')).rejects.toBeInstanceOf(
        ForbiddenException
      );
      expect(db.banRecords.update).not.toHaveBeenCalled();
    });

    it('denies lifting a ban issued by a higher-ranked user', async () => {
      bans.push({
        id: 'b2',
        userId: 'player',
        bannedBy: 'coder',
        active: true,
      });
      await expect(service.unbanUser('player', 'imm')).rejects.toBeInstanceOf(
        ForbiddenException
      );
      expect(db.banRecords.update).not.toHaveBeenCalled();
    });

    it('allows lifting a ban by the issuer, or by a user at or above the issuer', async () => {
      bans.push({ id: 'b3', userId: 'player', bannedBy: 'imm', active: true });
      await service.unbanUser('player', 'imm');
      expect(db.banRecords.update).toHaveBeenCalledTimes(1);

      bans.push({ id: 'b4', userId: 'player', bannedBy: 'imm', active: true });
      await service.unbanUser('player', 'coder');
      expect(db.banRecords.update).toHaveBeenCalledTimes(2);
    });
  });
});
