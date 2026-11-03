import type { Database } from "better-sqlite3";

export function applySchema(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      stock INTEGER NOT NULL CHECK (stock >= 0)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL,
      total_cents INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL REFERENCES orders(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      unit_price_cents INTEGER NOT NULL
    );
  `);
}
