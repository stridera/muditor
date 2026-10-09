import {
  Kind,
  type FieldNode,
  type FragmentDefinitionNode,
  type SelectionSetNode,
} from 'graphql';

/** Room scalars the lightweight (raw SQL) loader returns with real values. */
const LIGHT_ROOM_FIELDS = new Set([
  'id',
  'zoneId',
  'name',
  'description',
  'roomDescription',
  'sector',
  'createdAt',
  'updatedAt',
  'layoutX',
  'layoutY',
  'layoutZ',
]);
/** Exit columns the lightweight loader returns with real values. */
const LIGHT_EXIT_FIELDS = new Set([
  'id',
  'direction',
  'toZoneId',
  'toRoomId',
  'roomZoneId',
  'roomId',
]);

/** What a `rooms` selection actually needs the loader to fetch. */
export interface RoomLoadPlan {
  /** Selection fits the cheap raw-SQL loader (no relations beyond light exits). */
  lightweight: boolean;
  exits: boolean;
  extraDescs: boolean;
  environmentalEffects: boolean;
  /** mobs, or shops (which are derived from the mob resets) */
  mobs: boolean;
  objects: boolean;
}

/** Number of heavy relations the plan loads for every room (0 = scalars only). */
export function heavyRelationCount(plan: RoomLoadPlan): number {
  if (plan.lightweight) return 0;
  return [
    plan.exits,
    plan.extraDescs,
    plan.environmentalEffects,
    plan.mobs,
    plan.objects,
  ].filter(Boolean).length;
}

/** Relations that are fanned out per room (anything beyond exits). */
export function needsRelationGraph(plan: RoomLoadPlan): boolean {
  return (
    !plan.lightweight &&
    (plan.extraDescs || plan.environmentalEffects || plan.mobs || plan.objects)
  );
}

type FragmentLookup = (name: string) => FragmentDefinitionNode | undefined;

/** Flatten a selection set (inline + named fragments) into its field nodes. */
function collectFields(
  sets: Array<SelectionSetNode | undefined>,
  fragment: FragmentLookup,
  seen = new Set<string>()
): FieldNode[] {
  const out: FieldNode[] = [];
  for (const set of sets) {
    if (!set) continue;
    for (const sel of set.selections) {
      if (sel.kind === Kind.FIELD) {
        out.push(sel);
      } else if (sel.kind === Kind.INLINE_FRAGMENT) {
        out.push(...collectFields([sel.selectionSet], fragment, seen));
      } else {
        const name = sel.name.value;
        if (seen.has(name)) continue;
        seen.add(name);
        const frag = fragment(name);
        if (frag)
          out.push(...collectFields([frag.selectionSet], fragment, seen));
      }
    }
  }
  return out;
}

/**
 * Decide what a `rooms`-style field selection needs loaded. Anything the
 * lightweight loader can't fill with real values forces the Prisma loader, with
 * only the relations actually selected included.
 */
export function planRoomLoad(
  field: FieldNode,
  fragment: FragmentLookup
): RoomLoadPlan {
  const top = collectFields([field.selectionSet], fragment);
  const names = new Set(top.map(f => f.name.value));
  const exitFields = new Set(
    collectFields(
      top.filter(f => f.name.value === 'exits').map(f => f.selectionSet),
      fragment
    ).map(f => f.name.value)
  );
  const roomOk = [...names].every(
    n => n === '__typename' || n === 'exits' || LIGHT_ROOM_FIELDS.has(n)
  );
  const exitOk = [...exitFields].every(
    n => n === '__typename' || LIGHT_EXIT_FIELDS.has(n)
  );
  return {
    lightweight: roomOk && exitOk,
    exits: names.has('exits'),
    extraDescs: names.has('extraDescs'),
    environmentalEffects: names.has('environmentalEffects'),
    mobs: names.has('mobs') || names.has('shops'),
    objects: names.has('objects'),
  };
}
