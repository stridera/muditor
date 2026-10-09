import { buildSchema, parse, validate } from 'graphql';
import { complexityLimit } from './complexity-limit';
import { depthLimit } from './depth-limit';

const schema = buildSchema(`
  type Leaf { id: Int name: String }
  type Branch { id: Int leaves(take: Int): [Leaf!]! }
  type Query {
    expensive: Leaf
    branches(take: Int): [Branch!]!
    leaf: Leaf
  }
`);

/** n fragments, each spreading the next one twice: 2^n naive expansions. */
const fragmentBomb = (n: number) => {
  const frags = Array.from({ length: n }, (_, i) =>
    i === n - 1
      ? `fragment F${i} on Branch { id }`
      : `fragment F${i} on Branch { ...F${i + 1} ...F${i + 1} }`
  );
  return `{ branches { ...F0 } } ${frags.join(' ')}`;
};

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
    // branches(take: 10) * (1 + leaves(take: 10) * 2) = 220 + 1
    const q = '{ branches(take: 10) { id leaves(take: 10) { id name } } }';
    expect(run(q, { maxCost: 100 })).toHaveLength(1);
    expect(run(q, { maxCost: 1000 })).toEqual([]);
  });

  it('uses a literal take as the list size and caps absurd values', () => {
    const small = '{ branches(take: 1) { leaves(take: 1) { id } } }';
    expect(run(small, { maxCost: 10 })).toEqual([]);
    const huge = '{ branches(take: 100000) { leaves(take: 100000) { id } } }';
    // capped at 1000 each: 1 + 1000 * (1 + 1000 * 1) = 1_001_001
    expect(run(huge, { maxCost: 1_000_000 })).toHaveLength(1);
    expect(run(huge, { maxCost: 1_001_001 })).toEqual([]);
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

  it('costs `take: $var` and a missing take at the server cap', () => {
    // branches(1000 cap) * (1 + leaves 1000 cap) ... well above the budget
    const viaVar =
      'query Q($n: Int) { branches(take: $n) { leaves(take: $n) { id } } }';
    const missing = '{ branches { leaves { id } } }';
    const small = '{ branches(take: 2) { leaves(take: 2) { id } } }';
    // 1 + 1000 * (1 + 1000 * 1) = 1_001_001
    expect(run(viaVar, { maxCost: 1_000_000 })).toHaveLength(1);
    expect(run(missing, { maxCost: 1_000_000 })).toHaveLength(1);
    expect(run(small, { maxCost: 1_000_000 })).toEqual([]);
    // a variable default cannot be trusted either: the client can override it
    const withDefault =
      'query Q($n: Int = 1) { branches(take: $n) { leaves(take: $n) { id } } }';
    expect(run(withDefault, { maxCost: 1_000_000 })).toHaveLength(1);
  });

  describe('fragment bombs', () => {
    it('validates 30 nested double-spread fragments quickly', () => {
      const doc = parse(fragmentBomb(30));
      const start = performance.now();
      const errors = validate(schema, doc, [
        depthLimit(),
        complexityLimit({ maxFragmentSpreads: 1000 }),
      ]);
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(50);
      // bounded: the cost is 2^30-sized, so it must be rejected
      expect(errors.map(e => e.message).join()).toMatch(/exceeds the maximum/);
    });

    it('rejects documents with too many fragment spreads', () => {
      const start = performance.now();
      const errors = validate(schema, parse(fragmentBomb(60)), [
        complexityLimit(),
      ]);
      expect(performance.now() - start).toBeLessThan(50);
      expect(errors).toHaveLength(1);
      expect(errors[0]!.message).toMatch(/fragment spreads.*maximum/);
    });

    it('still handles fragment cycles', () => {
      const q = `
        { branches { ...A } }
        fragment A on Branch { id ...B }
        fragment B on Branch { id ...A }`;
      expect(() => run(q)).not.toThrow();
    });
  });

  describe('rooms relation loading', () => {
    const roomsSchema = buildSchema(`
      type Shop { id: Int }
      type Exit { id: Int direction: String keywords: [String!]! }
      type Room {
        id: Int
        name: String
        exits: [Exit!]!
        shops: [Shop!]!
        mobs: [Shop!]!
      }
      type Query { rooms(take: Int, lightweight: Boolean): [Room!]! }
    `);
    const runRooms = (query: string) =>
      validate(roomsSchema, parse(query), [complexityLimit()]);

    it('charges heavy room shapes for the full world load', () => {
      // 1 + 20000 * 20 (one relation) + 20000 * (1 + 10) = 620_001
      expect(runRooms('{ rooms(take: 20000) { shops { id } } }')).toEqual([]);
      // Eleven aliases of it used to cost ~2.4M; now ~6.8M
      const many = Array.from(
        { length: 11 },
        (_, i) => `a${i}: rooms(take: 20000) { shops { id } }`
      ).join(' ');
      const errors = runRooms(`{ ${many} }`);
      expect(errors.map(e => e.message)).toEqual([
        expect.stringMatching(/exceeds the maximum allowed cost/),
      ]);
    });

    it('keeps the lightweight world-map shape cheap', () => {
      const map = '{ rooms(take: 20000) { id name exits { id direction } } }';
      const variable =
        'query Q($l: Boolean) { rooms(take: 20000, lightweight: $l) { id name exits { id direction } } }';
      expect(runRooms(map)).toEqual([]);
      expect(runRooms(variable)).toEqual([]);
      // the map can be requested a few times without tripping the budget
      const four = Array.from(
        { length: 4 },
        (_, i) => `a${i}: rooms(take: 20000) { id name exits { id direction } }`
      ).join(' ');
      expect(runRooms(`{ ${four} }`)).toEqual([]);
    });

    it('does not trust lightweight via a variable but trusts a literal true', () => {
      const mk = (arg: string) =>
        Array.from(
          { length: 5 },
          (_, i) =>
            `a${i}: rooms(take: 20000, lightweight: ${arg}) { mobs { id } }`
        ).join(' ');
      expect(runRooms(`{ ${mk('false')} }`)).toHaveLength(1);
      expect(runRooms(`{ ${mk('true')} }`)).toEqual([]);
      expect(
        runRooms(`{ ${mk('$l')} }`.replace('{ a0', 'query($l: Boolean) { a0'))
      ).toHaveLength(1);
    });
  });
});
