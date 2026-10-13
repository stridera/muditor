import {
  intRange,
  numericIdToken,
  searchTokens,
  sortDirection,
} from './list-filter';

describe('searchTokens', () => {
  it('splits on whitespace and ignores blanks', () => {
    expect(searchTokens('  red   dragon ')).toEqual(['red', 'dragon']);
    expect(searchTokens('   ')).toEqual([]);
    expect(searchTokens(undefined)).toEqual([]);
  });

  it('keeps a quoted value as one phrase', () => {
    expect(searchTokens('"red dragon"')).toEqual(['red dragon']);
    expect(searchTokens('""')).toEqual([]);
  });

  it('caps the term count and length', () => {
    expect(searchTokens('a b c d e f g h')).toHaveLength(6);
    expect(searchTokens('x'.repeat(500))[0]).toHaveLength(100);
  });
});

describe('numericIdToken / sortDirection / intRange', () => {
  it('only treats all-digit terms as ids', () => {
    expect(numericIdToken('45')).toBe(45);
    expect(numericIdToken('45a')).toBeNull();
    expect(numericIdToken('-1')).toBeNull();
  });

  it('defaults to ascending', () => {
    expect(sortDirection('DESC')).toBe('desc');
    expect(sortDirection('sideways')).toBe('asc');
    expect(sortDirection(undefined)).toBe('asc');
  });

  it('builds a range only from supplied bounds', () => {
    expect(intRange(undefined, undefined)).toBeUndefined();
    expect(intRange(5, null)).toEqual({ gte: 5 });
    expect(intRange(1, 10)).toEqual({ gte: 1, lte: 10 });
  });
});
