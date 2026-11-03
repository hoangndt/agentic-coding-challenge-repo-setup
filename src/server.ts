import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { createApp } from "./app";
import { openDatabase } from "./db/database";
import { seedProducts } from "./db/seed";

const port = Number(process.env.PORT ?? 3000);
const dbPath = process.env.DB_PATH ?? "./data/app.db";

mkdirSync(dirname(dbPath), { recursive: true });
const db = openDatabase(dbPath);
seedProducts(db);

createApp(db).listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
