import { BadRequestException } from '@nestjs/common';
import {
  CONDITION_KEYS,
  normalizeTarget,
  storedConditionKeys,
  validateConditions,
} from './mob-ai-rules';

describe('validateConditions', () => {
  it('accepts every known key with a valid value', () => {
    const all = {
      in_combat: true,
      out_of_combat: false,
      self_hp_below: 60,
      target_hp_below: 30,
      ally_hp_below: 40,
      grouped_targets: 3,
      target_casting: true,
      target_has_buff: true,
      self_has_debuff: false,
      target_lifeforce: 'undead',
      align: 'Evil',
      telegraph: true,
    };
    expect(Object.keys(all).sort()).toEqual(Object.keys(CONDITION_KEYS).sort());
    expect(validateConditions(all)).toEqual(all);
  });

  it('treats null, undefined and {} as no conditions', () => {
    expect(validateConditions(null)).toBeNull();
    expect(validateConditions(undefined)).toBeNull();
    expect(validateConditions({})).toBeNull();
  });

  it('rejects unknown keys with a message that lists the valid ones', () => {
    expect.assertions(3);
    try {
      validateConditions({ moon_phase: 'full', in_combat: true });
    } catch (e) {
      expect(e).toBeInstanceOf(BadRequestException);
      expect((e as Error).message).toContain('"moon_phase"');
      expect((e as Error).message).toContain('self_hp_below');
    }
  });

  it('lets preserved unknown keys through untouched, but not other ones', () => {
    const value = { in_combat: true, phase: { n: 2 } };
    expect(validateConditions(value, ['phase'])).toEqual(value);
    expect(() => validateConditions(value, ['other'])).toThrow(/"phase"/);
  });

  it.each([
    [{ self_hp_below: 101 }, /self_hp_below/],
    [{ self_hp_below: -1 }, /self_hp_below/],
    [{ self_hp_below: 50.5 }, /self_hp_below/],
    [{ self_hp_below: '50' }, /self_hp_below/],
    [{ in_combat: 'yes' }, /in_combat/],
    [{ grouped_targets: 0 }, /grouped_targets/],
    [{ target_casting: 1 }, /target_casting/],
    [{ target_lifeforce: 'ghost' }, /target_lifeforce/],
    [{ align: 'chaotic' }, /align/],
  ])('rejects bad value %j', (value, message) => {
    expect(() => validateConditions(value)).toThrow(message);
  });

  it('rejects non-object conditions', () => {
    expect(() => validateConditions([1])).toThrow(/object/);
    expect(() => validateConditions('x')).toThrow(/object/);
  });
});

describe('normalizeTarget', () => {
  it('canonicalises case and separators', () => {
    expect(normalizeTarget('weakest-attacker')).toBe('WEAKEST_ATTACKER');
    expect(normalizeTarget(' most buffed ')).toBe('MOST_BUFFED');
    expect(normalizeTarget('self')).toBe('SELF');
  });

  it('rejects unknown selectors', () => {
    expect(() => normalizeTarget('nobody')).toThrow(/Valid targets/);
  });
});

describe('storedConditionKeys', () => {
  it('lists object keys and ignores everything else', () => {
    expect(storedConditionKeys({ a: 1, b: 2 })).toEqual(['a', 'b']);
    expect(storedConditionKeys(null)).toEqual([]);
    expect(storedConditionKeys([1])).toEqual([]);
  });
});
