

export class InventoryService {

  async issueSparePart(data: {
    businessId: string;
    productId: string;
    quantity: number;
    reason: string;
  }) {

    console.log(
      "Inventory issue queued:",
      data
    );

    // TODO
    // Deduct stock when Inventory module
    // is fully integrated.

    return data;
  }

  async receiveStock() {}

  async adjustStock() {}

}

export const inventoryService =
  new InventoryService();