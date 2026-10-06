import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@muditor/db';
import type { AuthService } from '../auth/auth.service';
import type { DatabaseService } from '../database/database.service';
import { AdminUsersService } from './admin-users.service';
import type { RoleCalculatorService } from './services/role-calculator.service';

describe('AdminUsersService', () => {
  const users: Record<string, Record<string, unknown>> = {};
  let db: {
    users: { findUnique: jest.Mock; update: jest.Mock; count: jest.Mock };
    characters: { findUnique: jest.Mock; update: jest.Mock };
    auditLogs: { create: jest.Mock };
  };
  let roleCalc: { updateUserRole: jest.Mock };
  let auth: { createAdminPasswordResetLink: jest.Mock };
  let service: AdminUsersService;

  const addUser = (id: string, role: UserRole, extra = {}) => {
    users[id] = {
      id,
      role,
      email: `${id}@x.test`,
      displayName: id,
      passwordHash: null,
      googleLink: null,
      characters: [],
      banRecords: [],
      createdAt: new Date(),
      lastLoginAt: null,
      deletedAt: null,
      deletionReason: null,
      ...extra,
    };
  };

  beforeEach(() => {
    for (const k of Object.keys(users)) delete users[k];
    addUser('impl', UserRole.IMPLEMENTOR);
    addUser('coder', UserRole.CODER);
    addUser('coder2', UserRole.CODER);
    addUser('builder', UserRole.BUILDER);
    db = {
      users: {
        findUnique: jest.fn(async ({ where }) => users[where.id] ?? null),
        update: jest.fn(async ({ where, data }) => {
          Object.assign(users[where.id] ?? {}, data);
          return users[where.id];
        }),
        count: jest.fn(
          async () =>
            Object.values(users).filter(
              u => u.role === UserRole.IMPLEMENTOR && !u.deletedAt
            ).length
        ),
      },
      characters: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'c1',
          name: 'Venath',
          userId: 'builder',
        }),
        update: jest.fn().mockResolvedValue({}),
      },
      auditLogs: { create: jest.fn().mockResolvedValue({}) },
    };
    roleCalc = { updateUserRole: jest.fn().mockResolvedValue('PLAYER') };
    auth = {
      createAdminPasswordResetLink: jest.fn().mockResolvedValue({
        url: 'https://x/reset-password?token=abc',
        expiresAt: new Date(),
      }),
    };
    service = new AdminUsersService(
      db as unknown as DatabaseService,
      roleCalc as unknown as RoleCalculatorService,
      auth as unknown as AuthService
    );
  });

  describe('setUserRole', () => {
    it('lets a CODER set a role below CODER and audits it', async () => {
      const out = await service.setUserRole(
        'coder',
        'builder',
        UserRole.IMMORTAL
      );
      expect(out.role).toBe(UserRole.IMMORTAL);
      expect(db.auditLogs.create).toHaveBeenCalledTimes(1);
    });

    it('stops a CODER from granting CODER or higher', async () => {
      await expect(
        service.setUserRole('coder', 'builder', UserRole.CODER)
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.setUserRole('coder', 'coder', UserRole.IMPLEMENTOR)
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('stops a CODER from changing a peer or higher', async () => {
      await expect(
        service.setUserRole('coder', 'coder2', UserRole.PLAYER)
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        service.setUserRole('coder', 'impl', UserRole.PLAYER)
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('lets an IMPLEMENTOR set any role', async () => {
      const out = await service.setUserRole(
        'impl',
        'builder',
        UserRole.IMPLEMENTOR
      );
      expect(out.role).toBe(UserRole.IMPLEMENTOR);
    });

    it('refuses to demote the last IMPLEMENTOR (self-demotion)', async () => {
      await expect(
        service.setUserRole('impl', 'impl', UserRole.CODER)
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(users.impl?.role).toBe(UserRole.IMPLEMENTOR);
    });

    it('allows demoting an IMPLEMENTOR when another remains', async () => {
      addUser('impl2', UserRole.IMPLEMENTOR);
      const out = await service.setUserRole('impl', 'impl', UserRole.CODER);
      expect(out.role).toBe(UserRole.CODER);
    });
  });

  describe('setUserDeleted', () => {
    it('soft-deletes with a reason and restores', async () => {
      const del = await service.setUserDeleted(
        'coder',
        'builder',
        true,
        'spam'
      );
      expect(del.deletedAt).toBeInstanceOf(Date);
      expect(del.deletionReason).toBe('spam');
      const res = await service.setUserDeleted('coder', 'builder', false);
      expect(res.deletedAt).toBeNull();
      expect(res.deletionReason).toBeNull();
    });

    it('requires a reason, and forbids self-delete and peers', async () => {
      await expect(
        service.setUserDeleted('coder', 'builder', true, '  ')
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.setUserDeleted('impl', 'impl', true, 'x')
      ).rejects.toBeInstanceOf(BadRequestException);
      await expect(
        service.setUserDeleted('coder', 'coder2', true, 'x')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('unlinkCharacter', () => {
    it('clears the owner and recalculates without raising', async () => {
      await service.unlinkCharacter('coder', 'c1');
      expect(db.characters.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: { userId: null },
      });
      expect(roleCalc.updateUserRole).toHaveBeenCalledWith('builder');
    });

    it('cannot touch a character of a higher-ranked user', async () => {
      db.characters.findUnique.mockResolvedValue({
        id: 'c2',
        name: 'Boss',
        userId: 'impl',
      });
      await expect(
        service.unlinkCharacter('coder', 'c2')
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(db.characters.update).not.toHaveBeenCalled();
    });
  });

  describe('createPasswordResetLink', () => {
    it('returns the link and audits without the token', async () => {
      const link = await service.createPasswordResetLink('coder', 'builder');
      expect(link.url).toContain('/reset-password?token=');
      const audit = JSON.stringify(db.auditLogs.create.mock.calls[0][0]);
      expect(audit).not.toContain('abc');
      expect(audit).toContain('ADMIN_CREATE_PASSWORD_RESET_LINK');
    });

    it('refuses to mint a link for a peer or higher (takeover)', async () => {
      await expect(
        service.createPasswordResetLink('coder', 'impl')
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(auth.createAdminPasswordResetLink).not.toHaveBeenCalled();
    });
  });
});
