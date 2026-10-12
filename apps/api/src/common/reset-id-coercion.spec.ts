import 'reflect-metadata';
import {
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { MobResetResolver } from '../mobs/mob-reset.resolver';
import { MobResetService } from '../mobs/mob-reset.service';
import { ObjectResetResolver } from '../objects/object-reset.resolver';
import { ObjectResetService } from '../objects/object-reset.service';

// GqlParamtype.ARGS (not exported from the package root).
const GQL_ARGS_PARAMTYPE = 3;

type ArgMeta = { index: number; data?: string; pipes: unknown[] };

/** Every `@Args('<x>', { type: () => ID })` of a resolver, with its pipes. */
function argMeta(resolver: { prototype: object }, method: string): ArgMeta[] {
  const raw = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    resolver.prototype.constructor,
    method
  ) as Record<string, { index: number; data?: string; pipes: unknown[] }>;
  return Object.entries(raw)
    .filter(([key]) => key.startsWith(`${GQL_ARGS_PARAMTYPE}:`))
    .map(([, v]) => v);
}

// Args that arrive as GraphQL `ID` (a string on the wire) and hit Int columns.
const MOB_ID_ARGS: Record<string, string[]> = {
  findOne: ['id'],
  updateMobReset: ['id'],
  deleteMobReset: ['id'],
  deleteMobResetEquipment: ['id'],
  addMobResetEquipment: ['resetId'],
  updateMobResetEquipment: ['id'],
  addMobResetEquipmentContent: ['equipmentId'],
  updateMobResetEquipmentContent: ['id'],
  deleteMobResetEquipmentContent: ['id'],
};
const OBJECT_ID_ARGS: Record<string, string[]> = {
  findOne: ['id'],
  updateObjectReset: ['id'],
  deleteObjectReset: ['id'],
  addObjectResetContent: ['resetId'],
  updateObjectResetContent: ['id'],
  deleteObjectResetContent: ['id'],
};

function expectParseInt(
  resolver: { prototype: object },
  table: Record<string, string[]>
) {
  for (const [method, names] of Object.entries(table)) {
    const metas = argMeta(resolver, method);
    for (const name of names) {
      const meta = metas.find(m => m.data === name);
      expect({ method, name, found: !!meta }).toEqual({
        method,
        name,
        found: true,
      });
      expect({
        method,
        name,
        pipes: meta!.pipes.some(p => p === ParseIntPipe),
      }).toEqual({ method, name, pipes: true });
    }
  }
}

describe('reset resolvers coerce ID args to integers', () => {
  it('MobResetResolver runs ParseIntPipe on every ID arg', () => {
    expectParseInt(MobResetResolver, MOB_ID_ARGS);
  });

  it('ObjectResetResolver runs ParseIntPipe on every ID arg', () => {
    expectParseInt(ObjectResetResolver, OBJECT_ID_ARGS);
  });

  it('ParseIntPipe turns the wire string into the number Prisma needs', async () => {
    const pipe = new ParseIntPipe();
    const meta = { type: 'custom' as const };
    await expect(pipe.transform('5', meta)).resolves.toBe(5);
    await expect(pipe.transform('abc', meta)).rejects.toBeInstanceOf(
      BadRequestException
    );
    await expect(pipe.transform('1.5', meta)).rejects.toBeInstanceOf(
      BadRequestException
    );
  });
});

describe('content update/delete surface real errors', () => {
  const p2025 = Object.assign(new Error('not found'), { code: 'P2025' });
  const boom = new Error('connection lost');

  function objectService(err: unknown) {
    const prisma = {
      objectResetContents: {
        update: jest.fn().mockRejectedValue(err),
        delete: jest.fn().mockRejectedValue(err),
      },
    };
    return new ObjectResetService(prisma as never);
  }
  function mobService(err: unknown) {
    const prisma = {
      mobResetEquipmentContents: {
        update: jest.fn().mockRejectedValue(err),
        delete: jest.fn().mockRejectedValue(err),
      },
    };
    return new MobResetService(prisma as never);
  }

  it.each([
    ['object delete', (e: unknown) => objectService(e).deleteContent(1)],
    ['object update', (e: unknown) => objectService(e).updateContent(1, {})],
    ['mob delete', (e: unknown) => mobService(e).deleteEquipmentContent(1)],
    ['mob update', (e: unknown) => mobService(e).updateEquipmentContent(1, {})],
  ])('%s: missing row is a NotFoundException', async (_n, run) => {
    await expect(run(p2025)).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([
    ['object delete', (e: unknown) => objectService(e).deleteContent(1)],
    ['object update', (e: unknown) => objectService(e).updateContent(1, {})],
    ['mob delete', (e: unknown) => mobService(e).deleteEquipmentContent(1)],
    ['mob update', (e: unknown) => mobService(e).updateEquipmentContent(1, {})],
  ])('%s: other errors are rethrown, not swallowed', async (_n, run) => {
    await expect(run(boom)).rejects.toBe(boom);
  });
});
