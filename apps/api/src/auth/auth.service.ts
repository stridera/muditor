import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
import { hasActiveBan } from './ban.util';
import { AuthPayload } from './dto/auth.payload';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import type { GoogleProfile } from './strategies/google.strategy';

const PASSWORD_RESET_TTL_MS = 15 * 60 * 1000; // 15 minutes
/** How recent a sign-in must be to set a first password without a current one. */
const REAUTH_WINDOW_SECONDS = 10 * 60;
const ADMIN_PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour (handed over out of band)

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

    this.assertNotDeleted(user);

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

    this.assertNotDeleted(user);

    if (await this.checkBanStatus(user.id)) {
      throw new UnauthorizedException('Account is banned');
    }

    const { passwordHash, ...result } = user;
    return result as Users;
  }

  async refreshToken(userId: string, authAt?: number): Promise<string> {
    const user = await this.databaseService.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.assertNotDeleted(user);

    if (await this.checkBanStatus(user.id)) {
      throw new UnauthorizedException('Account is banned');
    }

    // A refresh must not launder an old session into a "recent" sign-in.
    return this.generateToken(user.id, user.displayName, user.role, authAt);
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.databaseService.users.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: { googleLink: true },
    });

    if (!user) {
      // Return true anyway to avoid user enumeration attacks
      this.logger.warn(
        `Password reset requested for non-existent email: ${email}`
      );
      return true;
    }

    if (!user.passwordHash && user.googleLink) {
      // Google-only account: there is no password to reset. Respond
      // generically (no account-existence leak); the forgot-password page
      // tells Google users to use "Sign in with Google".
      this.logger.log(
        `Password reset requested for Google-only account ${user.id}; no email sent`
      );
      return true;
    }

    const { resetToken } = await this.issueResetToken(user.id);

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

  /** Create and store a password reset token (same one for email and admin links). */
  private async issueResetToken(
    userId: string,
    ttlMs = PASSWORD_RESET_TTL_MS
  ): Promise<{ resetToken: string; resetTokenExpiry: Date }> {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + ttlMs);
    await this.databaseService.users.update({
      where: { id: userId },
      data: { resetToken, resetTokenExpiry },
    });
    return { resetToken, resetTokenExpiry };
  }

  /**
   * Admin-initiated reset: same token as the forgot-password flow, but the
   * full URL is returned to the admin instead of being emailed.
   */
  async createAdminPasswordResetLink(
    userId: string
  ): Promise<{ url: string; expiresAt: Date }> {
    const { resetToken, resetTokenExpiry } = await this.issueResetToken(
      userId,
      ADMIN_PASSWORD_RESET_TTL_MS
    );
    const base = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(
      /\/+$/,
      ''
    );
    return {
      url: `${base}/reset-password?token=${resetToken}`,
      expiresAt: resetTokenExpiry,
    };
  }

  /**
   * The website password must never equal a game password
   * (Characters.passwordHash). Only bcrypt hashes can be compared; legacy
   * crypt(3) hashes are skipped.
   */
  private async assertDiffersFromGamePasswords(
    userId: string,
    newPassword: string
  ): Promise<void> {
    const characters = await this.databaseService.characters.findMany({
      where: { userId },
      select: { passwordHash: true },
    });
    for (const { passwordHash } of characters) {
      if (
        passwordHash.startsWith('$2') &&
        (await bcrypt.compare(newPassword, passwordHash))
      ) {
        throw new BadRequestException(
          'Website password must differ from your game password'
        );
      }
    }
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

    await this.assertDiffersFromGamePasswords(user.id, newPassword);

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

    this.logger.log(`Password reset completed for user: ${user.displayName}`);

    return true;
  }

  async updateProfile(
    userId: string,
    data: { email?: string; currentPassword?: string }
  ): Promise<Users> {
    const current = await this.databaseService.users.findUnique({
      where: { id: userId },
    });
    if (!current) {
      throw new NotFoundException('User not found');
    }

    const update: { email?: string } = {};
    const emailChanged =
      !!data.email && data.email.toLowerCase() !== current.email.toLowerCase();

    if (emailChanged && data.email) {
      // The email is the account-recovery channel: changing it is an account
      // takeover step, so a stolen token alone must not be enough.
      if (!current.passwordHash) {
        throw new ForbiddenException(
          'Set a password before changing your email address'
        );
      }
      if (
        !data.currentPassword ||
        !(await bcrypt.compare(data.currentPassword, current.passwordHash))
      ) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Check if email is already taken by another user (case-insensitive)
      const existingUser = await this.databaseService.users.findFirst({
        where: {
          email: { equals: data.email, mode: 'insensitive' },
          id: { not: userId },
        },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
      update.email = data.email;
    }

    const user = await this.databaseService.users.update({
      where: { id: userId },
      data: update,
    });

    const { passwordHash, resetToken, resetTokenExpiry, ...result } = user;
    return result as Users;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    authAt?: number
  ): Promise<boolean> {
    const user = await this.databaseService.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Google-only users setting their first password have no current password
    // to verify, so require a recent sign-in instead (a stolen session token
    // must not be able to add a password and lock the owner in).
    if (!user.passwordHash) {
      const age = Math.floor(Date.now() / 1000) - (authAt ?? 0);
      if (authAt === undefined || age > REAUTH_WINDOW_SECONDS || age < -60) {
        throw new UnauthorizedException(
          'Please sign in again before setting a password'
        );
      }
    } else {
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
    }

    await this.assertDiffersFromGamePasswords(userId, newPassword);

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.databaseService.users.update({
      where: { id: userId },
      data: { passwordHash },
    });

    this.logger.log(`Password changed for user: ${user.displayName}`);

    return true;
  }

  /** True when `Users.preferences` marks the email as never verified. */
  private isEmailUnverified(preferences: unknown): boolean {
    return (
      typeof preferences === 'object' &&
      preferences !== null &&
      (preferences as Record<string, unknown>)['emailVerified'] === false
    );
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
      this.assertNotDeleted(user);
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

      this.assertNotDeleted(existingUser);

      // Accounts created at the game prompt carry an email nobody has
      // proven (the game stores `preferences.emailVerified = false`).
      // Linking by email would hand the real owner of that address an
      // account whose characters (and game passwords) were set up by
      // whoever typed it first, so refuse instead of auto-linking.
      if (this.isEmailUnverified(existingUser.preferences)) {
        this.logger.warn(
          `Google login refused: ${existingUser.displayName} has an unverified in-game email`
        );
        throw new ConflictException(
          'An account for this email was created in the game and its email has not been verified, so it cannot be linked to Google automatically. Contact staff to verify it.'
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

  /** Soft-deleted accounts (admin action) can never log in or refresh. */
  private assertNotDeleted(user: Pick<Users, 'deletedAt'>): void {
    if (user.deletedAt) {
      throw new UnauthorizedException('Account is deactivated');
    }
  }

  private async checkBanStatus(userId: string): Promise<boolean> {
    return hasActiveBan(this.databaseService, userId);
  }

  private generateToken(
    userId: string,
    displayName: string,
    role: UserRole,
    authAt?: number
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
      sub: userId,
      displayName,
      role,
      iat: now,
      authAt: authAt ?? now,
    };

    return this.jwtService.sign(payload);
  }
}
