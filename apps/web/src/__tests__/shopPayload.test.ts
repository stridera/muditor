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
    expect(payload.keeperId).toBeUndefined();
  });

  it('keeps keeperId when provided', () => {
    const payload = buildShopSavePayload(
      {
        id: 5,
        buyProfit: 1,
        sellProfit: 1,
        temper: 0,
        keeperId: 99,
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
  });
});
