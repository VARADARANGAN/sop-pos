const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema(
  {
    branchCode: {
      type: String,
      required: [true, "Branch code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    branchName: {
      type: String,
      required: [true, "Branch name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Branch email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+$/, "Please enter a valid email"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    city: {
      type: String,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
    },

    managerName: {
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

const Branch = mongoose.model("Branch", branchSchema);

module.exports = Branch;