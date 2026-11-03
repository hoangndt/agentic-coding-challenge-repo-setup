import Database from "better-sqlite3";
import type { Database as Db } from "better-sqlite3";
import { applySchema } from "./schema";

export type { Db };

export function openDatabase(path: string): Db {
  const db = new Database(path);
  db.pragma("foreign_keys = ON");
  applySchema(db);
  return db;
}

// Service methods are async but better-sqlite3's db.transaction() cannot span awaits.
// All awaited work here is synchronous under the hood, so manual BEGIN/COMMIT on the
// single connection is safe.
export async function withTransaction<T>(db: Db, fn: () => Promise<T>): Promise<T> {
  db.exec("BEGIN");
  try {
    const result = await fn();
    db.exec("COMMIT");
    return result;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
