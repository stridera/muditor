import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './dto/auth.payload';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private emailService: EmailService
  ) {}

  async validateUser(identifier: string, password: string): Promise<any> {
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
      return result;
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
    } catch (error: any) {
      this.logger.warn(
        `Failed to send welcome email to ${email}: ${error.message || error}`
      );
    }

    this.logger.log(`New user registered: ${username} (${email})`);

    return {
      accessToken,
      user: {
        ...user,
        isBanned: false, // New users are not banned
      },
    };
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

    return {
      accessToken,
      user: {
        ...user,
        isBanned: false,
      },
    };
  }

  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    const user = await this.databaseService.users.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...result } = user;
    return result;
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
    } catch (error: any) {
      this.logger.error(
        `Failed to send password reset email to ${email}: ${error.message || error}`
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

  async updateProfile(userId: string, data: { email?: string }): Promise<any> {
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
    return result;
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
