import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ScriptLibrariesService } from './script-libraries.service';
import {
  CreateScriptLibraryInput,
  UpdateScriptLibraryInput,
} from './script-library.dto';

describe('ScriptLibrariesService', () => {
  const prisma = {
    scriptLibrary: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      create: jest.fn(async ({ data }: { data: unknown }) => data),
      update: jest.fn(async ({ data }: { data: unknown }) => data),
      delete: jest.fn().mockResolvedValue({ id: 1 }),
    },
    zones: { findUnique: jest.fn() },
  };
  let service: ScriptLibrariesService;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.scriptLibrary.findFirst.mockResolvedValue({ id: 1, zoneId: 30 });
    prisma.zones.findUnique.mockResolvedValue({ id: 30 });
    service = new ScriptLibrariesService(prisma as never);
  });

  describe('name validation (DTO)', () => {
    const errorsFor = async (name: string) =>
      validate(
        plainToInstance(CreateScriptLibraryInput, { name, code: 'return 1' })
      );

    it.each(['util', 'wand-quest', 'a_b.c/d', '0', 'x'.repeat(64)])(
      'accepts %s',
      async name => {
        expect(await errorsFor(name)).toHaveLength(0);
      }
    );

    it.each(['', 'Util', 'has space', 'semi;colon', 'x'.repeat(65), 'ünï'])(
      'rejects %j',
      async name => {
        expect((await errorsFor(name)).length).toBeGreaterThan(0);
      }
    );

    it('validates the name on update when present', async () => {
      const bad = plainToInstance(UpdateScriptLibraryInput, { name: 'BAD' });
      expect((await validate(bad)).length).toBeGreaterThan(0);
      const none = plainToInstance(UpdateScriptLibraryInput, {});
      expect(await validate(none)).toHaveLength(0);
    });
  });

  describe('create', () => {
    it('stores a valid library with the acting user', async () => {
      const row = await service.create(
        { name: 'util', zoneId: 30, code: 'return {}' },
        'u1'
      );
      expect(row).toMatchObject({
        name: 'util',
        zoneId: 30,
        code: 'return {}',
        createdBy: 'u1',
      });
    });

    it('stores a global library when zoneId is omitted', async () => {
      const row = await service.create({ name: 'util', code: 'return 1' });
      expect(row).toMatchObject({ zoneId: null });
      expect(prisma.zones.findUnique).not.toHaveBeenCalled();
    });

    it('rejects Lua with a syntax error and names the line', async () => {
      await expect(
        service.create({ name: 'bad', code: 'local x = \nreturn function(' })
      ).rejects.toThrow(/syntax error at line/i);
      expect(prisma.scriptLibrary.create).not.toHaveBeenCalled();
    });

    it('rejects an invalid name even when called directly', async () => {
      await expect(
        service.create({ name: 'Bad Name', code: 'return 1' })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects an unknown zone', async () => {
      prisma.zones.findUnique.mockResolvedValue(null);
      await expect(
        service.create({ name: 'u', zoneId: 999, code: 'return 1' })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('maps a duplicate name to a conflict', async () => {
      prisma.scriptLibrary.create.mockRejectedValueOnce(
        Object.assign(new Error('dup'), { code: 'P2002' })
      );
      await expect(
        service.create({ name: 'util', code: 'return 1' })
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update / delete', () => {
    it('updates only the given fields', async () => {
      await service.update(1, { description: 'hi' }, 'u2');
      expect(prisma.scriptLibrary.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { description: 'hi', updatedBy: 'u2' },
      });
    });

    it('clears the zone with null', async () => {
      await service.update(1, { zoneId: null });
      expect(prisma.scriptLibrary.update.mock.calls[0]?.[0]).toMatchObject({
        data: { zoneId: null },
      });
    });

    it('rejects a syntax error on update', async () => {
      await expect(
        service.update(1, { code: 'if then' })
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('404s for a missing library', async () => {
      prisma.scriptLibrary.findFirst.mockResolvedValue(null);
      await expect(service.update(9, {})).rejects.toBeInstanceOf(
        NotFoundException
      );
      await expect(service.delete(9)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('deletes by id', async () => {
      await service.delete(1);
      expect(prisma.scriptLibrary.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('reads', () => {
    it('hides libraries of god zones from non-staff', async () => {
      await service.findAll(true);
      expect(prisma.scriptLibrary.findMany.mock.calls[0]?.[0]).toMatchObject({
        where: { OR: [{ zoneId: null }, { zone: { isGodZone: false } }] },
      });
    });

    it('shows everything to staff', async () => {
      await service.findAll(false);
      expect(prisma.scriptLibrary.findMany.mock.calls[0]?.[0]).toMatchObject({
        where: {},
      });
    });
  });
});
