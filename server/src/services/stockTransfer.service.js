const mongoose = require("mongoose");
const stockTransferRepository = require("../repositories/stockTransfer.repository");
const Inventory = require("../models/Inventory");
const Ingredient = require("../models/Ingredient");
const Product = require("../models/Product");
const { logAction } = require("../utils/auditLogger");

class StockTransferService {
  /**
   * Request a Stock Transfer
   */
  async requestTransfer(transferData, user) {
    // Validate that user is Super Admin or Admin of the fromBranch
    if (user.role !== "SUPER_ADMIN" && user.branchId.toString() !== transferData.fromBranchId.toString()) {
      throw new Error("Access denied: You can only request transfers from your own branch");
    }

    transferData.status = "REQUESTED";
    transferData.requestedBy = user.id;

    // Validate that items exist and check basic availability (non-blocking, just warning check)
    for (const item of transferData.items) {
      if (item.itemType === "PRODUCT") {
        const product = await Product.findOne({ _id: item.itemId, isDeleted: false });
        if (!product) {
          throw new Error(`Product not found: ${item.itemId}`);
        }
      } else if (item.itemType === "INGREDIENT") {
        const ingredient = await Ingredient.findOne({ _id: item.itemId, isDeleted: false });
        if (!ingredient) {
          throw new Error(`Ingredient not found: ${item.itemId}`);
        }
      }
    }

    const transfer = await stockTransferRepository.create(transferData);

    await logAction({
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`,
      action: "STOCK_TRANSFER_REQUEST",
      entity: "StockTransfer",
      entityId: transfer._id,
      metadata: { fromBranchId: transfer.fromBranchId, toBranchId: transfer.toBranchId },
    });

    return transfer;
  }

  /**
   * Get All Transfers Scoped by User Branch
   */
  async getAllTransfers(user) {
    if (user.role !== "SUPER_ADMIN") {
      return await stockTransferRepository.findByBranch(user.branchId);
    }
    return await stockTransferRepository.findAll();
  }

  /**
   * Get Transfer by ID
   */
  async getTransferById(id, user) {
    const transfer = await stockTransferRepository.findById(id);
    if (!transfer) {
      throw new Error("Stock transfer request not found");
    }

    // Access check: User must be Super Admin or belong to source or destination branch
    if (
      user.role !== "SUPER_ADMIN" &&
      transfer.fromBranchId._id.toString() !== user.branchId.toString() &&
      transfer.toBranchId._id.toString() !== user.branchId.toString()
    ) {
      throw new Error("Access denied: You are not authorized to view this transfer");
    }

    return transfer;
  }

  /**
   * Approve and Execute Stock Transfer (Atomic Transaction)
   */
  async approveTransfer(id, user) {
    const transfer = await stockTransferRepository.findById(id);
    if (!transfer) {
      throw new Error("Stock transfer request not found");
    }

    if (transfer.status !== "REQUESTED") {
      throw new Error(`Transfer cannot be approved. Current status is ${transfer.status}`);
    }

    // Access check: User must be Super Admin or an Admin of the source or destination branch
    const isSourceAdmin = transfer.fromBranchId._id.toString() === user.branchId.toString();
    const isDestAdmin = transfer.toBranchId._id.toString() === user.branchId.toString();
    if (user.role !== "SUPER_ADMIN" && !isSourceAdmin && !isDestAdmin) {
      throw new Error("Access denied: Only Super Admin or Admins of the involved branches can approve transfers");
    }

    // Start database transaction session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      for (const item of transfer.items) {
        if (item.itemType === "PRODUCT") {
          // 1. Check & Decrement Source Stock
          const sourceInv = await Inventory.findOne({
            branchId: transfer.fromBranchId._id,
            productId: item.itemId,
            variantId: item.variantId || null,
            isDeleted: false,
          }).session(session);

          if (!sourceInv || sourceInv.currentStock < item.quantity) {
            throw new Error(`Insufficient stock for product in source branch. Available: ${sourceInv ? sourceInv.currentStock : 0}`);
          }

          sourceInv.currentStock -= item.quantity;
          sourceInv.availableStock = sourceInv.currentStock - sourceInv.reservedStock;
          sourceInv.lastStockUpdated = new Date();
          await sourceInv.save({ session });

          // 2. Increment Destination Stock
          let destInv = await Inventory.findOne({
            branchId: transfer.toBranchId._id,
            productId: item.itemId,
            variantId: item.variantId || null,
            isDeleted: false,
          }).session(session);

          if (!destInv) {
            // Create default destination inventory entry
            destInv = new Inventory({
              branchId: transfer.toBranchId._id,
              productId: item.itemId,
              variantId: item.variantId || null,
              currentStock: 0,
              availableStock: 0,
              reservedStock: 0,
              minimumStock: 10,
              maximumStock: 1000,
              reorderLevel: 20,
              lastStockUpdated: new Date(),
            });
          }

          destInv.currentStock += item.quantity;
          destInv.availableStock = destInv.currentStock - destInv.reservedStock;
          destInv.lastStockUpdated = new Date();
          await destInv.save({ session });

        } else if (item.itemType === "INGREDIENT") {
          // 1. Check & Decrement Source Ingredient quantity
          const sourceIng = await Ingredient.findOne({
            _id: item.itemId,
            branchId: transfer.fromBranchId._id,
            isDeleted: false,
          }).session(session);

          if (!sourceIng || sourceIng.quantity < item.quantity) {
            throw new Error(`Insufficient quantity for ingredient ${sourceIng ? sourceIng.name : ""} at source branch.`);
          }

          sourceIng.quantity -= item.quantity;
          await sourceIng.save({ session });

          // 2. Increment Destination Ingredient quantity
          let destIng = await Ingredient.findOne({
            name: sourceIng.name,
            branchId: transfer.toBranchId._id,
            isDeleted: false,
          }).session(session);

          if (!destIng) {
            // Create matching ingredient at destination branch
            destIng = new Ingredient({
              name: sourceIng.name,
              quantity: 0,
              unit: sourceIng.unit,
              reorderLevel: sourceIng.reorderLevel,
              branchId: transfer.toBranchId._id,
            });
          }

          destIng.quantity += item.quantity;
          await destIng.save({ session });
        }
      }

      // Update transfer status
      transfer.status = "COMPLETED"; // or APPROVED. We mark completed since stocks have moved.
      transfer.approvedBy = user.id;
      await transfer.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      await logAction({
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        action: "STOCK_TRANSFER_APPROVE",
        entity: "StockTransfer",
        entityId: transfer._id,
        metadata: { status: "COMPLETED", approvedBy: user.id },
      });

      return transfer;

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Reject a Stock Transfer request
   */
  async rejectTransfer(id, user) {
    const transfer = await stockTransferRepository.findById(id);
    if (!transfer) {
      throw new Error("Stock transfer request not found");
    }

    if (transfer.status !== "REQUESTED") {
      throw new Error(`Transfer cannot be rejected. Current status is ${transfer.status}`);
    }

    // Access check: User must be Super Admin or an Admin of the source or destination branch
    const isSourceAdmin = transfer.fromBranchId._id.toString() === user.branchId.toString();
    const isDestAdmin = transfer.toBranchId._id.toString() === user.branchId.toString();
    if (user.role !== "SUPER_ADMIN" && !isSourceAdmin && !isDestAdmin) {
      throw new Error("Access denied: You are not authorized to reject this transfer");
    }

    transfer.status = "REJECTED";
    transfer.approvedBy = user.id;
    await transfer.save();

    await logAction({
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`,
      action: "STOCK_TRANSFER_REJECT",
      entity: "StockTransfer",
      entityId: transfer._id,
    });

    return transfer;
  }
}

module.exports = new StockTransferService();
