import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import 'reflect-metadata';
import { ZONE_SCOPE_KEY } from '../auth/guards/zone-permission.guard';
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

  it('attachTrigger also checks the trigger zone; detachTrigger checks the entity zones', () => {
    const proto = TriggersResolver.prototype as unknown as Record<
      string,
      object
    >;
    const attach = Reflect.getMetadata(
      ZONE_SCOPE_KEY,
      proto.attachTrigger as object
    );
    expect(attach.keys).toEqual(
      expect.arrayContaining(['triggerZoneId', 'mobZoneId', 'objectZoneId'])
    );
    const detach = Reflect.getMetadata(
      ZONE_SCOPE_KEY,
      proto.detachTrigger as object
    );
    expect(detach.keys).toEqual(
      expect.arrayContaining(['zoneId', 'mobZoneId', 'objectZoneId'])
    );
  });
});
