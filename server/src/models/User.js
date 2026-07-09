const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ROLES = require("../constants/roles");
const USER_STATUS = require("../constants/status");

const userSchema = new mongoose.Schema(
  {
    // ==========================================================
    // Identity Information
    // ==========================================================

    employeeCode: {
      type: String,
      required: [true, "Employee code is required"],
      unique: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    // ==========================================================
    // Authentication Information
    // ==========================================================

    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: function (value) {
          // If the password is not modified (i.e. it is already a bcrypt hash), skip validation
          if (this && typeof this.isModified === "function" && !this.isModified("password")) {
            return true;
          }
          if (!value || value.length < 8 || value.length > 12) {
            return false;
          }
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{8,12}$/.test(
            value
          );
        },
        message:
          "Password must be 8-12 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      },
      select: false,
    },

    refreshTokenHash: {
      type: String,
      default: null,
    },

    // ==========================================================
    // Authorization Information
    // ==========================================================

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CASHIER,
      required: true,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },

    status: {
      type: String,
     enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },

    hasIngredientsAccess: {
      type: Boolean,
      default: false,
    },

    // ==========================================================
    // Contact Information
    // ==========================================================

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    profileImage: {
      type: String,
      default: null,
    },

    // ==========================================================
    // Security Information
    // ==========================================================

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    accountLockedUntil: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    // ==========================================================
    // Audit Information
    // ==========================================================

    lastLogin: {
      type: Date,
      default: null,
    },

    lastLoginIP: {
      type: String,
      default: null,
    },

    lastLoginDevice: {
      type: String,
      default: null,
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

    // ==========================================================
    // System Information
    // ==========================================================

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash password before saving
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare entered password with hashed password
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;