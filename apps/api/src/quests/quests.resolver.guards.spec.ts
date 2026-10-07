import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import { QuestsResolver } from './quests.resolver';

describe('QuestsResolver guards', () => {
  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(QuestsResolver, [
      'createQuest',
      'updateQuest',
      'deleteQuest',
      'createQuestPhase',
      'updateQuestPhase',
      'deleteQuestPhase',
      'reorderQuestPhases',
      'createQuestObjective',
      'updateQuestObjective',
      'deleteQuestObjective',
      'createQuestDialogue',
      'updateQuestDialogue',
      'deleteQuestDialogue',
      'createQuestReward',
      'updateQuestReward',
      'deleteQuestReward',
      'createQuestPrerequisite',
      'deleteQuestPrerequisite',
    ]);
  });
});
