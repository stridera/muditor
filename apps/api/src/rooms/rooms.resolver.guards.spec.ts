import { expectAllMutationsZoneProtected } from '../common/test/resolver-guard-assertions';
import { RoomsResolver } from './rooms.resolver';

describe('RoomsResolver guards', () => {
  it('protects every mutation with login, BUILDER role and zone permission', () => {
    expectAllMutationsZoneProtected(RoomsResolver, [
      'createRoom',
      'updateRoom',
      'deleteRoom',
      'createRoomExit',
      'updateRoomExit',
      'deleteRoomExit',
      'updateRoomPosition',
      'batchUpdateRoomPositions',
      'updateRoomEnvironmentalEffects',
    ]);
  });
});
