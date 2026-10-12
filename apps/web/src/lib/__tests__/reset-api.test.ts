import { describeResetError, nestContents } from '../reset-api';

describe('nestContents', () => {
  const row = (id: number, parent: number | null) => ({
    id: String(id),
    parentContentId: parent,
  });

  it('orders rows parent-first with a depth', () => {
    const out = nestContents([
      row(3, 2),
      row(1, null),
      row(2, 1),
      row(4, null),
    ]);
    expect(out.map(o => [o.item.id, o.depth])).toEqual([
      ['1', 0],
      ['2', 1],
      ['3', 2],
      ['4', 0],
    ]);
  });

  it('treats a missing parent as top level and handles an empty list', () => {
    expect(nestContents([])).toEqual([]);
    expect(nestContents([{ id: '1' }]).map(o => o.depth)).toEqual([0]);
  });
});

describe('describeResetError', () => {
  it('turns a Forbidden into a write-access sentence naming the zone', () => {
    expect(describeResetError(new Error('Forbidden resource'), 990)).toBe(
      'You do not have write access to zone 990.'
    );
    expect(describeResetError(new Error('Forbidden resource'))).toBe(
      'You do not have write access to this zone.'
    );
  });

  it('passes other messages through', () => {
    expect(
      describeResetError(new Error('Parent content 3 does not belong'))
    ).toBe('Parent content 3 does not belong');
    expect(describeResetError('plain string')).toBe('plain string');
  });
});
