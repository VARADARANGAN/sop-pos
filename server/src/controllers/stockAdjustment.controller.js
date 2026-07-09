const stockAdjustmentService = require("../services/stockAdjustment.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class StockAdjustmentController {
  async createAdjustment(req, res) {
    try {
      const adjustment = await stockAdjustmentService.createAdjustment(req.body, req.user);
      return successResponse(res, "Stock adjustment logged successfully", adjustment, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllAdjustments(req, res) {
    try {
      const adjustments = await stockAdjustmentService.getAllAdjustments(req.user);
      return successResponse(res, "Stock adjustments fetched successfully", adjustments);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAdjustmentById(req, res) {
    try {
      const adjustment = await stockAdjustmentService.getAdjustmentById(req.params.id, req.user);
      return successResponse(res, "Stock adjustment fetched successfully", adjustment);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }
}

module.exports = new StockAdjustmentController();
