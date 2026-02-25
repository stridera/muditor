/**
 * Lua script linter for Muditor.
 *
 * Pure string-based analysis — no external dependencies.
 * Catches common dangerous patterns like variable shadowing in loops
 * and infinite loops without wait() calls.
 */

export type LuaLintSeverity = 'error' | 'warning';

export interface LuaLintIssue {
  line: number; // 1-based line number
  column: number; // 1-based column
  endColumn: number; // 1-based end column
  severity: LuaLintSeverity;
  message: string;
  rule: string;
}

interface ScopeFrame {
  type: 'top' | 'while' | 'for' | 'repeat';
  /** Line where this scope opened (1-based) */
  startLine: number;
  /** Variables declared with `local` in this scope */
  locals: Set<string>;
  /** The condition variable(s) for while/for loops */
  conditionVars: Set<string>;
  /** Variables that are assigned (non-local) inside this scope */
  assigned: Set<string>;
  /** Whether wait() is called inside this scope */
  hasWait: boolean;
  /** Whether the loop condition is `true` (literal) */
  isWhileTrue: boolean;
}

/** Strip Lua string literals and comments so patterns don't match inside them. */
function stripStringsAndComments(line: string): string {
  let result = '';
  let i = 0;
  while (i < line.length) {
    // Long comment: --[[ ... ]] (we only handle single-line portions)
    if (
      i + 3 < line.length &&
      line[i] === '-' &&
      line[i + 1] === '-' &&
      line[i + 2] === '[' &&
      line[i + 3] === '['
    ) {
      return result; // rest of line is comment
    }
    // Line comment: --
    if (i + 1 < line.length && line[i] === '-' && line[i + 1] === '-') {
      return result; // rest of line is comment
    }
    // Double-quoted string
    if (line[i] === '"') {
      i++;
      while (i < line.length && line[i] !== '"') {
        if (line[i] === '\\') i++; // skip escaped char
        i++;
      }
      i++; // skip closing quote
      continue;
    }
    // Single-quoted string
    if (line[i] === "'") {
      i++;
      while (i < line.length && line[i] !== "'") {
        if (line[i] === '\\') i++; // skip escaped char
        i++;
      }
      i++; // skip closing quote
      continue;
    }
    result += line[i];
    i++;
  }
  return result;
}

/** Check if a name is a valid Lua identifier */
function isIdentifier(s: string): boolean {
  return /^[a-zA-Z_]\w*$/.test(s);
}

/** Extract identifier from patterns like `local x` or `local x =` */
function extractLocalDecl(
  stripped: string
): { name: string; hasAssignment: boolean; column: number } | null {
  const match = stripped.match(/\blocal\s+([a-zA-Z_]\w*)\s*(=?)/);
  if (!match || !match[1]) return null;
  return {
    name: match[1],
    hasAssignment: match[2] === '=',
    column: match.index! + 1, // 1-based
  };
}

/** Check if RHS of `local x = <expr>` references `x` itself */
function rhsReferencesVar(stripped: string, varName: string): boolean {
  const eqIdx = stripped.indexOf('=');
  if (eqIdx === -1) return false;
  // Make sure it's not ==
  if (stripped[eqIdx + 1] === '=') return false;
  const rhs = stripped.slice(eqIdx + 1);
  // Check for the variable name as a whole word on the RHS
  const re = new RegExp(`\\b${varName}\\b`);
  return re.test(rhs);
}

/** Check if a line contains a plain (non-local) assignment to a variable */
function isAssignmentTo(stripped: string, varName: string): boolean {
  // Match: varName = (but not ==, ~=, <=, >=)
  const re = new RegExp(`\\b${varName}\\s*=[^=]`);
  // Exclude lines that are `local varName = ...`
  if (new RegExp(`\\blocal\\s+${varName}\\b`).test(stripped)) return false;
  return re.test(stripped);
}

/** Extract condition variables from a while condition. e.g. `while x < 5 do` -> ["x"] */
function extractWhileCondVars(stripped: string): {
  vars: Set<string>;
  isTrue: boolean;
} {
  const match = stripped.match(/\bwhile\s+(.+?)\s+do\b/);
  if (!match || !match[1]) {
    // Could be `while ... do` split across lines, just check for `while true`
    const trueMatch = stripped.match(/\bwhile\s+true\b/);
    return { vars: new Set(), isTrue: !!trueMatch };
  }
  const cond = match[1].trim();
  if (cond === 'true') {
    return { vars: new Set(), isTrue: true };
  }
  // Extract identifiers from the condition
  const vars = new Set<string>();
  const identifiers = cond.match(/\b[a-zA-Z_]\w*\b/g) || [];
  const keywords = new Set([
    'and',
    'or',
    'not',
    'true',
    'false',
    'nil',
    'do',
    'then',
    'end',
    'function',
  ]);
  for (const id of identifiers) {
    if (!keywords.has(id) && isIdentifier(id)) {
      vars.add(id);
    }
  }
  return { vars, isTrue: false };
}

/** Extract the iterator variable from a numeric for loop: `for i = 1, 10 do` -> "i" */
function extractForVar(stripped: string): string | null {
  const match = stripped.match(/\bfor\s+([a-zA-Z_]\w*)\s*=/);
  if (match?.[1]) return match[1];
  // Generic for: `for k, v in ...`
  const genMatch = stripped.match(/\bfor\s+([a-zA-Z_]\w*)/);
  return genMatch?.[1] ?? null;
}

/** Resolve all variables visible from the scope stack */
function allVisibleLocals(scopes: ScopeFrame[]): Set<string> {
  const all = new Set<string>();
  for (const scope of scopes) {
    for (const v of scope.locals) all.add(v);
  }
  return all;
}

/** Check if we're currently inside any loop scope */
function insideLoop(scopes: ScopeFrame[]): boolean {
  return scopes.some(
    s => s.type === 'while' || s.type === 'for' || s.type === 'repeat'
  );
}

/** Find the innermost loop scope */
function innermostLoop(scopes: ScopeFrame[]): ScopeFrame | null {
  for (let i = scopes.length - 1; i >= 0; i--) {
    const scope = scopes[i];
    if (
      scope &&
      (scope.type === 'while' ||
        scope.type === 'for' ||
        scope.type === 'repeat')
    ) {
      return scope;
    }
  }
  return null;
}

/**
 * Lint Lua source code for common dangerous patterns.
 *
 * Returns an array of issues sorted by line number.
 */
export function lintLua(code: string): LuaLintIssue[] {
  const issues: LuaLintIssue[] = [];
  const lines = code.split('\n');
  const scopes: ScopeFrame[] = [
    {
      type: 'top',
      startLine: 1,
      locals: new Set(),
      conditionVars: new Set(),
      assigned: new Set(),
      hasWait: false,
      isWhileTrue: false,
    },
  ];

  // Track pending `end` counts for non-loop blocks (if/function/do)
  // We just need a simple depth counter for blocks that aren't loops
  let genericBlockDepth = 0;
  // Stack to track what each `end` closes: 'loop' | 'generic'
  const endStack: ('loop' | 'generic')[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const raw = lines[i]!;
    const stripped = stripStringsAndComments(raw);
    const trimmed = stripped.trim();

    if (!trimmed) continue;

    // Track wait() calls in current and all parent scopes
    if (/\bwait\s*\(/.test(trimmed)) {
      for (const scope of scopes) {
        scope.hasWait = true;
      }
    }

    // Track assignments to variables (non-local) for all scopes
    for (const scope of scopes) {
      for (const v of scope.conditionVars) {
        if (isAssignmentTo(trimmed, v)) {
          scope.assigned.add(v);
        }
      }
    }

    // Detect block openings — check for while/for/repeat/if/function/do
    // We handle multiple keywords on the same line left-to-right
    const whileMatch = trimmed.match(/\bwhile\b/);
    const forMatch = trimmed.match(/\bfor\b/);
    const repeatMatch = trimmed.match(/\brepeat\b/);

    // Check for `end` on the same line as an opener (single-line blocks)
    // e.g. `while true do break end` — we still lint but handle scope carefully
    const hasEndOnLine = /\bend\b/.test(trimmed);
    const hasDoOnLine = /\bdo\b/.test(trimmed);

    // Handle loop openers
    if (whileMatch && hasDoOnLine) {
      const { vars, isTrue } = extractWhileCondVars(trimmed);
      const newScope: ScopeFrame = {
        type: 'while',
        startLine: lineNum,
        locals: new Set(),
        conditionVars: vars,
        assigned: new Set(),
        hasWait: false,
        isWhileTrue: isTrue,
      };

      if (hasEndOnLine && !trimmed.match(/\bdo\b.*\bend\b.*\bdo\b/)) {
        // Single-line while block: `while true do something end`
        // Still check for issues but don't push scope
        // Check for while true without wait
        if (isTrue && !/\bwait\s*\(/.test(trimmed)) {
          issues.push({
            line: lineNum,
            column: whileMatch.index! + 1,
            endColumn: whileMatch.index! + 6,
            severity: 'warning',
            message:
              '`while true` loop without `wait()` may cause an infinite loop and crash the server',
            rule: 'while-true-no-wait',
          });
        }
      } else {
        scopes.push(newScope);
        endStack.push('loop');
      }
    } else if (forMatch && hasDoOnLine) {
      const forVar = extractForVar(trimmed);
      const newScope: ScopeFrame = {
        type: 'for',
        startLine: lineNum,
        locals: new Set(forVar ? [forVar] : []),
        conditionVars: new Set(forVar ? [forVar] : []),
        assigned: new Set(),
        hasWait: false,
        isWhileTrue: false,
      };
      if (hasEndOnLine && !trimmed.match(/\bdo\b.*\bend\b.*\bdo\b/)) {
        // single-line for, skip
      } else {
        scopes.push(newScope);
        endStack.push('loop');
      }
    } else if (repeatMatch) {
      const newScope: ScopeFrame = {
        type: 'repeat',
        startLine: lineNum,
        locals: new Set(),
        conditionVars: new Set(),
        assigned: new Set(),
        hasWait: false,
        isWhileTrue: false,
      };
      scopes.push(newScope);
      endStack.push('loop');
    } else {
      // Non-loop block openers: if...then, function...end, do...end
      // We need to track these so `end` doesn't pop loop scopes
      const ifMatch = /\bif\b.*\bthen\b/.test(trimmed) && !hasEndOnLine;
      const funcMatch = /\bfunction\b/.test(trimmed) && !hasEndOnLine;
      const doMatch =
        /\bdo\b/.test(trimmed) && !whileMatch && !forMatch && !hasEndOnLine;

      const openerCount =
        (ifMatch ? 1 : 0) + (funcMatch ? 1 : 0) + (doMatch ? 1 : 0);
      for (let j = 0; j < openerCount; j++) {
        genericBlockDepth++;
        endStack.push('generic');
      }
    }

    // Handle `end` and `until` closers (when not on the same line as opener)
    if (!whileMatch && !forMatch && hasEndOnLine) {
      // Count `end` keywords on this line
      const endMatches = trimmed.match(/\bend\b/g);
      const endCount = endMatches ? endMatches.length : 0;
      for (let j = 0; j < endCount; j++) {
        const top = endStack.pop();
        if (top === 'loop') {
          const closingScope = scopes.pop();
          if (closingScope) {
            // Check: while true without wait()
            if (closingScope.isWhileTrue && !closingScope.hasWait) {
              const scopeLine = lines[closingScope.startLine - 1] ?? '';
              issues.push({
                line: closingScope.startLine,
                column: 1,
                endColumn: scopeLine.length + 1,
                severity: 'warning',
                message:
                  '`while true` loop without `wait()` may cause an infinite loop and crash the server',
                rule: 'while-true-no-wait',
              });
            }
            // Check: condition variable never modified
            if (
              closingScope.type === 'while' &&
              !closingScope.isWhileTrue &&
              closingScope.conditionVars.size > 0
            ) {
              for (const v of closingScope.conditionVars) {
                if (!closingScope.assigned.has(v)) {
                  const scopeLine = lines[closingScope.startLine - 1] ?? '';
                  issues.push({
                    line: closingScope.startLine,
                    column: 1,
                    endColumn: scopeLine.length + 1,
                    severity: 'warning',
                    message: `Loop condition variable \`${v}\` is never modified inside the loop body — this may be an infinite loop`,
                    rule: 'condition-var-never-modified',
                  });
                }
              }
            }
          }
        } else if (top === 'generic') {
          genericBlockDepth--;
        }
      }
    }

    // Handle `until` for repeat..until
    if (/\buntil\b/.test(trimmed)) {
      const top = endStack.pop();
      if (top === 'loop') {
        const closingScope = scopes.pop();
        if (closingScope && closingScope.type === 'repeat') {
          if (closingScope.isWhileTrue && !closingScope.hasWait) {
            // repeat..until false (infinite)
            const scopeLine = lines[closingScope.startLine - 1] ?? '';
            issues.push({
              line: closingScope.startLine,
              column: 1,
              endColumn: scopeLine.length + 1,
              severity: 'warning',
              message:
                '`repeat...until false` loop without `wait()` may cause an infinite loop',
              rule: 'while-true-no-wait',
            });
          }
        }
      } else if (top === 'generic') {
        genericBlockDepth--;
      }
    }

    // Check `local` declarations
    const localDecl = extractLocalDecl(trimmed);
    if (localDecl) {
      const { name, hasAssignment, column } = localDecl;
      const visibleLocals = allVisibleLocals(scopes);
      const currentScope = scopes[scopes.length - 1]!;
      const loop = innermostLoop(scopes);

      // Rule 1: Variable shadowing in loop — `local x = x + 1` where x exists in outer scope
      if (
        insideLoop(scopes) &&
        hasAssignment &&
        visibleLocals.has(name) &&
        !currentScope.locals.has(name) &&
        rhsReferencesVar(trimmed, name)
      ) {
        // Find the column of `local` keyword in the raw line
        const rawLocalIdx = raw.indexOf('local');
        const rawCol = rawLocalIdx >= 0 ? rawLocalIdx + 1 : column;
        issues.push({
          line: lineNum,
          column: rawCol,
          endColumn: rawCol + raw.trimStart().length,
          severity: 'error',
          message: `\`local ${name} = ${name} ...\` shadows the outer variable — the loop will always use the initial value. Did you mean \`${name} = ${name} + ...\` (without \`local\`)?`,
          rule: 'shadow-in-loop',
        });
      }

      // Rule 3: local redeclaration of loop condition variable
      if (loop && loop.conditionVars.has(name)) {
        const shouldFlag = currentScope !== loop || !hasAssignment; // `local x` without assignment in loop body
        if (shouldFlag && (loop.type !== 'for' || !loop.locals.has(name))) {
          if (currentScope.type !== 'top') {
            const rawLocalIdx = raw.indexOf('local');
            const rawCol = rawLocalIdx >= 0 ? rawLocalIdx + 1 : column;
            // Don't double-report if already caught by rule 1
            const alreadyReported = issues.some(
              issue => issue.line === lineNum && issue.rule === 'shadow-in-loop'
            );
            if (!alreadyReported) {
              issues.push({
                line: lineNum,
                column: rawCol,
                endColumn: rawCol + raw.trimStart().length,
                severity: 'warning',
                message: `\`local ${name}\` shadows the loop condition variable — the loop condition will not see changes to this variable`,
                rule: 'shadow-loop-condition',
              });
            }
          }
        }
      }

      // Register the local in the current scope
      currentScope.locals.add(name);
    }
  }

  return issues.sort((a, b) => a.line - b.line || a.column - b.column);
}
