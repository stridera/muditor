import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, type Users } from '@muditor/db';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { DatabaseService } from '../database/database.service';
import { EmailService } from '../email/email.service';
import type { User } from '../users/entities/user.entity';
import type { UserPreferences } from '../users/entities/user-preferences.entity';
import { AuthPayload } from './dto/auth.payload';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { GoogleProfile } from './strategies/google.strategy';

// Sanitized user returned by auth operations (no password or reset tokens)
interface SanitizedUser extends Omit<
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
      where: { email: { equals: identifier, mode: 'insensitive' } },
    });

    if (
      user &&
      user.passwordHash &&
      (await bcrypt.compare(password, user.passwordHash))
    ) {
      const { passwordHash, ...result } = user;
      return result as Users;
    }
    return null;
  }

  async register(registerInput: RegisterInput): Promise<AuthPayload> {
    const { displayName, email, password } = registerInput;

    // Check if user already exists (case-insensitive)
    const existingUser = await this.databaseService.users.findFirst({
      where: {
        OR: [
          { displayName: { equals: displayName, mode: 'insensitive' } },
          { email: { equals: email, mode: 'insensitive' } },
        ],
      },
    });

    if (existingUser) {
      if (
        existingUser.displayName.toLowerCase() === displayName.toLowerCase()
      ) {
        throw new ConflictException('Display name already exists');
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
        displayName,
        email,
        passwordHash,
        role: UserRole.PLAYER, // Default role
      },
    });

    // Generate JWT token
    const accessToken = this.generateToken(
      user.id,
      user.displayName,
      user.role
    );

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(email, displayName);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to send welcome email to ${email}: ${msg}`);
    }

    this.logger.log(`New user registered: ${displayName} (${email})`);

    const {
      passwordHash: _ph,
      resetToken: _rt,
      resetTokenExpiry: _rte,
      failedLoginAttempts: _fla,
      lockedUntil: _lu,
      lastFailedLogin: _lfl,
      preferences,
      ...rest
    } = user as Users;
    const authUser: SanitizedUser = {
      ...rest,
      ...(preferences != null
        ? { preferences: preferences as unknown as UserPreferences }
        : {}),
      isBanned: false,
    };
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

    const accessToken = this.generateToken(
      user.id,
      user.displayName,
      user.role
    );

    // Update last login timestamp
    await this.databaseService.users.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`User logged in: ${user.displayName}`);

    const {
      passwordHash: _ph2,
      resetToken: _rt2,
      resetTokenExpiry: _rte2,
      failedLoginAttempts: _fla2,
      lockedUntil: _lu2,
      lastFailedLogin: _lfl2,
      preferences: loginPreferences,
      ...rest2
    } = user as Users;
    const authUser: SanitizedUser = {
      ...rest2,
      ...(loginPreferences != null
        ? { preferences: loginPreferences as unknown as UserPreferences }
        : {}),
      isBanned: false,
    };
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

    return this.generateToken(user.id, user.displayName, user.role);
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

    // Sync password hash to all linked characters so FieryMUD can authenticate them
    await this.databaseService.characters.updateMany({
      where: { userId: user.id },
      data: { passwordHash },
    });

    this.logger.log(`Password reset completed for user: ${user.displayName}`);

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

    // Verify current password (skip for Google-only users setting their first password)
    if (user.passwordHash) {
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.databaseService.users.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Sync password hash to all linked characters so FieryMUD can authenticate them
    await this.databaseService.characters.updateMany({
      where: { userId },
      data: { passwordHash },
    });

    this.logger.log(`Password changed for user: ${user.displayName}`);

    return true;
  }

  async handleGoogleLogin(profile: GoogleProfile): Promise<{
    accessToken?: string;
    needsUsername?: boolean;
    pendingToken?: string;
    user?: SanitizedUser;
  }> {
    // Case 1: GoogleLink exists — returning user
    const existingLink = await this.databaseService.googleLink.findUnique({
      where: { googleId: profile.googleId },
      include: { user: true },
    });

    if (existingLink) {
      const user = existingLink.user;
      const isBanned = await this.checkBanStatus(user.id);
      if (isBanned) {
        throw new UnauthorizedException('Account is banned');
      }

      await this.databaseService.users.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const accessToken = this.generateToken(
        user.id,
        user.displayName,
        user.role
      );
      this.logger.log(`Google login: ${user.displayName}`);
      return { accessToken, user: this.sanitizeUser(user) };
    }

    // Case 2: No link but email matches existing user — auto-link
    const existingUser = await this.databaseService.users.findFirst({
      where: { email: { equals: profile.email, mode: 'insensitive' } },
      include: { googleLink: true },
    });

    if (existingUser) {
      if (existingUser.googleLink) {
        throw new ConflictException(
          'This account is already linked to a different Google account'
        );
      }

      const isBanned = await this.checkBanStatus(existingUser.id);
      if (isBanned) {
        throw new UnauthorizedException('Account is banned');
      }

      await this.databaseService.googleLink.create({
        data: {
          userId: existingUser.id,
          googleId: profile.googleId,
          googleEmail: profile.email,
          googleName: profile.displayName,
          avatarUrl: profile.avatarUrl ?? null,
        },
      });

      await this.databaseService.users.update({
        where: { id: existingUser.id },
        data: { lastLoginAt: new Date() },
      });

      const accessToken = this.generateToken(
        existingUser.id,
        existingUser.displayName,
        existingUser.role
      );
      this.logger.log(
        `Google auto-linked to existing user: ${existingUser.displayName}`
      );
      return { accessToken, user: this.sanitizeUser(existingUser) };
    }

    // Case 3: No match — new user, needs to choose a display name
    const pendingPayload = {
      type: 'google-pending',
      googleId: profile.googleId,
      email: profile.email,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    };
    const pendingToken = this.jwtService.sign(pendingPayload, {
      expiresIn: '15m',
    });

    return { needsUsername: true, pendingToken };
  }

  async completeGoogleRegistration(
    pendingToken: string,
    displayName: string
  ): Promise<AuthPayload> {
    let payload: {
      type: string;
      googleId: string;
      email: string;
      displayName: string;
      avatarUrl?: string;
    };
    try {
      payload = this.jwtService.verify(pendingToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired registration token');
    }

    if (payload.type !== 'google-pending') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Validate display name
    if (
      displayName.length < 3 ||
      displayName.length > 20 ||
      !/^[a-zA-Z0-9_]+$/.test(displayName)
    ) {
      throw new ConflictException(
        'Display name must be 3-20 characters, alphanumeric and underscores only'
      );
    }

    // Check display name and email availability
    const existingUser = await this.databaseService.users.findFirst({
      where: {
        OR: [
          { displayName: { equals: displayName, mode: 'insensitive' } },
          { email: { equals: payload.email, mode: 'insensitive' } },
        ],
      },
    });

    if (existingUser) {
      if (
        existingUser.displayName.toLowerCase() === displayName.toLowerCase()
      ) {
        throw new ConflictException('Display name already exists');
      }
      throw new ConflictException('Email already exists');
    }

    // Check if googleId was claimed in the meantime
    const existingLink = await this.databaseService.googleLink.findUnique({
      where: { googleId: payload.googleId },
    });
    if (existingLink) {
      throw new ConflictException(
        'This Google account has already been linked'
      );
    }

    // Create user + GoogleLink in a transaction
    const userId = crypto.randomUUID();
    const user = await this.databaseService.$transaction(async tx => {
      const newUser = await tx.users.create({
        data: {
          id: userId,
          displayName,
          email: payload.email,
          role: UserRole.PLAYER,
        },
      });
      await tx.googleLink.create({
        data: {
          userId,
          googleId: payload.googleId,
          googleEmail: payload.email,
          googleName: payload.displayName,
          avatarUrl: payload.avatarUrl ?? null,
        },
      });
      return newUser;
    });

    const accessToken = this.generateToken(
      user.id,
      user.displayName,
      user.role
    );

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(payload.email, displayName);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Failed to send welcome email to ${payload.email}: ${msg}`
      );
    }

    this.logger.log(
      `New Google user registered: ${displayName} (${payload.email})`
    );

    return { accessToken, user: this.sanitizeUser(user) };
  }

  async unlinkGoogle(userId: string): Promise<boolean> {
    const user = await this.databaseService.users.findUnique({
      where: { id: userId },
      include: { googleLink: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.googleLink) {
      throw new NotFoundException('No Google account linked');
    }

    if (!user.passwordHash) {
      throw new ConflictException(
        'Cannot unlink Google account without a password set. Please set a password first.'
      );
    }

    await this.databaseService.googleLink.delete({
      where: { userId },
    });

    this.logger.log(`Google unlinked for user: ${user.displayName}`);
    return true;
  }

  async hasGoogleLink(userId: string): Promise<boolean> {
    const link = await this.databaseService.googleLink.findUnique({
      where: { userId },
    });
    return !!link;
  }

  private sanitizeUser(user: Users): SanitizedUser {
    const {
      passwordHash: _ph,
      resetToken: _rt,
      resetTokenExpiry: _rte,
      failedLoginAttempts: _fla,
      lockedUntil: _lu,
      lastFailedLogin: _lfl,
      preferences,
      ...rest
    } = user as Users;
    return {
      ...rest,
      ...(preferences != null
        ? { preferences: preferences as unknown as UserPreferences }
        : {}),
      isBanned: false,
    };
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
    displayName: string,
    role: UserRole
  ): string {
    const payload: JwtPayload = {
      sub: userId,
      displayName,
      role,
      iat: Math.floor(Date.now() / 1000),
    };

    return this.jwtService.sign(payload);
  }
}
