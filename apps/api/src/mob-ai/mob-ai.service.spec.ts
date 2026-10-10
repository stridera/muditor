import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@muditor/db';
import type { DatabaseService } from '../database/database.service';
import { MobAiService } from './mob-ai.service';
import { MobAiTarget } from './mob-ai.dto';

type ClassRule = {
  id: number;
  classId: number;
  abilityId: number;
  priority: number;
  chancePct: number;
  cooldownS: number;
  conditions: unknown;
  target: string;
  minLevel: number | null;
  enabled: boolean;
};
type MobRule = {
  id: number;
  mobZoneId: number;
  mobId: number;
  abilityId: number;
  circle: number;
  known: boolean;
  priority: number;
  chancePct: number;
  cooldownS: number;
  conditions: unknown;
  target: string | null;
};

const ABILITY = { id: 5, name: 'fireball', abilityType: 'SPELL' };

/** In-memory stand-in for the delegates MobAiService uses. */
function makeDb(seed: { cls?: ClassRule[]; mob?: MobRule[] } = {}) {
  const cls = [...(seed.cls ?? [])];
  const mob = [...(seed.mob ?? [])];
  let nextId = 100;
  const withAbility = <T extends { abilityId: number }>(r: T) => ({
    ...r,
    ability: { ...ABILITY, id: r.abilityId },
  });
  // The conditions column stores Prisma.DbNull for "none".
  const col = (v: unknown) => (v === Prisma.DbNull ? null : v);

  const classAiRules = {
    findMany: jest.fn(async ({ where }: { where: { classId: number } }) =>
      cls
        .filter(r => r.classId === where.classId)
        .sort((a, b) => a.priority - b.priority || a.id - b.id)
        .map(withAbility)
    ),
    findUnique: jest.fn(async ({ where }: { where: { id: number } }) => {
      const r = cls.find(x => x.id === where.id);
      return r ? { ...r } : null;
    }),
    aggregate: jest.fn(async ({ where }: { where: { classId: number } }) => ({
      _max: {
        priority: cls
          .filter(r => r.classId === where.classId)
          .reduce<
            number | null
          >((m, r) => (m === null ? r.priority : Math.max(m, r.priority)), null),
      },
    })),
    create: jest.fn(async ({ data }: { data: Omit<ClassRule, 'id'> }) => {
      const r = { id: nextId++, ...data, conditions: col(data.conditions) };
      cls.push(r);
      return withAbility(r);
    }),
    update: jest.fn(
      async ({
        where,
        data,
      }: {
        where: { id: number };
        data: Partial<ClassRule>;
      }) => {
        const r = cls.find(x => x.id === where.id)!;
        Object.assign(r, data);
        if ('conditions' in data) r.conditions = col(data.conditions);
        return withAbility({ ...r });
      }
    ),
    delete: jest.fn(async ({ where }: { where: { id: number } }) => {
      cls.splice(
        cls.findIndex(x => x.id === where.id),
        1
      );
    }),
  };
  const mobAbilities = {
    findMany: jest.fn(
      async ({ where }: { where: { mobZoneId: number; mobId: number } }) =>
        mob
          .filter(
            r => r.mobZoneId === where.mobZoneId && r.mobId === where.mobId
          )
          .sort((a, b) => a.priority - b.priority || a.id - b.id)
          .map(withAbility)
    ),
    findUnique: jest.fn(
      async ({
        where,
      }: {
        where: {
          mobZoneId_mobId_abilityId: {
            mobZoneId: number;
            mobId: number;
            abilityId: number;
          };
        };
      }) => {
        const k = where.mobZoneId_mobId_abilityId;
        const r = mob.find(
          x =>
            x.mobZoneId === k.mobZoneId &&
            x.mobId === k.mobId &&
            x.abilityId === k.abilityId
        );
        return r ? { ...r } : null;
      }
    ),
    aggregate: jest.fn(async () => ({
      _max: { priority: mob.reduce((m, r) => Math.max(m, r.priority), 0) },
    })),
    create: jest.fn(async ({ data }: { data: Partial<MobRule> }) => {
      const r = {
        id: nextId++,
        circle: 1,
        known: true,
        priority: 100,
        chancePct: 100,
        cooldownS: 0,
        conditions: null,
        target: null,
        ...data,
        conditions_: undefined,
      } as unknown as MobRule;
      r.conditions = col(data.conditions);
      mob.push(r);
      return withAbility(r);
    }),
    update: jest.fn(
      async ({
        where,
        data,
      }: {
        where: { id: number };
        data: Partial<MobRule>;
      }) => {
        const r = mob.find(x => x.id === where.id)!;
        Object.assign(r, data);
        if ('conditions' in data) r.conditions = col(data.conditions);
        return withAbility({ ...r });
      }
    ),
    updateMany: jest.fn(
      async ({
        where,
        data,
      }: {
        where: { mobZoneId: number; mobId: number; abilityId: number };
        data: Partial<MobRule>;
      }) => {
        const hit = mob.filter(
          r =>
            r.mobZoneId === where.mobZoneId &&
            r.mobId === where.mobId &&
            r.abilityId === where.abilityId
        );
        hit.forEach(r => Object.assign(r, data));
        return { count: hit.length };
      }
    ),
    deleteMany: jest.fn(
      async ({
        where,
      }: {
        where: { mobZoneId: number; mobId: number; abilityId: number };
      }) => {
        const before = mob.length;
        for (let i = mob.length - 1; i >= 0; i--) {
          const r = mob[i]!;
          if (
            r.mobZoneId === where.mobZoneId &&
            r.mobId === where.mobId &&
            r.abilityId === where.abilityId
          ) {
            mob.splice(i, 1);
          }
        }
        return { count: before - mob.length };
      }
    ),
  };
  const tx = { classAiRules, mobAbilities };
  const db = {
    classAiRules,
    mobAbilities,
    ability: {
      findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
        where.id === 999 ? null : { id: where.id }
      ),
    },
    characterClass: {
      findUnique: jest.fn(async ({ where }: { where: { id: number } }) =>
        where.id === 404 ? null : { id: where.id }
      ),
    },
    mobs: {
      findUnique: jest.fn(
        async ({ where }: { where: { zoneId_id: { id: number } } }) =>
          where.zoneId_id.id === 404 ? null : { id: where.zoneId_id.id }
      ),
    },
    $transaction: jest.fn(async (fn: (t: typeof tx) => Promise<unknown>) =>
      fn(tx)
    ),
  };
  return { db: db as unknown as DatabaseService, cls, mob, raw: db };
}

const classRule = (over: Partial<ClassRule> = {}): ClassRule => ({
  id: 1,
  classId: 3,
  abilityId: 5,
  priority: 10,
  chancePct: 100,
  cooldownS: 0,
  conditions: null,
  target: 'AUTO',
  minLevel: null,
  enabled: true,
  ...over,
});

const mobRule = (over: Partial<MobRule> = {}): MobRule => ({
  id: 1,
  mobZoneId: 30,
  mobId: 1,
  abilityId: 5,
  circle: 1,
  known: true,
  priority: 10,
  chancePct: 100,
  cooldownS: 0,
  conditions: null,
  target: null,
  ...over,
});

const createInput = (over: Record<string, unknown> = {}) => ({
  classId: 3,
  abilityId: 5,
  chancePct: 100,
  cooldownS: 0,
  target: MobAiTarget.AUTO,
  enabled: true,
  ...over,
});

describe('MobAiService class rules', () => {
  it('appends after the last priority when none is given', async () => {
    const { db } = makeDb({ cls: [classRule({ priority: 40 })] });
    const created = await new MobAiService(db).createClassRule(
      createInput({ abilityId: 6 })
    );
    expect(created.priority).toBe(50);
  });

  it('stores validated conditions, normalised target, and SQL NULL for none', async () => {
    const { db, cls } = makeDb();
    const svc = new MobAiService(db);
    await svc.createClassRule(
      createInput({
        priority: 10,
        target: MobAiTarget.WEAKEST_ATTACKER,
        conditions: { in_combat: true, self_hp_below: 40 },
      })
    );
    await svc.createClassRule(createInput({ priority: 20, conditions: null }));
    expect(cls[0]!.conditions).toEqual({ in_combat: true, self_hp_below: 40 });
    expect(cls[0]!.target).toBe('WEAKEST_ATTACKER');
    expect(cls[1]!.conditions).toBeNull();
  });

  it.each([
    [{ priority: -1 }, /priority/],
    [{ priority: 10_000 }, /priority/],
    [{ chancePct: 101 }, /chancePct/],
    [{ chancePct: -5 }, /chancePct/],
    [{ cooldownS: -1 }, /cooldownS/],
    [{ cooldownS: 86_401 }, /cooldownS/],
    [{ minLevel: 0 }, /minLevel/],
    [{ conditions: { bogus: true } }, /Unknown condition key/],
    [{ conditions: { self_hp_below: 500 } }, /self_hp_below/],
    [{ target: 'NOBODY' }, /Unknown target/],
    [{ abilityId: 999 }, /Ability 999 does not exist/],
    [{ classId: 404 }, /Class 404 does not exist/],
  ])('rejects create with %j', async (over, message) => {
    const { db } = makeDb();
    await expect(
      new MobAiService(db).createClassRule(
        createInput(over as Record<string, unknown>)
      )
    ).rejects.toThrow(message);
  });

  it('keeps unknown condition keys already stored when merged client-side', async () => {
    const { db, cls } = makeDb({
      cls: [classRule({ conditions: { self_hp_below: 50, phase: 'two' } })],
    });
    const svc = new MobAiService(db);
    // The editor merges its edit into the stored object and sends it all back.
    await svc.updateClassRule(1, {
      conditions: { self_hp_below: 30, phase: 'two' },
    });
    expect(cls[0]!.conditions).toEqual({ self_hp_below: 30, phase: 'two' });
  });

  it('rejects an unknown key the rule did not already have', async () => {
    const { db } = makeDb({
      cls: [classRule({ conditions: { in_combat: true } })],
    });
    await expect(
      new MobAiService(db).updateClassRule(1, {
        conditions: { in_combat: true, phase: 'two' },
      })
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('partial update leaves other fields alone and null clears conditions', async () => {
    const { db, cls } = makeDb({
      cls: [classRule({ conditions: { in_combat: true }, minLevel: 20 })],
    });
    const svc = new MobAiService(db);
    await svc.updateClassRule(1, { chancePct: 25 });
    expect(cls[0]).toMatchObject({
      chancePct: 25,
      conditions: { in_combat: true },
      minLevel: 20,
    });
    await svc.updateClassRule(1, { conditions: null, minLevel: null });
    expect(cls[0]).toMatchObject({ conditions: null, minLevel: null });
  });

  it('maps a unique-index violation to a clear error', async () => {
    const { db, raw } = makeDb({ cls: [classRule()] });
    raw.classAiRules.update.mockRejectedValueOnce(
      Object.assign(new Error('dup'), { code: 'P2002' })
    );
    await expect(
      new MobAiService(db).updateClassRule(1, { priority: 20 })
    ).rejects.toThrow(/already has a rule for ability 5 at priority 20/);
  });

  it('names the new ability in the unique-index error when it changes', async () => {
    const { db, raw } = makeDb({ cls: [classRule()] });
    raw.classAiRules.update.mockRejectedValueOnce(
      Object.assign(new Error('dup'), { code: 'P2002' })
    );
    await expect(
      new MobAiService(db).updateClassRule(1, { abilityId: 8 })
    ).rejects.toThrow(/ability 8 at priority 10/);
  });

  it('returns lowercase seeded targets as canonical enum names', async () => {
    const { db } = makeDb({
      cls: [classRule({ target: 'weakest_attacker' })],
    });
    const out = await new MobAiService(db).listClassRules(3);
    expect(out[0]?.target).toBe('WEAKEST_ATTACKER');
  });

  it('404s for a missing rule', async () => {
    const { db } = makeDb();
    const svc = new MobAiService(db);
    await expect(svc.updateClassRule(9, {})).rejects.toBeInstanceOf(
      NotFoundException
    );
    await expect(svc.deleteClassRule(9)).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('reorder renumbers 10, 20, 30 via negative parking priorities', async () => {
    const { db, cls, raw } = makeDb({
      cls: [
        classRule({ id: 1, priority: 10 }),
        classRule({ id: 2, priority: 20 }),
        classRule({ id: 3, priority: 30 }),
      ],
    });
    const out = await new MobAiService(db).reorderClassRules(3, [3, 1, 2]);
    expect(out.map(r => r.id)).toEqual([3, 1, 2]);
    expect(cls.map(r => [r.id, r.priority])).toEqual([
      [1, 20],
      [2, 30],
      [3, 10],
    ]);
    const parked = raw.classAiRules.update.mock.calls
      .map(c => c[0].data.priority as number)
      .filter(p => p < 0);
    expect(parked).toHaveLength(3);
  });

  it('reorder rejects a list that is not a permutation of the rules', async () => {
    const { db } = makeDb({
      cls: [classRule({ id: 1 }), classRule({ id: 2, priority: 20 })],
    });
    const svc = new MobAiService(db);
    await expect(svc.reorderClassRules(3, [1])).rejects.toThrow(/every/);
    await expect(svc.reorderClassRules(3, [1, 1])).rejects.toThrow(/every/);
    await expect(svc.reorderClassRules(3, [1, 7])).rejects.toThrow(/every/);
  });
});

describe('MobAiService mob rules', () => {
  it('lists with enabled mapped from known', async () => {
    const { db } = makeDb({ mob: [mobRule({ known: false })] });
    const rules = await new MobAiService(db).listMobRules(30, 1);
    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatchObject({ enabled: false, abilityId: 5 });
    expect(rules[0]).not.toHaveProperty('known');
  });

  it('creates a rule after the last priority; AUTO stores NULL', async () => {
    const { db, mob } = makeDb({ mob: [mobRule({ priority: 30 })] });
    const out = await new MobAiService(db).saveMobRule(30, 1, {
      abilityId: 6,
      target: MobAiTarget.AUTO,
      conditions: { in_combat: true },
    });
    expect(out.priority).toBe(40);
    expect(mob[1]).toMatchObject({
      abilityId: 6,
      target: null,
      conditions: { in_combat: true },
    });
  });

  it('updates an existing rule in place and preserves its unknown keys', async () => {
    const { db, mob } = makeDb({
      mob: [mobRule({ conditions: { in_combat: true, phase: 2 } })],
    });
    const svc = new MobAiService(db);
    await svc.saveMobRule(30, 1, {
      abilityId: 5,
      conditions: { in_combat: true, self_hp_below: 25, phase: 2 },
      enabled: false,
    });
    expect(mob).toHaveLength(1);
    expect(mob[0]).toMatchObject({
      known: false,
      priority: 10,
      conditions: { in_combat: true, self_hp_below: 25, phase: 2 },
    });
    await expect(
      svc.saveMobRule(30, 1, { abilityId: 5, conditions: { new_key: 1 } })
    ).rejects.toThrow(/Unknown condition key/);
  });

  it('validates ranges, ability and mob existence', async () => {
    const { db } = makeDb();
    const svc = new MobAiService(db);
    await expect(
      svc.saveMobRule(30, 1, { abilityId: 5, chancePct: 150 })
    ).rejects.toThrow(/chancePct/);
    await expect(
      svc.saveMobRule(30, 1, { abilityId: 5, cooldownS: -2 })
    ).rejects.toThrow(/cooldownS/);
    await expect(svc.saveMobRule(30, 1, { abilityId: 999 })).rejects.toThrow(
      /Ability 999/
    );
    await expect(
      svc.saveMobRule(30, 404, { abilityId: 5 })
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes by ability and 404s when absent', async () => {
    const { db, mob } = makeDb({ mob: [mobRule()] });
    const svc = new MobAiService(db);
    await svc.deleteMobRule(30, 1, 5);
    expect(mob).toHaveLength(0);
    await expect(svc.deleteMobRule(30, 1, 5)).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('reorders by ability id', async () => {
    const { db } = makeDb({
      mob: [
        mobRule({ id: 1, abilityId: 5, priority: 10 }),
        mobRule({ id: 2, abilityId: 6, priority: 20 }),
      ],
    });
    const svc = new MobAiService(db);
    const out = await svc.reorderMobRules(30, 1, [6, 5]);
    expect(out.map(r => [r.abilityId, r.priority])).toEqual([
      [6, 10],
      [5, 20],
    ]);
    await expect(svc.reorderMobRules(30, 1, [6])).rejects.toThrow(/every/);
  });
});
