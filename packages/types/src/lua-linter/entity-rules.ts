/**
 * Entity reference validation rules (API-side only).
 *
 * Walks the AST looking for calls to entity-referencing functions
 * with numeric literal arguments, and checks them against a database.
 */

import type {
  Chunk,
  Statement,
  Expression,
  CallExpression,
  MemberExpression,
} from 'luaparse';
import type { LuaLintIssue, EntityDatabase } from './types';

/** Functions that reference entities, with their expected entity type. */
interface EntityCallPattern {
  /** 'room', 'mob', or 'object' — what the IDs refer to */
  entityType: keyof EntityDatabase;
  /** Which argument index is zone_id (0-based) */
  zoneArgIndex: number;
  /** Which argument index is local_id (0-based) */
  idArgIndex: number;
}

/**
 * Global function patterns: `func(zone_id, local_id)`
 */
const GLOBAL_PATTERNS: Record<string, EntityCallPattern> = {
  get_room: { entityType: 'rooms', zoneArgIndex: 0, idArgIndex: 1 },
  run_room_trigger: { entityType: 'rooms', zoneArgIndex: 0, idArgIndex: 1 },
};

/**
 * Method call patterns: `base:method(zone_id, local_id)`
 * We match on method name regardless of base (since we can't always know the type).
 */
const METHOD_PATTERNS: Record<string, EntityCallPattern> = {
  spawn_mobile: { entityType: 'mobs', zoneArgIndex: 0, idArgIndex: 1 },
  spawn_object: { entityType: 'objects', zoneArgIndex: 0, idArgIndex: 1 },
  has_item_id: { entityType: 'objects', zoneArgIndex: 0, idArgIndex: 1 },
  has_equipped: { entityType: 'objects', zoneArgIndex: 0, idArgIndex: 1 },
};

/**
 * Namespace call patterns: `namespace.method(zone_id, local_id)`
 */
const NAMESPACE_PATTERNS: Record<string, Record<string, EntityCallPattern>> = {
  world: {
    count_mobiles: { entityType: 'mobs', zoneArgIndex: 0, idArgIndex: 1 },
    count_objects: { entityType: 'objects', zoneArgIndex: 0, idArgIndex: 1 },
  },
  objects: {
    template: { entityType: 'objects', zoneArgIndex: 0, idArgIndex: 1 },
  },
  mobiles: {
    template: { entityType: 'mobs', zoneArgIndex: 0, idArgIndex: 1 },
  },
};

const ENTITY_TYPE_LABELS: Record<keyof EntityDatabase, string> = {
  rooms: 'room',
  mobs: 'mob',
  objects: 'object',
};

export function runEntityRules(
  ast: Chunk,
  entities: EntityDatabase
): LuaLintIssue[] {
  const issues: LuaLintIssue[] = [];

  function checkCall(expr: CallExpression, pattern: EntityCallPattern): void {
    const args = expr.arguments;
    const zoneArg = args[pattern.zoneArgIndex];
    const idArg = args[pattern.idArgIndex];

    if (!zoneArg || !idArg) return;
    if (zoneArg.type !== 'NumericLiteral' || idArg.type !== 'NumericLiteral')
      return;

    const key = `${zoneArg.value}:${idArg.value}`;
    const entitySet = entities[pattern.entityType];
    if (!entitySet.has(key)) {
      const label = ENTITY_TYPE_LABELS[pattern.entityType];
      const line = expr.loc?.start.line ?? 1;
      const column = (expr.loc?.start.column ?? 0) + 1;
      const endColumn = (expr.loc?.end.column ?? 0) + 1;
      issues.push({
        line,
        column,
        endColumn,
        severity: 'warning',
        message: `No ${label} found with ID ${zoneArg.value}:${idArg.value}`,
        rule: 'entity-not-found',
      });
    }
  }

  function walkExpression(expr: Expression): void {
    switch (expr.type) {
      case 'CallExpression':
        walkCallExpression(expr);
        break;
      case 'MemberExpression':
        walkExpression(expr.base);
        break;
      case 'IndexExpression':
        walkExpression(expr.base);
        walkExpression(expr.index);
        break;
      case 'BinaryExpression':
      case 'LogicalExpression':
        walkExpression(expr.left);
        walkExpression(expr.right);
        break;
      case 'UnaryExpression':
        walkExpression(expr.argument);
        break;
      case 'TableConstructorExpression':
        for (const field of expr.fields) {
          if (field.type === 'TableKey') {
            walkExpression(field.key);
            walkExpression(field.value);
          } else if (field.type === 'TableKeyString') {
            walkExpression(field.value);
          } else if (field.type === 'TableValue') {
            walkExpression(field.value);
          }
        }
        break;
      case 'FunctionDeclaration':
        walkBody(expr.body);
        break;
      case 'StringCallExpression':
        walkExpression(expr.base);
        break;
      case 'TableCallExpression':
        walkExpression(expr.base);
        walkExpression(expr.arguments);
        break;
    }
  }

  function walkCallExpression(expr: CallExpression): void {
    // Walk arguments recursively
    for (const a of expr.arguments) walkExpression(a);
    walkExpression(expr.base);

    const base = expr.base;

    // Global call: get_room(z, id)
    if (base.type === 'Identifier') {
      const pattern = GLOBAL_PATTERNS[base.name];
      if (pattern) checkCall(expr, pattern);
    }

    // Method call: room:spawn_mobile(z, id)
    if (base.type === 'MemberExpression') {
      const methodName = base.identifier.name;

      // Method patterns (via `:`)
      if (base.indexer === ':') {
        const pattern = METHOD_PATTERNS[methodName];
        if (pattern) checkCall(expr, pattern);
      }

      // Namespace patterns (via `.`)
      if (base.indexer === '.' && base.base.type === 'Identifier') {
        const nsName = base.base.name;
        const nsPatterns = NAMESPACE_PATTERNS[nsName];
        if (nsPatterns) {
          const pattern = nsPatterns[methodName];
          if (pattern) checkCall(expr, pattern);
        }
      }
    }
  }

  function walkStatement(stmt: Statement): void {
    switch (stmt.type) {
      case 'LocalStatement':
        for (const init of stmt.init) walkExpression(init);
        break;
      case 'AssignmentStatement':
        for (const v of stmt.variables) walkExpression(v);
        for (const init of stmt.init) walkExpression(init);
        break;
      case 'CallStatement':
        walkExpression(stmt.expression);
        break;
      case 'ReturnStatement':
        for (const a of stmt.arguments) walkExpression(a);
        break;
      case 'IfStatement':
        for (const clause of stmt.clauses) {
          if (clause.type !== 'ElseClause') walkExpression(clause.condition);
          walkBody(clause.body);
        }
        break;
      case 'WhileStatement':
        walkExpression(stmt.condition);
        walkBody(stmt.body);
        break;
      case 'RepeatStatement':
        walkBody(stmt.body);
        walkExpression(stmt.condition);
        break;
      case 'ForNumericStatement':
        walkExpression(stmt.start);
        walkExpression(stmt.end);
        if (stmt.step) walkExpression(stmt.step);
        walkBody(stmt.body);
        break;
      case 'ForGenericStatement':
        for (const iter of stmt.iterators) walkExpression(iter);
        walkBody(stmt.body);
        break;
      case 'DoStatement':
        walkBody(stmt.body);
        break;
      case 'FunctionDeclaration':
        walkBody(stmt.body);
        break;
    }
  }

  function walkBody(body: Statement[]): void {
    for (const s of body) walkStatement(s);
  }

  walkBody(ast.body);
  return issues;
}
