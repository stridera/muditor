import { safeRedirectPath } from '@/contexts/auth-context';

describe('safeRedirectPath', () => {
  it('keeps in-app paths and queries', () => {
    expect(safeRedirectPath('/dashboard')).toBe('/dashboard');
    expect(safeRedirectPath('/zones/30?tab=rooms')).toBe('/zones/30?tab=rooms');
    expect(safeRedirectPath('/a/../b')).toBe('/b');
  });

  it.each([
    ['//evil.com'],
    ['/.//evil.com'],
    ['/%2e//evil.com'],
    ['/%2E//evil.com'],
    ['/./\\evil.com'],
    ['/\\evil.com'],
    ['\\\\evil.com'],
    ['/\\/evil.com'],
    ['///evil.com'],
    ['https://evil.com'],
    ['http://evil.com/x'],
    ['javascript:alert(1)'],
    ['/\tevil.com'],
    ['/\n/evil.com'],
    ['/a\u0000b'],
    ['/a\u007fb'],
    [''],
    [null],
  ])('rejects %j', input => {
    expect(safeRedirectPath(input)).toBeNull();
  });
});
