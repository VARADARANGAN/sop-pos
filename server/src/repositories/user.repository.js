const User = require("../models/User");
const USER_STATUS = require("../constants/status");

class UserRepository {
  /**
   * Create a new user
   */
  async create(userData) {
    return await User.create(userData);
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
  return await User.findOne({
    email,
    isDeleted: false,
  }).select("+password");
}

  /**
   * Find user by ID
   */
  async findById(id) {
  return await User.findOne({
    _id: id,
    isDeleted: false,
  });
}

  /**
 * Get all active users
 */
async findAll() {
  return await User.find({
    isDeleted: false,
  }).select("-password");
}

/**
 * Find user by employee code
 */
async findByEmployeeCode(employeeCode) {
  return await User.findOne({
    employeeCode,
    isDeleted: false,
  });
}

  /**
   * Update user
   */
  async update(id, updateData) {
    return await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }

  /**
   * Soft delete user
   */
  async softDelete(id) {
    return await User.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
        status: USER_STATUS.INACTIVE,
      },
      {
        new: true,
      }
    );
  }
}

module.exports = new UserRepository();