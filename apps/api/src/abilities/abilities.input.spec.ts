import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import {
  CreateAbilityInput,
  UpdateAbilityEffectsInput,
  UpdateAbilityInput,
} from './abilities.input';

// Same options as main.ts: whitelisting with forbidNonWhitelisted.
const pipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

const meta = { type: 'body' as const, metatype: UpdateAbilityEffectsInput };

describe('UpdateAbilityEffectsInput validation', () => {
  it('accepts the payload the effect editor sends (Stone Skin)', async () => {
    const payload = {
      effects: [
        {
          effectId: 4,
          order: 0,
          trigger: 'on_cast',
          chancePct: 100,
          condition: null,
          overrideParams: {
            flag: 'resistance',
            type: 'physical',
            amount: 25,
            refresh: false,
            duration: '2',
            durationUnit: 'hours',
          },
        },
      ],
    };
    const out = (await pipe.transform(
      payload,
      meta
    )) as UpdateAbilityEffectsInput;
    expect(out.effects[0]!.overrideParams).toEqual(
      payload.effects[0]!.overrideParams
    );
  });

  it('accepts an empty effects list', async () => {
    await expect(pipe.transform({ effects: [] }, meta)).resolves.toBeDefined();
  });

  it('still rejects unknown properties and bad chance values', async () => {
    await expect(
      pipe.transform({ effects: [], extra: 1 }, meta)
    ).rejects.toThrow();
    await expect(
      pipe.transform(
        { effects: [{ effectId: 1, order: 0, chancePct: 500 }] },
        meta
      )
    ).rejects.toThrow();
  });
});

describe('CreateAbilityInput / UpdateAbilityInput validation', () => {
  const createMeta = { type: 'body' as const, metatype: CreateAbilityInput };
  const updateMeta = { type: 'body' as const, metatype: UpdateAbilityInput };

  it('accepts what the create dialog sends (defaults filled in by GraphQL)', async () => {
    const payload = {
      name: 'zzqa test',
      description: 'scratch',
      abilityType: 'SPELL',
      minPosition: 'STANDING',
      violent: false,
      combatOk: true,
      castTimeRounds: 1,
      cooldownMs: 0,
      inCombatOnly: false,
      isArea: false,
      tags: [],
      memorizationTime: 0,
      questOnly: false,
      humanoidOnly: false,
    };
    const out = (await pipe.transform(
      payload,
      createMeta
    )) as CreateAbilityInput;
    expect(out.name).toBe('zzqa test');
  });

  it('accepts a partial update with nulls that clear fields', async () => {
    await expect(
      pipe.transform(
        { name: 'Stone Skin', description: null, schoolId: null, sphere: null },
        updateMeta
      )
    ).resolves.toBeDefined();
    await expect(pipe.transform({}, updateMeta)).resolves.toBeDefined();
  });

  it('rejects unknown properties and wrong types', async () => {
    await expect(
      pipe.transform({ name: 'x', bogus: 1 }, updateMeta)
    ).rejects.toThrow();
    await expect(
      pipe.transform({ violent: 'yes' }, updateMeta)
    ).rejects.toThrow();
    await expect(
      pipe.transform({ minPosition: 'FLYING_UPSIDE_DOWN' }, updateMeta)
    ).rejects.toThrow();
  });
});
