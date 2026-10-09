import {
  GraphQLError,
  Kind,
  getNamedType,
  isListType,
  getNullableType,
  isCompositeType,
  visit,
  type ASTNode,
  type ArgumentNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type GraphQLCompositeType,
  type GraphQLField,
  type OperationDefinitionNode,
  type SelectionSetNode,
  type ValidationContext,
  type ValidationRule,
} from 'graphql';
import { FIELD_PAGE_CAPS, MAX_PAGE_SIZE } from './pagination';
import { heavyRelationCount, planRoomLoad } from './room-selection';

/** Most aliased fields one operation may contain (alias-flooding guard). */
export const MAX_QUERY_ALIASES = 15;
/** Most estimated cost one operation may have (see `complexityLimit`). */
export const MAX_QUERY_COST = 2_500_000;
/** Most fragment spreads a document may contain (fragment-bomb guard). */
export const MAX_FRAGMENT_SPREADS = 100;
/** Assumed size of a list field that has no page argument. */
const DEFAULT_LIST_SIZE = 10;
const PAGE_ARGS = ['take', 'first', 'limit'];
/**
 * Extra cost per returned row, per relation the resolver has to load for it
 * (rooms: exits, extraDescs, environmentalEffects, mobs/shops, objects), for
 * root list fields whose loader fans out beyond the selection's own fields.
 * 20000 rooms with one relation costs 400k; with all five, 2M.
 */
export const RELATION_ROW_COST = 20;
const RELATION_HEAVY_FIELDS = new Set(['rooms']);

export interface ComplexityLimits {
  maxAliases?: number;
  maxCost?: number;
  maxFragmentSpreads?: number;
}

type OperationNode = OperationDefinitionNode;
interface Tally {
  cost: number;
  aliases: number;
}

/** True only for a literal `name: true` argument (a `$var` is untrusted). */
function isLiteralTrue(field: FieldNode, name: string): boolean {
  return (field.arguments ?? []).some(
    a =>
      a.name.value === name &&
      a.value.kind === Kind.BOOLEAN &&
      a.value.value === true
  );
}

/**
 * Validation rule that stops anonymous request amplification:
 *  - at most `maxAliases` aliased fields per operation (one request can't ask
 *    for the same expensive root query a thousand times under different names);
 *  - at most `maxFragmentSpreads` fragment spreads per document;
 *  - an estimated cost: every field costs 1, and the selection beneath a list
 *    field is multiplied by its page size. A field with a `take`/`first`/`limit`
 *    argument is sized by its literal value; a `$variable` or missing argument
 *    is costed at the server cap (worst case: variable values are not known at
 *    validation time). Sizes are clamped to the cap the resolvers enforce. Other
 *    list fields are assumed to hold 10 items. Fragments are expanded once
 *    (memoised per fragment, so nesting cannot blow up); introspection is free.
 *  - `rooms` additionally pays `RELATION_ROW_COST` per row per relation its
 *    selection forces the loader to fetch (unless it is literally lightweight).
 */
export function complexityLimit(limits: ComplexityLimits = {}): ValidationRule {
  const maxAliases = limits.maxAliases ?? MAX_QUERY_ALIASES;
  const maxCost = limits.maxCost ?? MAX_QUERY_COST;
  const maxSpreads = limits.maxFragmentSpreads ?? MAX_FRAGMENT_SPREADS;

  return (context: ValidationContext) => {
    const document = context.getDocument();
    const fragments = new Map<string, FragmentDefinitionNode>();
    for (const def of document.definitions) {
      if (def.kind === Kind.FRAGMENT_DEFINITION) {
        fragments.set(def.name.value, def);
      }
    }
    const schema = context.getSchema();

    // Cheap, linear guard run before any expansion.
    let spreads = 0;
    visit(document, {
      FragmentSpread() {
        spreads += 1;
      },
    });
    if (spreads > maxSpreads) {
      context.reportError(
        new GraphQLError(
          `Document uses ${spreads} fragment spreads; the maximum allowed is ${maxSpreads}`
        )
      );
      return {};
    }

    return {
      OperationDefinition(node: OperationNode) {
        // A variable page size is client-controlled (and validation runs
        // before variables are coerced), so it is costed at the server cap.
        const argSize = (arg: ArgumentNode): number | undefined =>
          arg.value.kind === Kind.INT
            ? parseInt(arg.value.value, 10)
            : undefined;

        const listSize = (field: FieldNode, hasPageArg: boolean): number => {
          const cap = FIELD_PAGE_CAPS[field.name.value] ?? MAX_PAGE_SIZE;
          if (!hasPageArg) return DEFAULT_LIST_SIZE;
          for (const arg of field.arguments ?? []) {
            if (PAGE_ARGS.includes(arg.name.value)) {
              const n = argSize(arg);
              // only a literal is trusted; `$var` / null get the server cap.
              if (n !== undefined && Number.isFinite(n)) {
                return Math.min(Math.max(n, 1), cap);
              }
            }
          }
          return cap;
        };

        // Memoised per fragment: cost/aliases depend only on the fragment name.
        const memo = new Map<string, Tally>();
        const visiting = new Set<string>();

        const walk = (
          selectionSet: SelectionSetNode | undefined,
          parent: GraphQLCompositeType | undefined
        ): Tally => {
          const out: Tally = { cost: 0, aliases: 0 };
          if (!selectionSet) return out;
          for (const sel of selectionSet.selections) {
            if (sel.kind === Kind.FIELD) {
              if (sel.name.value.startsWith('__')) continue;
              if (sel.alias) out.aliases += 1;
              let def: GraphQLField<unknown, unknown> | undefined;
              if (parent && 'getFields' in parent) {
                def = parent.getFields()[sel.name.value];
              }
              const named = def ? getNamedType(def.type) : undefined;
              const child = walk(
                sel.selectionSet,
                named && isCompositeType(named) ? named : undefined
              );
              const multiplier =
                def && isListType(getNullableType(def.type))
                  ? listSize(
                      sel,
                      def.args.some(a => PAGE_ARGS.includes(a.name))
                    )
                  : 1;
              let loadCost = 0;
              if (
                parent === schema.getQueryType() &&
                RELATION_HEAVY_FIELDS.has(sel.name.value) &&
                !isLiteralTrue(sel, 'lightweight')
              ) {
                loadCost =
                  multiplier *
                  RELATION_ROW_COST *
                  heavyRelationCount(planRoomLoad(sel, n => fragments.get(n)));
              }
              out.cost += 1 + loadCost + multiplier * child.cost;
              out.aliases += child.aliases;
            } else if (sel.kind === Kind.INLINE_FRAGMENT) {
              const on = sel.typeCondition
                ? schema.getType(sel.typeCondition.name.value)
                : parent;
              const t = walk(
                sel.selectionSet,
                on && isCompositeType(on) ? on : parent
              );
              out.cost += t.cost;
              out.aliases += t.aliases;
            } else {
              const name = sel.name.value;
              const frag = fragments.get(name);
              if (!frag || visiting.has(name)) continue;
              let t = memo.get(name);
              if (!t) {
                visiting.add(name);
                const on = schema.getType(frag.typeCondition.name.value);
                t = walk(
                  frag.selectionSet,
                  on && isCompositeType(on) ? on : parent
                );
                visiting.delete(name);
                memo.set(name, t);
              }
              out.cost += t.cost;
              out.aliases += t.aliases;
            }
          }
          return out;
        };

        const root =
          node.operation === 'mutation'
            ? schema.getMutationType()
            : node.operation === 'subscription'
              ? schema.getSubscriptionType()
              : schema.getQueryType();
        const { cost, aliases } = walk(node.selectionSet, root ?? undefined);
        if (aliases > maxAliases) {
          context.reportError(
            new GraphQLError(
              `Operation uses ${aliases} aliases; the maximum allowed is ${maxAliases}`,
              { nodes: [node as ASTNode] }
            )
          );
        }
        if (cost > maxCost) {
          context.reportError(
            new GraphQLError(
              `Operation cost ${cost} exceeds the maximum allowed cost of ${maxCost}`,
              { nodes: [node as ASTNode] }
            )
          );
        }
      },
    };
  };
}
