// Pure mapping helpers for shop editor
// Ensures optional properties are omitted rather than assigned undefined (exactOptionalPropertyTypes compliance)

export interface ShopObjectSummary {
  id: number;
  name: string;
  type?: string;
  cost?: number | null;
  zoneId?: number;
}

export interface ShopItem {
  id?: string;
  amount: number;
  objectId: number;
  objectZoneId: number;
  object?: ShopObjectSummary;
}

export interface ShopHour {
  id?: string;
  openHour: number;
  closeHour: number;
}

export interface ShopKeeperSummary {
  id: number;
  name?: string;
  zoneId?: number;
}
export interface ShopAcceptSummary {
  id: number;
  type?: string;
  keywords?: string;
}
export interface ShopHourSummary {
  id?: string;
  open?: number;
  close?: number;
}
export interface ShopQueryResult {
  id: number;
  buyProfit?: number;
  sellProfit?: number;
  temper?: number;
  keeperId?: number | null;
  zoneId?: number;
  flags?: string[];
  tradesWithFlags?: string[];
  keeper?: ShopKeeperSummary | null;
  items?: Array<{
    id?: string;
    amount?: number;
    objectId?: number;
    objectZoneId?: number;
    object?: ShopObjectSummary | null;
  }>;
  accepts?: Array<
    ShopAcceptSummary | { id: string; type?: string; keywords?: string | null }
  >;
  hours?: ShopHourSummary[];
}

export function mapShopItems(raw: ShopQueryResult): ShopItem[] {
  if (!Array.isArray(raw.items)) return [];
  return raw.items.map(i => {
    const base: ShopItem = {
      amount: typeof i.amount === 'number' ? i.amount : 0,
      objectId: typeof i.objectId === 'number' ? i.objectId : 0,
      objectZoneId: typeof i.objectZoneId === 'number' ? i.objectZoneId : 0,
    };
    if (typeof i.id === 'string') base.id = i.id;
    const obj = i.object;
    if (obj && typeof obj.id === 'number') {
      const built: ShopObjectSummary = { id: obj.id, name: obj.name ?? '' };
      if (typeof obj.type === 'string') built.type = obj.type;
      if (typeof obj.cost === 'number') built.cost = obj.cost;
      if (typeof obj.zoneId === 'number') built.zoneId = obj.zoneId;
      base.object = built;
    }
    return base;
  });
}

export function mapShopHours(raw: ShopQueryResult): ShopHour[] {
  if (!Array.isArray(raw.hours)) return [{ openHour: 6, closeHour: 20 }];
  return raw.hours.map(h => {
    const base: ShopHour = {
      openHour: typeof h.open === 'number' ? h.open : 6,
      closeHour: typeof h.close === 'number' ? h.close : 20,
    };
    if (typeof h.id === 'string') base.id = h.id;
    return base;
  });
}

// Utility to assert absence of undefined-valued optional keys (for tests)
export function hasNoUndefinedOptionals<T extends object>(obj: T): boolean {
  return Object.entries(obj).every(([, v]) => v !== undefined);
}
