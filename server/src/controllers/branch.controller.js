const branchService = require("../services/branch.service");

const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class BranchController {
  /**
   * Create Branch
   */
  async createBranch(req, res) {
    try {
      const branch = await branchService.createBranch(req.body);

      return successResponse(
        res,
        "Branch created successfully",
        branch,
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
   * Get All Branches
   */
  async getAllBranches(req, res) {
    try {
      const branches = await branchService.getAllBranches();

      return successResponse(
        res,
        "Branches fetched successfully",
        branches
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
   * Get Branch By ID
   */
  async getBranchById(req, res) {
    try {
      const branch = await branchService.getBranchById(req.params.id);

      return successResponse(
        res,
        "Branch fetched successfully",
        branch
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
   * Update Branch
   */
  async updateBranch(req, res) {
    try {
      const branch = await branchService.updateBranch(
        req.params.id,
        req.body
      );

      return successResponse(
        res,
        "Branch updated successfully",
        branch
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
   * Delete Branch
   */
  async deleteBranch(req, res) {
    try {
      await branchService.deleteBranch(req.params.id);

      return successResponse(
        res,
        "Branch deleted successfully"
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

module.exports = new BranchController();