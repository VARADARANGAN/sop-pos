const authService = require("../services/auth.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class AuthController {
  /**
   * Login User
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Set JWT in HTTP-only cookie if required
      res.cookie("token", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      return successResponse(
        res,
        "Login successful",
        result,
        200
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        error.statusCode || 401
      );
    }
  }

  /**
   * Logout User
   */
  async logout(req, res) {
    try {
      res.clearCookie("token");
      return successResponse(res, "Logout successful", null, 200);
    } catch (error) {
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Forgot Password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return errorResponse(res, "Email is required", 400);
      }

      const token = await authService.forgotPassword(email);

      // Include token in response metadata under dev/test for easy inspection
      const data = process.env.NODE_ENV !== "production" ? { token } : null;

      return successResponse(
        res,
        "If an account with that email exists, a password reset link has been sent.",
        data,
        200
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        error.statusCode || 400
      );
    }
  }

  /**
   * Reset Password
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return errorResponse(res, "Token and new password are required", 400);
      }

      await authService.resetPassword(token, newPassword);

      return successResponse(
        res,
        "Password has been reset successfully.",
        null,
        200
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        error.statusCode || 400
      );
    }
  }

  /**
   * Change Password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return errorResponse(res, "Current and new password are required", 400);
      }

      await authService.changePassword(req.user.id, currentPassword, newPassword);

      return successResponse(
        res,
        "Password changed successfully.",
        null,
        200
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        error.statusCode || 400
      );
    }
  }

  /**
   * Manual Unlock User (Super Admin only)
   */
  async unlockUser(req, res) {
    try {
      const userId = req.params.id;
      await authService.unlockUser(userId, req.user);

      return successResponse(
        res,
        "User unlocked successfully.",
        null,
        200
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        error.statusCode || 400
      );
    }
  }

  /**
   * Get Current Session Profile
   */
  async getMe(req, res) {
    try {
      return successResponse(res, "Session profile retrieved", req.user, 200);
    } catch (error) {
      return errorResponse(res, error.message, 401);
    }
  }
}

module.exports = new AuthController();