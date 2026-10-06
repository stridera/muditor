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

    const selectionDepth = (
      selectionSet: SelectionSetNode | undefined,
      depth: number,
      visiting: Set<string>
    ): number => {
      if (!selectionSet) return depth;
      let max = depth;
      for (const sel of selectionSet.selections) {
        if (sel.kind === Kind.FIELD) {
          if (sel.name.value.startsWith('__')) continue;
          max = Math.max(
            max,
            selectionDepth(sel.selectionSet, depth + 1, visiting)
          );
        } else if (sel.kind === Kind.INLINE_FRAGMENT) {
          max = Math.max(
            max,
            selectionDepth(sel.selectionSet, depth, visiting)
          );
        } else {
          const name = sel.name.value;
          const frag = fragments.get(name);
          if (!frag || visiting.has(name)) continue;
          visiting.add(name);
          max = Math.max(
            max,
            selectionDepth(frag.selectionSet, depth, visiting)
          );
          visiting.delete(name);
        }
      }
      return max;
    };

    return {
      OperationDefinition(node: ASTNode & { selectionSet: SelectionSetNode }) {
        const depth = selectionDepth(node.selectionSet, 0, new Set());
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
