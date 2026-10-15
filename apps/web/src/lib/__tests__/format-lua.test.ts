import { formatLua } from '../format-lua';

describe('formatLua', () => {
  it('indents blocks, else branches and nested tables', () => {
    const src = [
      'if a then',
      'x()',
      'elseif b then',
      'y({',
      'k = 1,',
      '})',
      'else',
      'for i = 1, 3 do',
      'z()',
      'end',
      'end',
    ].join('\n');
    expect(formatLua(src)).toBe(
      [
        'if a then',
        '    x()',
        'elseif b then',
        '    y({',
        '        k = 1,',
        '    })',
        'else',
        '    for i = 1, 3 do',
        '        z()',
        '    end',
        'end',
        '',
      ].join('\n')
    );
  });

  it('handles repeat/until, functions and one-line blocks', () => {
    expect(
      formatLua('local function f()\nrepeat\nif a then b() end\nuntil c\nend')
    ).toBe(
      'local function f()\n    repeat\n        if a then b() end\n    until c\nend\n'
    );
  });

  it('ignores keywords in strings and comments', () => {
    const src = 'say("end of if")\n-- function end\nx = \'do\'\n';
    expect(formatLua(src)).toBe(src);
  });

  it('leaves multi-line strings and comments untouched', () => {
    const src = 'local s = [[\n  if\n    keep   \n]]\n--[==[\nend\n]==]\nf()\n';
    expect(formatLua(src)).toBe(src);
  });

  it('trims trailing whitespace, collapses blank lines, normalises endings', () => {
    expect(formatLua('a()  \r\n\r\n\r\n\r\nb()\r\n\r\n')).toBe('a()\n\nb()\n');
  });

  it('is idempotent and returns empty for blank input', () => {
    const once = formatLua('function f()\nreturn 1\nend');
    expect(formatLua(once)).toBe(once);
    expect(formatLua('  \n\n')).toBe('');
  });
});
