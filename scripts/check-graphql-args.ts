#!/usr/bin/env tsx
/**
 * check-graphql-args.ts
 * Lightweight static heuristic to catch missing explicit GraphQL @Args type declarations
 * that would otherwise surface only at runtime as UndefinedTypeError during schema build.
 *
 * Heuristic Rules (kept simple & fast):
 *   - Scan resolver .ts files under apps/api/src for lines containing '@Args('.
 *   - If the decorator options object (2nd param) is absent AND the parameter type annotation
 *     is a bare identifier that is NOT one of: String, Number, Boolean, Int, Float, ID, Date,
 *     we warn (likely an enum needing { type: () => EnumName }).
 *   - If options object exists but lacks 'type:' we warn (explicit type function still recommended for enums).
 *
 * Limitations:
 *   - Won't parse full AST (fast regex approach). May produce false positives/negatives in complex signatures.
 *   - Acceptable trade-off: early developer visibility > perfect accuracy.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), 'apps', 'api', 'src');
const resolverDir = ROOT;

const PRIMITIVES = new Set([
  'string',
  'number',
  'boolean',
  'String',
  'Number',
  'Boolean',
  'Int',
  'Float',
  'ID',
  'Date',
]);

interface Finding {
  file: string;
  line: number;
  message: string;
  snippet: string;
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, acc);
    } else if (entry.endsWith('.resolver.ts')) {
      acc.push(full);
    }
  }
  return acc;
}

function analyzeFile(file: string): Finding[] {
  const findings: Finding[] = [];
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    if (!line.includes('@Args(')) return;
    const trimmed = line.trim();
    // Basic pattern capture: @Args('name', { ... }) paramName: Type
    // or multiline complexity—only consider single line for heuristic
    const hasOptionsObject = /@Args\([^)]*,\s*{/.test(trimmed);
    const hasTypeArrow = hasOptionsObject && /type:\s*\(\)\s*=>/.test(trimmed);

    // Extract parameter type annotation if on same line: ) paramName: Type
    const paramTypeMatch = /\)\s*([a-zA-Z0-9_]+)\s*:\s*([A-Za-z0-9_]+)/.exec(
      trimmed
    );
    const paramType = paramTypeMatch ? paramTypeMatch[2] : undefined;

    if (!hasOptionsObject) {
      if (paramType && !PRIMITIVES.has(paramType)) {
        findings.push({
          file,
          line: idx + 1,
          message:
            'Missing explicit { type: () => ... } in @Args decorator for non-primitive parameter type',
          snippet: trimmed.slice(0, 160),
        });
      }
    } else if (hasOptionsObject && !hasTypeArrow) {
      // If options object present but lacks explicit type arrow
      findings.push({
        file,
        line: idx + 1,
        message:
          'Decorator options present but missing explicit type: () => T (recommended for enums)',
        snippet: trimmed.slice(0, 160),
      });
    }
  });

  return findings;
}

function main() {
  const resolverFiles = walk(resolverDir);
  const all: Finding[] = resolverFiles.flatMap(analyzeFile);
  if (all.length === 0) {
    process.stdout.write('✅ GraphQL @Args preflight: no issues detected\n');
    return;
  }
  process.stderr.write('❌ Potential GraphQL @Args issues detected:\n');
  all.forEach(f => {
    process.stderr.write(
      `  - ${path.relative(process.cwd(), f.file)}:${f.line}\n`
    );
    process.stderr.write(`    ${f.message}\n`);
    process.stderr.write(`    > ${f.snippet}\n`);
  });
  process.exitCode = 1;
}

main();
