import type { DatabaseService } from '../database/database.service';
import { AbilitiesService } from './abilities.service';
import type { UpdateAbilityInput } from './abilities.input';

/** In-memory stand-in for the ability delegate (update only). */
function makeDb() {
  const row: Record<string, unknown> = {
    id: 7,
    name: 'Fireball',
    plainName: 'fireball',
    description: 'Burns things',
    abilityType: 'SPELL',
    schoolId: 3,
    violent: true,
    combatOk: false,
    castTimeRounds: 2,
    cooldownMs: 1500,
    inCombatOnly: false,
    isArea: true,
    notes: 'tuned',
    tags: ['fire'],
    sphere: 'FIRE',
    damageType: 'FIRE',
    pages: 4,
    memorizationTime: 9,
    questOnly: true,
    humanoidOnly: true,
  };
  const update = jest.fn(
    async ({ data }: { data: Record<string, unknown> }): Promise<unknown> => {
      Object.assign(row, data);
      return { ...row };
    }
  );
  return {
    db: { ability: { update } } as unknown as DatabaseService,
    row,
    update,
  };
}

describe('AbilitiesService.update (partial update)', () => {
  it('only writes the fields that were provided', async () => {
    const { db, update } = makeDb();
    const service = new AbilitiesService(db);

    await service.update(7, { description: 'Burns many things' });

    const { data } = update.mock.calls[0]![0] as {
      data: Record<string, unknown>;
    };
    expect(data).toEqual({ description: 'Burns many things' });
  });

  it('leaves combatOk, questOnly, humanoidOnly and memorizationTime untouched when omitted', async () => {
    const { db, row } = makeDb();
    const service = new AbilitiesService(db);

    await service.update(7, { name: 'Greater Fireball', cooldownMs: 3000 });

    expect(row).toMatchObject({
      name: 'Greater Fireball',
      plainName: 'greater fireball',
      cooldownMs: 3000,
      combatOk: false,
      questOnly: true,
      humanoidOnly: true,
      memorizationTime: 9,
    });
  });

  it('still writes explicit false and 0 values', async () => {
    const { db, row } = makeDb();
    const service = new AbilitiesService(db);

    await service.update(7, {
      questOnly: false,
      humanoidOnly: false,
      combatOk: true,
      memorizationTime: 0,
    });

    expect(row).toMatchObject({
      questOnly: false,
      humanoidOnly: false,
      combatOk: true,
      memorizationTime: 0,
    });
  });

  it('clears nullable columns only when null is sent explicitly', async () => {
    const { db, row } = makeDb();
    const service = new AbilitiesService(db);

    const input: UpdateAbilityInput = {
      schoolId: null,
      sphere: null,
      damageType: null,
      pages: null,
      notes: null,
      description: null,
    };
    await service.update(7, input);

    expect(row).toMatchObject({
      schoolId: null,
      sphere: null,
      damageType: null,
      pages: null,
      notes: null,
      description: null,
      questOnly: true,
    });
  });
});
