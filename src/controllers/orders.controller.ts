import type { NextFunction, Request, Response } from "express";
import { CreateOrderItem, OrderService } from "../services/order.service";
import { DomainError } from "../utils/errors";

function parseItems(body: unknown): CreateOrderItem[] {
  const items = (body as { items?: unknown } | undefined)?.items;
  if (!Array.isArray(items) || items.length === 0) {
    throw new DomainError("VALIDATION_ERROR", 400, "items must be a non-empty array");
  }
  return items.map((item) => {
    const { productId, quantity } = (item ?? {}) as { productId?: unknown; quantity?: unknown };
    if (typeof productId !== "string" || productId === "") {
      throw new DomainError("VALIDATION_ERROR", 400, "productId must be a non-empty string");
    }
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainError("VALIDATION_ERROR", 400, "quantity must be a positive integer");
    }
    return { productId, quantity };
  });
}

export class OrdersController {
  constructor(private orderService: OrderService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = parseItems(req.body);
      const order = await this.orderService.createOrder(req.user!.id, items);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.orderService.getOrder(req.user!.id, req.params.id);
      res.json(order);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json(await this.orderService.listOrders(req.user!.id));
    } catch (err) {
      next(err);
    }
  };
}
