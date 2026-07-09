const mongoose = require("mongoose");

const stockAdjustmentSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch reference is required for scoping"],
    },
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
    type: {
      type: String,
      enum: ["DAMAGE", "WASTAGE", "EXPIRY", "OTHER"],
      required: [true, "Adjustment type is required (DAMAGE, WASTAGE, EXPIRY, OTHER)"],
    },
    quantity: {
      type: Number,
      required: [true, "Adjustment quantity is required"],
      min: [1, "Adjustment quantity must be at least 1"],
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Actor user ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StockAdjustment", stockAdjustmentSchema);
