import { Router } from "express";
import { OrdersController } from "../controllers/orders.controller";

export function ordersRoutes(controller: OrdersController): Router {
  const router = Router();
  router.post("/", controller.create);
  router.get("/", controller.list);
  router.get("/:id", controller.getById);
  return router;
}
