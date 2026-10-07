import type { QuestObjectiveType } from '@/generated/graphql';
import { OBJECTIVE_TYPES } from '../quest-constants';
import {
  OBJECTIVE_FIELDS,
  formatKeywords,
  movePhase,
  objectiveTypePatch,
  parseKeywords,
  type PhaseFormData,
} from '../quest-form';

const phase = (id: number, order: number): PhaseFormData => ({
  id,
  name: `P${id}`,
  description: '',
  order,
  objectives: [],
  rewards: [],
});

describe('OBJECTIVE_FIELDS', () => {
  it('covers every objective type the editor offers', () => {
    expect(Object.keys(OBJECTIVE_FIELDS).sort()).toEqual(
      OBJECTIVE_TYPES.map(t => t.value).sort()
    );
  });

  it.each<[QuestObjectiveType, string[]]>([
    ['KILL_MOB', ['targetMob', 'scope']],
    ['COLLECT_ITEM', ['targetObject', 'scope']],
    ['DELIVER_ITEM', ['targetObject', 'deliverToMob', 'scope']],
    ['VISIT_ROOM', ['targetRoom', 'scope']],
    ['TALK_TO_NPC', ['targetMob', 'dialogue', 'scope']],
    ['USE_SKILL', ['targetAbility', 'scope']],
    ['CUSTOM_LUA', ['luaExpression']],
  ])('%s needs exactly %j', (type, expected) => {
    const on = Object.entries(OBJECTIVE_FIELDS[type])
      .filter(([, v]) => v)
      .map(([k]) => k)
      .sort();
    expect(on).toEqual([...expected].sort());
  });
});

describe('objectiveTypePatch', () => {
  it('clears targets the new type does not use but keeps shared ones', () => {
    const toVisit = objectiveTypePatch('VISIT_ROOM', { scope: 'SOLO' });
    expect(toVisit).toMatchObject({
      objectiveType: 'VISIT_ROOM',
      targetMobZoneId: null,
      targetMobId: null,
      targetObjectId: null,
      targetAbilityId: null,
      deliverToMobId: null,
      luaExpression: '',
    });
    // The room target is the one the new type uses: it is not touched.
    expect(toVisit).not.toHaveProperty('targetRoomId');

    // Kill Mob -> Talk to NPC keeps the mob target (both use it).
    expect(
      objectiveTypePatch('TALK_TO_NPC', { scope: 'SOLO' })
    ).not.toHaveProperty('targetMobId');
  });

  it('resets scope to SOLO for Custom (Lua), which has no party scope', () => {
    expect(objectiveTypePatch('CUSTOM_LUA', { scope: 'PARTY' }).scope).toBe(
      'SOLO'
    );
    expect(
      objectiveTypePatch('KILL_MOB', { scope: 'PARTY' })
    ).not.toHaveProperty('scope');
  });
});

describe('movePhase', () => {
  const phases = [phase(10, 0), phase(11, 1), phase(12, 2)];

  it('moves a phase down and renumbers order 0..n-1', () => {
    const moved = movePhase(phases, 10, 'down');
    expect(moved?.map(p => [p.id, p.order])).toEqual([
      [11, 0],
      [10, 1],
      [12, 2],
    ]);
  });

  it('moves a phase up', () => {
    expect(movePhase(phases, 12, 'up')?.map(p => p.id)).toEqual([10, 12, 11]);
  });

  it('returns null at the ends or for an unknown phase', () => {
    expect(movePhase(phases, 10, 'up')).toBeNull();
    expect(movePhase(phases, 12, 'down')).toBeNull();
    expect(movePhase(phases, 99, 'down')).toBeNull();
  });

  it('does not mutate the input', () => {
    movePhase(phases, 10, 'down');
    expect(phases.map(p => p.id)).toEqual([10, 11, 12]);
  });
});

describe('keyword helpers', () => {
  it('round-trips a comma separated list', () => {
    expect(parseKeywords(' yes, sure ,, ok ')).toEqual(['yes', 'sure', 'ok']);
    expect(formatKeywords(['yes', 'sure'])).toBe('yes, sure');
    expect(parseKeywords('')).toEqual([]);
  });
});
