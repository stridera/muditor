/**
 * Regression: saving an ability from the list page used to reset combatOk,
 * questOnly, humanoidOnly and memorizationTime, because the form was seeded
 * from the list query (which omits them). The form now seeds from the full
 * ability and the update sends only what changed.
 */
import {
  abilityToFormData,
  buildCreateAbilityInput,
  buildUpdateAbilityInput,
  type AbilityFormSource,
} from '../ability-form';
import { fullAbility } from './fixtures';

describe('abilityToFormData', () => {
  it('carries the fields the list query does not fetch', () => {
    const form = abilityToFormData(fullAbility);
    expect(form).toMatchObject({
      combatOk: false,
      questOnly: true,
      humanoidOnly: true,
      memorizationTime: 9,
      schoolId: 3,
      sphere: 'FIRE',
      pages: 4,
    });
  });
});

describe('buildUpdateAbilityInput', () => {
  const original = abilityToFormData(fullAbility);

  it('sends nothing when nothing changed', () => {
    expect(buildUpdateAbilityInput(original, { ...original })).toEqual({});
  });

  it('sends only the edited field, leaving untouched fields out', () => {
    const input = buildUpdateAbilityInput(original, {
      ...original,
      cooldownMs: 3000,
    });
    expect(input).toEqual({ cooldownMs: 3000 });
    expect(input).not.toHaveProperty('combatOk');
    expect(input).not.toHaveProperty('questOnly');
    expect(input).not.toHaveProperty('humanoidOnly');
    expect(input).not.toHaveProperty('memorizationTime');
  });

  it('still sends a deliberate flip back to the default value', () => {
    const input = buildUpdateAbilityInput(original, {
      ...original,
      questOnly: false,
      memorizationTime: 0,
      combatOk: true,
    });
    expect(input).toEqual({
      questOnly: false,
      memorizationTime: 0,
      combatOk: true,
    });
  });

  it('sends null to clear optional fields the user blanked', () => {
    const input = buildUpdateAbilityInput(original, {
      ...original,
      description: '',
      notes: '',
      schoolId: undefined,
      sphere: undefined,
      damageType: undefined,
      pages: undefined,
      promptLetter: ' ',
    });
    expect(input).toEqual({
      description: null,
      notes: null,
      schoolId: null,
      sphere: null,
      damageType: null,
      pages: null,
      promptLetter: null,
    });
  });

  it('treats a stored null description as unchanged when left blank', () => {
    const blank = abilityToFormData({
      ...fullAbility,
      description: null,
      notes: null,
    } as AbilityFormSource);
    expect(buildUpdateAbilityInput(blank, { ...blank })).toEqual({});
  });

  it('detects tag changes by value', () => {
    expect(
      buildUpdateAbilityInput(original, { ...original, tags: ['fire'] })
    ).toEqual({});
    expect(
      buildUpdateAbilityInput(original, { ...original, tags: ['fire', 'aoe'] })
    ).toEqual({ tags: ['fire', 'aoe'] });
  });
});

describe('buildCreateAbilityInput', () => {
  it('sends every field for a new ability', () => {
    const input = buildCreateAbilityInput(abilityToFormData(fullAbility));
    expect(input).toMatchObject({
      name: 'Fireball',
      combatOk: false,
      questOnly: true,
      humanoidOnly: true,
      memorizationTime: 9,
      schoolId: 3,
    });
  });
});
