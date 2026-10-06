/**
 * Regression guard: role hierarchy logic lives ONLY in lib/roles.ts.
 *
 * A stale hand-rolled role list / rank map (e.g. one missing HEAD_BUILDER, or
 * one that ranks BUILDER below IMMORTAL) is what denied builders access to the
 * zones editor. Use `roleAtLeast(role, 'BUILDER')` / `roleRank(role)` /
 * `USER_ROLES` from '@/lib/roles' instead. If this test fails, do not add an
 * exception; route the check through lib/roles.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative } from 'path';

const SRC = join(__dirname, '..', '..');

const IGNORED_DIRS = new Set(['generated', '__tests__', 'node_modules']);
const ALLOWED_FILES = new Set(['lib/roles.ts']);

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!IGNORED_DIRS.has(name)) walk(full, out);
    } else if (/\.(ts|tsx)$/.test(name) && !/\.(test|spec)\.tsx?$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

const FORBIDDEN: { re: RegExp; why: string }[] = [
  {
    re: /\[\s*['"]PLAYER['"]/,
    why: 'hard-coded role array starting at PLAYER',
  },
  {
    re: /['"]IMPLEMENTOR['"]\s*\]/,
    why: 'hard-coded role array ending at IMPLEMENTOR',
  },
  { re: /\bGOD\b/, why: 'stale GOD role (renamed IMPLEMENTOR)' },
  { re: /\bIMPLEMENTOR\s*:\s*5\b/, why: 'hand-rolled role rank map' },
  { re: /\bPLAYER\s*:\s*0\s*,/, why: 'hand-rolled role rank map' },
  {
    re: /role\s*[!=]==\s*['"](PLAYER|IMMORTAL|BUILDER|HEAD_BUILDER|CODER|IMPLEMENTOR)['"]/,
    why: 'exact-match role comparison; use roleAtLeast',
  },
  {
    re: /(ROLES?|ROLE_RANK)\w*\.indexOf\(/,
    why: 'role rank via indexOf; use roleRank',
  },
];

describe('no hard-coded role logic outside lib/roles.ts', () => {
  const files = walk(SRC).filter(
    f => !ALLOWED_FILES.has(relative(SRC, f).split('\\').join('/'))
  );

  it('scans a non-trivial number of files', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('finds no forbidden role patterns', () => {
    const hits: string[] = [];
    for (const file of files) {
      const lines = readFileSync(file, 'utf8').split('\n');
      lines.forEach((line, i) => {
        for (const { re, why } of FORBIDDEN) {
          if (re.test(line)) {
            hits.push(
              `${relative(SRC, file)}:${i + 1}: ${why}: ${line.trim()}`
            );
          }
        }
      });
    }
    expect(hits).toEqual([]);
  });
});
