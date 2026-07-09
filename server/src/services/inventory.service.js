const inventoryRepository = require("../repositories/inventory.repository");
const branchRepository = require("../repositories/branch.repository");
const productRepository = require("../repositories/product.repository");

class InventoryService {
  async createInventory(data, user) {
    if (user && user.role !== "SUPER_ADMIN") {
      data.branchId = user.branchId;
    }

    const branch = await branchRepository.findById(data.branchId);

    if (!branch) {
      throw new Error("Branch not found");
    }

    const product = await productRepository.findById(data.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    // Check if product has variants and data.variantId matches one of them
    if (product.variants && product.variants.length > 0) {
      if (!data.variantId) {
        throw new Error("Product has variants. Please specify a variant ID.");
      }
      const variant = product.variants.id(data.variantId);
      if (!variant) {
        throw new Error("Specified variant does not exist on this product");
      }
    } else {
      data.variantId = null;
    }

    const inventoryExists =
      await inventoryRepository.findByProduct(
        data.productId,
        data.branchId,
        data.variantId
      );

    if (inventoryExists) {
      throw new Error("Inventory already exists for this product/variant at this branch");
    }

    data.availableStock =
      data.currentStock - data.reservedStock;
    data.createdBy = user ? user.id : null;

    return await inventoryRepository.create(data);
  }

  async getAllInventory(user) {
    if (user && user.role !== "SUPER_ADMIN") {
      return await inventoryRepository.findByBranch(user.branchId);
    }
    return await inventoryRepository.findAll();
  }

  async getInventoryById(id, user) {
    const inventory =
      await inventoryRepository.findById(id);

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    if (user && user.role !== "SUPER_ADMIN" && inventory.branchId.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Inventory belongs to another branch");
    }

    return inventory;
  }

  async updateInventory(id, updateData, user) {
    const inventory =
      await inventoryRepository.findById(id);

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    if (user && user.role !== "SUPER_ADMIN" && inventory.branchId.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Inventory belongs to another branch");
    }

    if (
      updateData.currentStock !== undefined ||
      updateData.reservedStock !== undefined
    ) {
      const currentStock =
        updateData.currentStock ??
        inventory.currentStock;

      const reservedStock =
        updateData.reservedStock ??
        inventory.reservedStock;

      updateData.availableStock =
        currentStock - reservedStock;

      updateData.lastStockUpdated = new Date();
    }
    updateData.updatedBy = user ? user.id : null;

    return await inventoryRepository.update(
      id,
      updateData
    );
  }

  async deleteInventory(id, user) {
    const inventory =
      await inventoryRepository.findById(id);

    if (!inventory) {
      throw new Error("Inventory not found");
    }

    if (user && user.role !== "SUPER_ADMIN" && inventory.branchId.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Inventory belongs to another branch");
    }

    return await inventoryRepository.softDelete(id);
  }
}

module.exports = new InventoryService();