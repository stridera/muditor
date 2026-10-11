import { Injectable, NotFoundException } from '@nestjs/common';
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
