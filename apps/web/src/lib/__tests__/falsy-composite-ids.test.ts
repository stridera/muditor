/**
 * Room / mob / object ids are 0-based inside a zone (id 0 is valid), so a
 * truthiness check on them silently skips room 0 / mob 0 / object 0. This
 * guards the editor sources against the `!selectedRoomId` family of checks.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const SRC = join(__dirname, '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'generated' || name === '__tests__' || name === 'node_modules')
      continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\./.test(name)) out.push(path);
  }
  return out;
}

// Numeric local ids only (URL params are strings, so '0' is truthy there).
const FALSY_ID_CHECKS = [
  /!\s*(selected|active|target|current)?(Room|Mob|Object|Shop)Id\b(?!\s*=)/,
  /\b(selected|target)(Room|Mob|Object)Id\s*\|\|\s*(null|'')/,
  /(?<!(?:===?|!==?)\s*)\b(selected|target)(Room|Mob|Object)Id\s*&&/,
];

describe('no falsy checks on composite-key local ids', () => {
  it('uses null checks for room/mob/object ids', () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      if (file.includes(join('app', 'dashboard', 'shops', 'editor'))) continue;
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (line.trim().startsWith('//')) return;
          if (FALSY_ID_CHECKS.some(re => re.test(line)))
            offenders.push(
              `${file.replace(SRC, 'src')}:${i + 1}: ${line.trim()}`
            );
        });
    }
    expect(offenders).toEqual([]);
  });
});
