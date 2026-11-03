import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import type { Express } from "express";
import type { Db } from "../src/db/database";
import { OrderStatus } from "../src/models/order";
import { buildTestApp, getStock, insertOrder } from "./helpers";

describe("orders API", () => {
  let app: Express;
  let db: Db;

  beforeEach(() => {
    ({ app, db } = buildTestApp());
  });

  describe("POST /orders", () => {
    it("creates a pending order and reserves stock", async () => {
      const before = getStock(db, "prod-1");

      const res = await request(app)
        .post("/orders")
        .send({ items: [{ productId: "prod-1", quantity: 2 }] });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe(OrderStatus.PENDING);
      expect(res.body.userId).toBe("user-123");
      expect(res.body.items).toEqual([{ productId: "prod-1", quantity: 2, unitPriceCents: 2500 }]);
      expect(res.body.totalCents).toBe(5000);
      expect(getStock(db, "prod-1")).toBe(before - 2);
    });

    it("rejects an empty items array", async () => {
      const res = await request(app).post("/orders").send({ items: [] });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
      expect(typeof res.body.error.message).toBe("string");
    });

    it("rejects a non-positive quantity", async () => {
      const res = await request(app)
        .post("/orders")
        .send({ items: [{ productId: "prod-1", quantity: 0 }] });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects an unknown product", async () => {
      const res = await request(app)
        .post("/orders")
        .send({ items: [{ productId: "nope", quantity: 1 }] });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("PRODUCT_NOT_FOUND");
    });

    it("rejects an order exceeding stock and leaves no trace", async () => {
      const before = getStock(db, "prod-1");

      const res = await request(app)
        .post("/orders")
        .send({ items: [{ productId: "prod-1", quantity: before + 1 }] });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("INSUFFICIENT_STOCK");
      expect(getStock(db, "prod-1")).toBe(before);
      expect(db.prepare("SELECT COUNT(*) AS n FROM orders").get()).toEqual({ n: 0 });
    });
  });

  describe("GET /orders/:id", () => {
    it("returns the caller's own order", async () => {
      const order = insertOrder(db);

      const res = await request(app).get(`/orders/${order.id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(order.id);
    });

    it("returns 404 for an unknown order", async () => {
      const res = await request(app).get("/orders/does-not-exist");

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("ORDER_NOT_FOUND");
    });

    it("returns 403 for another user's order", async () => {
      const order = insertOrder(db, { userId: "user-999" });

      const res = await request(app).get(`/orders/${order.id}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });
  });

  describe("GET /orders", () => {
    it("lists only the caller's orders", async () => {
      const mine = insertOrder(db);
      insertOrder(db, { userId: "user-999" });

      const res = await request(app).get("/orders");

      expect(res.status).toBe(200);
      expect(res.body.map((o: { id: string }) => o.id)).toEqual([mine.id]);
    });
  });
});
