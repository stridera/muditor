import { ForbiddenException } from '@nestjs/common';
import { Race, UserRole, type Characters, type Users } from '@muditor/db';
import { verifyStatRoll } from './stat-roll';
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
      | 'findCharacterById'
      | 'findCharacterItems'
      | 'findCharacterItemById'
      | 'findCharacterItemOwnerId'
      | 'findCharacterEffects'
      | 'getActiveEffects'
      | 'findCharacterEffectById'
      | 'findCharacterEffectOwnerId'
      | 'getCharactersCount'
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
      findCharacterById: jest.fn().mockResolvedValue({ id: 'c1' }),
      findCharacterItems: jest.fn().mockResolvedValue([]),
      findCharacterItemById: jest.fn().mockResolvedValue({ id: 7 }),
      findCharacterItemOwnerId: jest.fn().mockResolvedValue('player-1'),
      findCharacterEffects: jest.fn().mockResolvedValue([]),
      getActiveEffects: jest.fn().mockResolvedValue([]),
      findCharacterEffectById: jest.fn().mockResolvedValue({ id: 3 }),
      findCharacterEffectOwnerId: jest.fn().mockResolvedValue('player-1'),
      getCharactersCount: jest.fn().mockResolvedValue(0),
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

  describe('rollCharacterStats', () => {
    it('issues a roll bound to the caller that only the caller can redeem', () => {
      process.env.JWT_SECRET = 'test-secret-for-stat-rolls';
      const roll = resolver.rollCharacterStats(player);
      expect(roll.values).toHaveLength(7);
      expect(verifyStatRoll(roll.token, player.id)).toEqual(roll.values);
      expect(() => verifyStatRoll(roll.token, immortal.id)).toThrow();
    });
  });

  describe('createCharacter', () => {
    it('tells the service whether the caller is staff (stat-roll enforcement)', async () => {
      const input = { name: 'Newbie', level: 1 } as CreateCharacterInput;
      await resolver.createCharacter(input, player);
      await resolver.createCharacter(input, immortal);
      expect(service.createCharacter).toHaveBeenNthCalledWith(
        1,
        input,
        player.id,
        { isStaff: false }
      );
      expect(service.createCharacter).toHaveBeenNthCalledWith(
        2,
        input,
        immortal.id,
        { isStaff: true }
      );
    });

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

  describe('role escalation via level', () => {
    const implementor = user('impl-1', UserRole.IMPLEMENTOR);

    it('forbids an IMMORTAL creating a level-105 character', async () => {
      await expect(
        resolver.createCharacter(
          { name: 'Rise', level: 105 } as CreateCharacterInput,
          immortal
        )
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(service.createCharacter).not.toHaveBeenCalled();
    });

    it('forbids an IMMORTAL updating a character to level 101', async () => {
      await expect(
        resolver.updateCharacter(
          'c1',
          { level: 101 } as UpdateCharacterInput,
          immortal
        )
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(service.updateCharacter).not.toHaveBeenCalled();
    });

    it('forbids a non-IMPLEMENTOR setting level >= 100 even if the role fits', async () => {
      const coder = user('coder-1', UserRole.CODER);
      await expect(
        resolver.updateCharacter(
          'c1',
          { level: 104 } as UpdateCharacterInput,
          coder
        )
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('allows an IMMORTAL to set a sub-staff level', async () => {
      await resolver.updateCharacter(
        'c1',
        { level: 50 } as UpdateCharacterInput,
        immortal
      );
      expect(service.updateCharacter).toHaveBeenCalled();
    });

    it('allows an IMPLEMENTOR to create and update at level 105', async () => {
      await resolver.createCharacter(
        { name: 'Rise', level: 105 } as CreateCharacterInput,
        implementor
      );
      await resolver.updateCharacter(
        'c1',
        { level: 105 } as UpdateCharacterInput,
        implementor
      );
      expect(service.createCharacter).toHaveBeenCalled();
      expect(service.updateCharacter).toHaveBeenCalled();
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

  describe('character read access', () => {
    it('character: forbids a non-owner PLAYER, allows owner and staff', async () => {
      await expect(
        resolver.findCharacterById('c1', otherPlayer)
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(service.findCharacterById).not.toHaveBeenCalled();
      await expect(resolver.findCharacterById('c1', player)).resolves.toEqual({
        id: 'c1',
      });
      await expect(resolver.findCharacterById('c1', immortal)).resolves.toEqual(
        { id: 'c1' }
      );
    });

    it('characterItems: forbids a non-owner PLAYER, allows owner and staff', async () => {
      await expect(
        resolver.findCharacterItems('c1', otherPlayer)
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(service.findCharacterItems).not.toHaveBeenCalled();
      await resolver.findCharacterItems('c1', player);
      await resolver.findCharacterItems('c1', immortal);
      expect(service.findCharacterItems).toHaveBeenCalledTimes(2);
    });

    it('characterItem: forbids a non-owner PLAYER, allows owner and staff', async () => {
      await expect(
        resolver.findCharacterItemById(7, otherPlayer)
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(service.findCharacterItemById).not.toHaveBeenCalled();
      await resolver.findCharacterItemById(7, player);
      await resolver.findCharacterItemById(7, immortal);
      expect(service.findCharacterItemById).toHaveBeenCalledTimes(2);
    });

    it('characterItem: forbids access to an unlinked character item', async () => {
      service.findCharacterItemOwnerId.mockResolvedValue(null);
      await expect(
        resolver.findCharacterItemById(7, player)
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('characterEffects / activeCharacterEffects / characterEffect: forbid non-owner PLAYER', async () => {
      await expect(
        resolver.findCharacterEffects('c1', otherPlayer)
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        resolver.findActiveCharacterEffects('c1', otherPlayer)
      ).rejects.toBeInstanceOf(ForbiddenException);
      await expect(
        resolver.findCharacterEffectById(3, otherPlayer)
      ).rejects.toBeInstanceOf(ForbiddenException);
      await resolver.findCharacterEffects('c1', player);
      await resolver.findActiveCharacterEffects('c1', immortal);
      await resolver.findCharacterEffectById(3, player);
    });

    it('characters list: non-staff is scoped to own userId, staff sees all', async () => {
      service.findAllCharacters.mockResolvedValue([]);
      await resolver.findAllCharacters(0, 10, undefined, player);
      expect(service.findAllCharacters).toHaveBeenLastCalledWith(
        0,
        10,
        undefined,
        'player-1'
      );
      await resolver.findAllCharacters(0, 10, undefined, immortal);
      expect(service.findAllCharacters).toHaveBeenLastCalledWith(
        0,
        10,
        undefined,
        undefined
      );
    });

    it('charactersCount: non-staff is scoped to own userId, staff sees all', async () => {
      await resolver.getCharactersCount(undefined, player);
      expect(service.getCharactersCount).toHaveBeenLastCalledWith(
        undefined,
        'player-1'
      );
      await resolver.getCharactersCount(undefined, immortal);
      expect(service.getCharactersCount).toHaveBeenLastCalledWith(
        undefined,
        undefined
      );
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
      const rows: Characters[] = await resolver.findAllCharacters(
        undefined,
        undefined,
        undefined,
        player
      );
      // Field resolver output is what GraphQL serialises for `userId`.
      const exposed = rows.map(r => resolver.resolveUserId(r, otherPlayer));
      expect(exposed).toEqual([null, null]);
    });

    it('shows userId to the owner and to IMMORTAL+', () => {
      expect(resolver.resolveUserId(character, player)).toBe('player-1');
      expect(resolver.resolveUserId(character, immortal)).toBe('player-1');
    });
  });
  describe('onlineCharacters account exposure', () => {
    const online = [
      {
        id: 'c-mine',
        name: 'Mine',
        level: 10,
        user: { id: 'player-1', displayName: 'P1', role: 'PLAYER' },
      },
      {
        id: 'c-other',
        name: 'Other',
        level: 50,
        user: { id: 'player-2', displayName: 'P2', role: 'CODER' },
      },
    ];

    it('hides other accounts (id, role) from non-staff but keeps the who-list', async () => {
      service.getOnlineCharacters.mockResolvedValue(online as never);
      const rows = await resolver.getOnlineCharacters(player);
      expect(rows.map(r => r.name)).toEqual(['Mine', 'Other']);
      expect(rows[0]?.user?.id).toBe('player-1');
      expect(rows[1]?.user).toBeNull();
      expect(JSON.stringify(rows)).not.toMatch(/player-2|email|CODER/);
    });

    it('shows account summaries to IMMORTAL+', async () => {
      service.getOnlineCharacters.mockResolvedValue(online as never);
      const rows = await resolver.getOnlineCharacters(immortal);
      expect(rows[1]?.user?.id).toBe('player-2');
    });
  });
});
