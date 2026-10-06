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
