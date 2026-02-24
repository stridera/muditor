import { UseGuards } from '@nestjs/common';
import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UserRole } from '@muditor/db';
import type { Users } from '@muditor/db';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MinimumRole } from '../auth/decorators/minimum-role.decorator';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import {
  AccountMailDto,
  AccountMailFilterInput,
  PlayerMailDto,
  PlayerMailFilterInput,
  SendAccountMailInput,
  SendBroadcastInput,
  SendPlayerMailInput,
} from './player-mail.dto';
import { PlayerMailService } from './player-mail.service';

// Raw shapes returned by Prisma with includes (used for mapper functions).
// These use `| null` for DB-nullable fields that the DTO declares as optional.
interface PlayerMailRaw {
  id: number;
  legacySenderId?: number | null;
  legacyRecipientId?: number | null;
  senderCharacterId?: string | null;
  recipientCharacterId?: string | null;
  body: string;
  sentAt: Date;
  readAt?: Date | null;
  attachedCopper: number;
  attachedSilver: number;
  attachedGold: number;
  attachedPlatinum: number;
  attachedObjectZoneId?: number | null;
  attachedObjectId?: number | null;
  wealthRetrievedAt?: Date | null;
  wealthRetrievedByCharacterId?: string | null;
  objectRetrievedAt?: Date | null;
  objectRetrievedByCharacterId?: string | null;
  objectMovedToAccountStorage?: boolean;
  isDeleted: boolean;
  createdAt: Date;
  sender?: { id: string; name: string } | null;
  recipient?: { id: string; name: string } | null;
  attachedObject?: { zoneId: number; id: number; name: string } | null;
  wealthRetrievedByCharacter?: { name: string } | null;
  objectRetrievedByCharacter?: { name: string } | null;
}

interface AccountMailRaw {
  id: number;
  senderUserId: string;
  recipientUserId?: string | null;
  isBroadcast: boolean;
  subject: string;
  body: string;
  sentAt: Date;
  readAt?: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  sender?: { id: string; username: string; email: string } | null;
  recipient?: { id: string; username: string; email: string } | null;
}

// Helper to map database result to DTO with computed fields
function mapPlayerMail(mail: PlayerMailRaw): PlayerMailDto {
  // Determine sender name: character name > legacy ID > deleted
  let senderName: string;
  if (mail.sender?.name) {
    senderName = mail.sender.name;
  } else if (mail.legacySenderId) {
    senderName = `Deleted User #${mail.legacySenderId}`;
  } else {
    senderName = '<deleted>';
  }

  // Determine recipient name: character name > legacy ID > deleted
  let recipientName: string;
  if (mail.recipient?.name) {
    recipientName = mail.recipient.name;
  } else if (mail.legacyRecipientId) {
    recipientName = `Deleted User #${mail.legacyRecipientId}`;
  } else {
    recipientName = '<deleted>';
  }

  const dto: PlayerMailDto = {
    id: mail.id,
    body: mail.body,
    sentAt: mail.sentAt,
    attachedCopper: mail.attachedCopper,
    attachedSilver: mail.attachedSilver,
    attachedGold: mail.attachedGold,
    attachedPlatinum: mail.attachedPlatinum,
    objectMovedToAccountStorage: mail.objectMovedToAccountStorage ?? false,
    isDeleted: mail.isDeleted,
    createdAt: mail.createdAt,
    senderName,
    recipientName,
    ...(mail.legacySenderId != null
      ? { legacySenderId: mail.legacySenderId }
      : {}),
    ...(mail.legacyRecipientId != null
      ? { legacyRecipientId: mail.legacyRecipientId }
      : {}),
    ...(mail.senderCharacterId != null
      ? { senderCharacterId: mail.senderCharacterId }
      : {}),
    ...(mail.recipientCharacterId != null
      ? { recipientCharacterId: mail.recipientCharacterId }
      : {}),
    ...(mail.readAt != null ? { readAt: mail.readAt } : {}),
    ...(mail.attachedObjectZoneId != null
      ? { attachedObjectZoneId: mail.attachedObjectZoneId }
      : {}),
    ...(mail.attachedObjectId != null
      ? { attachedObjectId: mail.attachedObjectId }
      : {}),
    ...(mail.wealthRetrievedAt != null
      ? { wealthRetrievedAt: mail.wealthRetrievedAt }
      : {}),
    ...(mail.wealthRetrievedByCharacterId != null
      ? { wealthRetrievedByCharacterId: mail.wealthRetrievedByCharacterId }
      : {}),
    ...(mail.objectRetrievedAt != null
      ? { objectRetrievedAt: mail.objectRetrievedAt }
      : {}),
    ...(mail.objectRetrievedByCharacterId != null
      ? { objectRetrievedByCharacterId: mail.objectRetrievedByCharacterId }
      : {}),
    ...(mail.wealthRetrievedAt
      ? {
          wealthRetrievalInfo: mail.wealthRetrievedByCharacter?.name
            ? `Retrieved by ${mail.wealthRetrievedByCharacter.name}`
            : 'Retrieved',
        }
      : {}),
    ...(mail.objectRetrievedAt
      ? {
          objectRetrievalInfo: mail.objectMovedToAccountStorage
            ? 'Moved to account storage'
            : mail.objectRetrievedByCharacter?.name
              ? `Retrieved by ${mail.objectRetrievedByCharacter.name}`
              : 'Retrieved',
        }
      : {}),
    ...(mail.sender != null ? { sender: mail.sender } : {}),
    ...(mail.recipient != null ? { recipient: mail.recipient } : {}),
    ...(mail.attachedObject != null
      ? { attachedObject: mail.attachedObject }
      : {}),
  };
  return dto;
}

function mapAccountMail(mail: AccountMailRaw): AccountMailDto {
  const dto: AccountMailDto = {
    id: mail.id,
    senderUserId: mail.senderUserId,
    isBroadcast: mail.isBroadcast,
    subject: mail.subject,
    body: mail.body,
    sentAt: mail.sentAt,
    isDeleted: mail.isDeleted,
    createdAt: mail.createdAt,
    senderName: mail.sender?.username ?? mail.sender?.email ?? '<unknown>',
    ...(mail.recipientUserId != null
      ? { recipientUserId: mail.recipientUserId }
      : {}),
    ...(mail.readAt != null ? { readAt: mail.readAt } : {}),
    ...(mail.sender != null ? { sender: mail.sender } : {}),
    ...(mail.recipient != null ? { recipient: mail.recipient } : {}),
  };
  return dto;
}

@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class PlayerMailResolver {
  constructor(private readonly playerMailService: PlayerMailService) {}

  // ============================================================================
  // PLAYER MAIL QUERIES (CODER+ - Admin View)
  // ============================================================================

  @Query(() => [PlayerMailDto], { name: 'playerMails' })
  @UseGuards(MinimumRoleGuard)
  @MinimumRole(UserRole.CODER)
  async findAllPlayerMails(
    @Args('filter', { nullable: true }) filter?: PlayerMailFilterInput,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<PlayerMailDto[]> {
    const mails = await this.playerMailService.findAllPlayerMail(
      filter,
      skip,
      take
    );
    return mails.map(mapPlayerMail);
  }

  @Query(() => PlayerMailDto, { name: 'playerMail', nullable: true })
  @UseGuards(MinimumRoleGuard)
  @MinimumRole(UserRole.CODER)
  async findOnePlayerMail(
    @Args('id', { type: () => Int }) id: number
  ): Promise<PlayerMailDto | null> {
    const mail = await this.playerMailService.findOnePlayerMail(id);
    return mail ? mapPlayerMail(mail) : null;
  }

  @Query(() => Int, { name: 'playerMailCount' })
  @UseGuards(MinimumRoleGuard)
  @MinimumRole(UserRole.CODER)
  async countPlayerMail(
    @Args('filter', { nullable: true }) filter?: PlayerMailFilterInput
  ): Promise<number> {
    return this.playerMailService.countPlayerMail(filter);
  }

  // ============================================================================
  // PLAYER MAIL QUERIES (Any Authenticated User - My Mail)
  // ============================================================================

  @Query(() => [PlayerMailDto], { name: 'myMail' })
  async findMyMail(
    @Args('characterId') characterId: string,
    @CurrentUser() user: Users,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<PlayerMailDto[]> {
    const mails = await this.playerMailService.findMyMail(
      user.id,
      characterId,
      skip,
      take
    );
    return mails.map(mapPlayerMail);
  }

  @Query(() => Int, { name: 'myMailCount' })
  async countMyMail(
    @Args('characterId') characterId: string,
    @CurrentUser() user: Users
  ): Promise<number> {
    return this.playerMailService.countMyMail(user.id, characterId);
  }

  // ============================================================================
  // PLAYER MAIL MUTATIONS
  // ============================================================================

  @Mutation(() => PlayerMailDto)
  async sendMail(
    @Args('data') data: SendPlayerMailInput,
    @CurrentUser() user: Users
  ): Promise<PlayerMailDto> {
    const mail = await this.playerMailService.sendPlayerMail(user.id, data);
    return mapPlayerMail(mail);
  }

  @Mutation(() => PlayerMailDto)
  async markMailRead(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: Users
  ): Promise<PlayerMailDto> {
    const mail = await this.playerMailService.markMailRead(user.id, id);
    return mapPlayerMail(mail);
  }

  @Mutation(() => PlayerMailDto)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole(UserRole.CODER)
  async deletePlayerMail(
    @Args('id', { type: () => Int }) id: number
  ): Promise<PlayerMailDto> {
    const mail = await this.playerMailService.deletePlayerMail(id);
    return mapPlayerMail(mail);
  }

  // Game server mutations for postmaster retrieval
  @Mutation(() => PlayerMailDto)
  async markWealthRetrieved(
    @Args('id', { type: () => Int }) id: number,
    @Args('characterId') characterId: string
  ): Promise<PlayerMailDto> {
    const mail = await this.playerMailService.markWealthRetrieved(
      id,
      characterId
    );
    return mapPlayerMail(mail);
  }

  @Mutation(() => PlayerMailDto)
  async markObjectRetrieved(
    @Args('id', { type: () => Int }) id: number,
    @Args('characterId') characterId: string,
    @Args('movedToAccountStorage', { defaultValue: false })
    movedToAccountStorage: boolean
  ): Promise<PlayerMailDto> {
    const mail = await this.playerMailService.markObjectRetrieved(
      id,
      characterId,
      movedToAccountStorage
    );
    return mapPlayerMail(mail);
  }

  // ============================================================================
  // ACCOUNT MAIL QUERIES
  // ============================================================================

  @Query(() => [AccountMailDto], { name: 'myAccountMail' })
  async findMyAccountMail(
    @CurrentUser() user: Users,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<AccountMailDto[]> {
    const mails = await this.playerMailService.findMyAccountMail(
      user.id,
      skip,
      take
    );
    return mails.map(mapAccountMail);
  }

  @Query(() => Int, { name: 'myAccountMailCount' })
  async countMyAccountMail(@CurrentUser() user: Users): Promise<number> {
    return this.playerMailService.countMyAccountMail(user.id);
  }

  @Query(() => [AccountMailDto], { name: 'allAccountMail' })
  @UseGuards(MinimumRoleGuard)
  @MinimumRole(UserRole.CODER)
  async findAllAccountMail(
    @Args('filter', { nullable: true }) filter?: AccountMailFilterInput,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('take', { type: () => Int, nullable: true }) take?: number
  ): Promise<AccountMailDto[]> {
    const mails = await this.playerMailService.findAllAccountMail(
      filter,
      skip,
      take
    );
    return mails.map(mapAccountMail);
  }

  // ============================================================================
  // ACCOUNT MAIL MUTATIONS
  // ============================================================================

  @Mutation(() => AccountMailDto)
  async sendAccountMail(
    @Args('data') data: SendAccountMailInput,
    @CurrentUser() user: Users
  ): Promise<AccountMailDto> {
    const mail = await this.playerMailService.sendAccountMail(user.id, data);
    return mapAccountMail(mail);
  }

  @Mutation(() => Int)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole(UserRole.CODER)
  async sendBroadcast(
    @Args('data') data: SendBroadcastInput,
    @CurrentUser() user: Users
  ): Promise<number> {
    return this.playerMailService.sendBroadcast(user.id, data);
  }

  @Mutation(() => AccountMailDto)
  async markAccountMailRead(
    @Args('id', { type: () => Int }) id: number,
    @CurrentUser() user: Users
  ): Promise<AccountMailDto> {
    const mail = await this.playerMailService.markAccountMailRead(user.id, id);
    return mapAccountMail(mail);
  }

  @Mutation(() => AccountMailDto)
  @UseGuards(MinimumRoleGuard)
  @MinimumRole(UserRole.CODER)
  async deleteAccountMail(
    @Args('id', { type: () => Int }) id: number
  ): Promise<AccountMailDto> {
    const mail = await this.playerMailService.deleteAccountMail(id);
    return mapAccountMail(mail);
  }
}
