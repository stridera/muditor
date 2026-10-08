import { ForbiddenException } from '@nestjs/common';
import { UserRole, type Users } from '@muditor/db';
import { QuestsResolver } from './quests.resolver';
import type { QuestsService } from './quests.service';

const user = (id: string, role: UserRole): Users =>
  ({ id, role }) as unknown as Users;

const owner = user('player-1', UserRole.PLAYER);
const other = user('player-2', UserRole.PLAYER);
const immortal = user('imm-1', UserRole.IMMORTAL);

describe('QuestsResolver character-scoped reads', () => {
  let service: jest.Mocked<
    Pick<
      QuestsService,
      'findCharacterOwnerId' | 'findCharacterQuests' | 'getAvailableQuests'
    >
  >;
  let resolver: QuestsResolver;

  beforeEach(() => {
    service = {
      findCharacterOwnerId: jest.fn().mockResolvedValue('player-1'),
      findCharacterQuests: jest.fn().mockResolvedValue([]),
      getAvailableQuests: jest.fn().mockResolvedValue([]),
    };
    resolver = new QuestsResolver(service as unknown as QuestsService);
  });

  it('characterQuests: forbids non-owner PLAYER, allows owner and staff', async () => {
    await expect(
      resolver.findCharacterQuests('c1', other)
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(service.findCharacterQuests).not.toHaveBeenCalled();
    await resolver.findCharacterQuests('c1', owner);
    await resolver.findCharacterQuests('c1', immortal);
    expect(service.findCharacterQuests).toHaveBeenCalledTimes(2);
  });

  it('availableQuests: forbids non-owner PLAYER, allows owner and staff', async () => {
    await expect(
      resolver.getAvailableQuests('c1', 5, other)
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(service.getAvailableQuests).not.toHaveBeenCalled();
    await resolver.getAvailableQuests('c1', 5, owner);
    await resolver.getAvailableQuests('c1', 5, immortal);
    expect(service.getAvailableQuests).toHaveBeenCalledTimes(2);
  });
});
