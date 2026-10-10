import {
  EMPTY_FORM,
  applyConditionEdits,
  conditionsToForm,
  extraConditionKeys,
  normalizeAiTarget,
  removeConditionKey,
  summarizeConditions,
} from '../mob-ai-conditions';

describe('mob AI conditions round-trip', () => {
  it('returns the stored object unchanged when nothing was edited', () => {
    const stored = {
      in_combat: true,
      self_hp_below: 40,
      target_casting: false,
      grouped_targets: false,
      phase: { n: 2 },
      moon: 'full',
    };
    expect(applyConditionEdits(stored, conditionsToForm(stored))).toEqual(
      stored
    );
  });

  it('keeps unknown keys when a known field is edited', () => {
    const stored = { self_hp_below: 50, phase: { n: 2 } };
    const form = { ...conditionsToForm(stored), selfHpBelow: 30 };
    expect(applyConditionEdits(stored, form)).toEqual({
      self_hp_below: 30,
      phase: { n: 2 },
    });
  });

  it('leaves values the editor cannot show alone (false flags)', () => {
    const stored = { target_casting: false, out_of_combat: false };
    // Only flip an unrelated field.
    const form = { ...conditionsToForm(stored), telegraph: true };
    expect(applyConditionEdits(stored, form)).toEqual({
      target_casting: false,
      out_of_combat: false,
      telegraph: true,
    });
  });

  it('clearing a field drops just that key', () => {
    const stored = { self_hp_below: 50, align: 'evil', phase: 1 };
    const form = { ...conditionsToForm(stored), align: undefined };
    expect(applyConditionEdits(stored, form)).toEqual({
      self_hp_below: 50,
      phase: 1,
    });
  });

  it('switching combat state replaces both combat keys', () => {
    const stored = { in_combat: true, phase: 1 };
    const form = { ...conditionsToForm(stored), combat: 'out' as const };
    expect(applyConditionEdits(stored, form)).toEqual({
      out_of_combat: true,
      phase: 1,
    });
    expect(
      applyConditionEdits(stored, { ...form, combat: 'any' as const })
    ).toEqual({ phase: 1 });
  });

  it('builds from nothing and collapses empty to null', () => {
    expect(applyConditionEdits(null, EMPTY_FORM)).toBeNull();
    expect(
      applyConditionEdits(null, {
        ...EMPTY_FORM,
        combat: 'in',
        selfHpBelow: 60,
        targetLifeforce: 'UNDEAD',
        targetHasBuff: true,
      })
    ).toEqual({
      in_combat: true,
      self_hp_below: 60,
      target_lifeforce: 'UNDEAD',
      target_has_buff: true,
    });
    expect(applyConditionEdits({ self_hp_below: 5 }, EMPTY_FORM)).toBeNull();
  });

  it('reads grouped_targets: true as 2', () => {
    expect(conditionsToForm({ grouped_targets: true }).groupedTargets).toBe(2);
  });

  it('lists and removes unknown keys explicitly', () => {
    const stored = { in_combat: true, phase: 2, moon: 'full' };
    expect(extraConditionKeys(stored)).toEqual(['phase', 'moon']);
    expect(removeConditionKey(stored, 'phase')).toEqual({
      in_combat: true,
      moon: 'full',
    });
    expect(removeConditionKey({ phase: 1 }, 'phase')).toBeNull();
  });

  it('summarises', () => {
    expect(summarizeConditions(null)).toBe('always');
    expect(
      summarizeConditions({ in_combat: true, self_hp_below: 30, x: 1 })
    ).toBe('in combat, self HP < 30%, +1 other');
  });
});

describe('normalizeAiTarget', () => {
  it('uppercases seeded lowercase selectors', () => {
    expect(normalizeAiTarget('weakest_attacker')).toBe('WEAKEST_ATTACKER');
    expect(normalizeAiTarget('self')).toBe('SELF');
    expect(normalizeAiTarget(' most-buffed ')).toBe('MOST_BUFFED');
  });

  it('treats null and empty as AUTO', () => {
    expect(normalizeAiTarget(null)).toBe('AUTO');
    expect(normalizeAiTarget('')).toBe('AUTO');
  });
});
