import { Kind, parse, type FragmentDefinitionNode } from 'graphql';
import {
  heavyRelationCount,
  needsRelationGraph,
  planRoomLoad,
} from './room-selection';

function plan(query: string) {
  const doc = parse(query);
  const fragments = new Map<string, FragmentDefinitionNode>();
  for (const d of doc.definitions) {
    if (d.kind === Kind.FRAGMENT_DEFINITION) fragments.set(d.name.value, d);
  }
  const op = doc.definitions.find(d => d.kind === Kind.OPERATION_DEFINITION);
  if (op?.kind !== Kind.OPERATION_DEFINITION) throw new Error('no operation');
  const field = op.selectionSet.selections[0];
  if (field?.kind !== Kind.FIELD) throw new Error('no field');
  return planRoomLoad(field, n => fragments.get(n));
}

describe('planRoomLoad', () => {
  it('keeps the public world-map shapes on the lightweight loader', () => {
    const map = plan(
      '{ rooms { id name sector zoneId layoutX layoutY layoutZ exits { id direction toZoneId toRoomId } } }'
    );
    expect(map.lightweight).toBe(true);
    expect(heavyRelationCount(map)).toBe(0);
    expect(plan('{ rooms { id zoneId name layoutX layoutY sector } }')).toEqual(
      expect.objectContaining({ lightweight: true })
    );
  });

  it('only loads the relations the selection reads', () => {
    const p = plan('{ rooms { id mobs { id } } }');
    expect(p).toEqual({
      lightweight: false,
      exits: false,
      extraDescs: false,
      environmentalEffects: false,
      mobs: true,
      objects: false,
    });
    expect(needsRelationGraph(p)).toBe(true);
    expect(heavyRelationCount(p)).toBe(1);
  });

  it('shops need the mob resets', () => {
    expect(plan('{ rooms { shops { id } } }').mobs).toBe(true);
  });

  it('scalars the raw loader cannot fill use Prisma without relations', () => {
    const p = plan('{ rooms { id isPeaceful isDeathTrap } }');
    expect(p.lightweight).toBe(false);
    expect(heavyRelationCount(p)).toBe(0);
    expect(needsRelationGraph(p)).toBe(false);
  });

  it('non-light exit fields force the Prisma loader with exits', () => {
    const p = plan('{ rooms { id exits { id keywords flags } } }');
    expect(p.lightweight).toBe(false);
    expect(p.exits).toBe(true);
    expect(needsRelationGraph(p)).toBe(false);
  });

  it('sees through fragments', () => {
    const p = plan(`
      { rooms { id ...R ... on RoomDto { objects { id } } } }
      fragment R on RoomDto { extraDescs { id } }`);
    expect(p.extraDescs).toBe(true);
    expect(p.objects).toBe(true);
  });
});
