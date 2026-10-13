import { directionForHandle, exitFromConnection } from '../exit-connection';

describe('exit-connection', () => {
  it.each([
    ['right', 'EAST'],
    ['right-target', 'EAST'],
    ['left-target', 'WEST'],
    ['top', 'NORTH'],
    ['bottom-target', 'SOUTH'],
    ['up', 'UP'],
    ['down-target', 'DOWN'],
  ])('reads handle %s as %s', (handle, direction) => {
    expect(directionForHandle(handle)).toBe(direction);
  });

  it('ignores unknown or missing handles', () => {
    expect(directionForHandle('nonsense')).toBeUndefined();
    expect(directionForHandle(null)).toBeUndefined();
  });

  it('builds an exit when the drag started on the stacked target handle', () => {
    expect(
      exitFromConnection({
        source: '1',
        target: '2',
        sourceHandle: 'right-target',
      })
    ).toEqual({ fromId: 1, toId: 2, direction: 'EAST' });
  });

  it('returns null for incomplete connections', () => {
    expect(
      exitFromConnection({ source: '1', target: null, sourceHandle: 'right' })
    ).toBeNull();
    expect(
      exitFromConnection({ source: '1', target: '2', sourceHandle: null })
    ).toBeNull();
  });
});
