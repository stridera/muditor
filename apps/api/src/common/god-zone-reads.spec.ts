import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { UserRole } from '@muditor/db';
import { GraphQLJwtAuthGuard } from '../auth/guards/graphql-jwt-auth.guard';
import { MinimumRoleGuard } from '../auth/guards/minimum-role.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { MobResetResolver } from '../mobs/mob-reset.resolver';
import { MobsResolver } from '../mobs/mobs.resolver';
import { ObjectResetResolver } from '../objects/object-reset.resolver';
import { ObjectsResolver } from '../objects/objects.resolver';
import { DialogueTreeResolver } from '../quests/dialogue-tree.resolver';
import { QuestsResolver } from '../quests/quests.resolver';
import { ShopsResolver } from '../shops/shops.resolver';
import { TriggersResolver } from '../triggers/triggers.resolver';
import { MAX_PAGE_SIZE } from './pagination';

const anon = null;
const player = { id: 'p', role: UserRole.PLAYER } as never;
const immortal = { id: 'i', role: UserRole.IMMORTAL } as never;

const guardsOf = (resolver: object, method: string): unknown[] =>
  Reflect.getMetadata(
    GUARDS_METADATA,
    (resolver as { prototype: Record<string, object> }).prototype[method]!
  ) ?? [];

describe('public reads use OptionalJwtAuthGuard', () => {
  it.each([
    [TriggersResolver, 'findAll'],
    [TriggersResolver, 'findByZone'],
    [TriggersResolver, 'findNeedingReview'],
    [TriggersResolver, 'countNeedingReview'],
    [TriggersResolver, 'findOne'],
    [TriggersResolver, 'findByAttachment'],
    [MobResetResolver, 'findByMob'],
    [MobResetResolver, 'findOne'],
    [ObjectResetResolver, 'findByRoom'],
    [ObjectResetResolver, 'findByZone'],
    [ObjectResetResolver, 'findOne'],
    [DialogueTreeResolver, 'findDialogueTree'],
    [QuestsResolver, 'findAllQuests'],
    [QuestsResolver, 'findQuestsByZone'],
    [QuestsResolver, 'findOneQuest'],
    [QuestsResolver, 'countQuests'],
    [ShopsResolver, 'findAll'],
    [ShopsResolver, 'findOne'],
    [ShopsResolver, 'findByZone'],
    [ShopsResolver, 'findByKeeper'],
    [ShopsResolver, 'count'],
  ])('%p.%s', (resolver, method) => {
    expect(guardsOf(resolver, method)).toContain(OptionalJwtAuthGuard);
  });

  it('mobCombatDefaults requires login and BUILDER+', () => {
    const guards = guardsOf(MobsResolver, 'getMobCombatDefaults');
    expect(guards).toContain(GraphQLJwtAuthGuard);
    expect(guards).toContain(MinimumRoleGuard);
  });
});

describe('god-zone hiding is requested for anonymous and mortal callers only', () => {
  it('triggers', async () => {
    const svc = {
      findAll: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({}),
      countNeedingReview: jest.fn().mockResolvedValue(0),
    };
    const r = new TriggersResolver(svc as never);
    await r.findAll(anon);
    await r.findAll(player);
    await r.findAll(immortal);
    expect(svc.findAll.mock.calls.map(c => c[0])).toEqual([true, true, false]);
    await r.findOne(30, 1, anon);
    expect(svc.findOne).toHaveBeenLastCalledWith(30, 1, true);
    await r.countNeedingReview(immortal);
    expect(svc.countNeedingReview).toHaveBeenLastCalledWith(false);
  });

  it('shops filter by zone visibility', async () => {
    const svc = {
      findAll: jest.fn().mockResolvedValue([]),
      findByZone: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    };
    const r = new ShopsResolver(svc as never);
    await r.findAll(undefined, undefined, anon);
    expect(svc.findAll).toHaveBeenLastCalledWith({
      where: { zones: { isGodZone: false } },
      take: MAX_PAGE_SIZE,
    });
    await r.findAll(undefined, undefined, immortal);
    expect(svc.findAll).toHaveBeenLastCalledWith({
      where: {},
      take: MAX_PAGE_SIZE,
    });
    await r.findByZone(7, player);
    expect(svc.findByZone).toHaveBeenLastCalledWith(7, true);
    await r.count(immortal);
    expect(svc.count).toHaveBeenLastCalledWith({});
  });

  it('quests', async () => {
    const svc = {
      findAllQuests: jest.fn().mockResolvedValue([]),
      findOneQuest: jest.fn().mockResolvedValue(null),
      countQuests: jest.fn().mockResolvedValue(0),
    };
    const r = new QuestsResolver(svc as never);
    await r.findAllQuests(undefined, undefined, undefined, anon);
    expect(svc.findAllQuests).toHaveBeenLastCalledWith({
      where: { zones: { isGodZone: false } },
      take: MAX_PAGE_SIZE,
    });
    await r.findOneQuest(30, 1, player);
    expect(svc.findOneQuest).toHaveBeenLastCalledWith(30, 1, true);
    await r.countQuests(30, immortal);
    expect(svc.countQuests).toHaveBeenLastCalledWith({ zoneId: 30 });
  });

  it('resets', async () => {
    const mob = {
      findByMob: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
    };
    const obj = {
      findByRoom: jest.fn().mockResolvedValue([]),
      findByZone: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
    };
    await new MobResetResolver(mob as never).findByMob(30, 1, anon);
    expect(mob.findByMob).toHaveBeenLastCalledWith(30, 1, true);
    await new MobResetResolver(mob as never).findOne(1, immortal);
    expect(mob.findOne).toHaveBeenLastCalledWith(1, false);
    await new ObjectResetResolver(obj as never).findByZone(30, anon);
    expect(obj.findByZone).toHaveBeenLastCalledWith(30, true);
    await new ObjectResetResolver(obj as never).findByRoom(30, 1, immortal);
    expect(obj.findByRoom).toHaveBeenLastCalledWith(30, 1, false);
  });

  it('dialogue trees in god zones (or unused) are hidden from the public', async () => {
    const svc = {
      isTreeInVisibleZone: jest.fn().mockResolvedValue(false),
      findTree: jest.fn().mockResolvedValue({ id: 1 }),
    };
    const r = new DialogueTreeResolver(svc as never);
    expect(await r.findDialogueTree(1, anon)).toBeNull();
    expect(await r.findDialogueTree(1, immortal)).toEqual({ id: 1 });
    svc.isTreeInVisibleZone.mockResolvedValue(true);
    expect(await r.findDialogueTree(1, anon)).toEqual({ id: 1 });
  });
});

describe('paged mob/object lists keep god-zone hiding and clamp page size', () => {
  it('mobs: filters + count carry hideGodZones; take is clamped', async () => {
    const svc = {
      findAll: jest.fn().mockResolvedValue([]),
      countFiltered: jest.fn().mockResolvedValue(0),
    };
    const r = new MobsResolver(svc as never);
    await r.findAll(0, 999999, ' guard ', anon, 30, 1, 9, 'name', 'desc');
    expect(svc.findAll).toHaveBeenLastCalledWith({
      hideGodZones: true,
      zoneId: 30,
      search: 'guard',
      levelMin: 1,
      levelMax: 9,
      sortBy: 'name',
      sortDir: 'desc',
      skip: 0,
      take: MAX_PAGE_SIZE,
    });
    await r.findAll(undefined, 50, undefined, immortal);
    expect(svc.findAll.mock.calls.at(-1)![0]).toMatchObject({
      hideGodZones: false,
      take: 50,
    });
    await r.count(player, 30, 'guard', 1, 9);
    expect(svc.countFiltered).toHaveBeenLastCalledWith({
      hideGodZones: true,
      zoneId: 30,
      search: 'guard',
      levelMin: 1,
      levelMax: 9,
    });
    await r.count(immortal);
    expect(svc.countFiltered.mock.calls.at(-1)![0].hideGodZones).toBe(false);
  });

  it('objects: filters + count carry hideGodZones; take is clamped', async () => {
    const svc = {
      findAll: jest.fn().mockResolvedValue([]),
      countFiltered: jest.fn().mockResolvedValue(0),
    };
    const r = new ObjectsResolver(svc as never);
    await r.findAll(10, 999999, anon, 'sword', 30);
    expect(svc.findAll.mock.calls.at(-1)![0]).toMatchObject({
      hideGodZones: true,
      zoneId: 30,
      search: 'sword',
      skip: 10,
      take: MAX_PAGE_SIZE,
    });
    await r.findAll(undefined, undefined, immortal);
    expect(svc.findAll.mock.calls.at(-1)![0].hideGodZones).toBe(false);
    await r.count(player, 'sword', 30);
    expect(svc.countFiltered).toHaveBeenLastCalledWith(
      expect.objectContaining({ hideGodZones: true, zoneId: 30 })
    );
  });
});
