import type { Database } from "better-sqlite3";

const PRODUCTS = [
  { id: "prod-1", name: "Wireless Mouse", priceCents: 2500, stock: 100 },
  { id: "prod-2", name: "Mechanical Keyboard", priceCents: 8900, stock: 50 },
  { id: "prod-3", name: "USB-C Hub", priceCents: 4500, stock: 75 },
];

export function seedProducts(db: Database): void {
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM products").get() as { count: number };
  if (count > 0) return;

  const insert = db.prepare(
    "INSERT INTO products (id, name, price_cents, stock) VALUES (@id, @name, @priceCents, @stock)",
  );
  for (const product of PRODUCTS) insert.run(product);
}
