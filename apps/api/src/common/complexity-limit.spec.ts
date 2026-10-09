import { buildSchema, parse, validate } from 'graphql';
import { complexityLimit } from './complexity-limit';

const schema = buildSchema(`
  type Leaf { id: Int name: String }
  type Branch { id: Int leaves(take: Int): [Leaf!]! }
  type Query {
    expensive: Leaf
    branches(take: Int): [Branch!]!
    leaf: Leaf
  }
`);

const run = (query: string, limits = {}) =>
  validate(schema, parse(query), [complexityLimit(limits)]);

describe('complexityLimit', () => {
  it('rejects alias flooding', () => {
    const aliases = Array.from(
      { length: 40 },
      (_, i) => `a${i}: expensive { id }`
    ).join(' ');
    const errors = run(`{ ${aliases} }`, { maxAliases: 15 });
    expect(errors.map(e => e.message)).toEqual([
      expect.stringMatching(/40 aliases.*maximum allowed is 15/),
    ]);
  });

  it('allows a few aliases', () => {
    expect(
      run('{ a: leaf { id } b: leaf { id } }', { maxAliases: 15 })
    ).toEqual([]);
  });

  it('rejects an operation whose estimated cost is too high', () => {
    // branches(10 default) * (1 + leaves(10 default) * 2) = 220 + 1
    const q = '{ branches { id leaves { id name } } }';
    expect(run(q, { maxCost: 100 })).toHaveLength(1);
    expect(run(q, { maxCost: 1000 })).toEqual([]);
  });

  it('uses a literal take as the list size and caps absurd values', () => {
    const small = '{ branches(take: 1) { leaves(take: 1) { id } } }';
    expect(run(small, { maxCost: 10 })).toEqual([]);
    const huge = '{ branches(take: 100000) { leaves(take: 100000) { id } } }';
    // capped at 100 each: 1 + 100 * (1 + 100 * 1) = 10101
    expect(run(huge, { maxCost: 10000 })).toHaveLength(1);
    expect(run(huge, { maxCost: 20000 })).toEqual([]);
  });

  it('expands fragments and ignores introspection', () => {
    const q = `
      query { branches { ...F } }
      fragment F on Branch { leaves { id name } }`;
    expect(run(q, { maxCost: 100 })).toHaveLength(1);
    expect(run('{ __schema { types { name } } }', { maxCost: 1 })).toEqual([]);
  });

  it('accepts ordinary queries under the default limits', () => {
    expect(run('{ branches(take: 20) { id leaves { id } } }')).toEqual([]);
  });
});
