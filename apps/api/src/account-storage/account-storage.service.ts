import {
  Injectable,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AccountStorageService {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Get user's account storage (wealth + items)
   */
  async getAccountStorage(userId: string) {
    const user = await this.database.users.findUnique({
      where: { id: userId },
      select: { accountWealth: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const items = await this.database.accountItems.findMany({
      where: { userId },
      orderBy: { slot: 'asc' },
      include: {
        object: { select: { zoneId: true, id: true, name: true, type: true } },
        character: { select: { id: true, name: true } },
      },
    });

    return {
      accountWealth: user.accountWealth,
      items: items.map(item => ({
        id: item.id,
        slot: item.slot,
        objectZoneId: item.objectZoneId,
        objectId: item.objectId,
        quantity: item.quantity,
        customData: item.customData ? JSON.stringify(item.customData) : null,
        storedAt: item.storedAt,
        storedByCharacterId: item.storedByCharacterId,
        object: item.object,
        storedByCharacter: item.character,
      })),
    };
  }

  /**
   * Deposit an item from a character to account storage
   */
  async depositItem(
    userId: string,
    characterId: string,
    objectZoneId: number,
    objectId: number,
    quantity: number = 1
  ) {
    // Validate user owns the character
    const character = await this.database.characters.findFirst({
      where: { id: characterId, userId },
    });

    if (!character) {
      throw new ForbiddenException('You do not own this character');
    }

    // Validate object exists
    const obj = await this.database.objects.findUnique({
      where: { zoneId_id: { zoneId: objectZoneId, id: objectId } },
    });

    if (!obj) {
      throw new NotFoundException('Object not found');
    }

    // Find the next available slot
    const maxSlot = await this.database.accountItems.aggregate({
      where: { userId },
      _max: { slot: true },
    });
    const nextSlot = (maxSlot._max.slot ?? -1) + 1;

    // Create the account item
    const item = await this.database.accountItems.create({
      data: {
        userId,
        slot: nextSlot,
        objectZoneId,
        objectId,
        quantity,
        storedByCharacterId: characterId,
      },
      include: {
        object: { select: { zoneId: true, id: true, name: true, type: true } },
        character: { select: { id: true, name: true } },
      },
    });

    return {
      id: item.id,
      slot: item.slot,
      objectZoneId: item.objectZoneId,
      objectId: item.objectId,
      quantity: item.quantity,
      customData: item.customData ? JSON.stringify(item.customData) : null,
      storedAt: item.storedAt,
      storedByCharacterId: item.storedByCharacterId,
      object: item.object,
      storedByCharacter: item.character,
    };
  }

  /**
   * Withdraw an item from account storage to a character
   */
  async withdrawItem(
    userId: string,
    accountItemId: number,
    characterId: string
  ) {
    // Validate user owns the character
    const character = await this.database.characters.findFirst({
      where: { id: characterId, userId },
    });

    if (!character) {
      throw new ForbiddenException('You do not own this character');
    }

    // Validate the account item exists and belongs to user
    const item = await this.database.accountItems.findFirst({
      where: { id: accountItemId, userId },
    });

    if (!item) {
      throw new NotFoundException('Account item not found');
    }

    // Delete the account item (transfer to character would be handled by game server)
    await this.database.accountItems.delete({
      where: { id: accountItemId },
    });

    return true;
  }

  /**
   * Deposit wealth from a character to account storage
   */
  async depositWealth(userId: string, characterId: string, amount: bigint) {
    if (amount <= 0n) {
      throw new BadRequestException('Amount must be positive');
    }

    // Validate user owns the character
    const character = await this.database.characters.findFirst({
      where: { id: characterId, userId },
    });

    if (!character) {
      throw new ForbiddenException('You do not own this character');
    }

    // Check character has enough wealth
    if (character.wealth < amount) {
      throw new BadRequestException('Character does not have enough wealth');
    }

    // Transfer wealth in a transaction
    const result = await this.database.$transaction(async tx => {
      // Decrease character wealth
      await tx.characters.update({
        where: { id: characterId },
        data: { wealth: { decrement: amount } },
      });

      // Increase account wealth
      const user = await tx.users.update({
        where: { id: userId },
        data: { accountWealth: { increment: amount } },
        select: { accountWealth: true },
      });

      return user.accountWealth;
    });

    return result;
  }

  /**
   * Withdraw wealth from account storage to a character
   */
  async withdrawWealth(userId: string, characterId: string, amount: bigint) {
    if (amount <= 0n) {
      throw new BadRequestException('Amount must be positive');
    }

    // Validate user owns the character
    const character = await this.database.characters.findFirst({
      where: { id: characterId, userId },
    });

    if (!character) {
      throw new ForbiddenException('You do not own this character');
    }

    // Check account has enough wealth
    const user = await this.database.users.findUnique({
      where: { id: userId },
      select: { accountWealth: true },
    });

    if (!user || user.accountWealth < amount) {
      throw new BadRequestException('Account does not have enough wealth');
    }

    // Transfer wealth in a transaction
    const result = await this.database.$transaction(async tx => {
      // Decrease account wealth
      const updatedUser = await tx.users.update({
        where: { id: userId },
        data: { accountWealth: { decrement: amount } },
        select: { accountWealth: true },
      });

      // Increase character wealth
      await tx.characters.update({
        where: { id: characterId },
        data: { wealth: { increment: amount } },
      });

      return updatedUser.accountWealth;
    });

    return result;
  }

  /**
   * Convert copper to display format (platinum, gold, silver, copper)
   */
  wealthToDisplay(totalCopper: bigint) {
    const copper = Number(totalCopper);
    const platinum = Math.floor(copper / 1000);
    const gold = Math.floor((copper % 1000) / 100);
    const silver = Math.floor((copper % 100) / 10);
    const remainingCopper = copper % 10;

    return {
      totalCopper,
      platinum,
      gold,
      silver,
      copper: remainingCopper,
    };
  }
}
