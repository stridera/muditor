import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  PlayerMailFilterInput,
  SendPlayerMailInput,
  AccountMailFilterInput,
  SendAccountMailInput,
  SendBroadcastInput,
} from './player-mail.dto';

@Injectable()
export class PlayerMailService {
  constructor(private readonly database: DatabaseService) {}

  // ============================================================================
  // PLAYER MAIL (Character-to-Character)
  // ============================================================================

  async findAllPlayerMail(
    filter?: PlayerMailFilterInput,
    skip?: number,
    take?: number
  ) {
    const where: any = {};

    if (filter) {
      if (filter.senderCharacterId) {
        where.senderCharacterId = filter.senderCharacterId;
      }
      if (filter.recipientCharacterId) {
        where.recipientCharacterId = filter.recipientCharacterId;
      }
      if (filter.searchBody) {
        where.body = { contains: filter.searchBody, mode: 'insensitive' };
      }
      if (filter.fromDate || filter.toDate) {
        where.sentAt = {};
        if (filter.fromDate) where.sentAt.gte = filter.fromDate;
        if (filter.toDate) where.sentAt.lte = filter.toDate;
      }
      if (!filter.includeDeleted) {
        where.isDeleted = false;
      }
    } else {
      where.isDeleted = false;
    }

    return this.database.playerMail.findMany({
      where,
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      orderBy: { sentAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
        attachedObject: { select: { zoneId: true, id: true, name: true } },
        wealthRetrievedByCharacter: { select: { id: true, name: true } },
        objectRetrievedByCharacter: { select: { id: true, name: true } },
      },
    });
  }

  async findOnePlayerMail(id: number) {
    return this.database.playerMail.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
        attachedObject: { select: { zoneId: true, id: true, name: true } },
        wealthRetrievedByCharacter: { select: { id: true, name: true } },
        objectRetrievedByCharacter: { select: { id: true, name: true } },
      },
    });
  }

  async countPlayerMail(filter?: PlayerMailFilterInput) {
    const where: any = {};

    if (filter) {
      if (filter.senderCharacterId) {
        where.senderCharacterId = filter.senderCharacterId;
      }
      if (filter.recipientCharacterId) {
        where.recipientCharacterId = filter.recipientCharacterId;
      }
      if (filter.searchBody) {
        where.body = { contains: filter.searchBody, mode: 'insensitive' };
      }
      if (!filter.includeDeleted) {
        where.isDeleted = false;
      }
    } else {
      where.isDeleted = false;
    }

    return this.database.playerMail.count({ where });
  }

  async findMyMail(
    userId: string,
    characterId: string,
    skip?: number,
    take?: number
  ) {
    // Validate user owns the character
    const character = await this.database.characters.findFirst({
      where: { id: characterId, userId },
    });

    if (!character) {
      throw new ForbiddenException('You do not own this character');
    }

    return this.database.playerMail.findMany({
      where: {
        recipientCharacterId: characterId,
        isDeleted: false,
      },
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      orderBy: { sentAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
        attachedObject: { select: { zoneId: true, id: true, name: true } },
        wealthRetrievedByCharacter: { select: { id: true, name: true } },
        objectRetrievedByCharacter: { select: { id: true, name: true } },
      },
    });
  }

  async countMyMail(userId: string, characterId: string) {
    // Validate user owns the character
    const character = await this.database.characters.findFirst({
      where: { id: characterId, userId },
    });

    if (!character) {
      throw new ForbiddenException('You do not own this character');
    }

    return this.database.playerMail.count({
      where: {
        recipientCharacterId: characterId,
        isDeleted: false,
      },
    });
  }

  async sendPlayerMail(userId: string, data: SendPlayerMailInput) {
    // Validate user owns the sender character
    const senderCharacter = await this.database.characters.findFirst({
      where: { id: data.senderCharacterId, userId },
    });

    if (!senderCharacter) {
      throw new ForbiddenException('You do not own the sender character');
    }

    // Validate recipient character exists
    const recipientCharacter = await this.database.characters.findUnique({
      where: { id: data.recipientCharacterId },
    });

    if (!recipientCharacter) {
      throw new NotFoundException('Recipient character not found');
    }

    // Validate attached object exists if provided
    if (data.attachedObjectZoneId && data.attachedObjectId) {
      const obj = await this.database.objects.findUnique({
        where: {
          zoneId_id: {
            zoneId: data.attachedObjectZoneId,
            id: data.attachedObjectId,
          },
        },
      });
      if (!obj) {
        throw new NotFoundException('Attached object not found');
      }
    }

    return this.database.playerMail.create({
      data: {
        senderCharacterId: data.senderCharacterId,
        recipientCharacterId: data.recipientCharacterId,
        body: data.body,
        sentAt: new Date(),
        attachedCopper: data.attachedCopper ?? 0,
        attachedSilver: data.attachedSilver ?? 0,
        attachedGold: data.attachedGold ?? 0,
        attachedPlatinum: data.attachedPlatinum ?? 0,
        attachedObjectZoneId: data.attachedObjectZoneId ?? null,
        attachedObjectId: data.attachedObjectId ?? null,
      },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
        attachedObject: { select: { zoneId: true, id: true, name: true } },
      },
    });
  }

  async markMailRead(userId: string, id: number) {
    const mail = await this.database.playerMail.findUnique({
      where: { id },
      include: { recipient: { select: { userId: true } } },
    });

    if (!mail) {
      throw new NotFoundException('Mail not found');
    }

    // Validate user owns the recipient character
    if (mail.recipient?.userId !== userId) {
      throw new ForbiddenException('You do not own the recipient character');
    }

    return this.database.playerMail.update({
      where: { id },
      data: { readAt: new Date() },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
        attachedObject: { select: { zoneId: true, id: true, name: true } },
      },
    });
  }

  async deletePlayerMail(id: number) {
    return this.database.playerMail.update({
      where: { id },
      data: { isDeleted: true },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
      },
    });
  }

  async markWealthRetrieved(id: number, characterId: string) {
    return this.database.playerMail.update({
      where: { id },
      data: {
        wealthRetrievedAt: new Date(),
        wealthRetrievedByCharacterId: characterId,
      },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
        wealthRetrievedByCharacter: { select: { id: true, name: true } },
      },
    });
  }

  async markObjectRetrieved(
    id: number,
    characterId: string,
    movedToAccountStorage: boolean
  ) {
    return this.database.playerMail.update({
      where: { id },
      data: {
        objectRetrievedAt: new Date(),
        objectRetrievedByCharacterId: characterId,
        objectMovedToAccountStorage: movedToAccountStorage,
      },
      include: {
        sender: { select: { id: true, name: true } },
        recipient: { select: { id: true, name: true } },
        objectRetrievedByCharacter: { select: { id: true, name: true } },
      },
    });
  }

  // ============================================================================
  // ACCOUNT MAIL (Account-to-Account)
  // ============================================================================

  async findAllAccountMail(
    filter?: AccountMailFilterInput,
    skip?: number,
    take?: number
  ) {
    const where: any = {};

    if (filter) {
      if (filter.senderUserId) {
        where.senderUserId = filter.senderUserId;
      }
      if (filter.recipientUserId) {
        where.recipientUserId = filter.recipientUserId;
      }
      if (filter.searchSubject) {
        where.subject = { contains: filter.searchSubject, mode: 'insensitive' };
      }
      if (filter.searchBody) {
        where.body = { contains: filter.searchBody, mode: 'insensitive' };
      }
      if (!filter.includeBroadcasts) {
        where.isBroadcast = false;
      }
      if (!filter.includeDeleted) {
        where.isDeleted = false;
      }
    } else {
      where.isDeleted = false;
    }

    return this.database.accountMail.findMany({
      where,
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      orderBy: { sentAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, email: true } },
        recipient: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async findMyAccountMail(userId: string, skip?: number, take?: number) {
    // Get mail sent directly to user OR broadcasts
    return this.database.accountMail.findMany({
      where: {
        OR: [{ recipientUserId: userId }, { isBroadcast: true }],
        isDeleted: false,
      },
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
      orderBy: { sentAt: 'desc' },
      include: {
        sender: { select: { id: true, username: true, email: true } },
        recipient: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async countMyAccountMail(userId: string) {
    return this.database.accountMail.count({
      where: {
        OR: [{ recipientUserId: userId }, { isBroadcast: true }],
        isDeleted: false,
      },
    });
  }

  async sendAccountMail(senderUserId: string, data: SendAccountMailInput) {
    // Validate recipient exists
    const recipient = await this.database.users.findUnique({
      where: { id: data.recipientUserId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient account not found');
    }

    return this.database.accountMail.create({
      data: {
        senderUserId,
        recipientUserId: data.recipientUserId,
        subject: data.subject,
        body: data.body,
        isBroadcast: false,
      },
      include: {
        sender: { select: { id: true, username: true, email: true } },
        recipient: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async sendBroadcast(senderUserId: string, data: SendBroadcastInput) {
    // Count total accounts for return value
    const accountCount = await this.database.users.count();

    // Create broadcast mail (no specific recipient)
    await this.database.accountMail.create({
      data: {
        senderUserId,
        recipientUserId: null,
        subject: data.subject,
        body: data.body,
        isBroadcast: true,
      },
    });

    return accountCount;
  }

  async markAccountMailRead(userId: string, id: number) {
    const mail = await this.database.accountMail.findUnique({
      where: { id },
    });

    if (!mail) {
      throw new NotFoundException('Mail not found');
    }

    // User can mark as read if they are the recipient OR if it's a broadcast
    if (mail.recipientUserId !== userId && !mail.isBroadcast) {
      throw new ForbiddenException('You cannot mark this mail as read');
    }

    return this.database.accountMail.update({
      where: { id },
      data: { readAt: new Date() },
      include: {
        sender: { select: { id: true, username: true, email: true } },
        recipient: { select: { id: true, username: true, email: true } },
      },
    });
  }

  async deleteAccountMail(id: number) {
    return this.database.accountMail.update({
      where: { id },
      data: { isDeleted: true },
      include: {
        sender: { select: { id: true, username: true, email: true } },
      },
    });
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Get user's characters for mail composition dropdown
   */
  async getUserCharacters(userId: string) {
    return this.database.characters.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }
}
