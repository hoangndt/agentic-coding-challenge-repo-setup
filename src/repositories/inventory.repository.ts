import type { Db } from "../db/database";

export interface Product {
  id: string;
  name: string;
  priceCents: number;
  stock: number;
}

interface ProductRow {
  id: string;
  name: string;
  price_cents: number;
  stock: number;
}

export interface OrderLine {
  productId: string;
  quantity: number;
}

export class InventoryRepository {
  constructor(private db: Db) {}

  findProduct(id: string): Product | undefined {
    const row = this.db.prepare("SELECT * FROM products WHERE id = ?").get(id) as ProductRow | undefined;
    return row && { id: row.id, name: row.name, priceCents: row.price_cents, stock: row.stock };
  }

  getStock(productId: string): number | undefined {
    const row = this.db.prepare("SELECT stock FROM products WHERE id = ?").get(productId) as
      | { stock: number }
      | undefined;
    return row?.stock;
  }

  findOrderLines(orderId: string): OrderLine[] {
    const rows = this.db
      .prepare("SELECT product_id, quantity FROM order_items WHERE order_id = ?")
      .all(orderId) as { product_id: string; quantity: number }[];
    return rows.map((r) => ({ productId: r.product_id, quantity: r.quantity }));
  }

  adjustStock(productId: string, delta: number): void {
    this.db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?").run(delta, productId);
  }
}
