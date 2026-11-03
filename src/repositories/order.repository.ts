import { randomUUID } from "node:crypto";
import type { Db } from "../db/database";
import { Order, OrderItem, OrderStatus } from "../models/order";

interface OrderRow {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
  updated_at: string;
}

interface OrderItemRow {
  product_id: string;
  quantity: number;
  unit_price_cents: number;
}

export interface NewOrder {
  userId: string;
  status?: OrderStatus;
  items: OrderItem[];
}

export class OrderRepository {
  constructor(private db: Db) {}

  create(data: NewOrder): Order {
    const id = randomUUID();
    const now = new Date().toISOString();
    const totalCents = data.items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);

    this.db
      .prepare(
        `INSERT INTO orders (id, user_id, status, total_cents, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(id, data.userId, data.status ?? OrderStatus.PENDING, totalCents, now, now);

    const insertItem = this.db.prepare(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents)
       VALUES (?, ?, ?, ?)`,
    );
    for (const item of data.items) {
      insertItem.run(id, item.productId, item.quantity, item.unitPriceCents);
    }

    return this.findById(id)!;
  }

  findById(id: string): Order | undefined {
    const row = this.db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as OrderRow | undefined;
    return row ? this.toOrder(row) : undefined;
  }

  findByUserId(userId: string): Order[] {
    const rows = this.db
      .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC, rowid DESC")
      .all(userId) as OrderRow[];
    return rows.map((row) => this.toOrder(row));
  }

  private toOrder(row: OrderRow): Order {
    const items = this.db
      .prepare("SELECT product_id, quantity, unit_price_cents FROM order_items WHERE order_id = ? ORDER BY id")
      .all(row.id) as OrderItemRow[];

    return {
      id: row.id,
      userId: row.user_id,
      status: row.status,
      totalCents: row.total_cents,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      items: items.map((i) => ({
        productId: i.product_id,
        quantity: i.quantity,
        unitPriceCents: i.unit_price_cents,
      })),
    };
  }
}
