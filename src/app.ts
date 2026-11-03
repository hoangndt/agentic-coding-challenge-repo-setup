import express from "express";
import type { Db } from "./db/database";
import { OrdersController } from "./controllers/orders.controller";
import { authMiddleware } from "./middleware/auth.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { InventoryRepository } from "./repositories/inventory.repository";
import { OrderRepository } from "./repositories/order.repository";
import { ordersRoutes } from "./routes/orders.routes";
import { InventoryService } from "./services/inventory.service";
import { OrderService } from "./services/order.service";

export function createApp(db: Db) {
  const orderRepository = new OrderRepository(db);
  const inventoryRepository = new InventoryRepository(db);
  const inventoryService = new InventoryService(inventoryRepository);
  const orderService = new OrderService(db, orderRepository, inventoryRepository, inventoryService);
  const ordersController = new OrdersController(orderService);

  const app = express();
  app.use(express.json());
  app.use("/orders", authMiddleware, ordersRoutes(ordersController));
  app.use(errorMiddleware);
  return app;
}
