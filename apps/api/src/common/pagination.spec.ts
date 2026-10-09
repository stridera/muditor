import {
  MAX_BULK_PAGE_SIZE,
  MAX_PAGE_SIZE,
  clampSkip,
  clampTake,
} from './pagination';

describe('pagination caps', () => {
  it('defaults a missing take to the cap and clamps huge or negative values', () => {
    expect(clampTake(undefined)).toBe(MAX_PAGE_SIZE);
    expect(clampTake(null)).toBe(MAX_PAGE_SIZE);
    expect(clampTake(5)).toBe(5);
    expect(clampTake(120000)).toBe(MAX_PAGE_SIZE);
    expect(clampTake(120000, MAX_BULK_PAGE_SIZE)).toBe(MAX_BULK_PAGE_SIZE);
    expect(clampTake(-3)).toBe(0);
    expect(clampTake(Number.NaN)).toBe(MAX_PAGE_SIZE);
  });

  it('clamps skip to a non-negative integer', () => {
    expect(clampSkip(undefined)).toBe(0);
    expect(clampSkip(-10)).toBe(0);
    expect(clampSkip(7.9)).toBe(7);
  });
});
