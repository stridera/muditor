import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import { DialogueTreeResolver } from './dialogue-tree.resolver';

describe('DialogueTreeResolver guards', () => {
  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(DialogueTreeResolver, [
      'createQuestDialogueTree',
      'updateDialogueTree',
      'deleteDialogueTree',
      'createDialogueNode',
      'updateDialogueNode',
      'deleteDialogueNode',
      'createDialogueResponse',
      'updateDialogueResponse',
      'deleteDialogueResponse',
    ]);
  });
});
