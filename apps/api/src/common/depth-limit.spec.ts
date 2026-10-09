import { buildSchema, parse, validate } from 'graphql';
import { parseCorsOrigins, DEFAULT_CORS_ORIGINS } from './cors';
import { depthLimit } from './depth-limit';

const schema = buildSchema(`
  type Node { child: Node name: String }
  type Query { node: Node }
`);

const nest = (n: number) =>
  `{ node ${'{ child '.repeat(n - 1)}{ name }${' }'.repeat(n - 1)} }`;

describe('depthLimit', () => {
  it('accepts queries at the limit and rejects deeper ones', () => {
    // depth: node(1) + (n-1) child + name = n + 1 levels
    expect(validate(schema, parse(nest(9)), [depthLimit(10)])).toHaveLength(0);
    const errors = validate(schema, parse(nest(10)), [depthLimit(10)]);
    expect(errors).toHaveLength(1);
    expect(errors[0]!.message).toMatch(/exceeds the maximum/);
  });

  it('follows fragments and ignores introspection fields', () => {
    const viaFragment = parse(`
      query { node { ...F } }
      fragment F on Node { child { child { child { name } } } }
    `);
    expect(validate(schema, viaFragment, [depthLimit(3)])).toHaveLength(1);
    expect(validate(schema, viaFragment, [depthLimit(5)])).toHaveLength(0);

    const introspection = parse(
      '{ __schema { types { fields { type { ofType { ofType { ofType { name } } } } } } } }'
    );
    expect(validate(schema, introspection, [depthLimit(2)])).toHaveLength(0);
  });
});

describe('depthLimit fragment bombs', () => {
  it('memoises fragments: 30 nested double-spreads validate quickly', () => {
    const frags = Array.from({ length: 30 }, (_, i) =>
      i === 29
        ? `fragment F${i} on Node { name }`
        : `fragment F${i} on Node { ...F${i + 1} ...F${i + 1} }`
    );
    const doc = parse(`{ node { ...F0 } } ${frags.join(' ')}`);
    const start = performance.now();
    const errors = validate(schema, doc, [depthLimit(10)]);
    expect(performance.now() - start).toBeLessThan(50);
    expect(errors).toHaveLength(0);
  });

  it('counts depth contributed through nested fragments', () => {
    const doc = parse(`
      { node { ...A } }
      fragment A on Node { child { ...B } }
      fragment B on Node { child { child { name } } }`);
    // node(1) child(2) child(3) child(4) name(5)
    expect(validate(schema, doc, [depthLimit(4)])).toHaveLength(1);
    expect(validate(schema, doc, [depthLimit(5)])).toHaveLength(0);
  });
});

describe('parseCorsOrigins', () => {
  it('defaults to the production + local allowlist', () => {
    expect(parseCorsOrigins(undefined)).toEqual(DEFAULT_CORS_ORIGINS);
    expect(parseCorsOrigins('')).toEqual(DEFAULT_CORS_ORIGINS);
  });

  it('parses a comma-separated list and never allows a wildcard', () => {
    expect(parseCorsOrigins(' https://a.example , http://b.example ')).toEqual([
      'https://a.example',
      'http://b.example',
    ]);
    expect(parseCorsOrigins('*')).toEqual(DEFAULT_CORS_ORIGINS);
  });
});
