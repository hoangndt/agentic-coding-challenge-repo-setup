import Database from "better-sqlite3";
import type { Express } from "express";
import { createApp } from "../src/app";
import type { Db } from "../src/db/database";
import { applySchema } from "../src/db/schema";
import { seedProducts } from "../src/db/seed";
import { Order, OrderStatus } from "../src/models/order";
import { OrderRepository } from "../src/repositories/order.repository";

export function buildTestApp(): { app: Express; db: Db } {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  applySchema(db);
  seedProducts(db);
  return { app: createApp(db), db };
}

interface InsertOrderOptions {
  userId?: string;
  status?: OrderStatus;
  items?: { productId: string; quantity: number; unitPriceCents?: number }[];
}

// Writes an order straight through the repository, in any status and for any user.
// It does not touch stock.
export function insertOrder(db: Db, options: InsertOrderOptions = {}): Order {
  const items = (options.items ?? [{ productId: "prod-1", quantity: 1 }]).map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    unitPriceCents: i.unitPriceCents ?? 2500,
  }));
  return new OrderRepository(db).create({
    userId: options.userId ?? "user-123",
    status: options.status,
    items,
  });
}

export function getStock(db: Db, productId: string): number {
  const row = db.prepare("SELECT stock FROM products WHERE id = ?").get(productId) as { stock: number };
  return row.stock;
}
