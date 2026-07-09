const mongoose = require("mongoose");
const stockAdjustmentRepository = require("../repositories/stockAdjustment.repository");
const Inventory = require("../models/Inventory");
const Ingredient = require("../models/Ingredient");
const Product = require("../models/Product");
const { logAction } = require("../utils/auditLogger");

class StockAdjustmentService {
  /**
   * Record a Stock Adjustment
   */
  async createAdjustment(data, user) {
    if (user && user.role !== "SUPER_ADMIN") {
      data.branchId = user.branchId;
    }

    data.actorId = user.id;

    // Start a transaction session for atomicity
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      if (data.itemType === "PRODUCT") {
        const product = await Product.findOne({ _id: data.itemId, isDeleted: false }).session(session);
        if (!product) {
          throw new Error("Product not found");
        }

        const inventory = await Inventory.findOne({
          branchId: data.branchId,
          productId: data.itemId,
          variantId: data.variantId || null,
          isDeleted: false,
        }).session(session);

        if (!inventory) {
          throw new Error("Inventory record not found at this branch for the specified product/variant");
        }

        if (inventory.currentStock < data.quantity) {
          throw new Error(`Insufficient stock to perform write-off. Available: ${inventory.currentStock}`);
        }

        // Decrement stock
        inventory.currentStock -= data.quantity;
        inventory.availableStock = inventory.currentStock - inventory.reservedStock;
        inventory.lastStockUpdated = new Date();
        await inventory.save({ session });

      } else if (data.itemType === "INGREDIENT") {
        const ingredient = await Ingredient.findOne({
          _id: data.itemId,
          branchId: data.branchId,
          isDeleted: false,
        }).session(session);

        if (!ingredient) {
          throw new Error("Ingredient record not found at this branch");
        }

        if (ingredient.quantity < data.quantity) {
          throw new Error(`Insufficient ingredient quantity to perform write-off. Available: ${ingredient.quantity}`);
        }

        // Decrement quantity
        ingredient.quantity -= data.quantity;
        await ingredient.save({ session });
      }

      // Save adjustment record
      const adjustment = await stockAdjustmentRepository.create([data], { session });
      const adjustmentRecord = adjustment[0];

      // Commit session
      await session.commitTransaction();
      session.endSession();

      // Audit Log
      await logAction({
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        action: "STOCK_ADJUSTMENT",
        entity: "StockAdjustment",
        entityId: adjustmentRecord._id,
        metadata: { itemType: data.itemType, type: data.type, quantity: data.quantity },
      });

      return adjustmentRecord;

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Get All Adjustments Scoped by User Branch
   */
  async getAllAdjustments(user) {
    if (user.role !== "SUPER_ADMIN") {
      return await stockAdjustmentRepository.findByBranch(user.branchId);
    }
    return await stockAdjustmentRepository.findAll();
  }

  /**
   * Get Adjustment by ID
   */
  async getAdjustmentById(id, user) {
    const adjustment = await stockAdjustmentRepository.findById(id);
    if (!adjustment) {
      throw new Error("Stock adjustment record not found");
    }

    if (user.role !== "SUPER_ADMIN" && adjustment.branchId._id.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Adjustment record belongs to another branch");
    }

    return adjustment;
  }
}

module.exports = new StockAdjustmentService();
