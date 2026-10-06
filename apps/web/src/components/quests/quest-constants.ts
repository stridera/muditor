import type {
  QuestObjectiveType,
  QuestRewardType,
  QuestTriggerType,
} from '@/generated/graphql';

// Option lists for the quest editor selects. The quest help guide
// (src/content/help/quests.md) must document every entry; a test fails when a
// new type is added here without being documented.

export const OBJECTIVE_TYPES: { value: QuestObjectiveType; label: string }[] = [
  { value: 'KILL_MOB' as QuestObjectiveType, label: 'Kill Mob' },
  { value: 'COLLECT_ITEM' as QuestObjectiveType, label: 'Collect Item' },
  { value: 'DELIVER_ITEM' as QuestObjectiveType, label: 'Deliver Item' },
  { value: 'VISIT_ROOM' as QuestObjectiveType, label: 'Visit Room' },
  { value: 'TALK_TO_NPC' as QuestObjectiveType, label: 'Talk to NPC' },
  { value: 'USE_SKILL' as QuestObjectiveType, label: 'Use Skill' },
  { value: 'CUSTOM_LUA' as QuestObjectiveType, label: 'Custom (Lua)' },
];

export const REWARD_TYPES: { value: QuestRewardType; label: string }[] = [
  { value: 'EXPERIENCE' as QuestRewardType, label: 'Experience' },
  { value: 'GOLD' as QuestRewardType, label: 'Gold' },
  { value: 'ITEM' as QuestRewardType, label: 'Item' },
  { value: 'ABILITY' as QuestRewardType, label: 'Ability' },
];

export const TRIGGER_TYPES: {
  value: QuestTriggerType;
  label: string;
  description: string;
}[] = [
  {
    value: 'MANUAL' as QuestTriggerType,
    label: 'Manual',
    description:
      'Staff assign it with qload / qgive; players can also qaccept it',
  },
  {
    value: 'MOB' as QuestTriggerType,
    label: 'Mob Encounter',
    description:
      'Not used by the game yet: players take it with qaccept <zone> <id>',
  },
  {
    value: 'LEVEL' as QuestTriggerType,
    label: 'Level Reached',
    description: 'Offered when a character levels up to the Trigger Level',
  },
  {
    value: 'ITEM' as QuestTriggerType,
    label: 'Item Obtained',
    description: 'Offered when a character picks up the item with get',
  },
  {
    value: 'ROOM' as QuestTriggerType,
    label: 'Room Entered',
    description: 'Offered when a character first enters the room',
  },
  {
    value: 'SKILL' as QuestTriggerType,
    label: 'Skill Used',
    description: 'Offered when a character successfully uses the ability',
  },
  {
    value: 'EVENT' as QuestTriggerType,
    label: 'Event Active',
    description: 'Offered to online players when the event switches on',
  },
  {
    value: 'AUTO' as QuestTriggerType,
    label: 'Auto-Start',
    description: 'Offered at every login until the character has the quest',
  },
];
