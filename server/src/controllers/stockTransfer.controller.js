const stockTransferService = require("../services/stockTransfer.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class StockTransferController {
  async requestTransfer(req, res) {
    try {
      const transfer = await stockTransferService.requestTransfer(req.body, req.user);
      return successResponse(res, "Stock transfer requested successfully", transfer, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAllTransfers(req, res) {
    try {
      const transfers = await stockTransferService.getAllTransfers(req.user);
      return successResponse(res, "Stock transfers fetched successfully", transfers);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getTransferById(req, res) {
    try {
      const transfer = await stockTransferService.getTransferById(req.params.id, req.user);
      return successResponse(res, "Stock transfer fetched successfully", transfer);
    } catch (error) {
      return errorResponse(res, error.message, 404);
    }
  }

  async approveTransfer(req, res) {
    try {
      const transfer = await stockTransferService.approveTransfer(req.params.id, req.user);
      return successResponse(res, "Stock transfer approved and executed successfully", transfer);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async rejectTransfer(req, res) {
    try {
      const transfer = await stockTransferService.rejectTransfer(req.params.id, req.user);
      return successResponse(res, "Stock transfer rejected successfully", transfer);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new StockTransferController();
