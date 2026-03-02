/**
 * String-based DG Script remnant detection rules.
 *
 * These run even when AST parsing fails (since they're regex-based).
 * They catch leftover DG Script patterns in Lua triggers.
 */

import type { LuaLintIssue } from './types';

/** Strip Lua string literals and comments for accurate pattern matching. */
function stripStringsAndComments(line: string): string {
  let result = '';
  let i = 0;
  while (i < line.length) {
    // Long comment: --[[ ... ]]
    if (
      i + 3 < line.length &&
      line[i] === '-' &&
      line[i + 1] === '-' &&
      line[i + 2] === '[' &&
      line[i + 3] === '['
    ) {
      return result;
    }
    // Line comment: --
    if (i + 1 < line.length && line[i] === '-' && line[i + 1] === '-') {
      return result;
    }
    // Double-quoted string
    if (line[i] === '"') {
      i++;
      while (i < line.length && line[i] !== '"') {
        if (line[i] === '\\') i++;
        i++;
      }
      i++;
      continue;
    }
    // Single-quoted string
    if (line[i] === "'") {
      i++;
      while (i < line.length && line[i] !== "'") {
        if (line[i] === '\\') i++;
        i++;
      }
      i++;
      continue;
    }
    // Long string: [[ ... ]]
    if (i + 1 < line.length && line[i] === '[' && line[i + 1] === '[') {
      return result;
    }
    result += line[i];
    i++;
  }
  return result;
}

/** Known DG Script function names that have no Lua equivalent. */
const DG_LEGACY_FUNCTIONS: Record<string, string> = {
  '%send%': 'actor:send(msg)',
  '%echo%': 'echo(msg)',
  '%damage%': 'actor:damage(amount)',
  '%heal%': 'actor:heal(amount)',
  '%teleport%': 'actor:teleport(room)',
  '%force%': 'actor:command(cmd)',
  '%purge%': 'room:purge()',
  '%load%': 'room:spawn_mobile(zone, id)',
  '%at%': 'room:at(fn)',
};

export function runDgRemnantRules(code: string): LuaLintIssue[] {
  const issues: LuaLintIssue[] = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const raw = lines[i]!;
    const stripped = stripStringsAndComments(raw);

    if (!stripped.trim()) continue;

    // Rule: dg-percent-var — %variable.name% syntax
    const percentVarRegex = /%([a-zA-Z_][\w.]*?)%/g;
    let match: RegExpExecArray | null;
    while ((match = percentVarRegex.exec(stripped)) !== null) {
      const col = match.index + 1;
      issues.push({
        line: lineNum,
        column: col,
        endColumn: col + match[0].length,
        severity: 'error',
        message: `DG Script \`${match[0]}\` — use Lua variable access instead (e.g., \`${match[1]!.replace('.', ':')}\` or string concatenation)`,
        rule: 'dg-percent-var',
      });
    }

    // Rule: dg-vnum-access — .vnum property
    const vnumRegex = /\.vnum\b/g;
    while ((match = vnumRegex.exec(stripped)) !== null) {
      const col = match.index + 1;
      issues.push({
        line: lineNum,
        column: col,
        endColumn: col + match[0].length,
        severity: 'error',
        message:
          '`.vnum` is a DG Script remnant — use `.zone_id` and `.local_id` instead',
        rule: 'dg-vnum-access',
      });
    }

    // Rule: dg-time-stamp — time.stamp
    const timeStampRegex = /\btime\.stamp\b/g;
    while ((match = timeStampRegex.exec(stripped)) !== null) {
      const col = match.index + 1;
      issues.push({
        line: lineNum,
        column: col,
        endColumn: col + match[0].length,
        severity: 'warning',
        message:
          '`time.stamp` is a DG Script remnant — use `timestamp()` instead',
        rule: 'dg-time-stamp',
      });
    }

    // Rule: dg-legacy-function — known old function patterns
    // Check for common DG functions used as globals
    const dgFuncNames = [
      'nop',
      'halt',
      'dg_cast',
      'dg_affect',
      'dg_vnum',
      'context',
      'rdelete',
      'makeuid',
      'asound',
      'zoneecho',
      'wdamage',
      'mdamage',
    ];
    for (const fn of dgFuncNames) {
      const fnRegex = new RegExp(`\\b${fn}\\b`, 'g');
      while ((match = fnRegex.exec(stripped)) !== null) {
        const col = match.index + 1;
        issues.push({
          line: lineNum,
          column: col,
          endColumn: col + fn.length,
          severity: 'warning',
          message: `\`${fn}\` is a DG Script function — use the Lua API equivalent`,
          rule: 'dg-legacy-function',
        });
      }
    }
  }

  return issues;
}
