import type { Db } from "../db/database";
import { withTransaction } from "../db/database";
import { Order } from "../models/order";
import { InventoryRepository } from "../repositories/inventory.repository";
import { OrderRepository } from "../repositories/order.repository";
import { DomainError } from "../utils/errors";
import { InventoryService } from "./inventory.service";

export interface CreateOrderItem {
  productId: string;
  quantity: number;
}

export class OrderService {
  constructor(
    private db: Db,
    private orderRepository: OrderRepository,
    private inventoryRepository: InventoryRepository,
    private inventoryService: InventoryService,
  ) {}

  async createOrder(userId: string, items: CreateOrderItem[]): Promise<Order> {
    const pricedItems = items.map((item) => {
      const product = this.inventoryRepository.findProduct(item.productId);
      if (!product) {
        throw new DomainError("PRODUCT_NOT_FOUND", 404, `Product ${item.productId} not found`);
      }
      return { productId: item.productId, quantity: item.quantity, unitPriceCents: product.priceCents };
    });

    return withTransaction(this.db, async () => {
      const order = this.orderRepository.create({ userId, items: pricedItems });
      await this.inventoryService.reserveInventory(order.id);
      return order;
    });
  }

  async getOrder(userId: string, orderId: string): Promise<Order> {
    const order = this.orderRepository.findById(orderId);
    if (!order) {
      throw new DomainError("ORDER_NOT_FOUND", 404, `Order ${orderId} not found`);
    }
    if (order.userId !== userId) {
      throw new DomainError("FORBIDDEN", 403, "You do not have access to this order");
    }
    return order;
  }

  async listOrders(userId: string): Promise<Order[]> {
    return this.orderRepository.findByUserId(userId);
  }
}
