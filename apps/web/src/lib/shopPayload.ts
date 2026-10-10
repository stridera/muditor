// Build GraphQL mutation payload for creating/updating a shop.
// Separated for unit testing.
import type { ShopFlag, ShopTradesWith } from '@/generated/graphql';

export interface BasicShopFormData {
  id: number;
  buyProfit: number;
  sellProfit: number;
  temper: number;
  keeperId: number | null;
  keeperZoneId?: number | null;
  zoneId: number;
}

export function buildShopSavePayload(
  formData: BasicShopFormData,
  flags: string[],
  tradesWithFlags: string[],
  buyMessages: string[],
  sellMessages: string[],
  noSuchItemMessages: string[],
  doNotBuyMessages: string[],
  missingCashMessages: string[]
) {
  // Trim empties
  const trim = (arr: string[]) =>
    arr.map(m => m.trim()).filter(m => m.length > 0);
  const hasKeeper = formData.keeperId != null && formData.keeperZoneId != null;
  return {
    buyProfit: formData.buyProfit,
    sellProfit: formData.sellProfit,
    temper: formData.temper,
    flags: flags as unknown as ShopFlag[],
    tradesWithFlags: tradesWithFlags as unknown as ShopTradesWith[],
    buyMessages: trim(buyMessages),
    sellMessages: trim(sellMessages),
    noSuchItemMessages: trim(noSuchItemMessages),
    doNotBuyMessages: trim(doNotBuyMessages),
    missingCashMessages: trim(missingCashMessages),
    // A keeper is a (zone, id) pair: send both or neither, and null (never 0)
    // when there is no keeper selected. zoneId is deliberately not part of the
    // payload: the record's zone is its key and is passed separately.
    keeperId: hasKeeper ? formData.keeperId : null,
    keeperZoneId: hasKeeper ? formData.keeperZoneId : null,
  };
}

export type ShopSavePayload = ReturnType<typeof buildShopSavePayload>;
