import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import { TriggersResolver } from './triggers.resolver';

describe('TriggersResolver guards', () => {
  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(TriggersResolver, [
      'createTrigger',
      'updateTrigger',
      'deleteTrigger',
      'attachTrigger',
      'detachTrigger',
      'markTriggerReviewed',
    ]);
  });
});
