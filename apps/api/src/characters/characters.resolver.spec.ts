import { ForbiddenException } from '@nestjs/common';
import { Race, UserRole, type Characters, type Users } from '@muditor/db';
import { CharactersResolver } from './characters.resolver';
import type { CharactersService } from './characters.service';
import type {
  CreateCharacterInput,
  UpdateCharacterInput,
} from './character.input';

const user = (id: string, role: UserRole): Users =>
  ({ id, role, displayName: id }) as unknown as Users;

const player = user('player-1', UserRole.PLAYER);
const otherPlayer = user('player-2', UserRole.PLAYER);
const immortal = user('imm-1', UserRole.IMMORTAL);

describe('CharactersResolver authorization', () => {
  let service: jest.Mocked<
    Pick<
      CharactersService,
      | 'findCharacterOwnerId'
      | 'updateCharacter'
      | 'deleteCharacter'
      | 'findAllCharacters'
      | 'createCharacter'
      | 'createCharacterItem'
      | 'removeExpiredEffects'
      | 'getOnlineCharacters'
    >
  >;
  let resolver: CharactersResolver;

  beforeEach(() => {
    service = {
      findCharacterOwnerId: jest.fn().mockResolvedValue('player-1'),
      updateCharacter: jest.fn().mockResolvedValue({ id: 'c1' }),
      deleteCharacter: jest.fn().mockResolvedValue({ id: 'c1' }),
      findAllCharacters: jest.fn(),
      createCharacter: jest.fn().mockResolvedValue({ id: 'c1' }),
      createCharacterItem: jest.fn(),
      removeExpiredEffects: jest.fn().mockResolvedValue({ count: 0 }),
      getOnlineCharacters: jest.fn().mockResolvedValue([]),
    };
    resolver = new CharactersResolver(service as unknown as CharactersService);
  });

  describe('updateCharacter', () => {
    it("forbids a PLAYER updating someone else's character", async () => {
      await expect(
        resolver.updateCharacter(
          'c1',
          { title: 'hax' } as UpdateCharacterInput,
          otherPlayer
        )
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(service.updateCharacter).not.toHaveBeenCalled();
    });

    it.each([
      ['level', { level: 105 }],
      ['privilegeFlags', { privilegeFlags: ['GOD'] }],
      ['invisLevel', { invisLevel: 100 }],
      ['playerFlags', { playerFlags: ['NOHASSLE'] }],
      ['strength', { strength: 25 }],
      ['race', { race: Race.DRAGON_FIRE }],
      ['classId', { classId: 3 }],
      ['hitPointsMax', { hitPointsMax: 99999 }],
    ])(
      'forbids a PLAYER setting own privileged field %s',
      async (_name, data) => {
        await expect(
          resolver.updateCharacter('c1', data as UpdateCharacterInput, player)
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(service.updateCharacter).not.toHaveBeenCalled();
      }
    );

    it('allows a PLAYER to edit cosmetic fields on their own character', async () => {
      const data = { title: 'the Brave', description: 'Tall' };
      await resolver.updateCharacter(
        'c1',
        data as UpdateCharacterInput,
        player
      );
      expect(service.updateCharacter).toHaveBeenCalledWith('c1', data, {
        isStaff: false,
      });
    });

    it('allows IMMORTAL+ to change level on any character', async () => {
      await resolver.updateCharacter(
        'c1',
        { level: 50 } as UpdateCharacterInput,
        immortal
      );
      expect(service.updateCharacter).toHaveBeenCalledWith(
        'c1',
        { level: 50 },
        { isStaff: true }
      );
      // staff bypass does not need an ownership lookup
      expect(service.findCharacterOwnerId).not.toHaveBeenCalled();
    });
  });

  describe('updateCharacter race/class', () => {
    it('allows IMMORTAL+ to change race and classId', async () => {
      await resolver.updateCharacter(
        'c1',
        { race: Race.ELF, classId: 3 } as UpdateCharacterInput,
        immortal
      );
      expect(service.updateCharacter).toHaveBeenCalledWith(
        'c1',
        { race: Race.ELF, classId: 3 },
        { isStaff: true }
      );
    });
  });

  describe('deleteCharacter', () => {
    it("forbids deleting someone else's character", async () => {
      await expect(
        resolver.deleteCharacter('c1', otherPlayer)
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(service.deleteCharacter).not.toHaveBeenCalled();
    });

    it('allows the owner and staff', async () => {
      await resolver.deleteCharacter('c1', player);
      await resolver.deleteCharacter('c1', immortal);
      expect(service.deleteCharacter).toHaveBeenCalledTimes(2);
    });
  });

  describe('createCharacter', () => {
    it('forbids a PLAYER creating a character above level 1', async () => {
      await expect(
        resolver.createCharacter(
          { name: 'Cheat', level: 105 } as CreateCharacterInput,
          player
        )
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(service.createCharacter).not.toHaveBeenCalled();
    });
  });

  describe('item / effect mutations', () => {
    it('forbids PLAYER from minting items, even on their own character', () => {
      expect(() =>
        resolver.createCharacterItem(
          { characterId: 'c1', objectZoneId: 1, objectId: 1 } as never,
          player
        )
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('forbids PLAYER from sweeping expired effects across all characters', async () => {
      await expect(
        resolver.removeExpiredEffects(undefined, player)
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('online characters', () => {
    it("forbids a PLAYER listing another user's online characters", async () => {
      await expect(
        resolver.getOnlineCharacters(player, 'someone-else')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('userId exposure', () => {
    const character = { id: 'c1', userId: 'player-1' } as unknown as Characters;
    const otherRow = { id: 'c2', userId: 'player-9' } as unknown as Characters;

    it('hides userId on the characters query result for a PLAYER', async () => {
      service.findAllCharacters.mockResolvedValue([
        character,
        otherRow,
      ] as never);
      const rows: Characters[] = await resolver.findAllCharacters();
      // Field resolver output is what GraphQL serialises for `userId`.
      const exposed = rows.map(r => resolver.resolveUserId(r, otherPlayer));
      expect(exposed).toEqual([null, null]);
    });

    it('shows userId to the owner and to IMMORTAL+', () => {
      expect(resolver.resolveUserId(character, player)).toBe('player-1');
      expect(resolver.resolveUserId(character, immortal)).toBe('player-1');
    });
  });
});
