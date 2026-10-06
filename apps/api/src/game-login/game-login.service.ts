import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { GameLoginCodeStatus, type GameLoginCode } from '@muditor/db';
import * as bcrypt from 'bcrypt';
import { CharactersService } from '../characters/characters.service';
import { DatabaseService } from '../database/database.service';
import type {
  AccountLockStatus,
  CharacterPasswordStatus,
  GameLoginCodeDto,
} from './game-login.dto';

const SALT_ROUNDS = 12;
const MIN_GAME_PASSWORD_LENGTH = 8;
const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const DELETE_AFTER_MS = 24 * 60 * 60 * 1000;
const THROTTLE_MAX_CALLS = 30;
const THROTTLE_WINDOW_MS = 60 * 1000;

/** Strip hyphens/whitespace and uppercase, so "abcd-efgh" matches "ABCDEFGH". */
export function normalizeGameLoginCode(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase();
}

function formatCode(code: string): string {
  return code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

function toDto(
  row: GameLoginCode,
  lockedUntil: Date | null = null,
  characterHasPassword = true
): GameLoginCodeDto {
  return {
    linkRequired: row.userId === null,
    characterHasPassword,
    accountLocked: !!lockedUntil && lockedUntil.getTime() > Date.now(),
    lockedUntil,
    code: formatCode(row.code),
    characterName: row.characterName,
    clientIp: row.clientIp,
    tls: row.tls,
    status: row.status,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
  };
}

@Injectable()
export class GameLoginService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GameLoginService.name);
  private sweepTimer?: NodeJS.Timeout;
  private readonly callLog = new Map<string, number[]>();

  constructor(
    private readonly db: DatabaseService,
    private readonly characters: CharactersService
  ) {}

  onModuleInit() {
    this.sweepTimer = setInterval(() => {
      this.sweep().catch((err: unknown) =>
        this.logger.error(
          `Game login code sweep failed: ${err instanceof Error ? err.message : String(err)}`
        )
      );
    }, SWEEP_INTERVAL_MS);
    this.sweepTimer.unref();
  }

  onModuleDestroy() {
    if (this.sweepTimer) clearInterval(this.sweepTimer);
  }

  /** Expire stale PENDING codes and delete codes older than 24h. */
  async sweep(now: Date = new Date()): Promise<void> {
    await this.db.gameLoginCode.updateMany({
      where: {
        status: GameLoginCodeStatus.PENDING,
        expiresAt: { lt: now },
      },
      data: { status: GameLoginCodeStatus.EXPIRED },
    });
    await this.db.gameLoginCode.deleteMany({
      where: { createdAt: { lt: new Date(now.getTime() - DELETE_AFTER_MS) } },
    });
  }

  /**
   * In-memory per-user throttle for code lookup/approve/deny: at most
   * THROTTLE_MAX_CALLS per THROTTLE_WINDOW_MS. Timestamps are pruned on access.
   */
  private throttle(userId: string, now: number = Date.now()): void {
    const recent = (this.callLog.get(userId) ?? []).filter(
      t => now - t < THROTTLE_WINDOW_MS
    );
    if (recent.length >= THROTTLE_MAX_CALLS) {
      this.callLog.set(userId, recent);
      throw new HttpException(
        'Too many game login attempts, try again in a minute',
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    recent.push(now);
    this.callLog.set(userId, recent);
  }

  /**
   * Find a PENDING, unexpired code visible to the caller. Anything else
   * (unknown, expired, already used, owned by another user) is NotFound so the
   * existence of a code is never leaked. A code with no userId is visible to
   * any caller while its character still exists and is unlinked; `character`
   * is then that character (the caller must link it to approve).
   */
  private async findVisible(rawCode: string, callerId: string) {
    this.throttle(callerId);
    const code = normalizeGameLoginCode(rawCode);
    const row = await this.db.gameLoginCode.findUnique({ where: { code } });
    if (
      !row ||
      row.status !== GameLoginCodeStatus.PENDING ||
      row.expiresAt.getTime() <= Date.now()
    ) {
      throw new NotFoundException('Code not found or expired');
    }
    if (row.userId !== null) {
      if (row.userId !== callerId) {
        throw new NotFoundException('Code not found or expired');
      }
      return { row, character: null };
    }
    const character = await this.db.characters.findFirst({
      where: {
        name: { equals: row.characterName, mode: 'insensitive' },
        userId: null,
      },
      select: { name: true, passwordHash: true },
    });
    if (!character) {
      throw new NotFoundException('Code not found or expired');
    }
    return { row, character };
  }

  private async lockedUntilOf(userId: string): Promise<Date | null> {
    const user = await this.db.users.findUnique({
      where: { id: userId },
      select: { lockedUntil: true },
    });
    return user?.lockedUntil ?? null;
  }

  async accountLockStatus(userId: string): Promise<AccountLockStatus> {
    const user = await this.db.users.findUnique({
      where: { id: userId },
      select: { lockedUntil: true, failedLoginAttempts: true },
    });
    const characters = await this.db.characters.findMany({
      where: { userId },
      select: { name: true },
      orderBy: { name: 'asc' },
    });
    const characterLinkLockouts: AccountLockStatus['characterLinkLockouts'] =
      [];
    for (const { name } of characters) {
      const remainingSeconds = await this.characters.getLockoutRemaining(name);
      if (remainingSeconds > 0) {
        characterLinkLockouts.push({ characterName: name, remainingSeconds });
      }
    }
    const lockedUntil = user?.lockedUntil ?? null;
    return {
      locked: !!lockedUntil && lockedUntil.getTime() > Date.now(),
      lockedUntil,
      failedLoginAttempts: user?.failedLoginAttempts ?? 0,
      characterLinkLockouts,
    };
  }

  /** Clear the game-side account lock and website character-link lockouts. */
  async clearAccountLock(
    userId: string,
    ip?: string
  ): Promise<AccountLockStatus> {
    this.throttle(userId);
    await this.db.users.update({
      where: { id: userId },
      data: { lockedUntil: null, failedLoginAttempts: 0 },
    });
    const characters = await this.db.characters.findMany({
      where: { userId },
      select: { name: true },
    });
    for (const { name } of characters) {
      await this.characters.clearFailedAttempts(name);
    }
    this.logger.log(
      `Account lock cleared by user ${userId} from ${ip ?? 'unknown'}`
    );
    return this.accountLockStatus(userId);
  }

  async lookup(rawCode: string, callerId: string): Promise<GameLoginCodeDto> {
    const { row, character } = await this.findVisible(rawCode, callerId);
    return toDto(
      row,
      await this.lockedUntilOf(callerId),
      character ? !!character.passwordHash : true
    );
  }

  /**
   * Approve a pending code. For a code whose character is not yet linked to
   * any account (row.userId null), the caller must supply the character's game
   * password; on success the character is linked to the caller and the code is
   * approved in one transaction.
   */
  async approve(
    rawCode: string,
    callerId: string,
    characterPassword?: string | null
  ): Promise<GameLoginCodeDto> {
    const { row, character } = await this.findVisible(rawCode, callerId);
    const now = new Date();

    if (character) {
      if (!character.passwordHash) {
        throw new BadRequestException(
          'This character has no password; contact staff to link it.'
        );
      }
      if (!characterPassword) {
        throw new BadRequestException(
          "Enter the character's game password to link it"
        );
      }
      await this.characters.verifyCharacterPasswordForLink(
        row.characterName,
        characterPassword
      );
      await this.db.$transaction(async tx => {
        const linked = await tx.characters.updateMany({
          where: {
            name: { equals: row.characterName, mode: 'insensitive' },
            userId: null,
          },
          data: { userId: callerId },
        });
        if (linked.count !== 1) {
          throw new ConflictException(
            'This character is already linked to an account'
          );
        }
        const approved = await tx.gameLoginCode.updateMany({
          where: {
            id: row.id,
            status: GameLoginCodeStatus.PENDING,
            expiresAt: { gt: now },
          },
          data: {
            userId: callerId,
            status: GameLoginCodeStatus.APPROVED,
            approvedAt: now,
            approvedByUserId: callerId,
          },
        });
        if (approved.count !== 1) {
          throw new NotFoundException('Code not found or expired');
        }
      });
      // The claim is committed; failures here must not surface as errors.
      try {
        await this.characters.clearFailedAttempts(row.characterName);
        await this.characters.refreshRoleAfterLink(callerId);
      } catch (err) {
        this.logger.warn(
          `Post-link cleanup failed for ${row.characterName}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
      this.logger.log(
        `Game login ${row.id} approved by user ${callerId}; linked character ${row.characterName}`
      );
      return toDto(
        {
          ...row,
          userId: callerId,
          status: GameLoginCodeStatus.APPROVED,
          approvedAt: now,
          approvedByUserId: callerId,
        },
        await this.lockedUntilOf(callerId)
      );
    }

    const result = await this.db.gameLoginCode.updateMany({
      where: {
        id: row.id,
        status: GameLoginCodeStatus.PENDING,
        expiresAt: { gt: now },
      },
      data: {
        status: GameLoginCodeStatus.APPROVED,
        approvedAt: now,
        approvedByUserId: callerId,
      },
    });
    if (result.count !== 1) {
      throw new NotFoundException('Code not found or expired');
    }
    this.logger.log(`Game login ${row.id} approved by user ${callerId}`);
    return toDto(
      {
        ...row,
        status: GameLoginCodeStatus.APPROVED,
        approvedAt: now,
        approvedByUserId: callerId,
      },
      await this.lockedUntilOf(callerId)
    );
  }

  async deny(rawCode: string, callerId: string): Promise<boolean> {
    const { row } = await this.findVisible(rawCode, callerId);
    // Unlinked-character codes (userId null) are visible but not deniable:
    // anyone could otherwise kill a legitimate owner's pending login.
    if (row.userId !== callerId) {
      throw new NotFoundException('Code not found or expired');
    }
    const result = await this.db.gameLoginCode.updateMany({
      where: { id: row.id, status: GameLoginCodeStatus.PENDING },
      data: { status: GameLoginCodeStatus.DENIED },
    });
    if (result.count !== 1) {
      throw new NotFoundException('Code not found or expired');
    }
    return true;
  }

  /**
   * Set the game password. It lives in Characters.passwordHash (bcrypt) and is
   * never the website password. Applies to every character owned by the user,
   * or only to `characterName` when given.
   */
  async setGamePassword(
    userId: string,
    password: string,
    characterName?: string | null
  ): Promise<boolean> {
    if (password.toLowerCase() === 'code') {
      throw new BadRequestException(
        'That word is reserved at the game login prompt'
      );
    }
    if (password.length < MIN_GAME_PASSWORD_LENGTH) {
      throw new BadRequestException(
        `Game password must be at least ${MIN_GAME_PASSWORD_LENGTH} characters`
      );
    }
    const user = await this.db.users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (
      user.passwordHash &&
      (await bcrypt.compare(password, user.passwordHash))
    ) {
      throw new BadRequestException(
        'Game password must differ from your website password'
      );
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await this.db.characters.updateMany({
      where: {
        userId,
        ...(characterName
          ? { name: { equals: characterName, mode: 'insensitive' as const } }
          : {}),
      },
      data: { passwordHash },
    });
    if (result.count === 0) {
      throw new NotFoundException(
        characterName
          ? 'Character not found on your account'
          : 'You have no characters to set a game password for'
      );
    }
    return true;
  }

  async gamePasswordStatus(userId: string): Promise<CharacterPasswordStatus[]> {
    const characters = await this.db.characters.findMany({
      where: { userId },
      select: { name: true, passwordHash: true },
      orderBy: { name: 'asc' },
    });
    return characters.map(c => ({
      characterName: c.name,
      isSet: !!c.passwordHash,
      isLegacyHash: !!c.passwordHash && !c.passwordHash.startsWith('$2'),
    }));
  }
}
