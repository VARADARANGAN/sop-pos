const userRepository = require("../repositories/user.repository");
const branchRepository = require("../repositories/branch.repository");

const ROLES = require("../constants/roles");
const USER_STATUS = require("../constants/status");

class UserService {
  /**
   * Generate Employee Code
   * Format: EMP0001, EMP0002...
   */
  async generateEmployeeCode() {
    const users = await userRepository.findAll();

    const nextNumber = users.length + 1;

    return `EMP${String(nextNumber).padStart(4, "0")}`;
  }

  /**
   * Create User
   */
  async createUser(userData) {
    // Check duplicate email
    const existingUser = await userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new Error("Email already exists");
    }

    // Branch validation
    if (userData.role !== ROLES.SUPER_ADMIN) {
      if (!userData.branchId) {
        throw new Error("Branch is required");
      }

      const branch = await branchRepository.findById(userData.branchId);

      if (!branch) {
        throw new Error("Branch not found");
      }
    }

    // Auto-generate employee code
    userData.employeeCode = await this.generateEmployeeCode();

    // Default user status
    userData.status = USER_STATUS.ACTIVE;

    return await userRepository.create(userData);
  }

  /**
   * Get All Users
   */
  async getAllUsers() {
    return await userRepository.findAll();
  }

  /**
   * Get User By ID
   */
  async getUserById(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Update User
   */
  async updateUser(userId, updateData) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return await userRepository.update(userId, updateData);
  }

  /**
   * Delete User
   */
  async deleteUser(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    return await userRepository.softDelete(userId);
  }
}

module.exports = new UserService();