import { beforeEach, describe, expect, it } from "vitest";
import type { Db } from "../src/db/database";
import { InventoryRepository } from "../src/repositories/inventory.repository";
import { InventoryService } from "../src/services/inventory.service";
import { DomainError } from "../src/utils/errors";
import { buildTestApp, getStock, insertOrder } from "./helpers";

describe("InventoryService", () => {
  let db: Db;
  let service: InventoryService;

  beforeEach(() => {
    ({ db } = buildTestApp());
    service = new InventoryService(new InventoryRepository(db));
  });

  it("reserveInventory decrements stock for each order item", async () => {
    const before = getStock(db, "prod-2");
    const order = insertOrder(db, { items: [{ productId: "prod-2", quantity: 3 }] });

    await service.reserveInventory(order.id);

    expect(getStock(db, "prod-2")).toBe(before - 3);
  });

  it("reserveInventory throws when stock is insufficient", async () => {
    const order = insertOrder(db, { items: [{ productId: "prod-2", quantity: 10_000 }] });

    await expect(service.reserveInventory(order.id)).rejects.toMatchObject({
      code: "INSUFFICIENT_STOCK",
      statusCode: 409,
    });
    await expect(service.reserveInventory(order.id)).rejects.toBeInstanceOf(DomainError);
  });

  it("releaseInventory restores stock for each order item", async () => {
    const before = getStock(db, "prod-3");
    const order = insertOrder(db, { items: [{ productId: "prod-3", quantity: 4 }] });
    await service.reserveInventory(order.id);

    await service.releaseInventory(order.id);

    expect(getStock(db, "prod-3")).toBe(before);
  });
});
