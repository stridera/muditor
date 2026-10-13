import { validateEffectList } from '../effectValidation';
import type { AbilityEffectOutput } from '../generators/json-generator';

const catalog = [
  {
    id: 1,
    name: 'damage',
    defaultParams: { type: 'physical', amount: '1d6', scaling: 'level' },
  },
  {
    id: 2,
    name: 'modify',
    defaultParams: {
      amount: 4,
      target: 'str',
      duration: 'level',
      durationUnit: 'hours',
    },
  },
  { id: 3, name: 'heal', defaultParams: { amount: '1d8', resource: 'hp' } },
  { id: 4, name: 'status', defaultParams: { flag: 'bless', refresh: false } },
];

const fx = (
  over: Partial<AbilityEffectOutput> & { effectId?: number } = {}
): AbilityEffectOutput => ({
  effectId: 2,
  overrideParams: { target: 'str', amount: 3 },
  order: 0,
  chancePct: 100,
  ...over,
});

const errors = (effects: AbilityEffectOutput[]) =>
  validateEffectList(effects, catalog).filter(e => e.severity === 'error');

describe('validateEffectList', () => {
  it('accepts a clean effect, gates and legacy triggers', () => {
    expect(
      validateEffectList(
        [
          fx({ trigger: 'on_cast' }),
          fx({ effectId: 1, overrideParams: { amount: '10d6 + skill' } }),
          fx({ trigger: 'passive' }),
          {
            gateType: 'chance',
            overrideParams: {
              percentage: 50,
              onPass: [fx({ order: 1 })],
            },
            order: 2,
            chancePct: 100,
          },
        ],
        catalog
      )
    ).toEqual([]);
  });

  it.each([
    ['unknown effect id', fx({ effectId: 99999 }), /Unknown effect ID: 99999/],
    [
      'non-numeric amount',
      fx({ effectId: 1, overrideParams: { amount: 'NaN' } }),
      /amount is not a number or formula/,
    ],
    [
      'negative duration',
      fx({ overrideParams: { duration: -5 } }),
      /duration cannot be negative/,
    ],
    [
      'bad duration unit',
      fx({ overrideParams: { durationUnit: 'parsecs' } }),
      /durationUnit must be one of/,
    ],
    [
      'bad trigger',
      fx({ trigger: 'on_nothing' }),
      /Unknown trigger "on_nothing"/,
    ],
    ['chance over 100', fx({ chancePct: 250 }), /Chance must be between/],
    [
      'boolean given a string',
      fx({ effectId: 4, overrideParams: { refresh: 'yes' } }),
      /refresh should be a boolean/,
    ],
    [
      'bad heal resource',
      fx({ effectId: 3, overrideParams: { resource: 'mana' } }),
      /resource must be one of hp, move/,
    ],
    [
      'unbalanced formula',
      fx({ effectId: 1, overrideParams: { amount: '(1 + 2' } }),
      /unbalanced parentheses/,
    ],
    [
      'bad nested effect',
      {
        gateType: 'check',
        overrideParams: {
          onFail: [fx({ overrideParams: { durationUnit: 'weeks' } })],
        },
        order: 0,
        chancePct: 100,
      } as AbilityEffectOutput,
      /onFail\[0\]\. durationUnit must be one of/,
    ],
  ])('flags %s', (_name, effect, message) => {
    const found = errors([effect]);
    expect(found.length).toBeGreaterThan(0);
    expect(found.map(e => e.message).join('\n')).toMatch(message);
  });

  it('reports every problem on a multiply bad effect, not just the first', () => {
    const found = errors([
      fx({
        effectId: 1,
        trigger: 'on_nothing',
        chancePct: 250,
        overrideParams: { amount: 'NaN', durationUnit: 'parsecs' },
      }),
    ]);
    expect(found.map(e => e.field).sort()).toEqual([
      'amount',
      'chancePct',
      'durationUnit',
      'trigger',
    ]);
  });

  it('warns about missing expected parameters without blocking', () => {
    const all = validateEffectList(
      [fx({ effectId: 1, overrideParams: {} })],
      catalog
    );
    expect(all.map(e => [e.severity, e.field])).toEqual([
      ['warning', 'amount'],
    ]);
  });

  it('skips catalog checks while the catalog is not loaded', () => {
    expect(
      validateEffectList([fx({ effectId: 99999 })], null).filter(
        e => e.severity === 'error'
      )
    ).toEqual([]);
  });
});
