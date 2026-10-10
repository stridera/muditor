import { ShopsService } from './shops.service';

describe('ShopsService.replaceInventory', () => {
  function setup(existing: unknown[] = []) {
    const tx = {
      shopItems: {
        findMany: jest.fn().mockResolvedValue(existing),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    const database = {
      $transaction: jest.fn(async (fn: (t: typeof tx) => Promise<void>) =>
        fn(tx)
      ),
      shopItems: { deleteMany: jest.fn(), createMany: jest.fn() },
      shops: {
        findFirst: jest.fn().mockResolvedValue({ id: 1 }),
        findUnique: jest.fn().mockResolvedValue({ id: 1 }),
      },
    };
    const service = new ShopsService(database as never);
    return { service, tx, database };
  }

  it('deletes and recreates inside one transaction, deduping items', async () => {
    const { service, tx, database } = setup();
    await service.replaceInventory(30, 1, [
      { amount: 1, objectZoneId: 30, objectId: 5 },
      { amount: 2, objectZoneId: 30, objectId: 6 },
      { amount: 9, objectZoneId: 30, objectId: 5 },
    ]);
    expect(database.$transaction).toHaveBeenCalledTimes(1);
    expect(database.shopItems.deleteMany).not.toHaveBeenCalled();
    expect(tx.shopItems.deleteMany).toHaveBeenCalledWith({
      where: { shopZoneId: 30, shopId: 1 },
    });
    const data = tx.shopItems.createMany.mock.calls[0][0].data;
    expect(data).toHaveLength(2);
    expect(
      data.find((d: { objectId: number }) => d.objectId === 5).amount
    ).toBe(9);
  });

  it('keeps per-item price and spawn settings for retained objects', async () => {
    const { service, tx } = setup([
      {
        objectZoneId: 30,
        objectId: 5,
        price: 250,
        spawnChance: 0.5,
        visibilityRequirement: 'a',
        purchaseRequirement: 'b',
      },
    ]);
    await service.replaceInventory(30, 1, [
      { amount: 3, objectZoneId: 30, objectId: 5 },
    ]);
    expect(tx.shopItems.createMany.mock.calls[0][0].data[0]).toMatchObject({
      amount: 3,
      price: 250,
      spawnChance: 0.5,
      visibilityRequirement: 'a',
      purchaseRequirement: 'b',
    });
  });

  it('propagates a failed create so the transaction rolls back', async () => {
    const { service, tx } = setup();
    tx.shopItems.createMany.mockRejectedValue(new Error('fk'));
    await expect(
      service.replaceInventory(30, 1, [
        { amount: 1, objectZoneId: 99, objectId: 1 },
      ])
    ).rejects.toThrow('fk');
  });
});
