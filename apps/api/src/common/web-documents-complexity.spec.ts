import { readFileSync } from 'fs';
import { join } from 'path';
import { Kind, buildSchema, parse, validate } from 'graphql';
import { complexityLimit } from './complexity-limit';
import { depthLimit, MAX_QUERY_DEPTH } from './depth-limit';

/**
 * Every operation the web app ships (the codegen client preset's document map)
 * must pass the production validation rules, so a tightened budget cannot
 * silently break a page.
 */
const schema = buildSchema(
  readFileSync(join(__dirname, '../schema.gql'), 'utf8')
);
const generated = readFileSync(
  join(__dirname, '../../../web/src/generated/gql.ts'),
  'utf8'
);

const sources = [
  ...generated.matchAll(/^\s+("(?:[^"\\]|\\.)*"): types\./gm),
].map(m => JSON.parse(m[1]!) as string);
const fragments = sources.filter(
  s => /\bfragment\s/.test(s) && !/\b(query|mutation|subscription)\b/.test(s)
);
const operations = sources.filter(s =>
  /\b(query|mutation|subscription)\b/.test(s)
);

describe('web documents vs the production validation rules', () => {
  it('found the web documents', () => {
    expect(operations.length).toBeGreaterThan(100);
  });

  it('every operation passes depth and complexity limits', () => {
    const failures: string[] = [];
    for (const op of operations) {
      const doc = parse([op, ...fragments].join('\n'));
      const names = doc.definitions
        .filter(d => d.kind === Kind.OPERATION_DEFINITION)
        .map(d => (d.kind === Kind.OPERATION_DEFINITION ? d.name?.value : ''));
      const errors = validate(schema, doc, [
        depthLimit(MAX_QUERY_DEPTH),
        complexityLimit(),
      ]);
      for (const e of errors) failures.push(`${names.join(',')}: ${e.message}`);
    }
    expect(failures).toEqual([]);
  });
});
