const userService = require("../services/user.service");

const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class UserController {
  /**
   * Create User
   */
  async createUser(req, res) {
    try {
      const user = await userService.createUser(req.body);

      return successResponse(
        res,
        "User created successfully",
        user,
        201
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400
      );
    }
  }

  /**
   * Get All Users
   */
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();

      return successResponse(
        res,
        "Users fetched successfully",
        users
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400
      );
    }
  }

  /**
   * Get User By ID
   */
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);

      return successResponse(
        res,
        "User fetched successfully",
        user
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        404
      );
    }
  }

  /**
   * Update User
   */
  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(
        req.params.id,
        req.body
      );

      return successResponse(
        res,
        "User updated successfully",
        user
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400
      );
    }
  }

  /**
   * Delete User
   */
  async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.id);

      return successResponse(
        res,
        "User deleted successfully"
      );
    } catch (error) {
      return errorResponse(
        res,
        error.message,
        400
      );
    }
  }
}

module.exports = new UserController();