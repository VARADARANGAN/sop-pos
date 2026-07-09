const branchRepository = require("../repositories/branch.repository");

class BranchService {
  /**
   * Create Branch
   */
  async createBranch(branchData) {
    // Check duplicate Branch Code
    const existingBranchCode = await branchRepository.findByCode(
      branchData.branchCode
    );

    if (existingBranchCode) {
      throw new Error("Branch code already exists");
    }

    // Check duplicate Email
    const existingEmail = await branchRepository.findByEmail(
      branchData.email
    );

    if (existingEmail) {
      throw new Error("Branch email already exists");
    }

    // Create Branch
    return await branchRepository.create(branchData);
  }

  /**
   * Get All Branches
   */
  async getAllBranches() {
    return await branchRepository.findAll();
  }

  /**
   * Get Branch By ID
   */
  async getBranchById(branchId) {
    const branch = await branchRepository.findById(branchId);

    if (!branch) {
      throw new Error("Branch not found");
    }

    return branch;
  }

  /**
   * Update Branch
   */
  async updateBranch(branchId, updateData) {
    const branch = await branchRepository.findById(branchId);

    if (!branch) {
      throw new Error("Branch not found");
    }

    return await branchRepository.update(branchId, updateData);
  }

  /**
   * Delete Branch (Soft Delete)
   */
  async deleteBranch(branchId) {
    const branch = await branchRepository.findById(branchId);

    if (!branch) {
      throw new Error("Branch not found");
    }

    return await branchRepository.softDelete(branchId);
  }
}

module.exports = new BranchService();