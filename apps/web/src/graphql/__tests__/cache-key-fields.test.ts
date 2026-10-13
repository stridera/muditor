/**
 * Apollo normalises composite-key types by (zoneId, id). A selection set for
 * one of these types that omits a key field makes the cache write throw
 * "Missing field 'zoneId' while extracting keyFields" after the server already
 * saved the row. This scans every GraphQL document in the web app.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import {
  buildSchema,
  getNamedType,
  Kind,
  parse,
  TypeInfo,
  visit,
  visitWithTypeInfo,
  type DocumentNode,
  type FragmentDefinitionNode,
  type SelectionSetNode,
} from 'graphql';

// Keep in sync with typePolicies in src/lib/apollo-client.ts.
const KEYS: Record<string, string[]> = {
  MobDto: ['zoneId', 'id'],
  ObjectDto: ['zoneId', 'id'],
  RoomDto: ['zoneId', 'id'],
  TriggerDto: ['zoneId', 'id'],
  ShopDto: ['zoneId', 'id'],
  QuestDto: ['zoneId', 'id'],
  QuestPhaseDto: ['questZoneId', 'questId', 'id'],
  QuestObjectiveDto: ['questZoneId', 'questId', 'phaseId', 'id'],
};

const SRC = join(__dirname, '..', '..');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'generated' || name === '__tests__' || name === 'node_modules')
      continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx|graphql)$/.test(name) && !/\.test\./.test(name))
      out.push(path);
  }
  return out;
}

function documents(): Array<{ file: string; doc: DocumentNode }> {
  const out: Array<{ file: string; doc: DocumentNode }> = [];
  for (const file of walk(SRC)) {
    const text = readFileSync(file, 'utf8');
    const sources = file.endsWith('.graphql')
      ? [text]
      : [...text.matchAll(/gql`([\s\S]*?)`/g)].map(m =>
          m[1]!.replace(/\$\{[^}]*\}/g, '')
        );
    for (const source of sources) {
      try {
        out.push({ file, doc: parse(source) });
      } catch {
        // template with interpolated fragments; the codegen step covers those
      }
    }
  }
  return out;
}

describe('GraphQL documents select the Apollo key fields', () => {
  it('includes every key field for composite-key types', () => {
    const schema = buildSchema(
      readFileSync(join(SRC, '..', '..', 'api', 'src', 'schema.gql'), 'utf8')
    );
    const docs = documents();
    expect(docs.length).toBeGreaterThan(50);

    const fragments = new Map<string, FragmentDefinitionNode>();
    for (const { doc } of docs)
      for (const def of doc.definitions)
        if (def.kind === Kind.FRAGMENT_DEFINITION)
          fragments.set(def.name.value, def);

    const fieldNames = (set: SelectionSetNode, seen = new Set<string>()) => {
      const names = new Set<string>();
      for (const sel of set.selections) {
        if (sel.kind === Kind.FIELD) names.add(sel.name.value);
        else if (sel.kind === Kind.INLINE_FRAGMENT)
          fieldNames(sel.selectionSet, seen).forEach(n => names.add(n));
        else if (!seen.has(sel.name.value)) {
          seen.add(sel.name.value);
          const frag = fragments.get(sel.name.value);
          if (frag)
            fieldNames(frag.selectionSet, seen).forEach(n => names.add(n));
        }
      }
      return names;
    };

    const problems: string[] = [];
    for (const { file, doc } of docs) {
      const info = new TypeInfo(schema);
      visit(
        doc,
        visitWithTypeInfo(info, {
          SelectionSet(node) {
            const type = getNamedType(info.getType());
            const keys = type && KEYS[type.name];
            if (!keys) return;
            const have = fieldNames(node);
            const missing = keys.filter(k => !have.has(k));
            if (missing.length)
              problems.push(
                `${file.replace(SRC, 'src')}: ${type.name} lacks ${missing.join(', ')}`
              );
          },
        })
      );
    }
    expect(problems).toEqual([]);
  });
});
