import type {
  DialogueMatchType,
  QuestObjectiveScope,
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
  { value: 'SKILL_POINTS' as QuestRewardType, label: 'Skill Points' },
  { value: 'HOUSING' as QuestRewardType, label: 'Housing' },
];

export const OBJECTIVE_SCOPES: {
  value: QuestObjectiveScope;
  label: string;
  description: string;
}[] = [
  {
    value: 'SOLO' as QuestObjectiveScope,
    label: 'Solo',
    description: "Only the quest holder's own actions count",
  },
  {
    value: 'PARTY' as QuestObjectiveScope,
    label: 'Party',
    description:
      "Actions by anyone in the holder's group count for every member who holds the quest",
  },
];

// ANY_RESPONSE exists in the database but the game never matches it, so the
// dialogue editor does not offer it.
export const DIALOGUE_MATCH_TYPES: {
  value: DialogueMatchType;
  label: string;
  hint: string;
}[] = [
  {
    value: 'CONTAINS' as DialogueMatchType,
    label: 'Contains',
    hint: 'Any keyword appears in what the player says',
  },
  {
    value: 'EXACT' as DialogueMatchType,
    label: 'Exact',
    hint: 'What the player says is exactly a keyword',
  },
  {
    value: 'STARTS_WITH' as DialogueMatchType,
    label: 'Starts with',
    hint: 'What the player says begins with a keyword',
  },
  {
    value: 'ANY_OF' as DialogueMatchType,
    label: 'Any of (whole words)',
    hint: 'One of the words the player says is a keyword',
  },
  {
    value: 'REGEX' as DialogueMatchType,
    label: 'Regex',
    hint: 'A keyword is a regular expression (case-insensitive)',
  },
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
