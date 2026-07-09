const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch is required"],
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cashier reference is required"],
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        name: {
          type: String,
          required: [true, "Item name is required"],
        },
        variantName: {
          type: String,
          default: null,
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
          min: [0, "Price cannot be negative"],
        },
        costPrice: {
          type: Number,
          required: [true, "Cost price is required"],
          min: [0, "Cost price cannot be negative"],
        },
        subtotal: {
          type: Number,
          required: true,
        },
        tax: {
          type: Number,
          default: 0,
        },
        discount: {
          type: Number,
          default: 0,
        },
        total: {
          type: Number,
          required: true,
        },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    grandTotal: {
      type: Number,
      required: true,
      min: [0, "Grand total cannot be negative"],
    },
    status: {
      type: String,
      enum: ["HELD", "COMPLETED", "VOIDED"],
      default: "COMPLETED",
    },
    holdReference: {
      type: String,
      default: null,
    },
    payments: [
      {
        method: {
          type: String,
          enum: ["CASH", "CARD", "UPI"],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: [0, "Payment amount cannot be negative"],
        },
        transactionId: {
          type: String,
          default: null,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ branchId: 1, createdAt: -1 });
orderSchema.index({ customerId: 1 });

module.exports = mongoose.model("Order", orderSchema);
