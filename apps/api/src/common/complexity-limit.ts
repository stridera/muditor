import {
  GraphQLError,
  Kind,
  getNamedType,
  isListType,
  getNullableType,
  isCompositeType,
  type ASTNode,
  type FieldNode,
  type FragmentDefinitionNode,
  type GraphQLCompositeType,
  type GraphQLField,
  type SelectionSetNode,
  type ValidationContext,
  type ValidationRule,
} from 'graphql';

/** Most aliased fields one operation may contain (alias-flooding guard). */
export const MAX_QUERY_ALIASES = 15;
/** Most estimated cost one operation may have (see `complexityLimit`). */
export const MAX_QUERY_COST = 20000;
/** Assumed size of a list field when the query gives no literal page size. */
const DEFAULT_LIST_SIZE = 10;
/** Cap on a literal page size so `take: 1000000` can't hide behind a limit. */
const MAX_LIST_SIZE = 100;
const PAGE_ARGS = ['take', 'first', 'limit'];

export interface ComplexityLimits {
  maxAliases?: number;
  maxCost?: number;
}

type OperationNode = ASTNode & { selectionSet: SelectionSetNode };

/**
 * Validation rule that stops anonymous request amplification:
 *  - at most `maxAliases` aliased fields per operation (one request can't ask
 *    for the same expensive root query a thousand times under different names);
 *  - an estimated cost: every field costs 1, and the selection beneath a list
 *    field is multiplied by its page size (`take`/`first`/`limit` when given as
 *    a literal, else 10). Fragments are expanded; introspection is free.
 */
export function complexityLimit(limits: ComplexityLimits = {}): ValidationRule {
  const maxAliases = limits.maxAliases ?? MAX_QUERY_ALIASES;
  const maxCost = limits.maxCost ?? MAX_QUERY_COST;

  return (context: ValidationContext) => {
    const fragments = new Map<string, FragmentDefinitionNode>();
    for (const def of context.getDocument().definitions) {
      if (def.kind === Kind.FRAGMENT_DEFINITION) {
        fragments.set(def.name.value, def);
      }
    }
    const schema = context.getSchema();

    const listSize = (field: FieldNode): number => {
      for (const arg of field.arguments ?? []) {
        if (PAGE_ARGS.includes(arg.name.value) && arg.value.kind === Kind.INT) {
          const n = parseInt(arg.value.value, 10);
          if (Number.isFinite(n))
            return Math.min(Math.max(n, 1), MAX_LIST_SIZE);
        }
      }
      return DEFAULT_LIST_SIZE;
    };

    const walk = (
      selectionSet: SelectionSetNode | undefined,
      parent: GraphQLCompositeType | undefined,
      visiting: Set<string>,
      tally: { aliases: number }
    ): number => {
      if (!selectionSet) return 0;
      let cost = 0;
      for (const sel of selectionSet.selections) {
        if (sel.kind === Kind.FIELD) {
          if (sel.name.value.startsWith('__')) continue;
          if (sel.alias) tally.aliases += 1;
          let def: GraphQLField<unknown, unknown> | undefined;
          if (parent && 'getFields' in parent) {
            def = parent.getFields()[sel.name.value];
          }
          const named = def ? getNamedType(def.type) : undefined;
          const child = walk(
            sel.selectionSet,
            named && isCompositeType(named) ? named : undefined,
            visiting,
            tally
          );
          const multiplier =
            def && isListType(getNullableType(def.type)) ? listSize(sel) : 1;
          cost += 1 + multiplier * child;
        } else if (sel.kind === Kind.INLINE_FRAGMENT) {
          const on = sel.typeCondition
            ? schema.getType(sel.typeCondition.name.value)
            : parent;
          cost += walk(
            sel.selectionSet,
            on && isCompositeType(on) ? on : parent,
            visiting,
            tally
          );
        } else {
          const name = sel.name.value;
          const frag = fragments.get(name);
          if (!frag || visiting.has(name)) continue;
          visiting.add(name);
          const on = schema.getType(frag.typeCondition.name.value);
          cost += walk(
            frag.selectionSet,
            on && isCompositeType(on) ? on : parent,
            visiting,
            tally
          );
          visiting.delete(name);
        }
      }
      return cost;
    };

    return {
      OperationDefinition(node: OperationNode & { operation: string }) {
        const root =
          node.operation === 'mutation'
            ? schema.getMutationType()
            : node.operation === 'subscription'
              ? schema.getSubscriptionType()
              : schema.getQueryType();
        const tally = { aliases: 0 };
        const cost = walk(
          node.selectionSet,
          root ?? undefined,
          new Set(),
          tally
        );
        if (tally.aliases > maxAliases) {
          context.reportError(
            new GraphQLError(
              `Operation uses ${tally.aliases} aliases; the maximum allowed is ${maxAliases}`,
              { nodes: [node] }
            )
          );
        }
        if (cost > maxCost) {
          context.reportError(
            new GraphQLError(
              `Operation cost ${cost} exceeds the maximum allowed cost of ${maxCost}`,
              { nodes: [node] }
            )
          );
        }
      },
    };
  };
}
