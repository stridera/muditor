import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { UpdateAbilityEffectsInput } from './abilities.input';

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
