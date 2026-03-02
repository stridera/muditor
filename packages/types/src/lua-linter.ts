/**
 * Lua script linter for Muditor.
 *
 * AST-based analysis using luaparse — catches syntax errors, undefined globals,
 * DG Script remnants, variable shadowing, unused variables, and more.
 */

import * as luaparse from 'luaparse';
import { runAstRules } from './lua-linter/ast-rules';
import { runDgRemnantRules } from './lua-linter/dg-remnant-rules';
import { runEntityRules } from './lua-linter/entity-rules';

export type {
  LuaLintSeverity,
  LuaLintIssue,
  EntityDatabase,
} from './lua-linter/types';
import type { LuaLintIssue, EntityDatabase } from './lua-linter/types';

/**
 * Lint Lua source code for common dangerous patterns.
 *
 * Returns an array of issues sorted by line number.
 * Runs in the browser (Monaco) and on the API (on-save).
 */
export function lintLua(code: string): LuaLintIssue[] {
  const issues: LuaLintIssue[] = [];

  // 1. DG remnant rules (string-based — always run)
  issues.push(...runDgRemnantRules(code));

  // 2. Parse AST
  let ast: luaparse.Chunk;
  try {
    ast = luaparse.parse(code, {
      locations: true,
      ranges: false,
      luaVersion: '5.3',
    });
  } catch (err: unknown) {
    // Syntax error — emit and return (can't do AST analysis)
    const e = err as { line?: number; column?: number; message?: string };
    const line = e.line ?? 1;
    const column = (e.column ?? 0) + 1;
    // Clean up the error message
    let message = e.message ?? 'Syntax error';
    // luaparse includes location in message like "[1:5] ..." — strip it
    message = message.replace(/^\[\d+:\d+\]\s*/, '');
    issues.push({
      line,
      column,
      endColumn: column + 1,
      severity: 'error',
      message,
      rule: 'syntax-error',
    });
    return issues.sort((a, b) => a.line - b.line || a.column - b.column);
  }

  // 3. AST-based rules
  issues.push(...runAstRules(ast));

  return issues.sort((a, b) => a.line - b.line || a.column - b.column);
}

/**
 * Lint Lua source code with entity reference validation.
 *
 * API-side only — requires an EntityDatabase populated from the DB.
 * Returns only entity-related issues (not general lint issues).
 */
export function lintLuaWithEntities(
  code: string,
  entities: EntityDatabase
): LuaLintIssue[] {
  let ast: luaparse.Chunk;
  try {
    ast = luaparse.parse(code, {
      locations: true,
      ranges: false,
      luaVersion: '5.3',
    });
  } catch {
    return []; // Can't validate entities without a valid AST
  }

  return runEntityRules(ast, entities);
}
