import { InventoryRepository } from "../repositories/inventory.repository";
import { DomainError } from "../utils/errors";

export class InventoryService {
  constructor(private inventoryRepository: InventoryRepository) {}

  async reserveInventory(orderId: string): Promise<void> {
    const lines = this.inventoryRepository.findOrderLines(orderId);
    for (const line of lines) {
      const stock = this.inventoryRepository.getStock(line.productId) ?? 0;
      if (stock < line.quantity) {
        throw new DomainError(
          "INSUFFICIENT_STOCK",
          409,
          `Insufficient stock for product ${line.productId}`,
        );
      }
      this.inventoryRepository.adjustStock(line.productId, -line.quantity);
    }
  }

  async releaseInventory(orderId: string): Promise<void> {
    const lines = this.inventoryRepository.findOrderLines(orderId);
    for (const line of lines) {
      this.inventoryRepository.adjustStock(line.productId, line.quantity);
    }
  }
}
