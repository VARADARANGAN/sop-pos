const Branch = require("../models/Branch");

class BranchRepository {
  /**
   * Create Branch
   */
  async create(branchData) {
    return await Branch.create(branchData);
  }

  /**
   * Get All Active Branches
   */
  async findAll() {
    return await Branch.find({
      isDeleted: false,
    });
  }

  /**
   * Find Branch By ID
   */
  async findById(branchId) {
    return await Branch.findOne({
      _id: branchId,
      isDeleted: false,
    });
  }

  /**
   * Find Branch By Code
   */
  async findByCode(branchCode) {
    return await Branch.findOne({
      branchCode,
      isDeleted: false,
    });
  }

  /**
   * Find Branch By Email
   */
  async findByEmail(email) {
    return await Branch.findOne({
      email,
      isDeleted: false,
    });
  }

  /**
   * Update Branch
   */
  async update(branchId, updateData) {
    return await Branch.findByIdAndUpdate(
      branchId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
  }

  /**
   * Soft Delete Branch
   */
  async softDelete(branchId) {
    return await Branch.findByIdAndUpdate(
      branchId,
      {
        isDeleted: true,
        isActive: false,
      },
      {
        new: true,
      }
    );
  }
}

module.exports = new BranchRepository();