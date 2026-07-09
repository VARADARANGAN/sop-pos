const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: null,
      trim: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    barcode: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },

    sku: {
      type: String,
      default: null,
      unique: true,
      sparse: true,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    gst: {
      type: Number,
      default: 0,
    },

    unit: {
      type: String,
      enum: [
        "PCS",
        "KG",
        "GRAM",
        "LITRE",
        "ML",
        "BOX",
        "PACK"
      ],
      default: "PCS",
    },

    isCombo: {
      type: Boolean,
      default: false,
    },

    comboItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],

    variants: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        costPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        barcode: {
          type: String,
          default: null,
        },
        sku: {
          type: String,
          default: null,
        },
      },
    ],

    image: {
      type: String,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);