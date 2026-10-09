import type {
  CreateAbilityInput,
  ElementType,
  GetAbilityDetailsQuery,
  Position,
  SpellSphere,
  UpdateAbilityInput,
} from '@/generated/graphql';

// Optional values must explicitly include undefined to satisfy exactOptionalPropertyTypes
export interface AbilityFormData {
  name: string;
  abilityType: string;
  description: string;
  schoolId: number | undefined; // explicit undefined instead of optional property
  minPosition: Position;
  violent: boolean;
  combatOk: boolean;
  castTimeRounds: number;
  cooldownMs: number;
  promptLetter: string;
  inCombatOnly: boolean;
  isArea: boolean;
  notes: string;
  tags: string[];
  // Spell metadata
  sphere: string | undefined;
  damageType: string | undefined;
  pages: number | undefined;
  memorizationTime: number;
  questOnly: boolean;
  humanoidOnly: boolean;
}

/**
 * The full ability the edit form is seeded from. This is the single-ability
 * query (GetAbilityDetails), never the list query: the list deliberately omits
 * combatOk, questOnly, humanoidOnly and memorizationTime, so seeding from it
 * would silently reset those fields to their defaults on save.
 */
export type AbilityFormSource = NonNullable<GetAbilityDetailsQuery['ability']>;

export const EMPTY_ABILITY_FORM: AbilityFormData = {
  name: '',
  abilityType: 'SPELL',
  description: '',
  minPosition: 'STANDING',
  violent: false,
  combatOk: true,
  castTimeRounds: 1,
  cooldownMs: 0,
  promptLetter: '',
  inCombatOnly: false,
  isArea: false,
  notes: '',
  tags: [],
  schoolId: undefined,
  sphere: undefined,
  damageType: undefined,
  pages: undefined,
  memorizationTime: 0,
  questOnly: false,
  humanoidOnly: false,
};

export function abilityToFormData(ability: AbilityFormSource): AbilityFormData {
  return {
    name: ability.name,
    abilityType: ability.abilityType,
    description: ability.description || '',
    schoolId: ability.school ? parseInt(ability.school.id, 10) : undefined,
    minPosition: ability.minPosition,
    violent: ability.violent,
    combatOk: ability.combatOk,
    castTimeRounds: ability.castTimeRounds,
    cooldownMs: ability.cooldownMs,
    promptLetter: ability.promptLetter ?? '',
    inCombatOnly: ability.inCombatOnly,
    isArea: ability.isArea,
    notes: ability.notes || '',
    tags: [...(ability.tags ?? [])],
    sphere: ability.sphere || undefined,
    damageType: ability.damageType || undefined,
    pages: ability.pages || undefined,
    memorizationTime: ability.memorizationTime,
    questOnly: ability.questOnly,
    humanoidOnly: ability.humanoidOnly,
  };
}

/**
 * Every editable field as the API stores it. Blank optional values become
 * null, which the update mutation treats as "clear" (undefined means "leave
 * alone").
 */
function toApiFields(form: AbilityFormData) {
  return {
    name: form.name,
    abilityType: form.abilityType,
    description: form.description || null,
    schoolId: form.schoolId ?? null,
    minPosition: form.minPosition,
    violent: form.violent,
    combatOk: form.combatOk,
    castTimeRounds: form.castTimeRounds,
    cooldownMs: form.cooldownMs,
    promptLetter: form.promptLetter.trim() || null,
    inCombatOnly: form.inCombatOnly,
    isArea: form.isArea,
    notes: form.notes || null,
    tags: form.tags,
    sphere: (form.sphere || null) as SpellSphere | null,
    damageType: (form.damageType || null) as ElementType | null,
    pages: form.pages || null,
    memorizationTime: form.memorizationTime,
    questOnly: form.questOnly,
    humanoidOnly: form.humanoidOnly,
  };
}

export function buildCreateAbilityInput(
  form: AbilityFormData
): CreateAbilityInput {
  const f = toApiFields(form);
  return {
    name: f.name,
    abilityType: f.abilityType,
    description: f.description ?? undefined,
    schoolId: f.schoolId ?? undefined,
    minPosition: f.minPosition,
    violent: f.violent,
    combatOk: f.combatOk,
    castTimeRounds: f.castTimeRounds,
    cooldownMs: f.cooldownMs,
    promptLetter: f.promptLetter,
    inCombatOnly: f.inCombatOnly,
    isArea: f.isArea,
    notes: f.notes ?? undefined,
    tags: f.tags,
    sphere: f.sphere ?? undefined,
    damageType: f.damageType ?? undefined,
    pages: f.pages ?? undefined,
    memorizationTime: f.memorizationTime,
    questOnly: f.questOnly,
    humanoidOnly: f.humanoidOnly,
  };
}

/**
 * Partial update: only the fields the user actually changed relative to the
 * loaded ability, so anything the form never touched (or could not see) is
 * never overwritten. An empty object means nothing changed.
 */
export function buildUpdateAbilityInput(
  original: AbilityFormData,
  current: AbilityFormData
): UpdateAbilityInput {
  const before = toApiFields(original);
  const after = toApiFields(current);
  const changed: Record<string, unknown> = {};
  for (const key of Object.keys(after) as Array<keyof typeof after>) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changed[key] = after[key];
    }
  }
  return changed as UpdateAbilityInput;
}

export const ABILITY_TYPES = ['SPELL', 'SKILL', 'SONG', 'CHANT'];

export const POSITIONS = ['PRONE', 'SITTING', 'KNEELING', 'STANDING', 'FLYING'];

export const SPELL_SPHERES = [
  'GENERIC',
  'FIRE',
  'WATER',
  'EARTH',
  'AIR',
  'HEALING',
  'PROTECTION',
  'ENCHANTMENT',
  'SUMMONING',
  'DEATH',
  'DIVINATION',
];

export const ELEMENT_TYPES = [
  'PHYSICAL',
  'FIRE',
  'COLD',
  'ACID',
  'SHOCK',
  'POISON',
  'MAGIC',
  'HOLY',
  'UNHOLY',
  'MENTAL',
  'HEAL',
];
