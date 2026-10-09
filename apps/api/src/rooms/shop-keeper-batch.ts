import type { ShopsService } from '../shops/shops.service';

type KeeperShop =
  Awaited<ReturnType<ShopsService['findByKeepers']>> extends Map<
    string,
    infer S
  >
    ? S
    : never;

interface Keeper {
  zoneId: number;
  id: number;
}

/**
 * Per-request batch for `Room.shops`: every keeper requested in the same tick
 * (one per room in a `rooms` list) is resolved with a single query instead of
 * one `findByKeeper` per mob per room.
 */
export class ShopKeeperBatch {
  private pending = new Map<string, Keeper>();
  private flush: Promise<Map<string, KeeperShop>> | undefined;

  constructor(private readonly shops: ShopsService) {}

  async load(keeper: Keeper): Promise<KeeperShop | null> {
    const key = `${keeper.zoneId}-${keeper.id}`;
    this.pending.set(key, keeper);
    this.flush ??= new Promise<Map<string, KeeperShop>>((resolve, reject) => {
      setImmediate(() => {
        const keepers = [...this.pending.values()];
        this.pending = new Map();
        this.flush = undefined;
        this.shops.findByKeepers(keepers).then(resolve, reject);
      });
    });
    return (await this.flush).get(key) ?? null;
  }
}

const perRequest = new WeakMap<object, ShopKeeperBatch>();

/** The batch for this GraphQL request (one per request context object). */
export function shopKeeperBatchFor(
  context: object | undefined,
  shops: ShopsService
): ShopKeeperBatch {
  if (!context) return new ShopKeeperBatch(shops);
  let batch = perRequest.get(context);
  if (!batch) {
    batch = new ShopKeeperBatch(shops);
    perRequest.set(context, batch);
  }
  return batch;
}
