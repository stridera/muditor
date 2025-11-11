import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, Users } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import type { User } from '../users/entities/user.entity';
import { AuthPayload } from './dto/auth.payload';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { JwtPayload } from './interfaces/jwt-payload.interface';

// Sanitized user returned by auth operations (no password or reset tokens)
interface SanitizedUser
  extends Omit<
    User,
    | 'passwordHash'
    | 'resetToken'
    | 'resetTokenExpiry'
    | 'failedLoginAttempts'
    | 'lockedUntil'
    | 'lastFailedLogin'
  > {
  passwordHash?: never;
  resetToken?: never;
  resetTokenExpiry?: never;
  failedLoginAttempts?: never;
  lockedUntil?: never;
  lastFailedLogin?: never;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private emailService: EmailService
  ) {}

  async validateUser(
    identifier: string,
    password: string
  ): Promise<Users | null> {
    const user = await this.databaseService.users.findFirst({
      where: {
        OR: [
          { username: { equals: identifier, mode: 'insensitive' } },
          { email: { equals: identifier, mode: 'insensitive' } }, // Allow login with email
        ],
      },
    });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result as Users;
    }
    return null;
  }

  async register(registerInput: RegisterInput): Promise<AuthPayload> {
    const { username, email, password } = registerInput;

    // Check if user already exists (case-insensitive)
    const existingUser = await this.databaseService.users.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email: { equals: email, mode: 'insensitive' } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        throw new ConflictException('Email already exists');
      }
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await this.databaseService.users.create({
      data: {
        id: crypto.randomUUID(),
        username,
        email,
        passwordHash,
        role: UserRole.PLAYER, // Default role
      },
    });

    // Generate JWT token
    const accessToken = this.generateToken(user.id, user.username, user.role);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(email, username);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to send welcome email to ${email}: ${msg}`);
    }

    this.logger.log(`New user registered: ${username} (${email})`);

    const {
      passwordHash: _ph,
      resetToken: _rt,
      resetTokenExpiry: _rte,
      failedLoginAttempts: _fla,
      lockedUntil: _lu,
      lastFailedLogin: _lfl,
      ...rest
    } = user as Users;
    const authUser: SanitizedUser = {
      ...(rest as Users),
      isBanned: false,
    } as SanitizedUser;
    if (user.lastLoginAt) authUser.lastLoginAt = user.lastLoginAt;
    return { accessToken, user: authUser };
  }

  async login(loginInput: LoginInput): Promise<AuthPayload> {
    const { identifier, password } = loginInput;

    const user = await this.validateUser(identifier, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check ban status
    const isBanned = await this.checkBanStatus(user.id);
    if (isBanned) {
      throw new UnauthorizedException('Account is banned');
    }

    const accessToken = this.generateToken(user.id, user.username, user.role);

    // Update last login timestamp
    await this.databaseService.users.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User logged in: ${user.username}`);

    const {
      passwordHash: _ph2,
      resetToken: _rt2,
      resetTokenExpiry: _rte2,
      failedLoginAttempts: _fla2,
      lockedUntil: _lu2,
      lastFailedLogin: _lfl2,
      ...rest2
    } = user as Users;
    const authUser: SanitizedUser = {
      ...(rest2 as Users),
      isBanned: false,
    } as SanitizedUser;
    if (user.lastLoginAt) authUser.lastLoginAt = user.lastLoginAt;
    return { accessToken, user: authUser };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<Users> {
    const user = await this.databaseService.users.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...result } = user;
    return result as Users;
  }

  async refreshToken(userId: string): Promise<string> {
    const user = await this.databaseService.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.generateToken(user.id, user.username, user.role);
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.databaseService.users.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });

    if (!user) {
      // Return true anyway to avoid user enumeration attacks
      this.logger.warn(
        `Password reset requested for non-existent email: ${email}`
      );
      return true;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.databaseService.users.update({
      where: { id: user.id },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
      },
    });

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
      this.logger.log(`Password reset email sent to: ${email}`);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to send password reset email to ${email}: ${msg}`
      );
      // Don't throw the error to avoid revealing email sending issues
    }

    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.databaseService.users.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await this.databaseService.users.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    this.logger.log(`Password reset completed for user: ${user.username}`);

    return true;
  }

  async updateProfile(
    userId: string,
    data: { email?: string }
  ): Promise<Users> {
    // Check if email is already taken by another user (case-insensitive)
    if (data.email) {
      const existingUser = await this.databaseService.users.findFirst({
        where: {
          email: { equals: data.email, mode: 'insensitive' },
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const user = await this.databaseService.users.update({
      where: { id: userId },
      data,
    });

    const { passwordHash, resetToken, resetTokenExpiry, ...result } = user;
    return result as Users;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await this.databaseService.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.databaseService.users.update({
      where: { id: userId },
      data: { passwordHash },
    });

    this.logger.log(`Password changed for user: ${user.username}`);

    return true;
  }

  private async checkBanStatus(userId: string): Promise<boolean> {
    const activeBan = await this.databaseService.banRecords.findFirst({
      where: {
        userId,
        active: true,
        OR: [
          { expiresAt: null }, // Permanent ban
          { expiresAt: { gt: new Date() } }, // Temporary ban still active
        ],
      },
    });

    return !!activeBan;
  }

  private generateToken(
    userId: string,
    username: string,
    role: UserRole
  ): string {
    const payload: JwtPayload = {
      sub: userId,
      username,
      role,
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(payload);
  }
}
