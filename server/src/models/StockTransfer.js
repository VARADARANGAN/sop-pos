const mongoose = require("mongoose");

const stockTransferSchema = new mongoose.Schema(
  {
    fromBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Source branch is required"],
    },
    toBranchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Destination branch is required"],
    },
    items: [
      {
        itemType: {
          type: String,
          enum: ["PRODUCT", "INGREDIENT"],
          required: [true, "Item type is required (PRODUCT or INGREDIENT)"],
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          required: [true, "Item reference ID is required"],
        },
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
    status: {
      type: String,
      enum: ["REQUESTED", "APPROVED", "COMPLETED", "REJECTED"],
      default: "REQUESTED",
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requested user ID is required"],
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StockTransfer", stockTransferSchema);
