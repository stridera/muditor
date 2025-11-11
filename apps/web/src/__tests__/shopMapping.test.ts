import {
  mapShopHours,
  mapShopItems,
  type ShopQueryResult,
} from '../lib/shopMapping';

describe('shopMapping helpers', () => {
  test('mapShopItems omits undefined optional keys', () => {
    const raw: ShopQueryResult = {
      id: 1,
      items: [
        { amount: 5, objectId: 10, objectZoneId: 20 }, // no id, no object
        {
          id: 'abc',
          amount: 2,
          objectId: 11,
          objectZoneId: 21,
          object: { id: 99, name: 'Sword' },
        },
        { id: 'def', objectId: 12, objectZoneId: 22 }, // missing amount
      ],
    };
    const mapped = mapShopItems(raw);
    expect(mapped).toHaveLength(3);
    const [first, second, third] = mapped as [
      (typeof mapped)[0],
      (typeof mapped)[0],
      (typeof mapped)[0],
    ];
    // First item: ensure no id/object keys present
    expect(Object.prototype.hasOwnProperty.call(first, 'id')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(first, 'object')).toBe(false);
    expect(first.amount).toBe(5);
    // Second item includes id and object fully
    expect(second.id).toBe('abc');
    expect(second.object?.id).toBe(99);
    // Third item missing amount defaults to 0 and contains id only
    expect(third.id).toBe('def');
    expect(third.amount).toBe(0);
  });

  test('mapShopHours provides default when hours missing', () => {
    const raw: ShopQueryResult = { id: 2 };
    const mapped = mapShopHours(raw);
    expect(mapped).toHaveLength(1);
    const [only] = mapped as [(typeof mapped)[0]];
    expect(only.openHour).toBe(6);
    expect(only.closeHour).toBe(20);
  });

  test('mapShopHours omits undefined id', () => {
    const raw: ShopQueryResult = {
      id: 3,
      hours: [
        { open: 8, close: 18 },
        { id: 'xyz', open: 0, close: 23 },
      ],
    };
    const mapped = mapShopHours(raw);
    const [first, second] = mapped as [(typeof mapped)[0], (typeof mapped)[0]];
    expect(Object.prototype.hasOwnProperty.call(first, 'id')).toBe(false);
    expect(second.id).toBe('xyz');
  });
});
