import * as unixCryptModule from 'unix-crypt-td-js';

type UnixCrypt = (password: string, salt: string) => string;

/**
 * unix-crypt-td-js is CommonJS (`module.exports = fn`). Depending on the
 * runner (swc dev, tsc/swc ESM build, Bun) the namespace import is either the
 * function itself or an object wrapping it, so resolve it defensively.
 */
function resolveUnixCrypt(mod: unknown): UnixCrypt {
  const candidates = [
    mod,
    (mod as { default?: unknown } | null)?.default,
    (mod as { crypt?: unknown } | null)?.crypt,
  ];
  const fn = candidates.find(c => typeof c === 'function');
  if (!fn) {
    throw new Error('unix-crypt-td-js did not resolve to a function');
  }
  return fn as UnixCrypt;
}

/** Legacy DES crypt(3), used to verify CircleMUD password hashes. */
export const unixCrypt: UnixCrypt = resolveUnixCrypt(unixCryptModule);
