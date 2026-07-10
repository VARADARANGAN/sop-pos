const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryCode: {
      type: String,
      required: [true, "Category code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      default: null,
      trim: true,
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
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;