/**
 * Minimal Lua formatter used by the script and library editors.
 *
 * Monaco ships no Lua formatter, so `editor.action.formatDocument` is a silent
 * no-op for Lua. This re-indents by block structure (4 spaces), trims trailing
 * whitespace, collapses runs of blank lines and ends the file with one newline.
 * It never rewrites tokens, strings or comments, and lines inside multi-line
 * strings/comments are left byte-for-byte alone.
 */

const INDENT = '    ';

const OPENERS = new Set(['function', 'if', 'do', 'repeat']);
const CLOSERS = new Set(['end', 'until']);
const MIDDLES = new Set(['else', 'elseif']);

type TokenKind = 'open' | 'close' | 'middle';

/** Matches the opening of a long bracket such as `[[` or `[==[`. */
function longBracketLevel(line: string, at: number): number | null {
  if (line[at] !== '[') return null;
  let i = at + 1;
  while (line[i] === '=') i++;
  return line[i] === '[' ? i - at - 1 : null;
}

/**
 * Structural tokens on one line, plus the long-bracket state carried to the
 * next line (`null` when the line ends outside a long string/comment).
 */
function scanLine(
  line: string,
  longLevel: number | null
): { tokens: TokenKind[]; longLevel: number | null } {
  const tokens: TokenKind[] = [];
  let i = 0;

  const skipLong = (level: number): boolean => {
    const close = ']' + '='.repeat(level) + ']';
    const end = line.indexOf(close, i);
    if (end === -1) {
      i = line.length;
      return false;
    }
    i = end + close.length;
    return true;
  };

  if (longLevel !== null) {
    if (!skipLong(longLevel)) return { tokens, longLevel };
    longLevel = null;
  }

  while (i < line.length) {
    const ch = line[i]!;

    if (ch === '-' && line[i + 1] === '-') {
      const level = longBracketLevel(line, i + 2);
      if (level === null) break; // line comment
      i += 2 + level + 2;
      if (!skipLong(level)) return { tokens, longLevel: level };
      continue;
    }

    if (ch === '"' || ch === "'") {
      i++;
      while (i < line.length && line[i] !== ch) {
        i += line[i] === '\\' ? 2 : 1;
      }
      i++;
      continue;
    }

    if (ch === '[') {
      const level = longBracketLevel(line, i);
      if (level !== null) {
        i += level + 2;
        if (!skipLong(level)) return { tokens, longLevel: level };
        continue;
      }
    }

    if (ch === '{' || ch === '(') {
      tokens.push('open');
      i++;
      continue;
    }
    if (ch === '}' || ch === ')') {
      tokens.push('close');
      i++;
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j]!)) j++;
      const word = line.slice(i, j);
      if (OPENERS.has(word)) tokens.push('open');
      else if (CLOSERS.has(word)) tokens.push('close');
      else if (MIDDLES.has(word)) tokens.push('middle');
      i = j;
      continue;
    }

    i++;
  }

  return { tokens, longLevel: null };
}

/**
 * Indent level of an open-block stack. Each entry is the input line that opened
 * it; several openers on one line (`foo({`, `bar(function()`) indent once.
 */
function levelOf(stack: number[], drop = 0): number {
  return new Set(stack.slice(0, stack.length - drop)).size;
}

export function formatLua(source: string): string {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  const stack: number[] = [];
  let longLevel: number | null = null;
  let blankRun = 0;

  lines.forEach((raw, lineNo) => {
    // Inside a multi-line string/comment: content is significant.
    if (longLevel !== null) {
      const scan = scanLine(raw, longLevel);
      longLevel = scan.longLevel;
      blankRun = 0;
      out.push(raw);
      // Code after the closing bracket may still change nesting.
      for (const t of scan.tokens) {
        if (t === 'open') stack.push(lineNo);
        else if (t === 'close') stack.pop();
      }
      return;
    }

    const trimmed = raw.trim();
    if (trimmed === '') {
      blankRun++;
      if (blankRun === 1) out.push('');
      return;
    }
    blankRun = 0;

    const scan = scanLine(trimmed, null);
    longLevel = scan.longLevel;

    let lineLevel = levelOf(stack);
    let leading = true;
    for (const t of scan.tokens) {
      if (t === 'close') {
        stack.pop();
        if (leading) lineLevel = levelOf(stack);
      } else if (t === 'middle') {
        // else/elseif close one block and open the next: net zero depth.
        if (leading) lineLevel = levelOf(stack, 1);
      } else {
        leading = false;
        stack.push(lineNo);
      }
    }

    out.push(INDENT.repeat(lineLevel) + trimmed);
  });

  while (out.length > 0 && out[out.length - 1] === '') out.pop();
  while (out.length > 0 && out[0] === '') out.shift();
  return out.length === 0 ? '' : out.join('\n') + '\n';
}
