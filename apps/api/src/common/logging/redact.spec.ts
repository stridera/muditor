import {
  describeInternalError,
  redactValueEchoes,
  stackFramesOnly,
} from './redact';

describe('redactValueEchoes', () => {
  it('removes the echoed variable value but keeps field names and types', () => {
    const msg =
      'Variable "$i" got invalid value { email: "a@b.c", password: "hunter2-secret" }; Field "identifier" of required type "String!" was not provided.';
    const out = redactValueEchoes(msg);
    expect(out).not.toContain('hunter2-secret');
    expect(out).not.toContain('a@b.c');
    expect(out).toContain('Variable "$i" got invalid value [REDACTED]');
    expect(out).toContain('Field "identifier" of required type "String!"');
  });

  it('drops values even when a field is not defined by the type', () => {
    const out = redactValueEchoes(
      'Variable "$i" got invalid value { password: "p; Field \\"x\\" y" }; Field "email" is not defined by type "LoginInput".'
    );
    expect(out).not.toContain('p; Field');
    expect(out).toContain('Field "email" is not defined by type "LoginInput".');
  });

  it.each([
    ['String cannot represent a non string value: 12345', '12345'],
    ['Int cannot represent non-integer value: "tok-abc"', 'tok-abc'],
    [
      'Expected value of type "Int!", found "tok-abc"; Int cannot represent',
      'tok-abc',
    ],
    ['Value "s3cret" does not exist in "Climate" enum.', 's3cret'],
    ['Syntax Error: Unexpected Name "s3cret".', 's3cret'],
  ])('masks literal echoes: %s', (message, secret) => {
    expect(redactValueEchoes(message)).not.toContain(secret);
  });

  it('leaves messages that carry only schema names untouched', () => {
    const msg = 'Cannot query field "foo" on type "Query".';
    expect(redactValueEchoes(msg)).toBe(msg);
  });
});

describe('describeInternalError', () => {
  it('keeps only the Prisma code, target and last reason line', () => {
    const err = Object.assign(
      new Error(
        'Invalid `prisma.users.create()` invocation:\n{ data: { passwordHash: "abc123" } }\nUnique constraint failed on the fields: (`email`)'
      ),
      {
        name: 'PrismaClientKnownRequestError',
        code: 'P2002',
        meta: { target: ['email'] },
      }
    );
    const out = describeInternalError(err, err.message);
    expect(out).not.toContain('abc123');
    expect(out).toContain('prisma=P2002');
    expect(out).toContain('Unique constraint failed');
  });

  it('keeps only the first line of other messages', () => {
    expect(describeInternalError(new Error('x'), 'first\nsecond')).toBe(
      'first'
    );
  });
});

describe('stackFramesOnly', () => {
  it('drops the message line, keeping the error name and frames', () => {
    const out = stackFramesOnly(
      'TypeError: password=hunter2 failed\n    at foo (a.ts:1:1)\n    at bar (b.ts:2:2)'
    );
    expect(out).not.toContain('hunter2');
    expect(out).toBe('TypeError\n    at foo (a.ts:1:1)\n    at bar (b.ts:2:2)');
  });
});
