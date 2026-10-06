/**
 * GraphQL echoes caller-supplied values inside error messages, e.g.
 *   Variable "$i" got invalid value { identifier: "a", password: "hunter2" }; Field ...
 *   String cannot represent a non string value: 123
 * Those messages must never reach the logs verbatim (passwords, tokens).
 * Everything that can carry a value is replaced with [REDACTED]; schema
 * names and types are kept so the line stays useful.
 */

const REDACTED = '[REDACTED]';

// Reasons GraphQL appends after "got invalid value ...;" that contain only
// field names and type names, never values.
const SAFE_VARIABLE_REASONS = [
  /Field "[\w$]+" of required type "[^"]*" was not provided\./g,
  /Field "[\w$]+" is not defined by type "[\w]+"\./g,
  /Expected type "[^"]*" to be an object\./g,
];

function redactInvalidValue(message: string): string {
  const marker = 'got invalid value ';
  const at = message.indexOf(marker);
  if (at === -1) return message;
  const head = message.slice(0, at + marker.length);
  const tail = message.slice(at + marker.length);
  const reasons: string[] = [];
  for (const pattern of SAFE_VARIABLE_REASONS) {
    for (const match of tail.matchAll(pattern)) reasons.push(match[0]);
  }
  return `${head}${REDACTED}${reasons.length ? `; ${reasons.join('; ')}` : ''}`;
}

const LITERAL_PATTERNS: Array<[RegExp, string]> = [
  // "... cannot represent a non string value: <literal>"
  [/(cannot represent[^:;]*value:)[^]*$/i, `$1 ${REDACTED}`],
  // "Expected value of type "Int!", found <literal>; ..."
  [/(, found )[^]*$/, `$1${REDACTED}`],
  // `Value "x" does not exist in "Enum" enum`
  [/\bValue "[^"]*" does not exist/g, `Value "${REDACTED}" does not exist`],
  // Syntax errors that echo part of the document
  [/(Unexpected [A-Za-z]+ )"[^"]*"/g, `$1"${REDACTED}"`],
  [/(Expected [^,]+, found )[^]*$/, `$1${REDACTED}`],
];

/** Strip echoed input values from a GraphQL/validation error message. */
export function redactValueEchoes(message: string): string {
  let result = redactInvalidValue(message);
  for (const [pattern, replacement] of LITERAL_PATTERNS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}

interface PrismaLike {
  name?: string;
  code?: string;
  meta?: { target?: unknown };
  message?: string;
}

/**
 * Prisma error messages embed the whole invocation including data values.
 * Keep only the error code, the affected columns and the final reason line.
 */
export function describeInternalError(original: unknown, fallback: string) {
  const err = (original ?? {}) as PrismaLike;
  if (typeof err.name === 'string' && err.name.startsWith('PrismaClient')) {
    const lines = (err.message ?? '')
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    const target = err.meta?.target;
    const prefix = [
      err.code ? `prisma=${err.code}` : null,
      target !== undefined ? `target=${JSON.stringify(target)}` : null,
    ]
      .filter(Boolean)
      .join(' ');
    return `${prefix ? `${prefix} ` : ''}${lines[lines.length - 1] ?? fallback}`;
  }
  return fallback.split('\n')[0] ?? fallback;
}

/** Stack frames only: Error.stack starts with the (possibly value-laden) message. */
export function stackFramesOnly(stack: string | undefined): string | undefined {
  if (!stack) return stack;
  const lines = stack.split('\n');
  const first = lines.findIndex(l => /^\s+at /.test(l));
  const name = (lines[0] ?? '').match(/^[\w$.]+(?=:|$)/)?.[0] ?? 'Error';
  return first === -1 ? name : [name, ...lines.slice(first)].join('\n');
}
