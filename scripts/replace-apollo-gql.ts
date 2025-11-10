#!/usr/bin/env tsx
/**
 * Codemod: Replace imports of gql from '@apollo/client' with generated typed gql function.
 * This ensures all GraphQL operations use the generated overloads for strong typing.
 *
 * Strategy:
 *  - Scan apps/web/src for .ts/.tsx files.
 *  - Replace exact import line: import { gql } from '@apollo/client';
 *  - Skip files already importing from '@/generated'.
 *  - Report a summary of changed files.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const WEB_SRC = join(ROOT, 'apps/web/src');
const changed: string[] = [];

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      walk(full);
    } else if (/\.(tsx?|jsx?)$/.test(entry)) {
      processFile(full);
    }
  }
}

function processFile(file: string) {
  let text = readFileSync(file, 'utf8');
  if (
    /import\s+{\s*gql\s*}\s+from\s+'@apollo\/client';/.test(text) &&
    !/from\s+'@\/generated'/.test(text)
  ) {
    text = text.replace(
      /import\s+{\s*gql\s*}\s+from\s+'@apollo\/client';/,
      "import { gql } from '@/generated';"
    );
    writeFileSync(file, text, 'utf8');
    changed.push(file.replace(ROOT + '/', ''));
  }
}

walk(WEB_SRC);

console.log(`Updated gql import in ${changed.length} files.`);
for (const f of changed) console.log(' - ' + f);

if (changed.length === 0) {
  console.log('No files needed updating.');
}
