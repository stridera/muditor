import { buildShopSavePayload } from '../lib/shopPayload';

describe('buildShopSavePayload', () => {
  it('constructs payload with trimmed messages and omits empties', () => {
    const payload = buildShopSavePayload(
      {
        id: 5,
        buyProfit: 1.2,
        sellProfit: 1.5,
        temper: 10,
        keeperId: null,
        zoneId: 42,
      },
      ['WILL_FIGHT', 'NO_STEAL'],
      ['EVIL', 'GOOD'],
      [' Buy ', ''],
      ['Sell message'],
      ['No item 1', '   '],
      ['Dont buy'],
      ['Missing 1', ' Missing 2 ']
    );
    expect(payload.buyMessages).toEqual(['Buy']);
    expect(payload.sellMessages).toEqual(['Sell message']);
    expect(payload.noSuchItemMessages).toEqual(['No item 1']);
    expect(payload.doNotBuyMessages).toEqual(['Dont buy']);
    expect(payload.missingCashMessages).toEqual(['Missing 1', 'Missing 2']);
    expect(payload.flags).toHaveLength(2);
    expect(payload.tradesWithFlags).toHaveLength(2);
    expect(payload.keeperId).toBeNull();
    expect(payload.keeperZoneId).toBeNull();
    expect(payload).not.toHaveProperty('zoneId');
  });

  it('keeps keeperId when provided', () => {
    const payload = buildShopSavePayload(
      {
        id: 5,
        buyProfit: 1,
        sellProfit: 1,
        temper: 0,
        keeperId: 99,
        keeperZoneId: 40,
        zoneId: 1,
      },
      [],
      [],
      [],
      [],
      [],
      [],
      []
    );
    expect(payload.keeperId).toBe(99);
    expect(payload.keeperZoneId).toBe(40);
  });

  it('allows keeper id 0 and never sends 0 for "no keeper"', () => {
    const base = { id: 5, buyProfit: 1, sellProfit: 1, temper: 0, zoneId: 1 };
    const none = buildShopSavePayload(
      { ...base, keeperId: null, keeperZoneId: null },
      [],
      [],
      [],
      [],
      [],
      [],
      []
    );
    expect(none.keeperId).toBeNull();
    const zero = buildShopSavePayload(
      { ...base, keeperId: 0, keeperZoneId: 3 },
      [],
      [],
      [],
      [],
      [],
      [],
      []
    );
    expect(zero.keeperId).toBe(0);
    expect(zero.keeperZoneId).toBe(3);
  });

  it('sends neither half when the keeper zone is unknown', () => {
    const payload = buildShopSavePayload(
      { id: 5, buyProfit: 1, sellProfit: 1, temper: 0, keeperId: 7, zoneId: 1 },
      [],
      [],
      [],
      [],
      [],
      [],
      []
    );
    expect(payload.keeperId).toBeNull();
    expect(payload.keeperZoneId).toBeNull();
  });
});
