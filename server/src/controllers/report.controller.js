const reportService = require("../services/report.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class ReportController {
  async getDashboardStats(req, res) {
    try {
      const stats = await reportService.getDashboardStats(req.user);
      return successResponse(res, "Dashboard stats fetched successfully", stats);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getSalesByPayment(req, res) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return errorResponse(res, "startDate and endDate queries are required", 400);
      }

      const report = await reportService.getSalesByPayment(startDate, endDate, req.user);
      return successResponse(res, "Sales by payment report fetched successfully", report);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getCashierPerformance(req, res) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return errorResponse(res, "startDate and endDate queries are required", 400);
      }

      const report = await reportService.getCashierPerformance(startDate, endDate, req.user);
      return successResponse(res, "Cashier performance report fetched successfully", report);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getAuditLogs(req, res) {
    try {
      const logs = await reportService.getAuditLogs();
      return successResponse(res, "Audit logs fetched successfully", logs);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new ReportController();
