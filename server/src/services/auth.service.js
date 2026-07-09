const userRepository = require("../repositories/user.repository");
const User = require("../models/User");
const { generateAccessToken } = require("../utils/jwt");
const USER_STATUS = require("../constants/status");
const AppError = require("../utils/AppError");
const crypto = require("crypto");
const { logAction } = require("../utils/auditLogger");

class AuthService {
  /**
   * Login User
   */
  async login(email, password) {
    // Find user
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check if account status is active or blocked (except temporarily locked which is checked below)
    if (user.status === USER_STATUS.INACTIVE || user.status === USER_STATUS.SUSPENDED) {
      throw new AppError("Account is not active", 403);
    }

    // Check account lockout
    if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.accountLockedUntil - new Date()) / 60000);
      throw new AppError(`Account is temporarily locked. Try again in ${minutesLeft} minutes.`, 423);
    }

    // Reset lockout if it has expired
    if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = null;
      await user.save();
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
        await user.save();
        
        await logAction({
          actorId: user._id,
          actorName: `${user.firstName} ${user.lastName}`,
          action: "ACCOUNT_LOCKOUT",
          entity: "User",
          entityId: user._id,
          metadata: { reason: "5 consecutive failed login attempts" },
        });

        throw new AppError("Account locked due to 5 consecutive failed login attempts.", 423);
      }
      await user.save();
      throw new AppError("Invalid email or password", 401);
    }

    // Successful login
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const accessToken = generateAccessToken(user);

    return {
      accessToken,
      user: {
        id: user._id,
        employeeCode: user.employeeCode,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        branchId: user.branchId,
        hasIngredientsAccess: user.hasIngredientsAccess,
      },
    };
  }

  /**
   * Forgot Password Reset Token Generation
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email, isDeleted: false });

    // Prevent user enumeration: always return success message in controller
    if (!user) {
      return null;
    }

    // Generate single-use reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // Hash token to store in DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save();

    // Stub notification logging
    console.log(`\n📧 [DEMO NOTIFIER] Password reset link for ${email}:`);
    console.log(`http://localhost:5173/reset-password?token=${resetToken}\n`);

    return resetToken;
  }

  /**
   * Reset Password with Token
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
      isDeleted: false,
    });

    if (!user) {
      throw new AppError("Token is invalid or has expired", 400);
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.passwordChangedAt = new Date();
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    await user.save();

    await logAction({
      actorId: user._id,
      actorName: `${user.firstName} ${user.lastName}`,
      action: "PASSWORD_RESET",
      entity: "User",
      entityId: user._id,
    });

    return true;
  }

  /**
   * Change Password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findOne({ _id: userId, isDeleted: false }).select("+password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError("Incorrect current password", 400);
    }

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    await logAction({
      actorId: user._id,
      actorName: `${user.firstName} ${user.lastName}`,
      action: "PASSWORD_CHANGE",
      entity: "User",
      entityId: user._id,
    });

    return true;
  }

  /**
   * Unlock user manually (Super Admin only)
   */
  async unlockUser(userId, adminUser) {
    const user = await User.findOne({ _id: userId, isDeleted: false });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    await user.save();

    await logAction({
      actorId: adminUser.id,
      actorName: `${adminUser.firstName} ${adminUser.lastName}`,
      action: "ACCOUNT_UNLOCK",
      entity: "User",
      entityId: user._id,
      metadata: { unlockedUserEmail: user.email },
    });

    return true;
  }
}

module.exports = new AuthService();