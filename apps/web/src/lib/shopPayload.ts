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

export interface ShopKeeperRef {
  keeperId: number | null;
  keeperZoneId: number | null;
}

/**
 * `initialKeeper` is the keeper the shop had when it was loaded (updates only).
 * When the keeper is unchanged the keeper fields are left out of the payload:
 * the API then does not require write access to the keeper's zone, so a builder
 * who can write the shop's zone but not the keeper's can still save the shop.
 * Omit `initialKeeper` (creates) to always send the keeper.
 */
export function buildShopSavePayload(
  formData: BasicShopFormData,
  flags: string[],
  tradesWithFlags: string[],
  buyMessages: string[],
  sellMessages: string[],
  noSuchItemMessages: string[],
  doNotBuyMessages: string[],
  missingCashMessages: string[],
  initialKeeper?: ShopKeeperRef | null
) {
  // Trim empties
  const trim = (arr: string[]) =>
    arr.map(m => m.trim()).filter(m => m.length > 0);
  const hasKeeper = formData.keeperId != null && formData.keeperZoneId != null;
  const keeperId = hasKeeper ? formData.keeperId : null;
  const keeperZoneId = hasKeeper ? formData.keeperZoneId! : null;
  const keeperUnchanged =
    initialKeeper != null &&
    keeperId === initialKeeper.keeperId &&
    keeperZoneId === initialKeeper.keeperZoneId;
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
    // when there is no keeper selected. Unchanged keepers are omitted entirely
    // (see above). zoneId is deliberately not part of the payload: the
    // record's zone is its key and is passed separately.
    ...(keeperUnchanged ? {} : { keeperId, keeperZoneId }),
  };
}

export type ShopSavePayload = ReturnType<typeof buildShopSavePayload>;
