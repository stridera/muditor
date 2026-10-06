import { unixCrypt } from './unix-crypt';

describe('unixCrypt', () => {
  it('resolves to a callable function', () => {
    expect(typeof unixCrypt).toBe('function');
  });

  it('returns a 13-char DES crypt hash that reuses the salt', () => {
    const hash = unixCrypt('x', 'ab');
    expect(hash).toHaveLength(13);
    expect(hash.startsWith('ab')).toBe(true);
    expect(unixCrypt('x', hash)).toBe(hash);
  });
});
