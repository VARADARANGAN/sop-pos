const billingService = require("../services/billing.service");
const {
  successResponse,
  errorResponse,
} = require("../utils/response");

class BillingController {
  async checkoutOrder(req, res) {
    try {
      const order = await billingService.checkoutOrder(req.body, req.user);
      return successResponse(res, "Order checked out successfully", order, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async holdOrder(req, res) {
    try {
      const order = await billingService.holdOrder(req.body, req.user);
      return successResponse(res, "Order parked successfully", order, 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async getHeldOrders(req, res) {
    try {
      const orders = await billingService.getHeldOrders(req.user);
      return successResponse(res, "Parked orders fetched successfully", orders);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async checkoutHeldOrder(req, res) {
    try {
      const order = await billingService.checkoutHeldOrder(req.params.id, req.body, req.user);
      return successResponse(res, "Parked order checked out successfully", order);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async splitHeldOrder(req, res) {
    try {
      const { bills } = req.body;
      if (!bills || !Array.isArray(bills)) {
        return errorResponse(res, "bills array is required for splitting", 400);
      }

      const orders = await billingService.splitHeldOrder(req.params.id, bills, req.user);
      return successResponse(res, "Parked order split and checked out successfully", orders);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }

  async voidOrder(req, res) {
    try {
      const order = await billingService.voidOrder(req.params.id, req.user);
      return successResponse(res, "Order voided successfully", order);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
}

module.exports = new BillingController();
