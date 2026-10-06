import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@muditor/db';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import { AuthService } from './auth.service';
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let databaseService: jest.Mocked<DatabaseService>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    // Provide only the methods the service actually calls; cast with unknown first to avoid forcing full delegate surface
    const mockDatabaseService = {
      users: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      banRecords: {
        findFirst: jest.fn(),
      },
      characters: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
    } as unknown as Pick<
      DatabaseService,
      'users' | 'banRecords' | 'characters'
    >;

    const mockJwtService = {
      sign: jest.fn(),
    };

    const mockEmailService = {
      sendWelcomeEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    databaseService = module.get(DatabaseService);
    jwtService = module.get(JwtService);
    emailService = module.get(EmailService);
  });

  describe('validateUser', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      displayName: 'testuser',
      passwordHash: 'hashedpassword',
      role: UserRole.PLAYER,
    };

    it('should return user without password hash when credentials are valid', async () => {
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue(
        mockUser
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password123');

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        displayName: 'testuser',
        role: UserRole.PLAYER,
      });
      expect(databaseService.users.findFirst).toHaveBeenCalledWith({
        where: { email: { equals: 'testuser', mode: 'insensitive' } },
      });
    });

    it('should return null when user not found', async () => {
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue(
        mockUser
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    const registerInput = {
      displayName: 'newuser',
      email: 'new@example.com',
      password: 'password123',
    };

    const mockCreatedUser = {
      id: 'new-user-id',
      email: 'new@example.com',
      displayName: 'newuser',
      passwordHash: 'hashedpassword',
      role: UserRole.PLAYER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      jwtService.sign.mockReturnValue('jwt-token');
      emailService.sendWelcomeEmail.mockResolvedValue(true);
    });

    it('should successfully register a new user', async () => {
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue(null);
      (databaseService.users.create as jest.Mock).mockResolvedValue(
        mockCreatedUser
      );

      const result = await service.register(registerInput);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: {
          id: mockCreatedUser.id,
          email: mockCreatedUser.email,
          displayName: mockCreatedUser.displayName,
          role: mockCreatedUser.role,
          createdAt: mockCreatedUser.createdAt,
          updatedAt: mockCreatedUser.updatedAt,
          isBanned: false,
        },
      });
      expect(databaseService.users.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            displayName: 'newuser',
            email: 'new@example.com',
            passwordHash: 'hashedpassword',
            role: UserRole.PLAYER,
          }),
        })
      );
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'new@example.com',
        'newuser'
      );
    });

    it('should throw ConflictException when display name already exists', async () => {
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        displayName: 'newuser',
        email: 'other@example.com',
      });

      await expect(service.register(registerInput)).rejects.toThrow(
        new ConflictException('Display name already exists')
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        displayName: 'otheruser',
        email: 'new@example.com',
      });

      await expect(service.register(registerInput)).rejects.toThrow(
        new ConflictException('Email already exists')
      );
    });

    it('should still register user if welcome email fails', async () => {
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue(null);
      (databaseService.users.create as jest.Mock).mockResolvedValue(
        mockCreatedUser
      );
      emailService.sendWelcomeEmail.mockRejectedValue(
        new Error('Email service down')
      );

      const result = await service.register(registerInput);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: {
          id: mockCreatedUser.id,
          email: mockCreatedUser.email,
          displayName: mockCreatedUser.displayName,
          role: mockCreatedUser.role,
          createdAt: mockCreatedUser.createdAt,
          updatedAt: mockCreatedUser.updatedAt,
          isBanned: false,
        },
      });
    });
  });

  describe('login', () => {
    const loginInput = {
      identifier: 'testuser',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      displayName: 'testuser',
      passwordHash: 'hash',
      role: UserRole.PLAYER,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      deletionReason: null,
      lastLoginAt: null,
      resetToken: null,
      resetTokenExpiry: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastFailedLogin: null,
      preferences: {},
      accountWealth: 0n,
    };

    beforeEach(() => {
      jwtService.sign.mockReturnValue('jwt-token');
    });

    it('should successfully login user when not banned', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      (databaseService.banRecords.findFirst as jest.Mock).mockResolvedValue(
        null
      );
      (databaseService.users.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login(loginInput);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          displayName: mockUser.displayName,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
          lastLoginAt: mockUser.lastLoginAt,
          isBanned: false,
        }),
      });
      expect(databaseService.users.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { lastLoginAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(loginInput)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
    });

    it('should throw UnauthorizedException for banned user', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      (databaseService.banRecords.findFirst as jest.Mock).mockResolvedValue({
        id: 'ban-id',
        userId: 'user-id',
        active: true,
        expiresAt: null, // Permanent ban
      });

      await expect(service.login(loginInput)).rejects.toThrow(
        new UnauthorizedException('Account is banned')
      );
    });

    it('should allow login for expired ban', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      (databaseService.banRecords.findFirst as jest.Mock).mockResolvedValue(
        null
      );
      (databaseService.users.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login(loginInput);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          displayName: mockUser.displayName,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
          lastLoginAt: mockUser.lastLoginAt,
          isBanned: false,
        }),
      });
    });
  });

  describe('checkBanStatus', () => {
    it('should return true for active permanent ban', async () => {
      (databaseService.banRecords.findFirst as jest.Mock).mockResolvedValue({
        id: 'ban-id',
        userId: 'user-id',
        active: true,
        expiresAt: null,
      });

      // Use reflection to access private method
      const result = await (
        service as unknown as {
          checkBanStatus: (id: string) => Promise<boolean>;
        }
      ).checkBanStatus('user-id');

      expect(result).toBe(true);
    });

    it('should return true for active temporary ban', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      (databaseService.banRecords.findFirst as jest.Mock).mockResolvedValue({
        id: 'ban-id',
        userId: 'user-id',
        active: true,
        expiresAt: futureDate,
      });

      const result = await (
        service as unknown as {
          checkBanStatus: (id: string) => Promise<boolean>;
        }
      ).checkBanStatus('user-id');

      expect(result).toBe(true);
    });

    it('should return false for no active ban', async () => {
      (databaseService.banRecords.findFirst as jest.Mock).mockResolvedValue(
        null
      );

      const result = await (
        service as unknown as {
          checkBanStatus: (id: string) => Promise<boolean>;
        }
      ).checkBanStatus('user-id');

      expect(result).toBe(false);
    });
  });

  describe('website password vs game password', () => {
    const user = {
      id: 'user-id',
      displayName: 'Tester',
      passwordHash: '$2b$12$site',
    };

    beforeEach(() => {
      (databaseService.users.findUnique as jest.Mock).mockResolvedValue(user);
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue(user);
    });

    it('changePassword rejects a password matching a bcrypt game password', async () => {
      (databaseService.characters.findMany as jest.Mock).mockResolvedValue([
        { passwordHash: 'abXYZ12345' }, // legacy crypt: skipped
        { passwordHash: '$2b$12$game' },
      ]);
      (bcrypt.compare as jest.Mock).mockImplementation(
        async (_pw: string, hash: string) =>
          hash === '$2b$12$site' || hash === '$2b$12$game'
      );
      await expect(
        service.changePassword('user-id', 'current', 'same-as-game')
      ).rejects.toThrow('Website password must differ from your game password');
      expect(bcrypt.compare).not.toHaveBeenCalledWith(
        'same-as-game',
        'abXYZ12345'
      );
      expect(databaseService.users.update).not.toHaveBeenCalled();
    });

    it('changePassword no longer writes to Characters.passwordHash', async () => {
      (databaseService.characters.findMany as jest.Mock).mockResolvedValue([
        { passwordHash: '$2b$12$game' },
      ]);
      (bcrypt.compare as jest.Mock).mockImplementation(
        async (_pw: string, hash: string) => hash === '$2b$12$site'
      );
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$new');
      await service.changePassword('user-id', 'current', 'brand-new-pass');
      expect(databaseService.characters.updateMany).not.toHaveBeenCalled();
    });

    it('resetPassword rejects a password matching a bcrypt game password', async () => {
      (databaseService.characters.findMany as jest.Mock).mockResolvedValue([
        { passwordHash: '$2b$12$game' },
      ]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(
        service.resetPassword('token', 'same-as-game')
      ).rejects.toThrow('Website password must differ from your game password');
    });
  });

  describe('requestPasswordReset', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      displayName: 'testuser',
    };

    it('should generate reset token and send email for existing user', async () => {
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue(
        mockUser
      );
      (databaseService.users.update as jest.Mock).mockResolvedValue(mockUser);
      emailService.sendPasswordResetEmail.mockResolvedValue(true);

      const result = await service.requestPasswordReset('test@example.com');

      expect(result).toBe(true);
      expect(databaseService.users.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: {
          resetToken: expect.any(String),
          resetTokenExpiry: expect.any(Date),
        },
      });
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(String)
      );
    });

    it('should return true for non-existent user to prevent enumeration', async () => {
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.requestPasswordReset(
        'nonexistent@example.com'
      );

      expect(result).toBe(true);
      expect(databaseService.users.update).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('Google-only accounts and admin reset links', () => {
    it('answers generically but sends nothing for a Google-only account', async () => {
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue({
        id: 'g-user',
        email: 'g@example.com',
        passwordHash: null,
        googleLink: { id: 'link' },
      });

      await expect(service.requestPasswordReset('g@example.com')).resolves.toBe(
        true
      );
      expect(databaseService.users.update).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('createAdminPasswordResetLink stores a token and returns the full URL', async () => {
      process.env.FRONTEND_URL = 'https://muditor.example/';
      (databaseService.users.update as jest.Mock).mockResolvedValue({});

      const { url, expiresAt } =
        await service.createAdminPasswordResetLink('user-id');

      const stored = (databaseService.users.update as jest.Mock).mock
        .calls[0][0];
      expect(stored.where).toEqual({ id: 'user-id' });
      expect(url).toBe(
        `https://muditor.example/reset-password?token=${stored.data.resetToken}`
      );
      expect(stored.data.resetTokenExpiry).toEqual(expiresAt);
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('soft-deleted accounts', () => {
    const deleted = {
      id: 'user-id',
      displayName: 'Gone',
      role: UserRole.PLAYER,
      passwordHash: 'hash',
      deletedAt: new Date(),
    };

    it('login refuses a deleted user even with the right password', async () => {
      (databaseService.users.findFirst as jest.Mock).mockResolvedValue(deleted);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({ identifier: 'Gone', password: 'pw' })
      ).rejects.toThrow('Account is deactivated');
    });

    it('validateJwtPayload and refreshToken refuse a deleted user', async () => {
      (databaseService.users.findUnique as jest.Mock).mockResolvedValue(
        deleted
      );
      await expect(
        service.validateJwtPayload({
          sub: 'user-id',
          displayName: 'Gone',
          role: UserRole.PLAYER,
        })
      ).rejects.toThrow('Account is deactivated');
      await expect(service.refreshToken('user-id')).rejects.toThrow(
        'Account is deactivated'
      );
    });
  });

  describe('ban enforcement on token use', () => {
    const dbUser = {
      id: 'user-id',
      displayName: 'Tester',
      role: UserRole.PLAYER,
      passwordHash: 'hash',
    };

    it('validateJwtPayload rejects a banned user', async () => {
      (databaseService.users.findUnique as jest.Mock).mockResolvedValue(dbUser);
      (databaseService.banRecords.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
      });

      await expect(
        service.validateJwtPayload({
          sub: 'user-id',
          displayName: 'Tester',
          role: UserRole.PLAYER,
        })
      ).rejects.toThrow('Account is banned');
    });

    it('validateJwtPayload accepts an unbanned user and strips passwordHash', async () => {
      (databaseService.users.findUnique as jest.Mock).mockResolvedValue(dbUser);
      (databaseService.banRecords.findFirst as jest.Mock).mockResolvedValue(
        null
      );

      const result = await service.validateJwtPayload({
        sub: 'user-id',
        displayName: 'Tester',
        role: UserRole.PLAYER,
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe('user-id');
    });

    it('refreshToken refuses to mint a token for a banned user', async () => {
      (databaseService.users.findUnique as jest.Mock).mockResolvedValue(dbUser);
      (databaseService.banRecords.findFirst as jest.Mock).mockResolvedValue({
        id: 1,
      });
      (jwtService.sign as jest.Mock).mockReturnValue('new-token');

      await expect(service.refreshToken('user-id')).rejects.toThrow(
        'Account is banned'
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('refreshToken mints a token for an unbanned user', async () => {
      (databaseService.users.findUnique as jest.Mock).mockResolvedValue(dbUser);
      (databaseService.banRecords.findFirst as jest.Mock).mockResolvedValue(
        null
      );
      (jwtService.sign as jest.Mock).mockReturnValue('new-token');

      await expect(service.refreshToken('user-id')).resolves.toBe('new-token');
    });
  });
});
