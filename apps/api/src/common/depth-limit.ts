import {
  GraphQLError,
  Kind,
  type ASTNode,
  type FragmentDefinitionNode,
  type SelectionSetNode,
  type ValidationContext,
  type ValidationRule,
} from 'graphql';

export const MAX_QUERY_DEPTH = 10;

/**
 * GraphQL validation rule rejecting operations nested deeper than `maxDepth`.
 * Follows fragment spreads / inline fragments; introspection fields (`__*`) are
 * not counted so tooling such as Apollo Sandbox keeps working in non-production.
 */
export function depthLimit(maxDepth: number = MAX_QUERY_DEPTH): ValidationRule {
  return (context: ValidationContext) => {
    const fragments = new Map<string, FragmentDefinitionNode>();
    for (const def of context.getDocument().definitions) {
      if (def.kind === Kind.FRAGMENT_DEFINITION) {
        fragments.set(def.name.value, def);
      }
    }

    // Depth of a fragment's own selection set, relative to where it is spread.
    // Memoised so nested double-spreading fragments cost O(fragments), not 2^n.
    const memo = new Map<string, number>();
    const visiting = new Set<string>();

    const selectionDepth = (
      selectionSet: SelectionSetNode | undefined,
      depth: number
    ): number => {
      if (!selectionSet) return depth;
      let max = depth;
      for (const sel of selectionSet.selections) {
        if (sel.kind === Kind.FIELD) {
          if (sel.name.value.startsWith('__')) continue;
          max = Math.max(max, selectionDepth(sel.selectionSet, depth + 1));
        } else if (sel.kind === Kind.INLINE_FRAGMENT) {
          max = Math.max(max, selectionDepth(sel.selectionSet, depth));
        } else {
          const name = sel.name.value;
          const frag = fragments.get(name);
          if (!frag || visiting.has(name)) continue;
          let rel = memo.get(name);
          if (rel === undefined) {
            visiting.add(name);
            rel = selectionDepth(frag.selectionSet, 0);
            visiting.delete(name);
            memo.set(name, rel);
          }
          max = Math.max(max, depth + rel);
        }
      }
      return max;
    };

    return {
      OperationDefinition(node: ASTNode & { selectionSet: SelectionSetNode }) {
        const depth = selectionDepth(node.selectionSet, 0);
        if (depth > maxDepth) {
          context.reportError(
            new GraphQLError(
              `Query depth ${depth} exceeds the maximum allowed depth of ${maxDepth}`,
              { nodes: [node] }
            )
          );
        }
      },
    };
  };
}
