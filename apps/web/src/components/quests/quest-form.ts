import type {
  DialogueMatchType,
  QuestObjectiveScope,
  QuestObjectiveType,
  QuestRewardType,
} from '@/generated/graphql';

// Form-state shapes and pure helpers shared by the quest editor components.

export interface DialogueFormData {
  id: number;
  npcMessage: string;
  matchType: DialogueMatchType;
  matchKeywords: string[];
  dialogueTreeId: number | null;
}

export interface ObjectiveFormData {
  id: number;
  objectiveType: QuestObjectiveType;
  scope: QuestObjectiveScope;
  playerDescription: string;
  internalNote: string;
  showProgress: boolean;
  requiredCount: number;
  targetMobZoneId: number | null;
  targetMobId: number | null;
  targetObjectZoneId: number | null;
  targetObjectId: number | null;
  targetRoomZoneId: number | null;
  targetRoomId: number | null;
  targetAbilityId: number | null;
  deliverToMobZoneId: number | null;
  deliverToMobId: number | null;
  luaExpression: string;
  dialogue: DialogueFormData | null;
}

export interface RewardFormData {
  id: number;
  phaseId: number;
  rewardType: QuestRewardType;
  amount: number | null;
  objectZoneId: number | null;
  objectId: number | null;
  abilityId: number | null;
  choiceGroup: number | null;
  quantity: number;
  condition: string;
}

export interface PhaseFormData {
  id: number;
  name: string;
  description: string;
  order: number;
  objectives: ObjectiveFormData[];
  rewards: RewardFormData[];
}

/**
 * Which inputs an objective type needs. The editor renders exactly these, so a
 * Kill Mob objective never shows a room picker and a Visit Room objective never
 * shows a mob picker. Mirrors what the game matches on per type (see
 * quests.md, "Objectives").
 */
export interface ObjectiveFieldSet {
  targetMob: boolean;
  targetObject: boolean;
  targetRoom: boolean;
  targetAbility: boolean;
  deliverToMob: boolean;
  luaExpression: boolean;
  dialogue: boolean;
  /** Party scope is honoured for every event-driven type, not Custom (Lua). */
  scope: boolean;
}

const NONE: ObjectiveFieldSet = {
  targetMob: false,
  targetObject: false,
  targetRoom: false,
  targetAbility: false,
  deliverToMob: false,
  luaExpression: false,
  dialogue: false,
  scope: true,
};

export const OBJECTIVE_FIELDS: Record<QuestObjectiveType, ObjectiveFieldSet> = {
  KILL_MOB: { ...NONE, targetMob: true },
  COLLECT_ITEM: { ...NONE, targetObject: true },
  DELIVER_ITEM: { ...NONE, targetObject: true, deliverToMob: true },
  VISIT_ROOM: { ...NONE, targetRoom: true },
  TALK_TO_NPC: { ...NONE, targetMob: true, dialogue: true },
  USE_SKILL: { ...NONE, targetAbility: true },
  CUSTOM_LUA: { ...NONE, luaExpression: true, scope: false },
};

/**
 * Patch for switching an objective to `next`: sets the type and clears every
 * stored target the new type does not use (a Kill Mob turned into Visit Room
 * must not keep a stale mob target). Targets shared by both types survive.
 */
export function objectiveTypePatch(
  next: QuestObjectiveType,
  current: Pick<ObjectiveFormData, 'scope'>
): Partial<ObjectiveFormData> {
  const fields = OBJECTIVE_FIELDS[next];
  const patch: Partial<ObjectiveFormData> = { objectiveType: next };
  if (!fields.targetMob) {
    patch.targetMobZoneId = null;
    patch.targetMobId = null;
  }
  if (!fields.targetObject) {
    patch.targetObjectZoneId = null;
    patch.targetObjectId = null;
  }
  if (!fields.targetRoom) {
    patch.targetRoomZoneId = null;
    patch.targetRoomId = null;
  }
  if (!fields.targetAbility) patch.targetAbilityId = null;
  if (!fields.deliverToMob) {
    patch.deliverToMobZoneId = null;
    patch.deliverToMobId = null;
  }
  if (!fields.luaExpression) patch.luaExpression = '';
  if (!fields.scope && current.scope !== 'SOLO') {
    patch.scope = 'SOLO' as QuestObjectiveScope;
  }
  return patch;
}

/**
 * Move a phase one step up or down. Returns the reordered list with `order`
 * renumbered 0..n-1 (the value persisted by reorderQuestPhases), or null when
 * the move is impossible (unknown phase, already first/last).
 */
export function movePhase(
  phases: PhaseFormData[],
  phaseId: number,
  direction: 'up' | 'down'
): PhaseFormData[] | null {
  const index = phases.findIndex(p => p.id === phaseId);
  if (index === -1) return null;
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= phases.length) return null;
  const next = [...phases];
  const [moved] = next.splice(index, 1);
  if (!moved) return null;
  next.splice(target, 0, moved);
  return next.map((p, i) => ({ ...p, order: i }));
}

/** "yes, sure ,  ok" -> ['yes', 'sure', 'ok'] */
export function parseKeywords(text: string): string[] {
  return text
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);
}

export function formatKeywords(keywords: string[]): string {
  return keywords.join(', ');
}
