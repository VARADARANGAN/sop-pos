const Inventory = require("../models/Inventory");

class InventoryRepository {
  async create(data) {
    return await Inventory.create(data);
  }

  async findAll() {
    return await Inventory.find({
      isDeleted: false,
    })
      .populate("branchId", "branchName")
      .populate("productId", "productName productCode variants");
  }

  async findByBranch(branchId) {
    return await Inventory.find({
      branchId,
      isDeleted: false,
    })
      .populate("branchId", "branchName")
      .populate("productId", "productName productCode variants");
  }

  async findById(id) {
    return await Inventory.findOne({
      _id: id,
      isDeleted: false,
    });
  }

  async findByProduct(productId, branchId, variantId = null) {
    return await Inventory.findOne({
      productId,
      branchId,
      variantId: variantId || null,
      isDeleted: false,
    });
  }

  async update(id, updateData) {
    return await Inventory.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async softDelete(id) {
    return await Inventory.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      {
        new: true,
      }
    );
  }
}

module.exports = new InventoryRepository();