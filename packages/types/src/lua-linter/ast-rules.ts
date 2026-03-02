/**
 * AST-based lint rules using luaparse.
 */

import type {
  Chunk,
  Statement,
  Expression,
  Identifier,
  WhileStatement,
  ForNumericStatement,
  ForGenericStatement,
  RepeatStatement,
  FunctionDeclaration,
  LocalStatement,
  AssignmentStatement,
  CallExpression,
  MemberExpression,
  IfStatement,
  DoStatement,
  Node,
} from 'luaparse';
import {
  getAllKnownGlobals,
  NAMESPACE_MEMBERS,
  ENUM_MEMBERS,
  LUA_LIBRARY_MEMBERS,
  CONTEXT_VAR_TYPES,
  USERTYPE_PROPERTIES,
  USERTYPE_METHODS,
  type UsertypeName,
} from '../lua-api-surface';
import type { LuaLintIssue } from './types';

const KNOWN_GLOBALS = getAllKnownGlobals();

// ---------------------------------------------------------------------------
// Scope tracking
// ---------------------------------------------------------------------------

interface Scope {
  type: 'top' | 'function' | 'while' | 'for' | 'repeat' | 'do' | 'if';
  locals: Map<string, { line: number; column: number; used: boolean }>;
  /** For loops: condition variables that should be modified */
  conditionVars: Set<string>;
  /** For while loops: whether we saw wait() */
  hasWait: boolean;
  /** For while true loops */
  isWhileTrue: boolean;
  /** Variables assigned (non-local) in this scope */
  assigned: Set<string>;
}

function createScope(type: Scope['type'], extras?: Partial<Scope>): Scope {
  return {
    type,
    locals: new Map(),
    conditionVars: new Set(),
    hasWait: false,
    isWhileTrue: false,
    assigned: new Set(),
    ...extras,
  };
}

// ---------------------------------------------------------------------------
// AST walker
// ---------------------------------------------------------------------------

export function runAstRules(ast: Chunk): LuaLintIssue[] {
  const issues: LuaLintIssue[] = [];
  const scopes: Scope[] = [createScope('top')];

  function currentScope(): Scope {
    return scopes[scopes.length - 1]!;
  }

  function isInLoop(): boolean {
    return scopes.some(
      s => s.type === 'while' || s.type === 'for' || s.type === 'repeat'
    );
  }

  function innermostLoop(): Scope | undefined {
    for (let i = scopes.length - 1; i >= 0; i--) {
      const s = scopes[i]!;
      if (s.type === 'while' || s.type === 'for' || s.type === 'repeat') {
        return s;
      }
    }
    return undefined;
  }

  function isLocalVisible(name: string): boolean {
    for (let i = scopes.length - 1; i >= 0; i--) {
      if (scopes[i]!.locals.has(name)) return true;
    }
    return false;
  }

  function markUsed(name: string): void {
    for (let i = scopes.length - 1; i >= 0; i--) {
      const entry = scopes[i]!.locals.get(name);
      if (entry) {
        entry.used = true;
        return;
      }
    }
  }

  function resolveLocalType(name: string): UsertypeName | undefined {
    // If it's a known context variable, return its type
    return CONTEXT_VAR_TYPES[name];
  }

  function loc(node: Node): { line: number; column: number } {
    if (node.loc) {
      return { line: node.loc.start.line, column: node.loc.start.column + 1 };
    }
    return { line: 1, column: 1 };
  }

  function endCol(node: Node): number {
    if (node.loc) {
      return node.loc.end.column + 1;
    }
    return 1;
  }

  // Check if an expression is the boolean literal `true`
  function isTrueLiteral(expr: Expression): boolean {
    return expr.type === 'BooleanLiteral' && expr.value === true;
  }

  // Check if a statement body contains a wait() call
  function bodyHasWait(body: Statement[]): boolean {
    let found = false;
    function walk(stmts: Statement[]): void {
      for (const s of stmts) {
        if (found) return;
        if (
          s.type === 'CallStatement' &&
          s.expression.type === 'CallExpression' &&
          s.expression.base.type === 'Identifier' &&
          s.expression.base.name === 'wait'
        ) {
          found = true;
          return;
        }
        // Walk child bodies
        if (s.type === 'IfStatement') {
          for (const clause of s.clauses) {
            walk(clause.body);
          }
        } else if (
          s.type === 'WhileStatement' ||
          s.type === 'RepeatStatement' ||
          s.type === 'DoStatement'
        ) {
          walk(s.body);
        } else if (
          s.type === 'ForNumericStatement' ||
          s.type === 'ForGenericStatement'
        ) {
          walk(s.body);
        }
      }
    }
    walk(body);
    return found;
  }

  // Extract all identifiers referenced in an expression
  function extractIdentifiers(expr: Expression): string[] {
    const ids: string[] = [];
    function walk(e: Expression): void {
      switch (e.type) {
        case 'Identifier':
          ids.push(e.name);
          break;
        case 'BinaryExpression':
        case 'LogicalExpression':
          walk(e.left);
          walk(e.right);
          break;
        case 'UnaryExpression':
          walk(e.argument);
          break;
        case 'MemberExpression':
          walk(e.base);
          break;
        case 'CallExpression':
          walk(e.base);
          for (const a of e.arguments) walk(a);
          break;
        case 'IndexExpression':
          walk(e.base);
          walk(e.index);
          break;
      }
    }
    walk(expr);
    return ids;
  }

  // Check whether a body assigns to a given variable
  function bodyAssignsVar(body: Statement[], varName: string): boolean {
    for (const s of body) {
      if (s.type === 'AssignmentStatement') {
        for (const v of s.variables) {
          if (v.type === 'Identifier' && v.name === varName) return true;
        }
      }
      // Recurse into sub-bodies
      if (s.type === 'IfStatement') {
        for (const clause of s.clauses) {
          if (bodyAssignsVar(clause.body, varName)) return true;
        }
      } else if (
        s.type === 'WhileStatement' ||
        s.type === 'RepeatStatement' ||
        s.type === 'DoStatement'
      ) {
        if (bodyAssignsVar(s.body, varName)) return true;
      } else if (
        s.type === 'ForNumericStatement' ||
        s.type === 'ForGenericStatement'
      ) {
        if (bodyAssignsVar(s.body, varName)) return true;
      }
    }
    return false;
  }

  // ----- Member access validation -----
  function checkMemberAccess(expr: MemberExpression): void {
    const { base, identifier, indexer } = expr;
    if (base.type !== 'Identifier') return;
    const baseName = base.name;
    const memberName = identifier.name;

    // Skip `globals` table — arbitrary keys allowed
    if (baseName === 'globals') return;

    // Namespace check (world.find_player, etc.)
    const nsMethods = NAMESPACE_MEMBERS[baseName];
    if (nsMethods) {
      if (!nsMethods.has(memberName)) {
        const { line, column } = loc(identifier);
        issues.push({
          line,
          column,
          endColumn: column + memberName.length,
          severity: 'warning',
          message: `\`${baseName}\` has no member \`${memberName}\``,
          rule: 'unknown-member',
        });
      }
      return;
    }

    // Enum check (Position.Standing, etc.)
    const enumValues = ENUM_MEMBERS[baseName];
    if (enumValues) {
      if (!enumValues.has(memberName)) {
        const { line, column } = loc(identifier);
        issues.push({
          line,
          column,
          endColumn: column + memberName.length,
          severity: 'warning',
          message: `\`${baseName}\` has no value \`${memberName}\``,
          rule: 'unknown-member',
        });
      }
      return;
    }

    // Lua library check (string.format, math.floor, etc.)
    const libMembers = LUA_LIBRARY_MEMBERS[baseName];
    if (libMembers) {
      if (!libMembers.has(memberName)) {
        const { line, column } = loc(identifier);
        issues.push({
          line,
          column,
          endColumn: column + memberName.length,
          severity: 'warning',
          message: `\`${baseName}\` has no member \`${memberName}\``,
          rule: 'unknown-member',
        });
      }
      return;
    }

    // Usertype check — only validate known context variables
    const usertype = resolveLocalType(baseName);
    if (usertype) {
      const properties = USERTYPE_PROPERTIES[usertype];
      const methods = USERTYPE_METHODS[usertype];
      if (indexer === ':') {
        if (!methods.has(memberName)) {
          const { line, column } = loc(identifier);
          issues.push({
            line,
            column,
            endColumn: column + memberName.length,
            severity: 'warning',
            message: `\`${baseName}\` (${usertype}) has no method \`${memberName}\``,
            rule: 'unknown-member',
          });
        }
      } else {
        // `.` could be property or method used as value
        if (!properties.has(memberName) && !methods.has(memberName)) {
          const { line, column } = loc(identifier);
          issues.push({
            line,
            column,
            endColumn: column + memberName.length,
            severity: 'warning',
            message: `\`${baseName}\` (${usertype}) has no property \`${memberName}\``,
            rule: 'unknown-member',
          });
        }
      }
    }
    // If base is an unknown local, skip — we can't validate without type info
  }

  // ----- Global identifier check -----
  function checkGlobalIdentifier(name: string, node: Node): void {
    if (isLocalVisible(name)) return;
    if (KNOWN_GLOBALS.has(name)) return;
    // Lua keywords that appear as identifiers (true, false, nil are handled by parser)
    if (name === 'true' || name === 'false' || name === 'nil') return;

    const { line, column } = loc(node);
    issues.push({
      line,
      column,
      endColumn: column + name.length,
      severity: 'warning',
      message: `\`${name}\` is not a known global, namespace, or context variable`,
      rule: 'undefined-global',
    });
  }

  // ----- Expression walker -----
  function walkExpression(expr: Expression): void {
    switch (expr.type) {
      case 'Identifier':
        markUsed(expr.name);
        checkGlobalIdentifier(expr.name, expr);
        break;

      case 'MemberExpression':
        walkExpression(expr.base);
        checkMemberAccess(expr);
        break;

      case 'IndexExpression':
        walkExpression(expr.base);
        walkExpression(expr.index);
        break;

      case 'CallExpression':
        walkExpression(expr.base);
        for (const a of expr.arguments) walkExpression(a);
        break;

      case 'StringCallExpression':
        walkExpression(expr.base);
        break;

      case 'TableCallExpression':
        walkExpression(expr.base);
        walkExpression(expr.arguments);
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
        walkFunction(expr);
        break;

      // Literals — no-op
      case 'StringLiteral':
      case 'NumericLiteral':
      case 'BooleanLiteral':
      case 'NilLiteral':
      case 'VarargLiteral':
        break;
    }
  }

  // ----- Statement walker -----
  function walkStatement(stmt: Statement): void {
    switch (stmt.type) {
      case 'LocalStatement':
        walkLocalStatement(stmt);
        break;

      case 'AssignmentStatement':
        walkAssignmentStatement(stmt);
        break;

      case 'CallStatement':
        walkExpression(stmt.expression);
        break;

      case 'ReturnStatement':
        for (const a of stmt.arguments) walkExpression(a);
        break;

      case 'IfStatement':
        walkIfStatement(stmt);
        break;

      case 'WhileStatement':
        walkWhileStatement(stmt);
        break;

      case 'RepeatStatement':
        walkRepeatStatement(stmt);
        break;

      case 'ForNumericStatement':
        walkForNumericStatement(stmt);
        break;

      case 'ForGenericStatement':
        walkForGenericStatement(stmt);
        break;

      case 'DoStatement':
        walkDoStatement(stmt);
        break;

      case 'FunctionDeclaration':
        walkFunction(stmt);
        break;

      case 'BreakStatement':
      case 'GotoStatement':
      case 'LabelStatement':
        break;
    }
  }

  function walkBody(body: Statement[]): void {
    for (const s of body) walkStatement(s);
  }

  function walkLocalStatement(stmt: LocalStatement): void {
    const scope = currentScope();

    // Walk init expressions first (they reference the outer scope)
    for (const init of stmt.init) walkExpression(init);

    for (let i = 0; i < stmt.variables.length; i++) {
      const v = stmt.variables[i]!;
      const name = v.name;
      const hasInit = i < stmt.init.length;

      // Rule: shadow-in-loop
      if (isInLoop() && hasInit) {
        const initExpr = stmt.init[i]!;
        const initIds = extractIdentifiers(initExpr);
        if (
          initIds.includes(name) &&
          isLocalVisible(name) &&
          !scope.locals.has(name)
        ) {
          const { line, column } = loc(v);
          issues.push({
            line,
            column,
            endColumn: endCol(stmt),
            severity: 'error',
            message: `\`local ${name} = ${name} ...\` shadows the outer variable — the loop will always use the initial value. Did you mean \`${name} = ${name} + ...\` (without \`local\`)?`,
            rule: 'shadow-in-loop',
          });
        }
      }

      // Rule: shadow-loop-condition
      const loop = innermostLoop();
      if (loop && loop.conditionVars.has(name) && scope !== loop) {
        // Don't double-report
        const alreadyReported = issues.some(
          iss => iss.line === loc(v).line && iss.rule === 'shadow-in-loop'
        );
        if (!alreadyReported) {
          const { line, column } = loc(v);
          issues.push({
            line,
            column,
            endColumn: column + name.length,
            severity: 'warning',
            message: `\`local ${name}\` shadows the loop condition variable — the loop condition will not see changes to this variable`,
            rule: 'shadow-loop-condition',
          });
        }
      }

      // Register in current scope
      const { line, column } = loc(v);
      scope.locals.set(name, {
        line,
        column,
        used: false,
      });
    }
  }

  function walkAssignmentStatement(stmt: AssignmentStatement): void {
    // Walk RHS first
    for (const init of stmt.init) walkExpression(init);
    // Walk LHS (may contain member expressions, index expressions)
    for (const v of stmt.variables) {
      if (v.type === 'Identifier') {
        markUsed(v.name);
        // Don't check globals for assignment targets — they might be creating globals intentionally
      } else {
        walkExpression(v);
      }
    }
  }

  function walkIfStatement(stmt: IfStatement): void {
    for (const clause of stmt.clauses) {
      if (clause.type === 'IfClause' || clause.type === 'ElseifClause') {
        walkExpression(clause.condition);
      }
      scopes.push(createScope('if'));
      walkBody(clause.body);
      emitUnusedVars(scopes.pop()!);
    }
  }

  function walkWhileStatement(stmt: WhileStatement): void {
    const isTrue = isTrueLiteral(stmt.condition);
    const condVars = new Set(extractIdentifiers(stmt.condition));

    walkExpression(stmt.condition);

    const scope = createScope('while', {
      isWhileTrue: isTrue,
      conditionVars: condVars,
    });
    scopes.push(scope);
    walkBody(stmt.body);

    // Rule: while-true-no-wait
    if (isTrue && !bodyHasWait(stmt.body)) {
      const { line, column } = loc(stmt);
      issues.push({
        line,
        column,
        endColumn: column + 10, // "while true"
        severity: 'warning',
        message:
          '`while true` loop without `wait()` may cause an infinite loop and crash the server',
        rule: 'while-true-no-wait',
      });
    }

    // Rule: condition-var-never-modified
    if (!isTrue && condVars.size > 0) {
      for (const v of condVars) {
        if (!bodyAssignsVar(stmt.body, v)) {
          const { line, column } = loc(stmt);
          issues.push({
            line,
            column,
            endColumn: endCol(stmt),
            severity: 'warning',
            message: `Loop condition variable \`${v}\` is never modified inside the loop body — this may be an infinite loop`,
            rule: 'condition-var-never-modified',
          });
        }
      }
    }

    emitUnusedVars(scopes.pop()!);
  }

  function walkRepeatStatement(stmt: RepeatStatement): void {
    const scope = createScope('repeat');
    scopes.push(scope);
    walkBody(stmt.body);
    walkExpression(stmt.condition);
    emitUnusedVars(scopes.pop()!);
  }

  function walkForNumericStatement(stmt: ForNumericStatement): void {
    walkExpression(stmt.start);
    walkExpression(stmt.end);
    if (stmt.step) walkExpression(stmt.step);

    const varName = stmt.variable.name;
    const scope = createScope('for', {
      conditionVars: new Set([varName]),
    });
    const { line, column } = loc(stmt.variable);
    scope.locals.set(varName, { line, column, used: false });
    scopes.push(scope);
    walkBody(stmt.body);
    emitUnusedVars(scopes.pop()!, new Set([varName]));
  }

  function walkForGenericStatement(stmt: ForGenericStatement): void {
    for (const iter of stmt.iterators) walkExpression(iter);

    const scope = createScope('for');
    for (const v of stmt.variables) {
      const { line, column } = loc(v);
      scope.locals.set(v.name, { line, column, used: false });
    }
    scopes.push(scope);
    walkBody(stmt.body);
    const iterVarNames = new Set(stmt.variables.map(v => v.name));
    emitUnusedVars(scopes.pop()!, iterVarNames);
  }

  function walkDoStatement(stmt: DoStatement): void {
    scopes.push(createScope('do'));
    walkBody(stmt.body);
    emitUnusedVars(scopes.pop()!);
  }

  function walkFunction(stmt: FunctionDeclaration): void {
    // If it has an identifier, it may be a named function declaration
    if (stmt.identifier) {
      if (stmt.isLocal && stmt.identifier.type === 'Identifier') {
        const scope = currentScope();
        const { line, column } = loc(stmt.identifier);
        scope.locals.set(stmt.identifier.name, {
          line,
          column,
          used: false,
        });
      } else if (stmt.identifier.type === 'MemberExpression') {
        walkExpression(stmt.identifier.base);
      }
    }

    const scope = createScope('function');
    // Register parameters
    for (const p of stmt.parameters) {
      if (p.type === 'Identifier') {
        const { line, column } = loc(p);
        scope.locals.set(p.name, { line, column, used: true }); // params are considered "used"
      }
    }
    scopes.push(scope);
    walkBody(stmt.body);
    emitUnusedVars(scopes.pop()!);
  }

  function emitUnusedVars(scope: Scope, skipNames?: Set<string>): void {
    for (const [name, entry] of scope.locals) {
      if (entry.used) continue;
      if (name.startsWith('_')) continue; // convention: _foo means intentionally unused
      if (skipNames?.has(name)) continue; // loop variables
      issues.push({
        line: entry.line,
        column: entry.column,
        endColumn: entry.column + name.length,
        severity: 'warning',
        message: `Variable \`${name}\` is declared but never used`,
        rule: 'unused-variable',
      });
    }
  }

  // ----- Entry point -----
  walkBody(ast.body);
  // Check unused in top scope
  emitUnusedVars(scopes.pop()!);

  return issues;
}
