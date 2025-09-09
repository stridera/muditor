import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
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
    const mockDatabaseService = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      banRecord: {
        findFirst: jest.fn(),
      },
    } as any;

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
      username: 'testuser',
      passwordHash: 'hashedpassword',
      role: UserRole.PLAYER,
    };

    it('should return user without password hash when credentials are valid', async () => {
      (databaseService.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password123');

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        username: 'testuser',
        role: UserRole.PLAYER,
      });
      expect(databaseService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { username: { equals: 'testuser', mode: 'insensitive' } },
            { email: { equals: 'testuser', mode: 'insensitive' } },
          ],
        },
      });
    });

    it('should return null when user not found', async () => {
      (databaseService.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('nonexistent', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is incorrect', async () => {
      (databaseService.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    const registerInput = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
    };

    const mockCreatedUser = {
      id: 'new-user-id',
      email: 'new@example.com',
      username: 'newuser',
      passwordHash: 'hashedpassword',
      role: UserRole.PLAYER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      jwtService.sign.mockReturnValue('jwt-token');
      emailService.sendWelcomeEmail.mockResolvedValue(undefined);
    });

    it('should successfully register a new user', async () => {
      (databaseService.user.findFirst as jest.Mock).mockResolvedValue(null);
      (databaseService.user.create as jest.Mock).mockResolvedValue(
        mockCreatedUser
      );

      const result = await service.register(registerInput);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: {
          ...mockCreatedUser,
          isBanned: false,
        },
      });
      expect(databaseService.user.create).toHaveBeenCalledWith({
        data: {
          username: 'newuser',
          email: 'new@example.com',
          passwordHash: 'hashedpassword',
          role: UserRole.PLAYER,
        },
      });
      expect(emailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'new@example.com',
        'newuser'
      );
    });

    it('should throw ConflictException when username already exists', async () => {
      (databaseService.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        username: 'newuser',
        email: 'other@example.com',
      });

      await expect(service.register(registerInput)).rejects.toThrow(
        new ConflictException('Username already exists')
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      (databaseService.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-id',
        username: 'otheruser',
        email: 'new@example.com',
      });

      await expect(service.register(registerInput)).rejects.toThrow(
        new ConflictException('Email already exists')
      );
    });

    it('should still register user if welcome email fails', async () => {
      (databaseService.user.findFirst as jest.Mock).mockResolvedValue(null);
      (databaseService.user.create as jest.Mock).mockResolvedValue(
        mockCreatedUser
      );
      emailService.sendWelcomeEmail.mockRejectedValue(
        new Error('Email service down')
      );

      const result = await service.register(registerInput);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: {
          ...mockCreatedUser,
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
      username: 'testuser',
      role: UserRole.PLAYER,
    };

    beforeEach(() => {
      jwtService.sign.mockReturnValue('jwt-token');
    });

    it('should successfully login user when not banned', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser);
      (databaseService.banRecord.findFirst as jest.Mock).mockResolvedValue(
        null
      );
      (databaseService.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login(loginInput);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: {
          ...mockUser,
          isBanned: false,
        },
      });
      expect(databaseService.user.update).toHaveBeenCalledWith({
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
      (databaseService.banRecord.findFirst as jest.Mock).mockResolvedValue({
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

      (databaseService.banRecord.findFirst as jest.Mock).mockResolvedValue(
        null
      );
      (databaseService.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.login(loginInput);

      expect(result).toEqual({
        accessToken: 'jwt-token',
        user: {
          ...mockUser,
          isBanned: false,
        },
      });
    });
  });

  describe('checkBanStatus', () => {
    it('should return true for active permanent ban', async () => {
      (databaseService.banRecord.findFirst as jest.Mock).mockResolvedValue({
        id: 'ban-id',
        userId: 'user-id',
        active: true,
        expiresAt: null,
      });

      // Use reflection to access private method
      const result = await (service as any).checkBanStatus('user-id');

      expect(result).toBe(true);
    });

    it('should return true for active temporary ban', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      (databaseService.banRecord.findFirst as jest.Mock).mockResolvedValue({
        id: 'ban-id',
        userId: 'user-id',
        active: true,
        expiresAt: futureDate,
      });

      const result = await (service as any).checkBanStatus('user-id');

      expect(result).toBe(true);
    });

    it('should return false for no active ban', async () => {
      (databaseService.banRecord.findFirst as jest.Mock).mockResolvedValue(
        null
      );

      const result = await (service as any).checkBanStatus('user-id');

      expect(result).toBe(false);
    });
  });

  describe('requestPasswordReset', () => {
    const mockUser = {
      id: 'user-id',
      email: 'test@example.com',
      username: 'testuser',
    };

    it('should generate reset token and send email for existing user', async () => {
      (databaseService.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (databaseService.user.update as jest.Mock).mockResolvedValue(mockUser);
      emailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await service.requestPasswordReset('test@example.com');

      expect(result).toBe(true);
      expect(databaseService.user.update).toHaveBeenCalledWith({
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
      (databaseService.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.requestPasswordReset(
        'nonexistent@example.com'
      );

      expect(result).toBe(true);
      expect(databaseService.user.update).not.toHaveBeenCalled();
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });
});
