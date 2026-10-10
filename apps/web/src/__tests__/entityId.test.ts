import { parseEntityId } from '@/lib/entityId';
import { parseKeywords } from '@/lib/keywords';

describe('parseEntityId', () => {
  it('accepts non-negative integers, including 0', () => {
    expect(parseEntityId('0')).toBe(0);
    expect(parseEntityId(' 42 ')).toBe(42);
    expect(parseEntityId(7)).toBe(7);
  });

  it('rejects empty, negative, fractional and non-numeric input', () => {
    for (const bad of ['', '  ', '-1', '1.5', 'abc', '12x', 1.5, -3]) {
      expect(parseEntityId(bad)).toBeNull();
    }
  });
});

describe('parseKeywords (shared by mob and object editors)', () => {
  it('splits on commas and whitespace and drops empties/duplicates', () => {
    expect(parseKeywords('a goblin, scout  goblin')).toEqual([
      'a',
      'goblin',
      'scout',
    ]);
    expect(parseKeywords('sword,iron long')).toEqual(['sword', 'iron', 'long']);
  });
});
